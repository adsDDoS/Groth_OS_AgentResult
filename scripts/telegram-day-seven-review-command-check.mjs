#!/usr/bin/env node

import { existsSync, unlinkSync } from "node:fs";
import fastify from "fastify";

const tenantId = "00000000-0000-0000-0000-000000000001";
const otherTenantId = "00000000-0000-0000-0000-000000000002";
const localDataFile = `/tmp/agentresult-telegram-day-seven-review-${Date.now()}.json`;

process.env.AI_GROWTH_OS_STORAGE = "local";
process.env.AI_GROWTH_OS_LOCAL_DATA_FILE = localDataFile;

const { authPlugin } = await import("../apps/backend/dist/modules/auth/plugin.js");
const { registerRoutes } = await import("../apps/backend/dist/routes.js");
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
  const { response, data } = await inject("POST", "/telegram/commands", {
    command: "/pilot",
    note: `material: ${title}`
  }, selectedTenantId);
  assert(response.statusCode === 200, `telegram pilot start failed: ${response.statusCode} ${response.body}`);
  assert(data.text.includes("Week-1 pilot запущен"), "telegram pilot start text mismatch");
  return data.pilot;
}

async function confirmPublication(selectedTenantId, pilot, suffix) {
  const release = pilot.calendar.find((item) => String(item.title).startsWith("Day 4/5:"));
  assert(release?.id, "release calendar item missing");
  const handoff = await inject("POST", `/publishing/items/${release.id}/handoff`, { note: "Manager handed off" }, selectedTenantId);
  assert(handoff.response.statusCode === 200, `handoff failed: ${handoff.response.statusCode} ${handoff.response.body}`);
  const confirmed = await inject("POST", `/publishing/items/${release.id}/confirm-live`, {
    note: "Owner confirmed publication",
    publicationUrl: `https://t.me/agentresult/${suffix}`,
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
  assert(publicationResult?.id, "publication result missing");
  return publicationResult;
}

try {
  await query("insert into tenants (id, name, settings) values ($1, $2, $3) returning *", [
    otherTenantId,
    "Other Telegram Day-7 Tenant",
    {}
  ]);

  const pilot = await startPilot(tenantId, "Telegram Day-7 expand material");
  const publicationResult = await confirmPublication(tenantId, pilot, 801);
  const day7 = await inject("POST", "/telegram/commands", {
    command: "/day7 expand",
    targetId: publicationResult.id,
    note: "Expand because saves and comments justify week 2 article."
  }, tenantId);
  assert(day7.response.statusCode === 200, `telegram Day-7 command failed: ${day7.response.statusCode} ${day7.response.body}`);
  assert(day7.data.text.includes("Day-7 review закрыт"), "Day-7 command text mismatch");
  assert(day7.data.text.includes("расширить материал"), "Day-7 command next step text mismatch");
  assert(day7.data.text.includes("Week-2 scope создан"), "Day-7 command week-2 scope text mismatch");
  assert(day7.data.text.includes("Нужно согласовать scope"), "Day-7 command week-2 approval text mismatch");
  assert(day7.data.reviewResult?.decision?.next_step === "expand", "Day-7 command decision mismatch");
  assert(day7.data.reviewResult?.target?.content_type === "article_outline", "Day-7 command should create article outline");
  assert(day7.data.reviewResult?.week_2_scope?.next_material?.id === day7.data.reviewResult?.target?.id, "Day-7 command week-2 next material mismatch");
  assert(day7.data.reviewResult?.week_2_scope?.approval?.status === "pending", "Day-7 command week-2 approval missing");
  assert(day7.data.buttons?.some((button) => button.command === "osapprove" && button.targetId === day7.data.reviewResult.week_2_scope.approval.id), "Day-7 command week-2 approval button missing");
  assert(day7.data.ownerBrief?.publishedResults?.[0]?.nextStep === "expand", "owner brief publication result step mismatch");
  const blockedWeek2 = await inject("POST", "/telegram/commands", {
    command: "/week2",
    note: "Try before approving scope."
  }, tenantId);
  assert(blockedWeek2.response.statusCode === 200, `telegram week-2 blocked command failed: ${blockedWeek2.response.statusCode} ${blockedWeek2.response.body}`);
  assert(blockedWeek2.data.text.includes("сначала согласуйте"), "telegram week-2 should be blocked before approval");
  const approvedWeek2 = await inject("POST", "/telegram/actions", {
    action: "approval.approve",
    targetId: day7.data.reviewResult.week_2_scope.approval.id,
    note: "Approve week-2 scope from Telegram."
  }, tenantId);
  assert(approvedWeek2.response.statusCode === 200, `telegram week-2 scope approve failed: ${approvedWeek2.response.statusCode} ${approvedWeek2.response.body}`);
  assert(approvedWeek2.data.weekTwoExecution?.status === "started", "telegram scope approval should start week-2 execution");
  assert(approvedWeek2.data.weekTwoExecution?.task?.task_type === "pilot_week_2_execution", "telegram week-2 execution task missing");

  const week2Status = await inject("POST", "/telegram/commands", {
    command: "/week2_status"
  }, tenantId);
  assert(week2Status.response.statusCode === 200, `telegram week-2 status failed: ${week2Status.response.statusCode} ${week2Status.response.body}`);
  assert(week2Status.data.text.includes("согласование материала"), "telegram week-2 status should show material approval gate");
  assert(week2Status.data.text.includes("Доска:"), "telegram week-2 status should show board");
  assert(week2Status.data.buttons?.some((button) => button.command === "osapprove" && button.targetId === approvedWeek2.data.weekTwoExecution.approval.id), "telegram week-2 material approval button missing");

  const week2MaterialApproval = await inject("POST", "/telegram/actions", {
    action: "approval.approve",
    targetId: approvedWeek2.data.weekTwoExecution.approval.id,
    note: "Approve week-2 material from Telegram."
  }, tenantId);
  assert(week2MaterialApproval.response.statusCode === 200, `telegram week-2 material approve failed: ${week2MaterialApproval.response.statusCode} ${week2MaterialApproval.response.body}`);
  const week2QaStatus = await inject("POST", "/telegram/commands", {
    command: "/week2_status"
  }, tenantId);
  assert(week2QaStatus.data.text.includes("QA и передача на выпуск"), "telegram week-2 status should move to QA/release gate");
  const handoffButton = week2QaStatus.data.buttons?.find((button) => button.command === "handoff" && button.targetId);
  assert(handoffButton?.targetId, "telegram week-2 handoff button missing");

  const week2Handoff = await inject("POST", "/telegram/commands", {
    command: "/handoff",
    targetId: handoffButton.targetId,
    note: "Week-2 QA passed."
  }, tenantId);
  assert(week2Handoff.response.statusCode === 200, `telegram week-2 handoff failed: ${week2Handoff.response.statusCode} ${week2Handoff.response.body}`);
  const week2UrlStatus = await inject("POST", "/telegram/commands", {
    command: "/week2_status"
  }, tenantId);
  assert(week2UrlStatus.data.text.includes("подтверждение URL"), "telegram week-2 status should move to URL confirmation gate");

  const confirmedWeek2 = await inject("POST", `/publishing/items/${handoffButton.targetId}/confirm-live`, {
    note: "Week-2 URL confirmed.",
    publicationUrl: "https://t.me/agentresult/803",
    format: "telegram_post",
    primaryReactions: {
      comments: 1,
      reposts: 0,
      saves: 1,
      reactions: 4
    },
    nextStep: "reuse",
    nextStepNote: "Reuse week-2 proof."
  }, tenantId);
  assert(confirmedWeek2.response.statusCode === 200, `week-2 confirm-live failed: ${confirmedWeek2.response.statusCode} ${confirmedWeek2.response.body}`);
  const week2ReviewStatus = await inject("POST", "/telegram/commands", {
    command: "/week2_status"
  }, tenantId);
  assert(week2ReviewStatus.data.text.includes("review результата"), "telegram week-2 status should move to result review gate");
  assert(week2ReviewStatus.data.buttons?.some((button) => button.command === "reuse" && button.targetId), "telegram week-2 result review button missing");
  const week2ReviewButton = week2ReviewStatus.data.buttons.find((button) => button.command === "reuse" && button.targetId);
  const closedWeek2 = await inject("POST", "/telegram/commands", {
    command: "/reuse",
    targetId: week2ReviewButton.targetId,
    note: "Reuse week-2 proof into the next controlled scope."
  }, tenantId);
  assert(closedWeek2.response.statusCode === 200, `telegram week-2 review command failed: ${closedWeek2.response.statusCode} ${closedWeek2.response.body}`);
  assert(closedWeek2.data.text.includes("Week-2 review закрыт"), "telegram week-2 review close text missing");
  assert(closedWeek2.data.reviewResult?.week_3_scope?.approval?.scope === "pilot_week_3_scope", "telegram week-2 review should create week-3 scope");
  assert(closedWeek2.data.buttons?.some((button) => button.command === "osapprove" && button.targetId === closedWeek2.data.reviewResult.week_3_scope.approval.id), "telegram week-3 approval button missing");
  const blockedWeek3 = await inject("POST", "/telegram/commands", {
    command: "/week3",
    note: "Try before approving week-3 scope."
  }, tenantId);
  assert(blockedWeek3.response.statusCode === 200, `telegram week-3 blocked command failed: ${blockedWeek3.response.statusCode} ${blockedWeek3.response.body}`);
  assert(blockedWeek3.data.text.includes("сначала согласуйте"), "telegram week-3 should be blocked before approval");
  const approvedWeekThreeScope = await inject("POST", "/telegram/actions", {
    action: "approval.approve",
    targetId: closedWeek2.data.reviewResult.week_3_scope.approval.id,
    note: "Approve week-3 scope from Telegram."
  }, tenantId);
  assert(approvedWeekThreeScope.response.statusCode === 200, `telegram week-3 scope approve failed: ${approvedWeekThreeScope.response.statusCode} ${approvedWeekThreeScope.response.body}`);
  assert(approvedWeekThreeScope.data.result?.scope === "pilot_week_3_scope", "telegram week-3 scope approval result mismatch");
  assert(approvedWeekThreeScope.data.result?.status === "approved", "telegram week-3 scope approval status mismatch");
  assert(!approvedWeekThreeScope.data.weekTwoExecution, "telegram week-3 scope approval should not start week-2 execution");
  const weekThreeMaterialRows = await query("select * from content_items where id = $1 and tenant_id = $2", [closedWeek2.data.reviewResult.week_3_scope.next_material.id, tenantId]);
  assert(weekThreeMaterialRows.rows[0]?.metadata?.week_3_scope?.approval_status === "approved", "telegram approved week-3 material metadata missing");
  const startedWeek3 = await inject("POST", "/telegram/commands", {
    command: "/week3",
    note: "Start week-3 from Telegram."
  }, tenantId);
  assert(startedWeek3.response.statusCode === 200, `telegram week-3 start failed: ${startedWeek3.response.statusCode} ${startedWeek3.response.body}`);
  assert(startedWeek3.data.weekThreeExecution?.status === "started", "telegram week-3 command should start execution");
  assert(startedWeek3.data.weekThreeExecution?.task?.task_type === "pilot_week_3_execution", "telegram week-3 execution task missing");
  const week3Status = await inject("POST", "/telegram/commands", {
    command: "/week3_status"
  }, tenantId);
  assert(week3Status.response.statusCode === 200, `telegram week-3 status failed: ${week3Status.response.statusCode} ${week3Status.response.body}`);
  assert(week3Status.data.text.includes("Week-3 execution"), "telegram week-3 status title missing");
  assert(week3Status.data.text.includes("согласование материала"), "telegram week-3 status should show material approval gate");
  assert(week3Status.data.text.includes("Доска:"), "telegram week-3 status should show board");
  assert(week3Status.data.buttons?.some((button) => button.command === "osapprove" && button.targetId === startedWeek3.data.weekThreeExecution.approval.id), "telegram week-3 material approval button missing");
  const week3MaterialApproval = await inject("POST", "/telegram/actions", {
    action: "approval.approve",
    targetId: startedWeek3.data.weekThreeExecution.approval.id,
    note: "Approve week-3 material from Telegram."
  }, tenantId);
  assert(week3MaterialApproval.response.statusCode === 200, `telegram week-3 material approve failed: ${week3MaterialApproval.response.statusCode} ${week3MaterialApproval.response.body}`);
  const week3QaStatus = await inject("POST", "/telegram/commands", {
    command: "/w3"
  }, tenantId);
  assert(week3QaStatus.data.text.includes("QA и передача на выпуск"), "telegram week-3 status should move to QA/release gate");
  const week3HandoffButton = week3QaStatus.data.buttons?.find((button) => button.command === "handoff" && button.targetId);
  assert(week3HandoffButton?.targetId, "telegram week-3 handoff button missing");
  const week3Handoff = await inject("POST", "/telegram/commands", {
    command: "/handoff",
    targetId: week3HandoffButton.targetId,
    note: "Week-3 QA passed."
  }, tenantId);
  assert(week3Handoff.response.statusCode === 200, `telegram week-3 handoff failed: ${week3Handoff.response.statusCode} ${week3Handoff.response.body}`);
  const week3UrlStatus = await inject("POST", "/telegram/commands", {
    command: "/week3_status"
  }, tenantId);
  assert(week3UrlStatus.data.text.includes("подтверждение URL"), "telegram week-3 status should move to URL confirmation gate");
  const confirmedWeek3 = await inject("POST", `/publishing/items/${week3HandoffButton.targetId}/confirm-live`, {
    note: "Week-3 URL confirmed.",
    publicationUrl: "https://t.me/agentresult/805",
    format: "telegram_post",
    primaryReactions: {
      comments: 1,
      reposts: 0,
      saves: 2,
      reactions: 5
    },
    nextStep: "leave",
    nextStepNote: "Review week-3 result in product."
  }, tenantId);
  assert(confirmedWeek3.response.statusCode === 200, `week-3 confirm-live failed: ${confirmedWeek3.response.statusCode} ${confirmedWeek3.response.body}`);
  const week3ReviewStatus = await inject("POST", "/telegram/commands", {
    command: "/week3_status"
  }, tenantId);
  assert(week3ReviewStatus.data.text.includes("review результата"), "telegram week-3 status should move to result review gate");
  assert(week3ReviewStatus.data.buttons?.some((button) => button.command === "reuse" && button.targetId), "telegram week-3 result review button missing");

  const otherPilot = await startPilot(otherTenantId, "Telegram Day-7 leave material");
  const otherPublicationResult = await confirmPublication(otherTenantId, otherPilot, 802);
  const intent = await inject("POST", "/telegram/intent", {
    text: "закрой day-7 review, оставить как есть",
    note: "Leave as published."
  }, otherTenantId);
  assert(intent.response.statusCode === 200, `telegram Day-7 intent failed: ${intent.response.statusCode} ${intent.response.body}`);
  assert(intent.data.intent === "pilot_day_7_review", `Day-7 intent mismatch: ${intent.data.intent}`);
  assert(intent.data.reviewResult?.decision?.next_step === "leave", "Day-7 intent decision mismatch");
  assert(intent.data.reviewResult?.publication_result?.id === otherPublicationResult.id, "Day-7 intent publication result mismatch");
  assert(intent.data.reviewResult?.target === null, "Day-7 leave intent should not create target");
  assert(intent.data.reviewResult?.week_2_scope?.repair_decision === "narrow", "Day-7 leave intent week-2 scope mismatch");
  assert(intent.data.reviewResult?.week_2_scope?.approval?.status === "pending", "Day-7 leave intent week-2 approval missing");

  const firstTenantContent = await inject("GET", "/content/items", undefined, tenantId);
  assert(!firstTenantContent.data.some((item) => item.title === "Telegram Day-7 leave material"), "Day-7 intent leaked across tenants");

  console.log("Telegram Day-7 review command check passed");
} finally {
  await app.close();
  if (existsSync(localDataFile)) unlinkSync(localDataFile);
}
