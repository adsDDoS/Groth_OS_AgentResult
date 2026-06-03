import type { FastifyInstance } from "fastify";
import { config } from "../../config.js";
import { query } from "../../db/client.js";

type Row = Record<string, unknown>;
type TelegramButton = {
  action: string;
  label: string;
  targetId: unknown;
  targetType: "approval" | "publishing_calendar_item";
};

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function countByStatus(rows: Row[], status: string) {
  return rows.filter((row) => row.status === status).length;
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
  return [
    {
      action: "approval.approve",
      label: "Согласовать",
      targetId: approval.id ?? null,
      targetType: "approval"
    },
    {
      action: "approval.request_changes",
      label: "Нужны правки",
      targetId: approval.id ?? null,
      targetType: "approval"
    }
  ];
}

function handoffButtons(item: Row): TelegramButton[] {
  return [
    {
      action: "publishing.confirm_live",
      label: "Подтвердить выход",
      targetId: item.id ?? null,
      targetType: "publishing_calendar_item"
    }
  ];
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

export async function telegramRoutes(app: FastifyInstance) {
  app.get("/telegram/owner-brief", async (request) => {
    const [approvalsResult, calendarResult, latestImport] = await Promise.all([
      query("select * from approvals where tenant_id = $1 order by created_at desc limit 200", [request.tenantId]),
      query("select * from publishing_calendar_items where tenant_id = $1 order by scheduled_for asc limit 300", [request.tenantId]),
      query("select * from analytics_imports where tenant_id = $1 order by created_at desc limit $2", [request.tenantId, 1]).catch(() => ({
        rows: []
      }))
    ]);

    const approvals = approvalsResult.rows as Row[];
    const calendar = calendarResult.rows as Row[];
    const pendingApprovals = approvals.filter((row) => row.status === "pending");
    const handedOffItems = calendar.filter((row) => row.status === "handed_off");
    const publishedItems = calendar.filter((row) => row.status === "published");
    const latestSummary = latestImport.rows[0]?.payload && typeof latestImport.rows[0].payload === "object"
      ? (latestImport.rows[0].payload as Row)
      : {};

    return {
      data: {
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
          published: countByStatus(calendar, "published"),
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
      }
    };
  });

  app.post("/telegram/webhook", async (request, reply) => {
    const secret = request.headers["x-telegram-bot-api-secret-token"];
    if (config.telegramWebhookSecret && secret !== config.telegramWebhookSecret) {
      return reply.status(401).send({ error: "invalid webhook secret" });
    }

    await query(
      `insert into integrations (tenant_id, provider, status, config)
       values ($1, 'telegram_webhook_event', 'received', $2)`,
      [request.tenantId, request.body ?? {}]
    );

    return { ok: true };
  });
}
