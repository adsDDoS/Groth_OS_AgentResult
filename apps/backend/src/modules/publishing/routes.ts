import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { canTransition, isKnownStatus, type PublishingCalendarStatus } from "@ai-growth-os/shared";
import { query } from "../../db/client.js";
import { insertJson, patchJson } from "../common/repository.js";
import { createApprovalRequest, reconcileApprovedCalendarApprovals, requireApproval } from "../approvals/service.js";
import { ensurePublishedResultSignal } from "../result-signals/routes.js";

const idParams = z.object({ id: z.string().uuid() });
const statusBody = z.object({ status: z.enum(["draft", "review", "scheduled", "published", "handed_off", "archived", "rejected"]) });
const noteBody = z.object({ note: z.string().optional() });

export async function publishingRoutes(app: FastifyInstance) {
  app.get("/publishing/calendar", async (request) => {
    await reconcileApprovedCalendarApprovals(request.tenantId);
    const result = await query(
      "select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 300",
      [request.tenantId]
    );
    return { data: result.rows };
  });

  app.post("/publishing/schedule", async (request) => {
    const payload = { ...(request.body as Record<string, unknown>), status: "review" };
    const item = await insertJson("publishing_calendar_items", payload, request.tenantId);
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

  app.patch("/publishing/items/:id/status", async (request) => {
    const { id } = idParams.parse(request.params);
    const { status } = statusBody.parse(request.body);
    return { data: await transitionCalendarItem({ id, tenantId: request.tenantId, status }) };
  });

  app.post("/publishing/items/:id/handoff", async (request) => {
    const { id } = idParams.parse(request.params);
    const { note } = noteBody.parse(request.body ?? {});
    return {
      data: await transitionCalendarItem({
        id,
        tenantId: request.tenantId,
        status: "handed_off",
        metadata: {
          handoff_note: note ?? "",
          handed_off_by: request.userId ?? null,
          handed_off_at: new Date().toISOString()
        }
      })
    };
  });

  app.post("/publishing/items/:id/confirm-live", async (request) => {
    const { id } = idParams.parse(request.params);
    const { note } = noteBody.parse(request.body ?? {});
    return {
      data: await transitionCalendarItem({
        id,
        tenantId: request.tenantId,
        status: "published",
        metadata: {
          result_note: note ?? "",
          published_confirmed_by: request.userId ?? null,
          published_confirmed_at: new Date().toISOString()
        }
      })
    };
  });

  app.patch("/publishing/items/:id", async (request) => {
    const { id } = idParams.parse(request.params);
    return { data: await patchJson("publishing_calendar_items", id, request.body as Record<string, unknown>, request.tenantId) };
  });
}

async function transitionCalendarItem(input: {
  id: string;
  tenantId: string;
  status: PublishingCalendarStatus;
  metadata?: Record<string, unknown>;
}) {
  const current = await loadCalendarItem(input.id, input.tenantId);
  if (!current) return null;

  const from = String(current.status ?? "");
  if (!isKnownStatus("publishing_calendar_item", from) || !canTransition("publishing_calendar_item", from, input.status)) {
    const error = new Error(`Invalid publishing calendar transition: ${from} -> ${input.status}`);
    Object.assign(error, { statusCode: 409, code: "INVALID_PUBLISHING_TRANSITION" });
    throw error;
  }

  const metadata = {
    ...(typeof current.metadata === "object" && current.metadata ? current.metadata : {}),
    ...(input.metadata ?? {})
  };
  const item = await patchJson("publishing_calendar_items", input.id, { status: input.status, metadata }, input.tenantId);
  if (item?.content_item_id) {
    await syncLinkedContentStatus(String(item.content_item_id), input.tenantId, input.status);
  }
  if (item && input.status === "published") {
    await ensurePublishedResultSignal({
      tenantId: input.tenantId,
      contentItemId: typeof item.content_item_id === "string" ? item.content_item_id : null,
      calendarItemId: input.id,
      channel: typeof item.channel === "string" ? item.channel : null,
      title: typeof item.title === "string" ? item.title : null,
      note: typeof input.metadata?.result_note === "string" ? input.metadata.result_note : "",
      confirmedBy: typeof input.metadata?.published_confirmed_by === "string" ? input.metadata.published_confirmed_by : null
    });
  }
  return item;
}

async function loadCalendarItem(id: string, tenantId: string) {
  const result = await query("select * from publishing_calendar_items where id = $1 and tenant_id = $2", [id, tenantId]);
  return result.rows[0] ?? null;
}

async function syncLinkedContentStatus(contentItemId: string, tenantId: string, calendarStatus: PublishingCalendarStatus) {
  if (calendarStatus !== "handed_off" && calendarStatus !== "published") return;
  const nextStatus = calendarStatus === "published" ? "published" : "handed_off";
  await patchJson("content_items", contentItemId, { status: nextStatus }, tenantId);
}
