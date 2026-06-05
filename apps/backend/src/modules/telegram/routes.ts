import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { config } from "../../config.js";
import { query } from "../../db/client.js";
import { resetMemoryDemoStore } from "../../db/memory.js";
import { createAgentTask } from "../agents/runner.js";
import { createApprovalRequest, decideApproval } from "../approvals/service.js";
import { insertJson, patchJson } from "../common/repository.js";
import { dispatchHermesTask } from "../hermes/index.js";

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
  tasks: Row[];
};
type TelegramExecutionContext = {
  app?: FastifyInstance;
  telegramChatId?: number | string;
  tenantId: string;
  userId?: string;
};
type BriefData = Awaited<ReturnType<typeof loadOwnerBriefData>>;
type OnboardingStep = "offer" | "client" | "channel" | "approval_rules" | "first_material" | "done";
type OnboardingState = {
  answers: Record<string, string>;
  completedAt?: string;
  step: OnboardingStep;
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
  targetId: z.string().uuid().optional(),
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
  step: z.enum(["offer", "client", "channel", "approval_rules", "first_material", "done"]).default("offer"),
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

function ownerFacingText(value: unknown, fallback = "") {
  return textValue(value, fallback)
    .replace(/\bHermes\b/g, "AgentResult")
    .replace(/\bhermes\b/g, "AgentResult");
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
  if (text.includes("email") || text.includes("почт")) return "email";
  if (text.includes("habr") || text.includes("хабр")) return "habr";
  if (text.includes("vc")) return "vc";
  if (text.includes("сайт") || text.includes("cms")) return "site";
  if (text.includes("telegram") || text.includes("телеграм") || text.includes("тг")) return "telegram";
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
  handedOffItems: Row[];
  hermesDraftTasks: Row[];
  latestSummary: Row;
  pendingApprovals: Row[];
  publishedItems: Row[];
}) {
  const { handedOffItems, hermesDraftTasks, pendingApprovals } = input;
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
    ...compactStateBlock("Ждёт решения", pendingApprovals.map((row) => ownerFacingText(row.summary, "Материал ждёт решения"))),
    "",
    ...compactStateBlock("Готовится", preparingTitles)
  ];

  if (priority.type === "confirm_publication") {
    lines.push("");
    lines.push("Приоритет: подтвердить выход.");
    if (pendingApprovals.length) {
      lines.push(`Также готов новый материал: ${truncateText(ownerFacingText(pendingApprovals[0]?.summary, "материал"))}`);
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
  const { approvals, calendar, contentItems, latestSummary, tasks } = input;
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
    telegramMessage: renderOwnerBriefMessage({
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
  const [approvalsResult, calendarResult, contentItemsResult, latestImport, tasksResult] = await Promise.all([
    query("select * from approvals where tenant_id = $1 order by created_at desc limit 200", [tenantId]),
    query("select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 300", [tenantId]),
    query("select * from content_items where tenant_id = $1 order by created_at desc limit 200", [tenantId]),
    query("select * from analytics_imports where tenant_id = $1 order by created_at desc limit $2", [tenantId, 1]).catch(() => ({
      rows: []
    })),
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

async function executeTelegramAction(input: TelegramActionInput, context: { tenantId: string; userId?: string }) {
  let result: Row | null = null;

  if (input.action === "approval.approve") {
    result = await decideApproval({
      id: input.targetId,
      tenantId: context.tenantId,
      status: "approved",
      decidedBy: context.userId,
      decisionNote: input.note
    });
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
    const updated = await query(
      "update publishing_calendar_items set status = $3, updated_at = now() where id = $1 and tenant_id = $2 returning *",
      [input.targetId, context.tenantId, "published"]
    );
    result = updated.rows[0] ?? null;
  }

  const briefData = await loadOwnerBriefData(context.tenantId);
  return {
    action: input.action,
    result,
    ownerBrief: buildOwnerBrief(briefData)
  };
}

function onboardingPrompt(step: OnboardingStep) {
  if (step === "offer") {
    return [
      "Настроим Growth Control.",
      "",
      "Шаг 1/5 — оффер.",
      "Что продаёте и какой результат должен увидеть клиент?"
    ].join("\n");
  }

  if (step === "client") {
    return [
      "Шаг 2/5 — клиент.",
      "Кому продаёте: сегмент, роль ЛПР, главная боль?"
    ].join("\n");
  }

  if (step === "channel") {
    return [
      "Шаг 3/5 — канал выпуска.",
      "Куда в первую очередь выпускаем материалы: Telegram, сайт, email, VC/Habr или ручная передача ответственному?"
    ].join("\n");
  }

  if (step === "approval_rules") {
    return [
      "Шаг 4/5 — правила согласования.",
      "Что обязательно должно ждать вашего решения перед выпуском?"
    ].join("\n");
  }

  return [
    "Шаг 5/5 — первый материал.",
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
    offer: "оффер"
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
    "оффер, клиент, канал выпуска, правила согласования и первый материал.",
    "",
    onboardingPrompt("offer")
  ].join("\n");
}

function nextOnboardingStep(step: OnboardingStep): OnboardingStep {
  if (step === "offer") return "client";
  if (step === "client") return "channel";
  if (step === "channel") return "approval_rules";
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
    offer: "offer"
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
    icp: textValue(answers.client, textValue(profile.icp, "")),
    onboarding: {
      channel: normalizeChannel(textValue(answers.channel, "manual")),
      completedAt: new Date().toISOString(),
      firstMaterial: textValue(answers.firstMaterial, ""),
      source: "telegram_owner_control"
    },
    positioning: textValue(answers.offer, textValue(profile.positioning, ""))
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
      offer: textValue(answers.offer, ""),
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
    buttons: ownerControlButtons(ownerBrief),
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
      buttons: ownerControlButtons(ownerBrief),
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
      `Согласование: ${textValue(answers.approvalRules, "публичные материалы ждут решения собственника")}`,
      "",
      `AgentResult взял задачу: ${title}`,
      context.telegramChatId
        ? "Задача в работе. Я пришлю черновик отдельным сообщением, когда он будет готов."
        : "Задача в работе. Черновик появится на согласование после подготовки."
    ].join("\n"),
    buttons: ownerControlButtons(ownerBrief),
    hermesJob: {
      delivery: "queued",
      taskId: hermesTask.id
    },
    hermesTask,
    ownerBrief,
    onboarding: completedState
  };
}

function renderDecisionContent(brief: OwnerBrief) {
  const decision = brief.decisions[0];
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
    "Следующий шаг: посмотреть материал, согласовать или запросить правки."
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

  return [
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
  ].join("\n");
}

function renderHandoffMessage(input: { item: Row; ownerBrief: OwnerBrief }) {
  return [
    "Передано в выпуск вручную.",
    "",
    `Материал: ${textValue(input.item.title, "Материал")}`,
    `Канал: ${channelLabel(input.item.channel)}`,
    "",
    "Следующий шаг: после выхода подтвердить публикацию.",
    "Если материал уже опубликован, подтвердите выход."
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
    "Можно написать обычным языком: что сегодня, показать материал, согласовать, нужны правки, передал в выпуск, вышло, что по результату."
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

function briefCommandButtons(brief: OwnerBrief): TelegramCommandButton[] {
  const targetId = typeof brief.decisions[0]?.id === "string" ? brief.decisions[0].id : null;
  const buttons = [
    commandButton("post", "Показать материал", targetId),
    commandButton("onboarding", "Настройка")
  ];

  if (brief.counts.preparing > 0) {
    buttons.splice(1, 0, commandButton("preparing", "Что готовится"));
  }

  if (targetId) {
    buttons.splice(1, 0, commandButton("osapprove", "Согласовать", targetId));
    buttons.splice(2, 0, commandButton("changes", "Нужны правки", targetId));
  }

  return buttons;
}

function postCommandButtons(brief: OwnerBrief): TelegramCommandButton[] {
  const targetId = typeof brief.decisions[0]?.id === "string" ? brief.decisions[0].id : null;
  const buttons = [commandButton("brief", "Сводка")];

  if (targetId) {
    buttons.unshift(commandButton("changes", "Нужны правки", targetId));
    buttons.unshift(commandButton("osapprove", "Согласовать", targetId));
  }

  return buttons;
}

function onboardingCommandButtons(): TelegramCommandButton[] {
  return [
    commandButton("brief", "Сводка"),
    commandButton("post", "Показать материал")
  ];
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
    if (decisionId) buttons.push(commandButton("post", "Показать материал", decisionId));
    if (brief.counts.preparing > 0) buttons.push(commandButton("preparing", "Что готовится"));
    return buttons;
  }
  if (brief.counts.decisions > 0) return briefCommandButtons(brief);
  if (brief.counts.preparing > 0) return [commandButton("preparing", "Что готовится"), commandButton("onboarding", "Настройка")];
  return [commandButton("result", "Результат"), commandButton("onboarding", "Настройка")];
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

async function createManualHandoff(context: { tenantId: string; userId?: string }) {
  const briefData = await loadOwnerBriefData(context.tenantId);
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
    .replace(/^поставь\s+(тему|материал|пост|черновик)\s+в\s+работу\s*/i, "")
    .replace(/^в\s+работу\s*/i, "")
    .replace(/^следующий\s+(материал|пост|черновик)\s*/i, "")
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

async function executeTelegramCommand(input: TelegramCommandInput, context: TelegramExecutionContext) {
  const command = input.command.trim().toLowerCase().replace(/^\/+/, "");
  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);
  const primaryDecisionId = typeof ownerBrief.decisions[0]?.id === "string" ? ownerBrief.decisions[0].id : null;
  const targetId = input.targetId ?? primaryDecisionId;

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

  if (["post", "material", "draft", "текст", "пост", "материал"].includes(command)) {
    return {
      command,
      text: renderDecisionContent(ownerBrief),
      buttons: postCommandButtons(ownerBrief),
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
    return createManualHandoff(context);
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

    const actionResult = await executeTelegramAction({
      action: "publishing.confirm_live",
      targetId: handoff.id,
      note: input.note
    }, context);

    return {
      command,
      text: "Выход подтверждён. Материал учтён в результатах.",
      buttons: briefCommandButtons(actionResult.ownerBrief),
      ownerBrief: actionResult.ownerBrief,
      actionResult
    };
  }

  if (["published_status", "что вышло", "статус выпуска"].includes(command)) {
    return {
      command,
      text: renderPublishedStatusMessage(ownerBrief),
      buttons: ownerControlButtons(ownerBrief),
      ownerBrief
    };
  }

  if (["approve", "osapprove", "ok", "согласовать", "ок"].includes(command)) {
    if (!targetId) {
      return {
        command,
        text: "Сейчас нет решения, которое можно согласовать.",
        buttons: briefCommandButtons(ownerBrief),
        ownerBrief
      };
    }

    const actionResult = await executeTelegramAction({
      action: "approval.approve",
      targetId,
      note: input.note
    }, context);

    return {
      command,
      text: "Решение зафиксировано: согласовано.",
      buttons: briefCommandButtons(actionResult.ownerBrief),
      ownerBrief: actionResult.ownerBrief,
      actionResult
    };
  }

  if (["changes", "request_changes", "правки", "нужны правки"].includes(command)) {
    if (!targetId) {
      return {
        command,
        text: "Сейчас нет решения, по которому можно запросить правки.",
        buttons: briefCommandButtons(ownerBrief),
        ownerBrief
      };
    }

    const actionResult = await executeTelegramAction({
      action: "approval.request_changes",
      targetId,
      note: input.note || "Нужны правки из Telegram-контура"
    }, context);

    return {
      command,
      text: "Решение зафиксировано: нужны правки.",
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
    "поставь материал в работу",
    "поставь пост в работу",
    "следующий материал",
    "следующий пост",
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
      buttons: ownerControlButtons(ownerBrief),
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
    "покажи пост",
    "скинь пост",
    "покажи материал",
    "скинь материал",
    "посмотреть материал",
    "можно посмотреть материал",
    "покажи текст",
    "скинь текст",
    "черновик"
  ])) {
    const commandResult = await executeTelegramCommand({ command: "/post", note: input.note }, context);
    return {
      ...commandResult,
      intent: "show_material",
      command: null
    };
  }

  if (includesAny(text, ["нужны правки", "нужна правка", "переделай", "исправь", "не согласую", "не ок"])) {
    const commandResult = await executeTelegramCommand({ command: "/changes", note: input.note }, context);
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

  if (isApprovalIntent(text)) {
    const commandResult = await executeTelegramCommand({ command: "/osapprove", note: input.note }, context);
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
      buttons: ownerControlButtons(ownerBrief),
      ownerBrief
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
  if (actionResult.action === "approval.approve") {
    return "Решение зафиксировано: согласовано.";
  }

  if (actionResult.action === "approval.request_changes") {
    return "Решение зафиксировано: нужны правки.";
  }

  if (actionResult.action === "publishing.confirm_live") {
    return renderResultMessage(actionResult.ownerBrief);
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
        buttons: briefCommandButtons(actionResult.ownerBrief)
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

  const schedule = () => {
    if (stopped) return;
    timer = setTimeout(poll, Math.max(500, config.telegramOwnerControlPollIntervalMs));
  };

  const poll = async () => {
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
    } finally {
      schedule();
    }
  };

  app.addHook("onClose", async () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  });

  app.log.info("Telegram owner-control polling middleware is enabled");
  schedule();
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
