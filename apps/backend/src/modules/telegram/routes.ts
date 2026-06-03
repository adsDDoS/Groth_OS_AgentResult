import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { config } from "../../config.js";
import { query } from "../../db/client.js";
import { decideApproval } from "../approvals/service.js";

type Row = Record<string, unknown>;
type TelegramButton = {
  action: string;
  callbackData: string | null;
  label: string;
  targetId: unknown;
  targetType: "approval" | "publishing_calendar_item";
};
type OwnerBriefInput = {
  approvals: Row[];
  calendar: Row[];
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

type TelegramActionInput = z.infer<typeof telegramActionSchema>;
type OwnerBrief = ReturnType<typeof buildOwnerBrief>;

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

function buildOwnerBrief(input: OwnerBriefInput) {
  const { approvals, calendar, latestSummary } = input;
  const pendingApprovals = approvals.filter((row) => row.status === "pending");
  const handedOffItems = calendar.filter((row) => row.status === "handed_off");
  const publishedItems = calendar.filter((row) => row.status === "published");

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
    decisions: pendingApprovals.slice(0, 5).map((row) => ({
      id: row.id,
      title: textValue(row.summary, "Материал ждёт решения"),
      scope: row.scope ?? null,
      riskFlags: Array.isArray(row.risk_flags) ? row.risk_flags : []
    })),
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
  const [approvalsResult, calendarResult, latestImport] = await Promise.all([
    query("select * from approvals where tenant_id = $1 order by created_at desc limit 200", [tenantId]),
    query("select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 300", [tenantId]),
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

  app.post("/telegram/webhook", async (request, reply) => {
    const secret = request.headers["x-telegram-bot-api-secret-token"];
    if (config.telegramWebhookSecret && secret !== config.telegramWebhookSecret) {
      return reply.status(401).send({ error: "invalid webhook secret" });
    }

    const telegramAction = parseTelegramWebhookAction(request.body ?? {});
    const actionResult = telegramAction
      ? await executeTelegramAction(telegramAction, {
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
        actionResult
      }]
    );

    return {
      ok: true,
      data: actionResult
    };
  });
}
