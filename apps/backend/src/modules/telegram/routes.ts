import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { config } from "../../config.js";
import { query } from "../../db/client.js";
import { resetMemoryDemoStore } from "../../db/memory.js";
import { createAgentTask } from "../agents/runner.js";
import { createApprovalRequest, decideApproval } from "../approvals/service.js";
import { insertJson, listRows, patchJson } from "../common/repository.js";
import { executePublicationResultCommand, listPublicationResults } from "../distribution-signals/routes.js";
import { dispatchHermesTask } from "../hermes/index.js";
import { completeDaySevenReview, completeWeekFiveReview, completeWeekFourReview, completeWeekThreeReview, completeWeekTwoReview, getActiveWeekFiveExecution, getActiveWeekFourExecution, getActiveWeekThreeExecution, getActiveWeekTwoExecution, startWeekFiveExecution, startWeekFourExecution, startWeekOnePilot, startWeekThreeExecution, startWeekTwoExecution } from "../pilot/routes.js";
import { confirmPublishingCalendarLive } from "../publishing/routes.js";

type Row = Record<string, unknown>;
type TelegramButton = {
  action: string;
  callbackData: string | null;
  label: string;
  targetId: unknown;
  targetType: "approval" | "publishing_calendar_item";
};
type TelegramCommandButton = {
  command: string;
  label: string;
  targetId?: string | null;
};
type ParsedTelegramCommandCallback = {
  command: string;
  targetId?: string;
};
type OwnerBriefInput = {
  approvals: Row[];
  calendar: Row[];
  contentItems: Row[];
  latestSummary: Row;
  publicationResults: Row[];
  tasks: Row[];
};
type TelegramExecutionContext = {
  app?: FastifyInstance;
  telegramChatId?: number | string;
  tenantId: string;
  userId?: string;
};
type BriefData = Awaited<ReturnType<typeof loadOwnerBriefData>>;
type OnboardingStep = "offer" | "client" | "channel" | "release_owner" | "first_signal_source" | "approval_rules" | "first_material" | "done";
type OnboardingState = {
  answers: Record<string, string>;
  completedAt?: string;
  step: OnboardingStep;
  updatedAt?: string;
};
type PublicationResultConfirmationStep = "url" | "format" | "reactions" | "done";
type PublicationResultConfirmationState = {
  answers: Record<string, string>;
  calendarItemId: string;
  completedAt?: string;
  step: PublicationResultConfirmationStep;
  updatedAt?: string;
};
type AdvisorHistoryEntry = {
  activePilotExecution?: Row | null;
  answerPreview?: string;
  id?: string;
  question: string;
  updatedAt?: string;
};

const telegramActionSchema = z.object({
  action: z.enum(["approval.approve", "approval.request_changes", "publishing.confirm_live"]),
  targetId: z.string().uuid(),
  note: z.string().optional()
});
const telegramWebhookSchema = z.object({
  callback_query: z.object({
    id: z.string().optional(),
    data: z.string().optional()
  }).passthrough().optional()
}).passthrough();
const telegramSendOwnerBriefSchema = z.object({
  dryRun: z.boolean().optional()
});
const telegramCommandSchema = z.object({
  command: z.string().min(1),
  targetId: z.string().min(1).optional(),
  note: z.string().optional()
});
const telegramSendCommandSchema = telegramCommandSchema.extend({
  dryRun: z.boolean().optional()
});
const telegramIntentSchema = z.object({
  text: z.string().min(1),
  note: z.string().optional()
});
const telegramMaterialSchema = z.object({
  title: z.string().min(3),
  bodyMd: z.string().min(20),
  channel: z.string().min(2).default("telegram"),
  contentType: z.string().min(2).default("telegram_post"),
  note: z.string().optional()
});
const onboardingStateSchema = z.object({
  answers: z.record(z.string()).default({}),
  completedAt: z.string().optional(),
  step: z.enum(["offer", "client", "channel", "release_owner", "first_signal_source", "approval_rules", "first_material", "done"]).default("offer"),
  updatedAt: z.string().optional()
});
const publicationResultConfirmationStateSchema = z.object({
  answers: z.record(z.string()).default({}),
  calendarItemId: z.string().uuid(),
  completedAt: z.string().optional(),
  step: z.enum(["url", "format", "reactions", "done"]).default("url"),
  updatedAt: z.string().optional()
});

type TelegramActionInput = z.infer<typeof telegramActionSchema>;
type OwnerBrief = ReturnType<typeof buildOwnerBrief>;
type OwnerPriority =
  | { type: "confirm_publication"; handoff: Row; decision?: undefined; preparingTask?: undefined }
  | { type: "approval"; decision: Row; handoff?: undefined; preparingTask?: undefined }
  | { type: "preparing"; preparingTask: Row; decision?: undefined; handoff?: undefined }
  | { type: "new_topic"; decision?: undefined; handoff?: undefined; preparingTask?: undefined };
type TelegramCommandInput = z.infer<typeof telegramCommandSchema>;
type TelegramCommandResult = Awaited<ReturnType<typeof executeTelegramCommand>>;
type TelegramIntentInput = z.infer<typeof telegramIntentSchema>;
type TelegramMaterialInput = z.infer<typeof telegramMaterialSchema>;
type TelegramApiResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};
type HermesAdvisorCompletion = {
  choices?: Array<{
    message?: {
      content?: string | Array<string | { text?: string }>;
    };
  }>;
};
type TelegramUpdate = {
  update_id: number;
  message?: {
    chat?: { id?: number | string };
    from?: { id?: number | string };
    text?: string;
  };
  callback_query?: {
    id?: string;
    data?: string;
    from?: { id?: number | string };
    message?: { chat?: { id?: number | string } };
  };
};

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function pilotScopeWeek(scope: unknown) {
  const match = String(scope || "").match(/^pilot_week_(\d+)_scope$/);
  return match ? Number(match[1]) : 0;
}

function ownerFacingText(value: unknown, fallback = "") {
  return textValue(value, fallback)
    .replace(/\bHermes\b/g, "AgentResult")
    .replace(/\bhermes\b/g, "AgentResult");
}

function telegramCompletionText(value: unknown) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part) return textValue((part as Row).text, "");
      return "";
    }).filter(Boolean).join("\n");
  }
  return "";
}

function truncateText(value: string, maxLength = 120) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1).trim()}…` : value;
}

function channelLabel(value: unknown) {
  const channel = textValue(value, "manual").toLowerCase();
  const labels: Record<string, string> = {
    email: "Email",
    habr: "Habr",
    manual: "ручная передача",
    site: "сайт",
    telegram: "Telegram",
    vc: "VC.ru",
    "vc.ru": "VC.ru"
  };

  return labels[channel] ?? textValue(value, "ручная передача");
}

function normalizeChannel(value: string) {
  const text = value.toLowerCase();
  if (text.includes("telegram") || text.includes("телеграм") || text.includes("тг")) return "telegram";
  if (text.includes("email") || text.includes("почт")) return "email";
  if (text.includes("habr") || text.includes("хабр")) return "habr";
  if (text.includes("vc")) return "vc";
  if (text.includes("сайт") || text.includes("cms")) return "site";
  return "manual";
}

function riskLabel(value: unknown) {
  const risk = textValue(value, "").toLowerCase();
  const labels: Record<string, string> = {
    "channel publishing": "публикация в канал",
    "public claim": "публичное утверждение",
    "sensitive claim": "чувствительное утверждение"
  };

  return labels[risk] ?? textValue(value, "");
}

function riskLine(riskFlags: unknown[]) {
  const risks = riskFlags.map(riskLabel).filter(Boolean);
  return risks.length ? `Риски: ${risks.join(", ")}` : "";
}

function approvalDisplayTitle(approval: Row, contentById?: Map<unknown, Row>) {
  const contentItem = typeof approval.target_id === "string" ? contentById?.get(approval.target_id) : null;
  return ownerFacingText(contentItem?.title, "") ||
    ownerFacingText(approval.summary, "Материал ждёт решения")
      .replace(/^Согласовать материал AgentResult:\s*/i, "")
      .replace(/^Согласовать Telegram-пост\s*/i, "");
}

function telegramMetricLines(input: {
  decisions?: number;
  handedOff?: number;
  leads?: number;
  money?: number;
  published?: number;
}) {
  return [
    typeof input.decisions === "number" ? `Решения: ${input.decisions}` : null,
    typeof input.handedOff === "number" ? `Передано вручную: ${input.handedOff}` : null,
    typeof input.published === "number" ? `Вышло: ${input.published}` : null,
    typeof input.leads === "number" ? `Заявки: ${input.leads}` : null,
    Number(input.money ?? 0) > 0 ? `Деньги: ${input.money}` : null
  ].filter((line): line is string => Boolean(line));
}

function priorityMetricLines(priority: OwnerPriority, counts: { decisions: number; handedOff: number; preparing: number }) {
  if (priority.type === "confirm_publication") return [`Ждёт подтверждения: ${counts.handedOff}`];
  if (priority.type === "approval") return [`Требует решения: ${counts.decisions}`];
  if (priority.type === "preparing") return [`В подготовке: ${counts.preparing}`];
  return ["Срочных действий нет"];
}

function compactStateBlock(label: string, items: string[], empty = "нет", totalCount = items.length) {
  const lines = [`${label}: ${totalCount || empty}`];
  if (items.length) lines.push(...items.slice(0, 3).map((item) => `- ${truncateText(item, 90)}`));
  return lines;
}

function ownerPriority(input: { decisions: Row[]; handoffs: Row[]; preparing: Row[] }): OwnerPriority {
  if (input.handoffs.length) return { type: "confirm_publication", handoff: input.handoffs[0] };
  if (input.decisions.length) return { type: "approval", decision: input.decisions[0] };
  if (input.preparing.length) return { type: "preparing", preparingTask: input.preparing[0] };
  return { type: "new_topic" };
}

function ownerBriefNextAction(pendingApprovals: Row[], handedOffItems: Row[], hermesDraftTasks: Row[] = []) {
  const priority = ownerPriority({
    decisions: pendingApprovals,
    handoffs: handedOffItems,
    preparing: hermesDraftTasks
  });

  if (priority.type === "confirm_publication") {
    return {
      type: "confirm_publication",
      label: "Подтвердить выход",
      title: ownerFacingText(priority.handoff.title, "Переданный материал ждёт подтверждения"),
      targetId: priority.handoff.id ?? null
    };
  }

  if (priority.type === "approval") {
    return {
      type: "approval",
      label: "Открыть решение",
      title: ownerFacingText(priority.decision.summary, "Есть материал на согласование"),
      targetId: priority.decision.id ?? null
    };
  }

  if (priority.type === "preparing") {
    const payload = priority.preparingTask.payload && typeof priority.preparingTask.payload === "object" ? priority.preparingTask.payload as Row : {};
    return {
      type: "preparing",
      label: "Дождаться черновика",
      title: `AgentResult готовит черновик: ${ownerFacingText(payload.title, "материал")}`,
      targetId: priority.preparingTask.id ?? null
    };
  }

  return {
    type: "new_topic",
    label: "Поставить тему в работу",
    title: "Поставить следующую тему или задачу в подготовку",
    targetId: null
  };
}

function approvalButtons(approval: Row): TelegramButton[] {
  const targetId = typeof approval.id === "string" ? approval.id : null;
  return [
    {
      action: "approval.approve",
      callbackData: targetId ? `approval.approve:${targetId}` : null,
      label: "Согласовать",
      targetId,
      targetType: "approval"
    },
    {
      action: "approval.request_changes",
      callbackData: targetId ? `approval.request_changes:${targetId}` : null,
      label: "Нужны правки",
      targetId,
      targetType: "approval"
    }
  ];
}

function handoffButtons(item: Row): TelegramButton[] {
  const targetId = typeof item.id === "string" ? item.id : null;
  return [
    {
      action: "publishing.confirm_live",
      callbackData: targetId ? `publishing.confirm_live:${targetId}` : null,
      label: "Подтвердить выход",
      targetId,
      targetType: "publishing_calendar_item"
    }
  ];
}

function parseTelegramCallbackData(data: string): TelegramActionInput | null {
  try {
    const jsonAction = telegramActionSchema.safeParse(JSON.parse(data));
    if (jsonAction.success) return jsonAction.data;
  } catch {
    // Telegram callback data is normally a compact string, JSON is only supported for local tests.
  }

  const separator = data.indexOf(":");
  if (separator === -1) return null;

  const action = data.slice(0, separator);
  const targetId = data.slice(separator + 1);
  const parsed = telegramActionSchema.safeParse({ action, targetId });

  return parsed.success ? parsed.data : null;
}

function parseTelegramWebhookAction(payload: unknown): TelegramActionInput | null {
  const parsed = telegramWebhookSchema.safeParse(payload);
  const callbackData = parsed.success ? parsed.data.callback_query?.data : null;

  return callbackData ? parseTelegramCallbackData(callbackData) : null;
}

function parseTelegramCommandCallbackData(data: string): ParsedTelegramCommandCallback | null {
  if (!data.startsWith("cmd:")) return null;

  const [, command = "", targetId] = data.split(":");
  const parsed = telegramCommandSchema.safeParse({
    command,
    ...(targetId ? { targetId } : {})
  });

  return parsed.success ? {
    command: parsed.data.command,
    ...(parsed.data.targetId ? { targetId: parsed.data.targetId } : {})
  } : null;
}

function parseTelegramWebhookCommand(payload: unknown): ParsedTelegramCommandCallback | null {
  const parsed = telegramWebhookSchema.safeParse(payload);
  const callbackData = parsed.success ? parsed.data.callback_query?.data : null;

  return callbackData ? parseTelegramCommandCallbackData(callbackData) : null;
}

function renderOwnerBriefMessage(input: {
  contentItems: Row[];
  handedOffItems: Row[];
  hermesDraftTasks: Row[];
  latestSummary: Row;
  pendingApprovals: Row[];
  publishedItems: Row[];
}) {
  const { contentItems, handedOffItems, hermesDraftTasks, pendingApprovals } = input;
  const contentById = new Map(contentItems.map((row) => [row.id, row]));
  const priority = ownerPriority({
    decisions: pendingApprovals,
    handoffs: handedOffItems,
    preparing: hermesDraftTasks
  });
  const preparingTitles = hermesDraftTasks.map((row) => {
    const payload = row.payload && typeof row.payload === "object" ? row.payload as Row : {};
    return ownerFacingText(payload.title, "материал");
  });
  const lines = [
    "AgentResult OS",
    "",
    ...compactStateBlock("Ждёт выхода", handedOffItems.map((row) => ownerFacingText(row.title, "Переданный материал"))),
    "",
    ...compactStateBlock("Ждёт решения", pendingApprovals.map((row) => approvalDisplayTitle(row, contentById))),
    "",
    ...compactStateBlock("Готовится", preparingTitles)
  ];

  if (priority.type === "confirm_publication") {
    lines.push("");
    lines.push("Приоритет: подтвердить выход.");
    if (pendingApprovals.length) {
      lines.push(`Также готов новый материал: ${truncateText(approvalDisplayTitle(pendingApprovals[0], contentById))}`);
    }
  } else if (priority.type === "approval") {
    lines.push("");
    lines.push("Приоритет: принять решение.");
  } else if (priority.type === "preparing") {
    lines.push("");
    lines.push("Следующий шаг: дождаться черновика и принять решение.");
  } else {
    lines.push("");
    lines.push("Следующий шаг: поставить следующую тему в работу.");
  }

  const buttons =
    priority.type === "confirm_publication" ? handoffButtons(priority.handoff) :
    priority.type === "approval" ? approvalButtons(priority.decision) :
    [];

  return {
    text: lines.join("\n"),
    buttons,
    delivery: "preview_only"
  };
}

function telegramInlineKeyboard(buttons: TelegramButton[]) {
  const activeButtons = buttons.filter((button) => typeof button.callbackData === "string" && button.callbackData);
  if (!activeButtons.length) return undefined;

  return {
    inline_keyboard: [
      activeButtons.map((button) => ({
        text: button.label,
        callback_data: button.callbackData
      }))
    ]
  };
}

function telegramCommandKeyboard(buttons: TelegramCommandButton[] | undefined) {
  const activeButtons = (buttons ?? []).filter((button) => button.command && button.label);
  if (!activeButtons.length) return undefined;

  return {
    inline_keyboard: [
      activeButtons.map((button) => {
        return {
          text: button.label,
          callback_data: `cmd:${button.command}${button.targetId ? `:${button.targetId}` : ""}`
        };
      })
    ]
  };
}

function buildOwnerBrief(input: OwnerBriefInput) {
  const { approvals, calendar, contentItems, latestSummary, publicationResults, tasks } = input;
  const pendingApprovals = approvals.filter((row) => row.status === "pending");
  const handedOffItems = calendar.filter((row) => row.status === "handed_off");
  const publishedItems = calendar.filter((row) => row.status === "published");
  const hermesDraftTasks = tasks.filter((row) => {
    const payload = row.payload && typeof row.payload === "object" ? row.payload as Row : {};
    const status = textValue(row.status, "");
    const source = textValue(payload.source, "");
    return payload.expectedArtifact === "draft" &&
      ["telegram_onboarding", "telegram_next_material"].includes(source) &&
      ["queued", "dispatched", "dispatch_prepared", "running"].includes(status);
  });
  const contentById = new Map(contentItems.map((row) => [row.id, row]));

  return {
    surface: "telegram_control",
    message: "Короткая сводка для решения собственника",
    counts: {
      decisions: pendingApprovals.length,
      handedOff: handedOffItems.length,
      preparing: hermesDraftTasks.length,
      published: publishedItems.length,
      leads: Number(latestSummary.leads ?? 0),
      money: Number(latestSummary.recovered_payments ?? 0)
    },
    decisions: pendingApprovals.slice(0, 5).map((row) => {
      const contentItem = typeof row.target_id === "string" ? contentById.get(row.target_id) : null;
      const contentText = ownerFacingText(contentItem?.body_md, "");

      return {
        id: row.id,
        title: ownerFacingText(row.summary, "Материал ждёт решения"),
        scope: row.scope ?? null,
        riskFlags: Array.isArray(row.risk_flags) ? row.risk_flags : [],
        targetType: row.target_type ?? null,
        targetId: row.target_id ?? null,
        contentItemId: contentItem?.id ?? null,
        contentTitle: contentItem ? ownerFacingText(contentItem.title, "Материал") : null,
        contentType: contentItem?.content_type ?? null,
        channel: contentItem?.channel ?? null,
        contentPreview: contentText ? truncateText(contentText, 700) : null,
        contentText: contentText || null
      };
    }),
    handoffs: handedOffItems.slice(0, 5).map((row) => ({
      id: row.id,
      title: ownerFacingText(row.title, "Переданный материал"),
      channel: row.channel ?? "manual",
      scheduledFor: row.scheduled_for ?? null
    })),
    preparing: hermesDraftTasks.slice(0, 5).map((row) => {
      const payload = row.payload && typeof row.payload === "object" ? row.payload as Row : {};
      return {
        channel: textValue(payload.channel, "telegram"),
        createdAt: row.created_at ?? null,
        expectedResult: payload.expectedArtifact === "draft" ? "черновик на согласование" : "подготовленный результат",
        id: row.id,
        status: row.status,
        title: ownerFacingText(payload.title, "Материал AgentResult"),
        taskType: row.task_type ?? null,
        updatedAt: row.updated_at ?? null
      };
    }),
    results: {
      published: publishedItems.length,
      manualHandoffWaiting: handedOffItems.length,
      leads: Number(latestSummary.leads ?? 0),
      recoveredPayments: Number(latestSummary.recovered_payments ?? 0)
    },
    publishedResults: publicationResults.slice(0, 5).map((row) => ({
      id: row.id,
      title: ownerFacingText(row.title, "Опубликованный материал"),
      channel: row.channel ?? "manual",
      format: row.format ?? "publication",
      publicationUrl: row.publication_url ?? null,
      confirmedAt: row.confirmed_at ?? null,
      primaryReactions: row.primary_reactions && typeof row.primary_reactions === "object" ? row.primary_reactions : {},
      nextStep: row.next_step ?? "leave",
      nextStepNote: row.next_step_note ?? "",
      metadata: row.metadata ?? {}
    })),
    telegramMessage: renderOwnerBriefMessage({
      contentItems,
      handedOffItems,
      hermesDraftTasks,
      latestSummary,
      pendingApprovals,
      publishedItems
    }),
    nextAction: ownerBriefNextAction(pendingApprovals, handedOffItems, hermesDraftTasks),
    updatedAt: new Date().toISOString()
  };
}

async function loadOwnerBriefData(tenantId: string) {
  const [approvalsResult, calendarResult, contentItemsResult, latestImport, publicationResults, tasksResult] = await Promise.all([
    query("select * from approvals where tenant_id = $1 order by created_at desc limit 200", [tenantId]),
    query("select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 300", [tenantId]),
    query("select * from content_items where tenant_id = $1 order by created_at desc limit 200", [tenantId]),
    query("select * from analytics_imports where tenant_id = $1 order by created_at desc limit $2", [tenantId, 1]).catch(() => ({
      rows: []
    })),
    listPublicationResults(tenantId),
    query("select * from tasks where tenant_id = $1 order by updated_at desc limit 200", [tenantId])
  ]);
  const latestSummary = latestImport.rows[0]?.payload && typeof latestImport.rows[0].payload === "object"
    ? (latestImport.rows[0].payload as Row)
    : {};

  return {
    approvals: approvalsResult.rows as Row[],
    calendar: calendarResult.rows as Row[],
    contentItems: contentItemsResult.rows as Row[],
    latestSummary,
    publicationResults: publicationResults as Row[],
    tasks: tasksResult.rows as Row[]
  };
}

async function loadOnboardingState(tenantId: string): Promise<(OnboardingState & { id?: string }) | null> {
  const result = await query(
    "select * from integrations where tenant_id = $1 order by created_at desc limit $2",
    [tenantId, 200]
  );
  const row = (result.rows as Row[]).find((item) => item.provider === "telegram_onboarding" && item.status === "active");
  const parsed = onboardingStateSchema.safeParse(row?.config);

  return row && parsed.success ? { ...parsed.data, id: typeof row.id === "string" ? row.id : undefined } : null;
}

async function saveOnboardingState(tenantId: string, state: OnboardingState & { id?: string }) {
  const payload: OnboardingState = {
    answers: state.answers,
    ...(state.completedAt ? { completedAt: state.completedAt } : {}),
    step: state.step,
    updatedAt: new Date().toISOString()
  };

  if (state.id) {
    await patchJson("integrations", state.id, {
      provider: "telegram_onboarding",
      status: state.step === "done" ? "completed" : "active",
      config: payload
    }, tenantId);
    return { ...payload, id: state.id };
  }

  const row = await insertJson("integrations", {
    provider: "telegram_onboarding",
    status: state.step === "done" ? "completed" : "active",
    config: payload,
    last_checked_at: null
  }, tenantId);

  return { ...payload, id: typeof row.id === "string" ? row.id : undefined };
}

async function loadPublicationResultConfirmationState(tenantId: string): Promise<(PublicationResultConfirmationState & { id?: string }) | null> {
  const result = await query(
    "select * from integrations where tenant_id = $1 order by created_at desc limit $2",
    [tenantId, 200]
  );
  const row = (result.rows as Row[]).find((item) => item.provider === "telegram_publication_result_confirmation" && item.status === "active");
  const parsed = publicationResultConfirmationStateSchema.safeParse(row?.config);

  return row && parsed.success ? { ...parsed.data, id: typeof row.id === "string" ? row.id : undefined } : null;
}

async function savePublicationResultConfirmationState(
  tenantId: string,
  state: PublicationResultConfirmationState & { id?: string }
) {
  const payload: PublicationResultConfirmationState = {
    answers: state.answers,
    calendarItemId: state.calendarItemId,
    ...(state.completedAt ? { completedAt: state.completedAt } : {}),
    step: state.step,
    updatedAt: new Date().toISOString()
  };

  if (state.id) {
    await patchJson("integrations", state.id, {
      provider: "telegram_publication_result_confirmation",
      status: state.step === "done" ? "completed" : "active",
      config: payload
    }, tenantId);
    return { ...payload, id: state.id };
  }

  const row = await insertJson("integrations", {
    provider: "telegram_publication_result_confirmation",
    status: state.step === "done" ? "completed" : "active",
    config: payload,
    last_checked_at: null
  }, tenantId);

  return { ...payload, id: typeof row.id === "string" ? row.id : undefined };
}

function pilotStartCommandFromText(command: string) {
  return command === "pilot"
    || command === "start_pilot"
    || command === "pilot_start"
    || command === "week_1_pilot"
    || command === "week-1-pilot"
    || command === "week1_pilot"
    || command.startsWith("pilot ")
    || command.startsWith("start_pilot ")
    || command.startsWith("week_1_pilot ")
    || command.startsWith("week-1-pilot ")
    || command.startsWith("week1_pilot ");
}

function weekTwoStartCommandFromText(command: string) {
  return command === "week2"
    || command === "week_2"
    || command === "week-2"
    || command === "start_week2"
    || command === "start_week_2"
    || command === "week2_start"
    || command === "week_2_start"
    || command.startsWith("week2 ")
    || command.startsWith("week_2 ")
    || command.startsWith("week-2 ")
    || command.startsWith("start_week2 ")
    || command.startsWith("start_week_2 ");
}

function weekThreeStartCommandFromText(command: string) {
  return command === "week3"
    || command === "week_3"
    || command === "week-3"
    || command === "start_week3"
    || command === "start_week_3"
    || command === "week3_start"
    || command === "week_3_start"
    || command.startsWith("week3 ")
    || command.startsWith("week_3 ")
    || command.startsWith("week-3 ")
    || command.startsWith("start_week3 ")
    || command.startsWith("start_week_3 ");
}

function weekFourStartCommandFromText(command: string) {
  return command === "week4"
    || command === "week_4"
    || command === "week-4"
    || command === "start_week4"
    || command === "start_week_4"
    || command === "week4_start"
    || command === "week_4_start"
    || command.startsWith("week4 ")
    || command.startsWith("week_4 ")
    || command.startsWith("week-4 ")
    || command.startsWith("start_week4 ")
    || command.startsWith("start_week_4 ");
}

function weekFiveStartCommandFromText(command: string) {
  return command === "week5"
    || command === "week_5"
    || command === "week-5"
    || command === "start_week5"
    || command === "start_week_5"
    || command === "week5_start"
    || command === "week_5_start"
    || command.startsWith("week5 ")
    || command.startsWith("week_5 ")
    || command.startsWith("week-5 ")
    || command.startsWith("start_week5 ")
    || command.startsWith("start_week_5 ");
}

function weekTwoStatusCommandFromText(command: string) {
  return command === "week2_status"
    || command === "week_2_status"
    || command === "week-2-status"
    || command === "week2_board"
    || command === "week_2_board"
    || command === "week-2-board"
    || command === "w2"
    || command === "w2_status"
    || command === "статус_week2"
    || command === "статус_week_2";
}

function weekThreeStatusCommandFromText(command: string) {
  return command === "week3_status"
    || command === "week_3_status"
    || command === "week-3-status"
    || command === "week3_board"
    || command === "week_3_board"
    || command === "week-3-board"
    || command === "w3"
    || command === "w3_status"
    || command === "статус_week3"
    || command === "статус_week_3";
}

function weekFourStatusCommandFromText(command: string) {
  return command === "week4_status"
    || command === "week_4_status"
    || command === "week-4-status"
    || command === "week4_board"
    || command === "week_4_board"
    || command === "week-4-board"
    || command === "w4"
    || command === "w4_status"
    || command === "статус_week4"
    || command === "статус_week_4";
}

function weekFiveStatusCommandFromText(command: string) {
  return command === "week5_status"
    || command === "week_5_status"
    || command === "week-5-status"
    || command === "week5_board"
    || command === "week_5_board"
    || command === "week-5-board"
    || command === "w5"
    || command === "w5_status"
    || command === "статус_week5"
    || command === "статус_week_5";
}

function daySevenReviewCommandFromText(command: string): "expand" | "reuse" | "update" | "leave" | null {
  const normalized = command.replace(/^\/+/, "").trim().toLowerCase();
  if (!/^(day7|day_7|day-7|review|pilot_review|week_1_review|week-1-review)\b/.test(normalized)) return null;
  if (includesAny(normalized, ["reuse", "repurpose", "переиспольз", "ещё пост", "еще пост"])) return "reuse";
  if (includesAny(normalized, ["expand", "article", "расшир", "стать", "лонгрид"])) return "expand";
  if (includesAny(normalized, ["update", "revise", "обнов", "правк"])) return "update";
  if (includesAny(normalized, ["leave", "остав", "ничего", "как есть"])) return "leave";
  return "leave";
}

function daySevenReviewStepFromText(value: string): "expand" | "reuse" | "update" | "leave" {
  const normalized = value.trim().toLowerCase();
  if (includesAny(normalized, ["reuse", "repurpose", "переиспольз", "ещё пост", "еще пост"])) return "reuse";
  if (includesAny(normalized, ["expand", "article", "расшир", "стать", "лонгрид"])) return "expand";
  if (includesAny(normalized, ["update", "revise", "обнов", "правк"])) return "update";
  if (includesAny(normalized, ["leave", "остав", "ничего", "как есть"])) return "leave";
  return "leave";
}

function parsePilotStartIntake(input: TelegramCommandInput) {
  const raw = [input.command, input.note].filter(Boolean).join("\n");
  const normalizedLines = raw
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean);
  const fields: Record<string, string> = {};

  for (const line of normalizedLines) {
    const match = line.match(/^([^:=—-]{2,60})\s*[:=—-]\s*(.+)$/);
    if (!match) continue;
    const key = match[1].trim().toLowerCase();
    const value = match[2].trim();
    if (!value) continue;

    if (["icp", "сегмент", "клиент", "клиенты", "кому"].includes(key)) fields.icp = value;
    if (["channel", "канал", "площадка"].includes(key)) fields.channel = value;
    if (["material", "materialtitle", "first material", "тема", "материал", "первый материал"].includes(key)) fields.materialTitle = value;
    if (["approvalowner", "approval owner", "согласует", "собственник", "владелец согласования"].includes(key)) fields.approvalOwner = value;
    if (["releaseowner", "release owner", "выпуск", "ответственный за выпуск", "релиз"].includes(key)) fields.releaseOwner = value;
    if (["resultowner", "result owner", "результат", "ответственный за результат"].includes(key)) fields.resultOwner = value;
    if (["resultsource", "result source", "signal", "сигнал", "источник сигнала", "источник результата"].includes(key)) fields.resultSource = value;
    if (["forbiddenclaims", "forbidden claims", "forbidden", "запрет", "запрещено", "нельзя"].includes(key)) fields.forbiddenClaims = value;
  }

  const commandRemainder = input.command
    .replace(/^\/?(pilot|start_pilot|pilot_start|week_1_pilot|week-1-pilot|week1_pilot)\b/i, "")
    .trim();
  if (!fields.materialTitle && commandRemainder.length >= 8 && !commandRemainder.includes(":")) {
    fields.materialTitle = commandRemainder;
  }

  return fields;
}

function renderPilotStartMessage(input: { ownerBrief: OwnerBrief; pilot: Awaited<ReturnType<typeof startWeekOnePilot>> }) {
  const contentTitle = textValue(input.pilot.content?.title, "первый материал");
  const approvalId = textValue(input.pilot.approval?.id, "");
  const day7 = Array.isArray(input.pilot.calendar)
    ? input.pilot.calendar.find((item) => String(item.title).startsWith("Day 7:"))
    : null;

  return [
    "Week-1 pilot запущен.",
    "",
    `Первый материал: ${contentTitle}`,
    "Контур: тема -> черновик -> QA -> выпуск -> URL -> next content step.",
    "Сейчас следующий шаг: согласовать тему недели.",
    day7 ? `Day-7 review: ${textValue(day7.title, "review next content step")}` : "",
    approvalId ? `Approval ID: ${approvalId}` : ""
  ].filter(Boolean).join("\n");
}

async function startWeekOnePilotFromTelegram(input: TelegramCommandInput, context: TelegramExecutionContext) {
  const pilot = await startWeekOnePilot({
    ...parsePilotStartIntake(input),
    tenantId: context.tenantId,
    userId: context.userId
  });
  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);

  return {
    command: "pilot",
    text: renderPilotStartMessage({ ownerBrief, pilot }),
    buttons: briefCommandButtons(ownerBrief),
    ownerBrief,
    pilot
  };
}

function renderDaySevenReviewMessage(input: {
  nextStep: "expand" | "reuse" | "update" | "leave";
  review: NonNullable<Awaited<ReturnType<typeof completeDaySevenReview>>>;
}) {
  const labels = {
    expand: "расширить материал",
    reuse: "переиспользовать материал",
    update: "обновить опубликованный материал",
    leave: "оставить как опубликованное"
  };
  const lines = [
    "Day-7 review закрыт.",
    "",
    `Следующий контент-шаг: ${labels[input.nextStep]}.`
  ];

  if (input.review.target) {
    lines.push(`Создано: ${textValue(input.review.target.title ?? (input.review.target.payload as Row | undefined)?.title, "следующее действие")}`);
  }
  const weekTwoScope = input.review.week_2_scope && typeof input.review.week_2_scope === "object"
    ? input.review.week_2_scope as Row
    : null;
  const nextMaterial = weekTwoScope?.next_material && typeof weekTwoScope.next_material === "object"
    ? weekTwoScope.next_material as Row
    : null;
  if (weekTwoScope) {
    lines.push("");
    lines.push("Week-2 scope создан.");
    lines.push(`Канал: ${textValue(weekTwoScope.channel_constraint, "один проверенный канал")}.`);
    if (nextMaterial) lines.push(`Следующий материал: ${textValue(nextMaterial.title, "материал недели 2")}.`);
    lines.push("Нужно согласовать scope или запросить правки.");
  }

  return lines.join("\n");
}

async function completeDaySevenReviewFromTelegram(
  nextStep: "expand" | "reuse" | "update" | "leave",
  input: TelegramCommandInput,
  context: TelegramExecutionContext
) {
  const result = await completeDaySevenReview({
    tenantId: context.tenantId,
    userId: context.userId,
    publicationResultId: input.targetId,
    nextStep,
    note: input.note
  });
  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);

  if (!result) {
    return {
      command: "day7",
      text: "Day-7 review пока нельзя закрыть: нужен активный week-1 pilot и подтверждённый результат публикации.",
      buttons: publicationResultCommandButtons(ownerBrief),
      ownerBrief
    };
  }

  return {
    command: "day7",
    text: renderDaySevenReviewMessage({ nextStep, review: result }),
    buttons: pilotScopeCommandButtons(result.week_2_scope) || publicationResultCommandButtons(ownerBrief),
    ownerBrief,
    reviewResult: result
  };
}

type PilotWeekStartResult = NonNullable<Awaited<ReturnType<typeof startWeekTwoExecution>>>;
type ActivePilotWeekExecution = NonNullable<Awaited<ReturnType<typeof getActiveWeekTwoExecution>>>;
type PilotExecutionWeek = 2 | 3 | 4 | 5;

function renderPilotWeekExecutionMessage(result: PilotWeekStartResult, week: number) {
  const title = textValue(result.content?.title, `week-${week} material`);
  return [
    result.status === "already_started" ? `Week-${week} execution уже запущен.` : `Week-${week} execution запущен.`,
    "",
    `Материал: ${title}.`,
    `Следующий gate: согласовать week-${week} material перед QA и release handoff.`
  ].join("\n");
}

function renderWeekTwoExecutionMessage(result: PilotWeekStartResult) {
  return renderPilotWeekExecutionMessage(result, 2);
}

type PilotWeekReviewResult = NonNullable<Awaited<ReturnType<typeof completeWeekTwoReview>>> | NonNullable<Awaited<ReturnType<typeof completeWeekThreeReview>>> | NonNullable<Awaited<ReturnType<typeof completeWeekFourReview>>> | NonNullable<Awaited<ReturnType<typeof completeWeekFiveReview>>>;

function renderPilotWeekReviewMessage(input: {
  week: PilotExecutionWeek;
  nextStep: "expand" | "reuse" | "update" | "leave";
  review: PilotWeekReviewResult;
}) {
  const nextWeek = input.week + 1;
  const labels = {
    expand: "расширить материал",
    reuse: "переиспользовать материал",
    update: "обновить опубликованный материал",
    leave: "оставить как опубликованное"
  };
  const lines = [
    `Week-${input.week} review закрыт.`,
    "",
    `Следующий контент-шаг: ${labels[input.nextStep]}.`
  ];
  const nextScope = input.review[`week_${nextWeek}_scope`] && typeof input.review[`week_${nextWeek}_scope`] === "object"
    ? input.review[`week_${nextWeek}_scope`] as Row
    : null;
  const nextMaterial = nextScope?.next_material && typeof nextScope.next_material === "object"
    ? nextScope.next_material as Row
    : null;
  if (nextScope) {
    lines.push("");
    lines.push(`Week-${nextWeek} scope создан.`);
    lines.push(`Канал: ${textValue(nextScope.channel_constraint, "один проверенный канал")}.`);
    if (nextMaterial) lines.push(`Следующий материал: ${textValue(nextMaterial.title, `материал недели ${nextWeek}`)}.`);
    lines.push("Нужно согласовать scope или запросить правки.");
  }
  return lines.join("\n");
}

function renderActivePilotWeekExecutionMessage(execution: ActivePilotWeekExecution, week: number) {
  const title = textValue(execution.material?.title, `week-${week} material`);
  const roles = execution.roles && typeof execution.roles === "object" ? execution.roles as Row : {};
  const board = Array.isArray(execution.board) ? execution.board : [];
  const result = execution.publication_result && typeof execution.publication_result === "object" ? execution.publication_result as Row : null;
  const lines = [
    `Week-${week} execution: ${weekTwoGateTelegramLabel(textValue(execution.current_gate, "active"))}`,
    "",
    `Материал: ${title}.`,
    `Согласование: ${textValue(execution.material_approval?.status, "pending")}.`,
    `Owner: ${textValue(roles.approval_owner, "Founder / managing partner")}.`,
    `QA/release: ${textValue(roles.release_owner, "Content operator or chief of staff")}.`,
    `Result owner: ${textValue(roles.result_owner, "Content operator or chief of staff")}.`
  ];
  if (execution.channel_constraint) lines.push(`Канал: ${textValue(execution.channel_constraint, "one proven channel")}.`);
  if (board.length) {
    lines.push("", "Доска:");
    lines.push(...board.map((item) => `- ${textValue(item.title, `Week-${week} item`)} — ${textValue(item.status, "scheduled")}`));
  }
  if (result) {
    lines.push("", `URL: ${textValue(result.publication_url, "не указан")}.`);
    lines.push(`Следующий шаг: ${textValue(result.next_step, "leave")}.`);
  }
  lines.push("", `Следующее действие: ${weekTwoGateTelegramAction(textValue(execution.current_gate, "active"))}.`);
  return lines.join("\n");
}

function renderActiveWeekTwoExecutionMessage(execution: ActivePilotWeekExecution) {
  return renderActivePilotWeekExecutionMessage(execution, 2);
}

function weekTwoGateTelegramLabel(gate: string) {
  if (gate === "material_approval") return "согласование материала";
  if (gate === "qa_release_handoff") return "QA и передача на выпуск";
  if (gate === "url_confirmation") return "подтверждение URL";
  if (gate === "result_review") return "review результата";
  return "активно";
}

function weekTwoGateTelegramAction(gate: string) {
  if (gate === "material_approval") return "согласовать материал";
  if (gate === "qa_release_handoff") return "закрыть QA и передать в выпуск";
  if (gate === "url_confirmation") return "подтвердить URL публикации";
  if (gate === "result_review") return "выбрать следующий шаг";
  return "проверить статус";
}

function weekTwoExecutionCommandButtons(execution: Awaited<ReturnType<typeof getActiveWeekTwoExecution>> | null): TelegramCommandButton[] {
  return pilotWeekExecutionCommandButtons(execution, 2);
}

function pilotWeekExecutionCommandButtons(execution: Awaited<ReturnType<typeof getActiveWeekTwoExecution>> | null, week: number): TelegramCommandButton[] {
  if (!execution) return [commandButton(`week${week}`, `Запустить week-${week}`)];
  const gate = textValue(execution.current_gate, "");
  const actions = execution.actions && typeof execution.actions === "object" ? execution.actions as Row : {};
  if (gate === "material_approval") {
    const approve = actions.approve_material && typeof actions.approve_material === "object" ? actions.approve_material as Row : {};
    const approvalId = typeof approve.approval_id === "string" ? approve.approval_id : "";
    return approvalId ? [commandButton("osapprove", "Согласовать материал", approvalId)] : [commandButton("brief", "Сводка")];
  }
  if (gate === "qa_release_handoff") {
    const handoff = actions.handoff_release && typeof actions.handoff_release === "object" ? actions.handoff_release as Row : {};
    const calendarId = typeof handoff.calendar_item_id === "string" ? handoff.calendar_item_id : "";
    return calendarId ? [commandButton("handoff", "Передано в выпуск", calendarId)] : [commandButton("brief", "Сводка")];
  }
  if (gate === "url_confirmation") {
    const confirm = actions.confirm_url && typeof actions.confirm_url === "object" ? actions.confirm_url as Row : {};
    const calendarId = typeof confirm.calendar_item_id === "string" ? confirm.calendar_item_id : "";
    return calendarId ? [commandButton("published", "Подтвердить URL", calendarId)] : [commandButton("result", "Результат")];
  }
  const review = actions.review_result && typeof actions.review_result === "object" ? actions.review_result as Row : {};
  const resultId = typeof review.publication_result_id === "string" ? review.publication_result_id : "";
  return resultId
    ? [
        commandButton("reuse", "Переиспользовать", resultId),
        commandButton("expand", "Расширить", resultId),
        commandButton("update", "Обновить", resultId),
        commandButton("leave", "Оставить", resultId)
      ]
    : [commandButton("result", "Результат")];
}

async function completeWeekTwoReviewFromTelegram(
  nextStep: "expand" | "reuse" | "update" | "leave",
  input: TelegramCommandInput,
  context: TelegramExecutionContext
) {
  return completePilotWeekReviewFromTelegram(2, nextStep, input, context);
}

async function completeWeekThreeReviewFromTelegram(
  nextStep: "expand" | "reuse" | "update" | "leave",
  input: TelegramCommandInput,
  context: TelegramExecutionContext
) {
  return completePilotWeekReviewFromTelegram(3, nextStep, input, context);
}

async function completeWeekFourReviewFromTelegram(
  nextStep: "expand" | "reuse" | "update" | "leave",
  input: TelegramCommandInput,
  context: TelegramExecutionContext
) {
  return completePilotWeekReviewFromTelegram(4, nextStep, input, context);
}

async function completeWeekFiveReviewFromTelegram(
  nextStep: "expand" | "reuse" | "update" | "leave",
  input: TelegramCommandInput,
  context: TelegramExecutionContext
) {
  return completePilotWeekReviewFromTelegram(5, nextStep, input, context);
}

function pilotWeekReviewCommand(week: PilotExecutionWeek) {
  if (week === 5) return completeWeekFiveReview;
  if (week === 4) return completeWeekFourReview;
  if (week === 3) return completeWeekThreeReview;
  return completeWeekTwoReview;
}

async function completePilotWeekReviewFromTelegram(
  week: PilotExecutionWeek,
  nextStep: "expand" | "reuse" | "update" | "leave",
  input: TelegramCommandInput,
  context: TelegramExecutionContext
) {
  const completeReview = pilotWeekReviewCommand(week);
  const result = await completeReview({
    tenantId: context.tenantId,
    userId: context.userId,
    publicationResultId: input.targetId,
    nextStep,
    note: input.note
  });
  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);

  if (!result) {
    return {
      command: `week${week}_review`,
      text: `Week-${week} review пока нельзя закрыть: нужен активный week-${week} execution на gate \`result_review\` и подтверждённый URL.`,
      buttons: publicationResultCommandButtons(ownerBrief),
      ownerBrief
    };
  }

  const nextScope = (result as Row)[`week_${week + 1}_scope`];
  return {
    command: `week${week}_review`,
    text: renderPilotWeekReviewMessage({ week, nextStep, review: result }),
    buttons: pilotScopeCommandButtons(nextScope) || publicationResultCommandButtons(ownerBrief),
    ownerBrief,
    reviewResult: result
  };
}

async function startWeekTwoExecutionFromTelegram(input: TelegramCommandInput, context: TelegramExecutionContext) {
  return startPilotWeekExecutionFromTelegram(input, context, 2);
}

async function startWeekThreeExecutionFromTelegram(input: TelegramCommandInput, context: TelegramExecutionContext) {
  return startPilotWeekExecutionFromTelegram(input, context, 3);
}

async function startWeekFourExecutionFromTelegram(input: TelegramCommandInput, context: TelegramExecutionContext) {
  return startPilotWeekExecutionFromTelegram(input, context, 4);
}

async function startWeekFiveExecutionFromTelegram(input: TelegramCommandInput, context: TelegramExecutionContext) {
  return startPilotWeekExecutionFromTelegram(input, context, 5);
}

function pilotWeekStartCommand(week: PilotExecutionWeek) {
  if (week === 5) return startWeekFiveExecution;
  if (week === 4) return startWeekFourExecution;
  if (week === 3) return startWeekThreeExecution;
  return startWeekTwoExecution;
}

function pilotWeekActiveExecutionCommand(week: PilotExecutionWeek) {
  if (week === 5) return getActiveWeekFiveExecution;
  if (week === 4) return getActiveWeekFourExecution;
  if (week === 3) return getActiveWeekThreeExecution;
  return getActiveWeekTwoExecution;
}

function pilotWeekExecutionResultPayload(week: PilotExecutionWeek, execution: PilotWeekStartResult | ActivePilotWeekExecution) {
  if (week === 5) return { pilotWeekExecution: execution, weekFiveExecution: execution };
  if (week === 4) return { pilotWeekExecution: execution, weekFourExecution: execution };
  if (week === 3) return { pilotWeekExecution: execution, weekThreeExecution: execution };
  return { pilotWeekExecution: execution, weekTwoExecution: execution };
}

async function startPilotWeekExecutionFromTelegram(input: TelegramCommandInput, context: TelegramExecutionContext, week: PilotExecutionWeek) {
  const startExecution = pilotWeekStartCommand(week);
  const getActiveExecution = pilotWeekActiveExecutionCommand(week);
  const result = await startExecution({
    tenantId: context.tenantId,
    userId: context.userId,
    note: input.note
  });
  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);

  if (!result) {
    return {
      command: `week${week}`,
      text: `Week-${week} execution пока нельзя запустить: сначала согласуйте \`pilot_week_${week}_scope\`.`,
      buttons: briefCommandButtons(ownerBrief),
      ownerBrief
    };
  }

  const activeExecution = await getActiveExecution(context.tenantId);
  return {
    command: `week${week}`,
    text: activeExecution ? renderActivePilotWeekExecutionMessage(activeExecution, week) : renderPilotWeekExecutionMessage(result, week),
    buttons: pilotWeekExecutionCommandButtons(activeExecution, week),
    ownerBrief,
    ...pilotWeekExecutionResultPayload(week, result)
  };
}

async function showWeekTwoExecutionFromTelegram(context: TelegramExecutionContext) {
  return showPilotWeekExecutionFromTelegram(context, 2);
}

async function showWeekThreeExecutionFromTelegram(context: TelegramExecutionContext) {
  return showPilotWeekExecutionFromTelegram(context, 3);
}

async function showWeekFourExecutionFromTelegram(context: TelegramExecutionContext) {
  return showPilotWeekExecutionFromTelegram(context, 4);
}

async function showWeekFiveExecutionFromTelegram(context: TelegramExecutionContext) {
  return showPilotWeekExecutionFromTelegram(context, 5);
}

async function showPilotWeekExecutionFromTelegram(context: TelegramExecutionContext, week: PilotExecutionWeek) {
  const getActiveExecution = pilotWeekActiveExecutionCommand(week);
  const execution = await getActiveExecution(context.tenantId);
  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);
  if (!execution) {
    return {
      command: `week${week}_status`,
      text: `Активный week-${week} execution пока не найден. Запустите \`/week${week}\` после согласования \`pilot_week_${week}_scope\`.`,
      buttons: briefCommandButtons(ownerBrief),
      ownerBrief
    };
  }
  return {
    command: `week${week}_status`,
    text: renderActivePilotWeekExecutionMessage(execution, week),
    buttons: pilotWeekExecutionCommandButtons(execution, week),
    ownerBrief,
    ...pilotWeekExecutionResultPayload(week, execution)
  };
}

async function executeTelegramAction(input: TelegramActionInput, context: { tenantId: string; userId?: string }) {
  let result: Row | null = null;
  let weekTwoExecution: Awaited<ReturnType<typeof startWeekTwoExecution>> | null = null;
  let pilotWeekExecution: PilotWeekStartResult | null = null;

  if (input.action === "approval.approve") {
    result = await decideApproval({
      id: input.targetId,
      tenantId: context.tenantId,
      status: "approved",
      decidedBy: context.userId,
      decisionNote: input.note
    });
    const pilotWeek = pilotScopeWeek(result?.scope);
    if (pilotWeek === 2 && result?.status === "approved") {
      pilotWeekExecution = await startWeekTwoExecution({
        tenantId: context.tenantId,
        userId: context.userId,
        note: input.note || "Started from Telegram scope approval."
      });
      weekTwoExecution = pilotWeekExecution;
    }
  }

  if (input.action === "approval.request_changes") {
    result = await decideApproval({
      id: input.targetId,
      tenantId: context.tenantId,
      status: "changes_requested",
      decidedBy: context.userId,
      decisionNote: input.note || "Нужны правки из Telegram-контура"
    });
  }

  if (input.action === "publishing.confirm_live") {
    const confirmation = await startPublicationResultConfirmation(input.targetId, context);
    return {
      action: input.action,
      result: null,
      ownerBrief: confirmation.ownerBrief,
      text: confirmation.text,
      buttons: confirmation.buttons
    };
  }

  const briefData = await loadOwnerBriefData(context.tenantId);
  return {
    action: input.action,
    result,
    ownerBrief: buildOwnerBrief(briefData),
    pilotWeekExecution,
    weekTwoExecution
  };
}

function onboardingPrompt(step: OnboardingStep) {
  if (step === "offer") {
    return [
      "Настроим Growth Control.",
      "",
      "Шаг 1/7 — оффер.",
      "Что продаёте и какой результат должен увидеть клиент?"
    ].join("\n");
  }

  if (step === "client") {
    return [
      "Шаг 2/7 — клиент.",
      "Кому продаёте: сегмент, роль ЛПР, главная боль?"
    ].join("\n");
  }

  if (step === "channel") {
    return [
      "Шаг 3/7 — канал выпуска.",
      "Куда в первую очередь выпускаем материалы: Telegram, сайт, email, VC/Habr или ручная передача ответственному?"
    ].join("\n");
  }

  if (step === "release_owner") {
    return [
      "Шаг 4/7 — ответственный за выпуск.",
      "Кто получает согласованный материал и подтверждает, что он вышел?"
    ].join("\n");
  }

  if (step === "first_signal_source") {
    return [
      "Шаг 5/7 — первый сигнал.",
      "Где проверяем результат: заявки, CRM, ответы, форма, канал или ручная отметка?"
    ].join("\n");
  }

  if (step === "approval_rules") {
    return [
      "Шаг 6/7 — правила согласования.",
      "Что обязательно должно ждать вашего решения перед выпуском?"
    ].join("\n");
  }

  return [
    "Шаг 7/7 — первый материал.",
    "Какую тему или задачу подготовить первой?"
  ].join("\n");
}

function onboardingProgressLine(state: OnboardingState) {
  const labels: Record<OnboardingStep, string> = {
    approval_rules: "правила согласования",
    channel: "канал выпуска",
    client: "клиент",
    done: "готово",
    first_material: "первый материал",
    first_signal_source: "первый сигнал",
    offer: "оффер",
    release_owner: "ответственный за выпуск"
  };

  return `Текущий шаг: ${labels[state.step]}.`;
}

function renderOnboardingMessage(state?: OnboardingState) {
  if (state && state.step !== "done") {
    return [
      "Настройка уже начата.",
      onboardingProgressLine(state),
      "",
      onboardingPrompt(state.step)
    ].join("\n");
  }

  return [
    "AgentResult Growth Control — настройка",
    "",
    "Зафиксируем минимум для первого рабочего цикла:",
    "оффер, клиент, канал выпуска, ответственный, первый сигнал, правила и первый материал.",
    "",
    onboardingPrompt("offer")
  ].join("\n");
}

function nextOnboardingStep(step: OnboardingStep): OnboardingStep {
  if (step === "offer") return "client";
  if (step === "client") return "channel";
  if (step === "channel") return "release_owner";
  if (step === "release_owner") return "first_signal_source";
  if (step === "first_signal_source") return "approval_rules";
  if (step === "approval_rules") return "first_material";
  return "done";
}

function onboardingAnswerKey(step: OnboardingStep) {
  const keys: Record<OnboardingStep, string> = {
    approval_rules: "approvalRules",
    channel: "channel",
    client: "client",
    done: "done",
    first_material: "firstMaterial",
    first_signal_source: "firstSignalSource",
    offer: "offer",
    release_owner: "releaseOwner"
  };

  return keys[step];
}

function onboardingTitle(value: string) {
  const normalized = value.replace(/^тема\s*[:—-]\s*/i, "").trim();
  return truncateText(normalized || "Первый материал Growth Control", 90);
}

async function updateCompanyFromOnboarding(tenantId: string, answers: Record<string, string>) {
  const existing = await query("select * from companies where tenant_id = $1 order by created_at asc limit 1", [tenantId]);
  const current = existing.rows[0] as Row | undefined;
  const profile = current?.profile && typeof current.profile === "object" ? current.profile as Row : {};
  const mergedProfile = {
    ...profile,
    approvalOwner: textValue(answers.approvalRules, textValue(profile.approvalOwner, "")),
    channels: channelLabel(normalizeChannel(textValue(answers.channel, textValue(profile.channels, "manual")))),
    firstSignalSource: textValue(answers.firstSignalSource, textValue(profile.firstSignalSource, "")),
    icp: textValue(answers.client, textValue(profile.icp, "")),
    onboarding: {
      channel: normalizeChannel(textValue(answers.channel, "manual")),
      completedAt: new Date().toISOString(),
      firstMaterial: textValue(answers.firstMaterial, ""),
      firstSignalSource: textValue(answers.firstSignalSource, ""),
      releaseOwner: textValue(answers.releaseOwner, ""),
      source: "telegram_owner_control"
    },
    positioning: textValue(answers.offer, textValue(profile.positioning, "")),
    releaseOwner: textValue(answers.releaseOwner, textValue(profile.releaseOwner, ""))
  };

  if (current?.id) {
    await query(
      `update companies set name = coalesce($2, name), profile = coalesce($3, profile), website_url = coalesce($4, website_url), updated_at = now()
       where id = $1 returning *`,
      [current.id, current.name ?? null, mergedProfile, current.website_url ?? null]
    );
    return;
  }

  await query("insert into companies (tenant_id, name, profile, website_url) values ($1, $2, $3, $4) returning *", [
    tenantId,
    "Новая B2B-компания",
    mergedProfile,
    null
  ]);
}

async function createOnboardingHermesDraftTask(context: { tenantId: string; userId?: string }, answers: Record<string, string>) {
  const channel = normalizeChannel(textValue(answers.channel, "manual"));
  const title = onboardingTitle(textValue(answers.firstMaterial, "Первый материал Growth Control"));
  return createAgentTask({
    tenantId: context.tenantId,
    role: "content_writer",
    taskType: "prepare_onboarding_first_material",
    payload: {
      approvalRules: textValue(answers.approvalRules, ""),
      channel,
      client: textValue(answers.client, ""),
      contentType: channel === "email" ? "email" : "telegram_post",
      expectedArtifact: "draft",
      firstSignalSource: textValue(answers.firstSignalSource, ""),
      offer: textValue(answers.offer, ""),
      releaseOwner: textValue(answers.releaseOwner, ""),
      source: "telegram_onboarding",
      title
    },
    createdBy: context.userId
  });
}

function defaultNextMaterialTitle(value?: string) {
  return onboardingTitle(textValue(value, "Следующий материал AgentResult"));
}

function createNextMaterialTask(context: { tenantId: string; userId?: string }, input: { channel?: string; topic?: string }) {
  const channel = normalizeChannel(textValue(input.channel, "telegram"));
  const title = defaultNextMaterialTitle(input.topic);
  return createAgentTask({
    tenantId: context.tenantId,
    role: "content_writer",
    taskType: "prepare_next_material",
    payload: {
      channel,
      contentType: channel === "email" ? "email" : "telegram_post",
      expectedArtifact: "draft",
      source: "telegram_next_material",
      title
    },
    createdBy: context.userId
  });
}

function runHermesDraftJob(input: {
  app?: FastifyInstance;
  chatId?: number | string;
  integrationProvider: string;
  taskId: string;
  tenantId: string;
  title: string;
  userId?: string;
}) {
  void (async () => {
    try {
      const dispatch = await dispatchHermesTask({
        taskId: input.taskId,
        tenantId: input.tenantId,
        userId: input.userId
      });
      const delivery = dispatch && typeof dispatch === "object" ? (dispatch as Row).delivery : null;
      const briefData = await loadOwnerBriefData(input.tenantId);
      const ownerBrief = buildOwnerBrief(briefData);

      if (input.chatId && delivery === "completed") {
        await sendTelegramOwnerControlMessage({
          chatId: input.chatId,
          text: [
            "Черновик готов к решению.",
            "",
            input.title,
            "",
            "Можно посмотреть материал, согласовать или вернуть на правки."
          ].join("\n"),
          buttons: briefCommandButtons(ownerBrief)
        });
      } else if (input.chatId) {
        await sendTelegramOwnerControlMessage({
          chatId: input.chatId,
          text: "AgentResult пока не подготовил черновик. Задача сохранена, проверьте статус позже.",
          buttons: briefCommandButtons(ownerBrief)
        });
      }

      await query(
        `insert into integrations (tenant_id, provider, status, config)
         values ($1, $2, $3, $4)
         returning *`,
        [input.tenantId, input.integrationProvider, textValue(String(delivery ?? "unknown"), "unknown"), { taskId: input.taskId, delivery }]
      );
    } catch (error) {
      input.app?.log.error({ error, taskId: input.taskId }, "Telegram onboarding Hermes background job failed");
      if (input.chatId) {
        await sendTelegramOwnerControlMessage({
          chatId: input.chatId,
          text: "AgentResult пока не подготовил черновик. Задача сохранена, проверьте статус позже."
        }).catch((sendError) => {
          input.app?.log.error({ error: sendError, taskId: input.taskId }, "Telegram onboarding failure notification failed");
        });
      }
    }
  })();
}

async function startOnboarding(context: TelegramExecutionContext) {
  const existing = await loadOnboardingState(context.tenantId);
  const isResume = Boolean(existing && existing.step !== "done");
  const state = isResume
    ? existing as OnboardingState & { id?: string }
    : await saveOnboardingState(context.tenantId, { answers: {}, step: "offer" });

  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);

  return {
    command: "onboarding",
    text: isResume ? renderOnboardingMessage(state) : renderOnboardingMessage(),
    buttons: onboardingCommandButtons(),
    ownerBrief,
    onboarding: state
  };
}

async function continueOnboarding(input: TelegramIntentInput, context: TelegramExecutionContext, state: OnboardingState & { id?: string }) {
  const answer = input.text.trim();
  const answers = {
    ...state.answers,
    [onboardingAnswerKey(state.step)]: answer
  };
  const nextStep = nextOnboardingStep(state.step);

  if (nextStep !== "done") {
    const nextState = await saveOnboardingState(context.tenantId, {
      answers,
      id: state.id,
      step: nextStep
    });
    const briefData = await loadOwnerBriefData(context.tenantId);
    const ownerBrief = buildOwnerBrief(briefData);

    return {
      intent: "onboarding_continue",
      command: null,
      text: onboardingPrompt(nextStep),
      buttons: onboardingCommandButtons(),
      ownerBrief,
      onboarding: nextState
    };
  }

  await updateCompanyFromOnboarding(context.tenantId, answers);
  const hermesTask = await createOnboardingHermesDraftTask(context, answers);
  const completedState = await saveOnboardingState(context.tenantId, {
    answers,
    completedAt: new Date().toISOString(),
    id: state.id,
    step: "done"
  });
  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);
  const title = onboardingTitle(textValue(answers.firstMaterial, "Первый материал Growth Control"));
  runHermesDraftJob({
    app: context.app,
    chatId: context.telegramChatId,
    integrationProvider: "telegram_onboarding_hermes_job",
    taskId: String(hermesTask.id),
    tenantId: context.tenantId,
    title,
    userId: context.userId
  });

  return {
    intent: "onboarding_complete",
    command: null,
    text: [
      "Настройка зафиксирована.",
      "",
      `Оффер: ${textValue(answers.offer, "не указан")}`,
      `Клиент: ${textValue(answers.client, "не указан")}`,
      `Канал выпуска: ${channelLabel(normalizeChannel(textValue(answers.channel, "manual")))}`,
      `Ответственный за выпуск: ${textValue(answers.releaseOwner, "не указан")}`,
      `Первый сигнал: ${textValue(answers.firstSignalSource, "не указан")}`,
      `Согласование: ${textValue(answers.approvalRules, "публичные материалы ждут решения собственника")}`,
      "",
      `AgentResult взял задачу: ${title}`,
      context.telegramChatId
        ? "Задача в работе. Я пришлю черновик отдельным сообщением, когда он будет готов."
        : "Задача в работе. Черновик появится на согласование после подготовки."
    ].join("\n"),
    buttons: onboardingCommandButtons(),
    hermesJob: {
      delivery: "queued",
      taskId: hermesTask.id
    },
    hermesTask,
    ownerBrief,
    onboarding: completedState
  };
}

function decisionDisplayTitle(decision: Row | undefined) {
  return textValue(decision?.contentTitle || decision?.title, "Материал");
}

function normalizeDecisionLookupText(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function decisionOrdinalIndex(text: string) {
  const normalized = ` ${normalizeDecisionLookupText(text)} `;
  const ordinals: Array<[string[], number]> = [
    [["1", "первый", "первое", "первому", "первую", "первого"], 0],
    [["2", "второй", "второе", "второму", "вторую", "второго"], 1],
    [["3", "третий", "третье", "третьему", "третью", "третьего"], 2],
    [["4", "четвертый", "четвертое", "четвертому", "четвертую", "четвертого"], 3],
    [["5", "пятый", "пятое", "пятому", "пятую", "пятого"], 4]
  ];

  for (const [words, index] of ordinals) {
    if (words.some((word) => normalized.includes(` ${word} `))) return index;
  }

  return null;
}

function decisionLookupQuery(text: string) {
  const normalized = normalizeDecisionLookupText(text);
  const stopWords = new Set([
    "agentresult",
    "approve",
    "changes",
    "draft",
    "material",
    "osapprove",
    "post",
    "request",
    "request_changes",
    "агентрезалт",
    "готовое",
    "готовый",
    "материал",
    "материалы",
    "на",
    "нужна",
    "нужны",
    "одобряю",
    "ок",
    "открой",
    "первое",
    "первый",
    "первого",
    "первому",
    "первую",
    "по",
    "покажи",
    "посмотреть",
    "пост",
    "правка",
    "правки",
    "про",
    "согласовать",
    "согласую",
    "скинь",
    "текст",
    "утверждаю",
    "черновик"
  ]);

  return normalized
    .split(" ")
    .filter((word) => word.length > 1 && !stopWords.has(word) && !/^\d+$/.test(word))
    .join(" ");
}

function resolveDecisionFromText(brief: OwnerBrief, text: string) {
  if (!brief.decisions.length) return null;

  const ordinalIndex = decisionOrdinalIndex(text);
  if (ordinalIndex !== null && brief.decisions[ordinalIndex]) return brief.decisions[ordinalIndex];

  const query = decisionLookupQuery(text);
  if (!query) return brief.decisions[0];

  const queryTokens = query.split(" ").filter(Boolean);
  const scored = brief.decisions.map((decision, index) => {
    const haystack = normalizeDecisionLookupText([
      decisionDisplayTitle(decision),
      textValue(decision.title, ""),
      textValue(decision.contentPreview, "")
    ].join(" "));
    const exact = haystack.includes(query) ? queryTokens.length + 2 : 0;
    const tokenScore = queryTokens.filter((token) => haystack.includes(token)).length;
    return { decision, index, score: exact + tokenScore };
  }).sort((a, b) => b.score - a.score || a.index - b.index);

  return scored[0]?.score ? scored[0].decision : null;
}

function renderDecisionContent(brief: OwnerBrief, selectedDecision?: Row | null) {
  const decision = selectedDecision ?? brief.decisions[0];
  const contentText = textValue(decision?.contentText, "");

  if (contentText) return contentText;

  if (decision) {
    return [
      "Текст материала ещё не передан в backend.",
      "",
      `Решение: ${decision.title}`,
      "Следующий шаг: добавить текст материала или вернуть на подготовку."
    ].join("\n");
  }

  return "Сейчас нет материала, который ждёт решения.";
}

function renderCommandBrief(brief: OwnerBrief) {
  const priority = ownerPriority({
    decisions: brief.decisions,
    handoffs: brief.handoffs,
    preparing: brief.preparing
  });
  const lines = [
    "AgentResult Growth Control",
    "",
    ...compactStateBlock("Ждёт выхода", brief.handoffs.map((item) => textValue(item.title, "Переданный материал")), "нет", brief.counts.handedOff),
    "",
    ...compactStateBlock("Ждёт решения", brief.decisions.map((item) => textValue(item.contentTitle || item.title, "Материал ждёт решения")), "нет", brief.counts.decisions),
    "",
    ...compactStateBlock("Готовится", brief.preparing.map((item) => textValue(item.title, "материал")), "нет", brief.counts.preparing)
  ];

  if (priority.type === "confirm_publication") {
    lines.push("");
    lines.push("Приоритет: подтвердить выход.");
    if (brief.decisions.length) {
      lines.push(`Также готов новый материал: ${textValue(brief.decisions[0]?.contentTitle || brief.decisions[0]?.title, "материал")}.`);
    }
  } else if (priority.type === "approval") {
    lines.push("");
    lines.push("Приоритет: принять решение.");
    const risks = riskLine(Array.isArray(priority.decision.riskFlags) ? priority.decision.riskFlags : []);
    if (risks) lines.push(risks);
  } else if (priority.type === "preparing") {
    lines.push("");
    lines.push("Следующий шаг: дождаться черновика и принять решение.");
  } else {
    lines.push("");
    lines.push("Следующий шаг: поставить следующую тему в работу.");
  }

  return lines.join("\n");
}

function formatTelegramDateTime(value: unknown) {
  const raw = textValue(value, "");
  if (!raw) return "не зафиксировано";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Moscow"
  }).format(date);
}

function renderPreparationStatusMessage(brief: OwnerBrief) {
  const item = brief.preparing[0];
  if (!item) {
    return [
      "Сейчас нет материала в подготовке.",
      "",
      "Следующий шаг: проверить решения или поставить новую тему в работу."
    ].join("\n");
  }

  return [
    "AgentResult готовит черновик.",
    "",
    `Тема: ${textValue(item.title, "материал")}`,
    `Канал: ${channelLabel(item.channel)}`,
    `Запущено: ${formatTelegramDateTime(item.createdAt ?? item.updatedAt)}`,
    `Результат: ${textValue(item.expectedResult, "черновик на согласование")}`,
    "",
    "Когда черновик будет готов, он появится в решениях."
  ].join("\n");
}

function renderReadyForDecisionMessage(brief: OwnerBrief) {
  if (!brief.decisions.length) {
    return [
      "Сейчас нет готового материала на решение.",
      "",
      brief.counts.preparing > 0
        ? "AgentResult готовит черновик. Когда он будет готов, появится решение."
        : "Следующий шаг: поставить новую тему в работу."
    ].join("\n");
  }

  const lines = [
    `Ждёт решения: ${brief.counts.decisions}`,
    ""
  ];

  brief.decisions.slice(0, 3).forEach((decision, index) => {
    lines.push(`${index + 1}. ${textValue(decision.contentTitle || decision.title, "Материал")}`);
    const risks = riskLine(Array.isArray(decision.riskFlags) ? decision.riskFlags : []);
    if (risks) lines.push(risks);
  });

  lines.push("");
  lines.push("Следующий шаг: посмотреть материал, согласовать или вернуть на правки.");

  return lines.join("\n");
}

function renderPublishedStatusMessage(brief: OwnerBrief) {
  const lines = [
    `Вышло: ${brief.counts.published}`,
    `Ждёт подтверждения выхода: ${brief.counts.handedOff}`
  ];

  if (brief.publishedResults.length) {
    lines.push("");
    lines.push("Последний опубликованный материал:");
    lines.push(...publicationResultCardLines(brief.publishedResults[0]));
    lines.push("");
    lines.push("Следующий шаг: переиспользовать, расширить или обновить материал.");
  }

  if (brief.handoffs.length) {
    lines.push("");
    lines.push("Нужно подтвердить выход:");
    lines.push(...brief.handoffs.slice(0, 3).map((item) => `- ${truncateText(textValue(item.title, "Переданный материал"), 90)}`));
  }

  if (brief.counts.published === 0 && brief.counts.handedOff === 0) {
    lines.push("");
    lines.push("Сейчас нет подтверждённых выпусков.");
  }

  return lines.join("\n");
}

function renderPublicationResultConfirmationPrompt(step: PublicationResultConfirmationStep, item?: Row | null) {
  const title = textValue(item?.title, "материал");
  if (step === "url") {
    return [
      "Зафиксируем результат публикации.",
      "",
      `Материал: ${title}`,
      "",
      "Пришлите URL публикации. Если ссылки пока нет, напишите: без URL."
    ].join("\n");
  }

  if (step === "format") {
    return [
      "URL зафиксирован.",
      "",
      "Укажите формат: telegram_post, article, vc_post или свой вариант."
    ].join("\n");
  }

  return [
    "Формат зафиксирован.",
    "",
    "Укажите первичные реакции: комментарии 2, репосты 1, сохранения 3, реакции 8.",
    "Если реакций пока нет, напишите: 0."
  ].join("\n");
}

function normalizePublicationFormat(value: string) {
  const text = value.trim().toLowerCase();
  if (!text) return "telegram_post";
  if (text.includes("telegram") || text.includes("телеграм") || text.includes("пост")) return "telegram_post";
  if (text.includes("vc")) return "vc_post";
  if (text.includes("стат") || text.includes("article")) return "article";
  return text.replace(/\s+/g, "_");
}

function isSkipPublicationUrl(value: string) {
  const text = value.trim().toLowerCase();
  return ["0", "-", "нет", "без url", "без ссылки", "ссылки нет", "пока нет"].includes(text);
}

function parsePublicationReactions(value: string) {
  const text = value.toLowerCase();
  const numberAfter = (patterns: string[]) => {
    for (const pattern of patterns) {
      const match = text.match(new RegExp(`${pattern}\\D{0,20}(\\d+)`, "i"));
      if (match) return Number(match[1] ?? 0);
    }
    return 0;
  };
  const named = {
    comments: numberAfter(["коммент\\w*", "comment\\w*"]),
    reposts: numberAfter(["репост\\w*", "repost\\w*"]),
    saves: numberAfter(["сохран\\w*", "save\\w*"]),
    reactions: numberAfter(["реакц\\w*", "reaction\\w*", "лайк\\w*", "like\\w*"])
  };
  if (Object.values(named).some((count) => count > 0)) return named;

  const numbers = [...text.matchAll(/\d+/g)].map((match) => Number(match[0]));
  if (!numbers.length) return named;
  return {
    comments: numbers[0] ?? 0,
    reposts: numbers[1] ?? 0,
    saves: numbers[2] ?? 0,
    reactions: numbers[3] ?? 0
  };
}

async function startPublicationResultConfirmation(
  calendarItemId: string,
  context: { tenantId: string; userId?: string }
) {
  const briefData = await loadOwnerBriefData(context.tenantId);
  const item = briefData.calendar.find((row) => row.id === calendarItemId) ?? null;
  const ownerBrief = buildOwnerBrief(briefData);

  await savePublicationResultConfirmationState(context.tenantId, {
    answers: {},
    calendarItemId,
    step: "url"
  });

  return {
    command: "published",
    text: renderPublicationResultConfirmationPrompt("url", item),
    buttons: [],
    ownerBrief
  };
}

async function continuePublicationResultConfirmation(
  input: TelegramIntentInput,
  context: TelegramExecutionContext,
  state: PublicationResultConfirmationState & { id?: string }
) {
  const raw = input.text.trim();
  const text = raw.toLowerCase().replace(/\s+/g, " ");

  if (includesAny(text, ["отмена", "стоп", "не подтверждать", "прервать"])) {
    await savePublicationResultConfirmationState(context.tenantId, {
      ...state,
      step: "done",
      completedAt: new Date().toISOString()
    });
    const briefData = await loadOwnerBriefData(context.tenantId);
    const ownerBrief = buildOwnerBrief(briefData);
    return {
      intent: "publication_result_confirmation_cancelled",
      command: null,
      text: "Подтверждение выхода остановил. Данные публикации не менял.",
      buttons: ownerControlButtons(ownerBrief),
      ownerBrief
    };
  }

  if (state.step === "url") {
    const nextState = await savePublicationResultConfirmationState(context.tenantId, {
      ...state,
      answers: {
        ...state.answers,
        publicationUrl: isSkipPublicationUrl(raw) ? "" : raw
      },
      step: "format"
    });
    const briefData = await loadOwnerBriefData(context.tenantId);
    return {
      intent: "publication_result_confirmation_url",
      command: null,
      text: renderPublicationResultConfirmationPrompt("format"),
      buttons: [],
      ownerBrief: buildOwnerBrief(briefData),
      state: nextState
    };
  }

  if (state.step === "format") {
    const nextState = await savePublicationResultConfirmationState(context.tenantId, {
      ...state,
      answers: {
        ...state.answers,
        format: normalizePublicationFormat(raw)
      },
      step: "reactions"
    });
    const briefData = await loadOwnerBriefData(context.tenantId);
    return {
      intent: "publication_result_confirmation_format",
      command: null,
      text: renderPublicationResultConfirmationPrompt("reactions"),
      buttons: [],
      ownerBrief: buildOwnerBrief(briefData),
      state: nextState
    };
  }

  const primaryReactions = parsePublicationReactions(raw);
  const published = await confirmPublishingCalendarLive({
    id: state.calendarItemId,
    tenantId: context.tenantId,
    userId: context.userId,
    note: input.note || "Подтверждено из Telegram-контура",
    publicationUrl: state.answers.publicationUrl ?? "",
    format: state.answers.format ?? "telegram_post",
    primaryReactions,
    nextStep: "leave",
    nextStepNote: "Результат подтверждён из Telegram"
  });
  await savePublicationResultConfirmationState(context.tenantId, {
    ...state,
    answers: {
      ...state.answers,
      reactions: raw
    },
    step: "done",
    completedAt: new Date().toISOString()
  });
  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);

  return {
    intent: "publication_result_confirmation_complete",
    command: null,
    text: [
      "Выход подтверждён. Данные результата сохранены.",
      "",
      state.answers.publicationUrl ? `URL: ${state.answers.publicationUrl}` : "URL: не указан",
      `Формат: ${state.answers.format ?? "telegram_post"}`,
      `Первичные реакции: комментарии ${primaryReactions.comments}, репосты ${primaryReactions.reposts}, сохранения ${primaryReactions.saves}, реакции ${primaryReactions.reactions}`,
      "",
      "Теперь можно запустить следующий контент-шаг."
    ].join("\n"),
    buttons: publicationResultCommandButtons(ownerBrief),
    ownerBrief,
    result: published
  };
}

function publicationResultCardLines(result: Row) {
  const reactions = result.primaryReactions && typeof result.primaryReactions === "object" ? result.primaryReactions as Row : {};
  const reactionLine = [
    Number(reactions.comments ?? 0) > 0 ? `комментарии ${reactions.comments}` : null,
    Number(reactions.reposts ?? 0) > 0 ? `репосты ${reactions.reposts}` : null,
    Number(reactions.saves ?? 0) > 0 ? `сохранения ${reactions.saves}` : null,
    Number(reactions.reactions ?? 0) > 0 ? `реакции ${reactions.reactions}` : null
  ].filter(Boolean).join(", ");
  return [
    `- ${truncateText(textValue(result.title, "Опубликованный материал"), 90)}`,
    `Канал: ${channelLabel(result.channel)}`,
    textValue(result.publicationUrl, "") ? `URL: ${result.publicationUrl}` : null,
    reactionLine ? `Первичные реакции: ${reactionLine}` : "Первичные реакции: не зафиксированы"
  ].filter((line): line is string => Boolean(line));
}

function renderMaterialPreparationStartedMessage(input: { channel: string; title: string }) {
  return [
    "Задача поставлена в работу.",
    "",
    `Тема: ${input.title}`,
    `Канал: ${channelLabel(input.channel)}`,
    "",
    "AgentResult готовит черновик. Когда он будет готов, появится решение на согласование."
  ].join("\n");
}

function renderMaterialCreatedMessage(input: { approval: Row; contentItem: Row }) {
  return [
    "Материал сохранён.",
    "",
    `Решение: ${ownerFacingText(input.approval.summary, "Согласовать материал")}`,
    `Канал: ${channelLabel(input.contentItem.channel)}`,
    "",
    "Следующий шаг: посмотреть материал, согласовать или вернуть на правки."
  ].join("\n");
}

function renderDirectPublishingBoundary() {
  return [
    "Прямой выпуск в Telegram-канал в этом контуре не подключён.",
    "",
    "Могу сохранить материал, провести согласование, передать в выпуск вручную и зафиксировать результат."
  ].join("\n");
}

function renderResultMessage(brief: OwnerBrief) {
  const priority = ownerPriority({
    decisions: brief.decisions,
    handoffs: brief.handoffs,
    preparing: brief.preparing
  });

  const lines = [
    "AgentResult Growth Control — результат",
    "",
    ...telegramMetricLines({
      handedOff: brief.counts.handedOff,
      published: brief.counts.published,
      leads: brief.counts.leads,
      money: brief.counts.money
    }),
    "",
    priority.type === "confirm_publication"
      ? "Следующий шаг: подтвердить выход переданного материала."
      : priority.type === "approval"
      ? "Следующий шаг: закрыть решение в очереди."
      : priority.type === "preparing"
      ? "Следующий шаг: дождаться черновика и принять решение."
      : "Следующий шаг: поставить следующую тему в работу."
  ];

  if (brief.publishedResults.length) {
    lines.push("");
    lines.push("Опубликованный материал:");
    lines.push(...publicationResultCardLines(brief.publishedResults[0]));
    lines.push("");
    lines.push("Можно запустить следующий контент-шаг.");
  }

  return lines.join("\n");
}

function renderHandoffMessage(input: { item: Row; ownerBrief: OwnerBrief }) {
  return [
    "Передано в выпуск вручную.",
    "",
    `Материал: ${textValue(input.item.title, "Материал")}`,
    `Канал: ${channelLabel(input.item.channel)}`,
    "",
    "Следующий шаг: после выхода подтвердить, что материал опубликован."
  ].join("\n");
}

function renderDailyWorkMessage(brief: OwnerBrief) {
  const priority = ownerPriority({
    decisions: brief.decisions,
    handoffs: brief.handoffs,
    preparing: brief.preparing
  });
  const lines = [
    "Ежедневный контур:",
    "",
    "1. Посмотреть, что требует решения.",
    "2. По материалам: согласовать, вернуть на правки или передать в выпуск.",
    "3. После выхода подтвердить публикацию.",
    "4. Проверить сигнал и следующий шаг.",
    ""
  ];

  if (priority.type === "confirm_publication") {
    lines.push(`Сейчас важно: подтвердить выход ${brief.counts.handedOff} переданного материала.`);
  } else if (priority.type === "approval") {
    lines.push(`Сейчас важно: закрыть ${brief.counts.decisions} решение.`);
  } else if (priority.type === "preparing") {
    lines.push(`Сейчас AgentResult готовит черновик: ${textValue(priority.preparingTask.title, "материал")}.`);
  } else {
    lines.push("Сейчас важно: поставить следующую тему в работу.");
  }

  return lines.join("\n");
}

function renderResetMessage(brief: OwnerBrief) {
  const priority = ownerPriority({
    decisions: brief.decisions,
    handoffs: brief.handoffs,
    preparing: brief.preparing
  });
  const lines = [
    "Контур обновлён.",
    "",
    "Данные AgentResult OS не сбрасывал. Продолжаем с текущего состояния.",
    ""
  ];

  if (priority.type === "confirm_publication") {
    lines.push(`Сейчас ждёт подтверждения выхода: ${brief.counts.handedOff}.`);
  } else if (priority.type === "approval") {
    lines.push(`Сейчас требует решения: ${brief.counts.decisions}.`);
  } else if (priority.type === "preparing") {
    lines.push(`AgentResult готовит черновик: ${textValue(priority.preparingTask.title, "материал")}.`);
  } else {
    lines.push("Сейчас нет решений в очереди.");
  }

  return lines.join("\n");
}

function renderDemoResetMessage(brief: OwnerBrief) {
  const priority = ownerPriority({
    decisions: brief.decisions,
    handoffs: brief.handoffs,
    preparing: brief.preparing
  });
  const lines = [
    "Демо-состояние сброшено.",
    "",
    "Вернул базовый сценарий AgentResult OS: одно решение, один подтверждённый выпуск, один материал в плане и результатные сигналы.",
    ""
  ];

  if (priority.type === "confirm_publication") {
    lines.push("Следующий шаг: подтвердить выход переданного материала.");
  } else if (priority.type === "approval") {
    lines.push("Следующий шаг: посмотреть материал и принять решение.");
  } else if (priority.type === "preparing") {
    lines.push("Следующий шаг: дождаться черновика и принять решение.");
  } else {
    lines.push("Следующий шаг: поставить следующую тему в работу.");
  }

  return lines.join("\n");
}

function renderUnknownIntentMessage(brief?: OwnerBrief) {
  const priority = brief
    ? ownerPriority({
        decisions: brief.decisions,
        handoffs: brief.handoffs,
        preparing: brief.preparing
      })
    : null;
  const lines = [
    "Не зафиксировал действие.",
    "",
    "Напишите действие: посмотреть материал, согласовать, вернуть на правки, передать в выпуск, подтвердить выход или проверить результат."
  ];

  if (brief && priority?.type === "confirm_publication") {
    lines.push("");
    lines.push(`Сейчас ждёт подтверждения выхода: ${brief.counts.handedOff}.`);
  } else if (brief && priority?.type === "approval") {
    lines.push("");
    lines.push(`Сейчас требует решения: ${brief.counts.decisions}.`);
  } else if (brief && priority?.type === "preparing") {
    lines.push("");
    lines.push(`AgentResult готовит черновик: ${textValue(priority.preparingTask.title, "материал")}.`);
  }

  return lines.join("\n");
}

function renderApprovalRecordedMessage(brief: OwnerBrief) {
  const lines = [
    "Решение зафиксировано: согласовано."
  ];

  if (brief.handoffs.length) {
    lines.push("");
    lines.push("Следующий шаг: подтвердить выход переданного материала.");
  } else {
    lines.push("");
    lines.push("Следующий шаг: передать материал в выпуск.");
  }

  return lines.join("\n");
}

function renderChangesRecordedMessage(brief: OwnerBrief) {
  const lines = [
    "Решение зафиксировано: нужны правки.",
    "",
    "Материал снят с согласования и вернётся в работу."
  ];

  if (brief.decisions.length) {
    lines.push("");
    lines.push("Следующий шаг: закрыть следующий материал в очереди.");
  } else if (brief.preparing.length) {
    lines.push("");
    lines.push("Следующий шаг: дождаться обновлённого черновика.");
  }

  return lines.join("\n");
}

function includesAny(value: string, patterns: string[]) {
  return patterns.some((pattern) => value.includes(pattern));
}

function isQuestionLike(text: string) {
  return text.includes("?") || /^(что|зачем|почему|как|где|когда|можно ли|надо ли|нужно ли)\b/.test(text);
}

function isApprovalIntent(text: string) {
  if (isQuestionLike(text)) return false;

  if (["ок", "окей", "согласую", "одобряю"].includes(text)) return true;

  return includesAny(text, [
    "да, согласую",
    "да согласую",
    "да, одобряю",
    "да одобряю",
    "можно выпускать",
    "давай выпускать",
    "согласую материал",
    "одобряю материал",
    "утверждаю"
  ]);
}

function commandButton(command: string, label: string, targetId?: string | null): TelegramCommandButton {
  return {
    command,
    label,
    ...(targetId ? { targetId } : {})
  };
}

function primaryPublicationResultIdFromBrief(brief: OwnerBrief) {
  return typeof brief.publishedResults[0]?.id === "string" ? brief.publishedResults[0].id : null;
}

function primaryDecisionIdFromBrief(brief: OwnerBrief) {
  return typeof brief.decisions[0]?.id === "string" ? brief.decisions[0].id : null;
}

function publicationResultCommandButtons(brief: OwnerBrief): TelegramCommandButton[] {
  const targetId = primaryPublicationResultIdFromBrief(brief);
  if (!targetId) return [commandButton("result", "Результат")];

  return [
    commandButton("reuse", "Переиспользовать", targetId),
    commandButton("expand", "Расширить", targetId),
    commandButton("update", "Обновить", targetId)
  ];
}

function pilotScopeCommandButtons(scope: unknown): TelegramCommandButton[] | null {
  const approval = scope && typeof scope === "object" && "approval" in scope
    ? (scope as Row).approval
    : null;
  const targetId = approval && typeof approval === "object" && typeof (approval as Row).id === "string"
    ? String((approval as Row).id)
    : null;
  if (!targetId) return null;
  return [
    commandButton("osapprove", "Согласовать scope", targetId),
    commandButton("changes", "Правки scope", targetId)
  ];
}

function briefCommandButtons(brief: OwnerBrief): TelegramCommandButton[] {
  const targetId = primaryDecisionIdFromBrief(brief);
  if (targetId) {
    return [
      commandButton("post", "Материал", targetId)
    ];
  }

  if (brief.counts.preparing > 0) {
    return [
      commandButton("preparing", "Что готовится"),
      commandButton("brief", "Сводка")
    ];
  }

  return [
    commandButton("prepare", "Поставить тему"),
    commandButton("onboarding", "Настройка")
  ];
}

function postCommandButtons(brief: OwnerBrief, selectedDecision?: Row | null): TelegramCommandButton[] {
  const decision = selectedDecision ?? brief.decisions[0];
  const targetId = typeof decision?.id === "string" ? decision.id : null;
  const buttons = [commandButton("brief", "Сводка")];

  if (targetId) {
    buttons.unshift(commandButton("changes", "Нужны правки", targetId));
    buttons.unshift(commandButton("osapprove", "Согласовать", targetId));
  }

  return buttons;
}

function onboardingCommandButtons(): TelegramCommandButton[] {
  return [];
}

function findApprovedContentForHandoff(input: BriefData) {
  const pendingTargetIds = new Set(
    input.approvals
      .filter((row) => row.status === "pending" && row.target_type === "content_item" && typeof row.target_id === "string")
      .map((row) => row.target_id)
  );
  const calendarContentIds = new Set(
    input.calendar
      .filter((row) => ["handed_off", "published"].includes(String(row.status)))
      .map((row) => row.content_item_id)
      .filter((id): id is string => typeof id === "string")
  );
  const approvedTargetIds = input.approvals
    .filter((row) => row.status === "approved" && row.target_type === "content_item" && typeof row.target_id === "string")
    .sort((a, b) => new Date(textValue(b.decided_at, textValue(b.updated_at, ""))).getTime() -
      new Date(textValue(a.decided_at, textValue(a.updated_at, ""))).getTime())
    .map((row) => row.target_id as string);
  const contentById = new Map(input.contentItems.map((row) => [row.id, row]));

  for (const targetId of approvedTargetIds) {
    if (pendingTargetIds.has(targetId) || calendarContentIds.has(targetId)) continue;
    const contentItem = contentById.get(targetId);
    if (contentItem) return contentItem;
  }

  return input.contentItems.find((row) => {
    const id = typeof row.id === "string" ? row.id : "";
    const status = String(row.status ?? "");
    return ["approved", "scheduled"].includes(status) && !pendingTargetIds.has(id) && !calendarContentIds.has(id);
  }) ?? null;
}

function handoffButtonsForBrief(brief: OwnerBrief): TelegramCommandButton[] {
  const itemId = typeof brief.handoffs[0]?.id === "string" ? brief.handoffs[0].id : null;
  return itemId ? [commandButton("published", "Подтвердить выход", itemId)] : [commandButton("result", "Результат")];
}

function ownerControlButtons(brief: OwnerBrief): TelegramCommandButton[] {
  if (brief.counts.handedOff > 0) {
    const buttons = handoffButtonsForBrief(brief);
    const decisionId = typeof brief.decisions[0]?.id === "string" ? brief.decisions[0].id : null;
    if (decisionId) buttons.push(commandButton("post", "Материал", decisionId));
    if (brief.counts.preparing > 0) buttons.push(commandButton("preparing", "Что готовится"));
    return buttons;
  }
  if (brief.counts.decisions > 0) return briefCommandButtons(brief);
  if (brief.counts.preparing > 0) return [commandButton("preparing", "Что готовится"), commandButton("brief", "Сводка")];
  return [commandButton("prepare", "Поставить тему"), commandButton("result", "Результат")];
}

function isAdvisorQuestion(text: string) {
  if (includesAny(text, [
    "что сейчас главное",
    "что главное сейчас",
    "что дальше",
    "что делать дальше",
    "что мне делать дальше",
    "почему такой scope",
    "почему этот scope",
    "зачем такой scope",
    "объясни scope",
    "почему такой скоуп",
    "зачем такой скоуп",
    "объясни скоуп",
    "почему предложен",
    "что блокирует",
    "что мешает",
    "что посоветуешь",
    "как лучше поступить",
    "reuse или expand",
    "expand или reuse",
    "а почему",
    "почему?",
    "что выбрать",
    "покажи подробнее",
    "подробнее"
  ])) return true;

  return isQuestionLike(text) && !includesAny(text, [
    "что готово",
    "что согласовать",
    "покажи материал",
    "покажи пост",
    "что по результату",
    "результат",
    "что вышло",
    "что опубликовано",
    "что готовится",
    "что в работе"
  ]);
}

function compactApprovalForAdvisor(decision: Row) {
  return {
    title: textValue(decision.contentTitle || decision.title, "Материал ждёт решения"),
    scope: decision.scope ?? null,
    channel: decision.channel ?? null,
    contentType: decision.contentType ?? null,
    preview: truncateText(textValue(decision.contentPreview, ""), 280)
  };
}

function compactExecutionForAdvisor(execution: ActivePilotWeekExecution | null) {
  if (!execution) return null;
  const result = execution.publication_result && typeof execution.publication_result === "object"
    ? execution.publication_result as Row
    : null;
  return {
    week: execution.week,
    gate: execution.current_gate,
    materialTitle: textValue(execution.material?.title, `week-${execution.week} material`),
    materialApprovalStatus: textValue(execution.material_approval?.status, "pending"),
    board: Array.isArray(execution.board)
      ? execution.board.slice(0, 5).map((item) => ({
          title: textValue(item.title, "board item"),
          status: textValue(item.status, "scheduled")
        }))
      : [],
    publicationUrl: result?.publication_url ?? null,
    nextStep: result?.next_step ?? null
  };
}

function advisorContextSummary(contextPack: Row) {
  return JSON.stringify(contextPack, null, 2).slice(0, 5000);
}

function sanitizeAdvisorText(value: string) {
  return value
    .replace(/\bHermes\b/g, "AgentResult")
    .replace(/\bAPI\b/g, "backend")
    .replace(/guaranteed leads?/gi, "content signals")
    .replace(/guaranteed sales?/gi, "confirmed publication results")
    .replace(/revenue attribution/gi, "publication result review")
    .trim();
}

function deterministicAdvisorText(input: { question: string; ownerBrief: OwnerBrief; activeExecution: ActivePilotWeekExecution | null; contextPack: Row }) {
  const priority = ownerPriority({
    decisions: input.ownerBrief.decisions,
    handoffs: input.ownerBrief.handoffs,
    preparing: input.ownerBrief.preparing
  });
  const lines = ["AgentResult advisor", ""];
  if (input.activeExecution) {
    const week = Number(input.activeExecution.week || 0);
    lines.push(`Сейчас главное: закрыть week-${week} gate "${weekTwoGateTelegramLabel(textValue(input.activeExecution.current_gate, "active"))}".`);
    lines.push(`Материал: ${textValue(input.activeExecution.material?.title, `week-${week} material`)}.`);
    if (input.activeExecution.current_gate === "result_review") {
      lines.push("Дальше нужно выбрать следующий контент-шаг: reuse, expand, update или leave.");
    } else {
      lines.push(`Следующее действие: ${weekTwoGateTelegramAction(textValue(input.activeExecution.current_gate, "active"))}.`);
    }
  } else if (priority.type === "confirm_publication") {
    lines.push(`Сейчас главное: подтвердить URL выхода для "${textValue(priority.handoff.title, "переданного материала")}".`);
    lines.push("Без URL loop не закрывается и следующий content step остается предположением.");
  } else if (priority.type === "approval") {
    lines.push(`Сейчас главное: принять решение по "${textValue(priority.decision.contentTitle || priority.decision.title, "материалу")}".`);
    if (String(priority.decision.scope || "").startsWith("pilot_week_")) {
      lines.push("Этот scope нужен, чтобы следующий week board стартовал из согласованного owner boundary, а не из документа или ручной правки seed.");
    } else {
      lines.push("Можно согласовать, запросить правки или сначала посмотреть текст.");
    }
  } else if (priority.type === "preparing") {
    lines.push(`Сейчас главное: дождаться черновика. Готовится: ${textValue(priority.preparingTask.title, "материал")}.`);
  } else {
    lines.push("Сейчас главное: поставить следующую тему в работу или проверить последний опубликованный результат.");
  }

  if (includesAny(input.question.toLowerCase(), ["почему", "зачем", "scope", "скоуп"])) {
    const scopeDecision = input.ownerBrief.decisions.find((decision) => String(decision.scope || "").startsWith("pilot_week_"));
    lines.push("");
    lines.push(scopeDecision
      ? `Почему такой scope: он продолжает закрытый loop и сохраняет один канал, owner approval, QA/release handoff, URL confirmation и следующий review. Scope: ${textValue(scopeDecision.scope, "pilot scope")}.`
      : "Почему такой scope: в текущем состоянии нет активного pilot scope approval, поэтому опираюсь на ближайший gate и подтвержденные публикации.");
  }

  const previousAdvisorContext = input.contextPack.previousAdvisorContext && typeof input.contextPack.previousAdvisorContext === "object"
    ? input.contextPack.previousAdvisorContext as Row
    : null;
  if (previousAdvisorContext && includesAny(input.question.toLowerCase(), ["почему", "зачем", "что выбрать", "подробнее"])) {
    lines.push("");
    lines.push(`Продолжаю предыдущий вопрос: ${textValue(previousAdvisorContext.question, "предыдущий advisor context")}.`);
  }

  lines.push("");
  lines.push("Я не меняю состояние без отдельной кнопки или явной команды.");
  return lines.join("\n");
}

async function callHermesAdvisor(input: { question: string; contextPack: Row }) {
  if (!config.hermesApiKey) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.min(config.hermesRequestTimeoutMs, 30_000));
  try {
    const response = await fetch(`${config.hermesBaseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "authorization": `Bearer ${config.hermesApiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: config.hermesModel,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: [
              "Ты AgentResult advisor внутри Telegram owner-control.",
              "Отвечай только по переданному tenant context pack.",
              "Не меняй состояние, не обещай лиды, продажи или revenue attribution.",
              "Не упоминай raw API, VPS, env, stack trace, tools или внутренние команды.",
              "Дай короткий owner-facing ответ на русском: сейчас главное, почему, следующий безопасный шаг."
            ].join(" ")
          },
          {
            role: "user",
            content: [
              `Вопрос owner: ${input.question}`,
              "",
              "Tenant-safe context pack:",
              advisorContextSummary(input.contextPack)
            ].join("\n")
          }
        ]
      }),
      signal: controller.signal
    });
    const rawText = await response.text();
    if (!response.ok) return null;
    const parsed = JSON.parse(rawText) as HermesAdvisorCompletion;
    const text = telegramCompletionText(parsed.choices?.[0]?.message?.content);
    return text ? sanitizeAdvisorText(text) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function advisorButtons(input: { ownerBrief: OwnerBrief; activeExecution: ActivePilotWeekExecution | null }) {
  if (input.activeExecution) {
    return pilotWeekExecutionCommandButtons(input.activeExecution, Number(input.activeExecution.week || 2));
  }
  const scopeDecision = input.ownerBrief.decisions.find((decision) => String(decision.scope || "").startsWith("pilot_week_"));
  if (scopeDecision && typeof scopeDecision.id === "string") {
    return [
      commandButton("osapprove", "Согласовать scope", scopeDecision.id),
      commandButton("changes", "Правки scope", scopeDecision.id)
    ];
  }
  return ownerControlButtons(input.ownerBrief);
}

async function loadLatestAdvisorHistory(tenantId: string): Promise<AdvisorHistoryEntry | null> {
  const rows = await listRows("integrations", { tenantId, limit: 20 });
  const row = rows.find((item) => item.provider === "telegram_advisor_context") as Row | undefined;
  const configData = row?.config && typeof row.config === "object" ? row.config as Row : {};
  const question = textValue(configData.question, "");
  if (!question) return null;
  return {
    activePilotExecution: configData.activePilotExecution && typeof configData.activePilotExecution === "object"
      ? configData.activePilotExecution as Row
      : null,
    answerPreview: textValue(configData.answerPreview, ""),
    id: typeof row?.id === "string" ? row.id : undefined,
    question,
    updatedAt: textValue(configData.updatedAt, textValue(row?.created_at, ""))
  };
}

async function saveAdvisorHistory(input: {
  answer: string;
  contextPack: Row;
  question: string;
  tenantId: string;
}) {
  await insertJson("integrations", {
    provider: "telegram_advisor_context",
    status: "advisory_only",
    config: {
      activePilotExecution: input.contextPack.activePilotExecution ?? null,
      answerPreview: input.answer.slice(0, 700),
      constraints: input.contextPack.constraints,
      previousQuestion: (input.contextPack.previousAdvisorContext as Row | null)?.question ?? null,
      question: input.question,
      updatedAt: new Date().toISOString()
    },
    last_checked_at: null
  }, input.tenantId);
}

async function executeTelegramAdvisorIntent(input: TelegramIntentInput, context: TelegramExecutionContext) {
  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);
  const previousAdvisorContext = await loadLatestAdvisorHistory(context.tenantId);
  const activeExecutions = await Promise.all([
    getActiveWeekFiveExecution(context.tenantId),
    getActiveWeekFourExecution(context.tenantId),
    getActiveWeekThreeExecution(context.tenantId),
    getActiveWeekTwoExecution(context.tenantId)
  ]);
  const activeExecution = activeExecutions.find((execution) => execution?.status === "active") ?? null;
  const contextPack: Row = {
    surface: "telegram_owner_advisor",
    canonicalLoop: "AgentResult prepares -> owner approves -> team releases -> publication is confirmed -> next content step is chosen",
    constraints: [
      "advisory_only",
      "no_state_mutation",
      "no_autoposting",
      "no_guaranteed_leads_sales_or_revenue_attribution"
    ],
    counts: ownerBrief.counts,
    nextAction: ownerBrief.nextAction,
    previousAdvisorContext,
    pendingApprovals: ownerBrief.decisions.slice(0, 5).map(compactApprovalForAdvisor),
    activePilotExecution: compactExecutionForAdvisor(activeExecution),
    latestPublishedResults: ownerBrief.publishedResults.slice(0, 3).map((result) => ({
      title: textValue(result.title, "Опубликованный материал"),
      urlConfirmed: Boolean(result.publicationUrl),
      format: result.format,
      nextStep: result.nextStep,
      primaryReactions: result.primaryReactions
    })),
    preparing: ownerBrief.preparing.slice(0, 3).map((item) => ({
      title: textValue(item.title, "Материал"),
      status: item.status,
      expectedResult: item.expectedResult
    }))
  };
  const hermesText = await callHermesAdvisor({ question: input.text, contextPack });
  const text = hermesText || deterministicAdvisorText({
    question: input.text,
    ownerBrief,
    activeExecution,
    contextPack
  });
  const sanitizedText = sanitizeAdvisorText(text);
  await saveAdvisorHistory({
    answer: sanitizedText,
    contextPack,
    question: input.text,
    tenantId: context.tenantId
  });
  return {
    intent: "advisor_question",
    command: null,
    text: sanitizedText,
    buttons: advisorButtons({ ownerBrief, activeExecution }),
    ownerBrief,
    advisorContext: contextPack
  };
}

async function createTelegramMaterial(input: TelegramMaterialInput, context: { tenantId: string; userId?: string }) {
  const contentItem = await insertJson("content_items", {
    title: input.title,
    content_type: input.contentType,
    channel: input.channel,
    status: "review",
    body_md: input.bodyMd,
    metadata: {
      source: "telegram_hermes",
      note: input.note ?? null
    }
  }, context.tenantId);

  await insertJson("content_versions", {
    content_item_id: contentItem.id,
    version: 1,
    body_md: input.bodyMd,
    change_note: "Черновик из Telegram-контура",
    created_by: context.userId ?? null
  }, context.tenantId);

  const approval = await createApprovalRequest({
    tenantId: context.tenantId,
    scope: "social_post",
    targetType: "content_item",
    targetId: String(contentItem.id),
    requestedBy: context.userId,
    riskFlags: ["public claim", "channel publishing"],
    summary: `Согласовать Telegram-пост: ${input.title}`
  });
  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);

  return {
    text: renderMaterialCreatedMessage({ approval, contentItem }),
    buttons: briefCommandButtons(ownerBrief),
    contentItem,
    approval,
    ownerBrief
  };
}

async function createManualHandoff(context: { tenantId: string; userId?: string }, targetId?: string | null) {
  const briefData = await loadOwnerBriefData(context.tenantId);
  if (targetId) {
    const target = briefData.calendar.find((row) => row.id === targetId);
    if (target?.id) {
      const item = await patchJson("publishing_calendar_items", String(target.id), {
        status: "handed_off",
        metadata: {
          ...(typeof target.metadata === "object" && target.metadata ? target.metadata : {}),
          handoff_source: "telegram_week_2_execution",
          handed_off_by: context.userId ?? null,
          handed_off_at: new Date().toISOString()
        }
      }, context.tenantId);
      if (item?.content_item_id) {
        await patchJson("content_items", String(item.content_item_id), { status: "handed_off" }, context.tenantId);
      }
      const updatedBriefData = await loadOwnerBriefData(context.tenantId);
      const ownerBrief = buildOwnerBrief(updatedBriefData);
      return {
        command: "handoff",
        text: renderHandoffMessage({ item, ownerBrief }),
        buttons: handoffButtonsForBrief(ownerBrief),
        ownerBrief,
        item
      };
    }
  }

  const contentItem = findApprovedContentForHandoff(briefData);

  if (!contentItem) {
    const ownerBrief = buildOwnerBrief(briefData);
    return {
      command: "handoff",
      text: "Сейчас нет согласованного материала для передачи в выпуск.",
      buttons: briefCommandButtons(ownerBrief),
      ownerBrief
    };
  }

  const existing = briefData.calendar.find((row) => row.content_item_id === contentItem.id && row.status !== "published");
  const item = existing?.id
    ? await patchJson("publishing_calendar_items", String(existing.id), {
      status: "handed_off",
      title: textValue(existing.title, textValue(contentItem.title, "Материал")),
      channel: textValue(existing.channel, textValue(contentItem.channel, "manual")),
      metadata: {
        ...(typeof existing.metadata === "object" && existing.metadata ? existing.metadata : {}),
        handoff_source: "telegram_intent"
      }
    }, context.tenantId)
    : await insertJson("publishing_calendar_items", {
      content_item_id: contentItem.id,
      channel: textValue(contentItem.channel, "manual"),
      title: textValue(contentItem.title, "Материал"),
      status: "handed_off",
      scheduled_for: null,
      timezone: "Europe/Moscow",
      export_path: null,
      metadata: {
        source: "telegram_intent",
        handed_off_by: context.userId ?? null
      }
    }, context.tenantId);

  await patchJson("content_items", String(contentItem.id), { status: "scheduled" }, context.tenantId);

  const updatedBriefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(updatedBriefData);

  return {
    command: "handoff",
    text: renderHandoffMessage({ item, ownerBrief }),
    buttons: handoffButtonsForBrief(ownerBrief),
    ownerBrief,
    item
  };
}

function nextMaterialTopicFromText(value: string) {
  const cleaned = value
    .trim()
    .replace(/^\/+prepare\b/i, "")
    .replace(/^\/+next_material\b/i, "")
    .replace(/^подготовь\s+(материал|пост|черновик)\s*/i, "")
    .replace(/^сделай\s+(материал|пост|черновик)\s*/i, "")
    .replace(/^напиши\s+(материал|пост|черновик)\s*/i, "")
    .replace(/^поставь\s+следующ(ую|ий|ее)\s+(тему|материал|пост|черновик)\s+в\s+работу\s*/i, "")
    .replace(/^поставь\s+следующ(ую|ий|ее)\s+(тему|материал|пост|черновик)\s*/i, "")
    .replace(/^поставь\s+(тему|материал|пост|черновик)\s+в\s+работу\s*/i, "")
    .replace(/^в\s+работу\s*/i, "")
    .replace(/^следующ(ая|ую|ий|ее)\s+(тема|тему|материал|пост|черновик)\s*/i, "")
    .replace(/^следующий\s+(материал|пост|черновик)\s*/i, "")
    .replace(/^нов(ая|ую|ый|ое)\s+(тема|тему|материал|пост|черновик)\s*/i, "")
    .replace(/^(про|о)\s+/i, "")
    .replace(/^:\s*/, "")
    .trim();

  return cleaned || "Следующий материал AgentResult";
}

async function startNextMaterialPreparation(input: { rawText?: string }, context: TelegramExecutionContext) {
  const topic = nextMaterialTopicFromText(textValue(input.rawText, ""));
  const task = await createNextMaterialTask(context, { topic });
  const payload = task.payload && typeof task.payload === "object" ? task.payload as Row : {};
  const title = textValue(payload.title, defaultNextMaterialTitle(topic));
  const channel = textValue(payload.channel, "telegram");

  runHermesDraftJob({
    app: context.app,
    chatId: context.telegramChatId,
    integrationProvider: "telegram_next_material_hermes_job",
    taskId: String(task.id),
    tenantId: context.tenantId,
    title,
    userId: context.userId
  });

  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);

  return {
    command: "prepare",
    text: renderMaterialPreparationStartedMessage({ channel, title }),
    buttons: ownerControlButtons(ownerBrief),
    ownerBrief,
    task
  };
}

function publicationResultCommandFromText(command: string): "reuse" | "expand" | "update" | "leave" | null {
  if (["reuse", "repurpose", "переиспользовать", "переиспользуй"].includes(command)) return "reuse";
  if (["expand", "article", "расширить", "расширь"].includes(command)) return "expand";
  if (["update", "revise", "обновить", "обнови"].includes(command)) return "update";
  if (["leave", "оставить", "оставь"].includes(command)) return "leave";
  return null;
}

function renderPublicationResultCommandMessage(input: {
  command: "reuse" | "expand" | "update";
  action: Row;
  target: Row | null;
}) {
  if (input.command === "expand") {
    return [
      "Следующий контент-шаг создан: расширить материал.",
      "",
      `Новый материал: ${textValue(input.target?.title, "план статьи")}`,
      "Он появился в очереди материалов."
    ].join("\n");
  }

  if (input.command === "update") {
    return [
      "Следующий контент-шаг создан: обновить опубликованный материал.",
      "",
      `Задача: ${textValue((input.target?.payload as Row | undefined)?.title, "обновить материал")}`,
      "Она появилась в очереди задач."
    ].join("\n");
  }

  return [
    "Следующий контент-шаг создан: переиспользовать материал.",
    "",
    `Новый материал: ${textValue(input.target?.title, "материал для переиспользования")}`,
    "Он появился в очереди материалов."
  ].join("\n");
}

async function executeTelegramPublicationResultCommand(
  command: "reuse" | "expand" | "update",
  input: TelegramCommandInput,
  ownerBrief: OwnerBrief,
  context: TelegramExecutionContext
) {
  const publicationResultId = input.targetId ?? primaryPublicationResultIdFromBrief(ownerBrief);

  if (!publicationResultId) {
    return {
      command,
      text: "Сейчас нет опубликованного материала, по которому можно запустить следующий контент-шаг.",
      buttons: ownerControlButtons(ownerBrief),
      ownerBrief
    };
  }

  const result = await executePublicationResultCommand({
    tenantId: context.tenantId,
    userId: context.userId,
    publicationResultId,
    command,
    note: input.note
  });

  if (!result) {
    return {
      command,
      text: "Не нашёл опубликованный материал для этого действия.",
      buttons: publicationResultCommandButtons(ownerBrief),
      ownerBrief
    };
  }

  const updatedBriefData = await loadOwnerBriefData(context.tenantId);
  const updatedBrief = buildOwnerBrief(updatedBriefData);

  return {
    command,
    text: renderPublicationResultCommandMessage({
      command,
      action: result.action as Row,
      target: result.target as Row | null
    }),
    buttons: publicationResultCommandButtons(updatedBrief),
    ownerBrief: updatedBrief,
    actionResult: result
  };
}

async function executeTelegramCommand(input: TelegramCommandInput, context: TelegramExecutionContext) {
  const command = input.command.trim().toLowerCase().replace(/^\/+/, "");
  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);
  const primaryDecisionId = typeof ownerBrief.decisions[0]?.id === "string" ? ownerBrief.decisions[0].id : null;
  const daySevenReviewCommand = daySevenReviewCommandFromText(command);
  const publicationResultCommand = publicationResultCommandFromText(command);

  if (daySevenReviewCommand) {
    return completeDaySevenReviewFromTelegram(daySevenReviewCommand, input, context);
  }

  if (publicationResultCommand) {
    const activeWeekFiveExecution = await getActiveWeekFiveExecution(context.tenantId);
    if (activeWeekFiveExecution?.current_gate === "result_review") {
      return completeWeekFiveReviewFromTelegram(publicationResultCommand, input, context);
    }
    const activeWeekFourExecution = await getActiveWeekFourExecution(context.tenantId);
    if (activeWeekFourExecution?.current_gate === "result_review") {
      return completeWeekFourReviewFromTelegram(publicationResultCommand, input, context);
    }
    const activeWeekThreeExecution = await getActiveWeekThreeExecution(context.tenantId);
    if (activeWeekThreeExecution?.current_gate === "result_review") {
      return completeWeekThreeReviewFromTelegram(publicationResultCommand, input, context);
    }
    const activeWeekTwoExecution = await getActiveWeekTwoExecution(context.tenantId);
    if (activeWeekTwoExecution?.current_gate === "result_review") {
      return completeWeekTwoReviewFromTelegram(publicationResultCommand, input, context);
    }
    if (publicationResultCommand === "leave") {
      return {
        command: "leave",
        text: "Для обычного результата публикации `leave` уже означает оставить материал как есть. Для week-2/week-3/week-4/week-5 review используйте эту команду на gate `result_review`.",
        buttons: publicationResultCommandButtons(ownerBrief),
        ownerBrief
      };
    }
    return executeTelegramPublicationResultCommand(publicationResultCommand, input, ownerBrief, context);
  }

  if (pilotStartCommandFromText(command)) {
    return startWeekOnePilotFromTelegram(input, context);
  }

  if (weekTwoStatusCommandFromText(command)) {
    return showWeekTwoExecutionFromTelegram(context);
  }

  if (weekThreeStatusCommandFromText(command)) {
    return showWeekThreeExecutionFromTelegram(context);
  }

  if (weekFourStatusCommandFromText(command)) {
    return showWeekFourExecutionFromTelegram(context);
  }

  if (weekFiveStatusCommandFromText(command)) {
    return showWeekFiveExecutionFromTelegram(context);
  }

  if (weekTwoStartCommandFromText(command)) {
    return startWeekTwoExecutionFromTelegram(input, context);
  }

  if (weekThreeStartCommandFromText(command)) {
    return startWeekThreeExecutionFromTelegram(input, context);
  }

  if (weekFourStartCommandFromText(command)) {
    return startWeekFourExecutionFromTelegram(input, context);
  }

  if (weekFiveStartCommandFromText(command)) {
    return startWeekFiveExecutionFromTelegram(input, context);
  }

  if (["reset", "restart", "перезапуск", "перезапустить"].includes(command)) {
    return {
      command,
      text: renderResetMessage(ownerBrief),
      buttons: ownerControlButtons(ownerBrief),
      ownerBrief
    };
  }

  if (["demo_reset", "demo-reset", "reset_demo", "сброс_демо", "сброс-демо"].includes(command)) {
    if (config.storageMode !== "local") {
      return {
        command,
        text: "Сброс демо доступен только в local demo-контуре.",
        buttons: ownerControlButtons(ownerBrief),
        ownerBrief
      };
    }

    resetMemoryDemoStore();
    const resetBriefData = await loadOwnerBriefData(context.tenantId);
    const resetBrief = buildOwnerBrief(resetBriefData);

    return {
      command,
      text: renderDemoResetMessage(resetBrief),
      buttons: ownerControlButtons(resetBrief),
      ownerBrief: resetBrief
    };
  }

  if (["brief", "status", "решения", "сводка"].includes(command)) {
    return {
      command,
      text: renderCommandBrief(ownerBrief),
      buttons: ownerControlButtons(ownerBrief),
      ownerBrief
    };
  }

  if (["ready", "new", "готово", "новое", "что готово", "покажи новое", "что ждет решения", "что ждёт решения"].includes(command)) {
    return {
      command,
      text: renderReadyForDecisionMessage(ownerBrief),
      buttons: briefCommandButtons(ownerBrief),
      ownerBrief
    };
  }

  if (["preparing", "preparation", "progress", "готовится", "подготовка", "в работе", "что готовится"].includes(command)) {
    return {
      command,
      text: renderPreparationStatusMessage(ownerBrief),
      buttons: ownerControlButtons(ownerBrief),
      ownerBrief
    };
  }

  if (["post", "material", "draft", "текст", "пост", "материал"].includes(command) ||
    /^(post|material|draft|текст|пост|материал)\s+/.test(command)) {
    const selectedDecision = resolveDecisionFromText(ownerBrief, command);
    return {
      command,
      text: selectedDecision || ownerBrief.decisions.length <= 1
        ? renderDecisionContent(ownerBrief, selectedDecision)
        : "Не нашёл материал по этой фразе. Напишите номер из списка или часть темы.",
      buttons: postCommandButtons(ownerBrief, selectedDecision),
      ownerBrief
    };
  }

  if (["onboarding", "start_setup", "setup", "настройка"].includes(command)) {
    return startOnboarding(context);
  }

  if (command === "prepare" || command === "next_material" || command.startsWith("prepare ") || command.startsWith("next_material ")) {
    return startNextMaterialPreparation({ rawText: input.command }, context);
  }

  if (["handoff", "передано", "передал", "в выпуск"].includes(command)) {
    return createManualHandoff(context, input.targetId);
  }

  if (["published", "live", "вышло", "опубликовано"].includes(command)) {
    const handoff = ownerBrief.handoffs[0];
    if (!handoff || typeof handoff.id !== "string") {
      return {
        command,
        text: "Сейчас нет переданного материала, по которому нужно подтвердить выход.",
        buttons: briefCommandButtons(ownerBrief),
        ownerBrief
      };
    }

    return startPublicationResultConfirmation(input.targetId ?? handoff.id, context);
  }

  if (["published_status", "что вышло", "статус выпуска"].includes(command)) {
    return {
      command,
      text: renderPublishedStatusMessage(ownerBrief),
      buttons: publicationResultCommandButtons(ownerBrief),
      ownerBrief
    };
  }

  if (["approve", "osapprove", "ok", "согласовать", "ок"].includes(command) ||
    /^(approve|osapprove|согласовать|согласую|одобряю|утверждаю)\s+/.test(command)) {
    const selectedDecision = input.targetId ? null : resolveDecisionFromText(ownerBrief, command);
    const resolvedTargetId = input.targetId ?? (typeof selectedDecision?.id === "string" ? selectedDecision.id : primaryDecisionId);

    if (!resolvedTargetId) {
      return {
        command,
        text: "Сейчас нет решения, которое можно согласовать.",
        buttons: briefCommandButtons(ownerBrief),
        ownerBrief
      };
    }

    const actionResult = await executeTelegramAction({
      action: "approval.approve",
      targetId: resolvedTargetId,
      note: input.note
    }, context);

    return {
      command,
      text: renderApprovalRecordedMessage(actionResult.ownerBrief),
      buttons: briefCommandButtons(actionResult.ownerBrief),
      ownerBrief: actionResult.ownerBrief,
      actionResult
    };
  }

  if (["changes", "request_changes", "правки", "нужны правки"].includes(command) ||
    /^(changes|request_changes|правки|нужны правки|нужна правка)\s+/.test(command)) {
    const selectedDecision = input.targetId ? null : resolveDecisionFromText(ownerBrief, command);
    const resolvedTargetId = input.targetId ?? (typeof selectedDecision?.id === "string" ? selectedDecision.id : primaryDecisionId);

    if (!resolvedTargetId) {
      return {
        command,
        text: "Сейчас нет решения, по которому можно запросить правки.",
        buttons: briefCommandButtons(ownerBrief),
        ownerBrief
      };
    }

    const actionResult = await executeTelegramAction({
      action: "approval.request_changes",
      targetId: resolvedTargetId,
      note: input.note || "Нужны правки из Telegram-контура"
    }, context);

    return {
      command,
      text: renderChangesRecordedMessage(actionResult.ownerBrief),
      buttons: briefCommandButtons(actionResult.ownerBrief),
      ownerBrief: actionResult.ownerBrief,
      actionResult
    };
  }

  return {
    command,
    text: renderUnknownIntentMessage(ownerBrief),
    buttons: briefCommandButtons(ownerBrief),
    ownerBrief
  };
}

async function executeTelegramIntent(input: TelegramIntentInput, context: TelegramExecutionContext) {
  const text = input.text.trim().toLowerCase().replace(/\s+/g, " ");

  if (text.startsWith("/")) {
    const commandResult = await executeTelegramCommand({ command: text, note: input.note }, context);
    return {
      ...commandResult,
      intent: "slash_command",
      command: commandResult.command
    };
  }

  const onboardingState = await loadOnboardingState(context.tenantId);
  if (onboardingState && onboardingState.step !== "done") {
    if (includesAny(text, ["отмена", "стоп", "остановить настройку", "прервать настройку"])) {
      await saveOnboardingState(context.tenantId, {
        ...onboardingState,
        step: "done",
        completedAt: new Date().toISOString()
      });
      const briefData = await loadOwnerBriefData(context.tenantId);
      const ownerBrief = buildOwnerBrief(briefData);
      return {
        intent: "onboarding_cancelled",
        command: null,
        text: "Настройку остановил. Текущие данные AgentResult OS не сбрасывал.",
        buttons: ownerControlButtons(ownerBrief),
        ownerBrief
      };
    }

    return continueOnboarding(input, context, onboardingState);
  }

  const publicationResultConfirmationState = await loadPublicationResultConfirmationState(context.tenantId);
  if (publicationResultConfirmationState && publicationResultConfirmationState.step !== "done") {
    return continuePublicationResultConfirmation(input, context, publicationResultConfirmationState);
  }

  if (includesAny(text, [
    "опубликуй напрямую",
    "публикуй напрямую",
    "выложи напрямую",
    "отправь в канал",
    "запости в канал",
    "добавил тебя в администраторы",
    "добавил в администраторы",
    "админ канала",
    "chat_id",
    "id канала"
  ])) {
    const briefData = await loadOwnerBriefData(context.tenantId);
    const ownerBrief = buildOwnerBrief(briefData);
    return {
      intent: "direct_publication_boundary",
      command: null,
      text: renderDirectPublishingBoundary(),
      buttons: ownerControlButtons(ownerBrief),
      ownerBrief
    };
  }

  if (includesAny(text, [
    "что нам нужно делать каждый день",
    "что нужно делать каждый день",
    "что делать каждый день",
    "каждый день",
    "ежедневно",
    "ежедневный",
    "как с тобой работать",
    "как работать с тобой",
    "как мы работаем",
    "режим взаимодействия",
    "как пользоваться тобой"
  ])) {
    const briefData = await loadOwnerBriefData(context.tenantId);
    const ownerBrief = buildOwnerBrief(briefData);
    return {
      intent: "daily_owner_loop",
      command: null,
      text: renderDailyWorkMessage(ownerBrief),
      buttons: ownerControlButtons(ownerBrief),
      ownerBrief
    };
  }

  if (includesAny(text, [
    "подготовь материал",
    "подготовь пост",
    "подготовь черновик",
    "сделай материал",
    "сделай пост",
    "напиши материал",
    "напиши пост",
    "поставь тему в работу",
    "поставь следующую тему",
    "поставь следующую тему в работу",
    "поставь материал в работу",
    "поставь пост в работу",
    "следующая тема",
    "следующий материал",
    "следующий пост",
    "новая тема",
    "новый материал",
    "новый пост"
  ])) {
    const preparation = await startNextMaterialPreparation({ rawText: input.text }, context);
    return {
      ...preparation,
      intent: "prepare_next_material",
      command: null
    };
  }

  if (includesAny(text, [
    "покажи новое",
    "покажи готовое",
    "что готово",
    "что уже готово",
    "что ждёт решения",
    "что ждет решения",
    "что на решение",
    "что согласовать",
    "какие решения",
    "какие материалы готовы"
  ])) {
    const briefData = await loadOwnerBriefData(context.tenantId);
    const ownerBrief = buildOwnerBrief(briefData);
    return {
      intent: "ready_for_decision",
      command: null,
      text: renderReadyForDecisionMessage(ownerBrief),
      buttons: briefCommandButtons(ownerBrief),
      ownerBrief
    };
  }

  if (includesAny(text, [
    "что сейчас главное",
    "что главное сейчас",
    "что дальше",
    "что делать дальше",
    "что мне делать дальше",
    "почему такой scope",
    "почему этот scope",
    "зачем такой scope",
    "объясни scope",
    "почему такой скоуп",
    "зачем такой скоуп",
    "объясни скоуп"
  ])) {
    return executeTelegramAdvisorIntent(input, context);
  }

  if (includesAny(text, [
    "что сегодня",
    "что на сегодня",
    "что требует",
    "что решить",
    "что дальше",
    "что сейчас",
    "что мне сделать",
    "что сейчас важно",
    "что важно сейчас",
    "сводка",
    "статус"
  ])) {
    const commandResult = await executeTelegramCommand({ command: "/brief", note: input.note }, context);
    return {
      ...commandResult,
      intent: "brief",
      command: null
    };
  }

  if (includesAny(text, [
    "что вышло",
    "что опубликовано",
    "что уже вышло",
    "что выпустили",
    "статус выпуска",
    "покажи выпуски"
  ])) {
    const briefData = await loadOwnerBriefData(context.tenantId);
    const ownerBrief = buildOwnerBrief(briefData);
    return {
      intent: "published_status",
      command: null,
      text: renderPublishedStatusMessage(ownerBrief),
      buttons: publicationResultCommandButtons(ownerBrief),
      ownerBrief
    };
  }

  if (includesAny(text, [
    "что готовится",
    "что agentresult готовит",
    "что агентрезалт готовит",
    "что сейчас готовится",
    "что в работе",
    "что сейчас в работе",
    "покажи подготовку",
    "статус подготовки",
    "какой черновик готовится"
  ])) {
    const commandResult = await executeTelegramCommand({ command: "/preparing", note: input.note }, context);
    return {
      ...commandResult,
      intent: "preparation_status",
      command: null
    };
  }

  if (includesAny(text, [
    "day-7 review",
    "day 7 review",
    "day7 review",
    "закрой day-7",
    "закрыть day-7",
    "закрой пилот",
    "закрыть пилот",
    "ревью пилота",
    "review пилота"
  ])) {
    const nextStep = daySevenReviewStepFromText(input.text);
    const commandResult = await executeTelegramCommand({ command: `/day7 ${nextStep}`, note: input.note || input.text }, context);
    return {
      ...commandResult,
      intent: "pilot_day_7_review",
      command: null
    };
  }

  if (includesAny(text, ["переиспользуй", "переиспользовать", "сделай ещё пост", "сделай еще пост", "возьми в следующий материал"])) {
    const commandResult = await executeTelegramCommand({ command: "/reuse", note: input.note }, context);
    return {
      ...commandResult,
      intent: "publication_result_reuse",
      command: null
    };
  }

  if (includesAny(text, ["расширь", "расширить", "сделай статью", "разверни в статью", "сделай лонгрид"])) {
    const commandResult = await executeTelegramCommand({ command: "/expand", note: input.note }, context);
    return {
      ...commandResult,
      intent: "publication_result_expand",
      command: null
    };
  }

  if (includesAny(text, ["обнови опубликованный", "обновить опубликованный", "обнови материал", "обновить материал по результату", "задача на обновление"])) {
    const commandResult = await executeTelegramCommand({ command: "/update", note: input.note }, context);
    return {
      ...commandResult,
      intent: "publication_result_update",
      command: null
    };
  }

  if (includesAny(text, [
    "покажи пост",
    "скинь пост",
    "покажи материал",
    "скинь материал",
    "посмотреть материал",
    "можно посмотреть материал",
    "покажи текст",
    "скинь текст",
    "черновик"
  ]) || /^(покажи|скинь|открой|посмотреть)\s+/.test(text)) {
    const briefData = await loadOwnerBriefData(context.tenantId);
    const ownerBrief = buildOwnerBrief(briefData);
    const selectedDecision = resolveDecisionFromText(ownerBrief, input.text);
    const hasLookup = Boolean(decisionLookupQuery(input.text) || decisionOrdinalIndex(input.text) !== null);

    if (!selectedDecision && hasLookup && ownerBrief.decisions.length > 1) {
      return {
        intent: "show_material_not_found",
        command: null,
        text: "Не нашёл материал по этой фразе. Напишите номер из списка или часть темы.",
        buttons: briefCommandButtons(ownerBrief),
        ownerBrief
      };
    }

    return {
      intent: "show_material",
      command: null,
      text: renderDecisionContent(ownerBrief, selectedDecision),
      buttons: postCommandButtons(ownerBrief, selectedDecision),
      ownerBrief
    };
  }

  if (includesAny(text, ["нужны правки", "нужна правка", "переделай", "исправь", "не согласую", "не ок"])) {
    const briefData = await loadOwnerBriefData(context.tenantId);
    const ownerBrief = buildOwnerBrief(briefData);
    const selectedDecision = resolveDecisionFromText(ownerBrief, input.text);
    const hasLookup = Boolean(decisionLookupQuery(input.text) || decisionOrdinalIndex(input.text) !== null);
    const targetId = typeof selectedDecision?.id === "string" ? selectedDecision.id : primaryDecisionIdFromBrief(ownerBrief);

    if (!selectedDecision && hasLookup && ownerBrief.decisions.length > 1) {
      return {
        intent: "request_changes_not_found",
        command: null,
        text: "Не нашёл материал для правок по этой фразе. Напишите номер из списка или часть темы.",
        buttons: briefCommandButtons(ownerBrief),
        ownerBrief
      };
    }

    const commandResult = targetId
      ? await executeTelegramCommand({ command: "/changes", note: input.note, targetId }, context)
      : await executeTelegramCommand({ command: "/changes", note: input.note }, context);
    return {
      ...commandResult,
      intent: "request_changes",
      command: null
    };
  }

  if (includesAny(text, ["передал", "передано", "отправил в выпуск", "передал в выпуск", "пусть выложат", "передал в канал", "отправил саше", "отправил ответственному"])) {
    const commandResult = await executeTelegramCommand({ command: "/handoff", note: input.note }, context);
    return {
      ...commandResult,
      intent: "manual_handoff",
      command: null
    };
  }

  if (includesAny(text, ["вышло", "опубликовано", "пост вышел", "материал вышел", "подтверждаю выход"])) {
    const commandResult = await executeTelegramCommand({ command: "/published", note: input.note }, context);
    return {
      ...commandResult,
      intent: "confirm_published",
      command: null
    };
  }

  if (isApprovalIntent(text) || /^(согласую|одобряю|утверждаю|согласовать)\s+/.test(text)) {
    const briefData = await loadOwnerBriefData(context.tenantId);
    const ownerBrief = buildOwnerBrief(briefData);
    const selectedDecision = resolveDecisionFromText(ownerBrief, input.text);
    const hasLookup = Boolean(decisionLookupQuery(input.text) || decisionOrdinalIndex(input.text) !== null);
    const targetId = typeof selectedDecision?.id === "string" ? selectedDecision.id : primaryDecisionIdFromBrief(ownerBrief);

    if (!selectedDecision && hasLookup && ownerBrief.decisions.length > 1) {
      return {
        intent: "approve_not_found",
        command: null,
        text: "Не нашёл материал для согласования по этой фразе. Напишите номер из списка или часть темы.",
        buttons: briefCommandButtons(ownerBrief),
        ownerBrief
      };
    }

    const commandResult = targetId
      ? await executeTelegramCommand({ command: "/osapprove", note: input.note, targetId }, context)
      : await executeTelegramCommand({ command: "/osapprove", note: input.note }, context);
    return {
      ...commandResult,
      intent: "approve_current",
      command: null
    };
  }

  if (includesAny(text, ["результат", "заявки", "деньги", "сигналы", "что по результату", "следующий шаг"])) {
    const briefData = await loadOwnerBriefData(context.tenantId);
    const ownerBrief = buildOwnerBrief(briefData);
    return {
      intent: "result",
      command: null,
      text: renderResultMessage(ownerBrief),
      buttons: publicationResultCommandButtons(ownerBrief),
      ownerBrief
    };
  }

  if (includesAny(text, [
    "запусти пилот",
    "старт пилота",
    "начать пилот",
    "week-1 pilot",
    "week 1 pilot",
    "week-1 пилот",
    "пилот первой недели",
    "запусти первую неделю"
  ])) {
    const commandResult = await executeTelegramCommand({ command: "/pilot", note: input.text }, context);
    return {
      ...commandResult,
      intent: "pilot_week_1_start",
      command: null
    };
  }

  if (includesAny(text, ["онбординг", "настройка", "настроить", "запуск"])) {
    const commandResult = await executeTelegramCommand({ command: "/onboarding", note: input.note }, context);
    return {
      ...commandResult,
      intent: "onboarding",
      command: null
    };
  }

  if (isAdvisorQuestion(text)) {
    return executeTelegramAdvisorIntent(input, context);
  }

  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);
  return {
    intent: "unknown",
    command: null,
    text: renderUnknownIntentMessage(ownerBrief),
    buttons: ownerControlButtons(ownerBrief),
    ownerBrief
  };
}

async function sendOwnerBriefToTelegram(brief: OwnerBrief, input: { dryRun?: boolean }) {
  const message = brief.telegramMessage;
  const replyMarkup = telegramInlineKeyboard(message.buttons);
  const payload = {
    chat_id: config.telegramApprovalChatId,
    text: message.text,
    reply_markup: replyMarkup
  };

  if (input.dryRun) {
    return {
      delivery: "dry_run",
      payload
    };
  }

  if (!config.telegramBotToken || !config.telegramApprovalChatId) {
    const error = new Error("Telegram delivery is not configured");
    Object.assign(error, { statusCode: 409, code: "TELEGRAM_DELIVERY_NOT_CONFIGURED" });
    throw error;
  }

  const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const responseBody = await response.json().catch(() => null) as Row | null;

  if (!response.ok) {
    const error = new Error("Telegram delivery failed");
    Object.assign(error, {
      statusCode: 502,
      code: "TELEGRAM_DELIVERY_FAILED",
      details: responseBody
    });
    throw error;
  }

  return {
    delivery: "sent",
    telegram: responseBody
  };
}

async function sendTelegramCommandResult(result: TelegramCommandResult, input: { dryRun?: boolean }) {
  const payload = {
    chat_id: config.telegramApprovalChatId,
    text: result.text,
    reply_markup: telegramCommandKeyboard(result.buttons)
  };

  if (input.dryRun) {
    return {
      delivery: "dry_run",
      payload
    };
  }

  if (!config.telegramBotToken || !config.telegramApprovalChatId) {
    const error = new Error("Telegram delivery is not configured");
    Object.assign(error, { statusCode: 409, code: "TELEGRAM_DELIVERY_NOT_CONFIGURED" });
    throw error;
  }

  const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const responseBody = await response.json().catch(() => null) as Row | null;

  if (!response.ok) {
    const error = new Error("Telegram delivery failed");
    Object.assign(error, {
      statusCode: 502,
      code: "TELEGRAM_DELIVERY_FAILED",
      details: responseBody
    });
    throw error;
  }

  return {
    delivery: "sent",
    telegram: responseBody
  };
}

async function telegramApiRequest<T>(method: string, payload: Row) {
  if (!config.telegramBotToken) {
    const error = new Error("Telegram bot token is not configured");
    Object.assign(error, { code: "TELEGRAM_BOT_TOKEN_NOT_CONFIGURED" });
    throw error;
  }

  const response = await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/${method}`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const responseBody = await response.json().catch(() => null) as TelegramApiResponse<T> | null;

  if (!response.ok || !responseBody?.ok) {
    const error = new Error(`Telegram API ${method} failed`);
    Object.assign(error, {
      code: "TELEGRAM_API_FAILED",
      details: responseBody
    });
    throw error;
  }

  return responseBody.result as T;
}

async function sendTelegramOwnerControlMessage(input: {
  buttons?: TelegramCommandButton[];
  chatId: number | string;
  text: string;
}) {
  return telegramApiRequest("sendMessage", {
    chat_id: input.chatId,
    text: input.text,
    reply_markup: telegramCommandKeyboard(input.buttons)
  });
}

async function answerTelegramCallbackQuery(callbackQueryId: string | undefined, text?: string) {
  if (!callbackQueryId) return null;

  return telegramApiRequest("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    ...(text ? { text } : {})
  }).catch(() => null);
}

async function ensureTelegramOwnerControlPollingMode(app: FastifyInstance) {
  await telegramApiRequest<boolean>("deleteWebhook", {
    drop_pending_updates: false
  });
  app.log.info("Telegram webhook is cleared for owner-control polling");
}

function telegramOwnerControlAllowedUsers() {
  return new Set(
    config.telegramAllowedUsers
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

function telegramUpdateUserId(update: TelegramUpdate) {
  return String(update.message?.from?.id ?? update.callback_query?.from?.id ?? "");
}

function telegramUpdateChatId(update: TelegramUpdate) {
  return update.message?.chat?.id ?? update.callback_query?.message?.chat?.id ?? null;
}

function isTelegramOwnerAllowed(update: TelegramUpdate, allowedUsers: Set<string>) {
  if (!allowedUsers.size) return false;
  return allowedUsers.has(telegramUpdateUserId(update));
}

function renderTelegramActionResultMessage(actionResult: Awaited<ReturnType<typeof executeTelegramAction>>) {
  if ("text" in actionResult && typeof actionResult.text === "string") return actionResult.text;

  if (actionResult.pilotWeekExecution) {
    const taskType = String(actionResult.pilotWeekExecution.task?.task_type || "");
    const week = Number(taskType.match(/pilot_week_(\d+)_execution/)?.[1] || 2);
    return renderPilotWeekExecutionMessage(actionResult.pilotWeekExecution, week);
  }

  if (actionResult.weekTwoExecution) {
    return renderWeekTwoExecutionMessage(actionResult.weekTwoExecution);
  }

  if (actionResult.action === "approval.approve") {
    return "Решение зафиксировано: согласовано.";
  }

  if (actionResult.action === "approval.request_changes") {
    return "Решение зафиксировано: нужны правки.";
  }

  return "Решение зафиксировано.";
}

async function processTelegramOwnerControlUpdate(update: TelegramUpdate, allowedUsers: Set<string>, app: FastifyInstance) {
  const chatId = telegramUpdateChatId(update);
  const userId = telegramUpdateUserId(update);

  if (!chatId) return;
  const context: TelegramExecutionContext = {
    app,
    telegramChatId: chatId,
    tenantId: config.telegramOwnerControlTenantId,
    userId: config.telegramOwnerControlUserId
  };

  if (!isTelegramOwnerAllowed(update, allowedUsers)) {
    app.log.warn({ updateId: update.update_id, userId }, "Rejected Telegram owner-control update from non-allowed user");
    return;
  }

  const callbackData = update.callback_query?.data;
  if (callbackData) {
    await answerTelegramCallbackQuery(update.callback_query?.id);

    const action = parseTelegramCallbackData(callbackData);
    if (action) {
      const actionResult = await executeTelegramAction(action, context);
      await sendTelegramOwnerControlMessage({
        chatId,
        text: renderTelegramActionResultMessage(actionResult),
        buttons: "buttons" in actionResult && Array.isArray(actionResult.buttons)
          ? actionResult.buttons
          : briefCommandButtons(actionResult.ownerBrief)
      });
      await query(
        `insert into integrations (tenant_id, provider, status, config)
         values ($1, 'telegram_owner_control_middleware', 'action', $2)
         returning *`,
        [context.tenantId, { updateId: update.update_id, action: action.action, userId }]
      );
      return;
    }

    const command = parseTelegramCommandCallbackData(callbackData);
    if (command) {
      const commandResult = await executeTelegramCommand(command, context);
      await sendTelegramOwnerControlMessage({
        chatId,
        text: commandResult.text,
        buttons: commandResult.buttons
      });
      await query(
        `insert into integrations (tenant_id, provider, status, config)
         values ($1, 'telegram_owner_control_middleware', 'command', $2)
         returning *`,
        [context.tenantId, { updateId: update.update_id, command: command.command, userId }]
      );
      return;
    }

    await sendTelegramOwnerControlMessage({
      chatId,
      text: renderUnknownIntentMessage()
    });
    return;
  }

  const text = update.message?.text?.trim();
  if (!text) return;

  const intentResult = await executeTelegramIntent({ text }, context);
  await sendTelegramOwnerControlMessage({
    chatId,
    text: intentResult.text,
    buttons: intentResult.buttons
  });
  await query(
    `insert into integrations (tenant_id, provider, status, config)
     values ($1, 'telegram_owner_control_middleware', 'intent', $2)
     returning *`,
    [context.tenantId, { updateId: update.update_id, intent: intentResult.intent, command: intentResult.command, userId }]
  );
}

export function startTelegramOwnerControlPolling(app: FastifyInstance) {
  if (!config.telegramOwnerControlPolling) {
    return;
  }

  const allowedUsers = telegramOwnerControlAllowedUsers();
  if (!config.telegramBotToken || !allowedUsers.size) {
    app.log.warn("Telegram owner-control polling is enabled but bot token or allowed users are not configured");
    return;
  }

  let offset = 0;
  let stopped = false;
  let timer: NodeJS.Timeout | null = null;
  let backoffScheduled = false;

  const schedule = () => {
    if (stopped) return;
    timer = setTimeout(poll, Math.max(500, config.telegramOwnerControlPollIntervalMs));
  };

  const poll = async () => {
    backoffScheduled = false;
    try {
      const updates = await telegramApiRequest<TelegramUpdate[]>("getUpdates", {
        offset,
        timeout: 0,
        limit: 20,
        allowed_updates: ["message", "callback_query"]
      });

      for (const update of updates ?? []) {
        offset = Math.max(offset, update.update_id + 1);
        await processTelegramOwnerControlUpdate(update, allowedUsers, app).catch((error) => {
          app.log.error({ error, updateId: update.update_id }, "Telegram owner-control update failed");
        });
      }
    } catch (error) {
      app.log.error({ error }, "Telegram owner-control polling failed");
      const errorCode = (error as { details?: { error_code?: number } })?.details?.error_code;
      if (errorCode === 409) {
        app.log.warn("Got 409 Conflict from getUpdates, backing off 5-10s before retry");
        if (!stopped) {
          timer = setTimeout(poll, 5000 + Math.random() * 5000);
        }
        backoffScheduled = true;
      }
    } finally {
      if (!stopped && !backoffScheduled) {
        schedule();
      }
    }
  };

  app.addHook("onClose", async () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  });

  app.log.info("Telegram owner-control polling middleware is enabled");
  ensureTelegramOwnerControlPollingMode(app)
    .catch((error) => {
      app.log.error({ error }, "Failed to clear Telegram webhook before owner-control polling");
    })
    .finally(schedule);
}

export async function telegramRoutes(app: FastifyInstance) {
  app.get("/telegram/owner-brief", async (request) => {
    const briefData = await loadOwnerBriefData(request.tenantId);

    return {
      data: buildOwnerBrief(briefData)
    };
  });

  app.post("/telegram/owner-brief/send", async (request) => {
    const body = telegramSendOwnerBriefSchema.parse(request.body ?? {});
    const briefData = await loadOwnerBriefData(request.tenantId);
    const ownerBrief = buildOwnerBrief(briefData);
    const delivery = await sendOwnerBriefToTelegram(ownerBrief, { dryRun: body.dryRun });

    await query(
      `insert into integrations (tenant_id, provider, status, config)
       values ($1, 'telegram_owner_brief_delivery', $2, $3)
       returning *`,
      [request.tenantId, delivery.delivery, {
        dryRun: Boolean(body.dryRun),
        ownerBrief,
        delivery
      }]
    );

    return {
      data: {
        ownerBrief,
        delivery
      }
    };
  });

  app.post("/telegram/actions", async (request) => {
    const body = telegramActionSchema.parse(request.body ?? {});
    const actionResult = await executeTelegramAction(body, {
      tenantId: request.tenantId,
      userId: request.userId
    });

    return {
      data: actionResult
    };
  });

  app.post("/telegram/commands", async (request) => {
    const body = telegramCommandSchema.parse(request.body ?? {});
    const result = await executeTelegramCommand(body, {
      tenantId: request.tenantId,
      userId: request.userId
    });

    return {
      data: result
    };
  });

  app.post("/telegram/intent", async (request) => {
    const body = telegramIntentSchema.parse(request.body ?? {});
    const result = await executeTelegramIntent(body, {
      tenantId: request.tenantId,
      userId: request.userId
    });

    return {
      data: result
    };
  });

  app.post("/telegram/materials", async (request) => {
    const body = telegramMaterialSchema.parse(request.body ?? {});
    const result = await createTelegramMaterial(body, {
      tenantId: request.tenantId,
      userId: request.userId
    });

    return {
      data: result
    };
  });

  app.post("/telegram/commands/send", async (request) => {
    const body = telegramSendCommandSchema.parse(request.body ?? {});
    const result = await executeTelegramCommand(body, {
      telegramChatId: config.telegramApprovalChatId,
      tenantId: request.tenantId,
      userId: request.userId
    });
    const delivery = await sendTelegramCommandResult(result, { dryRun: body.dryRun });

    await query(
      `insert into integrations (tenant_id, provider, status, config)
       values ($1, 'telegram_command_delivery', $2, $3)
       returning *`,
      [request.tenantId, delivery.delivery, {
        dryRun: Boolean(body.dryRun),
        command: body.command,
        result,
        delivery
      }]
    );

    return {
      data: {
        result,
        delivery
      }
    };
  });

  app.post("/telegram/webhook", async (request, reply) => {
    const secret = request.headers["x-telegram-bot-api-secret-token"];
    if (config.telegramWebhookSecret && secret !== config.telegramWebhookSecret) {
      return reply.status(401).send({ error: "invalid webhook secret" });
    }

    const telegramAction = parseTelegramWebhookAction(request.body ?? {});
    const telegramCommand = telegramAction ? null : parseTelegramWebhookCommand(request.body ?? {});
    const actionResult = telegramAction
      ? await executeTelegramAction(telegramAction, {
        tenantId: request.tenantId,
        userId: request.userId
      })
      : null;
    const commandResult = telegramCommand
      ? await executeTelegramCommand(telegramCommand, {
        tenantId: request.tenantId,
        userId: request.userId
      })
      : null;

    await query(
      `insert into integrations (tenant_id, provider, status, config)
       values ($1, 'telegram_webhook_event', 'received', $2)
       returning *`,
      [request.tenantId, {
        payload: request.body ?? {},
        action: telegramAction,
        actionResult,
        command: telegramCommand,
        commandResult
      }]
    );

    return {
      ok: true,
      data: actionResult ?? commandResult
    };
  });
}
