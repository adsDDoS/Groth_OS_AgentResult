import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type Row = Record<string, unknown>;

interface MemoryResult<T extends Row = Row> {
  rows: T[];
  rowCount: number;
}

const tenantId = "00000000-0000-0000-0000-000000000001";
const now = new Date().toISOString();

const ids = {
  ownerUser: "77777777-7777-4777-8777-777777777771",
  editorUser: "77777777-7777-4777-8777-777777777772",
  company: "11111111-1111-4111-8111-111111111111",
  productSalesOs: "22222222-2222-4222-8222-222222222221",
  productDebtorPilot: "22222222-2222-4222-8222-222222222222",
  productGrowthOs: "22222222-2222-4222-8222-222222222223",
  demandProduct: "33333333-3333-4333-8333-333333333331",
  demandDebtor: "33333333-3333-4333-8333-333333333332",
  demandTelegramCrm: "33333333-3333-4333-8333-333333333333",
  demandBitrix: "33333333-3333-4333-8333-333333333334",
  demandAmo: "33333333-3333-4333-8333-333333333335",
  demandExcel: "33333333-3333-4333-8333-333333333336",
  contentTelegram: "44444444-4444-4444-8444-444444444441",
  contentProductPage: "44444444-4444-4444-8444-444444444442",
  contentVc: "44444444-4444-4444-8444-444444444443",
  contentProof: "44444444-4444-4444-8444-444444444444",
  contentEmail: "44444444-4444-4444-8444-444444444445",
  contentLeadMagnet: "44444444-4444-4444-8444-444444444446",
  calendarTelegram: "55555555-5555-4555-8555-555555555551",
  calendarProductPage: "55555555-5555-4555-8555-555555555552",
  calendarPack: "55555555-5555-4555-8555-555555555553",
  approvalTelegram: "66666666-6666-4666-8666-666666666661",
  approvalComparison: "66666666-6666-4666-8666-666666666662",
  approvalPack: "66666666-6666-4666-8666-666666666663",
  taskLeadSource: "88888888-8888-4888-8888-888888888881",
  taskPublishResult: "88888888-8888-4888-8888-888888888882",
  analyticsImportDemo: "99999999-9999-4999-8999-999999999991"
};

const localStorePath =
  process.env.AI_GROWTH_OS_LOCAL_DATA_PATH ??
  process.env.AI_GROWTH_OS_LOCAL_DATA_FILE ??
  resolve(process.cwd(), "apps/backend/.runtime/agentresult.local-data.json");

const agentResultProfileDefaults = {
  positioning:
    "AgentResult строит B2B AI-agent systems для продаж, продвижения, CRM-автоматизации и операционного контроля через approval-first Telegram-пульт собственника.",
  icp:
    "Собственники B2B-компаний, агентства, интеграторы, SaaS-команды и сервисные компании с длинным циклом сделки, дебиторкой, слабой CRM-дисциплиной и неровным ростом.",
  pains:
    "Лиды теряются; менеджеры не ведут CRM; follow-up пропускается; собственник не видит, что происходит; контент хаотичен; сайт не приводит спрос; дебиторка висит без системного дожима; AI кажется рискованным к внедрению.",
  products: [
    "AgentResult Sales OS",
    "AgentResult Collect / DebtorPilot",
    "AI Growth OS"
  ],
  domains:
    "agentresult-crm.vercel.app\nagentresult.ru\napp.agentresult.ru\napi.agentresult.ru\nagentresult.online",
  channels:
    "Telegram WebApp, сайт/CMS, email, позже Bitrix24/amoCRM, резервный сценарий через CSV/XLSX",
  approvalOwner:
    "Собственник согласует публичные публикации, рискованные утверждения, имена клиентов, сравнения с конкурентами и действия по дебиторке.",
  proof:
    "Рабочий прототип AgentResult WebApp; собранная архитектура backend -> Hermes -> Postgres -> Telegram/WebApp; отдельный прототип AI Growth OS; продуктовая линейка и build-in-public история, где AgentResult строит AgentResult на AgentResult.",
  objections: [
    "AI will make mistakes.",
    "Our business is too complex.",
    "Managers will not use it.",
    "We already tried CRM.",
    "We do not have time to implement this.",
    "I am afraid of the wrong emails going out."
  ],
  forbiddenClaims:
    "Без гарантированного роста выручки, без гарантированного возврата дебиторки, без обещания заменить весь отдел продаж, без утверждения про безошибочную автономию, без юридически значимых действий без согласования, без автопубликации и авторассылок без согласования, без обещаний результата без данных и дисциплины.",
  tone: "Практично, прямо, уверенно, по-взрослому, без хайпа, языком денег, заявок, задач, контроля и результата.",
  competitors:
    "CRM-интеграторы, внедренцы Bitrix24 и amoCRM, AI-автоматизаторы, performance- и content-агентства, no-code-подрядчики, внутренние операторы, generic AI tools и SDR/outreach-сервисы."
};

const store: Record<string, Row[]> = {
  tenants: [
    {
      id: tenantId,
      name: "AgentResult",
      slug: "agentresult",
      plan: "local-launch",
      settings: {
        mode: "manual-first",
        modules: [
          "offer-brain",
          "programmatic-seo",
          "ai-search",
          "content-factory",
          "proof-engine",
          "publishing-approval",
          "distribution",
          "results-loop"
        ]
      },
      created_at: now,
      updated_at: now
    }
  ],
  users: [
    {
      id: ids.ownerUser,
      tenant_id: tenantId,
      email: "owner@agentresult.ru",
      name: "Egor",
      role: "owner",
      profile: { title: "Owner" },
      created_at: now,
      updated_at: now
    },
    {
      id: ids.editorUser,
      tenant_id: tenantId,
      email: "editor@agentresult.ru",
      name: "Content editor",
      role: "editor",
      profile: { title: "Editor" },
      created_at: now,
      updated_at: now
    }
  ],
  companies: [
    {
      id: ids.company,
      tenant_id: tenantId,
      name: "AgentResult",
      website_url: "https://agentresult-crm.vercel.app/",
      profile: {
        ...agentResultProfileDefaults
      },
      positioning:
        "AgentResult строит B2B AI-agent systems, которые помогают собственнику держать под контролем продажи, рост и операционные процессы через понятный Telegram-пульт.",
      tone_of_voice: "Практично, прямо, уверенно, без хайпа.",
      created_at: now,
      updated_at: now
    }
  ],
  products: [
    {
      id: ids.productSalesOs,
      tenant_id: tenantId,
      company_id: ids.company,
      name: "AgentResult Sales OS",
      category: "AI-agent sales system / CRM automation",
      description:
        "An AI-agent sales system where agents manage tasks, leads, follow-ups, CRM discipline and owner control through Telegram WebApp.",
      differentiators: ["operating system, not a chat", "approvals and audit log", "Telegram owner cockpit", "tasks, CRM and agent workflows in one layer"],
      integrations: ["Telegram Bot", "Telegram WebApp", "Postgres", "CRM", "Email", "OpenRouter", "Hermes"],
      created_at: now,
      updated_at: now
    },
    {
      id: ids.productDebtorPilot,
      tenant_id: tenantId,
      company_id: ids.company,
      name: "AgentResult Collect / DebtorPilot",
      category: "AI collection automation / receivables",
      description:
        "A receivables autopilot that finds unpaid invoices, prepares touches, tracks payment promises and escalates overdue items.",
      differentiators: ["pain tied directly to money", "starts from CSV/XLSX", "approval-first debtor workflow"],
      integrations: ["CSV/XLSX", "Email / SMTP", "Telegram", "Postgres", "1C", "Bank", "EDO"],
      created_at: now,
      updated_at: now
    },
    {
      id: ids.productGrowthOs,
      tenant_id: tenantId,
      company_id: ids.company,
      name: "AI Growth OS",
      category: "B2B growth/content/SEO/GEO operating system",
      description:
        "A B2B growth OS that builds demand maps, SEO and GEO pages, content packs, posts, articles, lead magnets and approvals.",
      differentiators: ["offer brain and proof engine", "approval-first publishing", "not an AI writer but an operating system"],
      integrations: ["Website / CMS", "Telegram", "VC", "Habr", "Search Console", "Analytics", "Email", "Postgres", "Hermes"],
      created_at: now,
      updated_at: now
    }
  ],
  icp_profiles: [
    {
      id: randomUUID(),
      tenant_id: tenantId,
      name: "B2B owner with sales and growth chaos",
      segment: "B2B companies 10-200 people, agencies, integrators, SaaS teams and service providers",
      firmographics: { size: "10-200 people", market: "Russia and CIS B2B", sales_motion: "consultative" },
      buying_triggers: ["CRM exists but results do not move", "follow-ups are missed", "receivables leak money", "owner wants a clear control panel"],
      disqualifiers: ["expects risky autonomy without approval", "wants fake proof", "wants spam content only"],
      created_at: now,
      updated_at: now
    }
  ],
  proof_points: [
    {
      id: randomUUID(),
      tenant_id: tenantId,
      title: "AgentResult is building its own sales and growth operating system on the same architecture",
      proof_type: "implementation",
      source_note: "Internal AgentResult case: AgentResult runs on AgentResult",
      confidence: "verified_internal",
      approved_for_public_use: false,
      created_at: now,
      updated_at: now
    },
    {
      id: randomUUID(),
      tenant_id: tenantId,
      title: "Telegram WebApp and AI Growth OS prototypes already show the approval-first control model",
      proof_type: "product_prototype",
      source_note: "WebApp, approvals screen, growth dashboard and planned DebtorPilot flow",
      confidence: "verified_internal",
      approved_for_public_use: true,
      created_at: now,
      updated_at: now
    }
  ],
  competitors: [
    {
      id: randomUUID(),
      tenant_id: tenantId,
      name: "CRM integrators",
      positioning: "Implement CRM systems, but usually do not create an AI action layer, approvals or owner-level control.",
      watch_level: "high",
      created_at: now,
      updated_at: now
    },
    {
      id: randomUUID(),
      tenant_id: tenantId,
      name: "Generic AI tools and outreach services",
      positioning: "Generate text or outbound sequences, but do not provide a full operating system with backend control, approvals and audit.",
      watch_level: "normal",
      created_at: now,
      updated_at: now
    }
  ],
  demand_map_items: [
    {
      id: ids.demandProduct,
      tenant_id: tenantId,
      item_type: "product_page",
      title: "AI-агенты для B2B-продаж",
      slug: "/ai-agenty-dlya-b2b-prodazh",
      intent: "commercial",
      audience: "Собственники B2B-компаний",
      product_id: ids.productSalesOs,
      status: "brief",
      priority: 100,
      evidence_requirements: ["demo WebApp", "architecture sketch", "internal AgentResult case"],
      notes: { matrix: "product x owner pain", module: "Sales OS" },
      created_at: now,
      updated_at: now
    },
    {
      id: ids.demandDebtor,
      tenant_id: tenantId,
      item_type: "problem_page",
      title: "Как вернуть просроченную дебиторку без отдельного оператора",
      slug: "/debitorka/bez-nayma-operatora",
      intent: "problem-aware",
      audience: "Собственники и финансисты с просроченной дебиторкой",
      product_id: ids.productDebtorPilot,
      status: "research",
      priority: 94,
      evidence_requirements: ["aging report examples", "CSV workflow", "approval-safe collection scripts"],
      notes: { matrix: "problem x product", topic: "receivables" },
      created_at: now,
      updated_at: now
    },
    {
      id: ids.demandTelegramCrm,
      tenant_id: tenantId,
      item_type: "use_case_page",
      title: "Telegram CRM для собственника",
      slug: "/telegram-crm/dlya-b2b-prodazh",
      intent: "solution-aware",
      audience: "Собственники, которым не хочется жить внутри CRM",
      product_id: ids.productSalesOs,
      status: "brief",
      priority: 88,
      evidence_requirements: ["WebApp screenshots", "approval gates", "task handoff rules"],
      notes: { matrix: "use-case x product", channel: "Telegram" },
      created_at: now,
      updated_at: now
    },
    {
      id: ids.demandBitrix,
      tenant_id: tenantId,
      item_type: "integration_page",
      title: "AI-агент для Bitrix24",
      slug: "/ai-agent-dlya-bitrix24",
      intent: "integration",
      audience: "Команды, которые уже работают в Bitrix24",
      product_id: ids.productSalesOs,
      status: "idea",
      priority: 82,
      evidence_requirements: ["integration limitations", "what can be read", "what requires approval"],
      notes: { matrix: "integration x pain" },
      created_at: now,
      updated_at: now
    },
    {
      id: ids.demandAmo,
      tenant_id: tenantId,
      item_type: "integration_page",
      title: "AI-агент для amoCRM",
      slug: "/ai-agent-dlya-amo-crm",
      intent: "integration",
      audience: "Команды, которые уже работают в amoCRM",
      product_id: ids.productSalesOs,
      status: "idea",
      priority: 78,
      evidence_requirements: ["pipeline stages", "follow-up rules", "no automatic deal movement"],
      notes: { matrix: "integration x sales workflow" },
      created_at: now,
      updated_at: now
    },
    {
      id: ids.demandExcel,
      tenant_id: tenantId,
      item_type: "template_page",
      title: "Агент по дебиторке из Excel-импорта",
      slug: "/debitorka/excel-import",
      intent: "lead magnet",
      audience: "B2B-команды, которые пока живут в таблицах",
      product_id: ids.productDebtorPilot,
      status: "idea",
      priority: 74,
      evidence_requirements: ["CSV template", "data safety notes", "manual approval rules"],
      notes: { matrix: "template x problem" },
      created_at: now,
      updated_at: now
    }
  ],
  content_items: [
    {
      id: ids.contentTelegram,
      tenant_id: tenantId,
      demand_map_item_id: ids.demandTelegramCrm,
      title: "Почему одного AI-агента недостаточно, чтобы наладить продажи",
      content_type: "telegram_post",
      channel: "telegram",
      status: "review",
      target_url: "https://t.me/agentresult",
      body_md:
        "Один AI-агент не чинит продажи.\n\nЕсли в компании нет контура управления, он просто добавляет ещё один поток сообщений.\n\nЧто должно быть вместо этого:\n- заявки фиксируются и не теряются\n- задачи доходят до ответственного\n- материалы проходят согласование до выхода\n- собственник видит, что подготовлено, что выпущено и какой сигнал пришёл\n\nAgentResult OS строится как такой контур: AgentResult готовит, собственник принимает решение, выпуск или передача фиксируется, результат возвращается в систему.\n\nСледующий шаг — согласовать первый материал и проверить, какой сигнал он даст.",
      metadata: { owner: "Egor", idea: "sales-os", module: "Content Factory" },
      created_at: now,
      updated_at: now
    },
    {
      id: ids.contentProductPage,
      tenant_id: tenantId,
      demand_map_item_id: ids.demandProduct,
      title: "AI Growth OS для B2B-компаний",
      content_type: "landing_page",
      channel: "website",
      status: "approved",
      target_url: "https://agentresult-crm.vercel.app/",
      metadata: { owner: "Growth", module: "Programmatic SEO Pages" },
      created_at: now,
      updated_at: now
    },
    {
      id: ids.contentVc,
      tenant_id: tenantId,
      demand_map_item_id: ids.demandTelegramCrm,
      title: "Почему B2B-компаниям нужна агентная операционная система, а не только CRM",
      content_type: "article_outline",
      channel: "website",
      status: "brief",
      metadata: { owner: "Content", module: "Content Factory" },
      created_at: now,
      updated_at: now
    },
    {
      id: ids.contentProof,
      tenant_id: tenantId,
      demand_map_item_id: ids.demandDebtor,
      title: "Внутренний кейс: AgentResult строит AgentResult для контроля продаж и роста",
      content_type: "case_study",
      channel: "website",
      status: "idea",
      metadata: { owner: "Proof Engine", module: "Proof Engine" },
      created_at: now,
      updated_at: now
    },
    {
      id: ids.contentEmail,
      tenant_id: tenantId,
      demand_map_item_id: ids.demandProduct,
      title: "Email: безопасный запуск AI Growth OS",
      content_type: "email",
      channel: "email",
      status: "draft",
      metadata: { owner: "Content Factory", module: "Content Factory" },
      created_at: now,
      updated_at: now
    },
    {
      id: ids.contentLeadMagnet,
      tenant_id: tenantId,
      demand_map_item_id: ids.demandExcel,
      title: "Лид-магнит: чеклист готовности к AgentResult OS",
      content_type: "lead_magnet",
      channel: "website",
      status: "idea",
      metadata: { owner: "Lead Magnet Agent", module: "Lead Magnet" },
      created_at: now,
      updated_at: now
    }
  ],
  approvals: [
    {
      id: ids.approvalTelegram,
      tenant_id: tenantId,
      scope: "social_post",
      target_type: "content_item",
      target_id: ids.contentTelegram,
      status: "pending",
      summary: "Согласовать Telegram-пост про контур продаж и контроль собственника",
      risk_flags: ["public claim", "channel publishing"],
      requested_by: null,
      decided_by: null,
      decision_note: null,
      decided_at: null,
      created_at: now,
      updated_at: now
    },
    {
      id: ids.approvalComparison,
      tenant_id: tenantId,
      scope: "sensitive_claim",
      target_type: "content_item",
      target_id: ids.contentProductPage,
      status: "approved",
      summary: "Согласовать формулировки для страницы AI Growth OS",
      risk_flags: ["proof required", "public claim"],
      requested_by: null,
      decided_by: ids.ownerUser,
      decision_note: "Можно ставить в план публикаций.",
      decided_at: now,
      created_at: now,
      updated_at: now
    },
    {
      id: ids.approvalPack,
      tenant_id: tenantId,
      scope: "publish",
      target_type: "publishing_calendar_item",
      target_id: ids.calendarPack,
      status: "approved",
      summary: "Согласовать недельный пакет материалов AgentResult",
      risk_flags: ["multi-channel distribution"],
      requested_by: null,
      decided_by: ids.ownerUser,
      decision_note: "Пакет можно использовать для ручной передачи.",
      decided_at: now,
      created_at: now,
      updated_at: now
    }
  ],
  publishing_calendar_items: [
    {
      id: ids.calendarTelegram,
      tenant_id: tenantId,
      content_item_id: null,
      channel: "telegram",
      title: "Telegram-пост: почему бизнесу нужен операционный контур, а не один AI-агент",
      status: "published",
      scheduled_for: "2026-05-26T07:00:00.000Z",
      timezone: "Europe/Moscow",
      export_path: null,
      created_at: now,
      updated_at: now
    },
    {
      id: ids.calendarProductPage,
      tenant_id: tenantId,
      content_item_id: ids.contentProductPage,
      channel: "website",
      title: "AI Growth OS для B2B-компаний",
      status: "scheduled",
      scheduled_for: "2026-05-27T09:00:00.000Z",
      timezone: "Europe/Moscow",
      export_path: null,
      created_at: now,
      updated_at: now
    },
    {
      id: ids.calendarPack,
      tenant_id: tenantId,
      content_item_id: null,
      channel: "manual_export",
      title: "Недельный пакет публикаций AgentResult",
      status: "review",
      scheduled_for: "2026-05-29T13:00:00.000Z",
      timezone: "Europe/Moscow",
      export_path: "exports/agentresult-2026-05-week-1",
      created_at: now,
      updated_at: now
    }
  ],
  agents: [
    agent("growth_orchestrator", "Growth Orchestrator", "Plans demand maps and coordinates agent workflows."),
    agent("offer_architect", "Offer Architect Agent", "Turns company input into reusable offer brain assets."),
    agent("seo_research", "SEO Research Agent", "Builds intent, cluster, internal linking, and evidence plans."),
    agent("geo_ai_search", "GEO / AI Search Agent", "Creates concise answer blocks, entity briefs, and llms.txt drafts."),
    agent("page_brief", "Page Brief Agent", "Creates structured briefs before drafts."),
    agent("content_writer", "Content Writer Agent", "Drafts useful B2B content from approved briefs and proof."),
    agent("social_repurposing", "Social Repurposing Agent", "Repurposes approved ideas for channels."),
    agent("proof_case", "Proof / Case Agent", "Builds case studies, proof assets, and evidence checklists."),
    agent("lead_magnet", "Lead Magnet Agent", "Creates calculators, checklists, audits, and templates."),
    agent("analytics", "Analytics Agent", "Turns performance imports into improvement tasks."),
    agent("competitor_watch", "Competitor Watch Agent", "Monitors competitor messaging and gaps."),
    agent("publishing_qa", "Publishing QA Agent", "Checks drafts before approval and export.")
  ],
  tasks: [
    {
      id: ids.taskLeadSource,
      tenant_id: tenantId,
      agent_role: "growth",
      task_type: "connect_lead_source",
      target_type: "integration",
      target_id: null,
      status: "queued",
      priority: 90,
      payload: {
        title: "Подключить первый источник заявок",
        owner: "Продажи",
        note: "Нужно связать форму, CRM или таблицу, чтобы видеть заявки после публикаций.",
        source: "results"
      },
      result: {},
      created_by: ids.ownerUser,
      assigned_to: null,
      due_at: null,
      created_at: now,
      updated_at: now
    },
    {
      id: ids.taskPublishResult,
      tenant_id: tenantId,
      agent_role: "publishing",
      task_type: "confirm_publication_result",
      target_type: "publishing_calendar_item",
      target_id: ids.calendarTelegram,
      status: "approved",
      priority: 70,
      payload: {
        title: "Подтвердить первую публикацию",
        owner: "Публикации",
        note: "Telegram-пост отмечен как опубликованный и уже попал в результаты.",
        source: "publications"
      },
      result: {},
      created_by: ids.ownerUser,
      assigned_to: null,
      due_at: null,
      created_at: now,
      updated_at: now
    }
  ],
  task_events: [],
  publishing_channels: [],
  publishing_jobs: [],
  lead_magnets: [
    {
      id: randomUUID(),
      tenant_id: tenantId,
      title: "AI Growth OS readiness checklist",
      type: "checklist",
      status: "draft",
      audience: "B2B owner",
      body_md: "- Offer clarity\n- ICP and pains\n- Proof assets\n- Demand map coverage\n- Approval owner\n- Manual export readiness",
      metadata: { module: "Lead Magnet", source: "AgentResult launch" },
      created_at: now,
      updated_at: now
    }
  ],
  analytics_imports: [
    {
      id: ids.analyticsImportDemo,
      tenant_id: tenantId,
      source: "demo",
      payload: {
        leads: 3,
        published_materials: 1,
        tasks_created: 2,
        receivables_in_progress: 0,
        promised_payments: 0,
        recovered_payments: 0,
        improvement_tasks: 1
      },
      created_at: now
    }
  ],
  page_metrics: [],
  channel_metrics: [],
  conversion_events: []
};

const seedStore = structuredClone(store);

loadPersistedStore();
normalizeAgentResultWorkspace();
persistStore();

function agent(role: string, name: string, description: string): Row {
  return {
    id: randomUUID(),
    tenant_id: null,
    role,
    name,
    description,
    provider: "openrouter",
    model: null,
    policy_refs: ["GROWTH_POLICY.md", "CONTENT_POLICY.md"],
    is_active: true,
    created_at: now,
    updated_at: now
  };
}

export async function memoryQuery<T extends Row = Row>(sql: string, values: unknown[] = []): Promise<MemoryResult<T>> {
  const normalized = sql.replace(/\s+/g, " ").trim().toLowerCase();

  if (normalized.startsWith("select * from tenants where id = $1")) {
    return result(selectWhere("tenants", "id", values[0]) as T[]);
  }

  if (normalized.startsWith("update tenants set settings = $2 where id = $1 returning *")) {
    const row = findById("tenants", values[0]);
    if (!row) return result([]);
    row.settings = values[1];
    row.updated_at = new Date().toISOString();
    return persistedResult([row] as unknown as T[]);
  }

  if (normalized.startsWith("select * from users where id = $1 and tenant_id = $2")) {
    return result(selectTenantById("users", values[0], values[1]) as T[]);
  }

  if (normalized.startsWith("select * from companies where tenant_id = $1")) {
    return result(firstByCreatedAsc("companies", values[0]) as T[]);
  }

  if (normalized.startsWith("select id from companies where tenant_id = $1")) {
    return result(firstByCreatedAsc("companies", values[0]).map((row) => ({ id: row.id })) as unknown as T[]);
  }

  if (normalized.startsWith("update companies set")) {
    const row = findById("companies", values[0]);
    if (!row) return result([]);
    if (values[1] !== null && values[1] !== undefined) row.name = values[1];
    if (values[2] !== null && values[2] !== undefined) row.profile = values[2];
    if (values[3] !== null && values[3] !== undefined) row.website_url = values[3];
    row.updated_at = new Date().toISOString();
    return persistedResult([row] as unknown as T[]);
  }

  if (normalized.startsWith("insert into companies")) {
    const row: Row = withTimestamps({
      id: randomUUID(),
      tenant_id: values[0],
      name: values[1],
      profile: values[2] ?? {},
      website_url: values[3] ?? null
    });
    store.companies.push(row);
    return persistedResult([row] as unknown as T[]);
  }

  if (normalized.includes("from demand_map_items where tenant_id = $1")) {
    return result(tenantRows("demand_map_items", values[0]).sort(sortPriorityDesc) as T[]);
  }

  if (normalized.startsWith("select * from content_items where tenant_id = $1")) {
    return result(tenantRows("content_items", values[0]).sort(sortCreatedDesc) as T[]);
  }

  if (normalized.startsWith("select * from content_items where id = $1 and tenant_id = $2")) {
    return result(selectTenantById("content_items", values[0], values[1]) as T[]);
  }

  const selectByIdMatch = normalized.match(/^select \* from ([a-z_]+) where id = \$1 and tenant_id = \$2/);
  if (selectByIdMatch) {
    return result(selectTenantById(selectByIdMatch[1], values[0], values[1]) as T[]);
  }

  if (normalized.startsWith("update content_items set status = 'archived'")) {
    return persistedResult(updateStatus("content_items", values[0], values[1], "archived") as T[]);
  }

  if (normalized.startsWith("select * from approvals where tenant_id = $1")) {
    return result(tenantRows("approvals", values[0]).sort(sortCreatedDesc) as T[]);
  }

  if (normalized.startsWith("select id from approvals")) {
    return result(
      tenantRows("approvals", values[0]).filter(
        (row) => row.scope === values[1] && row.target_type === values[2] && row.target_id === values[3] && row.status === "approved"
      ).map((row) => ({ id: row.id })) as unknown as T[]
    );
  }

  if (normalized.startsWith("update approvals")) {
    const row = tenantRows("approvals", values[1]).find((item) => item.id === values[0]);
    if (!row) return result([]);
    row.status = values[2];
    row.decided_by = values[3] ?? null;
    row.decision_note = values[4] ?? null;
    row.decided_at = new Date().toISOString();
    row.updated_at = row.decided_at;
    return persistedResult([row] as unknown as T[]);
  }

  if (normalized.startsWith("select * from publishing_calendar_items where tenant_id = $1")) {
    return result(tenantRows("publishing_calendar_items", values[0]).sort(sortScheduledAsc) as T[]);
  }

  if (normalized.startsWith("insert into publishing_jobs")) {
    const row: Row = withTimestamps({
      id: randomUUID(),
      tenant_id: values[0],
      calendar_item_id: values[1],
      channel: null,
      status: "queued",
      requested_by: values[2] ?? null,
      result: {},
      error: null
    });
    store.publishing_jobs.push(row);
    return persistedResult([row] as unknown as T[]);
  }

  if (normalized.startsWith("update publishing_calendar_items set status = 'archived'")) {
    return persistedResult(updateStatus("publishing_calendar_items", values[0], values[1], "archived") as T[]);
  }

  if (normalized.startsWith("update publishing_calendar_items calendar")) {
    const rows = reconcileApprovedCalendarApprovals(values[0]);
    return persistedResult(rows as T[]);
  }

  if (normalized.startsWith("update publishing_calendar_items set status = $3")) {
    if (normalized.includes("jsonb_build_object")) {
      const rows = updateApprovedCalendarApprovalTarget({
        id: values[0],
        tenantId: values[1],
        status: values[2],
        approvalId: values[3],
        decisionNote: values[4],
        decidedBy: values[5],
        decidedAt: values[6]
      });
      return persistedResult(rows as T[]);
    }
    return persistedResult(updateStatus("publishing_calendar_items", values[0], values[1], values[2]) as T[]);
  }

  if (normalized.startsWith("select * from agents where tenant_id = $1 or tenant_id is null")) {
    return result(store.agents.filter((row) => row.tenant_id === values[0] || row.tenant_id === null).sort(sortByRoleAsc) as T[]);
  }

  if (normalized.startsWith("select * from tasks where tenant_id = $1 order by")) {
    return result(tenantRows("tasks", values[0]).sort(sortCreatedDesc) as T[]);
  }

  if (normalized.startsWith("select * from tasks where id = $1 and tenant_id = $2")) {
    return result(selectTenantById("tasks", values[0], values[1]) as T[]);
  }

  if (normalized.startsWith("select * from task_events where task_id = $1 and tenant_id = $2")) {
    return result(
      tenantRows("task_events", values[1]).filter((row) => row.task_id === values[0]).sort(sortCreatedAsc) as T[]
    );
  }

  if (normalized.startsWith("select * from conversion_events where tenant_id = $1 and event_type = $2")) {
    return result(
      tenantRows("conversion_events", values[0])
        .filter((row) => row.event_type === values[1])
        .sort((a, b) => String(b.occurred_at ?? "").localeCompare(String(a.occurred_at ?? "")))
        .slice(0, 200) as T[]
    );
  }

  if (normalized.startsWith("select * from content_comments where content_item_id = $1 and tenant_id = $2 order by created_at desc")) {
    return result(
      tenantRows("content_comments", values[1]).filter((row) => row.content_item_id === values[0]).sort(sortCreatedDesc) as T[]
    );
  }

  if (normalized.startsWith("update tasks set status = $3")) {
    return persistedResult(updateStatus("tasks", values[0], values[1], values[2]) as T[]);
  }

  if (normalized.includes("select count(*) from content_items")) {
    const approvals = tenantRows("approvals", values[0]);
    const calendar = tenantRows("publishing_calendar_items", values[0]);
    const resultSignals = tenantRows("conversion_events", values[0]).filter((row) => row.event_type === "result_signal.confirmed");
    const latestImport = tenantRows("analytics_imports", values[0]).sort(sortCreatedDesc)[0];
    const summary = isRecord(latestImport?.payload) ? latestImport.payload : {};
    return result([
      {
        content_items: tenantRows("content_items", values[0]).length,
        calendar_items: calendar.length,
        pending_approvals: approvals.filter((row) => row.status === "pending").length,
        approvals_total: approvals.length,
        published_materials: calendar.filter((row) => row.status === "published" || row.status === "handed_off").length,
        result_signals: resultSignals.length,
        tasks_created: tenantRows("tasks", values[0]).length,
        leads: Number(summary.leads ?? 0),
        receivables_in_progress: Number(summary.receivables_in_progress ?? 0),
        promised_payments: Number(summary.promised_payments ?? 0),
        recovered_payments: Number(summary.recovered_payments ?? 0),
        improvement_tasks: Number(summary.improvement_tasks ?? 0),
        source: latestImport?.source ?? null,
        imported_at: latestImport?.created_at ?? null
      }
    ] as unknown as T[]);
  }

  const listMatch = normalized.match(/^select \* from ([a-z_]+) where tenant_id = \$1 order by created_at desc limit \$2/);
  if (listMatch) {
    return result(tenantRows(listMatch[1], values[0]).sort(sortCreatedDesc).slice(0, Number(values[1] ?? 100)) as T[]);
  }

  const globalListMatch = normalized.match(/^select \* from ([a-z_]+) order by created_at desc limit \$1/);
  if (globalListMatch) {
    return result(tableRows(globalListMatch[1]).sort(sortCreatedDesc).slice(0, Number(values[0] ?? 100)) as T[]);
  }

  const insertMatch = sql.match(/insert into\s+([a-z_]+)\s*\(([^)]+)\)\s*values/i);
  if (insertMatch && normalized.includes("returning *")) {
    const table = insertMatch[1];
    const columns = insertMatch[2].split(",").map((column) => column.trim().replaceAll('"', ""));
    const row: Row = withTimestamps(Object.fromEntries(columns.map((column, index) => [column, values[index]])));
    if (!row.id) row.id = randomUUID();
    tableRows(table).push(row);
    return persistedResult([row] as unknown as T[]);
  }

  const patchMatch = normalized.match(/^update ([a-z_]+) set /);
  if (patchMatch && normalized.includes(" where id = $1") && normalized.includes("returning *")) {
    const row = findById(patchMatch[1], values[0]);
    if (!row) return result([]);
    if (normalized.includes("tenant_id") && row.tenant_id !== values[values.length - 1]) return result([]);
    const assignments = [...sql.matchAll(/"([^"]+)"\s*=\s*\$(\d+)/g)];
    for (const [, key, position] of assignments) {
      row[key] = values[Number(position) - 1];
    }
    row.updated_at = new Date().toISOString();
    return persistedResult([row] as T[]);
  }

  throw new Error(`Memory database does not support query: ${sql}`);
}

function result<T extends Row>(rows: T[]): MemoryResult<T> {
  return { rows, rowCount: rows.length };
}

function persistedResult<T extends Row>(rows: T[]): MemoryResult<T> {
  if (rows.length) persistStore();
  return result(rows);
}

function loadPersistedStore() {
  if (!existsSync(localStorePath)) return;
  const parsed = JSON.parse(readFileSync(localStorePath, "utf8")) as Record<string, Row[]>;
  for (const [table, rows] of Object.entries(parsed)) {
    if (Array.isArray(rows)) {
      store[table] = mergeRows(tableRows(table), rows);
    }
  }
}

function normalizeAgentResultWorkspace() {
  const company = firstByCreatedAsc("companies", tenantId)[0];
  if (!company) return;

  company.name = company.name || "AgentResult";
  company.website_url = company.website_url || "https://agentresult-crm.vercel.app/";
  company.profile = {
    ...agentResultProfileDefaults,
    ...(isRecord(company.profile) ? company.profile : {})
  };
  company.positioning = company.positioning ||
    "AgentResult строит B2B AI-agent systems, которые помогают собственнику держать под контролем продажи, рост и операционные процессы через понятный Telegram-пульт.";
  company.tone_of_voice = company.tone_of_voice || "Практично, прямо, уверенно, без хайпа.";

  patchRow("content_items", ids.contentTelegram, {
    title: "Почему одного AI-агента недостаточно, чтобы наладить продажи",
    content_type: "telegram_post",
    channel: "telegram",
    status: "review",
    target_url: "https://t.me/agentresult",
    body_md:
      "Один AI-агент не чинит продажи.\n\nЕсли в компании нет контура управления, он просто добавляет ещё один поток сообщений.\n\nЧто должно быть вместо этого:\n- заявки фиксируются и не теряются\n- задачи доходят до ответственного\n- материалы проходят согласование до выхода\n- собственник видит, что подготовлено, что выпущено и какой сигнал пришёл\n\nAgentResult OS строится как такой контур: AgentResult готовит, собственник принимает решение, выпуск или передача фиксируется, результат возвращается в систему.\n\nСледующий шаг — согласовать первый материал и проверить, какой сигнал он даст.",
    metadata: { owner: "Egor", idea: "sales-os", module: "Content Factory" }
  });
  patchRow("content_items", ids.contentProductPage, {
    title: "AI Growth OS для B2B-компаний",
    content_type: "landing_page",
    channel: "website",
    status: "approved",
    target_url: "https://agentresult-crm.vercel.app/",
    metadata: { owner: "Growth", module: "Programmatic SEO Pages" }
  });
  patchRow("content_items", ids.contentVc, {
    title: "Почему B2B-компаниям нужна агентная операционная система, а не только CRM",
    content_type: "article_outline",
    channel: "website",
    status: "brief",
    metadata: { owner: "Content", module: "Content Factory" }
  });
  patchRow("content_items", ids.contentProof, {
    title: "Внутренний кейс: AgentResult строит AgentResult для контроля продаж и роста",
    content_type: "case_study",
    channel: "website",
    status: "idea",
    metadata: { owner: "Proof Engine", module: "Proof Engine" }
  });
  patchRow("content_items", ids.contentEmail, {
    title: "Email: безопасный запуск AI Growth OS",
    content_type: "email",
    channel: "email",
    status: "draft",
    metadata: { owner: "Content Factory", module: "Content Factory" }
  });
  patchRow("content_items", ids.contentLeadMagnet, {
    title: "Лид-магнит: чеклист готовности к AgentResult OS",
    content_type: "lead_magnet",
    channel: "website",
    status: "idea",
    metadata: { owner: "Lead Magnet Agent", module: "Lead Magnet" }
  });
  patchRow("demand_map_items", ids.demandDebtor, {
    title: "Как вернуть просроченную дебиторку без отдельного оператора",
    audience: "Собственники и финансисты с просроченной дебиторкой"
  });
  patchRow("demand_map_items", ids.demandTelegramCrm, {
    title: "Telegram CRM для собственника",
    audience: "Собственники, которым не хочется жить внутри CRM"
  });
  patchRow("demand_map_items", ids.demandProduct, {
    title: "AI-агенты для B2B-продаж",
    audience: "Собственники B2B-компаний"
  });
  patchRow("demand_map_items", ids.demandBitrix, {
    title: "AI-агент для Bitrix24",
    audience: "Команды, которые уже работают в Bitrix24"
  });
  patchRow("demand_map_items", ids.demandAmo, {
    title: "AI-агент для amoCRM",
    audience: "Команды, которые уже работают в amoCRM"
  });
  patchRow("demand_map_items", ids.demandExcel, {
    title: "Агент по дебиторке из Excel-импорта",
    audience: "B2B-команды, которые пока живут в таблицах"
  });
  patchRow("approvals", ids.approvalTelegram, {
    summary: "Согласовать Telegram-пост про контур продаж и контроль собственника",
    status: "pending",
    decided_by: null,
    decision_note: null,
    decided_at: null
  });
  patchRow("approvals", ids.approvalComparison, {
    summary: "Согласовать формулировки для страницы AI Growth OS",
    status: "approved",
    decided_by: ids.ownerUser,
    decision_note: "Можно ставить в план публикаций.",
    decided_at: now
  });
  patchRow("approvals", ids.approvalPack, {
    summary: "Согласовать недельный пакет материалов AgentResult",
    status: "approved",
    decided_by: ids.ownerUser,
    decision_note: "Пакет можно использовать для передачи.",
    decided_at: now
  });
  patchRow("publishing_calendar_items", ids.calendarTelegram, {
    title: "Telegram-пост: почему бизнесу нужен операционный контур, а не один AI-агент",
    content_item_id: null,
    channel: "telegram",
    status: "published"
  });
  patchRow("publishing_calendar_items", ids.calendarProductPage, {
    title: "AI Growth OS для B2B-компаний",
    channel: "website",
    status: "scheduled"
  });
  patchRow("publishing_calendar_items", ids.calendarPack, {
    title: "Недельный пакет публикаций AgentResult",
    channel: "manual_export",
    status: "draft"
  });
}


function mergeRows(seedRows: Row[], persistedRows: Row[]) {
  const merged = [...seedRows];
  for (const row of persistedRows) {
    const existingIndex = merged.findIndex((seedRow) => seedRow.id && seedRow.id === row.id);
    if (existingIndex >= 0) {
      merged[existingIndex] = { ...merged[existingIndex], ...row };
    } else {
      merged.push(row);
    }
  }
  return merged;
}

function isRecord(value: unknown): value is Row {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function persistStore() {
  mkdirSync(dirname(localStorePath), { recursive: true });
  const tempPath = `${localStorePath}.tmp`;
  writeFileSync(tempPath, JSON.stringify(store, null, 2));
  renameSync(tempPath, localStorePath);
}

export function resetMemoryDemoStore() {
  for (const table of Object.keys(store)) {
    delete store[table];
  }

  for (const [table, rows] of Object.entries(structuredClone(seedStore))) {
    store[table] = rows;
  }

  normalizeAgentResultWorkspace();
  persistStore();
}

function tableRows(table: string) {
  if (!store[table]) store[table] = [];
  return store[table];
}

function tenantRows(table: string, currentTenantId: unknown) {
  return tableRows(table).filter((row) => row.tenant_id === currentTenantId);
}

function selectWhere(table: string, key: string, value: unknown) {
  return tableRows(table).filter((row) => row[key] === value);
}

function selectTenantById(table: string, id: unknown, currentTenantId: unknown) {
  return tenantRows(table, currentTenantId).filter((row) => row.id === id);
}

function firstByCreatedAsc(table: string, currentTenantId: unknown) {
  return tenantRows(table, currentTenantId).sort(sortCreatedAsc).slice(0, 1);
}

function findById(table: string, id: unknown) {
  return tableRows(table).find((row) => row.id === id) ?? null;
}

function patchRow(table: string, id: unknown, patch: Row) {
  const row = findById(table, id);
  if (!row) return;
  Object.assign(row, patch, { updated_at: new Date().toISOString() });
}

function updateStatus(table: string, id: unknown, currentTenantId: unknown, status: unknown) {
  const row = tenantRows(table, currentTenantId).find((item) => item.id === id);
  if (!row) return [];
  row.status = status;
  row.updated_at = new Date().toISOString();
  return [row];
}

function updateApprovedCalendarApprovalTarget(input: {
  id: unknown;
  tenantId: unknown;
  status: unknown;
  approvalId: unknown;
  decisionNote: unknown;
  decidedBy: unknown;
  decidedAt: unknown;
}) {
  const row = tenantRows("publishing_calendar_items", input.tenantId).find((item) => item.id === input.id);
  if (!row || !["draft", "review"].includes(String(row.status))) return [];
  row.status = input.status;
  row.updated_at = new Date().toISOString();
  row.metadata = {
    ...metadataObject(row.metadata),
    approval_id: input.approvalId ?? null,
    decision_note: input.decisionNote ?? "",
    decided_by: input.decidedBy ?? null,
    decided_at: input.decidedAt ?? row.updated_at
  };
  return [row];
}

function reconcileApprovedCalendarApprovals(currentTenantId: unknown) {
  const updated: Row[] = [];
  const approvals = tenantRows("approvals", currentTenantId).filter((approval) =>
    approval.target_type === "publishing_calendar_item" && approval.status === "approved"
  );
  for (const approval of approvals) {
    const rows = updateApprovedCalendarApprovalTarget({
      id: approval.target_id,
      tenantId: currentTenantId,
      status: "scheduled",
      approvalId: approval.id,
      decisionNote: approval.decision_note,
      decidedBy: approval.decided_by,
      decidedAt: approval.decided_at
    });
    updated.push(...rows);
  }
  return updated;
}

function metadataObject(value: unknown): Row {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Row : {};
}

function withTimestamps(row: Row) {
  const timestamp = new Date().toISOString();
  return {
    created_at: timestamp,
    updated_at: timestamp,
    ...row
  };
}

function sortCreatedAsc(a: Row, b: Row) {
  return String(a.created_at ?? "").localeCompare(String(b.created_at ?? ""));
}

function sortCreatedDesc(a: Row, b: Row) {
  return -sortCreatedAsc(a, b);
}

function sortScheduledAsc(a: Row, b: Row) {
  return String(a.scheduled_for ?? "").localeCompare(String(b.scheduled_for ?? ""));
}

function sortPriorityDesc(a: Row, b: Row) {
  const priorityDiff = Number(b.priority ?? 0) - Number(a.priority ?? 0);
  return priorityDiff || sortCreatedDesc(a, b);
}

function sortByRoleAsc(a: Row, b: Row) {
  return String(a.role ?? "").localeCompare(String(b.role ?? ""));
}
