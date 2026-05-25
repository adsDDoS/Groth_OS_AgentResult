import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../../db/client.js";
import { createAgentTask, handoffToHermes } from "../agents/runner.js";

const idParams = z.object({ id: z.string().uuid() });

export async function taskRoutes(app: FastifyInstance) {
  app.get("/agents", async (request) => {
    const result = await query("select * from agents where tenant_id = $1 or tenant_id is null order by role asc", [
      request.tenantId
    ]);
    return { data: result.rows };
  });

  app.get("/tasks", async (request) => {
    const result = await query("select * from tasks where tenant_id = $1 order by created_at desc limit 200", [
      request.tenantId
    ]);
    return { data: result.rows };
  });

  app.post("/tasks", async (request) => {
    const body = z
      .object({
        role: z.string(),
        taskType: z.string(),
        targetType: z.string().optional(),
        targetId: z.string().optional(),
        payload: z.record(z.unknown()).default({})
      })
      .parse(request.body ?? {});

    return {
      data: await createAgentTask({
        tenantId: request.tenantId,
        role: body.role,
        taskType: body.taskType,
        targetType: body.targetType,
        targetId: body.targetId,
        payload: body.payload,
        createdBy: request.userId
      })
    };
  });

  app.get("/tasks/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    const result = await query("select * from tasks where id = $1 and tenant_id = $2", [id, request.tenantId]);
    return { data: result.rows[0] ?? null };
  });

  app.get("/tasks/:id/events", async (request) => {
    const { id } = idParams.parse(request.params);
    const result = await query("select * from task_events where task_id = $1 and tenant_id = $2 order by created_at asc", [
      id,
      request.tenantId
    ]);
    return { data: result.rows };
  });

  for (const action of ["approve", "reject", "pause"] as const) {
    app.post(`/tasks/:id/${action}`, async (request) => {
      const { id } = idParams.parse(request.params);
      const status = action === "approve" ? "approved" : action === "reject" ? "blocked" : "paused";
      const result = await query("update tasks set status = $3, updated_at = now() where id = $1 and tenant_id = $2 returning *", [
        id,
        request.tenantId,
        status
      ]);
      return { data: result.rows[0] ?? null };
    });
  }

  app.post("/tasks/:id/handoff", async (request) => {
    const { id } = idParams.parse(request.params);
    return { data: await handoffToHermes(id, request.tenantId) };
  });
}
