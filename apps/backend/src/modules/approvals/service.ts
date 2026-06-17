import { randomUUID } from "node:crypto";
import { APPROVAL_SCOPES, canTransition, type ApprovalScope } from "@ai-growth-os/shared";
import { query } from "../../db/client.js";
import { recordOwnerActionAudit } from "../common/audit.js";
import { patchJson } from "../common/repository.js";

const protectedApprovalScopes = new Set<string>(APPROVAL_SCOPES);

export async function createApprovalRequest(input: {
  tenantId: string;
  scope: ApprovalScope | string;
  targetType: string;
  targetId: string;
  requestedBy?: string;
  riskFlags?: string[];
  summary?: string;
}) {
  const result = await query(
    `insert into approvals
      (id, tenant_id, scope, target_type, target_id, status, requested_by, risk_flags, summary)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning *`,
    [
      randomUUID(),
      input.tenantId,
      input.scope,
      input.targetType,
      input.targetId,
      "pending",
      input.requestedBy ?? null,
      input.riskFlags ?? [],
      input.summary ?? null
    ]
  );
  return result.rows[0];
}

export async function requireApproval(input: { tenantId: string; scope: string; targetType: string; targetId: string }) {
  if (!protectedApprovalScopes.has(input.scope)) return;

  const result = await query(
    `select id from approvals
     where tenant_id = $1 and scope = $2 and target_type = $3 and target_id = $4 and status = 'approved'
     order by decided_at desc
     limit 1`,
    [input.tenantId, input.scope, input.targetType, input.targetId]
  );

  if (!result.rowCount) {
    const error = new Error(`Human approval required for ${input.scope}`);
    Object.assign(error, { statusCode: 409, code: "APPROVAL_REQUIRED" });
    throw error;
  }
}

export async function decideApproval(input: {
  id: string;
  tenantId: string;
  status: "approved" | "rejected" | "changes_requested";
  decidedBy?: string;
  decisionNote?: string;
}) {
  const result = await query(
    `update approvals
     set status = $3, decided_by = $4, decision_note = $5, decided_at = now(), updated_at = now()
     where id = $1 and tenant_id = $2
     returning *`,
    [input.id, input.tenantId, input.status, input.decidedBy ?? null, input.decisionNote ?? null]
  );
  const approval = result.rows[0] ?? null;
  if (approval?.status === "approved") {
    await applyApprovalSideEffects(approval);
  }
  if (approval?.scope === "pilot_week_2_scope" && ["approved", "changes_requested"].includes(String(approval.status))) {
    await applyPilotWeekTwoScopeApprovalSideEffects(approval);
  }
  if (approval) {
    await recordOwnerActionAudit({
      tenantId: input.tenantId,
      action: `approval.${input.status}`,
      targetType: "approval",
      targetId: input.id,
      userId: input.decidedBy ?? null,
      source: "approval_command",
      metadata: {
        scope: approval.scope,
        approval_status: approval.status,
        approval_target_type: approval.target_type,
        approval_target_id: approval.target_id,
        decision_note: approval.decision_note ?? null
      }
    });
  }
  return approval;
}

async function applyPilotWeekTwoScopeApprovalSideEffects(approval: Record<string, unknown>) {
  const tenantId = typeof approval.tenant_id === "string" ? approval.tenant_id : "";
  const targetId = typeof approval.target_id === "string" ? approval.target_id : "";
  const status = typeof approval.status === "string" ? approval.status : "";
  if (!tenantId || !targetId || !status) return;

  const contentResult = await query("select * from content_items where id = $1 and tenant_id = $2", [targetId, tenantId]);
  const content = contentResult.rows[0] ?? null;
  if (content) {
    const metadata = content.metadata && typeof content.metadata === "object" ? content.metadata as Record<string, unknown> : {};
    const currentScope = metadata.week_2_scope && typeof metadata.week_2_scope === "object"
      ? metadata.week_2_scope as Record<string, unknown>
      : {};
    await patchJson("content_items", targetId, {
      metadata: {
        ...metadata,
        week_2_scope: {
          ...currentScope,
          approval_id: approval.id ?? null,
          approval_status: status,
          approved_at: status === "approved" ? approval.decided_at ?? null : currentScope.approved_at ?? null,
          adjustment_note: status === "changes_requested" ? approval.decision_note ?? "" : currentScope.adjustment_note ?? null,
          decided_by: approval.decided_by ?? null
        }
      }
    }, tenantId);
  }

  const boardResult = await query("select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 300", [tenantId]);
  const boardRows = boardResult.rows.filter((row) => row.content_item_id === targetId && row.metadata?.week_2_scope);
  await Promise.all(boardRows.map((row) => {
    const metadata = row.metadata && typeof row.metadata === "object" ? row.metadata as Record<string, unknown> : {};
    const currentScope = metadata.week_2_scope && typeof metadata.week_2_scope === "object"
      ? metadata.week_2_scope as Record<string, unknown>
      : {};
    return patchJson("publishing_calendar_items", String(row.id), {
      status: status === "changes_requested" ? "review" : row.status,
      metadata: {
        ...metadata,
        week_2_scope: {
          ...currentScope,
          approval_id: approval.id ?? null,
          approval_status: status,
          adjustment_note: status === "changes_requested" ? approval.decision_note ?? "" : currentScope.adjustment_note ?? null,
          decided_by: approval.decided_by ?? null,
          decided_at: approval.decided_at ?? null
        }
      }
    }, tenantId);
  }));

  await patchPilotWorkspaceWeekTwoScopeApproval(tenantId, {
    approval_id: approval.id ?? null,
    approval_status: status,
    adjustment_note: status === "changes_requested" ? approval.decision_note ?? "" : null,
    decided_by: approval.decided_by ?? null,
    decided_at: approval.decided_at ?? null
  });
}

async function patchPilotWorkspaceWeekTwoScopeApproval(tenantId: string, patch: Record<string, unknown>) {
  const result = await query("select * from tenants where id = $1", [tenantId]);
  const tenant = result.rows[0] ?? null;
  if (!tenant) return;
  const settings = tenant.settings && typeof tenant.settings === "object" ? { ...(tenant.settings as Record<string, unknown>) } : {};
  const dashboardState = settings.dashboard_state && typeof settings.dashboard_state === "object"
    ? { ...(settings.dashboard_state as Record<string, unknown>) }
    : {};
  const activePilotWorkspace = dashboardState.activePilotWorkspace && typeof dashboardState.activePilotWorkspace === "object"
    ? { ...(dashboardState.activePilotWorkspace as Record<string, unknown>) }
    : {};
  const weekTwoScope = activePilotWorkspace.week_2_scope && typeof activePilotWorkspace.week_2_scope === "object"
    ? { ...(activePilotWorkspace.week_2_scope as Record<string, unknown>) }
    : {};
  settings.dashboard_state = {
    ...dashboardState,
    activePilotWorkspace: {
      ...activePilotWorkspace,
      week_2_scope: {
        ...weekTwoScope,
        ...patch
      }
    }
  };
  await query("update tenants set settings = $2 where id = $1 returning *", [tenantId, settings]);
}

export async function reconcileApprovedCalendarApprovals(tenantId: string) {
  await query(
    `update publishing_calendar_items calendar
     set status = 'scheduled',
       metadata = coalesce(calendar.metadata, '{}'::jsonb) || jsonb_build_object(
         'approval_id', approval.id,
         'decision_note', coalesce(approval.decision_note, ''),
         'decided_by', approval.decided_by,
         'decided_at', coalesce(approval.decided_at, calendar.updated_at, now())
       ),
       updated_at = now()
     from approvals approval
     where approval.tenant_id = $1
       and calendar.tenant_id = approval.tenant_id
       and approval.target_type = 'publishing_calendar_item'
       and approval.status = 'approved'
       and calendar.id = approval.target_id
       and calendar.status in ('draft', 'review')
     returning calendar.*`,
    [tenantId]
  );
}

async function applyApprovalSideEffects(approval: Record<string, unknown>) {
  if (approval.target_type !== "publishing_calendar_item") return;
  const tenantId = typeof approval.tenant_id === "string" ? approval.tenant_id : "";
  const targetId = typeof approval.target_id === "string" ? approval.target_id : "";
  if (!tenantId || !targetId) return;
  if (!canTransition("publishing_calendar_item", "review", "scheduled")) return;

  await query(
    `update publishing_calendar_items
     set status = $3,
       metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
         'approval_id', $4::uuid,
         'decision_note', coalesce($5, ''),
         'decided_by', $6::uuid,
         'decided_at', coalesce($7::timestamptz, now())
       ),
       updated_at = now()
     where id = $1
       and tenant_id = $2
       and status in ('draft', 'review')
     returning *`,
    [
      targetId,
      tenantId,
      "scheduled",
      approval.id ?? null,
      approval.decision_note ?? null,
      approval.decided_by ?? null,
      approval.decided_at ?? null
    ]
  );
}
