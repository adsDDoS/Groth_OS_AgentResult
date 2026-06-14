import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../../db/client.js";
import { createAgentTask } from "../agents/runner.js";
import { insertJson, patchJson } from "../common/repository.js";

const confirmedEventType = "distribution_signal.confirmed";
const legacyConfirmedEventType = "result_signal.confirmed";
const readableEventTypes = [confirmedEventType, legacyConfirmedEventType] as const;
const publicationResultParams = z.object({ id: z.string() });
const nextStepBody = z.object({ note: z.string().optional() });
const publicationResultCommands = ["reuse", "expand", "update"] as const;
type PublicationResultCommand = (typeof publicationResultCommands)[number];

export async function distributionSignalRoutes(app: FastifyInstance) {
  app.get("/distribution-signals", async (request) => {
    return { data: await listDistributionSignals(request.tenantId) };
  });

  app.get("/publication-results", async (request) => {
    return { data: await listPublicationResults(request.tenantId) };
  });

  for (const command of publicationResultCommands) {
    app.post(`/publication-results/:id/${command}`, async (request, reply) => {
      const { id } = publicationResultParams.parse(request.params);
      const body = nextStepBody.parse(request.body ?? {});
      const result = await executePublicationResultCommand({
        tenantId: request.tenantId,
        userId: request.userId,
        publicationResultId: id,
        command,
        note: body.note
      });
      if (!result) {
        reply.status(404);
        return { error: "NotFound", message: "Publication result not found" };
      }
      return { data: result };
    });
  }

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
  const contexts = await listPublicationResultContexts(tenantId);
  return contexts.map((context) => context.publicationResult);
}

async function executePublicationResultCommand(input: {
  tenantId: string;
  userId?: string | null;
  publicationResultId: string;
  command: PublicationResultCommand;
  note?: string;
}) {
  const contexts = await listPublicationResultContexts(input.tenantId);
  const context = contexts.find((item) => {
    return item.publicationResult.id === input.publicationResultId
      || item.publicationResult.calendar_item_id === input.publicationResultId
      || item.publicationResult.distribution_signal_id === input.publicationResultId;
  });
  if (!context?.calendar) return null;
  const contextWithCalendar: PublicationResultContextWithCalendar = {
    ...context,
    calendar: context.calendar
  };

  const resultMetadata = publicationResultMetadata(contextWithCalendar.calendar);
  const existingAction = isRecord(resultMetadata.next_step_action) ? resultMetadata.next_step_action : null;
  if (existingAction?.type === input.command && existingAction.target_id) {
    return {
      action: existingAction,
      target: null,
      target_type: existingAction.target_type ?? null,
      calendar_item: contextWithCalendar.calendar,
      publication_result: toPublicationResult(contextWithCalendar.signal, contextWithCalendar.calendar, contextWithCalendar.content)
    };
  }

  const target = input.command === "update"
    ? await createPublicationResultUpdateTask(input, contextWithCalendar)
    : await createPublicationResultContentItem(input, contextWithCalendar);
  const action = {
    type: input.command,
    target_type: input.command === "update" ? "task" : "content_item",
    target_id: target.id,
    created_at: new Date().toISOString(),
    created_by: input.userId ?? null
  };
  const metadata = {
    ...safeMetadata(contextWithCalendar.calendar.metadata),
    publication_result: {
      ...resultMetadata,
      next_step: input.command,
      next_step_note: input.note ?? resultMetadata.next_step_note ?? publicationResultCommandLabel(input.command),
      next_step_action: action,
      decided_at: action.created_at,
      decided_by: input.userId ?? null
    }
  };
  const calendar = await patchJson("publishing_calendar_items", String(contextWithCalendar.calendar.id), { metadata }, input.tenantId) ?? {
    ...contextWithCalendar.calendar,
    metadata
  };
  const publicationResult = toPublicationResult(contextWithCalendar.signal, calendar, contextWithCalendar.content);
  return {
    action,
    target,
    target_type: action.target_type,
    calendar_item: calendar,
    publication_result: publicationResult
  };
}

async function createPublicationResultContentItem(
  input: {
    tenantId: string;
    userId?: string | null;
    command: PublicationResultCommand;
    note?: string;
  },
  context: PublicationResultContextWithCalendar
) {
  const isExpand = input.command === "expand";
  const resultMetadata = publicationResultMetadata(context.calendar);
  const sourceContent = context.content ?? {};
  return insertJson("content_items", {
    demand_map_item_id: sourceContent.demand_map_item_id ?? null,
    title: `${isExpand ? "Expand" : "Reuse"}: ${context.publicationResult.title}`,
    content_type: isExpand ? "article_outline" : (sourceContent.content_type ?? "telegram_post"),
    channel: isExpand ? "website" : (sourceContent.channel ?? context.calendar.channel ?? "telegram"),
    status: "idea",
    owner_id: sourceContent.owner_id ?? null,
    target_url: null,
    body_md: "",
    metadata: {
      source_publication_result: true,
      source_publication_result_id: context.publicationResult.id,
      source_distribution_signal_id: context.publicationResult.distribution_signal_id,
      source_calendar_item_id: context.publicationResult.calendar_item_id,
      source_content_item_id: context.publicationResult.content_item_id,
      source_publication_url: resultMetadata.publication_url ?? "",
      next_step: input.command,
      brief: isExpand
        ? `Expand the strongest angle from: ${context.publicationResult.title}`
        : `Reuse the strongest angle from: ${context.publicationResult.title}`,
      proof: input.note ?? resultMetadata.next_step_note ?? resultMetadata.publication_url ?? "",
      created_by_command: `publication_result.${input.command}`,
      created_by: input.userId ?? null
    }
  }, input.tenantId);
}

async function createPublicationResultUpdateTask(
  input: {
    tenantId: string;
    userId?: string | null;
    command: PublicationResultCommand;
    note?: string;
  },
  context: PublicationResultContextWithCalendar
) {
  const resultMetadata = publicationResultMetadata(context.calendar);
  return createAgentTask({
    tenantId: input.tenantId,
    role: "release_control",
    taskType: "publication_result_update",
    targetType: "publishing_calendar_item",
    targetId: String(context.calendar.id),
    payload: {
      title: `Update published material: ${context.publicationResult.title}`,
      owner: "Release control",
      status: "next",
      note: [
        resultMetadata.publication_url ? `URL: ${resultMetadata.publication_url}` : "",
        input.note ?? resultMetadata.next_step_note ?? publicationResultCommandLabel("update")
      ].filter(Boolean).join("\n"),
      source: "publication_result_update",
      targetType: "publishing_calendar_item",
      targetId: context.publicationResult.calendar_item_id,
      publicationResultId: context.publicationResult.id
    },
    createdBy: input.userId ?? undefined
  });
}

async function listPublicationResultContexts(tenantId: string): Promise<PublicationResultContext[]> {
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
    return {
      signal,
      calendar,
      content,
      publicationResult: toPublicationResult(signal, calendar, content)
    };
  });
}

type PublicationResultContext = {
  signal: Record<string, unknown>;
  calendar: Record<string, unknown> | null;
  content: Record<string, unknown> | null;
  publicationResult: ReturnType<typeof toPublicationResult>;
};

type PublicationResultContextWithCalendar = PublicationResultContext & {
  calendar: Record<string, unknown>;
};

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

function publicationResultMetadata(calendar: Record<string, unknown> | null) {
  const metadata = safeMetadata(calendar?.metadata);
  return isRecord(metadata.publication_result) ? metadata.publication_result : {};
}

function safeMetadata(value: unknown) {
  return isRecord(value) ? value : {};
}

function publicationResultCommandLabel(command: PublicationResultCommand) {
  if (command === "expand") return "Expand into a larger content piece";
  if (command === "update") return "Update the published material";
  return "Reuse as a new content asset";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
