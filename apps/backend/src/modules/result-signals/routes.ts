import type { FastifyInstance } from "fastify";
import { query } from "../../db/client.js";
import { insertJson } from "../common/repository.js";

const confirmedEventType = "result_signal.confirmed";

export async function resultSignalRoutes(app: FastifyInstance) {
  app.get("/result-signals", async (request) => {
    const result = await query(
      "select * from conversion_events where tenant_id = $1 and event_type = $2 order by occurred_at desc limit 200",
      [request.tenantId, confirmedEventType]
    );
    return { data: result.rows.map(toResultSignal) };
  });
}

export async function ensurePublishedResultSignal(input: {
  tenantId: string;
  contentItemId?: string | null;
  calendarItemId: string;
  channel?: string | null;
  title?: string | null;
  note?: string | null;
  confirmedBy?: string | null;
}) {
  const existing = await query(
    "select * from conversion_events where tenant_id = $1 and event_type = $2 order by occurred_at desc limit 200",
    [input.tenantId, confirmedEventType]
  );
  const existingSignal = existing.rows.find((row) => {
    const metadata = isRecord(row.metadata) ? row.metadata : {};
    return metadata.calendar_item_id === input.calendarItemId;
  });
  if (existingSignal) return toResultSignal(existingSignal);

  const event = await insertJson("conversion_events", {
    content_item_id: input.contentItemId ?? null,
    source: input.channel ?? "manual",
    event_type: confirmedEventType,
    value: null,
    occurred_at: new Date().toISOString(),
    metadata: {
      status: "confirmed",
      calendar_item_id: input.calendarItemId,
      title: input.title ?? "Confirmed release",
      note: input.note ?? "",
      confirmed_by: input.confirmedBy ?? null
    }
  }, input.tenantId);

  return toResultSignal(event);
}

function toResultSignal(row: Record<string, unknown>) {
  const metadata = isRecord(row.metadata) ? row.metadata : {};
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    content_item_id: row.content_item_id ?? null,
    calendar_item_id: metadata.calendar_item_id ?? null,
    status: metadata.status ?? "confirmed",
    source: row.source ?? "manual",
    signal_type: row.event_type,
    title: metadata.title ?? "Confirmed release",
    note: metadata.note ?? "",
    value: row.value ?? null,
    occurred_at: row.occurred_at,
    confirmed_by: metadata.confirmed_by ?? null,
    metadata
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
