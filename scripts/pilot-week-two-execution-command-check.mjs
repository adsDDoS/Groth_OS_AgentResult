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

  const activeExecution = await inject("GET", "/pilot/week-2/execution", undefined, tenantId);
  assert(activeExecution.response.statusCode === 200, `week-2 execution view failed: ${activeExecution.response.statusCode} ${activeExecution.response.body}`);
  assert(activeExecution.data?.status === "active", "week-2 execution view should be active");
  assert(activeExecution.data?.current_gate === "material_approval", "week-2 execution should wait for material approval first");
  assert(activeExecution.data?.material?.id === started.data.content.id, "week-2 execution view material mismatch");
  assert(activeExecution.data?.material_approval?.id === started.data.approval.id, "week-2 execution material approval mismatch");
  assert(activeExecution.data?.board?.length === 5, "week-2 execution view board missing");
  assert(activeExecution.data?.roles?.release_owner, "week-2 execution view release owner missing");
  assert(activeExecution.data?.actions?.approve_material?.approval_id === started.data.approval.id, "week-2 execution approve material action mismatch");
  assert(activeExecution.data?.actions?.handoff_release?.calendar_item_id, "week-2 execution handoff action missing");
  assert(activeExecution.data?.actions?.confirm_url?.calendar_item_id, "week-2 execution confirm URL action missing");

  const materialApproval = await inject("POST", `/approvals/${started.data.approval.id}/approve`, {
    note: "Week-2 material approved."
  }, tenantId);
  assert(materialApproval.response.statusCode === 200, `material approval failed: ${materialApproval.response.statusCode} ${materialApproval.response.body}`);
  const afterMaterialApproval = await inject("GET", "/pilot/week-2/execution", undefined, tenantId);
  assert(afterMaterialApproval.data?.current_gate === "qa_release_handoff", "week-2 execution should move to QA/release after material approval");

  const handoffCalendarId = afterMaterialApproval.data.actions.handoff_release.calendar_item_id;
  const weekTwoHandoff = await inject("POST", `/publishing/items/${handoffCalendarId}/handoff`, {
    note: "Week-2 QA passed and final text handed off."
  }, tenantId);
  assert(weekTwoHandoff.response.statusCode === 200, `week-2 handoff failed: ${weekTwoHandoff.response.statusCode} ${weekTwoHandoff.response.body}`);
  const afterHandoff = await inject("GET", "/pilot/week-2/execution", undefined, tenantId);
  assert(afterHandoff.data?.current_gate === "url_confirmation", "week-2 execution should move to URL confirmation after handoff");

  const weekTwoConfirmed = await inject("POST", `/publishing/items/${handoffCalendarId}/confirm-live`, {
    note: "Week-2 publication confirmed live.",
    publicationUrl: "https://t.me/agentresult/903",
    format: "telegram_post",
    primaryReactions: {
      comments: 1,
      reposts: 0,
      saves: 2,
      reactions: 6
    },
    nextStep: "reuse",
    nextStepNote: "Reuse week-2 proof in the next material."
  }, tenantId);
  assert(weekTwoConfirmed.response.statusCode === 200, `week-2 confirm-live failed: ${weekTwoConfirmed.response.statusCode} ${weekTwoConfirmed.response.body}`);
  const afterConfirmation = await inject("GET", "/pilot/week-2/execution", undefined, tenantId);
  assert(afterConfirmation.data?.current_gate === "result_review", "week-2 execution should move to result review after URL confirmation");
  assert(afterConfirmation.data?.publication_result?.publication_url === "https://t.me/agentresult/903", "week-2 execution result URL mismatch");
  assert(afterConfirmation.data?.actions?.review_result?.publication_result_id, "week-2 execution review action missing");

  const weekTwoReview = await inject("POST", "/pilot/week-2/review", {
    publicationResultId: afterConfirmation.data.actions.review_result.publication_result_id,
    nextStep: "expand",
    note: "Expand week-2 proof into the next controlled scope."
  }, tenantId);
  assert(weekTwoReview.response.statusCode === 200, `week-2 review failed: ${weekTwoReview.response.statusCode} ${weekTwoReview.response.body}`);
  assert(weekTwoReview.data?.decision?.next_step === "expand", "week-2 review decision mismatch");
  assert(weekTwoReview.data?.week_3_scope?.approval?.scope === "pilot_week_3_scope", "week-3 scope approval missing");
  assert(weekTwoReview.data?.week_3_scope?.board?.length === 5, "week-3 scope board missing");
  assert(weekTwoReview.data?.week_3_scope?.next_material?.id, "week-3 next material missing");
  assert(weekTwoReview.data?.workspace_state?.activePilotWorkspace?.week_2_execution?.status === "completed", "workspace week-2 execution should be completed");
  assert(weekTwoReview.data?.workspace_state?.activePilotWorkspace?.week_3_scope?.approval_id === weekTwoReview.data.week_3_scope.approval.id, "workspace week-3 approval id mismatch");
  assert(weekTwoReview.data?.week_2_review?.status === "published", "week-2 review board item should be completed");
  const reviewedMaterialRows = await query("select * from content_items where id = $1 and tenant_id = $2", [started.data.content.id, tenantId]);
  assert(reviewedMaterialRows.rows[0]?.metadata?.week_2_execution?.status === "completed", "week-2 material execution metadata should be completed");
  const blockedWeekThreeStart = await inject("POST", "/pilot/week-3/start", {
    note: "Should not start before week-3 scope approval."
  }, tenantId);
  assert(blockedWeekThreeStart.response.statusCode === 409, `week-3 start should be blocked before approval, saw ${blockedWeekThreeStart.response.statusCode}`);
  const approveWeekThree = await inject("POST", `/approvals/${weekTwoReview.data.week_3_scope.approval.id}/approve`, {
    note: "Approve week-3 scope from operator."
  }, tenantId);
  assert(approveWeekThree.response.statusCode === 200, `week-3 scope approve failed: ${approveWeekThree.response.statusCode} ${approveWeekThree.response.body}`);
  const approvedWeekThreeMaterialRows = await query("select * from content_items where id = $1 and tenant_id = $2", [weekTwoReview.data.week_3_scope.next_material.id, tenantId]);
  assert(approvedWeekThreeMaterialRows.rows[0]?.metadata?.week_3_scope?.approval_status === "approved", "approved week-3 content metadata missing");
  const approvedWeekThreeBoardRows = await query("select * from publishing_calendar_items where tenant_id = $1 order by created_at desc limit 300", [tenantId]);
  assert(approvedWeekThreeBoardRows.rows.some((item) => item.metadata?.week_3_scope?.approval_status === "approved" && item.content_item_id === weekTwoReview.data.week_3_scope.next_material.id), "approved week-3 board metadata missing");
  const approvedWeekThreeWorkspaceRows = await query("select * from tenants where id = $1", [tenantId]);
  assert(approvedWeekThreeWorkspaceRows.rows[0]?.settings?.dashboard_state?.activePilotWorkspace?.week_3_scope?.approval_status === "approved", "approved week-3 workspace metadata missing");
  const startedWeekThree = await inject("POST", "/pilot/week-3/start", {
    note: "Start approved week-3 production."
  }, tenantId);
  assert(startedWeekThree.response.statusCode === 200, `week-3 start failed: ${startedWeekThree.response.statusCode} ${startedWeekThree.response.body}`);
  assert(startedWeekThree.data.status === "started", "week-3 start status mismatch");
  assert(startedWeekThree.data.content?.id === weekTwoReview.data.week_3_scope.next_material.id, "week-3 start content mismatch");
  assert(startedWeekThree.data.content?.metadata?.week_3_execution?.status === "started", "week-3 content execution metadata missing");
  assert(startedWeekThree.data.task?.task_type === "pilot_week_3_execution", "week-3 execution task missing");
  assert(startedWeekThree.data.approval?.scope === "social_post", "week-3 material approval missing");
  assert(startedWeekThree.data.board?.length === 5, "week-3 board should be returned");
  assert(startedWeekThree.data.board.some((item) => item.title.includes("Day 15") && item.status === "published"), "week-3 Day 15 should be marked started");
  assert(startedWeekThree.data.workspace_state?.activePilotWorkspace?.mode === "week_3", "workspace mode should be week_3");
  assert(startedWeekThree.data.workspace_state?.activePilotWorkspace?.week_3_execution?.status === "started", "workspace week-3 execution marker missing");
  const activeWeekThree = await inject("GET", "/pilot/week-3/execution", undefined, tenantId);
  assert(activeWeekThree.response.statusCode === 200, `week-3 execution view failed: ${activeWeekThree.response.statusCode} ${activeWeekThree.response.body}`);
  assert(activeWeekThree.data?.status === "active", "week-3 execution view should be active");
  assert(activeWeekThree.data?.week === 3, "week-3 execution view week marker mismatch");
  assert(activeWeekThree.data?.current_gate === "material_approval", "week-3 execution should wait for material approval first");
  assert(activeWeekThree.data?.material?.id === startedWeekThree.data.content.id, "week-3 execution view material mismatch");
  assert(activeWeekThree.data?.material_approval?.id === startedWeekThree.data.approval.id, "week-3 execution material approval mismatch");
  assert(activeWeekThree.data?.board?.length === 5, "week-3 execution view board missing");
  assert(activeWeekThree.data?.roles?.release_owner, "week-3 execution view release owner missing");
  assert(activeWeekThree.data?.actions?.approve_material?.approval_id === startedWeekThree.data.approval.id, "week-3 execution approve material action mismatch");
  assert(activeWeekThree.data?.actions?.handoff_release?.calendar_item_id, "week-3 execution handoff action missing");
  assert(activeWeekThree.data?.actions?.confirm_url?.calendar_item_id, "week-3 execution confirm URL action missing");
  const earlyWeekThreeReview = await inject("POST", "/pilot/week-3/review", {
    nextStep: "reuse",
    note: "Should not close before URL confirmation."
  }, tenantId);
  assert(earlyWeekThreeReview.response.statusCode === 409, `week-3 review should be blocked before confirmed URL, saw ${earlyWeekThreeReview.response.statusCode}`);
  const weekThreeMaterialApproval = await inject("POST", `/approvals/${startedWeekThree.data.approval.id}/approve`, {
    note: "Week-3 material approved."
  }, tenantId);
  assert(weekThreeMaterialApproval.response.statusCode === 200, `week-3 material approval failed: ${weekThreeMaterialApproval.response.statusCode} ${weekThreeMaterialApproval.response.body}`);
  const weekThreeAfterMaterialApproval = await inject("GET", "/pilot/week-3/execution", undefined, tenantId);
  assert(weekThreeAfterMaterialApproval.data?.current_gate === "qa_release_handoff", "week-3 execution should move to QA/release after material approval");
  const weekThreeHandoffCalendarId = weekThreeAfterMaterialApproval.data.actions.handoff_release.calendar_item_id;
  const weekThreeHandoff = await inject("POST", `/publishing/items/${weekThreeHandoffCalendarId}/handoff`, {
    note: "Week-3 QA passed and final text handed off."
  }, tenantId);
  assert(weekThreeHandoff.response.statusCode === 200, `week-3 handoff failed: ${weekThreeHandoff.response.statusCode} ${weekThreeHandoff.response.body}`);
  const weekThreeAfterHandoff = await inject("GET", "/pilot/week-3/execution", undefined, tenantId);
  assert(weekThreeAfterHandoff.data?.current_gate === "url_confirmation", "week-3 execution should move to URL confirmation after handoff");
  const weekThreeConfirmed = await inject("POST", `/publishing/items/${weekThreeHandoffCalendarId}/confirm-live`, {
    note: "Week-3 publication confirmed live.",
    publicationUrl: "https://t.me/agentresult/905",
    format: "telegram_post",
    primaryReactions: {
      comments: 2,
      reposts: 0,
      saves: 3,
      reactions: 7
    },
    nextStep: "reuse",
    nextStepNote: "Reuse week-3 proof in the next scope."
  }, tenantId);
  assert(weekThreeConfirmed.response.statusCode === 200, `week-3 confirm-live failed: ${weekThreeConfirmed.response.statusCode} ${weekThreeConfirmed.response.body}`);
  const weekThreeAfterConfirmation = await inject("GET", "/pilot/week-3/execution", undefined, tenantId);
  assert(weekThreeAfterConfirmation.data?.current_gate === "result_review", "week-3 execution should move to result review after URL confirmation");
  assert(weekThreeAfterConfirmation.data?.actions?.review_result?.publication_result_id, "week-3 execution review action missing");
  const weekThreeReview = await inject("POST", "/pilot/week-3/review", {
    publicationResultId: weekThreeAfterConfirmation.data.actions.review_result.publication_result_id,
    nextStep: "reuse",
    note: "Reuse week-3 proof into week-4 scope."
  }, tenantId);
  assert(weekThreeReview.response.statusCode === 200, `week-3 review failed: ${weekThreeReview.response.statusCode} ${weekThreeReview.response.body}`);
  assert(weekThreeReview.data?.decision?.next_step === "reuse", "week-3 review decision mismatch");
  assert(weekThreeReview.data?.week_4_scope?.approval?.scope === "pilot_week_4_scope", "week-4 scope approval missing");
  assert(weekThreeReview.data?.week_4_scope?.board?.length === 5, "week-4 scope board missing");
  assert(weekThreeReview.data?.week_4_scope?.next_material?.id, "week-4 next material missing");
  assert(weekThreeReview.data?.workspace_state?.activePilotWorkspace?.week_3_execution?.status === "completed", "workspace week-3 execution should be completed");
  assert(weekThreeReview.data?.workspace_state?.activePilotWorkspace?.week_4_scope?.approval_id === weekThreeReview.data.week_4_scope.approval.id, "workspace week-4 approval id mismatch");
  assert(weekThreeReview.data?.week_3_review?.status === "published", "week-3 review board item should be completed");
  const reviewedWeekThreeMaterialRows = await query("select * from content_items where id = $1 and tenant_id = $2", [startedWeekThree.data.content.id, tenantId]);
  assert(reviewedWeekThreeMaterialRows.rows[0]?.metadata?.week_3_execution?.status === "completed", "week-3 material execution metadata should be completed");
  const blockedWeekFourStart = await inject("POST", "/pilot/week-4/start", {
    note: "Should not start before week-4 scope approval."
  }, tenantId);
  assert(blockedWeekFourStart.response.statusCode === 409, `week-4 start should be blocked before approval, saw ${blockedWeekFourStart.response.statusCode}`);
  const approveWeekFour = await inject("POST", `/approvals/${weekThreeReview.data.week_4_scope.approval.id}/approve`, {
    note: "Approve week-4 scope from operator."
  }, tenantId);
  assert(approveWeekFour.response.statusCode === 200, `week-4 scope approve failed: ${approveWeekFour.response.statusCode} ${approveWeekFour.response.body}`);
  const approvedWeekFourMaterialRows = await query("select * from content_items where id = $1 and tenant_id = $2", [weekThreeReview.data.week_4_scope.next_material.id, tenantId]);
  assert(approvedWeekFourMaterialRows.rows[0]?.metadata?.week_4_scope?.approval_status === "approved", "approved week-4 content metadata missing");
  const approvedWeekFourBoardRows = await query("select * from publishing_calendar_items where tenant_id = $1 order by created_at desc limit 300", [tenantId]);
  assert(approvedWeekFourBoardRows.rows.some((item) => item.metadata?.week_4_scope?.approval_status === "approved" && item.content_item_id === weekThreeReview.data.week_4_scope.next_material.id), "approved week-4 board metadata missing");
  const approvedWeekFourWorkspaceRows = await query("select * from tenants where id = $1", [tenantId]);
  assert(approvedWeekFourWorkspaceRows.rows[0]?.settings?.dashboard_state?.activePilotWorkspace?.week_4_scope?.approval_status === "approved", "approved week-4 workspace metadata missing");
  const startedWeekFour = await inject("POST", "/pilot/week-4/start", {
    note: "Start approved week-4 production."
  }, tenantId);
  assert(startedWeekFour.response.statusCode === 200, `week-4 start failed: ${startedWeekFour.response.statusCode} ${startedWeekFour.response.body}`);
  assert(startedWeekFour.data.status === "started", "week-4 start status mismatch");
  assert(startedWeekFour.data.content?.id === weekThreeReview.data.week_4_scope.next_material.id, "week-4 start content mismatch");
  assert(startedWeekFour.data.content?.metadata?.week_4_execution?.status === "started", "week-4 content execution metadata missing");
  assert(startedWeekFour.data.task?.task_type === "pilot_week_4_execution", "week-4 execution task missing");
  assert(startedWeekFour.data.approval?.scope === "social_post", "week-4 material approval missing");
  assert(startedWeekFour.data.board?.length === 5, "week-4 board should be returned");
  assert(startedWeekFour.data.board.some((item) => item.title.includes("Day 22") && item.status === "published"), "week-4 Day 22 should be marked started");
  assert(startedWeekFour.data.workspace_state?.activePilotWorkspace?.mode === "week_4", "workspace mode should be week_4");
  assert(startedWeekFour.data.workspace_state?.activePilotWorkspace?.week_4_execution?.status === "started", "workspace week-4 execution marker missing");
  const activeWeekFour = await inject("GET", "/pilot/week-4/execution", undefined, tenantId);
  assert(activeWeekFour.response.statusCode === 200, `week-4 execution view failed: ${activeWeekFour.response.statusCode} ${activeWeekFour.response.body}`);
  assert(activeWeekFour.data?.status === "active", "week-4 execution view should be active");
  assert(activeWeekFour.data?.week === 4, "week-4 execution view week marker mismatch");
  assert(activeWeekFour.data?.current_gate === "material_approval", "week-4 execution should wait for material approval first");
  assert(activeWeekFour.data?.material?.id === startedWeekFour.data.content.id, "week-4 execution view material mismatch");
  assert(activeWeekFour.data?.material_approval?.id === startedWeekFour.data.approval.id, "week-4 execution material approval mismatch");
  assert(activeWeekFour.data?.board?.length === 5, "week-4 execution view board missing");
  assert(activeWeekFour.data?.roles?.release_owner, "week-4 execution view release owner missing");
  assert(activeWeekFour.data?.actions?.approve_material?.approval_id === startedWeekFour.data.approval.id, "week-4 execution approve material action mismatch");
  assert(activeWeekFour.data?.actions?.handoff_release?.calendar_item_id, "week-4 execution handoff action missing");
  assert(activeWeekFour.data?.actions?.confirm_url?.calendar_item_id, "week-4 execution confirm URL action missing");

  const repeated = await inject("POST", "/pilot/week-2/start", {
    note: "Idempotent repeat."
  }, tenantId);
  assert(repeated.response.statusCode === 200, `week-2 repeated start failed: ${repeated.response.statusCode} ${repeated.response.body}`);
  assert(repeated.data.status === "already_completed", "week-2 repeated start should stay completed after review");
  assert(repeated.data.task?.id === started.data.task.id, "week-2 repeated start should reuse execution task");

  const audits = await listRows("integrations", { tenantId, limit: 300 });
  assert(
    audits.some((row) => row.provider === "owner_action_audit"
      && row.config?.action === "pilot.week_2.start"
      && row.config?.target_id === started.data.content.id),
    "week-2 start audit missing"
  );
  assert(
    audits.some((row) => row.provider === "owner_action_audit"
      && row.config?.action === "pilot.week_3.start"
      && row.config?.target_id === startedWeekThree.data.content.id),
    "week-3 start audit missing"
  );
  assert(
    audits.some((row) => row.provider === "owner_action_audit"
      && row.config?.action === "pilot.week_3.review"
      && row.config?.target_id === weekThreeAfterConfirmation.data.actions.review_result.publication_result_id),
    "week-3 review audit missing"
  );
  assert(
    audits.some((row) => row.provider === "owner_action_audit"
      && row.config?.action === "pilot.week_4.start"
      && row.config?.target_id === startedWeekFour.data.content.id),
    "week-4 start audit missing"
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
  const otherMaterialApproval = await inject("POST", `/approvals/${otherStarted.data.approval.id}/approve`, {
    note: "Other tenant week-2 material approved."
  }, otherTenantId);
  assert(otherMaterialApproval.response.statusCode === 200, `other tenant material approval failed: ${otherMaterialApproval.response.statusCode} ${otherMaterialApproval.response.body}`);
  const otherAfterMaterialApproval = await inject("GET", "/pilot/week-2/execution", undefined, otherTenantId);
  const otherHandoffCalendarId = otherAfterMaterialApproval.data.actions.handoff_release.calendar_item_id;
  await inject("POST", `/publishing/items/${otherHandoffCalendarId}/handoff`, {
    note: "Other tenant week-2 handoff."
  }, otherTenantId);
  await inject("POST", `/publishing/items/${otherHandoffCalendarId}/confirm-live`, {
    note: "Other tenant week-2 publication confirmed.",
    publicationUrl: "https://t.me/agentresult/904",
    format: "telegram_post",
    primaryReactions: {
      comments: 1,
      reposts: 0,
      saves: 1,
      reactions: 3
    },
    nextStep: "reuse",
    nextStepNote: "Reuse other tenant week-2 proof."
  }, otherTenantId);
  const otherAfterConfirmation = await inject("GET", "/pilot/week-2/execution", undefined, otherTenantId);
  const otherWeekTwoReview = await inject("POST", "/pilot/week-2/review", {
    publicationResultId: otherAfterConfirmation.data.actions.review_result.publication_result_id,
    nextStep: "reuse",
    note: "Reuse other tenant week-2 proof."
  }, otherTenantId);
  assert(otherWeekTwoReview.response.statusCode === 200, `other tenant week-2 review failed: ${otherWeekTwoReview.response.statusCode} ${otherWeekTwoReview.response.body}`);
  const changeWeekThree = await inject("POST", `/approvals/${otherWeekTwoReview.data.week_3_scope.approval.id}/request-changes`, {
    note: "Make week-3 scope narrower before execution."
  }, otherTenantId);
  assert(changeWeekThree.response.statusCode === 200, `week-3 scope request changes failed: ${changeWeekThree.response.statusCode} ${changeWeekThree.response.body}`);
  const changedWeekThreeMaterialRows = await query("select * from content_items where id = $1 and tenant_id = $2", [otherWeekTwoReview.data.week_3_scope.next_material.id, otherTenantId]);
  assert(changedWeekThreeMaterialRows.rows[0]?.metadata?.week_3_scope?.approval_status === "changes_requested", "changed week-3 content metadata missing");
  assert(changedWeekThreeMaterialRows.rows[0]?.metadata?.week_3_scope?.adjustment_note === "Make week-3 scope narrower before execution.", "changed week-3 adjustment note missing");

  console.log("Pilot week-2 execution command check passed");
} finally {
  await app.close();
  if (existsSync(localDataFile)) unlinkSync(localDataFile);
}
