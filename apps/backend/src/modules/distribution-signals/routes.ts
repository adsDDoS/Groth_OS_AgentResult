import type { FastifyInstance } from "fastify";
import { query } from "../../db/client.js";
import { insertJson } from "../common/repository.js";

const confirmedEventType = "distribution_signal.confirmed";
const legacyConfirmedEventType = "result_signal.confirmed";
const readableEventTypes = [confirmedEventType, legacyConfirmedEventType] as const;

export async function distributionSignalRoutes(app: FastifyInstance) {
  app.get("/distribution-signals", async (request) => {
    return { data: await listDistributionSignals(request.tenantId) };
  });

  app.get("/result-signals", async (request) => {
    return { data: await listDistributionSignals(request.tenantId) };
  });
}

export async function ensurePublishedDistributionSignal(input: {
  tenantId: string;
  contentItemId?: string | null;
  calendarItemId: string;
  channel?: string | null;
  title?: string | null;
  note?: string | null;
  confirmedBy?: string | null;
}) {
  const existing = await listDistributionSignalRows(input.tenantId);
  const existingSignal = existing.find((row) => {
    const metadata = isRecord(row.metadata) ? row.metadata : {};
    return metadata.calendar_item_id === input.calendarItemId;
  });
  if (existingSignal) return toDistributionSignal(existingSignal);

  const event = await insertJson("conversion_events", {
    content_item_id: input.contentItemId ?? null,
    source: input.channel ?? "manual",
    event_type: confirmedEventType,
    value: null,
    occurred_at: new Date().toISOString(),
    metadata: {
      status: "confirmed",
      calendar_item_id: input.calendarItemId,
      title: input.title ?? "Confirmed publication",
      note: input.note ?? "",
      confirmed_by: input.confirmedBy ?? null,
      result_contract: "distribution_signal"
    }
  }, input.tenantId);

  return toDistributionSignal(event);
}

async function listDistributionSignals(tenantId: string) {
  const rows = await listDistributionSignalRows(tenantId);
  return rows.map(toDistributionSignal);
}

async function listDistributionSignalRows(tenantId: string) {
  const results = await Promise.all(
    readableEventTypes.map((eventType) =>
      query("select * from conversion_events where tenant_id = $1 and event_type = $2 order by occurred_at desc limit 200", [
        tenantId,
        eventType
      ])
    )
  );
  return results
    .flatMap((result) => result.rows)
    .sort((a, b) => String(b.occurred_at ?? "").localeCompare(String(a.occurred_at ?? "")))
    .slice(0, 200);
}

function toDistributionSignal(row: Record<string, unknown>) {
  const metadata = isRecord(row.metadata) ? row.metadata : {};
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    content_item_id: row.content_item_id ?? null,
    calendar_item_id: metadata.calendar_item_id ?? null,
    status: metadata.status ?? "confirmed",
    source: row.source ?? "manual",
    signal_type: "distribution_signal.confirmed",
    legacy_signal_type: row.event_type === legacyConfirmedEventType ? legacyConfirmedEventType : null,
    title: metadata.title ?? "Confirmed publication",
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
