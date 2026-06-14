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

  app.get("/publication-results", async (request) => {
    return { data: await listPublicationResults(request.tenantId) };
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

async function listPublicationResults(tenantId: string) {
  const [signals, calendarResult, contentResult] = await Promise.all([
    listDistributionSignals(tenantId),
    query("select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 300", [tenantId]),
    query("select * from content_items where tenant_id = $1 order by created_at desc limit 200", [tenantId])
  ]);
  const calendarById = new Map(calendarResult.rows.map((row) => [String(row.id), row]));
  const contentById = new Map(contentResult.rows.map((row) => [String(row.id), row]));
  return signals.map((signal) => {
    const calendar = calendarById.get(String(signal.calendar_item_id ?? "")) ?? null;
    const content = contentById.get(String(signal.content_item_id ?? calendar?.content_item_id ?? "")) ?? null;
    return toPublicationResult(signal, calendar, content);
  });
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

function toPublicationResult(signal: Record<string, unknown>, calendar: Record<string, unknown> | null, content: Record<string, unknown> | null) {
  const signalMetadata = isRecord(signal.metadata) ? signal.metadata : {};
  const calendarMetadata = isRecord(calendar?.metadata) ? calendar.metadata : {};
  const contentMetadata = isRecord(content?.metadata) ? content.metadata : {};
  const resultMetadata = isRecord(calendarMetadata.publication_result) ? calendarMetadata.publication_result : {};
  const reactions = isRecord(resultMetadata.reactions)
    ? resultMetadata.reactions
    : {
      comments: Number(resultMetadata.comments ?? signalMetadata.comments ?? 0),
      reposts: Number(resultMetadata.reposts ?? signalMetadata.reposts ?? 0),
      saves: Number(resultMetadata.saves ?? signalMetadata.saves ?? 0),
      reactions: Number(resultMetadata.reactions_count ?? signalMetadata.reactions_count ?? 0)
    };
  const nextStep = String(resultMetadata.next_step ?? signalMetadata.next_step ?? "leave");
  return {
    id: `publication-result-${signal.id ?? calendar?.id ?? ""}`,
    tenant_id: signal.tenant_id ?? calendar?.tenant_id ?? null,
    distribution_signal_id: signal.id ?? null,
    calendar_item_id: signal.calendar_item_id ?? calendar?.id ?? null,
    content_item_id: signal.content_item_id ?? calendar?.content_item_id ?? null,
    title: signal.title ?? calendar?.title ?? content?.title ?? "Confirmed publication",
    channel: calendar?.channel ?? signal.source ?? "manual",
    format: content?.content_type ?? calendarMetadata.format ?? contentMetadata.format ?? "publication",
    publication_url: resultMetadata.publication_url ?? calendarMetadata.publication_url ?? signalMetadata.publication_url ?? null,
    status: signal.status ?? "confirmed",
    confirmed_at: signal.occurred_at ?? calendar?.updated_at ?? null,
    confirmed_by: signal.confirmed_by ?? signalMetadata.confirmed_by ?? null,
    primary_reactions: reactions,
    next_step: ["reuse", "expand", "update", "leave"].includes(nextStep) ? nextStep : "leave",
    next_step_note: resultMetadata.next_step_note ?? signalMetadata.next_step_note ?? "",
    evidence: {
      has_url: Boolean(resultMetadata.publication_url ?? calendarMetadata.publication_url ?? signalMetadata.publication_url),
      has_reactions: Object.values(reactions).some((value) => Number(value) > 0),
      source: signal.source ?? calendar?.channel ?? "manual"
    },
    metadata: {
      signal: signalMetadata,
      calendar: calendarMetadata,
      content: contentMetadata
    }
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
