import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../../db/client.js";
import { createAgentTask } from "../agents/runner.js";
import { createApprovalRequest } from "../approvals/service.js";
import { recordOwnerActionAudit } from "../common/audit.js";
import { insertJson } from "../common/repository.js";

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

type WeekOnePilotInput = z.infer<typeof weekOnePilotBody> & {
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
  const result = await query("select * from tenants where id = $1", [tenantId]);
  const tenant = result.rows[0] ?? null;
  const settings = tenant?.settings && typeof tenant.settings === "object" ? { ...(tenant.settings as Record<string, unknown>) } : {};
  const currentState = settings.dashboard_state && typeof settings.dashboard_state === "object"
    ? settings.dashboard_state as Record<string, unknown>
    : {};
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
