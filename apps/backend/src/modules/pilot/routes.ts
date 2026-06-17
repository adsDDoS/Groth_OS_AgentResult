import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../../db/client.js";
import { createAgentTask } from "../agents/runner.js";
import { createApprovalRequest } from "../approvals/service.js";
import { recordOwnerActionAudit } from "../common/audit.js";
import { insertJson, patchJson } from "../common/repository.js";
import { executePublicationResultCommand, listPublicationResults } from "../distribution-signals/routes.js";

const weekOnePilotBody = z.object({
  icp: z.string().trim().optional(),
  channel: z.string().trim().optional(),
  materialTitle: z.string().trim().optional(),
  approvalOwner: z.string().trim().optional(),
  releaseOwner: z.string().trim().optional(),
  resultOwner: z.string().trim().optional(),
  resultSource: z.string().trim().optional(),
  forbiddenClaims: z.string().trim().optional()
});
const daySevenReviewBody = z.object({
  nextStep: z.enum(["expand", "reuse", "update", "leave"]),
  note: z.string().trim().optional(),
  ownerNotes: z.string().trim().optional(),
  publicationResultId: z.string().trim().optional()
});

type WeekOnePilotInput = z.infer<typeof weekOnePilotBody> & {
  tenantId: string;
  userId?: string | null;
};
type DaySevenReviewInput = z.infer<typeof daySevenReviewBody> & {
  tenantId: string;
  userId?: string | null;
};

export async function pilotRoutes(app: FastifyInstance) {
  app.post("/pilot/week-1/start", async (request) => {
    const body = weekOnePilotBody.parse(request.body ?? {});
    return {
      data: await startWeekOnePilot({
        ...body,
        tenantId: request.tenantId,
        userId: request.userId
      })
    };
  });

  app.post("/pilot/week-1/day-7-review", async (request, reply) => {
    const body = daySevenReviewBody.parse(request.body ?? {});
    const result = await completeDaySevenReview({
      ...body,
      tenantId: request.tenantId,
      userId: request.userId
    });
    if (!result) {
      reply.status(409);
      return {
        error: "PilotReviewNotReady",
        message: "Week-1 pilot review requires an active pilot workspace and a confirmed publication result."
      };
    }
    return { data: result };
  });
}

export async function startWeekOnePilot(input: WeekOnePilotInput) {
  const now = new Date().toISOString();
  const channel = input.channel || "telegram";
  const materialTitle = input.materialTitle || "Как не терять выпуск контента между идеей и публикацией";
  const approvalOwner = input.approvalOwner || "Founder / managing partner";
  const releaseOwner = input.releaseOwner || "Content operator or chief of staff";
  const resultOwner = input.resultOwner || releaseOwner;
  const icp = input.icp || "Founder-led B2B service or expert team that sells complex work through trust content.";
  const resultSource = input.resultSource || "Telegram post URL, comments, reposts, saves, reactions, and owner mark after 24 hours.";
  const forbiddenClaims = input.forbiddenClaims || "No guaranteed leads, no guaranteed revenue, no fake ROI, no named clients or competitor mentions without approval.";
  const profilePatch = {
    icp,
    channels: `Week 1: ${channel} only. Second channel is intentionally out of scope until Day 7.`,
    approvalOwner: `${approvalOwner} approves topic boundary within 24 hours.`,
    releaseOwner: `${releaseOwner} owns QA, handoff, manual release, URL confirmation.`,
    firstSignalSource: resultSource,
    forbiddenClaims,
    authorVoiceContract:
      "Фразы автора: рабочий контур, без каши, через решение. Стоп-слова: гарантированные лиды, магия, автоматические продажи. AI-шаблоны: убрать общие вступления и пустые benefit lists. Прямота: practical founder voice. Proof/risk: no numbers or client names without approval. Решение QA: похоже / не похоже на автора."
  };
  const company = await upsertCompanyProfile(input.tenantId, profilePatch);
  const demand = await insertJson("demand_map_items", {
    item_type: "icp",
    title: "Founder-led B2B service / expert team",
    intent: "pilot",
    audience: "Owner who sells complex work through trust content",
    status: "approved",
    priority: 100,
    evidence_requirements: [],
    notes: {
      source: "week_1_pilot_start",
      reason: "Expert knowledge exists but gets stuck across voice notes, chats, drafts, QA, and release."
    }
  }, input.tenantId);
  const brief = [
    "Angle: большинство команд проигрывают не потому, что не могут написать текст, а потому что тема, черновик, QA, выпуск и результат живут в разных чатах.",
    "Structure: operational pain -> broken flow -> controlled flow -> practical conclusion.",
    "Required flow: topic boundary -> draft -> QA -> release -> URL -> next step.",
    "Forbidden: AI writes everything by itself; guaranteed leads; fake metrics; named clients without approval."
  ].join("\n");
  const content = await insertJson("content_items", {
    demand_map_item_id: demand.id,
    title: materialTitle,
    content_type: "telegram_post",
    channel,
    status: "review",
    target_url: null,
    body_md:
      "Большинство команд не теряют контент на этапе написания. Он теряется между идеей, голосовым, черновиком, QA, выпуском и проверкой результата.\n\nРабочий контур проще: тема и граница согласованы, черновик подготовлен, QA проверил факты и стиль, менеджер выпустил, URL зафиксирован, следующий шаг выбран.",
    metadata: {
      owner: releaseOwner,
      audience: icp,
      brief,
      source: "week_1_pilot_start",
      result_owner: resultOwner
    }
  }, input.tenantId);
  const approval = await createApprovalRequest({
    tenantId: input.tenantId,
    scope: "social_post",
    targetType: "content_item",
    targetId: String(content.id),
    requestedBy: input.userId ?? undefined,
    riskFlags: ["channel publishing", "public claim"],
    summary: `Согласовать тему недели: ${materialTitle}`
  });
  const calendar = await Promise.all([
    createCalendarItem(input.tenantId, {
      title: "Day 0: setup intake, one channel, one format, three owners",
      channel,
      status: "published",
      scheduled_for: "2026-06-16 10:00",
      metadata: { result_note: "Pilot context ready: channel, format, approval owner, QA/release owner, result owner." }
    }),
    createCalendarItem(input.tenantId, {
      title: "Day 1: approve topic boundary",
      content_item_id: content.id,
      channel,
      status: "review",
      scheduled_for: "2026-06-17 12:00",
      metadata: { result_note: "Approved topic boundary: no revenue/lead promise; no client names." }
    }),
    createCalendarItem(input.tenantId, {
      title: "Day 2: prepare Telegram draft in founder voice",
      content_item_id: content.id,
      channel,
      status: "scheduled",
      scheduled_for: "2026-06-18 18:00",
      metadata: { result_note: "Draft ready for QA: practical lesson, one example, no forbidden claims." }
    }),
    createCalendarItem(input.tenantId, {
      title: "Day 3: QA facts, voice, claims, channel format",
      content_item_id: content.id,
      channel,
      status: "scheduled",
      scheduled_for: "2026-06-19 16:00",
      metadata: { result_note: "QA passed 5/5." }
    }),
    createCalendarItem(input.tenantId, {
      title: "Day 4/5: Telegram post released and URL confirmed",
      content_item_id: content.id,
      channel,
      status: "scheduled",
      scheduled_for: "2026-06-20 10:00",
      metadata: { handoff_note: "Day 4: hand off final text, publish manually, then confirm URL and reactions. Handoff is not the result." }
    }),
    createCalendarItem(input.tenantId, {
      title: "Day 7: review next content step and week-2 scope",
      content_item_id: content.id,
      channel: "manual_export",
      status: "scheduled",
      scheduled_for: "2026-06-23 12:00",
      metadata: {
        handoff_note: "Review what went out, where published, primary reactions, owner response time, QA rework, manual publishing delay, URL confirmation delay.",
        next_step: "expand / reuse / update / leave",
        week_2_gate: "No second channel unless the first loop is clean."
      }
    })
  ]);
  const task = await createAgentTask({
    tenantId: input.tenantId,
    role: "growth_orchestrator",
    taskType: "pilot_day_7_review",
    targetType: "content_item",
    targetId: String(content.id),
    payload: {
      title: "Day 7 review: choose expand / reuse / update / leave",
      owner: "Founder + operator",
      status: "queued",
      note: "Default: expand if comments/saves appear; otherwise reuse strongest paragraph as second post.",
      source: "pilot_execution"
    },
    createdBy: input.userId ?? undefined
  });
  const dashboardState = await mergeDashboardState(input.tenantId, {
    activePilotWorkspace: {
      started_at: now,
      mode: "week_1",
      material_id: content.id,
      approval_id: approval.id,
      day_7_review_id: calendar.find((item) => String(item.title).startsWith("Day 7:"))?.id ?? ""
    }
  });
  const activePilotWorkspace = dashboardState.activePilotWorkspace && typeof dashboardState.activePilotWorkspace === "object"
    ? dashboardState.activePilotWorkspace as Record<string, unknown>
    : {};
  await recordOwnerActionAudit({
    tenantId: input.tenantId,
    action: "pilot.week_1.start",
    targetType: "content_item",
    targetId: String(content.id),
    userId: input.userId ?? null,
    source: "pilot_command",
    metadata: {
      approval_id: approval.id,
      day_7_review_id: activePilotWorkspace.day_7_review_id ?? null,
      channel,
      material_title: materialTitle
    }
  });

  return {
    company,
    demand,
    content,
    approval,
    calendar,
    task,
    workspace_state: dashboardState
  };
}

export async function completeDaySevenReview(input: DaySevenReviewInput) {
  const now = new Date().toISOString();
  const dashboardState = await getDashboardState(input.tenantId);
  const activePilotWorkspace = dashboardState.activePilotWorkspace && typeof dashboardState.activePilotWorkspace === "object"
    ? dashboardState.activePilotWorkspace as Record<string, unknown>
    : {};
  const materialId = typeof activePilotWorkspace.material_id === "string" ? activePilotWorkspace.material_id : "";
  const daySevenReviewId = typeof activePilotWorkspace.day_7_review_id === "string" ? activePilotWorkspace.day_7_review_id : "";
  if (!materialId || !daySevenReviewId) return null;

  const publicationResults = await listPublicationResults(input.tenantId);
  const publicationResult = publicationResults.find((item) =>
    input.publicationResultId
      ? [item.id, item.calendar_item_id, item.distribution_signal_id].includes(input.publicationResultId)
      : item.content_item_id === materialId
  ) ?? null;
  if (!publicationResult) return null;
  if (publicationResult.content_item_id !== materialId) return null;

  const note = input.note || input.ownerNotes || defaultDaySevenReviewNote(input.nextStep);
  const actionResult = input.nextStep === "leave"
    ? await markPublicationResultLeft({
      tenantId: input.tenantId,
      userId: input.userId,
      publicationResult,
      note,
      decidedAt: now
    })
    : await executePublicationResultCommand({
      tenantId: input.tenantId,
      userId: input.userId,
      publicationResultId: String(publicationResult.id),
      command: input.nextStep,
      note
    });
  if (!actionResult) return null;

  const daySevenCalendarResult = await query("select * from publishing_calendar_items where id = $1 and tenant_id = $2", [
    daySevenReviewId,
    input.tenantId
  ]);
  const currentDaySevenCalendar = daySevenCalendarResult.rows[0] ?? null;
  const currentDaySevenMetadata = currentDaySevenCalendar?.metadata && typeof currentDaySevenCalendar.metadata === "object"
    ? currentDaySevenCalendar.metadata as Record<string, unknown>
    : {};
  const daySevenCalendar = await patchJson("publishing_calendar_items", daySevenReviewId, {
    status: "published",
    metadata: {
      ...currentDaySevenMetadata,
      day_7_review: {
        decided_at: now,
        decided_by: input.userId ?? null,
        material_id: materialId,
        publication_result_id: publicationResult.id,
        next_step: input.nextStep,
        note,
        owner_notes: input.ownerNotes ?? null,
        action: actionResult.action ?? null
      }
    }
  }, input.tenantId);
  const task = await completeDaySevenReviewTask(input.tenantId, materialId, {
    decided_at: now,
    publication_result_id: publicationResult.id,
    next_step: input.nextStep,
    note,
    owner_notes: input.ownerNotes ?? null
  });
  const updatedWorkspaceState = await mergeDashboardState(input.tenantId, {
    activePilotWorkspace: {
      ...activePilotWorkspace,
      day_7_review_completed_at: now,
      day_7_review_decision: input.nextStep,
      day_7_review_note: note,
      publication_result_id: publicationResult.id
    }
  });

  await recordOwnerActionAudit({
    tenantId: input.tenantId,
    action: "pilot.week_1.day_7_review",
    targetType: "publication_result",
    targetId: String(publicationResult.id),
    userId: input.userId ?? null,
    source: "pilot_command",
    metadata: {
      material_id: materialId,
      day_7_review_id: daySevenReviewId,
      next_step: input.nextStep,
      note,
      owner_notes: input.ownerNotes ?? null,
      next_target_type: actionResult.target_type ?? actionResult.action?.target_type ?? null,
      next_target_id: actionResult.target?.id ?? actionResult.action?.target_id ?? null
    }
  });

  return {
    decision: {
      next_step: input.nextStep,
      note,
      owner_notes: input.ownerNotes ?? null,
      decided_at: now,
      decided_by: input.userId ?? null
    },
    publication_result: actionResult.publication_result ?? publicationResult,
    action: actionResult.action ?? null,
    target: actionResult.target ?? null,
    target_type: actionResult.target_type ?? actionResult.action?.target_type ?? null,
    day_7_review: daySevenCalendar,
    task,
    workspace_state: updatedWorkspaceState
  };
}

async function upsertCompanyProfile(tenantId: string, profilePatch: Record<string, unknown>) {
  const existing = await query("select * from companies where tenant_id = $1 order by created_at asc limit 1", [tenantId]);
  const current = existing.rows[0] ?? null;
  const profile = {
    ...(current?.profile && typeof current.profile === "object" ? current.profile : {}),
    ...profilePatch
  };
  if (current) {
    const result = await query(
      `update companies set name = coalesce($2, name), profile = coalesce($3, profile), website_url = coalesce($4, website_url), updated_at = now()
       where id = $1 returning *`,
      [current.id, null, profile, null]
    );
    return result.rows[0];
  }
  const result = await query("insert into companies (tenant_id, name, profile, website_url) values ($1, $2, $3, $4) returning *", [
    tenantId,
    "Week-1 Pilot Company",
    profile,
    null
  ]);
  return result.rows[0];
}

async function createCalendarItem(tenantId: string, item: Record<string, unknown>) {
  return insertJson("publishing_calendar_items", {
    content_item_id: item.content_item_id ?? null,
    channel: item.channel,
    title: item.title,
    status: item.status,
    scheduled_for: item.scheduled_for,
    timezone: "Europe/Moscow",
    export_path: null,
    metadata: item.metadata ?? {}
  }, tenantId);
}

async function mergeDashboardState(tenantId: string, patch: Record<string, unknown>) {
  const currentState = await getDashboardState(tenantId);
  const result = await query("select * from tenants where id = $1", [tenantId]);
  const tenant = result.rows[0] ?? null;
  const settings = tenant?.settings && typeof tenant.settings === "object" ? { ...(tenant.settings as Record<string, unknown>) } : {};
  settings.dashboard_state = {
    ...currentState,
    ...patch
  };
  const updated = await query("update tenants set settings = $2 where id = $1 returning *", [tenantId, settings]);
  const updatedSettings = updated.rows[0]?.settings && typeof updated.rows[0].settings === "object"
    ? updated.rows[0].settings as Record<string, unknown>
    : {};
  return updatedSettings.dashboard_state && typeof updatedSettings.dashboard_state === "object"
    ? updatedSettings.dashboard_state as Record<string, unknown>
    : {};
}

async function getDashboardState(tenantId: string) {
  const result = await query("select * from tenants where id = $1", [tenantId]);
  const settings = result.rows[0]?.settings && typeof result.rows[0].settings === "object"
    ? result.rows[0].settings as Record<string, unknown>
    : {};
  return settings.dashboard_state && typeof settings.dashboard_state === "object"
    ? settings.dashboard_state as Record<string, unknown>
    : {};
}

async function markPublicationResultLeft(input: {
  tenantId: string;
  userId?: string | null;
  publicationResult: Record<string, unknown>;
  note: string;
  decidedAt: string;
}) {
  const calendarItemId = typeof input.publicationResult.calendar_item_id === "string" ? input.publicationResult.calendar_item_id : "";
  if (!calendarItemId) return null;
  const result = await query("select * from publishing_calendar_items where id = $1 and tenant_id = $2", [calendarItemId, input.tenantId]);
  const calendar = result.rows[0] ?? null;
  if (!calendar) return null;
  const metadata = calendar.metadata && typeof calendar.metadata === "object" ? calendar.metadata as Record<string, unknown> : {};
  const currentResult = metadata.publication_result && typeof metadata.publication_result === "object"
    ? metadata.publication_result as Record<string, unknown>
    : {};
  const action = {
    type: "leave",
    target_type: null,
    target_id: null,
    created_at: input.decidedAt,
    created_by: input.userId ?? null
  };
  const updatedCalendar = await patchJson("publishing_calendar_items", calendarItemId, {
    metadata: {
      ...metadata,
      publication_result: {
        ...currentResult,
        next_step: "leave",
        next_step_note: input.note,
        next_step_action: action,
        decided_at: input.decidedAt,
        decided_by: input.userId ?? null
      }
    }
  }, input.tenantId);
  return {
    action,
    target: null,
    target_type: null,
    calendar_item: updatedCalendar,
    publication_result: {
      ...input.publicationResult,
      next_step: "leave",
      next_step_note: input.note
    }
  };
}

async function completeDaySevenReviewTask(tenantId: string, materialId: string, payload: Record<string, unknown>) {
  const result = await query("select * from tasks where tenant_id = $1 order by created_at desc limit 200", [tenantId]);
  const task = result.rows.find((row) => row.task_type === "pilot_day_7_review" && row.target_id === materialId);
  if (!task?.id) return null;
  const metadata = task.payload && typeof task.payload === "object" ? task.payload as Record<string, unknown> : {};
  const updated = await patchJson("tasks", String(task.id), {
    status: "completed",
    payload: {
      ...metadata,
      status: "completed",
      day_7_review: payload
    }
  }, tenantId);
  return updated;
}

function defaultDaySevenReviewNote(nextStep: "expand" | "reuse" | "update" | "leave") {
  if (nextStep === "expand") return "Expand the strongest angle into a larger content piece.";
  if (nextStep === "reuse") return "Reuse the strongest paragraph as the next material.";
  if (nextStep === "update") return "Update the published material with confirmed reactions and owner notes.";
  return "Leave the material as published and keep the next week narrow.";
}
