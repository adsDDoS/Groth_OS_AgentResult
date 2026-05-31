import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../../db/client.js";
import { createAgentTask } from "../agents/runner.js";
import { insertJson, patchJson } from "../common/repository.js";

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

  app.get("/content/items/:id/detail", async (request) => {
    const { id } = idParams.parse(request.params);
    const [itemResult, demandResult, approvalsResult, calendarResult, commentsResult] = await Promise.all([
      query("select * from content_items where id = $1 and tenant_id = $2", [id, request.tenantId]),
      query("select * from demand_map_items where tenant_id = $1 order by priority desc, created_at desc", [request.tenantId]),
      query("select * from approvals where tenant_id = $1 order by created_at desc limit 200", [request.tenantId]),
      query("select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 300", [request.tenantId]),
      query("select * from content_comments where content_item_id = $1 and tenant_id = $2 order by created_at desc", [id, request.tenantId])
    ]);

    const item = itemResult.rows[0] ?? null;
    const demandItem = item ? demandResult.rows.find((row) => row.id === item.demand_map_item_id) ?? null : null;
    const approvals = approvalsResult.rows.filter((row) => row.target_id === id || row.content_item_id === id);
    const calendar = calendarResult.rows.filter((row) => row.content_item_id === id);

    return {
      data: {
        item,
        demandItem,
        approvals,
        calendar,
        comments: commentsResult.rows
      }
    };
  });

  app.post("/content/items", async (request) => {
    return { data: await insertJson("content_items", request.body as Record<string, unknown>, request.tenantId) };
  });

  app.patch("/content/items/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    return { data: await patchJson("content_items", id, request.body as Record<string, unknown>) };
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
