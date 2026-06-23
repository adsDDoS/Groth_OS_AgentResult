import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { config } from "../../config.js";
import { query } from "../../db/client.js";
import { createApprovalRequest } from "../approvals/service.js";
import { insertJson } from "../common/repository.js";

type Row = Record<string, unknown>;

const idParams = z.object({ id: z.string().uuid() });
const dispatchBody = z.object({
  note: z.string().optional(),
  dryRun: z.boolean().optional()
});
const hermesChatCompletionSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      content: z.unknown()
    }).passthrough()
  }).passthrough()).default([])
}).passthrough();
const hermesArtifactSchema = z.object({
  type: z.string(),
  targetType: z.string().optional(),
  targetId: z.string().uuid().optional(),
  payload: z.record(z.unknown()).default({})
});
const hermesProposedActionSchema = z.object({
  type: z.enum(["approval_request", "task", "handoff", "result_note"]),
  scope: z.string().optional(),
  targetType: z.string().optional(),
  targetId: z.string().uuid().optional(),
  summary: z.string().optional(),
  payload: z.record(z.unknown()).default({})
});
const hermesResultSchema = z.object({
  runId: z.string().uuid().optional(),
  status: z.enum(["completed", "failed", "blocked"]),
  artifacts: z.array(hermesArtifactSchema).default([]),
  proposedActions: z.array(hermesProposedActionSchema).default([]),
  riskFlags: z.array(z.string()).default([]),
  error: z.string().optional(),
  summary: z.string().optional()
});

function asRecord(value: unknown): Row {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Row) : {};
}

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function taskStatusFromHermes(status: z.infer<typeof hermesResultSchema>["status"]) {
  if (status === "completed") return "completed";
  if (status === "blocked") return "blocked";
  return "failed";
}

async function loadTaskContext(task: Row, tenantId: string) {
  const [companyResult, contentResult] = await Promise.all([
    query("select * from companies where tenant_id = $1 order by created_at asc limit 1", [tenantId]),
    task.target_type === "content_item" && typeof task.target_id === "string"
      ? query("select * from content_items where id = $1 and tenant_id = $2", [task.target_id, tenantId])
      : Promise.resolve({ rows: [] })
  ]);
  const company = companyResult.rows[0] ?? null;
  const profile = asRecord(company?.profile);
  const target = contentResult.rows[0] ?? null;

  return {
    company: company
      ? {
        id: company.id,
        name: company.name,
        websiteUrl: company.website_url,
        positioning: company.positioning ?? profile.positioning ?? null,
        icp: profile.icp ?? null,
        pains: profile.pains ?? null,
        proof: profile.proof ?? null,
        forbiddenClaims: profile.forbiddenClaims ?? null,
        approvalOwner: profile.approvalOwner ?? null,
        tone: company.tone_of_voice ?? profile.tone ?? null
      }
      : null,
    target: target
      ? {
        id: target.id,
        title: target.title,
        status: target.status,
        contentType: target.content_type,
        channel: target.channel,
        body: target.body_md ?? null,
        metadata: target.metadata ?? {}
      }
      : null
  };
}

async function buildHermesTaskEnvelope(task: Row, tenantId: string) {
  const context = await loadTaskContext(task, tenantId);

  return {
    taskId: task.id,
    tenantId,
    role: textValue(task.agent_role, "agent"),
    taskType: textValue(task.task_type, "task"),
    targetType: task.target_type ?? null,
    targetId: task.target_id ?? null,
    context,
    constraints: {
      approvalFirst: true,
      noExternalSend: true,
      noLivePublish: true,
      noOwnerDecision: true,
      writeBackThroughBackendOnly: true
    },
    expectedOutput: {
      kind: "structured_hermes_result",
      schemaVersion: 1,
      strictJsonOnly: true,
      allowedProposedActions: ["approval_request", "task", "handoff", "result_note"]
    },
    sourcePayload: asRecord(task.payload)
  };
}

async function recordTaskEvent(input: { tenantId: string; taskId: unknown; eventType: string; payload: Row }) {
  await query(
    `insert into task_events (id, tenant_id, task_id, event_type, payload)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [randomUUID(), input.tenantId, input.taskId, input.eventType, input.payload]
  );
}

async function createHermesRun(input: { tenantId: string; taskId: unknown; envelope: Row; note?: string }) {
  const result = await query(
    `insert into task_runs (id, tenant_id, task_id, provider, model, status, input, output)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning *`,
    [
      randomUUID(),
      input.tenantId,
      input.taskId,
      "hermes",
      config.hermesBaseUrl,
      "dispatch_prepared",
      {
        envelope: input.envelope,
        note: input.note ?? null
      },
      {}
    ]
  );
  return result.rows[0] ?? null;
}

async function updateHermesRun(input: { runId: string; tenantId: string; status: string; output: Row; error?: string }) {
  const result = await query(
    `update task_runs
     set "status" = $2, "output" = $3, "error" = $4, finished_at = now()
     where id = $1 and tenant_id = $5
     returning *`,
    [input.runId, input.status, input.output, input.error ?? null, input.tenantId]
  );
  return result.rows[0] ?? null;
}

async function markHermesRunRunning(input: { runId: string; tenantId: string; output?: Row }) {
  const result = await query(
    `update task_runs
     set "status" = $2, "output" = $3
     where id = $1 and tenant_id = $4
     returning *`,
    [input.runId, "running", input.output ?? {}, input.tenantId]
  );
  return result.rows[0] ?? null;
}

async function updateTaskResult(input: { taskId: string; tenantId: string; status: string; result: Row }) {
  const updated = await query(
    `update tasks
     set "status" = $2, "result" = $3, updated_at = now()
     where id = $1 and tenant_id = $4
     returning *`,
    [input.taskId, input.status, input.result, input.tenantId]
  );
  return updated.rows[0] ?? null;
}

function artifactPayload(artifact: z.infer<typeof hermesArtifactSchema>) {
  return asRecord(artifact.payload);
}

function contentTypeForChannel(channel: string) {
  if (channel === "email") return "email";
  if (channel === "site") return "landing_page";
  if (channel === "vc" || channel === "habr") return "article";
  return "telegram_post";
}

function draftBodyFromArtifact(artifact: z.infer<typeof hermesArtifactSchema>) {
  const payload = artifactPayload(artifact);
  return textValue(payload.bodyMd, textValue(payload.body_md, textValue(payload.body, textValue(payload.text, ""))));
}

function draftTitleFromArtifact(artifact: z.infer<typeof hermesArtifactSchema>, task: Row) {
  const payload = artifactPayload(artifact);
  const taskPayload = asRecord(task.payload);
  return textValue(payload.title, textValue(taskPayload.title, textValue(taskPayload.firstMaterial, "Материал AgentResult")));
}

async function applyDraftArtifact(input: {
  artifact: z.infer<typeof hermesArtifactSchema>;
  riskFlags: string[];
  task: Row;
  tenantId: string;
  userId?: string;
}) {
  const payload = artifactPayload(input.artifact);
  const taskPayload = asRecord(input.task.payload);
  const bodyMd = draftBodyFromArtifact(input.artifact);
  if (!bodyMd) return null;

  const channel = textValue(payload.channel, textValue(taskPayload.channel, "telegram"));
  const contentType = textValue(payload.contentType, textValue(payload.content_type, textValue(taskPayload.contentType, contentTypeForChannel(channel))));
  const title = draftTitleFromArtifact(input.artifact, input.task);
  const contentItem = await insertJson("content_items", {
    title,
    content_type: contentType,
    channel,
    status: "review",
    body_md: bodyMd,
    metadata: {
      approval_rules: textValue(taskPayload.approvalRules, ""),
      hermes_artifact_type: input.artifact.type,
      hermes_task_id: input.task.id ?? null,
      onboarding_source: taskPayload.source === "telegram_onboarding" ? "telegram_owner_control" : null,
      source: "hermes"
    }
  }, input.tenantId);

  await insertJson("content_versions", {
    content_item_id: contentItem.id,
    version: 1,
    body_md: bodyMd,
    change_note: "Черновик AgentResult",
    created_by: input.userId ?? null
  }, input.tenantId);

  const approval = await createApprovalRequest({
    tenantId: input.tenantId,
    scope: "social_post",
    targetType: "content_item",
    targetId: String(contentItem.id),
    requestedBy: input.userId,
    riskFlags: input.riskFlags.length ? input.riskFlags : ["public claim", "channel publishing"],
    summary: `Согласовать материал AgentResult: ${title}`
  });

  return {
    approval,
    contentItem,
    type: "content_draft_saved"
  };
}

async function applyHermesArtifacts(input: {
  artifacts: z.infer<typeof hermesArtifactSchema>[];
  riskFlags: string[];
  task: Row;
  tenantId: string;
  userId?: string;
}) {
  const acceptedActions: Row[] = [];

  for (const artifact of input.artifacts) {
    if (artifact.type !== "draft") continue;
    const accepted = await applyDraftArtifact({
      artifact,
      riskFlags: input.riskFlags,
      task: input.task,
      tenantId: input.tenantId,
      userId: input.userId
    });
    if (accepted) acceptedActions.push(accepted);
  }

  return acceptedActions;
}

function stringifyForPrompt(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function buildHermesPrompt(envelope: Row) {
  return [
    "Ты Hermes Agent внутри AgentResult Growth Control.",
    "Задача: подготовить материал или рабочий результат по backend envelope.",
    "",
    "Жесткие правила:",
    "- не публикуй, не отправляй наружу и не принимай решение за собственника;",
    "- не обещай гарантированный рост, магию, гарантированные деньги или результат без данных;",
    "- пиши лаконично, профессионально, для собственника B2B-компании в РФ;",
    "- язык: решение, задача, выпуск, заявка, контроль, результат;",
    "- не используй backend-admin терминологию в тексте материала;",
    "- верни только валидный JSON без markdown и пояснений.",
    "",
    "Формат ответа:",
    stringifyForPrompt({
      status: "completed",
      summary: "Кратко что подготовлено.",
      artifacts: [
        {
          type: "draft",
          targetType: "content_item",
          payload: {
            title: "Название материала",
            bodyMd: "Текст материала",
            channel: "telegram",
            contentType: "telegram_post"
          }
        }
      ],
      proposedActions: [
        {
          type: "approval_request",
          scope: "social_post",
          summary: "Согласовать материал перед выпуском.",
          payload: {}
        }
      ],
      riskFlags: ["public claim"]
    }),
    "",
    "Backend envelope:",
    stringifyForPrompt(envelope)
  ].join("\n");
}

function contentText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map((part) => {
      if (typeof part === "string") return part;
      const record = asRecord(part);
      return textValue(record.text, "");
    }).filter(Boolean).join("\n");
  }
  return "";
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

async function callHermesRuntime(input: { envelope: Row; runId: string }) {
  if (!config.hermesApiKey) {
    throw new Error("HERMES_API_KEY is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.hermesRequestTimeoutMs);
  try {
    const response = await fetch(`${config.hermesBaseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "authorization": `Bearer ${config.hermesApiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: config.hermesModel,
        temperature: 0.2,
        max_tokens: config.hermesMaxTokens,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Return only strict JSON that matches the requested schema. Do not publish or send anything."
          },
          {
            role: "user",
            content: buildHermesPrompt(input.envelope)
          }
        ]
      }),
      signal: controller.signal
    });
    const rawText = await response.text();
    if (!response.ok) {
      throw new Error(`Hermes API ${response.status}: ${rawText.slice(0, 500)}`);
    }

    const parsedCompletion = hermesChatCompletionSchema.parse(JSON.parse(rawText));
    const firstContent = contentText(parsedCompletion.choices[0]?.message.content);
    if (!firstContent) {
      throw new Error("Hermes API returned an empty completion");
    }

    const rawResult = JSON.parse(extractJsonObject(firstContent));
    return hermesResultSchema.parse({
      ...rawResult,
      runId: input.runId
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function applyHermesResult(input: {
  task: Row;
  body: z.infer<typeof hermesResultSchema>;
  tenantId: string;
  userId?: string;
}) {
  const acceptedActions = input.body.status === "completed"
    ? await applyHermesArtifacts({
      artifacts: input.body.artifacts,
      riskFlags: input.body.riskFlags,
      task: input.task,
      tenantId: input.tenantId,
      userId: input.userId
    })
    : [];
  const taskResultPayload = {
    source: "hermes",
    status: input.body.status,
    summary: input.body.summary ?? null,
    artifacts: input.body.artifacts,
    proposedActions: input.body.proposedActions,
    riskFlags: input.body.riskFlags,
    acceptedActions,
    approvalRequired: acceptedActions.length > 0 ||
      input.body.proposedActions.some((action) => action.type === "approval_request") ||
      input.body.riskFlags.length > 0
  };
  const updatedTask = await updateTaskResult({
    taskId: String(input.task.id),
    tenantId: input.tenantId,
    status: taskStatusFromHermes(input.body.status),
    result: taskResultPayload
  });
  const run = input.body.runId
    ? await updateHermesRun({
      runId: input.body.runId,
      tenantId: input.tenantId,
      status: input.body.status,
      output: taskResultPayload,
      error: input.body.error
    })
    : null;

  await recordTaskEvent({
    tenantId: input.tenantId,
    taskId: input.task.id,
    eventType: "hermes_result_received",
    payload: {
      runId: input.body.runId ?? null,
      status: input.body.status,
      artifactCount: input.body.artifacts.length,
      acceptedActionCount: acceptedActions.length,
      proposedActionCount: input.body.proposedActions.length,
      riskFlags: arrayValue(input.body.riskFlags)
    }
  });

  return {
    task: updatedTask,
    run,
    acceptedActions,
    approvalRequired: taskResultPayload.approvalRequired
  };
}

export async function dispatchHermesTask(input: {
  taskId: string;
  tenantId: string;
  userId?: string;
  note?: string;
  dryRun?: boolean;
}) {
  const taskResult = await query("select * from tasks where id = $1 and tenant_id = $2", [input.taskId, input.tenantId]);
  const task = taskResult.rows[0] ?? null;
  if (!task) return null;

  const envelope = await buildHermesTaskEnvelope(task as Row, input.tenantId);
  const run = await createHermesRun({
    tenantId: input.tenantId,
    taskId: input.taskId,
    envelope,
    note: input.note
  });
  if (!run?.id) {
    return {
      run: null,
      envelope,
      delivery: "failed",
      error: "Hermes run was not created"
    };
  }
  const runId = String(run.id);

  await query(
    `update tasks
     set "status" = $2, updated_at = now()
     where id = $1 and tenant_id = $3
     returning *`,
    [input.taskId, "dispatched", input.tenantId]
  );
  await recordTaskEvent({
    tenantId: input.tenantId,
    taskId: input.taskId,
    eventType: "hermes_dispatch_prepared",
    payload: {
      runId,
      hermesBaseUrl: config.hermesBaseUrl,
      envelope
    }
  });

  if (input.dryRun || !config.hermesApiKey) {
    return {
      run,
      envelope,
      delivery: "prepared"
    };
  }

  await markHermesRunRunning({
    runId,
    tenantId: input.tenantId,
    output: { hermesBaseUrl: config.hermesBaseUrl, model: config.hermesModel }
  });

  try {
    const hermesResult = await callHermesRuntime({ envelope, runId });
    const applied = await applyHermesResult({
      task: task as Row,
      body: hermesResult,
      tenantId: input.tenantId,
      userId: input.userId
    });

    return {
      ...applied,
      envelope,
      delivery: "completed"
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const failedPayload = {
      source: "hermes",
      status: "failed",
      summary: null,
      artifacts: [],
      proposedActions: [],
      riskFlags: [],
      acceptedActions: [],
      approvalRequired: false,
      error: message
    };
    const updatedTask = await updateTaskResult({
      taskId: input.taskId,
      tenantId: input.tenantId,
      status: "failed",
      result: failedPayload
    });
    const failedRun = await updateHermesRun({
      runId,
      tenantId: input.tenantId,
      status: "failed",
      output: failedPayload,
      error: message
    });
    await recordTaskEvent({
      tenantId: input.tenantId,
      taskId: input.taskId,
      eventType: "hermes_dispatch_failed",
      payload: {
        runId,
        hermesBaseUrl: config.hermesBaseUrl,
        error: message
      }
    });

    return {
      task: updatedTask,
      run: failedRun,
      acceptedActions: [],
      approvalRequired: false,
      envelope,
      delivery: "failed",
      error: message
    };
  }
}

export async function hermesRoutes(app: FastifyInstance) {
  app.post("/hermes/tasks/:id/dispatch", async (request) => {
    const { id } = idParams.parse(request.params);
    const body = dispatchBody.parse(request.body ?? {});
    return {
      data: await dispatchHermesTask({
        taskId: id,
        tenantId: request.tenantId,
        userId: request.userId,
        note: body.note,
        dryRun: body.dryRun
      })
    };
  });

  app.post("/hermes/tasks/:id/result", async (request) => {
    const { id } = idParams.parse(request.params);
    const body = hermesResultSchema.parse(request.body ?? {});
    const taskResult = await query("select * from tasks where id = $1 and tenant_id = $2", [id, request.tenantId]);
    const task = taskResult.rows[0] ?? null;
    if (!task) return { data: null };

    return {
      data: await applyHermesResult({
        task: task as Row,
        body,
        tenantId: request.tenantId,
        userId: request.userId
      })
    };
  });
}
