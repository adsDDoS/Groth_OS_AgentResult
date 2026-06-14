import { insertJson } from "./repository.js";

export async function recordOwnerActionAudit(input: {
  tenantId: string;
  action: string;
  targetType: string;
  targetId: string;
  userId?: string | null;
  source?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}) {
  return insertJson("integrations", {
    provider: "owner_action_audit",
    status: input.status ?? input.action,
    config: {
      ...(input.metadata ?? {}),
      action: input.action,
      target_type: input.targetType,
      target_id: input.targetId,
      user_id: input.userId ?? null,
      source: input.source ?? "backend"
    }
  }, input.tenantId);
}
