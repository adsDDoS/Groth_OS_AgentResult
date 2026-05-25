import { randomUUID } from "node:crypto";
import { query } from "../../db/client.js";

const protectedApprovalScopes = new Set([
  "publish",
  "live_update",
  "newsletter_send",
  "social_post",
  "bulk_programmatic_pages",
  "sensitive_claim"
]);

export async function createApprovalRequest(input: {
  tenantId: string;
  scope: string;
  targetType: string;
  targetId: string;
  requestedBy?: string;
  riskFlags?: string[];
  summary?: string;
}) {
  const result = await query(
    `insert into approvals
      (id, tenant_id, scope, target_type, target_id, status, requested_by, risk_flags, summary)
     values ($1, $2, $3, $4, $5, 'pending', $6, $7, $8)
     returning *`,
    [
      randomUUID(),
      input.tenantId,
      input.scope,
      input.targetType,
      input.targetId,
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
  return result.rows[0] ?? null;
}
