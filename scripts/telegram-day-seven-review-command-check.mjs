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
