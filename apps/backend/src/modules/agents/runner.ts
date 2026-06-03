import { randomUUID } from "node:crypto";
import { config } from "../../config.js";
import { query } from "../../db/client.js";

export async function createAgentTask(input: {
  tenantId: string;
  role: string;
  taskType: string;
  targetType?: string;
  targetId?: string;
  payload: Record<string, unknown>;
  createdBy?: string;
}) {
  const id = randomUUID();
  const result = await query(
    `insert into tasks
      (id, tenant_id, agent_role, task_type, target_type, target_id, status, payload, created_by)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning *`,
    [
      id,
      input.tenantId,
      input.role,
      input.taskType,
      input.targetType ?? null,
      input.targetId ?? null,
      "queued",
      input.payload,
      input.createdBy ?? null
    ]
  );

  await query(
    `insert into task_events (id, tenant_id, task_id, event_type, payload)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [randomUUID(), input.tenantId, id, "task_queued", { provider: config.modelProvider, hermesBaseUrl: config.hermesBaseUrl }]
  );

  return result.rows[0];
}

export async function handoffToHermes(taskId: string, tenantId: string) {
  const task = await query("select * from tasks where id = $1 and tenant_id = $2", [taskId, tenantId]);
  if (!task.rowCount) return null;

  await query(
    `insert into task_events (id, tenant_id, task_id, event_type, payload)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [randomUUID(), tenantId, taskId, "hermes_handoff_requested", { hermesBaseUrl: config.hermesBaseUrl }]
  );

  return task.rows[0];
}
