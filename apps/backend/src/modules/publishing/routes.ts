import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../../db/client.js";
import { insertJson } from "../common/repository.js";
import { createApprovalRequest, requireApproval } from "../approvals/service.js";

const idParams = z.object({ id: z.string().uuid() });

export async function publishingRoutes(app: FastifyInstance) {
  app.get("/publishing/calendar", async (request) => {
    const result = await query(
      "select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 300",
      [request.tenantId]
    );
    return { data: result.rows };
  });

  app.post("/publishing/schedule", async (request) => {
    const item = await insertJson("publishing_calendar_items", request.body as Record<string, unknown>, request.tenantId);
    await createApprovalRequest({
      tenantId: request.tenantId,
      scope: "publish",
      targetType: "publishing_calendar_item",
      targetId: item.id,
      requestedBy: request.userId,
      summary: "Approval required before scheduled publishing can run."
    });
    return { data: item };
  });

  app.post("/publishing/items/:id/publish", async (request) => {
    const { id } = idParams.parse(request.params);
    await requireApproval({ tenantId: request.tenantId, scope: "publish", targetType: "publishing_calendar_item", targetId: id });
    const result = await query(
      `insert into publishing_jobs (tenant_id, calendar_item_id, status, requested_by)
       values ($1, $2, 'queued', $3)
       returning *`,
      [request.tenantId, id, request.userId ?? null]
    );
    return { data: result.rows[0] };
  });

  app.post("/publishing/items/:id/unpublish", async (request) => {
    const { id } = idParams.parse(request.params);
    await requireApproval({ tenantId: request.tenantId, scope: "live_update", targetType: "publishing_calendar_item", targetId: id });
    const result = await query(
      "update publishing_calendar_items set status = 'archived', updated_at = now() where id = $1 and tenant_id = $2 returning *",
      [id, request.tenantId]
    );
    return { data: result.rows[0] ?? null };
  });
}
