#!/usr/bin/env node

import { existsSync, unlinkSync } from "node:fs";
import fastify from "fastify";

const tenantId = "00000000-0000-0000-0000-000000000001";
const otherTenantId = "00000000-0000-0000-0000-000000000002";
const localDataFile = `/tmp/agentresult-pilot-day-seven-review-${Date.now()}.json`;

process.env.AI_GROWTH_OS_STORAGE = "local";
process.env.AI_GROWTH_OS_LOCAL_DATA_FILE = localDataFile;

const { authPlugin } = await import("../apps/backend/dist/modules/auth/plugin.js");
const { registerRoutes } = await import("../apps/backend/dist/routes.js");
const { listRows } = await import("../apps/backend/dist/modules/common/repository.js");
const { query } = await import("../apps/backend/dist/db/client.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const app = fastify({ logger: false });
await authPlugin(app);
await registerRoutes(app);
app.setErrorHandler((error, _request, reply) => {
  const normalizedError = error instanceof Error ? error : new Error("Unknown error");
  const statusCode = Number(normalizedError.statusCode ?? 500);
  reply.status(statusCode).send({
    error: normalizedError.name,
    message: normalizedError.message,
    code: normalizedError.code
  });
});

async function inject(method, url, payload, selectedTenantId = tenantId) {
  const response = await app.inject({
    method,
    url,
    headers: { "x-tenant-id": selectedTenantId },
    payload
  });
  const parsed = response.json();
  return { response, data: parsed.data, parsed };
}

async function startPilot(selectedTenantId, title) {
  const { response, data } = await inject("POST", "/pilot/week-1/start", {
    materialTitle: title,
    channel: "telegram"
  }, selectedTenantId);
  assert(response.statusCode === 200, `pilot start failed: ${response.statusCode} ${response.body}`);
  return data;
}

async function confirmPilotPublication(selectedTenantId, pilot, urlSuffix) {
  const release = pilot.calendar.find((item) => String(item.title).startsWith("Day 4/5:"));
  assert(release?.id, "release calendar item missing");
  const handoff = await inject("POST", `/publishing/items/${release.id}/handoff`, {
    note: "Manager handed off final text"
  }, selectedTenantId);
  assert(handoff.response.statusCode === 200, `handoff failed: ${handoff.response.statusCode} ${handoff.response.body}`);
  const confirmed = await inject("POST", `/publishing/items/${release.id}/confirm-live`, {
    note: "Owner confirmed live publication",
    publicationUrl: `https://t.me/agentresult/${urlSuffix}`,
    format: "telegram_post",
    primaryReactions: {
      comments: 2,
      reposts: 1,
      saves: 3,
      reactions: 8
    },
    nextStep: "leave",
    nextStepNote: "Wait for Day-7 review."
  }, selectedTenantId);
  assert(confirmed.response.statusCode === 200, `confirm-live failed: ${confirmed.response.statusCode} ${confirmed.response.body}`);
  const results = await inject("GET", "/publication-results", undefined, selectedTenantId);
  const publicationResult = results.data.find((item) => item.calendar_item_id === release.id);
  assert(publicationResult?.id, "publication result missing after confirm-live");
  return publicationResult;
}

async function assertReviewAudit(selectedTenantId, publicationResultId, nextStep) {
  const audits = await listRows("integrations", { tenantId: selectedTenantId, limit: 200 });
  assert(
    audits.some((row) => row.provider === "owner_action_audit"
      && row.config?.action === "pilot.week_1.day_7_review"
      && row.config?.target_id === publicationResultId
      && row.config?.next_step === nextStep),
    `Day-7 review audit missing for ${nextStep}`
  );
}

try {
  await query("insert into tenants (id, name, settings) values ($1, $2, $3) returning *", [
    otherTenantId,
    "Other Pilot Tenant",
    {}
  ]);

  const earlyPilot = await startPilot(tenantId, "Early Day-7 review should fail");
  const earlyReview = await inject("POST", "/pilot/week-1/day-7-review", {
    nextStep: "expand",
    note: "Should not close without publication result."
  }, tenantId);
  assert(earlyReview.response.statusCode === 409, `early Day-7 review should fail, saw ${earlyReview.response.statusCode}`);

  const earlyContentRows = await query("select * from content_items where id = $1 and tenant_id = $2", [earlyPilot.content.id, tenantId]);
  assert(earlyContentRows.rows[0]?.status === "review", "early failed review should not mutate content");

  const pilot = await startPilot(tenantId, "Day-7 expand review material");
  const publicationResult = await confirmPilotPublication(tenantId, pilot, 701);
  const expandReview = await inject("POST", "/pilot/week-1/day-7-review", {
    publicationResultId: publicationResult.id,
    nextStep: "expand",
    note: "Expand into a practical article for week 2.",
    ownerNotes: "Comments and saves justify a longer explanation."
  }, tenantId);
  assert(expandReview.response.statusCode === 200, `expand Day-7 review failed: ${expandReview.response.statusCode} ${expandReview.response.body}`);
  assert(expandReview.data.decision.next_step === "expand", "expand decision mismatch");
  assert(expandReview.data.action?.type === "expand", "expand action missing");
  assert(expandReview.data.target?.content_type === "article_outline", "expand should create article outline");
  assert(expandReview.data.day_7_review?.status === "published", "Day-7 calendar should be completed");
  assert(expandReview.data.day_7_review?.metadata?.day_7_review?.next_step === "expand", "Day-7 calendar decision missing");
  assert(expandReview.data.task?.status === "completed", "Day-7 task should be completed");
  assert(expandReview.data.workspace_state?.activePilotWorkspace?.day_7_review_decision === "expand", "workspace decision missing");
  assert(expandReview.data.week_2_scope?.decision === "expand", "expand week-2 scope decision missing");
  assert(expandReview.data.week_2_scope?.next_material?.id === expandReview.data.target?.id, "expand week-2 scope should reuse next content target");
  assert(expandReview.data.week_2_scope?.channel_constraint === "keep one proven channel for week 2: website", "expand week-2 channel constraint mismatch");
  assert(expandReview.data.week_2_scope?.board?.length === 5, `expand week-2 board length mismatch: ${expandReview.data.week_2_scope?.board?.length}`);
  assert(expandReview.data.week_2_scope?.roles?.approval_owner, "expand week-2 approval owner missing");
  assert(expandReview.data.week_2_scope?.task?.task_type === "pilot_week_2_scope", "expand week-2 scope task missing");
  assert(expandReview.data.workspace_state?.activePilotWorkspace?.week_2_scope?.next_material_id === expandReview.data.target?.id, "workspace week-2 next material missing");
  assert(expandReview.data.publication_result?.next_step === "expand", "publication result next step mismatch");
  await assertReviewAudit(tenantId, publicationResult.id, "expand");

  const pilotRows = await query("select * from publishing_calendar_items where id = $1 and tenant_id = $2", [pilot.calendar.find((item) => String(item.title).startsWith("Day 7:")).id, tenantId]);
  assert(pilotRows.rows[0]?.metadata?.day_7_review?.publication_result_id === publicationResult.id, "Day-7 metadata publication result mismatch");

  const reusePilot = await startPilot(tenantId, "Day-7 reuse review material");
  const reusePublicationResult = await confirmPilotPublication(tenantId, reusePilot, 703);
  const reuseReview = await inject("POST", "/pilot/week-1/day-7-review", {
    publicationResultId: reusePublicationResult.id,
    nextStep: "reuse",
    note: "Reuse the strongest paragraph as the next Telegram material."
  }, tenantId);
  assert(reuseReview.response.statusCode === 200, `reuse Day-7 review failed: ${reuseReview.response.statusCode} ${reuseReview.response.body}`);
  assert(reuseReview.data.week_2_scope?.decision === "reuse", "reuse week-2 scope decision missing");
  assert(reuseReview.data.week_2_scope?.next_material?.id === reuseReview.data.target?.id, "reuse week-2 scope should reuse next content target");
  assert(reuseReview.data.week_2_scope?.repair_decision === "continue", "reuse week-2 repair decision mismatch");
  assert(reuseReview.data.week_2_scope?.channel_constraint === "keep one proven channel for week 2: telegram", "reuse week-2 channel constraint mismatch");
  assert(reuseReview.data.week_2_scope?.board?.length === 5, "reuse week-2 board rows missing");

  const updatePilot = await startPilot(tenantId, "Day-7 update review material");
  const updatePublicationResult = await confirmPilotPublication(tenantId, updatePilot, 704);
  const updateReview = await inject("POST", "/pilot/week-1/day-7-review", {
    publicationResultId: updatePublicationResult.id,
    nextStep: "update",
    note: "Update the published material with confirmed corrections."
  }, tenantId);
  assert(updateReview.response.statusCode === 200, `update Day-7 review failed: ${updateReview.response.statusCode} ${updateReview.response.body}`);
  assert(updateReview.data.target_type === "task", "update should keep publication update target as task");
  assert(updateReview.data.week_2_scope?.decision === "update", "update week-2 scope decision missing");
  assert(updateReview.data.week_2_scope?.repair_decision === "repair", "update week-2 repair decision mismatch");
  assert(updateReview.data.week_2_scope?.next_material?.title === "Week 2 update brief: Day 4/5: Telegram post released and URL confirmed", "update week-2 next material title mismatch");
  assert(updateReview.data.week_2_scope?.channel_constraint === "keep one proven channel for week 2: telegram", "update week-2 channel constraint mismatch");
  assert(updateReview.data.week_2_scope?.board?.length === 5, "update week-2 board rows missing");

  const leavePilot = await startPilot(otherTenantId, "Day-7 leave review material");
  const leavePublicationResult = await confirmPilotPublication(otherTenantId, leavePilot, 702);
  const leaveReview = await inject("POST", "/pilot/week-1/day-7-review", {
    publicationResultId: leavePublicationResult.id,
    nextStep: "leave",
    note: "Leave as published and keep week 2 narrow."
  }, otherTenantId);
  assert(leaveReview.response.statusCode === 200, `leave Day-7 review failed: ${leaveReview.response.statusCode} ${leaveReview.response.body}`);
  assert(leaveReview.data.decision.next_step === "leave", "leave decision mismatch");
  assert(leaveReview.data.action?.type === "leave", "leave action missing");
  assert(leaveReview.data.target === null, "leave should not create a target");
  assert(leaveReview.data.week_2_scope?.decision === "leave", "leave week-2 scope decision missing");
  assert(leaveReview.data.week_2_scope?.next_material?.content_type === "telegram_post", "leave week-2 scope should create a next Telegram material");
  assert(leaveReview.data.week_2_scope?.repair_decision === "narrow", "leave week-2 repair decision mismatch");
  assert(leaveReview.data.week_2_scope?.channel_constraint === "keep one proven channel for week 2: telegram", "leave week-2 channel constraint mismatch");
  assert(leaveReview.data.workspace_state?.activePilotWorkspace?.week_2_scope?.decision === "leave", "leave workspace week-2 scope missing");
  assert(leaveReview.data.publication_result?.next_step === "leave", "leave publication result next step mismatch");
  const leaveWeekTwoCalendarRows = await query("select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 200", [otherTenantId]);
  assert(leaveWeekTwoCalendarRows.rows.filter((item) => item.metadata?.week_2_scope?.decision === "leave").length === 5, "leave week-2 board rows missing");
  await assertReviewAudit(otherTenantId, leavePublicationResult.id, "leave");

  const otherTenantContent = await inject("GET", "/content/items", undefined, otherTenantId);
  assert(!otherTenantContent.data.some((item) => item.title === "Expand: Day-7 expand review material"), "expand target leaked across tenants");

  console.log("Pilot Day-7 review command check passed");
} finally {
  await app.close();
  if (existsSync(localDataFile)) unlinkSync(localDataFile);
}
