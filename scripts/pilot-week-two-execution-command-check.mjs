#!/usr/bin/env node

import { existsSync, unlinkSync } from "node:fs";
import fastify from "fastify";

const tenantId = "00000000-0000-0000-0000-000000000001";
const otherTenantId = "00000000-0000-0000-0000-000000000002";
const localDataFile = `/tmp/agentresult-pilot-week-two-execution-${Date.now()}.json`;

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

try {
  await query("insert into tenants (id, name, settings) values ($1, $2, $3) returning *", [
    otherTenantId,
    "Other Week-2 Execution Tenant",
    {}
  ]);

  const pilot = await startPilot(tenantId, "Week-2 execution material");
  const publicationResult = await confirmPilotPublication(tenantId, pilot, 901);
  const review = await inject("POST", "/pilot/week-1/day-7-review", {
    publicationResultId: publicationResult.id,
    nextStep: "reuse",
    note: "Reuse the strongest paragraph in week 2."
  }, tenantId);
  assert(review.response.statusCode === 200, `Day-7 review failed: ${review.response.statusCode} ${review.response.body}`);
  assert(review.data.week_2_scope?.approval?.status === "pending", "week-2 scope approval missing");

  const blockedStart = await inject("POST", "/pilot/week-2/start", {
    note: "Should not start before scope approval."
  }, tenantId);
  assert(blockedStart.response.statusCode === 409, `week-2 start should be blocked before approval, saw ${blockedStart.response.statusCode}`);

  const approval = await inject("POST", `/approvals/${review.data.week_2_scope.approval.id}/approve`, {
    note: "Week-2 scope approved."
  }, tenantId);
  assert(approval.response.statusCode === 200, `scope approve failed: ${approval.response.statusCode} ${approval.response.body}`);

  const started = await inject("POST", "/pilot/week-2/start", {
    note: "Start approved week-2 production."
  }, tenantId);
  assert(started.response.statusCode === 200, `week-2 start failed: ${started.response.statusCode} ${started.response.body}`);
  assert(started.data.status === "started", "week-2 start status mismatch");
  assert(started.data.content?.id === review.data.week_2_scope.next_material.id, "week-2 start content mismatch");
  assert(started.data.content?.status === "review", "week-2 content should move into review");
  assert(started.data.content?.metadata?.week_2_execution?.status === "started", "week-2 content execution metadata missing");
  assert(started.data.task?.task_type === "pilot_week_2_execution", "week-2 execution task missing");
  assert(started.data.approval?.scope === "social_post", "week-2 material approval missing");
  assert(started.data.approval?.status === "pending", "week-2 material approval should be pending");
  assert(started.data.board?.length === 5, "week-2 board should be returned");
  assert(started.data.board.some((item) => item.title.includes("Day 8") && item.status === "published"), "week-2 Day 8 should be marked started");
  assert(started.data.workspace_state?.activePilotWorkspace?.mode === "week_2", "workspace mode should be week_2");
  assert(started.data.workspace_state?.activePilotWorkspace?.week_2_execution?.status === "started", "workspace week-2 execution marker missing");

  const repeated = await inject("POST", "/pilot/week-2/start", {
    note: "Idempotent repeat."
  }, tenantId);
  assert(repeated.response.statusCode === 200, `week-2 repeated start failed: ${repeated.response.statusCode} ${repeated.response.body}`);
  assert(repeated.data.status === "already_started", "week-2 repeated start should be idempotent");
  assert(repeated.data.task?.id === started.data.task.id, "week-2 repeated start should reuse execution task");

  const audits = await listRows("integrations", { tenantId, limit: 300 });
  assert(
    audits.some((row) => row.provider === "owner_action_audit"
      && row.config?.action === "pilot.week_2.start"
      && row.config?.target_id === started.data.content.id),
    "week-2 start audit missing"
  );

  const otherPilot = await startPilot(otherTenantId, "Other tenant week-2 execution material");
  const otherPublicationResult = await confirmPilotPublication(otherTenantId, otherPilot, 902);
  const otherReview = await inject("POST", "/pilot/week-1/day-7-review", {
    publicationResultId: otherPublicationResult.id,
    nextStep: "leave",
    note: "Leave and run a narrow week 2."
  }, otherTenantId);
  await inject("POST", `/approvals/${otherReview.data.week_2_scope.approval.id}/approve`, {
    note: "Other tenant scope approved."
  }, otherTenantId);
  const otherStarted = await inject("POST", "/pilot/week-2/start", {}, otherTenantId);
  assert(otherStarted.response.statusCode === 200, `other tenant week-2 start failed: ${otherStarted.response.statusCode} ${otherStarted.response.body}`);
  assert(otherStarted.data.content?.id !== started.data.content?.id, "week-2 execution leaked content across tenants");

  console.log("Pilot week-2 execution command check passed");
} finally {
  await app.close();
  if (existsSync(localDataFile)) unlinkSync(localDataFile);
}
