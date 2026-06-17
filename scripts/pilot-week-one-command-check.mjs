#!/usr/bin/env node

import { existsSync, unlinkSync } from "node:fs";
import fastify from "fastify";

const tenantId = "00000000-0000-0000-0000-000000000001";
const otherTenantId = "00000000-0000-0000-0000-000000000002";
const localDataFile = `/tmp/agentresult-pilot-week-one-command-${Date.now()}.json`;

process.env.AI_GROWTH_OS_STORAGE = "local";
process.env.AI_GROWTH_OS_LOCAL_DATA_FILE = localDataFile;

const { authPlugin } = await import("../apps/backend/dist/modules/auth/plugin.js");
const { registerRoutes } = await import("../apps/backend/dist/routes.js");
const { listRows } = await import("../apps/backend/dist/modules/common/repository.js");
const { query } = await import("../apps/backend/dist/db/client.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countByTenant(rows, expectedTenantId) {
  return rows.filter((row) => row.tenant_id === expectedTenantId).length;
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

try {
  const start = await app.inject({
    method: "POST",
    url: "/pilot/week-1/start",
    headers: { "x-tenant-id": tenantId },
    payload: {
      icp: "Founder-led B2B service or expert team that sells complex work through trust content.",
      channel: "telegram",
      materialTitle: "Как не терять выпуск контента между идеей и публикацией",
      approvalOwner: "Founder / managing partner",
      releaseOwner: "Content operator or chief of staff",
      resultOwner: "Content operator or chief of staff",
      resultSource: "Telegram URL, comments, reposts, saves, reactions, owner mark after 24 hours.",
      forbiddenClaims: "No guaranteed leads, no guaranteed revenue, no fake ROI."
    }
  });

  assert(start.statusCode === 200, `pilot command failed: ${start.statusCode} ${start.body}`);
  const data = start.json().data;
  assert(data.company?.tenant_id === tenantId, "company tenant mismatch");
  assert(data.demand?.tenant_id === tenantId, "demand tenant mismatch");
  assert(data.content?.tenant_id === tenantId, "content tenant mismatch");
  assert(data.content?.status === "review", `content status mismatch: ${data.content?.status}`);
  assert(data.content?.content_type === "telegram_post", `content type mismatch: ${data.content?.content_type}`);
  assert(String(data.content?.metadata?.brief || "").includes("topic boundary -> draft -> QA -> release -> URL -> next step"), "brief missing canonical loop");
  assert(data.approval?.tenant_id === tenantId, "approval tenant mismatch");
  assert(data.approval?.status === "pending", `approval status mismatch: ${data.approval?.status}`);
  assert(data.approval?.target_id === data.content.id, "approval target mismatch");
  assert(Array.isArray(data.calendar) && data.calendar.length === 6, `calendar length mismatch: ${data.calendar?.length}`);
  assert(data.calendar.every((item) => item.tenant_id === tenantId), "calendar tenant mismatch");
  assert(data.calendar.some((item) => String(item.title).startsWith("Day 7:") && item.status === "scheduled"), "Day 7 review item missing");
  assert(data.task?.tenant_id === tenantId, "task tenant mismatch");
  assert(data.task?.task_type === "pilot_day_7_review", `task type mismatch: ${data.task?.task_type}`);
  assert(data.workspace_state?.activePilotWorkspace?.material_id === data.content.id, "workspace material marker missing");
  assert(data.workspace_state?.activePilotWorkspace?.approval_id === data.approval.id, "workspace approval marker missing");
  assert(data.workspace_state?.activePilotWorkspace?.day_7_review_id, "workspace Day 7 marker missing");

  const contentRows = await query("select * from content_items where id = $1 and tenant_id = $2", [data.content.id, tenantId]);
  assert(contentRows.rows[0]?.id === data.content.id, "created content not queryable in tenant");
  const otherContentRows = await query("select * from content_items where id = $1 and tenant_id = $2", [data.content.id, otherTenantId]);
  assert(otherContentRows.rows.length === 0, "created content leaked to another tenant");

  const approvals = await listRows("approvals", { tenantId, limit: 200 });
  assert(approvals.some((row) => row.id === data.approval.id && row.target_id === data.content.id), "approval row missing");
  assert(countByTenant(approvals, otherTenantId) === 0, "approval list contains another tenant");

  const tasks = await query("select * from tasks where tenant_id = $1 order by created_at desc limit 200", [tenantId]);
  assert(tasks.rows.some((row) => row.id === data.task.id && row.target_id === data.content.id), "Day 7 task row missing");

  const audits = await listRows("integrations", { tenantId, limit: 200 });
  assert(
    audits.some((row) => row.provider === "owner_action_audit"
      && row.config?.action === "pilot.week_1.start"
      && row.config?.target_id === data.content.id
      && row.config?.source === "pilot_command"),
    "pilot start audit missing"
  );

  console.log("Pilot week-1 command check passed");
} finally {
  await app.close();
  if (existsSync(localDataFile)) unlinkSync(localDataFile);
}
