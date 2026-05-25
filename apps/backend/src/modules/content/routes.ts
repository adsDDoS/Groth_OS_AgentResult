import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../../db/client.js";
import { createAgentTask } from "../agents/runner.js";
import { insertJson } from "../common/repository.js";

const idParams = z.object({ id: z.string().uuid() });

export async function contentRoutes(app: FastifyInstance) {
  app.get("/content/items", async (request) => {
    const result = await query("select * from content_items where tenant_id = $1 order by created_at desc limit 200", [
      request.tenantId
    ]);
    return { data: result.rows };
  });

  app.get("/content/items/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    const result = await query("select * from content_items where id = $1 and tenant_id = $2", [id, request.tenantId]);
    return { data: result.rows[0] ?? null };
  });

  app.post("/content/items", async (request) => {
    return { data: await insertJson("content_items", request.body as Record<string, unknown>, request.tenantId) };
  });

  app.post("/content/items/:id/generate-brief", async (request) => {
    const { id } = idParams.parse(request.params);
    return {
      data: await createAgentTask({
        tenantId: request.tenantId,
        role: "page_brief",
        taskType: "generate_content_brief",
        targetType: "content_item",
        targetId: id,
        payload: { contentItemId: id, input: request.body ?? {} },
        createdBy: request.userId
      })
    };
  });

  app.post("/content/items/:id/generate-draft", async (request) => {
    const { id } = idParams.parse(request.params);
    return {
      data: await createAgentTask({
        tenantId: request.tenantId,
        role: "content_writer",
        taskType: "generate_content_draft",
        targetType: "content_item",
        targetId: id,
        payload: { contentItemId: id, input: request.body ?? {} },
        createdBy: request.userId
      })
    };
  });

  app.post("/content/items/:id/repurpose", async (request) => {
    const { id } = idParams.parse(request.params);
    return {
      data: await createAgentTask({
        tenantId: request.tenantId,
        role: "social_repurposing",
        taskType: "repurpose_content",
        targetType: "content_item",
        targetId: id,
        payload: { contentItemId: id, channels: request.body ?? {} },
        createdBy: request.userId
      })
    };
  });

  app.post("/content/items/:id/comment", async (request) => {
    const { id } = idParams.parse(request.params);
    return {
      data: await insertJson(
        "content_comments",
        { ...(request.body as Record<string, unknown>), content_item_id: id, user_id: request.userId },
        request.tenantId
      )
    };
  });

  app.post("/content/items/:id/archive", async (request) => {
    const { id } = idParams.parse(request.params);
    const result = await query(
      "update content_items set status = 'archived', updated_at = now() where id = $1 and tenant_id = $2 returning *",
      [id, request.tenantId]
    );
    return { data: result.rows[0] ?? null };
  });
}
