const tenantId = "00000000-0000-0000-0000-000000000001";
const ownerId = "77777777-7777-4777-8777-777777777771";

const now = "2026-06-05T22:04:45.765Z";

const offer = {
  id: "11111111-1111-4111-8111-111111111111",
  tenant_id: tenantId,
  name: "AgentResult",
  website_url: "https://agentresult-crm.vercel.app/",
  positioning:
    "AgentResult строит B2B AI-agent systems, которые помогают собственнику держать под контролем продажи, рост и операционные процессы через понятный Telegram-пульт.",
  profile: {
    positioning:
      "AgentResult строит B2B AI-agent systems для продаж, продвижения, CRM-автоматизации и операционного контроля через approval-first Telegram-пульт собственника.",
    icp:
      "Собственники B2B-компаний, агентства, интеграторы, SaaS-команды и сервисные компании с длинным циклом сделки, дебиторкой, слабой CRM-дисциплиной и неровным ростом.",
    pains:
      "Лиды теряются; менеджеры не ведут CRM; follow-up пропускается; собственник не видит, что происходит; контент хаотичен; сайт не приводит спрос; дебиторка висит без системного дожима; AI кажется рискованным к внедрению.",
    proof:
      "Рабочий прототип AgentResult WebApp; собранная архитектура backend -> Hermes -> Postgres -> Telegram/WebApp; отдельный прототип AI Growth OS; продуктовая линейка и build-in-public история, где AgentResult строит AgentResult на AgentResult.",
    forbiddenClaims:
      "Без гарантированного роста выручки, без гарантированного возврата дебиторки, без обещания заменить весь отдел продаж, без утверждения про безошибочную автономию, без юридически значимых действий без согласования, без автопубликации и авторассылок без согласования, без обещаний результата без данных и дисциплины.",
    tone:
      "Фразы автора: 'меньше каши', 'через решение', 'похоже на рабочий контур'. Стоп-слова: революционный, магия, гарантированный рост. Убрать AI-шаблон: 'в современном мире', длинные вступления, пустые списки преимуществ. Прямота: коротко, рабоче, без канцелярита. Proof/risk: не обещать магию и гарантированный рост. Решение QA: похоже / не похоже на автора.",
    authorVoiceContract:
      "Фразы автора: 'меньше каши', 'через решение', 'похоже на рабочий контур'. Стоп-слова: революционный, магия, гарантированный рост. Убрать AI-шаблон: 'в современном мире', длинные вступления, пустые списки преимуществ. Прямота: коротко, рабоче, без канцелярита. Proof/risk: не обещать магию и гарантированный рост. Решение QA: похоже / не похоже на автора.",
    products: ["AgentResult Sales OS", "AgentResult Collect / DebtorPilot", "AI Growth OS"],
    competitors:
      "CRM-интеграторы, внедренцы Bitrix24 и amoCRM, AI-автоматизаторы, performance- и content-агентства, no-code-подрядчики, внутренние операторы, generic AI tools и SDR/outreach-сервисы.",
    domains: "agentresult-crm.vercel.app\nagentresult.ru\napp.agentresult.ru\napi.agentresult.ru\nagentresult.online",
    channels: "Telegram WebApp, сайт/CMS, email, позже Bitrix24/amoCRM, резервный сценарий через CSV/XLSX",
    approvalOwner:
      "Собственник согласует публичные публикации, рискованные утверждения, имена клиентов, сравнения с конкурентами и действия по дебиторке.",
    releaseOwner: "Менеджер контента проверяет фактологию, стиль автора и иишность перед выпуском.",
    firstSignalSource: "Ответы в Telegram, заявки формы, комментарии в канале или ручная отметка собственника."
  },
  tone_of_voice: "Практично, прямо, уверенно, без хайпа.",
  created_at: "2026-06-03T23:48:07.016Z",
  updated_at: now
};

const demand = [
  ["33333333-3333-4333-8333-333333333331", "AI-агенты для B2B-продаж", "product_page", "commercial", 100, "brief"],
  ["33333333-3333-4333-8333-333333333332", "Как вернуть просроченную дебиторку без отдельного оператора", "problem_page", "problem-aware", 94, "research"],
  ["33333333-3333-4333-8333-333333333333", "Telegram CRM для собственника", "use_case_page", "solution-aware", 88, "brief"],
  ["33333333-3333-4333-8333-333333333334", "AI-агент для Bitrix24", "integration_page", "integration", 82, "idea"],
  ["33333333-3333-4333-8333-333333333335", "AI-агент для amoCRM", "integration_page", "integration", 78, "idea"],
  ["33333333-3333-4333-8333-333333333336", "Агент по дебиторке из Excel-импорта", "template_page", "lead magnet", 74, "idea"]
].map(([id, title, item_type, intent, priority, status]) => ({
  id,
  tenant_id: tenantId,
  item_type,
  title,
  slug: `/${title.toLowerCase().replaceAll(" ", "-")}`,
  intent,
  audience: "Собственники B2B-компаний",
  product_id: "22222222-2222-4222-8222-222222222221",
  status,
  priority,
  evidence_requirements: ["demo WebApp", "approval gates", "proof assets"],
  notes: {},
  created_at: "2026-06-03T23:48:07.016Z",
  updated_at: now
}));

const content = [
  {
    id: "44444444-4444-4444-8444-444444444441",
    tenant_id: tenantId,
    demand_map_item_id: "33333333-3333-4333-8333-333333333331",
    title: "Почему одного AI-агента недостаточно, чтобы наладить продажи",
    content_type: "telegram_post",
    channel: "telegram",
    status: "review",
    owner: "Egor",
    body_md:
      "Сам по себе AI не двигает продажи. Нужен операционный контур: задачи, CRM, согласования, Telegram-контроль и история действий.",
    metadata: {},
    created_at: "2026-06-03T23:48:07.016Z",
    updated_at: now
  },
  {
    id: "44444444-4444-4444-8444-444444444442",
    tenant_id: tenantId,
    demand_map_item_id: "33333333-3333-4333-8333-333333333331",
    title: "AI Growth OS для B2B-компаний",
    content_type: "landing_page",
    channel: "website",
    status: "draft",
    owner: "Egor",
    body_md: "H1: AI Growth OS для B2B-компаний",
    metadata: {},
    created_at: "2026-06-03T23:48:07.016Z",
    updated_at: now
  }
];

const approvals = [
  {
    id: "66666666-6666-4666-8666-666666666661",
    tenant_id: tenantId,
    scope: "social_post",
    target_type: "content_item",
    target_id: "44444444-4444-4444-8444-444444444441",
    status: "pending",
    summary: "Согласовать Telegram-пост про контур продаж и контроль собственника",
    risk_flags: ["public claim", "channel publishing"],
    requested_by: null,
    decided_by: null,
    decision_note: null,
    decided_at: null,
    preview:
      "Сам по себе AI не двигает продажи. Нужен операционный контур: задачи, CRM, согласования, Telegram-контроль и история действий.",
    created_at: "2026-06-03T23:48:07.016Z",
    updated_at: now
  },
  {
    id: "66666666-6666-4666-8666-666666666662",
    tenant_id: tenantId,
    scope: "sensitive_claim",
    target_type: "content_item",
    target_id: "44444444-4444-4444-8444-444444444442",
    status: "approved",
    summary: "Согласовать формулировки для страницы AI Growth OS",
    risk_flags: ["proof required", "public claim"],
    requested_by: null,
    decided_by: ownerId,
    decision_note: "Можно ставить в план публикаций.",
    decided_at: "2026-06-05T22:04:45.756Z",
    created_at: "2026-06-03T23:48:07.016Z",
    updated_at: now
  },
  {
    id: "66666666-6666-4666-8666-666666666663",
    tenant_id: tenantId,
    scope: "publish",
    target_type: "publishing_calendar_item",
    target_id: "55555555-5555-4555-8555-555555555553",
    status: "approved",
    summary: "Согласовать недельный пакет материалов AgentResult",
    risk_flags: ["multi-channel distribution"],
    requested_by: null,
    decided_by: ownerId,
    decision_note: "Пакет можно использовать для передачи.",
    decided_at: "2026-06-05T22:04:45.756Z",
    created_at: "2026-06-03T23:48:07.016Z",
    updated_at: now
  }
];

const calendar = [
  {
    id: "55555555-5555-4555-8555-555555555551",
    tenant_id: tenantId,
    content_item_id: null,
    channel: "telegram",
    title: "Telegram-пост: почему бизнесу нужен операционный контур, а не один AI-агент",
    status: "published",
    scheduled_for: "2026-05-26T07:00:00.000Z",
    timezone: "Europe/Moscow",
    metadata: {},
    created_at: "2026-06-03T23:48:07.016Z",
    updated_at: now
  },
  {
    id: "55555555-5555-4555-8555-555555555552",
    tenant_id: tenantId,
    content_item_id: "44444444-4444-4444-8444-444444444442",
    channel: "website",
    title: "AI Growth OS для B2B-компаний",
    status: "scheduled",
    scheduled_for: "2026-05-27T09:00:00.000Z",
    timezone: "Europe/Moscow",
    metadata: { handoff_source: "telegram_intent" },
    created_at: "2026-06-03T23:48:07.016Z",
    updated_at: now
  },
  {
    id: "55555555-5555-4555-8555-555555555553",
    tenant_id: tenantId,
    content_item_id: null,
    channel: "manual_export",
    title: "Недельный пакет публикаций AgentResult",
    status: "draft",
    scheduled_for: "2026-05-29T13:00:00.000Z",
    timezone: "Europe/Moscow",
    export_path: "exports/agentresult-2026-05-week-1",
    metadata: {},
    created_at: "2026-06-03T23:48:07.016Z",
    updated_at: now
  }
];

const agents = [
  "AgentResult",
  "Offer Architect",
  "SEO Research",
  "GEO / AI Search",
  "Page Brief",
  "Content Writer",
  "Manager QA"
].map((name, index) => ({ id: `agent-${index + 1}`, role: name, name, status: "active" }));

let workspaceState = {};

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET,POST,PUT,PATCH,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, x-tenant-id");
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function routeFromUrl(req) {
  const url = new URL(req.url, "https://dashboard.local");
  const rewrittenPath = url.searchParams.get("path");
  if (rewrittenPath) return rewrittenPath.replace(/^\/+|\/+$/g, "");
  return url.pathname
    .replace(/^\/api\/agentresult-os-demo\/?/, "")
    .replace(/^\/api\/os-demo\/?/, "")
    .replace(/^\/api\/?/, "")
    .replace(/\/$/, "");
}

function metrics() {
  const signals = distributionSignals();
  return {
    tasks_created: 0,
    approvals_total: approvals.length,
    published_materials: calendar.filter((item) => item.status === "published").length,
    distribution_signals: signals.length,
    result_signals: signals.length,
    leads: 3,
    receivables_in_progress: 0,
    promised_payments: 0,
    recovered_payments: 0,
    visits: 128,
    indexed_pages: 4,
    improvement_tasks: 0,
    content_items: content.length,
    calendar_items: calendar.length,
    pending_approvals: approvals.filter((item) => item.status === "pending").length
  };
}

function distributionSignals() {
  return calendar
    .filter((item) => item.status === "published")
    .map((item) => ({
      id: `signal-${item.id}`,
      tenant_id: tenantId,
      content_item_id: item.content_item_id || null,
      calendar_item_id: item.id,
      status: "confirmed",
      source: item.channel || "manual",
      signal_type: "distribution_signal.confirmed",
      legacy_signal_type: null,
      title: item.title,
      note: item.metadata?.result_note || "Confirmed release",
      value: null,
      occurred_at: item.updated_at || item.scheduled_for,
      confirmed_by: item.metadata?.published_confirmed_by || ownerId,
      metadata: {
        calendar_item_id: item.id,
        title: item.title,
        status: "confirmed"
      }
    }));
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return send(res, 204, {});

  const route = routeFromUrl(req);
  if (route === "health") return send(res, 200, { status: "ok" });
  if (route === "me") {
    return send(res, 200, {
      data: {
        tenantId,
        userId: ownerId,
        role: "owner",
        name: "Egor",
        email: "owner@agentresult.ru",
        permissions: ["approve", "publish", "configure", "results", "tasks"]
      }
    });
  }
  if (route === "offer") return send(res, 200, { data: offer });
  if (route === "demand-map") return send(res, 200, { data: demand });
  if (route === "approvals") return send(res, 200, { data: approvals });
  if (route === "agents") return send(res, 200, { data: agents });
  if (route === "analytics/overview") return send(res, 200, { data: metrics() });
  if (route === "distribution-signals") return send(res, 200, { data: distributionSignals() });
  if (route === "result-signals") return send(res, 200, { data: distributionSignals() });
  if (route === "content/items") return send(res, 200, { data: content });
  if (route === "publishing/calendar") return send(res, 200, { data: calendar });
  if (route === "tasks") return send(res, 200, { data: [] });
  if (route === "workspace/state" && req.method === "GET") return send(res, 200, { data: workspaceState });
  if (route === "workspace/state" && req.method === "PUT") {
    workspaceState = { ...workspaceState, ...(await readBody(req)) };
    return send(res, 200, { data: workspaceState });
  }

  const approvalMatch = route.match(/^approvals\/([^/]+)\/(approve|reject|request-changes)$/);
  if (approvalMatch && req.method === "POST") {
    const [, id, action] = approvalMatch;
    const body = await readBody(req);
    const item = approvals.find((approval) => approval.id === id);
    if (!item) return send(res, 404, { error: "not_found" });
    item.status = action === "approve" ? "approved" : action === "reject" ? "rejected" : "changes_requested";
    item.decision_note = body.note || "";
    item.decided_by = ownerId;
    item.decided_at = new Date().toISOString();
    item.updated_at = item.decided_at;
    return send(res, 200, { data: item });
  }

  const calendarStatusMatch = route.match(/^publishing\/items\/([^/]+)\/status$/);
  if (calendarStatusMatch && req.method === "PATCH") {
    const body = await readBody(req);
    const item = calendar.find((entry) => entry.id === calendarStatusMatch[1]);
    if (!item) return send(res, 404, { error: "not_found" });
    item.status = body.status || item.status;
    item.updated_at = new Date().toISOString();
    return send(res, 200, { data: item });
  }

  if (route === "content/items" && req.method === "POST") {
    const body = await readBody(req);
    const item = { id: crypto.randomUUID(), tenant_id: tenantId, created_at: new Date().toISOString(), ...body };
    content.unshift(item);
    return send(res, 200, { data: item });
  }

  return send(res, 404, { error: "not_found", route });
}
