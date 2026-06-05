import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { config } from "../../config.js";
import { query } from "../../db/client.js";
import { createApprovalRequest, decideApproval } from "../approvals/service.js";
import { insertJson } from "../common/repository.js";

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

type TelegramActionInput = z.infer<typeof telegramActionSchema>;
type OwnerBrief = ReturnType<typeof buildOwnerBrief>;
type TelegramCommandInput = z.infer<typeof telegramCommandSchema>;
type TelegramCommandResult = Awaited<ReturnType<typeof executeTelegramCommand>>;
type TelegramIntentInput = z.infer<typeof telegramIntentSchema>;
type TelegramMaterialInput = z.infer<typeof telegramMaterialSchema>;

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function truncateText(value: string, maxLength = 120) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1).trim()}…` : value;
}

function ownerBriefNextAction(pendingApprovals: Row[], handedOffItems: Row[]) {
  if (pendingApprovals.length) {
    return {
      type: "approval",
      label: "Открыть решение",
      title: textValue(pendingApprovals[0].summary, "Есть материал на согласование"),
      targetId: pendingApprovals[0].id ?? null
    };
  }

  if (handedOffItems.length) {
    return {
      type: "confirm_publication",
      label: "Подтвердить выход",
      title: textValue(handedOffItems[0].title, "Переданный материал ждёт подтверждения"),
      targetId: handedOffItems[0].id ?? null
    };
  }

  return {
    type: "watch_results",
    label: "Проверить результат",
    title: "Ждём заявки, ответа или другого бизнес-сигнала",
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
  latestSummary: Row;
  pendingApprovals: Row[];
  publishedItems: Row[];
}) {
  const { handedOffItems, latestSummary, pendingApprovals, publishedItems } = input;
  const primaryDecision = pendingApprovals[0] ?? null;
  const primaryHandoff = handedOffItems[0] ?? null;
  const leads = Number(latestSummary.leads ?? 0);
  const money = Number(latestSummary.recovered_payments ?? 0);

  const lines = [
    "AgentResult OS",
    "",
    `Решения: ${pendingApprovals.length}`,
    `Передано вручную: ${handedOffItems.length}`,
    `Вышло: ${publishedItems.length}`,
    `Заявки: ${leads}`,
    `Деньги: ${money}`,
    ""
  ];

  if (primaryDecision) {
    lines.push(`Следующее решение: ${truncateText(textValue(primaryDecision.summary, "Материал ждёт решения"))}`);
  } else if (primaryHandoff) {
    lines.push(`Подтвердить выход: ${truncateText(textValue(primaryHandoff.title, "Переданный материал"))}`);
  } else {
    lines.push("Следующий шаг: проверить результат и новые сигналы.");
  }

  const buttons = [
    ...(primaryDecision ? approvalButtons(primaryDecision) : []),
    ...(primaryHandoff ? handoffButtons(primaryHandoff) : [])
  ];

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
  const { approvals, calendar, contentItems, latestSummary } = input;
  const pendingApprovals = approvals.filter((row) => row.status === "pending");
  const handedOffItems = calendar.filter((row) => row.status === "handed_off");
  const publishedItems = calendar.filter((row) => row.status === "published");
  const contentById = new Map(contentItems.map((row) => [row.id, row]));

  return {
    surface: "telegram_control",
    message: "Короткая сводка для решения собственника",
    counts: {
      decisions: pendingApprovals.length,
      handedOff: handedOffItems.length,
      published: publishedItems.length,
      leads: Number(latestSummary.leads ?? 0),
      money: Number(latestSummary.recovered_payments ?? 0)
    },
    decisions: pendingApprovals.slice(0, 5).map((row) => {
      const contentItem = typeof row.target_id === "string" ? contentById.get(row.target_id) : null;
      const contentText = textValue(contentItem?.body_md, "");

      return {
        id: row.id,
        title: textValue(row.summary, "Материал ждёт решения"),
        scope: row.scope ?? null,
        riskFlags: Array.isArray(row.risk_flags) ? row.risk_flags : [],
        targetType: row.target_type ?? null,
        targetId: row.target_id ?? null,
        contentItemId: contentItem?.id ?? null,
        contentTitle: contentItem ? textValue(contentItem.title, "Материал") : null,
        contentType: contentItem?.content_type ?? null,
        channel: contentItem?.channel ?? null,
        contentPreview: contentText ? truncateText(contentText, 700) : null,
        contentText: contentText || null
      };
    }),
    handoffs: handedOffItems.slice(0, 5).map((row) => ({
      id: row.id,
      title: textValue(row.title, "Переданный материал"),
      channel: row.channel ?? "manual",
      scheduledFor: row.scheduled_for ?? null
    })),
    results: {
      published: publishedItems.length,
      manualHandoffWaiting: handedOffItems.length,
      leads: Number(latestSummary.leads ?? 0),
      recoveredPayments: Number(latestSummary.recovered_payments ?? 0)
    },
    telegramMessage: renderOwnerBriefMessage({
      handedOffItems,
      latestSummary,
      pendingApprovals,
      publishedItems
    }),
    nextAction: ownerBriefNextAction(pendingApprovals, handedOffItems),
    updatedAt: new Date().toISOString()
  };
}

async function loadOwnerBriefData(tenantId: string) {
  const [approvalsResult, calendarResult, contentItemsResult, latestImport] = await Promise.all([
    query("select * from approvals where tenant_id = $1 order by created_at desc limit 200", [tenantId]),
    query("select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 300", [tenantId]),
    query("select * from content_items where tenant_id = $1 order by created_at desc limit 200", [tenantId]),
    query("select * from analytics_imports where tenant_id = $1 order by created_at desc limit $2", [tenantId, 1]).catch(() => ({
      rows: []
    }))
  ]);
  const latestSummary = latestImport.rows[0]?.payload && typeof latestImport.rows[0].payload === "object"
    ? (latestImport.rows[0].payload as Row)
    : {};

  return {
    approvals: approvalsResult.rows as Row[],
    calendar: calendarResult.rows as Row[],
    contentItems: contentItemsResult.rows as Row[],
    latestSummary
  };
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

function renderOnboardingMessage() {
  return [
    "AgentResult OS — настройка",
    "",
    "1. Контекст бизнеса: что продаём, кому, какая цель.",
    "2. Правила согласования: что можно готовить, что требует решения.",
    "3. Каналы: сайт, Telegram, email, ручная передача.",
    "4. Доступы: кто отвечает за выпуск и подтверждение результата.",
    "5. Первый цикл: материал -> решение -> выпуск -> сигнал.",
    "",
    "Начнём с контекста бизнеса: что продаём и какой результат нужен в ближайшие 2 недели?"
  ].join("\n");
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
  const decision = brief.decisions[0];
  const lines = [
    "AgentResult OS — сводка",
    "",
    `Решения: ${brief.counts.decisions}`,
    `Передано вручную: ${brief.counts.handedOff}`,
    `Вышло: ${brief.counts.published}`,
    `Заявки: ${brief.counts.leads}`,
    `Деньги: ${brief.counts.money}`,
    ""
  ];

  if (decision) {
    lines.push("Требует решения:");
    lines.push(decision.title);
    if (decision.riskFlags.length) lines.push(`Риски: ${decision.riskFlags.join(", ")}`);
    lines.push("");
    lines.push("Доступно: /post, /osapprove, /changes");
  } else {
    lines.push("Сейчас нет решений в очереди.");
  }

  return lines.join("\n");
}

function renderMaterialCreatedMessage(input: { approval: Row; contentItem: Row }) {
  return [
    "Материал сохранён.",
    "",
    `Решение: ${textValue(input.approval.summary, "Согласовать материал")}`,
    `Канал: ${textValue(input.contentItem.channel, "telegram")}`,
    "",
    "Доступно: /post, /osapprove, /changes"
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
  return [
    "AgentResult OS — результат",
    "",
    `Вышло: ${brief.counts.published}`,
    `Передано вручную: ${brief.counts.handedOff}`,
    `Заявки: ${brief.counts.leads}`,
    `Деньги: ${brief.counts.money}`,
    "",
    brief.counts.decisions
      ? "Следующий шаг: закрыть решение в очереди."
      : "Следующий шаг: проверить новые сигналы после выпуска."
  ].join("\n");
}

function includesAny(value: string, patterns: string[]) {
  return patterns.some((pattern) => value.includes(pattern));
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
    commandButton("/post", "Показать пост", targetId),
    commandButton("/onboarding", "Настройка")
  ];

  if (targetId) {
    buttons.splice(1, 0, commandButton("/osapprove", "Согласовать", targetId));
    buttons.splice(2, 0, commandButton("/changes", "Нужны правки", targetId));
  }

  return buttons;
}

function postCommandButtons(brief: OwnerBrief): TelegramCommandButton[] {
  const targetId = typeof brief.decisions[0]?.id === "string" ? brief.decisions[0].id : null;
  const buttons = [commandButton("/brief", "Сводка")];

  if (targetId) {
    buttons.unshift(commandButton("/changes", "Нужны правки", targetId));
    buttons.unshift(commandButton("/osapprove", "Согласовать", targetId));
  }

  return buttons;
}

function onboardingCommandButtons(): TelegramCommandButton[] {
  return [
    commandButton("/brief", "Сводка"),
    commandButton("/post", "Показать пост")
  ];
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

async function executeTelegramCommand(input: TelegramCommandInput, context: { tenantId: string; userId?: string }) {
  const command = input.command.trim().toLowerCase().replace(/^\/+/, "");
  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);
  const primaryDecisionId = typeof ownerBrief.decisions[0]?.id === "string" ? ownerBrief.decisions[0].id : null;
  const targetId = input.targetId ?? primaryDecisionId;

  if (["brief", "status", "решения", "сводка"].includes(command)) {
    return {
      command,
      text: renderCommandBrief(ownerBrief),
      buttons: briefCommandButtons(ownerBrief),
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
    return {
      command,
      text: renderOnboardingMessage(),
      buttons: onboardingCommandButtons(),
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
    text: "Команда не распознана. Доступно: /brief, /post, /osapprove, /changes, /onboarding.",
    buttons: briefCommandButtons(ownerBrief),
    ownerBrief
  };
}

async function executeTelegramIntent(input: TelegramIntentInput, context: { tenantId: string; userId?: string }) {
  const text = input.text.trim().toLowerCase().replace(/\s+/g, " ");

  if (text.startsWith("/")) {
    const commandResult = await executeTelegramCommand({ command: text, note: input.note }, context);
    return {
      ...commandResult,
      intent: "slash_command",
      command: commandResult.command
    };
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
      buttons: briefCommandButtons(ownerBrief),
      ownerBrief
    };
  }

  if (includesAny(text, ["что требует", "что решить", "что дальше", "что сейчас", "что мне сделать", "сводка", "статус"])) {
    const commandResult = await executeTelegramCommand({ command: "/brief", note: input.note }, context);
    return {
      ...commandResult,
      intent: "brief",
      command: "/brief"
    };
  }

  if (includesAny(text, ["покажи пост", "скинь пост", "покажи материал", "скинь материал", "покажи текст", "скинь текст", "черновик"])) {
    const commandResult = await executeTelegramCommand({ command: "/post", note: input.note }, context);
    return {
      ...commandResult,
      intent: "show_material",
      command: "/post"
    };
  }

  if (includesAny(text, ["нужны правки", "нужна правка", "переделай", "исправь", "не согласую", "не ок"])) {
    const commandResult = await executeTelegramCommand({ command: "/changes", note: input.note }, context);
    return {
      ...commandResult,
      intent: "request_changes",
      command: "/changes"
    };
  }

  if (["да", "ок", "окей", "согласую", "утверждаю", "можно", "подтверждаю", "одобряю"].includes(text) ||
    includesAny(text, ["да, соглас", "ок, соглас", "можно выпускать", "подтверждаю выпуск"])) {
    const commandResult = await executeTelegramCommand({ command: "/osapprove", note: input.note }, context);
    return {
      ...commandResult,
      intent: "approve_current",
      command: "/osapprove"
    };
  }

  if (includesAny(text, ["онбординг", "настройка", "настроить", "запуск"])) {
    const commandResult = await executeTelegramCommand({ command: "/onboarding", note: input.note }, context);
    return {
      ...commandResult,
      intent: "onboarding",
      command: "/onboarding"
    };
  }

  if (includesAny(text, ["результат", "заявки", "деньги", "сигналы", "что по результату"])) {
    const briefData = await loadOwnerBriefData(context.tenantId);
    const ownerBrief = buildOwnerBrief(briefData);
    return {
      intent: "result",
      command: null,
      text: renderResultMessage(ownerBrief),
      buttons: briefCommandButtons(ownerBrief),
      ownerBrief
    };
  }

  const briefData = await loadOwnerBriefData(context.tenantId);
  const ownerBrief = buildOwnerBrief(briefData);
  return {
    intent: "unknown",
    command: null,
    text: "Не распознал действие. Можно написать: что дальше, покажи пост, согласую, нужны правки, что по результату.",
    buttons: briefCommandButtons(ownerBrief),
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
