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
const weekTwoStartBody = z.object({
  note: z.string().trim().optional()
});
const weekTwoReviewBody = z.object({
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
type WeekTwoStartInput = z.infer<typeof weekTwoStartBody> & {
  tenantId: string;
  userId?: string | null;
};
type WeekTwoReviewInput = z.infer<typeof weekTwoReviewBody> & {
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

  app.get("/pilot/week-2/execution", async (request, reply) => {
    const result = await getActiveWeekTwoExecution(request.tenantId);
    if (!result) {
      reply.status(404);
      return {
        error: "PilotWeekTwoExecutionNotFound",
        message: "No active week-2 execution workspace is available."
      };
    }
    return { data: result };
  });

  app.get("/pilot/week-3/execution", async (request, reply) => {
    const result = await getActiveWeekThreeExecution(request.tenantId);
    if (!result) {
      reply.status(404);
      return {
        error: "PilotWeekThreeExecutionNotFound",
        message: "No active week-3 execution workspace is available."
      };
    }
    return { data: result };
  });

  app.post("/pilot/week-2/start", async (request, reply) => {
    const body = weekTwoStartBody.parse(request.body ?? {});
    const result = await startWeekTwoExecution({
      ...body,
      tenantId: request.tenantId,
      userId: request.userId
    });
    if (!result) {
      reply.status(409);
      return {
        error: "PilotWeekTwoNotReady",
        message: "Week-2 execution requires an approved pilot_week_2_scope approval."
      };
    }
    return { data: result };
  });

  app.post("/pilot/week-3/start", async (request, reply) => {
    const body = weekTwoStartBody.parse(request.body ?? {});
    const result = await startWeekThreeExecution({
      ...body,
      tenantId: request.tenantId,
      userId: request.userId
    });
    if (!result) {
      reply.status(409);
      return {
        error: "PilotWeekThreeNotReady",
        message: "Week-3 execution requires an approved pilot_week_3_scope approval."
      };
    }
    return { data: result };
  });

  app.post("/pilot/week-2/review", async (request, reply) => {
    const body = weekTwoReviewBody.parse(request.body ?? {});
    const result = await completeWeekTwoReview({
      ...body,
      tenantId: request.tenantId,
      userId: request.userId
    });
    if (!result) {
      reply.status(409);
      return {
        error: "PilotWeekTwoReviewNotReady",
        message: "Week-2 review requires active week-2 execution and a confirmed week-2 publication result."
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
  const actionResult = await executePilotPublicationResultDecision({
    tenantId: input.tenantId,
    userId: input.userId,
    publicationResult,
    nextStep: input.nextStep,
    note,
    decidedAt: now
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
  const weekTwoScope = await createWeekTwoScope({
    tenantId: input.tenantId,
    userId: input.userId,
    materialId,
    nextStep: input.nextStep,
    note,
    publicationResult,
    actionResult,
    decidedAt: now
  });
  const updatedWorkspaceState = await mergeDashboardState(input.tenantId, {
    activePilotWorkspace: {
      ...activePilotWorkspace,
      day_7_review_completed_at: now,
      day_7_review_decision: input.nextStep,
      day_7_review_note: note,
      publication_result_id: publicationResult.id,
      week_2_scope: {
        created_at: weekTwoScope.created_at,
        decision: weekTwoScope.decision,
        repair_decision: weekTwoScope.repair_decision,
        channel_constraint: weekTwoScope.channel_constraint,
        next_material_id: weekTwoScope.next_material?.id ?? null,
        task_id: weekTwoScope.task?.id ?? null,
        approval_id: weekTwoScope.approval?.id ?? null,
        approval_status: weekTwoScope.approval?.status ?? "pending",
        board_ids: weekTwoScope.board.map((item) => item.id)
      }
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
      next_target_id: actionResult.target?.id ?? actionResult.action?.target_id ?? null,
      week_2_scope: {
        repair_decision: weekTwoScope.repair_decision,
        channel_constraint: weekTwoScope.channel_constraint,
        next_material_id: weekTwoScope.next_material?.id ?? null,
        task_id: weekTwoScope.task?.id ?? null
      }
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
    week_2_scope: weekTwoScope,
    day_7_review: daySevenCalendar,
    task,
    workspace_state: updatedWorkspaceState
  };
}

export async function getActiveWeekTwoExecution(tenantId: string) {
  return getActivePilotWeekExecution(tenantId, 2);
}

export async function getActiveWeekThreeExecution(tenantId: string) {
  return getActivePilotWeekExecution(tenantId, 3);
}

async function getActivePilotWeekExecution(tenantId: string, week: number) {
  const scopeKey = `week_${week}_scope`;
  const executionKey = `week_${week}_execution`;
  const dashboardState = await getDashboardState(tenantId);
  const activePilotWorkspace = dashboardState.activePilotWorkspace && typeof dashboardState.activePilotWorkspace === "object"
    ? dashboardState.activePilotWorkspace as Record<string, unknown>
    : {};
  const pilotWeekExecution = activePilotWorkspace[executionKey] && typeof activePilotWorkspace[executionKey] === "object"
    ? activePilotWorkspace[executionKey] as Record<string, unknown>
    : {};
  const pilotWeekScope = activePilotWorkspace[scopeKey] && typeof activePilotWorkspace[scopeKey] === "object"
    ? activePilotWorkspace[scopeKey] as Record<string, unknown>
    : {};
  const contentItemId = textValue(pilotWeekExecution.content_item_id || pilotWeekScope.next_material_id, "");
  if (activePilotWorkspace.mode !== `week_${week}` || !contentItemId) return null;

  const contentResult = await query("select * from content_items where id = $1 and tenant_id = $2", [contentItemId, tenantId]);
  const material = contentResult.rows[0] ?? null;
  if (!material) return null;

  const board = await listPilotWeekBoard(tenantId, contentItemId, week);
  const materialApproval = await findWeekTwoMaterialApproval(tenantId, contentItemId);
  const task = await findPilotWeekExecutionTask(tenantId, contentItemId, week);
  const publicationResults = await listPublicationResults(tenantId);
  const publicationResult = publicationResults.find((item) => item.content_item_id === contentItemId) ?? null;
  const releaseItem = pilotWeekReleaseItem(board, week);
  const confirmationItem = pilotWeekConfirmationItem(board, week) ?? releaseItem;
  const roles = pilotWeekRolesFromMaterial(material, board, pilotWeekScope, week);
  const materialApproved = materialApproval?.status === "approved";
  const releaseStatus = textValue(releaseItem?.status, "");
  const currentGate = publicationResult
    ? "result_review"
    : !materialApproved
      ? "material_approval"
      : releaseStatus === "handed_off"
        ? "url_confirmation"
        : "qa_release_handoff";

  return {
    status: "active",
    week,
    current_gate: currentGate,
    material,
    material_approval: materialApproval,
    board,
    task,
    publication_result: publicationResult,
    roles,
    channel_constraint: textValue(pilotWeekScope.channel_constraint, ""),
    actions: {
      approve_material: materialApproval ? {
        approval_id: materialApproval.id,
        enabled: materialApproval.status === "pending"
      } : null,
      handoff_release: releaseItem ? {
        calendar_item_id: releaseItem.id,
        enabled: materialApproved && ["scheduled", "review"].includes(releaseStatus)
      } : null,
      confirm_url: releaseItem ? {
        calendar_item_id: releaseItem.id,
        enabled: releaseStatus === "handed_off"
      } : null,
      review_result: publicationResult ? {
        publication_result_id: publicationResult.id,
        enabled: true
      } : null,
      confirmation_gate: confirmationItem ? {
        calendar_item_id: confirmationItem.id,
        enabled: Boolean(publicationResult)
      } : null
    },
    workspace_state: dashboardState
  };
}

export async function completeWeekTwoReview(input: WeekTwoReviewInput) {
  const now = new Date().toISOString();
  const execution = await getActiveWeekTwoExecution(input.tenantId);
  if (!execution || execution.current_gate !== "result_review") return null;
  const materialId = textValue(execution.material?.id, "");
  const publicationResult = execution.publication_result && typeof execution.publication_result === "object"
    ? execution.publication_result as Record<string, unknown>
    : null;
  if (!materialId || !publicationResult) return null;
  if (input.publicationResultId && ![publicationResult.id, publicationResult.calendar_item_id, publicationResult.distribution_signal_id].includes(input.publicationResultId)) return null;

  const note = input.note || input.ownerNotes || defaultPilotReviewNote(input.nextStep);
  const actionResult = await executePilotPublicationResultDecision({
    tenantId: input.tenantId,
    userId: input.userId,
    publicationResult,
    nextStep: input.nextStep,
    note,
    decidedAt: now
  });
  if (!actionResult) return null;

  const board = Array.isArray(execution.board) ? execution.board as Record<string, unknown>[] : [];
  const reviewItem = weekTwoConfirmationItem(board);
  const weekTwoReview = reviewItem?.id
    ? await patchPilotReviewBoardItem(input.tenantId, String(reviewItem.id), "week_2_review", {
        decided_at: now,
        decided_by: input.userId ?? null,
        material_id: materialId,
        publication_result_id: publicationResult.id ?? null,
        next_step: input.nextStep,
        note,
        owner_notes: input.ownerNotes ?? null,
        action: actionResult.action ?? null
      })
    : null;
  const task = await completePilotTask(input.tenantId, "pilot_week_2_execution", materialId, {
    status: "completed",
    week_2_review: {
      decided_at: now,
      publication_result_id: publicationResult.id ?? null,
      next_step: input.nextStep,
      note,
      owner_notes: input.ownerNotes ?? null
    }
  });
  await completeWeekTwoMaterialExecution(input.tenantId, materialId, {
    completed_at: now,
    completed_by: input.userId ?? null,
    review_decision: input.nextStep,
    review_note: note,
    publication_result_id: publicationResult.id ?? null
  });
  const weekThreeScope = await createPilotScopeProposal({
    tenantId: input.tenantId,
    userId: input.userId,
    sourceWeek: 2,
    targetWeek: 3,
    materialId,
    nextStep: input.nextStep,
    note,
    publicationResult,
    actionResult,
    decidedAt: now
  });

  const dashboardState = await getDashboardState(input.tenantId);
  const activePilotWorkspace = dashboardState.activePilotWorkspace && typeof dashboardState.activePilotWorkspace === "object"
    ? dashboardState.activePilotWorkspace as Record<string, unknown>
    : {};
  const weekTwoExecution = activePilotWorkspace.week_2_execution && typeof activePilotWorkspace.week_2_execution === "object"
    ? activePilotWorkspace.week_2_execution as Record<string, unknown>
    : {};
  const updatedWorkspaceState = await mergeDashboardState(input.tenantId, {
    activePilotWorkspace: {
      ...activePilotWorkspace,
      mode: "week_2_reviewed",
      week_2_execution: {
        ...weekTwoExecution,
        status: "completed",
        completed_at: now,
        review_decision: input.nextStep,
        review_note: note,
        publication_result_id: publicationResult.id ?? null
      },
      week_3_scope: {
        created_at: weekThreeScope.created_at,
        decision: weekThreeScope.decision,
        repair_decision: weekThreeScope.repair_decision,
        channel_constraint: weekThreeScope.channel_constraint,
        next_material_id: weekThreeScope.next_material?.id ?? null,
        task_id: weekThreeScope.task?.id ?? null,
        approval_id: weekThreeScope.approval?.id ?? null,
        approval_status: weekThreeScope.approval?.status ?? "pending",
        board_ids: weekThreeScope.board.map((item) => item.id)
      }
    }
  });

  await recordOwnerActionAudit({
    tenantId: input.tenantId,
    action: "pilot.week_2.review",
    targetType: "publication_result",
    targetId: String(publicationResult.id),
    userId: input.userId ?? null,
    source: "pilot_command",
    metadata: {
      material_id: materialId,
      next_step: input.nextStep,
      note,
      owner_notes: input.ownerNotes ?? null,
      next_target_type: actionResult.target_type ?? actionResult.action?.target_type ?? null,
      next_target_id: actionResult.target?.id ?? actionResult.action?.target_id ?? null,
      week_3_scope: {
        repair_decision: weekThreeScope.repair_decision,
        channel_constraint: weekThreeScope.channel_constraint,
        next_material_id: weekThreeScope.next_material?.id ?? null,
        task_id: weekThreeScope.task?.id ?? null,
        approval_id: weekThreeScope.approval?.id ?? null
      }
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
    week_3_scope: weekThreeScope,
    week_2_review: weekTwoReview,
    task,
    workspace_state: updatedWorkspaceState
  };
}

export async function startWeekTwoExecution(input: WeekTwoStartInput) {
  return startPilotWeekExecution(input, 2);
}

export async function startWeekThreeExecution(input: WeekTwoStartInput) {
  return startPilotWeekExecution(input, 3);
}

async function startPilotWeekExecution(input: WeekTwoStartInput, week: number) {
  const now = new Date().toISOString();
  const scopeKey = `week_${week}_scope`;
  const executionKey = `week_${week}_execution`;
  const scopeType = `pilot_week_${week}_scope`;
  const taskType = `pilot_week_${week}_execution`;
  const dashboardState = await getDashboardState(input.tenantId);
  const activePilotWorkspace = dashboardState.activePilotWorkspace && typeof dashboardState.activePilotWorkspace === "object"
    ? dashboardState.activePilotWorkspace as Record<string, unknown>
    : {};
  const pilotWeekScope = activePilotWorkspace[scopeKey] && typeof activePilotWorkspace[scopeKey] === "object"
    ? activePilotWorkspace[scopeKey] as Record<string, unknown>
    : {};
  const nextMaterialId = textValue(pilotWeekScope.next_material_id, "");
  const approvalId = textValue(pilotWeekScope.approval_id, "");
  if (!nextMaterialId || !approvalId) return null;

  const approvalResult = await query("select * from approvals where id = $1 and tenant_id = $2", [
    approvalId,
    input.tenantId
  ]);
  const approval = approvalResult.rows[0] ?? null;
  if (!approval || approval.scope !== scopeType || approval.status !== "approved") return null;

  const contentResult = await query("select * from content_items where id = $1 and tenant_id = $2", [
    nextMaterialId,
    input.tenantId
  ]);
  const currentContent = contentResult.rows[0] ?? null;
  if (!currentContent) return null;
  const currentMetadata = currentContent.metadata && typeof currentContent.metadata === "object"
    ? currentContent.metadata as Record<string, unknown>
    : {};
  const currentExecution = currentMetadata[executionKey] && typeof currentMetadata[executionKey] === "object"
    ? currentMetadata[executionKey] as Record<string, unknown>
    : {};
  if (currentExecution.status === "started" || currentExecution.status === "completed") {
    const board = await listPilotWeekBoard(input.tenantId, nextMaterialId, week);
    const task = await findPilotWeekExecutionTask(input.tenantId, nextMaterialId, week);
    const materialApproval = await findWeekTwoMaterialApproval(input.tenantId, nextMaterialId);
    return {
      status: currentExecution.status === "completed" ? "already_completed" : "already_started",
      content: currentContent,
      board,
      task,
      approval: materialApproval,
      workspace_state: dashboardState
    };
  }

  const content = await patchJson("content_items", nextMaterialId, {
    status: "review",
    metadata: {
      ...currentMetadata,
      [executionKey]: {
        status: "started",
        started_at: now,
        started_by: input.userId ?? null,
        note: input.note ?? "",
        scope_approval_id: approvalId
      }
    }
  }, input.tenantId);

  const board = await startPilotWeekBoard(input.tenantId, nextMaterialId, week, {
    started_at: now,
    started_by: input.userId ?? null,
    note: input.note ?? "",
    scope_approval_id: approvalId
  });
  const task = await createAgentTask({
    tenantId: input.tenantId,
    role: "growth_orchestrator",
    taskType,
    targetType: "content_item",
    targetId: nextMaterialId,
    payload: {
      title: `Week ${week} execution: ${textValue(content?.title ?? currentContent.title, "next material")}`,
      owner: "Founder + operator",
      status: "queued",
      source: taskType,
      scopeApprovalId: approvalId,
      note: input.note ?? "",
      boardIds: board.map((item) => item.id)
    },
    createdBy: input.userId ?? undefined
  });
  const materialApproval = await createApprovalRequest({
    tenantId: input.tenantId,
    scope: "social_post",
    targetType: "content_item",
    targetId: nextMaterialId,
    requestedBy: input.userId ?? undefined,
    riskFlags: [`week-${week} material`, "public claim"],
    summary: `Approve week-${week} material: ${textValue(content?.title ?? currentContent.title, "next material")}`
  });
  const updatedWorkspaceState = await mergeDashboardState(input.tenantId, {
    activePilotWorkspace: {
      ...activePilotWorkspace,
      mode: `week_${week}`,
      [executionKey]: {
        status: "started",
        started_at: now,
        started_by: input.userId ?? null,
        note: input.note ?? "",
        content_item_id: nextMaterialId,
        task_id: task.id ?? null,
        material_approval_id: materialApproval.id ?? null,
        board_ids: board.map((item) => item.id)
      }
    }
  });

  await recordOwnerActionAudit({
    tenantId: input.tenantId,
    action: `pilot.week_${week}.start`,
    targetType: "content_item",
    targetId: nextMaterialId,
    userId: input.userId ?? null,
    source: "pilot_command",
    metadata: {
      scope_approval_id: approvalId,
      task_id: task.id ?? null,
      material_approval_id: materialApproval.id ?? null,
      board_ids: board.map((item) => item.id),
      note: input.note ?? null
    }
  });

  return {
    status: "started",
    content,
    board,
    task,
    approval: materialApproval,
    workspace_state: updatedWorkspaceState
  };
}

async function createWeekTwoScope(input: {
  tenantId: string;
  userId?: string | null;
  materialId: string;
  nextStep: "expand" | "reuse" | "update" | "leave";
  note: string;
  publicationResult: Record<string, unknown>;
  actionResult: Record<string, unknown>;
  decidedAt: string;
}) {
  return createPilotScopeProposal({
    ...input,
    sourceWeek: 1,
    targetWeek: 2
  });
}

async function createPilotScopeProposal(input: {
  tenantId: string;
  userId?: string | null;
  sourceWeek: number;
  targetWeek: number;
  materialId: string;
  nextStep: "expand" | "reuse" | "update" | "leave";
  note: string;
  publicationResult: Record<string, unknown>;
  actionResult: Record<string, unknown>;
  decidedAt: string;
}) {
  const sourceContentResult = await query("select * from content_items where id = $1 and tenant_id = $2", [
    input.materialId,
    input.tenantId
  ]);
  const sourceContent = sourceContentResult.rows[0] ?? {};
  const sourceMetadata = sourceContent.metadata && typeof sourceContent.metadata === "object"
    ? sourceContent.metadata as Record<string, unknown>
    : {};
  const roles = {
    approval_owner: "Founder / managing partner",
    release_owner: textValue(sourceMetadata.owner, "Content operator or chief of staff"),
    result_owner: textValue(sourceMetadata.result_owner, textValue(sourceMetadata.owner, "Content operator or chief of staff"))
  };
  const nextMaterial = await ensureWeekTwoNextMaterial(input, sourceContent);
  const channel = textValue(nextMaterial.channel, textValue(sourceContent.channel, textValue(input.publicationResult.channel, "telegram")));
  const repairDecision = weekTwoRepairDecision(input.nextStep);
  const channelConstraint = `keep one proven channel for week ${input.targetWeek}: ${channel}`;
  const scopeKey = `week_${input.targetWeek}_scope`;
  const taskType = `pilot_week_${input.targetWeek}_scope`;
  const baseDay = input.targetWeek === 2 ? 8 : ((input.targetWeek - 1) * 7) + 1;
  const scopeLabel = `Week ${input.targetWeek}`;
  const scopeMetadata = {
    source: taskType,
    decision: input.nextStep,
    repair_decision: repairDecision,
    channel_constraint: channelConstraint,
    source_material_id: input.materialId,
    publication_result_id: input.publicationResult.id ?? null,
    owner_note: input.note,
    roles
  };
  const board = await Promise.all([
    createCalendarItem(input.tenantId, {
      title: `${scopeLabel} Day ${baseDay}: confirm scope and one-channel constraint`,
      content_item_id: nextMaterial.id,
      channel,
      status: "scheduled",
      scheduled_for: input.targetWeek === 2 ? "2026-06-24 10:00" : null,
      metadata: {
        [scopeKey]: {
          ...scopeMetadata,
          gate: `No second channel until week-${input.sourceWeek} loop is clean and week-${input.targetWeek} scope is approved.`
        }
      }
    }),
    createCalendarItem(input.tenantId, {
      title: `${scopeLabel} Day ${baseDay + 1}: prepare next material brief or draft`,
      content_item_id: nextMaterial.id,
      channel,
      status: "scheduled",
      scheduled_for: input.targetWeek === 2 ? "2026-06-25 18:00" : null,
      metadata: {
        [scopeKey]: {
          ...scopeMetadata,
          gate: `Material follows the week-${input.sourceWeek} review decision and avoids forbidden claims.`
        }
      }
    }),
    createCalendarItem(input.tenantId, {
      title: `${scopeLabel} Day ${baseDay + 2}: owner approval for next material`,
      content_item_id: nextMaterial.id,
      channel,
      status: "scheduled",
      scheduled_for: input.targetWeek === 2 ? "2026-06-26 12:00" : null,
      metadata: {
        [scopeKey]: {
          ...scopeMetadata,
          owner: roles.approval_owner,
          gate: "Owner approves topic boundary and claim safety."
        }
      }
    }),
    createCalendarItem(input.tenantId, {
      title: `${scopeLabel} Day ${baseDay + 3}: QA and release handoff`,
      content_item_id: nextMaterial.id,
      channel,
      status: "scheduled",
      scheduled_for: input.targetWeek === 2 ? "2026-06-27 16:00" : null,
      metadata: {
        [scopeKey]: {
          ...scopeMetadata,
          owner: roles.release_owner,
          gate: "QA passes before handoff; handoff is not publication."
        }
      }
    }),
    createCalendarItem(input.tenantId, {
      title: `${scopeLabel} Day ${baseDay + 6}: confirm URL and choose next content step`,
      content_item_id: nextMaterial.id,
      channel,
      status: "scheduled",
      scheduled_for: input.targetWeek === 2 ? "2026-06-30 12:00" : null,
      metadata: {
        [scopeKey]: {
          ...scopeMetadata,
          owner: roles.result_owner,
          gate: "URL and primary reactions are confirmed before another scope expansion."
        }
      }
    })
  ]);
  const task = await createAgentTask({
    tenantId: input.tenantId,
    role: "growth_orchestrator",
    taskType,
    targetType: "content_item",
    targetId: String(nextMaterial.id),
    payload: {
      title: `${scopeLabel} scope: ${weekTwoDecisionLabel(input.nextStep)}`,
      owner: "Founder + operator",
      status: "queued",
      decision: input.nextStep,
      repairDecision,
      channelConstraint,
      roles,
      source: taskType,
      publicationResultId: input.publicationResult.id ?? null,
      sourceMaterialId: input.materialId
    },
    createdBy: input.userId ?? undefined
  });
  const approval = await createApprovalRequest({
    tenantId: input.tenantId,
    scope: taskType,
    targetType: "content_item",
    targetId: String(nextMaterial.id),
    requestedBy: input.userId ?? undefined,
    riskFlags: [`week-${input.targetWeek} scope`, "channel constraint", "owner approval"],
    summary: `Approve week-${input.targetWeek} scope: ${weekTwoDecisionLabel(input.nextStep)}`
  });
  await recordOwnerActionAudit({
    tenantId: input.tenantId,
    action: `pilot.week_${input.targetWeek}.scope_created`,
    targetType: "content_item",
    targetId: String(nextMaterial.id),
    userId: input.userId ?? null,
    source: "pilot_command",
    metadata: {
      decision: input.nextStep,
      repair_decision: repairDecision,
      channel_constraint: channelConstraint,
      publication_result_id: input.publicationResult.id ?? null,
      source_week: input.sourceWeek,
      target_week: input.targetWeek,
      board_ids: board.map((item) => item.id),
      task_id: task.id ?? null,
      approval_id: approval.id ?? null
    }
  });
  return {
    created_at: input.decidedAt,
    decision: input.nextStep,
    repair_decision: repairDecision,
    channel_constraint: channelConstraint,
    roles,
    next_material: nextMaterial,
    board,
    task,
    approval
  };
}

async function listWeekTwoBoard(tenantId: string, contentItemId: string) {
  return listPilotWeekBoard(tenantId, contentItemId, 2);
}

async function listPilotWeekBoard(tenantId: string, contentItemId: string, week: number) {
  const scopeKey = `week_${week}_scope`;
  const result = await query("select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 300", [tenantId]);
  return result.rows.filter((row) => row.content_item_id === contentItemId && row.metadata?.[scopeKey]);
}

async function startWeekTwoBoard(tenantId: string, contentItemId: string, execution: Record<string, unknown>) {
  return startPilotWeekBoard(tenantId, contentItemId, 2, execution);
}

async function startPilotWeekBoard(tenantId: string, contentItemId: string, week: number, execution: Record<string, unknown>) {
  const scopeKey = `week_${week}_scope`;
  const board = await listPilotWeekBoard(tenantId, contentItemId, week);
  return Promise.all(board.map((item, index) => {
    const metadata = item.metadata && typeof item.metadata === "object" ? item.metadata as Record<string, unknown> : {};
    const currentScope = metadata[scopeKey] && typeof metadata[scopeKey] === "object"
      ? metadata[scopeKey] as Record<string, unknown>
      : {};
    return patchJson("publishing_calendar_items", String(item.id), {
      status: index === 0 ? "published" : item.status,
      metadata: {
        ...metadata,
        [scopeKey]: {
          ...currentScope,
          execution_status: "started",
          execution_started_at: execution.started_at ?? null,
          execution_started_by: execution.started_by ?? null,
          execution_note: execution.note ?? "",
          scope_approval_id: execution.scope_approval_id ?? null
        }
      }
    }, tenantId);
  }));
}

async function findWeekTwoExecutionTask(tenantId: string, contentItemId: string) {
  return findPilotWeekExecutionTask(tenantId, contentItemId, 2);
}

async function findPilotWeekExecutionTask(tenantId: string, contentItemId: string, week: number) {
  const result = await query("select * from tasks where tenant_id = $1 order by created_at desc limit 300", [tenantId]);
  return result.rows.find((row) => row.task_type === `pilot_week_${week}_execution` && row.target_id === contentItemId) ?? null;
}

async function findWeekTwoMaterialApproval(tenantId: string, contentItemId: string) {
  const result = await query(
    "select * from approvals where tenant_id = $1 and target_type = $2 and target_id = $3 and scope = $4 order by created_at desc limit 1",
    [tenantId, "content_item", contentItemId, "social_post"]
  );
  return result.rows[0] ?? null;
}

function weekTwoReleaseItem(board: Record<string, unknown>[]) {
  return pilotWeekReleaseItem(board, 2);
}

function pilotWeekReleaseItem(board: Record<string, unknown>[], week: number) {
  const baseDay = week === 2 ? 8 : ((week - 1) * 7) + 1;
  return board.find((item) => String(item.title || "").includes(`Day ${baseDay + 3}`))
    ?? board.find((item) => ["handed_off", "scheduled", "review"].includes(textValue(item.status, "")))
    ?? null;
}

function weekTwoConfirmationItem(board: Record<string, unknown>[]) {
  return pilotWeekConfirmationItem(board, 2);
}

function pilotWeekConfirmationItem(board: Record<string, unknown>[], week: number) {
  const baseDay = week === 2 ? 8 : ((week - 1) * 7) + 1;
  return board.find((item) => String(item.title || "").includes(`Day ${baseDay + 6}`)) ?? null;
}

function weekTwoRolesFromMaterial(
  material: Record<string, unknown>,
  board: Record<string, unknown>[],
  weekTwoScope: Record<string, unknown>
) {
  return pilotWeekRolesFromMaterial(material, board, weekTwoScope, 2);
}

function pilotWeekRolesFromMaterial(
  material: Record<string, unknown>,
  board: Record<string, unknown>[],
  pilotWeekScope: Record<string, unknown>,
  week: number
) {
  const scopeKey = `week_${week}_scope`;
  const metadata = material.metadata && typeof material.metadata === "object"
    ? material.metadata as Record<string, unknown>
    : {};
  const materialScope = metadata[scopeKey] && typeof metadata[scopeKey] === "object"
    ? metadata[scopeKey] as Record<string, unknown>
    : {};
  const roles = materialScope.roles && typeof materialScope.roles === "object"
    ? materialScope.roles as Record<string, unknown>
    : pilotWeekScope.roles && typeof pilotWeekScope.roles === "object"
      ? pilotWeekScope.roles as Record<string, unknown>
      : {};
  const releaseItem = pilotWeekReleaseItem(board, week);
  const confirmationItem = pilotWeekConfirmationItem(board, week);
  const releaseMetadata = releaseItem?.metadata && typeof releaseItem.metadata === "object"
    ? releaseItem.metadata as Record<string, unknown>
    : {};
  const confirmationMetadata = confirmationItem?.metadata && typeof confirmationItem.metadata === "object"
    ? confirmationItem.metadata as Record<string, unknown>
    : {};
  const releaseScope = releaseMetadata[scopeKey] && typeof releaseMetadata[scopeKey] === "object"
    ? releaseMetadata[scopeKey] as Record<string, unknown>
    : {};
  const confirmationScope = confirmationMetadata[scopeKey] && typeof confirmationMetadata[scopeKey] === "object"
    ? confirmationMetadata[scopeKey] as Record<string, unknown>
    : {};

  return {
    approval_owner: textValue(roles.approval_owner, "Founder / managing partner"),
    release_owner: textValue(roles.release_owner || releaseScope.owner, "Content operator or chief of staff"),
    result_owner: textValue(roles.result_owner || confirmationScope.owner, "Content operator or chief of staff")
  };
}

async function ensureWeekTwoNextMaterial(
  input: {
    tenantId: string;
    userId?: string | null;
    targetWeek?: number;
    nextStep: "expand" | "reuse" | "update" | "leave";
    note: string;
    publicationResult: Record<string, unknown>;
    actionResult: Record<string, unknown>;
  },
  sourceContent: Record<string, unknown>
) {
  const target = input.actionResult.target && typeof input.actionResult.target === "object"
    ? input.actionResult.target as Record<string, unknown>
    : null;
  const targetType = textValue(input.actionResult.target_type ?? (input.actionResult.action as Record<string, unknown> | undefined)?.target_type, "");
  if (targetType === "content_item" && target?.id) return target;

  const sourceMetadata = sourceContent.metadata && typeof sourceContent.metadata === "object"
    ? sourceContent.metadata as Record<string, unknown>
    : {};
  const targetWeek = Number(input.targetWeek ?? 2);
  const title = weekTwoMaterialTitle(input.nextStep, textValue(input.publicationResult.title ?? sourceContent.title, "published material"), targetWeek);
  const contentType = input.nextStep === "expand" ? "article_outline" : textValue(sourceContent.content_type, "telegram_post");
  const channel = input.nextStep === "expand" ? "website" : textValue(sourceContent.channel ?? input.publicationResult.channel, "telegram");
  return insertJson("content_items", {
    demand_map_item_id: sourceContent.demand_map_item_id ?? null,
    title,
    content_type: contentType,
    channel,
    status: "idea",
    owner_id: sourceContent.owner_id ?? null,
    target_url: null,
    body_md: "",
    metadata: {
      source: `pilot_week_${targetWeek}_scope`,
      source_content_item_id: sourceContent.id ?? null,
      source_publication_result_id: input.publicationResult.id ?? null,
      next_step: input.nextStep,
      repair_decision: weekTwoRepairDecision(input.nextStep),
      brief: weekTwoMaterialBrief(input.nextStep, textValue(input.publicationResult.title ?? sourceContent.title, "published material"), targetWeek),
      proof: input.note,
      owner: sourceMetadata.owner ?? "Content operator or chief of staff",
      result_owner: sourceMetadata.result_owner ?? sourceMetadata.owner ?? "Content operator or chief of staff",
      created_by_command: `pilot.week_${targetWeek}.scope_created`,
      created_by: input.userId ?? null
    }
  }, input.tenantId);
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

async function executePilotPublicationResultDecision(input: {
  tenantId: string;
  userId?: string | null;
  publicationResult: Record<string, unknown>;
  nextStep: "expand" | "reuse" | "update" | "leave";
  note: string;
  decidedAt: string;
}) {
  return input.nextStep === "leave"
    ? markPublicationResultLeft({
        tenantId: input.tenantId,
        userId: input.userId,
        publicationResult: input.publicationResult,
        note: input.note,
        decidedAt: input.decidedAt
      })
    : executePublicationResultCommand({
        tenantId: input.tenantId,
        userId: input.userId,
        publicationResultId: String(input.publicationResult.id),
        command: input.nextStep,
        note: input.note
      });
}

async function patchPilotReviewBoardItem(tenantId: string, itemId: string, metadataKey: string, payload: Record<string, unknown>) {
  const result = await query("select * from publishing_calendar_items where id = $1 and tenant_id = $2", [itemId, tenantId]);
  const current = result.rows[0] ?? null;
  if (!current) return null;
  const metadata = current.metadata && typeof current.metadata === "object" ? current.metadata as Record<string, unknown> : {};
  return patchJson("publishing_calendar_items", itemId, {
    status: "published",
    metadata: {
      ...metadata,
      [metadataKey]: payload
    }
  }, tenantId);
}

async function completePilotTask(tenantId: string, taskType: string, targetId: string, payload: Record<string, unknown>) {
  const result = await query("select * from tasks where tenant_id = $1 order by created_at desc limit 300", [tenantId]);
  const task = result.rows.find((row) => row.task_type === taskType && row.target_id === targetId);
  if (!task?.id) return null;
  const metadata = task.payload && typeof task.payload === "object" ? task.payload as Record<string, unknown> : {};
  return patchJson("tasks", String(task.id), {
    status: "completed",
    payload: {
      ...metadata,
      ...payload,
      status: "completed"
    }
  }, tenantId);
}

async function completeWeekTwoMaterialExecution(tenantId: string, materialId: string, payload: Record<string, unknown>) {
  const result = await query("select * from content_items where id = $1 and tenant_id = $2", [materialId, tenantId]);
  const content = result.rows[0] ?? null;
  if (!content) return null;
  const metadata = content.metadata && typeof content.metadata === "object" ? content.metadata as Record<string, unknown> : {};
  const currentExecution = metadata.week_2_execution && typeof metadata.week_2_execution === "object"
    ? metadata.week_2_execution as Record<string, unknown>
    : {};
  return patchJson("content_items", materialId, {
    metadata: {
      ...metadata,
      week_2_execution: {
        ...currentExecution,
        ...payload,
        status: "completed"
      }
    }
  }, tenantId);
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
  return defaultPilotReviewNote(nextStep);
}

function defaultPilotReviewNote(nextStep: "expand" | "reuse" | "update" | "leave") {
  if (nextStep === "expand") return "Expand the strongest angle into a larger content piece.";
  if (nextStep === "reuse") return "Reuse the strongest paragraph as the next material.";
  if (nextStep === "update") return "Update the published material with confirmed reactions and owner notes.";
  return "Leave the material as published and keep the next week narrow.";
}

function weekTwoRepairDecision(nextStep: "expand" | "reuse" | "update" | "leave") {
  if (nextStep === "update") return "repair";
  if (nextStep === "leave") return "narrow";
  return "continue";
}

function weekTwoDecisionLabel(nextStep: "expand" | "reuse" | "update" | "leave") {
  if (nextStep === "expand") return "expand the proven angle";
  if (nextStep === "reuse") return "reuse the strongest paragraph";
  if (nextStep === "update") return "repair and update the published material";
  return "keep the scope narrow and run one clean loop";
}

function weekTwoMaterialTitle(nextStep: "expand" | "reuse" | "update" | "leave", sourceTitle: string, week = 2) {
  if (nextStep === "expand") return `Week ${week} expand: ${sourceTitle}`;
  if (nextStep === "reuse") return `Week ${week} reuse: ${sourceTitle}`;
  if (nextStep === "update") return `Week ${week} update brief: ${sourceTitle}`;
  return `Week ${week} controlled loop: ${sourceTitle}`;
}

function weekTwoMaterialBrief(nextStep: "expand" | "reuse" | "update" | "leave", sourceTitle: string, week = 2) {
  if (nextStep === "expand") return `Expand the strongest angle from "${sourceTitle}" into a larger article outline. Keep claims practical and proof-bound.`;
  if (nextStep === "reuse") return `Reuse the strongest paragraph from "${sourceTitle}" as a second material in the same channel.`;
  if (nextStep === "update") return `Prepare an update brief for "${sourceTitle}" with confirmed reactions, corrections, and owner notes.`;
  return `Run a narrow week-${week} loop after "${sourceTitle}" without adding a new channel or broadening claims.`;
}

function textValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
