#!/usr/bin/env node

import { existsSync, unlinkSync } from "node:fs";
import { randomUUID } from "node:crypto";

const tenantId = "00000000-0000-0000-0000-000000000001";
const userId = "77777777-7777-4777-8777-777777777771";
const localDataFile = `/tmp/agentresult-approval-side-effects-${Date.now()}.json`;

process.env.AI_GROWTH_OS_STORAGE = "local";
process.env.AI_GROWTH_OS_LOCAL_DATA_FILE = localDataFile;

const { query } = await import("../apps/backend/dist/db/client.js");
const { insertJson, listRows } = await import("../apps/backend/dist/modules/common/repository.js");
const {
  createApprovalRequest,
  decideApproval,
  reconcileApprovedCalendarApprovals
} = await import("../apps/backend/dist/modules/approvals/service.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const beforeExisting = await query(
    "select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 300",
    [tenantId]
  );
  const seededPackBefore = beforeExisting.rows.find((row) => row.title === "Недельный пакет публикаций AgentResult");
  assert(["draft", "review"].includes(String(seededPackBefore?.status)), `seeded calendar should start draft/review, saw ${seededPackBefore?.status}`);

  await reconcileApprovedCalendarApprovals(tenantId);

  const afterExisting = await query(
    "select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 300",
    [tenantId]
  );
  const seededPackAfter = afterExisting.rows.find((row) => row.id === seededPackBefore.id);
  assert(seededPackAfter?.status === "scheduled", `seeded approved calendar should reconcile to scheduled, saw ${seededPackAfter?.status}`);
  assert(seededPackAfter.metadata?.approval_id, "seeded reconciliation should attach approval_id metadata");
  assert(seededPackAfter.metadata?.decision_note, "seeded reconciliation should attach decision_note metadata");

  const calendar = await insertJson("publishing_calendar_items", {
    content_item_id: null,
    channel: "telegram",
    title: `Approval side-effect check ${randomUUID()}`,
    status: "review",
    scheduled_for: null,
    timezone: "Europe/Moscow",
    export_path: null,
    metadata: {}
  }, tenantId);

  const approval = await createApprovalRequest({
    tenantId,
    scope: "publish",
    targetType: "publishing_calendar_item",
    targetId: String(calendar.id),
    requestedBy: userId,
    summary: "Approval side-effect check"
  });

  await decideApproval({
    id: String(approval.id),
    tenantId,
    status: "approved",
    decidedBy: userId,
    decisionNote: "Approved by regression check"
  });

  const afterDecision = await query(
    "select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 300",
    [tenantId]
  );
  const decidedCalendar = afterDecision.rows.find((row) => row.id === calendar.id);
  assert(decidedCalendar?.status === "scheduled", `approved calendar decision should schedule item, saw ${decidedCalendar?.status}`);
  assert(decidedCalendar.metadata?.approval_id === approval.id, "decision side effect should attach approval_id");
  assert(decidedCalendar.metadata?.decision_note === "Approved by regression check", "decision side effect should attach decision_note");

  const auditRows = await listRows("integrations", { tenantId, limit: 200 });
  const approvalAudit = auditRows.find((row) =>
    row.provider === "owner_action_audit"
    && row.config?.action === "approval.approved"
    && row.config?.target_type === "approval"
    && row.config?.target_id === approval.id
    && row.config?.approval_target_id === calendar.id
  );
  assert(approvalAudit, "approval decision audit event missing");

  console.log("Approval side effects check passed");
} finally {
  if (existsSync(localDataFile)) unlinkSync(localDataFile);
}
