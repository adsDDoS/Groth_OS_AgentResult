const API_BASE = localStorage.getItem("aiGrowthOsApiBase") || "http://localhost:3000";
const rawTenantId = localStorage.getItem("aiGrowthOsTenantId");
const TENANT_ID =
  rawTenantId && rawTenantId !== "null" && rawTenantId !== "undefined"
    ? rawTenantId
    : "00000000-0000-0000-0000-000000000001";
const LANG_KEY = "aiGrowthOsLang";
let currentLang = localStorage.getItem(LANG_KEY) || "ru";

const RU = {
  "Growth Control": "Рост компании",
  "Home": "Сегодня",
  "Today": "Сегодня",
  "Growth Plan": "План роста",
  "Company": "Компания",
  "Publications": "Публикации",
  "Where to Find Clients": "Где искать клиентов",
  "Materials": "Материалы",
  "To Approve": "На согласование",
  "Publishing Plan": "План публикаций",
  "Material Pack": "Пакет материалов",
  "Automation": "Автоматизация",
  "Autopilot": "Автопилот",
  "Results": "Результаты",
  "Settings": "Настройки",
  "Tools": "Инструменты",
  "Rules, channels, and tools": "Правила, каналы и инструменты",
  "Owner cockpit": "Пульт собственника",
  "Client acquisition workflow": "Рабочий цикл привлечения клиентов",
  "What can be approved, planned, or exported": "Что можно согласовать, запланировать или забрать",
  "30-day client acquisition plan": "30-дневный план привлечения",
  "What we sell, to whom, and why we are trusted": "Что продаём, кому и за счёт чего нам доверяют",
  "Pages and topics that can bring demand": "Страницы и темы, которые приводят спрос",
  "Drafts, posts, pages, emails": "Черновики, посты, страницы, письма",
  "Decisions before public publishing": "Решения перед публичной публикацией",
  "When and where materials go live": "Когда и где выходят материалы",
  "Approved texts for manual publishing": "Утверждённые тексты для ручной публикации",
  "What the system does by itself": "Что система делает сама",
  "Traffic, leads, pages, channel response": "Переходы, заявки, страницы и каналы",
  "Technical status": "Технический статус",
  "Refresh": "Обновить",
  "Open approvals": "Открыть согласования",
  "Add to work": "Взять в работу",
  "Open client map": "Открыть карту клиентов",
  "Save company": "Сохранить компанию",
  "Build plan": "Составить план",
  "Add topic": "Добавить тему",
  "New material": "Новый материал",
  "Prepare brief": "Подготовить ТЗ",
  "Open material": "Открыть материал",
  "Schedule material": "Запланировать",
  "Download CSV": "Скачать CSV",
  "Assemble package": "Собрать пакет",
  "Download ZIP": "Скачать ZIP",
  "Copy texts": "Скопировать тексты",
  "Open calendar": "Открыть календарь",
  "Enable autopilot": "Включить автопилот",
  "Import results": "Загрузить результаты",
  "Suggest improvements": "Предложить улучшения",
  "Refresh status": "Обновить статус",
  "Close": "Закрыть",
  "Cancel": "Отмена",
  "Approve": "Согласовать",
  "Reject": "Отклонить",
  "Request changes": "Нужны правки",
  "Open": "Открыть",
  "Configure": "Настроить",
  "Add tool": "Добавить инструмент",
  "Review": "Проверить",
  "View": "Смотреть",
  "Build": "Собрать",
  "Add": "Добавить",
  "Preview": "Предпросмотр",
  "OK": "ОК",
  "Pending approvals": "На согласовании",
  "Needs approval": "Нужно согласование",
  "Human gates waiting now": "Ждут решения человека",
  "Content in review": "Материалы на проверке",
  "Drafts that need editorial action": "Черновики, которым нужна редактура",
  "Scheduled items": "Запланировано",
  "Upcoming distribution": "Ближайшие публикации",
  "Prioritized opportunities": "Приоритетные возможности",
  "Active agents": "Активные агенты",
  "Configured worker roles": "Настроенные роли агентов",
  "Start here": "Сначала это",
  "Blocked": "Заблокировано",
  "Upcoming publications": "Ближайшие публикации",
  "Integration issues": "Интеграции",
  "System activity": "Активность системы",
  "Publishing APIs are not connected": "API публикаций не подключены",
  "Manual-first export is active": "Работает ручной экспорт",
  "Public distribution waits for approval": "Публичная дистрибуция ждёт согласования",
  "No backend issue detected": "Backend работает штатно",
  "Backend is offline": "Backend недоступен",
  "API connected": "API подключен",
  "Demo data is active": "Активны демо-данные",
  "Publishing APIs": "API публикаций",
  "Manual-first mode active": "Включён ручной режим",
  "Next best actions": "Лучшие следующие действия",
  "Fastest path to useful demand": "Самый короткий путь к полезному спросу",
  "operator-light": "минимум оператора",
  "Automation level": "Уровень автоматизации",
  "What the OS can do now": "Что ОС умеет сейчас",
  "Done by OS": "ОС делает сама",
  "Needs human": "Нужен человек",
  "Blocked by integrations": "Заблокировано интеграциями",
  "Autopilot candidates": "Кандидаты на автопилот",
  "Task routing, approval gates, manual pack structure, status tracking": "Маршрутизация задач, контур согласований, структура ручного пакета, статусы",
  "Public publishing, risky claims, customer names, competitor comparisons": "Публичные публикации, рискованные утверждения, имена клиентов, сравнения с конкурентами",
  "Direct social posting, CMS updates, email sends, ZIP storage": "Прямая публикация в соцсети, обновления CMS, email-рассылки, хранилище ZIP",
  "Analytics improvement tasks, stale content detection, internal link suggestions": "Задачи по аналитике, поиск устаревшего контента, рекомендации по внутренним ссылкам",
  "Approve launch distribution": "Согласовать запуск дистрибуции",
  "Unblocks first public touchpoint and creates a real publishing record.": "Разблокирует первую публичную точку контакта и создаёт запись публикации.",
  "Create 5 core demand pages": "Создать 5 ключевых страниц спроса",
  "Product page, pain page, comparison page, readiness tool, FAQ/entity page.": "Продуктовая страница, страница боли, сравнение, readiness-инструмент, FAQ/entity-страница.",
  "Collect 3 proof assets": "Собрать 3 доказательства",
  "Before/after story, screenshot checklist, approved metric source.": "История до/после, чеклист скриншотов, утверждённый источник метрик.",
  "Prepare one weekly content pack": "Подготовить недельный контент-пакет",
  "SEO page, Telegram posts, VC outline, email, lead magnet.": "SEO-страница, посты в Telegram, план статьи для VC, email, лид-магнит.",
  "Import first metrics": "Импортировать первые метрики",
  "Start feedback loop for pages, channels and conversion events.": "Запустить обратную связь по страницам, каналам и конверсиям.",
  "Company profile": "Компания",
  "Positioning": "Позиционирование",
  "source of truth": "источник правды",
  "Company name": "Название компании",
  "Website": "Сайт",
  "ICP": "ICP",
  "Pains": "Боли",
  "Forbidden claims": "Запрещённые утверждения",
  "Tone of voice": "Тональность",
  "Products": "Продукты",
  "Proof": "Доказательства",
  "Competitors": "Конкуренты",
  "Title": "Название",
  "Type": "Тип",
  "Intent": "Интент",
  "Audience": "Аудитория",
  "Status": "Статус",
  "Priority": "Приоритет",
  "Inbox": "Входящие",
  "No approval requests.": "Заявок на согласование нет.",
  "No approval selected": "Заявка не выбрана",
  "Select a request from the inbox.": "Выберите заявку из входящих.",
  "Why approval is needed": "Зачем нужно согласование",
  "After approve": "Что будет после согласования",
  "What will be published": "Что публикуем",
  "Requested by": "Кто запросил",
  "Risk flags": "Риски",
  "No flags": "Рисков не отмечено",
  "Open source object": "Открыть исходный объект",
  "Open content draft": "Открыть черновик",
  "Open risk checklist": "Открыть чеклист рисков",
  "Asset preview": "Предпросмотр материала",
  "Risk checklist": "Чеклист рисков",
  "Audit trail": "История решений",
  "Source object linked": "Исходный объект связан",
  "Calendar or content source is available.": "Календарь или материал доступны.",
  "Connect the exact draft or calendar item.": "Свяжите точный черновик или пункт календаря.",
  "Channel is known": "Канал известен",
  "Choose a publishing channel.": "Выберите канал публикации.",
  "Risk flags reviewed": "Риски проверены",
  "No extra flags; publication approval still applies.": "Дополнительных рисков нет; согласование публикации всё равно нужно.",
  "Claims and proof": "Утверждения и доказательства",
  "Proof or rewrite required before approval.": "Перед согласованием нужны доказательства или переписывание.",
  "No sensitive claim scope detected.": "Чувствительных утверждений не найдено.",
  "Decision": "Решение",
  "Approval request": "Заявка на согласование",
  "Decision comment required": "Комментарий обязателен",
  "Decision note optional": "Комментарий необязателен",
  "Explain what must change or why this is rejected.": "Напишите, что нужно изменить или почему отклоняем.",
  "Add a publication note, approval condition, or handoff instruction.": "Добавьте заметку к публикации, условие согласования или инструкцию для передачи.",
  "This note will be written to the audit trail and sent back to the workflow.": "Комментарий попадёт в историю решений и вернётся в workflow.",
  "Approving unlocks the next publishing step, but does not bypass channel-specific publishing controls.": "Согласование разблокирует следующий шаг, но не обходит правила конкретного канала.",
  "Calendar": "Календарь",
  "Pack builder": "Сборщик пакета",
  "Weekly content pack": "Недельный контент-пакет",
  "manual-first": "сначала вручную",
  "Week": "Неделя",
  "Channels": "Каналы",
  "SEO pages": "SEO-страницы",
  "Email": "Email",
  "Lead magnet": "Лид-магнит",
  "Package contents": "Состав пакета",
  "Product mode": "Режим продукта",
  "Manual-first": "Ручной режим",
  "Backend API": "Backend API",
  "Tenant": "Тенант",
  "Postgres source of truth": "Postgres как источник правды",
  "connected": "подключён",
  "not connected": "не подключён",
  "Backend online": "Backend онлайн",
  "Demo mode": "Демо-режим",
  "Content velocity": "Скорость контента",
  "Assets in the system": "Материалов в системе",
  "Approval load": "Нагрузка согласований",
  "Waiting for humans": "Ждут людей",
  "Scheduled": "В календаре",
  "Calendar items": "Пунктов календаря",
  "Demand coverage": "Покрытие спроса",
  "Mapped opportunities": "Найденных возможностей",
  "Improvement tasks": "Задачи на улучшение",
  "Import analytics to generate stale content, conversion and AI referral improvement tasks.": "Импортируйте аналитику, чтобы система создала задачи по устаревшему контенту, конверсиям и AI-referral.",
  "No records yet.": "Записей пока нет.",
  "Nothing here.": "Здесь пока пусто.",
  "No items": "Пусто",
  "not scheduled": "не запланировано",
  "not set": "не задано",
  "page": "страница",
  "content": "материал",
  "content asset": "контент-актив",
  "channel": "канал",
  "ready": "готов",
  "idea": "идея",
  "research": "исследование",
  "brief": "бриф",
  "draft": "черновик",
  "review": "проверка",
  "approved": "согласовано",
  "scheduled": "запланировано",
  "published": "опубликовано",
  "handed off": "передано",
  "pending": "ожидает",
  "rejected": "отклонено",
  "changes requested": "нужны правки",
  "publish": "публикация",
  "social post": "пост в соцсети",
  "sensitive claim": "чувствительное утверждение",
  "publishing calendar item": "пункт календаря",
  "content item": "материал",
  "generate research": "собрать исследование",
  "write draft": "написать черновик",
  "send to review": "отправить на проверку",
  "approve or request changes": "согласовать или запросить правки",
  "schedule": "поставить в календарь",
  "publish/export": "опубликовать или экспортировать",
  "mark as handed off": "отметить как переданное",
  "mark as published": "отметить как опубликованное",
  "approval gate": "контур согласования",
  "waiting for owner decision": "ждёт решения собственника",
  "ready for handoff": "готово к передаче",
  "already shipped": "уже выпущено",
  "product page": "продуктовая страница",
  "pain page": "страница боли",
  "comparison page": "страница сравнения",
  "tool page": "страница-инструмент",
  "telegram post": "пост Telegram",
  "landing page": "лендинг",
  "vc article": "статья VC",
  "manual export": "ручной экспорт",
  "social": "соцсети",
  "publishing": "публикация",
  "unknown": "неизвестно",
  "owner": "владелец",
  "unassigned": "не назначен",
  "no deadline": "без дедлайна",
  "Offer Brain saved to Postgres.": "Оффер сохранён в Postgres.",
  "Could not save Offer Brain.": "Не удалось сохранить оффер.",
  "Saved locally. Backend is offline.": "Сохранил локально. Backend недоступен.",
  "Backend is offline. Demand generation requires the API.": "Backend недоступен. Для генерации карты спроса нужен API.",
  "Demand Map task queued.": "Задача на карту спроса поставлена в очередь.",
  "Could not queue Demand Map task.": "Не удалось поставить задачу на карту спроса.",
  "Package text summary copied.": "Тексты пакета скопированы.",
  "Could not copy package text in this browser.": "Не удалось скопировать тексты в этом браузере.",
  "Package preview assembled. ZIP remains disabled until export storage is connected.": "Предпросмотр пакета собран. ZIP будет доступен после подключения export storage.",
  "ZIP storage is not connected yet. Button is disabled until package storage exists.": "ZIP-хранилище ещё не подключено. Кнопка выключена до появления export storage.",
  "No linked source object yet.": "Исходный объект пока не связан.",
  "Source object is linked, but no dedicated screen exists yet.": "Исходный объект связан, но отдельного экрана для него пока нет.",
  "No content draft is linked to this approval yet.": "К этому согласованию пока не привязан черновик.",
  "Select an approval first.": "Сначала выберите заявку.",
  "A comment is required for reject or request changes.": "Для отклонения или запроса правок нужен комментарий.",
  "Approval marked as approved.": "Заявка согласована.",
  "Approval marked as rejected.": "Заявка отклонена.",
  "Approval marked as changes requested.": "По заявке запрошены правки.",
  "Approval approved.": "Заявка согласована.",
  "Approval rejected.": "Заявка отклонена.",
  "Approval changes requested.": "По заявке запрошены правки.",
  "Could not update approval.": "Не удалось обновить согласование.",
  "Demand item form is next: title, type, intent, evidence requirements.": "Следующий шаг — форма пункта спроса: название, тип, интент, требования к доказательствам.",
  "Content item form is next: source idea, channel, owner, status.": "Следующий шаг — форма материала: исходная идея, канал, владелец, статус.",
  "Select a content item first, then generate an SEO/GEO brief.": "Сначала выберите материал, затем соберите SEO/GEO-бриф.",
  "Schedule form will create a calendar item and approval request.": "Форма планирования создаст пункт календаря и заявку на согласование.",
  "Calendar CSV export prepared for manual workflow.": "CSV календаря подготовлен для ручного workflow.",
  "Agent task form is next: role, target, payload.": "Следующий шаг — форма агентной задачи: роль, цель, payload.",
  "Analytics import accepts CSV or API payloads.": "Импорт аналитики принимает CSV или API payload.",
  "Analytics Agent task queued placeholder.": "Заглушка: задача Analytics Agent будет поставлена в очередь.",
  "Risk checklist is visible in the approval detail.": "Чеклист рисков уже открыт в деталях согласования.",
  "Approval required before scheduled publishing can run.": "Нужно согласование перед запуском публикации по расписанию.",
  "Agent workflow": "Агентный workflow",
  "Human reviewer": "Человек-ревьюер",
  "Just now": "Только что",
  "Today": "Сегодня",
  "Target channel: telegram.": "Целевой канал: Telegram.",
  "AI Growth OS launch post": "Launch-пост AI Growth OS",
  "telegram": "Telegram",
  "website": "сайт",
  "email": "email",
  "channel publishing": "публикация в канал",
  "public claim": "публичное утверждение",
  "competitor comparison": "сравнение с конкурентом",
  "proof required": "нужны доказательства",
  "multi-channel distribution": "мультиканальная дистрибуция",
  "Growth Orchestrator": "Growth Orchestrator",
  "Publishing QA": "Publishing QA",
  "Content Factory": "Content Factory",
  "Manual Export": "Ручной экспорт",
  "Created publishing approval request": "Создал заявку на согласование публикации",
  "Flagged public-channel approval gate": "Отметил обязательное согласование публичного канала",
  "Prepared manual-first package outline": "Подготовил структуру ручного пакета",
  "Assembled weekly content pack preview": "Собрал предпросмотр недельного контент-пакета"
};

function tr(text) {
  if (currentLang !== "ru") return String(text ?? "");
  return RU[String(text ?? "")] || String(text ?? "");
}

function text(en, ru) {
  return currentLang === "ru" ? ru : en;
}

const navItems = [
  { route: "overview", title: "Today" },
  { route: "growth-plan", title: "Growth Plan" },
  { route: "offer-brain", title: "Company" },
  { route: "content-pipeline", title: "Materials" },
  { route: "publications", title: "Publications" },
  { route: "analytics", title: "Results" },
  { route: "settings", title: "Settings" }
];

const routeAliases = {
  "demand-map": "growth-plan",
  approvals: "publications",
  "publishing-calendar": "publications",
  "manual-export": "publications",
  agents: "settings"
};

const publicationTabs = {
  approvals: { route: "approvals", label: "To Approve" },
  calendar: { route: "publishing-calendar", label: "Publishing Plan" },
  pack: { route: "manual-export", label: "Material Pack" }
};

const publicationRoutes = Object.fromEntries(Object.entries(publicationTabs).map(([tab, item]) => [item.route, tab]));

const settingsTabs = {
  technical: { label: "Technical status" },
  autopilot: { label: "Autopilot" },
  channels: { label: "Channels" },
  tools: { label: "Tools" }
};

const routes = {
  overview: { title: "Today", kicker: "Owner cockpit" },
  "growth-plan": { title: "Growth Plan", kicker: "30-day client acquisition plan" },
  "offer-brain": { title: "Company", kicker: "What we sell, to whom, and why we are trusted" },
  "content-pipeline": { title: "Materials", kicker: "Drafts, posts, pages, emails" },
  publications: { title: "Publications", kicker: "What can be approved, planned, or exported" },
  analytics: { title: "Results", kicker: "Traffic, leads, pages, channel response" },
  settings: { title: "Settings", kicker: "Rules, channels, and tools" },
  "demand-map": { title: "Growth Plan", kicker: "Client acquisition workflow" },
  approvals: { title: "Publications", kicker: "What can be approved, planned, or exported" },
  "publishing-calendar": { title: "Publications", kicker: "What can be approved, planned, or exported" },
  "manual-export": { title: "Publications", kicker: "What can be approved, planned, or exported" },
  agents: { title: "Settings", kicker: "Rules, channels, and tools" }
};

const demo = {
  offer: {
    name: "AgentResult",
    website_url: "https://agentresult-crm.vercel.app/",
    positioning:
      "AgentResult строит B2B AI-agent systems, которые помогают собственнику держать под контролем продажи, рост и операционные процессы через понятный Telegram-пульт.",
    profile: {
      positioning:
        "B2B AI-agent systems для продаж, роста, CRM-автоматизации и операционного контроля. Основной формат: агентная система + backend + Telegram WebApp + интеграции.",
      icp:
        "Собственники B2B-компаний, агентства, интеграторы, SaaS-команды, сервисные компании и бизнесы с длинным циклом сделки, дебиторкой и слабой CRM-дисциплиной.",
      pains:
        "Лиды теряются; менеджеры не ведут CRM; повторные касания пропускаются; собственник не видит реальную картину продаж; контент хаотичен; сайт не создаёт спрос; дебиторка висит без системы; AI кажется рискованным.",
      proof:
        "Рабочий WebApp-прототип AgentResult, собранная архитектура backend -> Hermes -> Postgres -> Telegram/WebApp, отдельный прототип AI Growth OS и build-in-public история, где AgentResult строит AgentResult на AgentResult.",
      forbiddenClaims:
        "No guaranteed revenue growth, no guaranteed debt recovery, no 'replace the whole sales team', no error-free autonomy, no legal actions without approval, no automatic publishing or sending without approval.",
      tone: "Practical, direct, confident, owner-level, no hype.",
      competitors:
        "CRM integrators, Bitrix24 and amoCRM implementers, AI automation shops, performance agencies, no-code automators, internal operators, generic AI tools and SDR services.",
      products:
        "AgentResult Sales OS — AI-agent sales system / CRM automation\nAgentResult Collect / DebtorPilot — AI collection automation / receivables\nAI Growth OS — B2B growth/content/SEO/GEO operating system",
      domains: "agentresult-crm.vercel.app\nagentresult.ru\napp.agentresult.ru\napi.agentresult.ru\nagentresult.online",
      channels: "Telegram WebApp, website/CMS, email, Bitrix24/amoCRM later, CSV/XLSX fallback",
      approvalOwner: "Owner approves public publishing, risky claims, client names, competitor comparisons and receivables actions."
    }
  },
  demand: [
    { id: "d1", title: "AI-агенты для B2B-продаж", item_type: "product_page", intent: "commercial", audience: "Собственники B2B-компаний", priority: 100, status: "brief" },
    { id: "d2", title: "Telegram CRM для собственника", item_type: "use_case_page", intent: "problem-aware", audience: "Собственники, которым не хочется жить внутри CRM", priority: 92, status: "brief" },
    { id: "d3", title: "Как вернуть просроченную дебиторку без отдельного оператора", item_type: "pain_page", intent: "problem-aware", audience: "Собственники и финансисты", priority: 88, status: "research" },
    { id: "d4", title: "AI Growth OS для B2B-компаний", item_type: "product_page", intent: "commercial", audience: "Собственники и маркетинг B2B-компаний", priority: 84, status: "draft" }
  ],
  content: [
    { id: "c1", title: "Почему одного AI-агента недостаточно, чтобы наладить продажи", content_type: "telegram_post", channel: "telegram", status: "review", owner: "Egor" },
    { id: "c2", title: "AI Growth OS для B2B-компаний", content_type: "landing_page", channel: "website", status: "draft", owner: "Egor" },
    { id: "c3", title: "Почему B2B-компаниям нужна агентная операционная система, а не только CRM", content_type: "article_outline", channel: "website", status: "brief", owner: "Egor" },
    { id: "c4", title: "Email: безопасный запуск AI Growth OS", content_type: "email", channel: "email", status: "draft", owner: "Egor" },
    { id: "c5", title: "Лид-магнит: чеклист готовности к AgentResult OS", content_type: "lead_magnet", channel: "website", status: "idea", owner: "Egor" }
  ],
  approvals: [
    {
      id: "a1",
      summary: "Согласовать Telegram-пост про контур продаж и контроль собственника",
      scope: "social_post",
      target_type: "content_item",
      status: "pending",
      risk_flags: ["public claim", "channel publishing"],
      requested_by: "Growth Orchestrator",
      preview: "Сам по себе AI не двигает продажи. Нужен операционный контур: задачи, CRM, согласования, Telegram-контроль и история действий."
    },
    {
      id: "a2",
      summary: "Согласовать формулировки для страницы AI Growth OS",
      scope: "sensitive_claim",
      target_type: "content_item",
      status: "pending",
      risk_flags: ["competitor comparison", "proof required"],
      requested_by: "Publishing QA",
      preview: "Перед публичной публикацией странице нужны формулировки, подкреплённые доказательствами."
    },
    {
      id: "a3",
      summary: "Согласовать недельный пакет публикаций AgentResult",
      scope: "publish",
      target_type: "publishing_calendar_item",
      status: "pending",
      risk_flags: ["multi-channel distribution"],
      requested_by: "Content Factory",
      preview: "В пакете: одна SEO-страница, два Telegram-поста, один план статьи, одно письмо и один лид-магнит."
    }
  ],
  calendar: [
    { id: "p1", title: "Telegram-пост: почему бизнесу нужен операционный контур, а не один AI-агент", channel: "telegram", scheduled_for: "2026-05-28 10:00", status: "review" },
    { id: "p2", title: "AI Growth OS для B2B-компаний", channel: "website", scheduled_for: "2026-05-29 12:00", status: "scheduled" },
    { id: "p3", title: "Недельный пакет публикаций AgentResult", channel: "manual_export", scheduled_for: "2026-05-30 16:00", status: "draft" }
  ],
  agents: [
    "Growth Orchestrator",
    "Offer Architect",
    "SEO Research",
    "GEO / AI Search",
    "Page Brief",
    "Content Writer",
    "Social Repurposing",
    "Proof / Case",
    "Lead Magnet",
    "Analytics",
    "Competitor Watch",
    "Publishing QA"
  ]
};

const state = {
  route: normalizeRoute(location.hash),
  online: false,
  me: {
    role: "owner",
    name: "Egor",
    permissions: ["approve", "publish", "configure", "results", "tasks"]
  },
  selectedApprovalId: null,
  offer: demo.offer,
  demand: demo.demand,
  content: demo.content,
  approvals: demo.approvals,
  calendar: demo.calendar,
  agents: demo.agents,
  tasks: [],
  metrics: {
    content_items: demo.content.length,
    calendar_items: demo.calendar.length,
    pending_approvals: demo.approvals.filter((item) => item.status === "pending").length,
    tasks_created: 0,
    approvals_total: demo.approvals.length,
    published_materials: shippedCalendarCount(demo.calendar),
    leads: 0,
    receivables_in_progress: 0,
    promised_payments: 0,
    recovered_payments: 0,
    ...loadLocalJson("aiGrowthOsMetrics", {})
  },
  decisionModal: null,
  formModal: null,
  helpOpen: localStorage.getItem("aiGrowthOsHelpSeen") !== "true",
  exportAssembled: loadLocalJson("aiGrowthOsWorkspaceState", {}).exportAssembled === true,
  publicationTab: "approvals",
  settingsTab: "technical",
  selectedToolId: "telegram-webapp",
  selectedPackItem: "seo",
  localDemand: loadLocalJson("aiGrowthOsLocalDemand", []),
  localContent: loadLocalJson("aiGrowthOsLocalContent", []),
  localCalendar: loadLocalJson("aiGrowthOsLocalCalendar", []),
  localApprovals: loadLocalJson("aiGrowthOsLocalApprovals", []),
  localTasks: loadLocalJson("aiGrowthOsLocalTasks", []),
  workspaceState: loadLocalJson("aiGrowthOsWorkspaceState", {}),
  toolOverrides: loadLocalJson("aiGrowthOsToolOverrides", {}),
  autopilotSettings: loadLocalJson("aiGrowthOsAutopilotSettings", {}),
  channelSettings: loadLocalJson("aiGrowthOsChannelSettings", {}),
  contentDetails: {},
  activity: loadLocalJson("aiGrowthOsActivity", [
    { at: "Today 09:42", actor: "Growth Orchestrator", event: "Подготовил первый недельный пакет материалов AgentResult" },
    { at: "Today 09:39", actor: "Publishing QA", event: "Отметил контур согласования для продуктовых формулировок" },
    { at: "Today 09:31", actor: "Offer Architect", event: "Обновил позиционирование AgentResult и язык интерфейса для собственника" }
  ])
};

const elements = {
  sectionKicker: document.querySelector("#sectionKicker"),
  sectionTitle: document.querySelector("#sectionTitle"),
  routeActions: document.querySelector("#routeActions"),
  screenRoot: document.querySelector("#screenRoot"),
  modalRoot: document.querySelector("#modalRoot"),
  navList: document.querySelector("#navList"),
  toast: document.querySelector("#toast")
};

function normalizeRoute(hash) {
  const route = String(hash || "#/overview").replace(/^#\/?/, "") || "overview";
  return routes[route] ? route : "overview";
}

function canonicalRoute(route = state.route) {
  return routeAliases[route] || route;
}

function currentRouteMeta() {
  return routes[canonicalRoute()] || routes.overview;
}

function currentPublicationTab() {
  return publicationRoutes[state.route] || state.publicationTab || "approvals";
}

function currentSettingsTab() {
  return settingsTabs[state.settingsTab] ? state.settingsTab : "technical";
}

function openPublicationTab(tab, selectedId = "") {
  state.publicationTab = publicationTabs[tab] ? tab : "approvals";
  if (selectedId && state.publicationTab === "approvals") state.selectedApprovalId = selectedId;
  setRoute("publications");
}

function openSettingsTab(tab) {
  state.settingsTab = settingsTabs[tab] ? tab : "technical";
  setRoute("settings");
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      "x-tenant-id": TENANT_ID,
      ...(options.headers || {})
    }
  });

  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

function showToast(message) {
  elements.toast.textContent = tr(message);
  elements.toast.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => elements.toast.classList.remove("visible"), 3200);
}

function setRoute(route) {
  state.route = routes[route] ? route : "overview";
  if (location.hash !== `#/${state.route}`) {
    location.hash = `/${state.route}`;
    return;
  }
  render();
}

function setLanguage(lang) {
  currentLang = lang === "en" ? "en" : "ru";
  localStorage.setItem(LANG_KEY, currentLang);
  render();
}

function setBackendStatus(online) {
  state.online = online;
}

async function loadData() {
  try {
    await api("/health");
    setBackendStatus(true);

    const [me, offer, demand, approvals, agents, metrics, content, calendar, workspaceState] = await Promise.all([
      api("/me"),
      api("/offer"),
      api("/demand-map"),
      api("/approvals"),
      api("/agents"),
      api("/analytics/overview"),
      api("/content/items"),
      api("/publishing/calendar"),
      api("/workspace/state").catch(() => ({ data: {} }))
    ]);
    const tasks = await api("/tasks").catch(() => ({ data: [] }));

    state.me = me.data || state.me;
    state.offer = offer.data || state.offer;
    state.demand = Array.isArray(demand.data) && demand.data.length ? demand.data : state.demand;
    state.approvals = Array.isArray(approvals.data) && approvals.data.length ? approvals.data : state.approvals;
    state.agents = agents.data?.length ? agents.data : demo.agents;
    state.content = Array.isArray(content.data) && content.data.length ? content.data : state.content;
    state.calendar = Array.isArray(calendar.data) && calendar.data.length ? calendar.data : state.calendar;
    state.workspaceState = workspaceState.data && typeof workspaceState.data === "object" ? workspaceState.data : state.workspaceState;
    state.tasks = Array.isArray(tasks.data) ? tasks.data.map(normalizeTask) : [];
    state.metrics = {
      ...deriveMetrics(metrics.data || {}),
      ...loadLocalJson("aiGrowthOsMetrics", {}),
      pending_approvals: state.approvals.filter((item) => item.status === "pending").length,
      calendar_items: state.calendar.length,
      content_items: state.content.length,
      approvals_total: state.approvals.length,
      published_materials: shippedCalendarCount(state.calendar)
    };
  } catch {
    setBackendStatus(false);
    state.metrics = {
      ...deriveMetrics(state.metrics),
      ...loadLocalJson("aiGrowthOsMetrics", {}),
      content_items: state.content.length,
      calendar_items: state.calendar.length,
      pending_approvals: state.approvals.filter((item) => item.status === "pending").length,
      approvals_total: state.approvals.length,
      published_materials: shippedCalendarCount(state.calendar)
    };
  }

  state.demand = mergeLocalItems(state.demand, state.localDemand);
  state.content = mergeLocalItems(state.content, state.localContent);
  state.calendar = mergeLocalItems(state.calendar, state.localCalendar);
  state.approvals = mergeLocalItems(state.approvals, state.localApprovals);
  state.tasks = mergeLocalItems(state.tasks, state.localTasks);
  normalizeAgentResultLanguageArtifacts();
  state.exportAssembled = state.workspaceState.exportAssembled === true || state.exportAssembled === true;
  if (Array.isArray(state.workspaceState.activity) && state.workspaceState.activity.length) {
    state.activity = state.workspaceState.activity;
  }
  await reconcileWorkflowConsistency();
  state.metrics.content_items = state.content.length;
  state.metrics.calendar_items = state.calendar.length;
  state.metrics.pending_approvals = state.approvals.filter((item) => item.status === "pending").length;
  state.metrics.approvals_total = state.approvals.length;
  state.metrics.published_materials = shippedCalendarCount(state.calendar);
  state.metrics.tasks_created = state.tasks.length;

  if (!state.selectedApprovalId && state.approvals[0]) state.selectedApprovalId = state.approvals[0].id;
  render();
}

function mergeLocalItems(remoteItems, localItems) {
  const byId = new Map((remoteItems || []).map((item) => [item.id, item]));
  for (const item of localItems || []) byId.set(item.id, item);
  return [...byId.values()];
}

async function persistWorkspaceState(partial = {}) {
  state.workspaceState = { ...(state.workspaceState || {}), ...partial };
  saveLocalJson("aiGrowthOsWorkspaceState", state.workspaceState);
  if (!state.online) return state.workspaceState;
  try {
    const result = await api("/workspace/state", {
      method: "PUT",
      body: JSON.stringify(partial)
    });
    state.workspaceState = result.data && typeof result.data === "object" ? result.data : state.workspaceState;
    saveLocalJson("aiGrowthOsWorkspaceState", state.workspaceState);
  } catch {
    // Keep local state when backend persistence is temporarily unavailable.
  }
  return state.workspaceState;
}

async function reconcileWorkflowConsistency() {
  for (const contentItem of state.content) {
    const linkedCalendar = state.calendar.find((item) => item.content_item_id === contentItem.id);
    if (!linkedCalendar) continue;

    if (contentItem.status === "approved" && linkedCalendar.status !== "scheduled") {
      linkedCalendar.status = "scheduled";
      linkedCalendar.updated_at = new Date().toISOString();
      await persistCalendarState(linkedCalendar);
    }

    if (contentItem.status === "published" && linkedCalendar.status !== "published") {
      linkedCalendar.status = "published";
      linkedCalendar.updated_at = new Date().toISOString();
      await persistCalendarState(linkedCalendar);
    }

    if (contentItem.status === "rejected" && linkedCalendar.status !== "rejected") {
      linkedCalendar.status = "rejected";
      linkedCalendar.updated_at = new Date().toISOString();
      await persistCalendarState(linkedCalendar);
    }
  }
}

function normalizeAgentResultLanguageArtifacts() {
  const replacements = new Map([
    ["Workflow link verification material", "Проверка owner workflow: согласование и публикация"],
    ["Weekly AgentResult growth pack", "Недельный пакет публикаций AgentResult"],
    ["AI agents for B2B sales", "AI-агенты для B2B-продаж"],
    ["How to recover overdue receivables without hiring an operator", "Как вернуть просроченную дебиторку без отдельного оператора"],
    ["Telegram CRM for the owner", "Telegram CRM для собственника"],
    ["AI agent for Bitrix24", "AI-агент для Bitrix24"],
    ["AI agent for amoCRM", "AI-агент для amoCRM"]
  ]);

  for (const item of state.demand) {
    if (replacements.has(item.title)) item.title = replacements.get(item.title);
    if (item.audience === "B2B owners") item.audience = "Собственники B2B-компаний";
    if (item.audience === "Owners who do not want to live inside CRM") item.audience = "Собственники, которым не хочется жить внутри CRM";
    if (item.audience === "Owners and finance leads with overdue invoices") item.audience = "Собственники и финансисты с просроченной дебиторкой";
  }
  for (const item of state.content) {
    if (replacements.has(item.title)) item.title = replacements.get(item.title);
  }
  for (const item of state.calendar) {
    if (replacements.has(item.title)) item.title = replacements.get(item.title);
  }
  for (const item of state.approvals) {
    if (replacements.has(item.summary)) item.summary = replacements.get(item.summary);
    if (replacements.has(item.title)) item.title = replacements.get(item.title);
  }
}

function isShippedStatus(status) {
  return ["published", "handed_off"].includes(String(status || ""));
}

function shippedCalendarCount(items = state.calendar) {
  return (items || []).filter((item) => isShippedStatus(item.status)).length;
}

function normalizeTask(task) {
  const payload = task?.payload || {};
  const rawStatus = payload.status || task.status || "queued";
  return {
    id: task.id,
    title: payload.title || labelize(task.task_type || "task"),
    owner: payload.owner || task.agent_role || text("System", "Система"),
    status: rawStatus === "approved" ? "done" : rawStatus,
    note: payload.note || payload.reason || "",
    source: payload.source || task.task_type || "backend",
    created_at: task.created_at
  };
}

function deriveMetrics(source = {}) {
  const safeSource = source || {};
  return {
    tasks_created: Number(safeSource.tasks_created ?? safeSource.tasks ?? 0),
    approvals_total: Number(safeSource.approvals_total ?? safeSource.approvals ?? state.approvals.length),
    published_materials: Number(safeSource.published_materials ?? shippedCalendarCount(state.calendar)),
    leads: Number(safeSource.leads ?? 0),
    receivables_in_progress: Number(safeSource.receivables_in_progress ?? 0),
    promised_payments: Number(safeSource.promised_payments ?? 0),
    recovered_payments: Number(safeSource.recovered_payments ?? 0),
    visits: Number(safeSource.visits ?? 0),
    indexed_pages: Number(safeSource.indexed_pages ?? 0),
    improvement_tasks: Number(safeSource.improvement_tasks ?? 0),
    content_items: Number(safeSource.content_items ?? state.content.length),
    calendar_items: Number(safeSource.calendar_items ?? state.calendar.length),
    pending_approvals: Number(safeSource.pending_approvals ?? state.approvals.filter((item) => item.status === "pending").length)
  };
}

function render() {
  const routeMeta = currentRouteMeta();
  const routeKey = canonicalRoute();
  document.documentElement.lang = currentLang === "ru" ? "ru" : "en";
  elements.sectionKicker.textContent = tr(routeMeta.kicker);
  elements.sectionTitle.textContent = tr(routeMeta.title);
  renderChrome();
  renderNav();
  renderActions();

  const renderers = {
    overview: renderOverview,
    "growth-plan": renderGrowthPlan,
    "offer-brain": renderOfferBrain,
    "content-pipeline": renderContentPipeline,
    publications: renderPublications,
    analytics: renderAnalytics,
    settings: renderSettings
  };

  elements.screenRoot.innerHTML = renderers[routeKey]();
  renderModal();
  translateTree(elements.routeActions);
  translateTree(elements.screenRoot);
  translateTree(elements.modalRoot);
  bindScreenEvents();
}

function renderChrome() {
  document.querySelector(".brand-lockup h1").textContent = tr("Growth Control");
  document.querySelector("#helpButton").textContent = state.me?.name ? `${text("Help", "Как работать")} · ${state.me.name}` : text("Help", "Как работать");
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === currentLang);
  });
}

function translateTree(root) {
  if (currentLang !== "ru" || !root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const original = node.nodeValue;
    const trimmed = original.trim();
    const translated = RU[trimmed];
    if (translated) node.nodeValue = original.replace(trimmed, translated);
  });
}

function renderModal() {
  if (state.helpOpen) {
    elements.modalRoot.innerHTML = `
      <div class="modal-backdrop" role="presentation" data-action="close-help"></div>
      <section class="decision-modal guide-modal" role="dialog" aria-modal="true" aria-labelledby="guideTitle">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Quick start", "Как пользоваться")}</p>
            <h3 id="guideTitle">${text("Three simple moves", "Три простых шага")}</h3>
          </div>
          <button class="button secondary" data-action="close-help">${tr("Close")}</button>
        </div>
        <div class="guide-steps">
          ${guideStep("1", text("Open Today", "Откройте Сегодня"), text("It shows what needs your decision today.", "Там видно, что требует вашего решения сегодня."))}
          ${guideStep("2", text("Approve or request edits", "Согласуйте или отправьте на правки"), text("The system will not publish risky materials without you.", "Система не выпустит рискованные материалы без вас."))}
          ${guideStep("3", text("Use the weekly pack", "Используйте недельный пакет"), text("Copy approved texts until direct channel publishing is connected.", "Копируйте утверждённые тексты, пока прямая публикация в каналы не настроена."))}
        </div>
        <div class="modal-warning">${text("You can always return here from the Help button.", "Эту подсказку всегда можно открыть кнопкой «Как работать».")}</div>
        <div class="detail-actions">
          <button class="button primary" data-action="close-help">${text("Got it", "Понятно")}</button>
          <button class="button secondary" data-action="go-approvals">${text("Go to decisions", "К решениям")}</button>
        </div>
      </section>
    `;
    return;
  }

  if (!state.decisionModal) {
    if (!state.formModal) {
      elements.modalRoot.innerHTML = "";
      return;
    }
    elements.modalRoot.innerHTML = renderFormModal();
    return;
  }

  const item = state.approvals.find((approval) => approval.id === state.decisionModal.approvalId);
  const context = item ? getApprovalContext(item) : null;
  const action = state.decisionModal.action;
  const requiresNote = action === "reject" || action === "request-changes";
  const labelEn = action === "approve" ? "Approve" : action === "reject" ? "Reject" : "Request changes";
  const label = tr(labelEn);
  const modalTitle = action === "approve" ? text("Approve approval", "Согласовать заявку") : action === "reject" ? text("Reject approval", "Отклонить заявку") : text("Request changes approval", "Нужны правки");

  elements.modalRoot.innerHTML = `
    <div class="modal-backdrop" role="presentation" data-action="close-modal"></div>
    <section class="decision-modal" role="dialog" aria-modal="true" aria-labelledby="decisionTitle">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${text("Decision", "Решение")}</p>
          <h3 id="decisionTitle">${escapeHtml(modalTitle)}</h3>
        </div>
        <button class="button secondary" data-action="close-modal">Close</button>
      </div>
      <div class="decision-context">
        <strong>${escapeHtml(tr(context?.title || "Approval request"))}</strong>
        <span>${escapeHtml(displayChannel(context?.channel || "channel"))} · ${escapeHtml(context?.when || tr("not scheduled"))}</span>
      </div>
      <label>
        ${requiresNote ? tr("Decision comment required") : tr("Decision note optional")}
        <textarea id="decisionNote" rows="5" placeholder="${requiresNote ? tr("Explain what must change or why this is rejected.") : tr("Add a publication note, approval condition, or handoff instruction.")}"></textarea>
      </label>
      <div class="modal-warning">
        ${requiresNote ? tr("This note will be written to the audit trail and sent back to the workflow.") : tr("Approving unlocks the next publishing step, but does not bypass channel-specific publishing controls.")}
      </div>
      <div class="detail-actions">
        <button class="button ${action === "reject" ? "danger" : "primary"}" data-action="submit-decision">${escapeHtml(label)}</button>
        <button class="button secondary" data-action="close-modal">Cancel</button>
      </div>
    </section>
  `;
}

function renderFormModal() {
  const modal = state.formModal || {};
  const scheduleContent = state.content.find((item) => item.id === modal.contentId) || state.content[0] || null;
  const configs = {
    demand: {
      eyebrow: text("Growth plan", "План роста"),
      title: text("Add demand topic", "Добавить тему спроса"),
      submit: "submit-demand-form",
      button: text("Add topic", "Добавить тему"),
      body: `
        ${field(text("Page or topic", "Страница или тема"), "demandTitle", "")}
        <div class="form-grid two-col">
          ${selectField(text("Type", "Тип"), "demandType", [
            ["product_page", text("Product page", "Продуктовая страница")],
            ["problem_page", text("Problem page", "Страница боли")],
            ["integration_page", text("Integration page", "Страница интеграции")],
            ["lead_magnet", text("Lead magnet", "Лид-магнит")]
          ], "product_page")}
          ${selectField(text("Status", "Статус"), "demandStatus", statusOptions(), "idea")}
        </div>
        ${field(text("Buyer", "Кто ищет"), "demandAudience", text("B2B owner", "Собственник B2B"))}
        ${textarea(text("Problem and proof needed", "Боль и нужные доказательства"), "demandNotes", "")}
      `
    },
    content: {
      eyebrow: text("Materials", "Материалы"),
      title: text("New material", "Новый материал"),
      submit: "submit-content-form",
      button: text("Create material", "Создать материал"),
      body: `
        ${field(text("Title", "Название"), "contentTitle", "")}
        <div class="form-grid two-col">
          ${selectField(text("Format", "Формат"), "contentType", [
            ["telegram_post", text("Telegram post", "Пост Telegram")],
            ["landing_page", text("Website page", "Страница сайта")],
            ["article_outline", text("Article outline", "План статьи")],
            ["email", "Email"],
            ["lead_magnet", text("Lead magnet", "Лид-магнит")]
          ], "telegram_post")}
          ${selectField(text("Status", "Статус"), "contentStatus", statusOptions(), "idea")}
        </div>
        <div class="form-grid two-col">
          ${field(text("Channel", "Канал"), "contentChannel", "telegram")}
          ${field(text("Owner", "Ответственный"), "contentOwner", "Egor")}
        </div>
        ${textarea(text("Brief", "Бриф"), "contentGoal", text("Buyer, pain, proof, safe claim, channel, next step.", "Покупатель, боль, доказательство, безопасное утверждение, канал, следующий шаг."))}
        ${textarea(text("Working text", "Рабочий текст"), "contentBody", "")}
      `
    },
    metrics: {
      eyebrow: text("Results", "Результаты"),
      title: text("Import first results", "Загрузить первые результаты"),
      submit: "submit-metrics-form",
      button: text("Save results", "Сохранить результаты"),
      body: `
        <div class="form-grid two-col">
          ${numberField(text("Leads", "Заявки"), "metricLeads", state.metrics.leads || 0)}
          ${numberField(text("Tasks created", "Создано задач"), "metricTasks", state.metrics.tasks_created || 0)}
        </div>
        <div class="form-grid two-col">
          ${numberField(text("Published materials", "Опубликовано материалов"), "metricPublished", state.metrics.published_materials || 0)}
          ${numberField(text("Receivables in progress", "Дебиторка в работе"), "metricReceivables", state.metrics.receivables_in_progress || 0)}
        </div>
        <div class="form-grid two-col">
          ${numberField(text("Promised payments", "Обещанные оплаты"), "metricPromised", state.metrics.promised_payments || 0)}
          ${numberField(text("Recovered payments", "Возвращённые оплаты"), "metricRecovered", state.metrics.recovered_payments || 0)}
        </div>
      `
    },
    task: {
      eyebrow: text("Task", "Задача"),
      title: text("Create task", "Создать задачу"),
      submit: "submit-task-form",
      button: text("Create task", "Создать задачу"),
      body: `
        ${field(text("Task", "Задача"), "taskTitle", "")}
        <div class="form-grid two-col">
          ${selectField(text("Owner", "Ответственный"), "taskOwner", [
            ["Owner", text("Owner", "Собственник")],
            ["Growth Orchestrator", "Growth Orchestrator"],
            ["Content Factory", "Content Factory"],
            ["Publishing QA", "Publishing QA"],
            ["Sales owner", text("Sales owner", "Ответственный за продажи")]
          ], "Growth Orchestrator")}
          ${selectField(text("Status", "Статус"), "taskStatus", [
            ["next", text("Next", "Следующая")],
            ["in_progress", text("In progress", "В работе")],
            ["blocked", text("Blocked", "Заблокирована")]
          ], "next")}
        </div>
        ${textarea(text("Why this matters", "Зачем это нужно"), "taskNote", "")}
      `
    },
    schedule: {
      eyebrow: text("Publishing plan", "План публикаций"),
      title: text("Schedule material", "Запланировать материал"),
      submit: "submit-schedule-form",
      button: text("Add to plan", "Добавить в план"),
      body: `
        ${selectField(text("Material", "Материал"), "scheduleContentId", state.content.map((item) => [item.id, item.title]), scheduleContent?.id || "")}
        <div class="form-grid two-col">
          ${field(text("Channel", "Канал"), "scheduleChannel", scheduleContent?.channel || "telegram")}
          ${field(text("Date and time", "Дата и время"), "scheduleDate", defaultScheduleDate())}
        </div>
        ${selectField(text("Status", "Статус"), "scheduleStatus", [
          ["review", text("Needs approval", "Нужно согласование")],
          ["scheduled", text("Scheduled", "Запланировано")]
        ], "review")}
      `
    },
    calendarNote: {
      eyebrow: text("Publishing plan", "План публикаций"),
      title: text("Add handoff note", "Добавить заметку для передачи"),
      submit: "submit-calendar-note-form",
      button: text("Save note", "Сохранить заметку"),
      body: calendarNoteForm(modal.itemId)
    },
    contentDetail: {
      eyebrow: text("Material", "Материал"),
      title: text("Edit material", "Редактировать материал"),
      submit: "submit-content-edit-form",
      button: text("Save material", "Сохранить материал"),
      body: contentDetailForm(modal.itemId)
    }
  };
  const config = configs[modal.type] || configs.content;

  return `
    <div class="modal-backdrop" role="presentation" data-action="close-modal"></div>
    <section class="decision-modal" role="dialog" aria-modal="true">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${escapeHtml(config.eyebrow)}</p>
          <h3>${escapeHtml(config.title)}</h3>
        </div>
        <button class="button secondary" data-action="close-modal">${tr("Close")}</button>
      </div>
      <form class="form-grid" id="activeForm">
        ${config.body}
        <div class="detail-actions">
          <button type="button" class="button primary" data-action="${escapeAttr(config.submit)}">${escapeHtml(config.button)}</button>
          <button type="button" class="button secondary" data-action="close-modal">${tr("Cancel")}</button>
        </div>
      </form>
    </section>
  `;
}

function contentDetailForm(itemId) {
  const item = state.content.find((entry) => entry.id === itemId) || state.content[0] || {};
  const detail = state.contentDetails[item.id] || buildContentDetailFallback(item.id);
  const demand = detail?.demandItem;
  const approvals = detail?.approvals || [];
  const calendar = detail?.calendar || [];
  const comments = detail?.comments || [];
  return `
    <input id="contentEditId" type="hidden" value="${escapeAttr(item.id || "")}" />
    <section class="content-detail-summary">
      ${detailCard(text("Источник спроса", "Источник спроса"), demand?.title || text("Not linked yet", "Пока не связан"))}
      ${detailCard(text("Согласования", "Согласования"), String(approvals.length))}
      ${detailCard(text("Публикации", "Публикации"), String(calendar.length))}
      ${detailCard(text("Proof", "Proof"), item.metadata?.proof || text("Needed", "Нужно добавить"))}
    </section>
    ${detailContextBlock(text("Почему это делаем", "Почему это делаем"), demand ? `${demand.title}. ${demandBusinessReason(demand)}` : text("This material is still missing a linked demand source.", "У этого материала пока нет связанного источника спроса."))}
    ${field(text("Title", "Название"), "contentEditTitle", item.title || "")}
    <div class="form-grid two-col">
      ${selectField(text("Format", "Формат"), "contentEditType", [
        ["telegram_post", text("Telegram post", "Пост Telegram")],
        ["landing_page", text("Website page", "Страница сайта")],
        ["article_outline", text("Article outline", "План статьи")],
        ["email", "Email"],
        ["lead_magnet", text("Lead magnet", "Лид-магнит")],
        ["case_study", text("Case study", "Кейс")]
      ], item.content_type || "telegram_post")}
      ${selectField(text("Status", "Статус"), "contentEditStatus", statusOptions(), item.status || "idea")}
    </div>
    <div class="form-grid two-col">
      ${field(text("Channel", "Канал"), "contentEditChannel", item.channel || "website")}
      ${field(text("Owner", "Ответственный"), "contentEditOwner", item.owner || item.metadata?.owner || "Egor")}
    </div>
    ${textarea(text("Brief", "Бриф"), "contentEditBrief", item.metadata?.brief || item.metadata?.goal || "")}
    ${textarea(text("Working text", "Рабочий текст"), "contentEditBody", item.metadata?.body || "")}
    ${textarea(text("Proof / source", "Доказательство / источник"), "contentEditProof", item.metadata?.proof || "")}
    ${textarea(text("Comment for the team", "Комментарий для команды"), "contentCommentBody", "")}
    <div class="detail-actions">
      <button type="button" class="button secondary" data-action="submit-content-comment" data-id="${escapeAttr(item.id || "")}">${text("Add comment", "Добавить комментарий")}</button>
    </div>
    ${detailListBlock(text("Approval history", "История согласований"), approvals.map((approval) => `${approvalTitle(approval)} · ${tr(labelize(approval.status || "pending"))}`))}
    ${detailListBlock(text("Publication trail", "История публикации"), calendar.map((entry) => `${entry.title} · ${displayChannel(entry.channel)} · ${tr(labelize(entry.status || "draft"))}`))}
    ${detailListBlock(text("Comments", "Комментарии"), comments.map((comment) => `${ownerActor(comment.user_id || comment.user_name || state.me.name)} · ${comment.body}`))}
  `;
}

function calendarNoteForm(itemId) {
  const item = state.calendar.find((entry) => entry.id === itemId);
  if (!item) {
    return `<p class="empty-note">${escapeHtml(text("Calendar item was not found.", "Пункт календаря не найден."))}</p>`;
  }
  return `
    <input id="calendarNoteId" type="hidden" value="${escapeAttr(item.id)}" />
    <div class="decision-context">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(displayChannel(item.channel || "manual"))} · ${escapeHtml(formatDate(item.scheduled_for))}</span>
    </div>
    ${textarea(text("Owner handoff note", "Заметка для передачи"), "calendarNoteBody", publishingOwnerNote(item))}
  `;
}

function detailCard(label, value) {
  return `<article class="detail-mini-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
}

function detailContextBlock(title, body) {
  return `
    <article class="detail-context-block">
      <p class="eyebrow">${escapeHtml(title)}</p>
      <p>${escapeHtml(body)}</p>
    </article>
  `;
}

function detailListBlock(title, items) {
  return `
    <article class="detail-list-block">
      <p class="eyebrow">${escapeHtml(title)}</p>
      <div class="stack-list">
        ${(items.length ? items : [text("No records yet.", "Записей пока нет.")]).map((item) => `<div class="mini-row">${escapeHtml(item)}</div>`).join("")}
      </div>
    </article>
  `;
}

function buildContentDetailFallback(itemId) {
  const item = state.content.find((entry) => entry.id === itemId) || null;
  if (!item) return null;
  return {
    item,
    demandItem: state.demand.find((entry) => entry.id === item.demand_map_item_id) || null,
    approvals: state.approvals.filter((entry) => entry.target_id === itemId || entry.content_item_id === itemId),
    calendar: state.calendar.filter((entry) => entry.content_item_id === itemId),
    comments: []
  };
}

function defaultScheduleDate() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  return date.toISOString().slice(0, 16).replace("T", " ");
}

function renderNav() {
  const activeRoute = canonicalRoute();
  elements.navList.innerHTML = navItems.map((item) => `
    <a href="#/${item.route}" class="nav-link" data-route="${item.route}">${escapeHtml(tr(item.title))}</a>
  `).join("");
  elements.navList.querySelectorAll("[data-route]").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === activeRoute);
  });
}

function renderActions() {
  const routeKey = canonicalRoute();
  const publicationActions = {
    approvals: [
      actionButton("Approve", "primary", "open-approve-modal"),
      actionButton("Open material", "secondary", "open-source")
    ],
    calendar: [
      actionButton("Schedule material", "primary", "schedule-item"),
      actionButton("Download CSV", "secondary", "export-calendar")
    ],
    pack: [
      actionButton("Assemble package", "primary", "assemble-pack"),
      actionButton(text("Download TXT", "Скачать TXT"), state.exportAssembled ? "secondary" : "secondary disabled", "download-pack"),
      actionButton("Copy texts", "secondary", "copy-pack")
    ]
  };
  const actions = {
    overview: [
      actionButton("Refresh", "secondary", "refresh-data"),
      actionButton(text("Create task", "Создать задачу"), "secondary", "create-task"),
      actionButton(text("Open decisions", "К решениям"), "primary", "go-approvals")
    ],
    "growth-plan": [
      actionButton("Build plan", "primary", "generate-demand"),
      actionButton("Add topic", "secondary", "add-demand")
    ],
    "offer-brain": [actionButton("Save company", "primary", "save-offer")],
    "content-pipeline": [
      actionButton("New material", "primary", "new-content"),
      actionButton("Prepare brief", "secondary", "generate-brief")
    ],
    publications: publicationActions[currentPublicationTab()],
    analytics: [
      actionButton("Import results", "primary", "import-metrics"),
      actionButton("Suggest improvements", "secondary", "generate-improvements")
    ],
    settings: currentSettingsTab() === "tools"
      ? [actionButton("Add tool", "primary", "new-tool")]
      : currentSettingsTab() === "technical"
        ? [actionButton("Refresh status", "secondary", "refresh-data")]
        : currentSettingsTab() === "autopilot"
          ? [actionButton(text("Save rules", "Сохранить правила"), "primary", "save-autopilot")]
          : currentSettingsTab() === "channels"
            ? [actionButton(text("Save channels", "Сохранить каналы"), "primary", "save-channels")]
            : []
  };

  elements.routeActions.innerHTML = (actions[routeKey] || []).join("");
}

function actionButton(label, variant, action) {
  const disabled = variant.includes("disabled");
  return `<button class="button ${variant}" data-action="${action}" ${disabled ? "disabled" : ""}>${escapeHtml(tr(label))}</button>`;
}

function renderOverview() {
  const pending = state.approvals.filter((item) => item.status === "pending");
  const reviewContent = state.content.filter((item) => item.status === "review");
  const readyContent = state.content.filter((item) => ["review", "approved", "scheduled"].includes(item.status));
  const publishedCount = shippedCalendarCount(state.calendar);
  const nextActions = buildTodayActions(pending, reviewContent);
  const blockers = growthBlockers(pending);
  const ownerMoves = ownerNextMoves(pending);

  return `
    ${ownerCockpitHero(pending, blockers, ownerMoves)}
    ${ownerSnapshotGrid(pending, blockers, ownerMoves, publishedCount)}
    ${workflowStrip()}

    <div class="metric-grid">
      ${metricCard(text("Needs your decision", "Требует решения"), pending.length, text("Materials waiting for approval", "Материалы ждут согласования"), "coral")}
      ${metricCard(text("Ready to publish", "Готово к публикации"), readyContent.length, text("Can move to calendar or export", "Можно ставить в план или пакет"))}
      ${metricCard(text("Planned", "В плане"), state.calendar.length, text("Upcoming publications", "Ближайшие публикации"))}
      ${metricCard(text("Published", "Опубликовано"), publishedCount, text("Live materials", "Материалы уже вышли"), "dark")}
      ${metricCard(text("Tasks", "Задачи"), state.tasks.length, text("Next work items", "Следующие действия"))}
      ${metricCard(text("Leads", "Заявки"), state.metrics.leads || 0, text("Imported from analytics", "После загрузки результатов"))}
    </div>

    <div class="dashboard-grid">
      ${queuePanel(text("What requires a decision", "Что требует решения"), nextActions.slice(0, 4).map((item) => row(item.title, item.meta, item.actionLabel, item.action, item.id)))}
      ${queuePanel(text("Next 3 owner actions", "Следующие 3 действия собственника"), ownerMoves.map((item) => row(item.title, item.meta, item.label, item.action, item.id)))}
      ${queuePanel(text("What the system did", "Что система сделала"), systemDoneRows())}
      ${queuePanel(text("What blocks growth", "Что блокирует рост"), blockers.map((item) => row(item.title, item.meta, item.label, item.action, item.id)))}
      ${queuePanel(text("Ready to publish", "Готово к публикации"), readyToPublishRows())}
      ${queuePanel(text("Work queue", "Очередь задач"), taskQueueRows())}
      ${queuePanel(text("Result", "Результат"), [
        row(text("Published materials", "Опубликовано материалов"), text(String(publishedCount), String(publishedCount)), text("View", "Смотреть"), "go-calendar", "published"),
        row(text("Traffic from search and channels", "Переходы из поиска и каналов"), text(String(state.metrics.visits || 0), String(state.metrics.visits || 0)), text("View", "Смотреть"), "go-analytics", "traffic"),
        row(text("Incoming requests", "Заявки"), text(String(state.metrics.leads || 0), String(state.metrics.leads || 0)), text("View", "Смотреть"), "go-analytics", "leads"),
        row(text("Pages in search index", "Страницы в индексе"), text(String(state.metrics.indexed_pages || 0), String(state.metrics.indexed_pages || 0)), text("View", "Смотреть"), "go-analytics", "index")
      ])}
    </div>
  `;
}

function ownerCockpitHero(pending, blockers, ownerMoves) {
  const urgent = pending[0] ? getApprovalContext(pending[0]) : null;
  const leadLine = urgent
    ? text(`Decide on "${urgent.title}" before it can move outside.`, `Решите по «${urgent.title}», чтобы материал мог выйти наружу.`)
    : text("No public action waits for approval right now.", "Сейчас нет публичных действий, которые ждут согласования.");

  return `
    <section class="cockpit-hero">
      <div>
        <p class="eyebrow">${text("Owner cockpit", "Пульт собственника")}</p>
        <h3>${escapeHtml(leadLine)}</h3>
        <p>${text("The system prepares work, but public materials, risky claims and money-sensitive actions stay approval-first.", "Система готовит работу, но публичные материалы, рискованные утверждения и денежные действия остаются через согласование.")}</p>
      </div>
      <div class="cockpit-next">
        <span>${text("Next owner step", "Следующий шаг собственника")}</span>
        <strong>${escapeHtml(ownerMoves[0]?.title || text("Open the growth plan", "Открыть план роста"))}</strong>
        <button class="button primary" data-action="${escapeAttr(ownerMoves[0]?.action || "go-demand-map")}" data-id="${escapeAttr(ownerMoves[0]?.id || "")}">${escapeHtml(ownerMoves[0]?.label || text("Open", "Открыть"))}</button>
      </div>
    </section>
    <section class="cockpit-strip">
      ${cockpitTile(text("Requires decision", "Требует решения"), pending.length, pending.length ? text("Blocks public movement", "Блокирует внешний выпуск") : text("No urgent approvals", "Срочных согласований нет"), "decision")}
      ${cockpitTile(text("System prepared", "Система подготовила"), state.content.length, text("Materials and drafts", "Материалы и черновики"))}
      ${cockpitTile(text("Blocks growth", "Блокирует рост"), blockers.length, text("Fix the first blocker today", "Закрыть первый блокер сегодня"), "warning")}
      ${cockpitTile(text("Next actions", "Следующие действия"), ownerMoves.length, text("Owner-level work only", "Только действия собственника"))}
    </section>
  `;
}

function cockpitTile(label, value, note, tone = "") {
  return `
    <article class="cockpit-tile ${tone}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
      <p>${escapeHtml(note)}</p>
    </article>
  `;
}

function ownerSnapshotGrid(pending, blockers, ownerMoves, publishedCount) {
  const firstDecision = pending[0] ? getApprovalContext(pending[0]).title : text("No urgent approvals right now", "Срочных согласований сейчас нет");
  const firstBlocker = blockers[0]?.title || text("No critical blocker detected", "Критичных блокеров не видно");
  const doneSummary = [
    text(`${state.content.length} materials prepared`, `${state.content.length} материалов подготовлено`),
    text(`${state.calendar.length} publications planned`, `${state.calendar.length} публикаций стоит в плане`),
    text(`${publishedCount} already moved outside`, `${publishedCount} уже вышли наружу`)
  ];

  return `
    <section class="owner-snapshot-grid">
      ${ownerSnapshotCard(
        text("What requires a decision", "Что требует решения"),
        String(pending.length),
        firstDecision,
        text("Open approvals", "Открыть согласования"),
        "go-approvals",
        "decision"
      )}
      ${ownerSnapshotCard(
        text("What the system did", "Что система сделала"),
        String(state.content.length + state.calendar.length),
        doneSummary.join(" · "),
        text("Open materials", "Открыть материалы"),
        "go-content",
        "system"
      )}
      ${ownerSnapshotCard(
        text("What blocks growth", "Что блокирует рост"),
        String(blockers.length),
        firstBlocker,
        blockers[0]?.label || text("Open", "Открыть"),
        blockers[0]?.action || "go-demand-map",
        "warning",
        blockers[0]?.id || ""
      )}
      <article class="owner-snapshot-card next">
        <div class="owner-snapshot-head">
          <span>${escapeHtml(text("Next 3 owner actions", "Следующие 3 действия собственника"))}</span>
          <strong>${escapeHtml(String(ownerMoves.length))}</strong>
        </div>
        <div class="owner-snapshot-list">
          ${ownerMoves.map((item) => `
            <button class="owner-snapshot-item" data-action="${escapeAttr(item.action)}" data-id="${escapeAttr(item.id || "")}">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.meta)}</span>
              <em>${escapeHtml(item.label)}</em>
            </button>
          `).join("")}
        </div>
      </article>
    </section>
  `;
}

function ownerSnapshotCard(title, value, note, label, action, tone = "", id = "") {
  return `
    <article class="owner-snapshot-card ${tone}">
      <div class="owner-snapshot-head">
        <span>${escapeHtml(title)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
      <p>${escapeHtml(note)}</p>
      <button class="button ${tone === "decision" ? "primary" : "secondary"}" data-action="${escapeAttr(action)}" data-id="${escapeAttr(id)}">${escapeHtml(label)}</button>
    </article>
  `;
}

function growthBlockers(pending) {
  const blockers = [];
  if (pending.length) {
    blockers.push({
      title: text("Approvals are stopping public output", "Согласования останавливают внешний выпуск"),
      meta: text(`${pending.length} decision(s) waiting`, `${pending.length} решений ждут`),
      label: text("Open", "Открыть"),
      action: "go-approvals",
      id: "approval-block"
    });
  }
  if (!state.metrics.leads) {
    blockers.push({
      title: text("No lead signal is imported", "Не загружен сигнал по заявкам"),
      meta: text("The growth loop cannot see market response yet.", "Цикл роста пока не видит реакцию рынка."),
      label: text("Import", "Загрузить"),
      action: "import-metrics",
      id: "lead-signal"
    });
  }
  if (!state.calendar.some((item) => isShippedStatus(item.status))) {
    blockers.push({
      title: text("No material has left the system", "Ни один материал ещё не вышел наружу"),
      meta: text("Drafts become business value only after publish or handoff.", "Черновики становятся ценностью после публикации или передачи."),
      label: text("Open", "Открыть"),
      action: "go-calendar",
      id: "publish-signal"
    });
  }
  blockers.push({
    title: text("Direct posting is not connected", "Прямая публикация не подключена"),
    meta: text("Use manual handoff until channels are connected.", "Используйте ручную передачу, пока каналы не подключены."),
    label: text("Pack", "Пакет"),
    action: "go-manual-export",
    id: "manual-export"
  });
  return blockers.slice(0, 4);
}

function ownerNextMoves(pending) {
  const moves = [];
  if (pending[0]) {
    moves.push({
      title: text("Decide on the first waiting material", "Принять решение по первому материалу"),
      meta: getApprovalContext(pending[0]).title,
      label: text("Decide", "Решить"),
      action: "go-approval",
      id: pending[0].id
    });
  }
  const approved = state.content.find((item) => item.status === "approved");
  if (approved) {
    moves.push({
      title: text("Put approved material into the plan", "Поставить согласованный материал в план"),
      meta: approved.title,
      label: text("Schedule", "В план"),
      action: "schedule-content",
      id: approved.id
    });
  }
  moves.push(
    {
      title: text("Choose the next revenue topic", "Выбрать следующую тему выручки"),
      meta: text("Prioritize by money, speed and proof.", "Приоритет по деньгам, скорости и доказательствам."),
      label: text("Open", "Открыть"),
      action: "go-demand-map",
      id: "growth"
    },
    {
      title: text("Import first result numbers", "Загрузить первые цифры результата"),
      meta: text("Leads, published materials or receivables.", "Заявки, публикации или дебиторка."),
      label: text("Import", "Загрузить"),
      action: "import-metrics",
      id: "metrics"
    }
  );
  return moves.slice(0, 3);
}

function renderGrowthPlan() {
  const weeks = [
    [text("Week 1", "Неделя 1"), [
      text("Describe the offer in plain language", "Описать оффер человеческим языком"),
      text("Collect proof and constraints", "Собрать доказательства и ограничения"),
      text("Create 3 priority pages", "Создать 3 приоритетные страницы"),
      text("Prepare 5 short posts", "Подготовить 5 коротких постов")
    ]],
    [text("Week 2", "Неделя 2"), [
      text("Add regional or industry pages where useful", "Добавить региональные или отраслевые страницы, где это оправдано"),
      text("Prepare a comparison page", "Подготовить страницу сравнения"),
      text("Assemble the first lead magnet", "Собрать первый лид-магнит")
    ]],
    [text("Week 3", "Неделя 3"), [
      text("Turn proof into case stories", "Превратить доказательства в кейсы"),
      text("Write deeper articles for expert channels", "Написать экспертные статьи"),
      text("Add AI-search answer blocks", "Добавить блоки для AI-поиска")
    ]],
    [text("Week 4", "Неделя 4"), [
      text("Import first results", "Загрузить первые результаты"),
      text("Strengthen pages with weak signals", "Усилить страницы со слабыми сигналами"),
      text("Plan the next weekly content pack", "Спланировать следующий недельный пакет")
    ]]
  ];

  return `
    ${workflowStrip("growth-plan")}
    ${growthFocusGrid()}
    <div class="screen-grid two">
      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("What brings clients faster", "Что быстрее ведёт к клиентам")}</p>
            <h3>${text("Demand map by money, speed and proof", "Карта спроса по деньгам, скорости и доказательствам")}</h3>
          </div>
        </div>
        ${growthPriorityBoard()}
      </article>
      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("30-day plan", "План роста на 30 дней")}</p>
            <h3>${text("A simple monthly loop", "Простой месячный цикл")}</h3>
          </div>
        </div>
        <div class="week-plan">
          ${weeks.map(([week, items]) => `
            <section class="week-card">
              <strong>${escapeHtml(week)}</strong>
              <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </section>
          `).join("")}
        </div>
      </article>
    </div>
    ${renderDemandMap()}
  `;
}

function workflowStrip(activeStep = canonicalRoute()) {
  const steps = [
    ["offer-brain", "offer-brain", text("Company", "Компания"), text("Set the offer and boundaries", "Настроили оффер и рамки")],
    ["growth-plan", "growth-plan", text("Plan", "План"), text("Found demand and priorities", "Нашли спрос и приоритеты")],
    ["content-pipeline", "content-pipeline", text("Materials", "Материалы"), text("Prepared drafts and proofs", "Подготовили тексты и доказательства")],
    ["publications", "publications", text("Publications", "Публикации"), text("Approve, schedule, export", "Согласовать, поставить, забрать")],
    ["analytics", "analytics", text("Results", "Результаты"), text("See what worked", "Понять, что сработало")],
    ["improvements", "analytics", text("Improve", "Улучшить"), text("Choose the next fix", "Выбрать следующее улучшение")]
  ];

  return `
    <section class="workflow-strip" aria-label="${escapeAttr(text("Client acquisition workflow", "Рабочий цикл привлечения клиентов"))}">
      ${steps.map(([key, route, title, note], index) => `
        <button class="workflow-step ${key === activeStep ? "active" : ""}" data-action="go-route" data-id="${escapeAttr(route)}">
          <span>${index + 1}</span>
          <strong>${escapeHtml(title)}</strong>
          <em>${escapeHtml(note)}</em>
        </button>
      `).join("")}
    </section>
  `;
}

function ownerGuideCard() {
  return `
    <section class="owner-guide">
      <div>
        <p class="eyebrow">${text("What to do now", "Что делать сейчас")}</p>
        <h3>${text("Check decisions, approve good materials, take the weekly pack.", "Проверьте решения, согласуйте хорошие материалы, заберите пакет на неделю.")}</h3>
      </div>
      <div class="guide-mini">
        ${guideStep("1", text("Decisions", "Решения"), text("Open what waits for you.", "Откройте то, что ждёт вас."))}
        ${guideStep("2", text("Approve", "Согласуйте"), text("One button or send edits.", "Одна кнопка или правки."))}
        ${guideStep("3", text("Publish", "Публикуйте"), text("Use the ready pack.", "Берите готовый пакет."))}
      </div>
    </section>
  `;
}

function guideStep(number, title, note) {
  return `
    <div class="guide-step">
      <span>${escapeHtml(number)}</span>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(note)}</p>
    </div>
  `;
}

function renderOfferBrain() {
  const profile = state.offer?.profile || {};
  const setupCompleteness = ownerSetupCompleteness(profile);
  const onboarding = [
    text("What do we sell?", "Что продаём?"),
    text("Who do we sell to?", "Кому продаём?"),
    text("In which regions?", "В каких регионах?"),
    text("Which services and products?", "Какие услуги/продукты?"),
    text("What proof do we have?", "Какие есть доказательства?"),
    text("Which channels do we use?", "Какие каналы используем?"),
    text("What must we never promise?", "Что нельзя обещать?"),
    text("How should we sound?", "Какой тон общения?"),
    text("Who do buyers compare us with?", "С кем нас сравнивают?")
  ];
  return `
    ${workflowStrip("offer-brain")}
    <section class="owner-setup-strip">
      ${ownerSetupCard(text("Setup complete", "Заполненность"), `${setupCompleteness}%`, text("Enough to generate safe first materials", "Достаточно для безопасных первых материалов"))}
      ${ownerSetupCard(text("Approval mode", "Режим согласований"), text("Manual-first", "Сначала вручную"), text("No public action without owner decision", "Без решения собственника наружу ничего не уходит"))}
      ${ownerSetupCard(text("Main cockpit", "Главный пульт"), "Telegram WebApp", text("Tasks, approvals and results in one place", "Задачи, согласования и результаты в одном месте"))}
      ${ownerSetupCard(text("Next unlock", "Следующее подключение"), "CRM / Email", text("Leads, follow-ups and debtor touches", "Заявки, касания и дебиторка"))}
    </section>
    ${ownerSetupGapsPanel(profile)}
    <div class="screen-grid two">
      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Company setup", "Настройка компании")}</p>
            <h3>${text("What we sell and why we are trusted", "Что продаём и почему нам верят")}</h3>
          </div>
        </div>
        <form class="form-grid" id="offerForm">
          ${field(text("Company name", "Название компании"), "companyName", state.offer?.name || "")}
          ${field(text("Website", "Сайт"), "companyWebsite", state.offer?.website_url || "")}
          ${textarea(text("What we sell", "Что продаём"), "companyPositioning", state.offer?.positioning || profile.positioning || "")}
          ${textarea(text("Products and formats", "Продукты и форматы"), "companyProducts", textValue(profile.products))}
          ${textarea(text("Who we sell to", "Кому продаём"), "companyIcp", profile.icp || "")}
          ${textarea(text("Which problems we solve", "Какие проблемы решаем"), "companyPains", profile.pains || "")}
          ${textarea(text("Proof we can use", "Доказательства"), "companyProof", profile.proof || "")}
          ${textarea(text("What we must not promise", "Что нельзя обещать"), "forbiddenClaims", profile.forbiddenClaims || "")}
          ${textarea(text("How we speak", "Как говорим"), "toneRules", profile.tone || "")}
          ${textarea(text("Competitors and alternatives", "Конкуренты и альтернативы"), "companyCompetitors", profile.competitors || "")}
          ${textarea(text("Domains and entry points", "Домены и точки входа"), "companyDomains", profile.domains || "")}
          ${textarea(text("Channels and integrations", "Каналы и интеграции"), "companyChannels", profile.channels || "")}
          ${textarea(text("Approval owner rules", "Правила согласования"), "approvalOwner", profile.approvalOwner || "")}
        </form>
      </article>

      <div class="stack-panels">
        <article class="panel compact-panel">
          <div class="panel-heading compact">
            <div>
              <p class="eyebrow">${text("Onboarding", "Первичная настройка")}</p>
              <h3>${text("Questions the OS needs answered", "Что нужно заполнить")}</h3>
            </div>
          </div>
          <div class="setup-list">
            ${onboarding.map((item, index) => `<div class="setup-step"><span>${index + 1}</span><strong>${escapeHtml(item)}</strong></div>`).join("")}
          </div>
        </article>
        ${miniSection(text("Proof library", "Библиотека доказательств"), [
          text("Case stories", "Кейсы"),
          text("Numbers with source", "Цифры с источником"),
          text("Screenshots and demos", "Скриншоты и демонстрации"),
          text("Testimonials", "Отзывы"),
          text("Before/after stories", "Истории до/после")
        ])}
        ${miniSection(text("Who compares us with whom", "С кем нас сравнивают"), [
          text("CRM integrators", "CRM-интеграторы"),
          text("AI automation shops", "AI-автоматизаторы"),
          text("Generic AI tools", "Обычные AI-инструменты"),
          text("Manual agency retainers", "Ручные агентские ретейнеры")
        ])}
      </div>
    </div>
  `;
}

function ownerSetupCompleteness(profile) {
  const keys = ["positioning", "products", "icp", "pains", "proof", "forbiddenClaims", "tone", "competitors", "domains", "channels", "approvalOwner"];
  const completed = keys.filter((key) => String(profile[key] || "").trim()).length;
  return Math.round((completed / keys.length) * 100);
}

function ownerSetupGaps(profile) {
  const fields = [
    ["positioning", text("What we sell", "Что продаём")],
    ["products", text("Products and formats", "Продукты и форматы")],
    ["icp", text("Who we sell to", "Кому продаём")],
    ["pains", text("Which problems we solve", "Какие проблемы решаем")],
    ["proof", text("Proof we can use", "Доказательства")],
    ["forbiddenClaims", text("Forbidden promises", "Запрещённые обещания")],
    ["tone", text("Tone rules", "Правила тона")],
    ["competitors", text("Competitors and alternatives", "Конкуренты и альтернативы")],
    ["domains", text("Domains and entry points", "Домены и точки входа")],
    ["channels", text("Channels and integrations", "Каналы и интеграции")],
    ["approvalOwner", text("Approval owner rules", "Правила согласования")]
  ];
  return fields.filter(([key]) => !String(profile[key] || "").trim()).map(([, label]) => label);
}

function ownerSetupGapsPanel(profile) {
  const gaps = ownerSetupGaps(profile);
  const ready = gaps.length === 0;
  const visibleGaps = ready ? [text("Ready for first workflow run", "Готово к первому рабочему циклу")] : gaps.slice(0, 5);
  return `
    <article class="panel full setup-readiness-panel">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">${text("Owner setup readiness", "Готовность настройки")}</p>
          <h3>${ready ? text("The company profile is ready for safe execution", "Профиль компании готов к безопасной работе") : text("What still blocks better agent work", "Что ещё мешает агентам работать точнее")}</h3>
        </div>
        <button class="button secondary" data-action="create-setup-tasks" ${ready ? "disabled" : ""}>${text("Create tasks", "Создать задачи")}</button>
      </div>
      <div class="readiness-chip-row">
        ${visibleGaps.map((gap) => `<span>${escapeHtml(gap)}</span>`).join("")}
      </div>
    </article>
  `;
}

function ownerSetupCard(label, value, note) {
  return `
    <article class="owner-setup-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
      <p>${escapeHtml(note)}</p>
    </article>
  `;
}

function renderDemandMap() {
  return `
    <article class="panel full">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${text("Client acquisition opportunities", "Возможности привлечения клиентов")}</p>
          <h3>${text("Where buyers can find us", "Где нас могут найти клиенты")}</h3>
        </div>
        <span class="pill">${state.demand.length} ${text("topics", "тем")}</span>
      </div>
      <div class="demand-card-grid">
        ${state.demand.map(demandOpportunityCard).join("") || `<p class="empty-note">${tr("No records yet.")}</p>`}
      </div>
    </article>
  `;
}

function growthPriorityBoard() {
  const topItems = [...state.demand].sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0)).slice(0, 3);
  return `
    <div class="priority-board">
      ${topItems.map((item, index) => `
        <article class="priority-card">
          <span>${text("Priority", "Приоритет")} ${index + 1}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(demandBusinessReason(item))}</p>
          <div class="priority-score">
            ${priorityPill(text("Revenue", "Выручка"), demandScore(item, "revenue"))}
            ${priorityPill(text("Speed", "Скорость"), demandScore(item, "speed"))}
            ${priorityPill(text("Proof", "Доказательства"), demandScore(item, "proof"))}
          </div>
          <div class="priority-card-note">
            <span>${escapeHtml(text("Next move", "Следующий ход"))}</span>
            <strong>${escapeHtml(demandNextAction(item))}</strong>
          </div>
          <div class="card-actions">
            <button class="button secondary" data-action="content-from-demand" data-id="${escapeAttr(item.id)}">${text("Create material", "Создать материал")}</button>
            <button class="button primary" data-action="publish-from-demand" data-id="${escapeAttr(item.id)}">${text("Send to publications", "В публикации")}</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function growthFocusGrid() {
  const byRevenue = bestDemandItem("revenue");
  const bySpeed = bestDemandItem("speed");
  const byProof = bestDemandItem("proof");

  return `
    <section class="growth-focus-grid">
      ${growthFocusCard(text("Fastest path to revenue", "Самый короткий путь к выручке"), byRevenue, text("Commercial page or offer page first.", "Сначала коммерческая или офферная страница."))}
      ${growthFocusCard(text("Fastest path to launch", "Самый быстрый запуск"), bySpeed, text("Pick the topic that can leave the system this week.", "Выбрать тему, которую можно выпустить уже на этой неделе."))}
      ${growthFocusCard(text("Strongest proof angle", "Самый сильный угол доказательства"), byProof, text("Use internal prototype, architecture and build-in-public proof.", "Опирайтесь на прототип, архитектуру и build-in-public доказательства."))}
    </section>
  `;
}

function growthFocusCard(title, item, note) {
  if (!item) {
    return `
      <article class="growth-focus-card">
        <span>${escapeHtml(title)}</span>
        <strong>${escapeHtml(text("Add the first demand topic", "Добавьте первую тему спроса"))}</strong>
        <p>${escapeHtml(note)}</p>
        <button class="button secondary" data-action="add-demand-topic">${escapeHtml(text("Add topic", "Добавить тему"))}</button>
      </article>
    `;
  }

  return `
    <article class="growth-focus-card">
      <span>${escapeHtml(title)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(demandBusinessReason(item))}</p>
      <div class="focus-meta">
        <em>${escapeHtml(note)}</em>
        <em>${escapeHtml(text("Audience", "Аудитория"))}: ${escapeHtml(item.audience || text("B2B owner", "Собственник B2B"))}</em>
      </div>
      <div class="card-actions">
        <button class="button secondary" data-action="task-from-demand" data-id="${escapeAttr(item.id)}">${text("Create task", "Поставить задачу")}</button>
        <button class="button primary" data-action="content-from-demand" data-id="${escapeAttr(item.id)}">${text("Create material", "Создать материал")}</button>
      </div>
    </article>
  `;
}

function bestDemandItem(axis) {
  return [...state.demand]
    .sort((a, b) => demandScore(b, axis) - demandScore(a, axis) || Number(b.priority || 0) - Number(a.priority || 0))[0] || null;
}

function priorityPill(label, value) {
  return `<span><em>${escapeHtml(label)}</em><strong>${escapeHtml(String(value))}</strong></span>`;
}

function demandOpportunityCard(item) {
  const approvalState = demandApprovalState(item);
  return `
    <article class="demand-card">
      <div class="demand-card-top">
        <div>
          <p class="eyebrow">${escapeHtml(displayDemandType(item.item_type))}</p>
          <h3>${escapeHtml(item.title)}</h3>
        </div>
        <strong class="demand-priority">${escapeHtml(String(item.priority || 0))}</strong>
      </div>
      <p>${escapeHtml(demandBusinessReason(item))}</p>
      <div class="demand-facts">
        <span>${escapeHtml(item.audience || text("B2B owner", "Собственник B2B"))}</span>
        <span>${escapeHtml(demandProblem(item))}</span>
        <span>${escapeHtml(demandNextAction(item))}</span>
        <span>${escapeHtml(approvalState)}</span>
      </div>
      <div class="priority-score">
        ${priorityPill(text("Revenue", "Выручка"), demandScore(item, "revenue"))}
        ${priorityPill(text("Speed", "Скорость"), demandScore(item, "speed"))}
        ${priorityPill(text("Proof", "Доказательства"), demandScore(item, "proof"))}
      </div>
      <div class="card-actions">
        <button class="button secondary" data-action="content-from-demand" data-id="${escapeAttr(item.id)}">${text("Create material", "Создать материал")}</button>
        <button class="button secondary" data-action="task-from-demand" data-id="${escapeAttr(item.id)}">${text("Create task", "Поставить задачу")}</button>
        <button class="button primary" data-action="publish-from-demand" data-id="${escapeAttr(item.id)}">${text("Send to publications", "В публикации")}</button>
      </div>
    </article>
  `;
}

function demandApprovalState(item) {
  const relatedContent = state.content.find((entry) => entry.demand_map_item_id === item.id || entry.title === item.title);
  if (!relatedContent) return text("No material yet", "Материал ещё не создан");
  const pendingApproval = state.approvals.find((approval) => approval.target_id === relatedContent.id && approval.status === "pending");
  if (pendingApproval) return text("Waiting for owner decision", "Ждёт решения собственника");
  if (relatedContent.status === "published" || relatedContent.status === "scheduled") return text("Already moving to market", "Уже движется в рынок");
  return text("Material is in work", "Материал в работе");
}

function demandBusinessReason(item) {
  const type = labelize(item.item_type || "");
  if (type.includes("product")) return text("Commercial page for buyers already looking for an AI-agent system.", "Коммерческая страница для тех, кто уже ищет AI-agent system.");
  if (type.includes("pain")) return text("Turns a costly operational pain into a clear first conversation.", "Превращает дорогую операционную боль в понятный первый разговор.");
  if (type.includes("comparison")) return text("Helps the owner compare AgentResult with familiar alternatives.", "Помогает собственнику сравнить AgentResult с привычными альтернативами.");
  if (type.includes("lead")) return text("Creates a low-risk handoff point before a sales call.", "Создаёт безопасную точку передачи до звонка.");
  return text("Adds one useful entry point into the demand system.", "Добавляет полезную точку входа в систему спроса.");
}

function demandScore(item, axis) {
  const priority = Number(item.priority || 60);
  const type = labelize(item.item_type || "");
  if (axis === "revenue") return Math.min(100, priority + (type.includes("product") ? 8 : 0));
  if (axis === "speed") return type.includes("telegram") || type.includes("post") ? 90 : type.includes("lead") ? 76 : 68;
  if (axis === "proof") return type.includes("case") || type.includes("proof") ? 90 : type.includes("comparison") ? 62 : 72;
  return priority;
}

function displayDemandType(value) {
  const label = labelize(value || "topic");
  if (label.includes("product")) return text("Product page", "Продуктовая страница");
  if (label.includes("pain")) return text("Pain page", "Страница боли");
  if (label.includes("comparison")) return text("Comparison", "Сравнение");
  if (label.includes("lead")) return text("Lead magnet", "Лид-магнит");
  if (label.includes("use case")) return text("Use case", "Сценарий");
  return tr(label);
}

function renderContentPipeline() {
  const columns = ["idea", "brief", "draft", "review", "approved", "scheduled", "published"];
  const counts = columns.map((status) => ({
    status,
    count: state.content.filter((item) => item.status === status).length
  }));

  return `
    ${workflowStrip("content-pipeline")}
    <section class="material-summary">
      ${counts.map((item) => `
        <article>
          <span>${escapeHtml(tr(labelize(item.status)))}</span>
          <strong>${item.count}</strong>
        </article>
      `).join("")}
    </section>
    <div class="kanban">
      ${columns.map((status) => `
        <section class="kanban-column">
          <h3>${escapeHtml(tr(labelize(status)))}</h3>
          ${(state.content.filter((item) => item.status === status).length ? state.content.filter((item) => item.status === status) : []).map((item) => `
            <article class="kanban-card">
              <div class="material-card-top">
                <strong>${escapeHtml(item.title)}</strong>
                ${statusChip(item.status || "idea")}
              </div>
              <span>${escapeHtml(text("Goal", "Цель"))}: ${escapeHtml(materialGoal(item))}</span>
              <span>${escapeHtml(text("Brief", "Бриф"))}: ${escapeHtml(materialBrief(item))}</span>
              <span>${escapeHtml(text("Channel", "Канал"))}: ${escapeHtml(displayChannel(item.channel || item.content_type || "content"))}</span>
              <span>${escapeHtml(text("For whom", "Для кого"))}: ${escapeHtml(materialAudience(item))}</span>
              ${materialProofLine(item)}
              ${materialWorkflowFacts(item)}
              <div class="card-meta">
                <span>${escapeHtml(item.due_at || tr("no deadline"))}</span>
                <span>${escapeHtml(tr(nextContentAction(item.status)))}</span>
              </div>
              <div class="card-actions material-actions">
                <button class="button primary" data-action="${escapeAttr(materialPrimaryAction(item).action)}" data-id="${escapeAttr(item.id || "")}">${escapeHtml(materialPrimaryAction(item).label)}</button>
                <button class="button secondary" data-action="open-content-detail" data-id="${escapeAttr(item.id || "")}">${text("Edit", "Править")}</button>
                <button class="button secondary" data-action="send-content-approval" data-id="${escapeAttr(item.id || "")}">${text("Send to approval", "На согласование")}</button>
                <button class="button secondary" data-action="schedule-content" data-id="${escapeAttr(item.id || "")}">${text("Schedule", "В план")}</button>
                <button class="button secondary" data-action="export-content" data-id="${escapeAttr(item.id || "")}">${text("Export", "Экспорт")}</button>
              </div>
            </article>
          `).join("") || `<p class="empty-note">No items</p>`}
        </section>
      `).join("")}
    </div>
  `;
}

function renderPublications() {
  const tab = currentPublicationTab();
  const tabRenderers = {
    approvals: renderApprovals,
    calendar: renderPublishingCalendar,
    pack: renderManualExport
  };

  return `
    ${workflowStrip("publications")}
    <section class="tabs-panel" aria-label="${escapeAttr(text("Publication workspace", "Работа с публикациями"))}">
      <div class="segmented-tabs" role="tablist">
        ${Object.entries(publicationTabs).map(([key, item]) => `
          <button class="tab-button ${tab === key ? "active" : ""}" role="tab" aria-selected="${tab === key ? "true" : "false"}" data-action="set-publication-tab" data-id="${escapeAttr(key)}">
            ${escapeHtml(tr(item.label))}
          </button>
        `).join("")}
      </div>
      <div class="tab-context">
        ${publicationTabContext(tab)}
      </div>
    </section>
    ${tabRenderers[tab]()}
  `;
}

function publicationTabContext(tab) {
  const contexts = {
    approvals: [
      text("What needs your decision", "Что требует решения"),
      text("Public materials, risky claims and channel handoffs stay here until the owner approves or asks for changes.", "Публичные материалы, рискованные утверждения и передачи в каналы ждут здесь решения собственника.")
    ],
    calendar: [
      text("What can be published", "Что можно публиковать"),
      text("Approved materials become a simple plan: channel, date, status and next handoff.", "Согласованные материалы превращаются в понятный план: канал, дата, статус и следующий шаг.")
    ],
    pack: [
      text("What can be handed off", "Что можно забрать"),
      text("The weekly material pack keeps handoff reliable until direct channel publishing is connected in settings.", "Недельный пакет помогает передавать материалы, пока прямая публикация в каналы настраивается в разделе настроек.")
    ]
  };
  const [title, note] = contexts[tab] || contexts.approvals;
  return `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(note)}</span>`;
}

function renderApprovals() {
  const selected = getSelectedApproval();
  return `
    <div class="approval-workspace">
      <section class="approval-list panel">
        <div class="panel-heading compact">
          <div>
            <p class="eyebrow">${text("Decision inbox", "Очередь решений")}</p>
            <h3>${state.approvals.filter((item) => item.status === "pending").length} ${text("waiting", "ждут решения")}</h3>
          </div>
        </div>
        <div class="approval-items">
          ${state.approvals.map((item) => {
            const context = getApprovalContext(item);
            return `
              <button class="approval-item ${item.id === state.selectedApprovalId ? "selected" : ""}" data-action="select-approval" data-id="${escapeAttr(item.id)}">
                <strong>${escapeHtml(context.title)}</strong>
                <span>${escapeHtml(displayChannel(context.channel))} · ${escapeHtml(context.when)} · ${escapeHtml(tr(labelize(item.status || "pending")))}</span>
              </button>
            `;
          }).join("") || `<p class="empty-note">${text("No materials waiting for approval.", "Нет материалов на согласовании.")}</p>`}
        </div>
      </section>

      <section class="approval-detail panel">
        ${selected ? approvalDetail(selected) : `<div class="empty-state"><h3>${text("No approval selected", "Материал не выбран")}</h3><p>${text("Select a request from the list.", "Выберите заявку из списка.")}</p></div>`}
      </section>
    </div>
  `;
}

function approvalDetail(item) {
  const context = getApprovalContext(item);
  const flags = context.riskFlags;
  return `
    <div class="panel-heading">
      <div>
        <p class="eyebrow">${text("What we approve", "Что согласуем")}</p>
        <h3>${escapeHtml(context.title)}</h3>
      </div>
      ${statusChip(item.status || "pending")}
    </div>
    <div class="decision-summary">
      <div>
        <span class="meta-label">${text("Why approval is needed", "Почему нужно согласование")}</span>
        <strong>${escapeHtml(context.reason)}</strong>
      </div>
      <div>
        <span class="meta-label">${text("After approval", "Что изменится после согласования")}</span>
        <strong>${escapeHtml(context.outcome)}</strong>
      </div>
    </div>
    <div class="detail-grid">
      <div>
        <span class="meta-label">${text("Channel", "Канал")}</span>
        <strong>${escapeHtml(displayChannel(context.channel))}</strong>
      </div>
      <div>
        <span class="meta-label">${text("When", "Когда")}</span>
        <strong>${escapeHtml(context.when)}</strong>
      </div>
      <div>
        <span class="meta-label">${text("What will be published", "Что будет опубликовано")}</span>
        <strong>${escapeHtml(context.assetType)}</strong>
      </div>
      <div>
        <span class="meta-label">${text("Prepared by", "Кто подготовил")}</span>
        <strong>${escapeHtml(context.requestedBy)}</strong>
      </div>
      <div>
        <span class="meta-label">${text("What to check", "На что обратить внимание")}</span>
        <div class="flag-row">${flags.length ? flags.map((flag) => `<span class="flag">${escapeHtml(tr(flag))}</span>`).join("") : `<span class="muted">${text("Standard public check", "Стандартная проверка публичного текста")}</span>`}</div>
      </div>
    </div>
    <div class="source-actions">
      <button class="button secondary" data-action="open-source">${text("Open source material", "Открыть исходный материал")}</button>
      <button class="button secondary" data-action="open-content-detail">${text("Open text version", "Открыть версию текста")}</button>
      <button class="button secondary" data-action="open-risk-checklist">${text("Open risk checklist", "Открыть чеклист")}</button>
    </div>
    <div class="preview-pane">
      <p class="eyebrow">${text("Text preview", "Текст")}</p>
      ${renderAssetPreview(context)}
    </div>
    <div class="risk-checklist">
      <p class="eyebrow">${text("Review checklist", "На что проверить")}</p>
      ${context.checklist.map((check) => `
        <div class="checkline ${check.ok ? "ok" : "warn"}">
          <span>${check.ok ? "✓" : "!"}</span>
          <strong>${escapeHtml(tr(check.label))}</strong>
          <em>${escapeHtml(tr(check.note))}</em>
        </div>
      `).join("")}
    </div>
    <div class="audit-trail">
      <p class="eyebrow">${text("Decision history", "История решений")}</p>
      ${context.audit.map((event) => `
        <div class="audit-event">
          <span>${escapeHtml(event.at)}</span>
          <strong>${escapeHtml(event.actor)}</strong>
          <p>${escapeHtml(event.event)}</p>
        </div>
      `).join("")}
    </div>
    <div class="detail-actions">
      ${actionButton("Approve", "primary", "open-approve-modal")}
      ${actionButton("Request changes", "secondary", "open-changes-modal")}
      ${actionButton("Reject", "danger", "open-reject-modal")}
    </div>
  `;
}

function renderPublishingCalendar() {
  const groupedDays = publishingWeekGroups();
  return `
    <section class="publishing-summary-strip">
      ${ownerSetupCard(text("Waiting for decision", "Ждут решения"), state.calendar.filter((item) => item.status === "review").length, text("Cannot go out before approval", "Не могут выйти без согласования"))}
      ${ownerSetupCard(text("Ready for handoff", "Готовы к передаче"), state.calendar.filter((item) => item.status === "scheduled").length, text("Approved and planned", "Согласованы и стоят в плане"))}
      ${ownerSetupCard(text("Handed off", "Переданы"), state.calendar.filter((item) => item.status === "handed_off").length, text("Moved outside the system manually", "Переданы наружу вручную"))}
      ${ownerSetupCard(text("Published", "Опубликованы"), state.calendar.filter((item) => item.status === "published").length, text("Already live", "Уже вышли"))}
    </section>
    <section class="publication-ops-strip">
      ${publicationOpsCard(text("Needs approval", "Нужно согласование"), state.calendar.filter((item) => item.status === "review").length, text("Owner decision is required before any public move.", "До любого внешнего шага нужно решение собственника."))}
      ${publicationOpsCard(text("Needs handoff note", "Нужна note для передачи"), state.calendar.filter((item) => needsHandoffNote(item)).length, text("Add channel note, owner condition or handoff instruction.", "Добавьте заметку по каналу, условие собственника или инструкцию для передачи."))}
      ${publicationOpsCard(text("Manual-first handoff", "Ручная передача"), state.calendar.filter((item) => item.channel === "manual_export" || item.status === "handed_off").length, text("Weekly pack and manual channel loop stay visible here.", "Недельный пакет и ручной контур публикации держим в этом экране."))}
    </section>
    <article class="panel full">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${text("Publication plan", "Календарь выхода")}</p>
          <h3>${text("Week view with approval gate and handoff", "Неделя с контуром согласования и передачей")}</h3>
        </div>
      </div>
      <div class="approval-gate-banner">
        <strong>${text("Approval gate", "Контур согласования")}</strong>
        <span>${text("Nothing public leaves the system until the owner approves it. After approval, the material is either published directly or handed off manually.", "Пока собственник не согласует материал, наружу ничего не уходит. После согласования материал либо публикуется, либо передаётся вручную.")}</span>
      </div>
      <div class="week-calendar">
        ${groupedDays.map(([dayKey, items]) => `
          <section class="week-day-column">
            <div class="week-day-header">
              <strong>${escapeHtml(formatPublishingDay(dayKey))}</strong>
              <span>${escapeHtml(String(items.length))}</span>
            </div>
            <div class="week-day-items">
              ${items.map((item) => publishingCalendarCard(item)).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    </article>
  `;
}

function calendarAction(item) {
  if (item.status === "published") return `<span class="muted">${escapeHtml(text("Already shipped", "Уже выпущено"))}</span>`;
  if (item.status === "handed_off") return `<button class="button secondary table-button" data-action="mark-calendar-published" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Mark as published", "Отметить как опубликованное"))}</button>`;
  if (item.status === "scheduled") {
    return `<button class="button secondary table-button" data-action="mark-calendar-exported" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Mark as handed off", "Отметить как переданное"))}</button>`;
  }
  if (item.status === "review") {
    return `<button class="button secondary table-button" data-action="go-approvals" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Approve first", "Сначала согласовать"))}</button>`;
  }
  return `<button class="button secondary table-button" data-action="mark-calendar-exported" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Mark as handed off", "Отметить как переданное"))}</button>`;
}

function publishingWeekGroups() {
  const groups = new Map();
  for (const item of [...state.calendar].sort((a, b) => String(a.scheduled_for || "").localeCompare(String(b.scheduled_for || "")))) {
    const key = publishingDayKey(item.scheduled_for);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.entries()];
}

function publishingDayKey(value) {
  if (!value) return "no-date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "no-date";
  return date.toISOString().slice(0, 10);
}

function formatPublishingDay(dayKey) {
  if (dayKey === "no-date") return text("No date", "Без даты");
  const date = new Date(`${dayKey}T12:00:00`);
  return new Intl.DateTimeFormat(currentLang === "ru" ? "ru-RU" : "en", {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(date);
}

function publishingCalendarCard(item) {
  const handoff = publishingHandoffText(item);
  const note = publishingOwnerNote(item);
  return `
    <article class="calendar-card">
      <div class="calendar-card-top">
        <strong>${escapeHtml(item.title)}</strong>
        ${statusChip(item.status || "draft")}
      </div>
      <span>${escapeHtml(displayChannel(item.channel || "manual"))} · ${escapeHtml(formatDate(item.scheduled_for))}</span>
      <p>${escapeHtml(handoff)}</p>
      <div class="calendar-note-block ${note ? "filled" : ""}">
        <span>${escapeHtml(text("Owner handoff note", "Заметка для передачи"))}</span>
        <strong>${escapeHtml(note || text("No note yet. Add handoff instruction before manual publishing.", "Пока нет заметки. Добавьте инструкцию перед ручной публикацией."))}</strong>
      </div>
      <div class="card-actions">
        ${calendarAction(item)}
        <button class="button secondary table-button" data-action="edit-calendar-note" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Add handoff note", "Добавить note"))}</button>
      </div>
    </article>
  `;
}

function publishingHandoffText(item) {
  if (item.status === "review") return text("Waiting for owner decision before any public action.", "Ждёт решения собственника перед любым публичным действием.");
  if (item.status === "scheduled") return text("Approved and ready for manual handoff or direct publication.", "Согласовано и готово к ручной передаче или прямой публикации.");
  if (item.status === "handed_off") return text("Transferred outside the system; waiting for confirmation that it is live.", "Передано наружу; ждём подтверждения, что материал вышел.");
  if (item.status === "published") return text("Already live and counted in the result loop.", "Материал уже вышел и учтён в контуре результатов.");
  return text("Still being prepared for publication.", "Материал ещё готовится к публикации.");
}

function publicationOpsCard(title, value, note) {
  return `
    <article class="publication-ops-card">
      <span>${escapeHtml(title)}</span>
      <strong>${escapeHtml(String(value))}</strong>
      <p>${escapeHtml(note)}</p>
    </article>
  `;
}

function publishingOwnerNote(item) {
  return String(item?.metadata?.handoff_note || item?.metadata?.owner_note || "").trim();
}

function needsHandoffNote(item) {
  return ["scheduled", "handed_off"].includes(String(item.status || "")) && !publishingOwnerNote(item);
}

function renderManualExport() {
  const assets = packageAssets();
  const selectedAsset = assets.find((asset) => asset.id === state.selectedPackItem) || assets[0];
  return `
    <div class="screen-grid two">
      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Material pack", "Пакет материалов")}</p>
            <h3>${text("Approved texts for the week", "Утверждённые тексты на неделю")}</h3>
          </div>
        </div>
        <div class="form-grid">
          ${field(text("Week", "Неделя"), "exportWeek", "2026-05-week-1")}
          <label>${text("Channels", "Каналы")}
            <div class="check-grid">
              ${[
                text("Website pages", "Страницы сайта"),
                "Telegram",
                "VC.ru",
                "Email",
                text("Lead magnet", "Лид-магнит"),
                text("Publishing calendar", "Календарь публикаций")
              ].map((channel) =>
                `<label class="check"><input type="checkbox" checked /> ${escapeHtml(channel)}</label>`
              ).join("")}
            </div>
          </label>
        </div>
      </article>

      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Preview", "Предпросмотр")}</p>
            <h3>${text("What will be handed off", "Что уйдёт в работу")}</h3>
          </div>
        </div>
        <div class="pack-preview">
          ${assets.map((asset) =>
            `<div class="pack-row ${asset.id === state.selectedPackItem ? "selected" : ""}"><span>${escapeHtml(asset.label)}</span><button class="button secondary" data-action="preview-pack-item" data-id="${escapeAttr(asset.id)}">Preview</button></div>`
          ).join("")}
        </div>
        <div class="pack-detail">
          <p class="eyebrow">${escapeHtml(selectedAsset.label)}</p>
          <pre class="asset-preview-text">${escapeHtml(selectedAsset.preview)}</pre>
        </div>
        <div class="pack-handoff-panel">
          <p class="eyebrow">${text("Owner handoff rule", "Правило передачи от собственника")}</p>
          <strong>${escapeHtml(state.workspaceState.pack_handoff_note || text("Use this pack only after approval. Manual send, manual publish, then confirm what actually went live.", "Использовать пакет только после согласования. Сначала ручная передача, потом ручная публикация, затем подтверждение, что реально вышло."))}</strong>
        </div>
      </article>
    </div>
  `;
}

function renderAgents() {
  const toggles = [
    ["prepare_topics", text("Prepare topics", "Готовить темы"), true],
    ["write_drafts", text("Write drafts", "Писать черновики"), true],
    ["assemble_pack", text("Assemble weekly pack", "Собирать недельный пакет"), true],
    ["approval_reminders", text("Remind about approvals", "Напоминать о согласовании"), true],
    ["publish_after_approval", text("Publish after approval", "Публиковать после согласования"), false]
  ];

  return `
    <div class="screen-grid two">
      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Autopilot", "Автопилот")}</p>
            <h3>${text("What the system may do without an operator", "Что система может делать без оператора")}</h3>
          </div>
        </div>
        <div class="check-grid single">
          ${toggles.map(([key, label, checked]) => `<label class="check"><input type="checkbox" data-autopilot-key="${escapeAttr(key)}" ${state.autopilotSettings[key] ?? checked ? "checked" : ""} /> ${escapeHtml(label)}</label>`).join("")}
        </div>
      </article>

      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Work split", "Разделение работы")}</p>
            <h3>${text("What waits for a human", "Где нужен человек")}</h3>
          </div>
        </div>
        <div class="automation-list">
          ${automationRow(text("Done by the system", "Система делает сама"), text("Finds topics, prepares briefs, drafts materials, assembles weekly packs.", "Ищет темы, готовит ТЗ, пишет черновики, собирает недельные пакеты."), 76)}
          ${automationRow(text("Needs your decision", "Нужно ваше решение"), text("Public publishing, risky claims, client names, competitor comparisons.", "Публичные публикации, рискованные обещания, имена клиентов, сравнения с конкурентами."), 34)}
          ${automationRow(text("Blocked by integrations", "Ждёт подключений"), text("Direct posting, website updates, email sends, ZIP storage.", "Прямая публикация, обновления сайта, рассылки, хранение ZIP."), 58)}
        </div>
      </article>
    </div>
  `;
}

function renderAnalytics() {
  const metrics = deriveMetrics(state.metrics);
  return `
    ${workflowStrip("analytics")}
    ${resultNextMovePanel(metrics)}
    <div class="metric-grid">
      ${metricCard(text("Tasks created", "Создано задач"), metrics.tasks_created, text("Agent and operator work items", "Задачи агентов и операторов"))}
      ${metricCard(text("Approvals", "Согласования"), metrics.approvals_total, text(`${metrics.pending_approvals} pending`, `${metrics.pending_approvals} ждут решения`), "coral")}
      ${metricCard(text("Published materials", "Опубликовано материалов"), metrics.published_materials, text("Live or handed off", "Вышли или переданы"))}
      ${metricCard(text("Leads", "Заявки"), metrics.leads, text("Imported from forms or CRM", "Из форм или CRM"), "dark")}
      ${metricCard(text("Receivables in progress", "Дебиторка в работе"), metrics.receivables_in_progress, text("Invoices under follow-up", "Счета в дожиме"))}
      ${metricCard(text("Promised payments", "Обещанные оплаты"), metrics.promised_payments, text("Debtor promises tracked", "Зафиксированные обещания"))}
      ${metricCard(text("Recovered payments", "Возвращённые оплаты"), metrics.recovered_payments, text("Confirmed manually or by import", "Подтверждены вручную или импортом"), "coral")}
      ${metricCard(text("Ready to improve", "На улучшение"), metrics.improvement_tasks, text("Tasks from analytics", "Задачи из аналитики"))}
    </div>
    <article class="panel full">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${text("Result placeholders", "Метрики результата")}</p>
          <h3>${text("What AgentResult should track first", "Что AgentResult должен считать в первую очередь")}</h3>
        </div>
      </div>
      ${table([
        text("Metric", "Метрика"),
        text("Why it matters", "Зачем собственнику"),
        text("Current source", "Текущий источник"),
        text("Next connection", "Следующее подключение")
      ], resultsMetricRows())}
    </article>
    <article class="panel full">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${text("Improvement work", "Работа по улучшениям")}</p>
          <h3>${text("Tasks generated from results", "Задачи из результатов")}</h3>
        </div>
      </div>
      ${table([
        text("Task", "Задача"),
        text("Owner", "Ответственный"),
        text("Status", "Статус"),
        text("Why now", "Почему сейчас"),
        text("Next action", "Следующее действие")
      ], state.tasks.map((task) => [
        task.title,
        task.owner,
        statusChip(task.status || "next"),
        task.note || text("Manual action", "Ручное действие"),
        taskAction(task)
      ]))}
    </article>
  `;
}

function resultNextMovePanel(metrics) {
  const next = resultNextMove(metrics);
  return `
    <article class="panel full next-move-panel">
      <div>
        <p class="eyebrow">${text("Owner next move", "Следующий шаг собственника")}</p>
        <h3>${escapeHtml(next.title)}</h3>
        <p>${escapeHtml(next.note)}</p>
      </div>
      <button class="button ${next.variant}" data-action="${escapeAttr(next.action)}">${escapeHtml(next.label)}</button>
    </article>
  `;
}

function resultNextMove(metrics) {
  if (!metrics.leads && !metrics.published_materials) {
    return {
      title: text("Get the first public signal and first demand signal into the system", "Дайте системе первый внешний выпуск и первый сигнал спроса"),
      note: text("Until a material is published and leads are imported, results are only preparation.", "Пока нет публикации и заявок, результаты показывают подготовку, а не рынок."),
      action: "generate-improvements",
      label: text("Create improvement tasks", "Создать задачи улучшения"),
      variant: "primary"
    };
  }
  if (metrics.pending_approvals) {
    return {
      title: text("Clear pending approvals before pushing more materials", "Разберите согласования перед новым выпуском"),
      note: text("Approval-first only works if owner decisions do not pile up.", "Approval-first работает, когда решения собственника не копятся."),
      action: "go-approvals",
      label: text("Open approvals", "Открыть согласования"),
      variant: "primary"
    };
  }
  if (!metrics.receivables_in_progress) {
    return {
      title: text("Add the first receivables list to start Collect safely", "Добавьте первую дебиторку для безопасного старта Collect"),
      note: text("The system can prepare follow-up work, but money-related actions stay manual-first.", "Система подготовит дожим, но денежные действия остаются manual-first."),
      action: "import-metrics",
      label: text("Import results", "Импортировать результаты"),
      variant: "secondary"
    };
  }
  return {
    title: text("Use the current data to choose the next growth fix", "Выберите следующее улучшение по текущим данным"),
    note: text("The loop now has enough signals to create focused work instead of generic tasks.", "У цикла уже есть сигналы для точной работы, а не общих задач."),
    action: "generate-improvements",
    label: text("Suggest improvements", "Предложить улучшения"),
    variant: "secondary"
  };
}

function taskAction(task) {
  if (task.status === "done" || task.status === "approved") return `<span class="muted">${escapeHtml(text("Done", "Готово"))}</span>`;
  return `<button class="button secondary table-button" data-action="complete-task" data-id="${escapeAttr(task.id)}">${escapeHtml(text("Mark done", "Отметить готово"))}</button>`;
}

function resultsMetricRows() {
  return [
    [text("Tasks created", "Создано задач"), text("Shows whether the system turns signals into work.", "Показывает, превращает ли система сигналы в работу."), text("Backend tasks", "Backend tasks"), "Telegram WebApp"],
    [text("Approvals", "Согласования"), text("Shows owner load and blocked public actions.", "Показывает нагрузку собственника и заблокированные публичные действия."), text("Approvals table", "Таблица согласований"), "Telegram"],
    [text("Published materials", "Опубликовано материалов"), text("Shows market-facing output without counting drafts as results.", "Показывает внешний выпуск, не считая черновики результатом."), text("Publishing calendar", "Календарь публикаций"), text("Website / CMS", "Сайт / CMS")],
    [text("Leads", "Заявки"), text("Connects growth work to demand.", "Связывает работу по росту со спросом."), text("Manual import", "Ручной импорт"), "CRM / forms"],
    [text("Receivables in progress", "Дебиторка в работе"), text("Shows money currently under systematic follow-up.", "Показывает деньги в системном дожиме."), "CSV / XLSX", "CRM / 1C"],
    [text("Promised payments", "Обещанные оплаты"), text("Separates real debtor promises from ordinary reminders.", "Отделяет обещания оплатить от обычных напоминаний."), text("Manual status", "Ручной статус"), "Email / CRM"],
    [text("Recovered payments", "Возвращённые оплаты"), text("Shows confirmed cash return without promising guarantees.", "Показывает подтверждённый возврат денег без обещаний гарантии."), text("Manual import", "Ручной импорт"), text("Bank / accounting", "Банк / учёт")]
  ];
}

function renderSettings() {
  const tab = currentSettingsTab();
  const tabRenderers = {
    technical: renderTechnicalSettings,
    autopilot: renderAutopilotSettings,
    channels: renderChannelSettings,
    tools: renderToolsSettings
  };

  return `
    <section class="tabs-panel settings-tabs-panel" aria-label="${escapeAttr(text("Settings workspace", "Настройки системы"))}">
      <div class="segmented-tabs" role="tablist">
        ${Object.entries(settingsTabs).map(([key, item]) => `
          <button class="tab-button ${tab === key ? "active" : ""}" role="tab" aria-selected="${tab === key ? "true" : "false"}" data-action="set-settings-tab" data-id="${escapeAttr(key)}">
            ${escapeHtml(tr(item.label))}
          </button>
        `).join("")}
      </div>
      <div class="tab-context">
        ${settingsTabContext(tab)}
      </div>
    </section>
    ${tabRenderers[tab]()}
  `;
}

function settingsTabContext(tab) {
  const contexts = {
    technical: [
      text("Technical status", "Технический статус"),
      text("A quiet place for service connection details, so the main workflow stays business-facing.", "Тихое место для состояния сервиса, чтобы основной workflow оставался языком бизнеса.")
    ],
    autopilot: [
      text("Autopilot", "Автопилот"),
      text("Choose what the system may do itself and where owner approval stays required.", "Выберите, что система может делать сама, а где нужно решение собственника.")
    ],
    channels: [
      text("Channels", "Каналы"),
      text("Control where materials can go and which channels stay manual-first.", "Настройте, куда можно передавать материалы и какие каналы пока остаются ручными.")
    ],
    tools: [
      text("Tools", "Инструменты"),
      text("See what is used now, what is not used yet, and what is needed to connect each tool.", "Посмотрите, что уже используется, что пока не используется и что нужно для подключения.")
    ]
  };
  const [title, note] = contexts[tab] || contexts.technical;
  return `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(note)}</span>`;
}

function renderTechnicalSettings() {
  return `
    <div class="screen-grid two">
      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Technical status", "Технический статус")}</p>
            <h3>${state.online ? text("System data is connected", "Данные подключены") : text("Demo data is active", "Включены демо-данные")}</h3>
          </div>
          <span class="status-dot ${state.online ? "online" : "offline"}"></span>
        </div>
        <div class="settings-list">
          <div><span>${text("Service address", "Адрес сервиса")}</span><strong>${escapeHtml(API_BASE)}</strong></div>
          <div><span>${text("Workspace", "Рабочая область")}</span><strong>${escapeHtml(TENANT_ID)}</strong></div>
          <div><span>${text("Current user", "Текущий пользователь")}</span><strong>${escapeHtml(`${state.me?.name || "Owner"} · ${state.me?.role || "owner"}`)}</strong></div>
          <div><span>${text("Data connection", "Подключение данных")}</span><strong>${state.online ? text("connected", "подключено") : text("not connected", "не подключено")}</strong></div>
        </div>
      </article>
      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Owner view", "Вид для собственника")}</p>
            <h3>${text("Technical details stay here", "Технические детали остаются здесь")}</h3>
          </div>
        </div>
        <p class="empty-note">${text("The daily workflow speaks about growth, materials, approvals and results. Connection details are separated so operators do not have to read infrastructure language while making business decisions.", "Ежедневный workflow говорит о росте, материалах, согласованиях и результатах. Детали подключений вынесены отдельно, чтобы в рабочих решениях не мешал инженерный язык.")}</p>
      </article>
    </div>
  `;
}

function renderAutopilotSettings() {
  const toggles = [
    [text("Prepare topics", "Готовить темы"), true],
    [text("Write drafts", "Писать черновики"), true],
    [text("Assemble weekly pack", "Собирать недельный пакет"), true],
    [text("Remind about approvals", "Напоминать о согласовании"), true],
    [text("Publish after approval", "Публиковать после согласования"), false]
  ];

  return `
    <div class="screen-grid two">
      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Autopilot", "Автопилот")}</p>
            <h3>${text("What the system may do itself", "Что система может делать сама")}</h3>
          </div>
        </div>
        <div class="check-grid single">
          ${toggles.map(([label, checked]) => `<label class="check"><input type="checkbox" ${checked ? "checked" : ""} /> ${escapeHtml(label)}</label>`).join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Work split", "Разделение работы")}</p>
            <h3>${text("Where owner approval stays required", "Где остаётся решение собственника")}</h3>
          </div>
        </div>
        <div class="automation-list">
          ${automationRow(text("Done by the system", "Система делает сама"), text("Finds topics, prepares briefs, drafts materials, assembles weekly packs.", "Ищет темы, готовит ТЗ, пишет черновики, собирает недельные пакеты."), 76)}
          ${automationRow(text("Needs your decision", "Нужно ваше решение"), text("Public publishing, risky claims, client names, competitor comparisons.", "Публичные публикации, рискованные обещания, имена клиентов, сравнения с конкурентами."), 34)}
          ${automationRow(text("Blocked by connected tools", "Ждёт подключённых инструментов"), text("Direct posting, website updates, email sends, package storage.", "Прямая публикация, обновления сайта, рассылки, хранение пакетов."), 58)}
        </div>
      </article>
    </div>
  `;
}

function renderChannelSettings() {
  const channels = [
    ["website", text("Website pages", "Страницы сайта"), true],
    ["telegram", "Telegram", true],
    ["vc", "VC.ru", false],
    ["habr", "Habr", false],
    ["email", "Email", true],
    ["calendar", text("Publishing calendar", "Календарь публикаций"), true]
  ];

  return `
    <div class="screen-grid two">
      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Channels", "Каналы")}</p>
            <h3>${text("Where publishing is allowed", "Куда можно передавать материалы")}</h3>
          </div>
        </div>
        <div class="check-grid">
          ${channels.map(([key, label, checked]) => `<label class="check"><input type="checkbox" data-channel-key="${escapeAttr(key)}" ${state.channelSettings[key] ?? checked ? "checked" : ""} /> ${escapeHtml(label)}</label>`).join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Channel rules", "Правила каналов")}</p>
            <h3>${text("What stays manual-first", "Что пока делаем вручную")}</h3>
          </div>
        </div>
        <div class="automation-list">
          ${automationRow(text("Ready now", "Готово сейчас"), text("Approved materials can be copied from the weekly pack and placed manually.", "Согласованные материалы можно забрать из недельного пакета и разместить вручную."), 76)}
          ${automationRow(text("Needs owner decision", "Нужно решение собственника"), text("Public posts, strong claims, client names and competitor comparisons.", "Публичные посты, сильные обещания, имена клиентов и сравнения с конкурентами."), 34)}
          ${automationRow(text("Can be connected later", "Можно подключить позже"), text("Direct social posting, website updates, email sends and package storage.", "Прямая публикация в соцсети, обновления сайта, email-рассылки и хранение пакетов."), 58)}
        </div>
      </article>
    </div>
  `;
}

function renderToolsSettings() {
  const tools = toolInventory();
  const usedNow = tools.filter((tool) => tool.group === "active");
  const unused = tools.filter((tool) => tool.group === "unused");
  const selected = selectedTool();
  const clientTools = tools.filter((tool) => tool.clientUse === "active" || tool.clientUse === "testing");

  return `
    <article class="panel full">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">${text("Client setup", "Что уже есть у клиента")}</p>
          <h3>${text("Tools already used in the business", "Инструменты, с которыми уже работает клиент")}</h3>
        </div>
      </div>
      <div class="client-tool-strip">
        ${clientTools.map((tool) => `
          <div class="client-tool-chip">
            <strong>${escapeHtml(tool.name)}</strong>
            <span>${escapeHtml(clientUseLabel(tool.clientUse))} · ${escapeHtml(tool.modules.map(moduleShortLabel).join(", "))}</span>
          </div>
        `).join("")}
      </div>
    </article>

    ${toolReadinessPanel(tools)}

    <div class="tools-grid">
      <div class="stack-panels">
        <article class="panel">
          <div class="panel-heading compact">
            <div>
              <p class="eyebrow">${text("Used now", "Используем сейчас")}</p>
              <h3>${text("Which tools we use", "Какие инструменты используем")}</h3>
            </div>
          </div>
          <div class="tool-summary-list">
            ${usedNow.map(toolSummaryRow).join("")}
          </div>
        </article>

        <article class="panel">
          <div class="panel-heading compact">
            <div>
              <p class="eyebrow">${text("Not used", "Не используется")}</p>
              <h3>${text("What we do not use yet", "Что пока не используем")}</h3>
            </div>
          </div>
          <div class="tool-summary-list compact">
            ${unused.map(toolSummaryRow).join("")}
          </div>
        </article>
      </div>

      <article class="panel">
        <div class="panel-heading compact">
          <div>
            <p class="eyebrow">${text("Can be connected", "Можно подключить")}</p>
            <h3>${text("What is connected", "Что подключено")}</h3>
          </div>
        </div>
        <div class="connector-list">
          ${tools.map(toolConnectorCard).join("")}
        </div>
      </article>
    </div>

    ${growthModulesPanel()}
    ${toolConnectionForm(selected)}
  `;
}

function toolReadinessPanel(tools) {
  const connected = tools.filter((tool) => tool.status === "connected").length;
  const needsSetup = tools.filter((tool) => tool.status === "needs-setup").length;
  const later = tools.filter((tool) => tool.status === "later" || tool.status === "not-used").length;
  const blockers = tools.filter((tool) => tool.status === "needs-setup" || tool.accessNeeded);
  const nextBlocker = blockers[0] || tools.find((tool) => tool.status === "later");
  return `
    <section class="tool-readiness-strip">
      ${ownerSetupCard(text("Connected", "Подключено"), connected, text("Ready for controlled work", "Готово к управляемой работе"))}
      ${ownerSetupCard(text("Needs setup", "Нужно настроить"), needsSetup, text("Blocks automation or evidence flow", "Блокирует автоматизацию или данные"))}
      ${ownerSetupCard(text("Later", "Позже"), later, text("Do not distract the first workflow", "Не отвлекает первый workflow"))}
      ${ownerSetupCard(text("Next access task", "Следующая задача доступа"), nextBlocker?.name || text("None", "Нет"), nextBlocker?.owner || text("Owner is clear", "Владелец понятен"))}
    </section>
  `;
}

function toolInventory() {
  const tools = [
    {
      id: "telegram-webapp",
      name: text("Telegram WebApp", "Telegram WebApp"),
      type: text("owner control panel", "пульт собственника"),
      formType: "social",
      group: "active",
      status: "connected",
      clientUse: "active",
      modules: ["offer-brain", "publishing-approval", "results-loop"],
      owner: "Egor / AgentResult",
      url: "https://agentresult-crm.vercel.app/",
      summary: text("Shows tasks, approvals, statuses and next actions.", "Показывает задачи, согласования, статусы и следующие действия."),
      permissions: ["read", "approval"],
      limits: text("No direct model calls or external messages without backend approval.", "Не обращаться напрямую к моделям и не отправлять внешние сообщения без backend approval.")
    },
    {
      id: "backend",
      name: text("AgentResult Backend", "AgentResult Backend"),
      type: text("API and control layer", "API и контур управления"),
      formType: "other",
      group: "active",
      status: "needs-setup",
      clientUse: "testing",
      modules: ["publishing-approval", "results-loop", "proof-engine"],
      owner: "AgentResult",
      url: "https://api.agentresult.ru",
      summary: text("Runs auth, tasks, approvals, audit and integrations.", "Держит auth, задачи, согласования, audit и интеграции."),
      permissions: ["read", "prepare", "approval"],
      limits: text("Do not store secrets in the frontend and do not bypass approval rules.", "Не хранить секреты во frontend и не обходить правила согласования.")
    },
    {
      id: "hermes",
      name: "Hermes Agent",
      type: text("agent runtime", "agent runtime"),
      formType: "other",
      group: "active",
      status: "connected",
      clientUse: "testing",
      modules: ["content-factory", "proof-engine", "results-loop"],
      owner: "AgentResult",
      url: "internal Docker network",
      summary: text("Handles reasoning, drafts, analysis and action proposals.", "Делает reasoning, черновики, анализ и action proposals."),
      permissions: ["read", "prepare"],
      limits: text("No public API access and no side effects without backend approval.", "Не давать публичный API-доступ и не выполнять side effects без backend approval.")
    },
    {
      id: "postgres",
      name: "Postgres",
      type: text("operational database", "операционная база"),
      formType: "other",
      group: "active",
      status: "connected",
      clientUse: "active",
      modules: ["offer-brain", "results-loop", "proof-engine"],
      owner: "AgentResult / backend",
      url: "Internal database",
      summary: text("Stores tenants, tasks, approvals, receivables, CRM and events.", "Хранит tenants, задачи, согласования, дебиторку, CRM и события."),
      permissions: ["read"],
      limits: text("No direct frontend access.", "Не давать прямой доступ из frontend.")
    },
    {
      id: "openrouter",
      name: "OpenRouter",
      type: text("model provider", "model provider"),
      formType: "other",
      group: "active",
      status: "connected",
      clientUse: "active",
      modules: ["content-factory", "proof-engine"],
      owner: "AgentResult",
      url: "Provider connection through backend",
      summary: text("Provides model calls through Hermes and backend.", "Даёт вызовы моделей через Hermes и backend."),
      permissions: ["prepare"],
      limits: text("No direct calls from the WebApp.", "Не вызывать напрямую из WebApp.")
    },
    {
      id: "email",
      name: "SMTP / Email",
      type: "email",
      formType: "email",
      group: "active",
      status: "needs-setup",
      clientUse: "planned",
      modules: ["content-factory", "distribution"],
      owner: "Egor / AgentResult",
      url: "Add SMTP host or sender address",
      summary: text("Used for approved client emails and follow-ups.", "Используется для согласованных писем и follow-up."),
      permissions: ["prepare", "approval"],
      limits: text("No mass sends or legally sensitive emails without approval.", "Не отправлять массовые или юридически чувствительные письма без согласования.")
    },
    {
      id: "site-cms",
      name: text("Website / CMS", "Сайт / CMS"),
      type: text("site", "сайт"),
      formType: "site",
      group: "active",
      status: "connected",
      clientUse: "active",
      modules: ["programmatic-seo", "ai-search", "publishing-approval"],
      owner: "Egor / AgentResult",
      url: "https://agentresult-crm.vercel.app/",
      summary: text("Hosts demand pages, trust pages and product explanations.", "Здесь живут страницы спроса, доверия и продуктовые страницы."),
      permissions: ["read", "prepare", "approval"],
      limits: text("Do not update public pages without explicit owner approval.", "Не обновлять публичные страницы без явного согласования собственника.")
    },
    {
      id: "crm",
      name: "Bitrix24 / amoCRM",
      type: "CRM",
      formType: "crm",
      group: "active",
      status: "later",
      clientUse: "planned",
      modules: ["results-loop", "proof-engine"],
      owner: text("Sales owner", "Ответственный за продажи"),
      url: text("Add CRM URL or endpoint", "Добавьте URL или endpoint CRM"),
      summary: text("Needed for deal stages, lead handoff and follow-up discipline.", "Нужна для этапов сделки, передачи лидов и дисциплины follow-up."),
      permissions: ["read", "approval"],
      limits: text("Do not create or move deals without a clear owner rule.", "Не создавать и не двигать сделки без понятного правила от собственника.")
    },
    {
      id: "tables",
      name: text("CSV / XLSX", "CSV / XLSX"),
      type: text("spreadsheet", "таблица"),
      formType: "sheet",
      group: "active",
      status: "connected",
      clientUse: "active",
      modules: ["proof-engine", "results-loop"],
      owner: "Egor / AgentResult",
      url: text("Manual import and weekly export pack", "Ручной импорт и недельный экспорт-пакет"),
      summary: text("Fallback for receivables, metrics and handoff before full integrations.", "Запасной способ для дебиторки, метрик и передачи материалов до полных интеграций."),
      permissions: ["read", "prepare", "approval"],
      limits: text("Keep sensitive client data out of shared exports.", "Не добавлять чувствительные клиентские данные в общие экспорты.")
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      type: text("social network", "соцсеть"),
      formType: "social",
      group: "unused",
      status: "later",
      clientUse: "not-used",
      modules: ["distribution", "content-factory"],
      owner: text("No owner yet", "Владелец не назначен"),
      url: "",
      summary: text("Can become a founder-led outbound and trust channel.", "Может стать каналом дистрибуции и доверия от лица основателя."),
      permissions: ["prepare", "approval"],
      limits: text("No publishing until the account owner approves tone and access.", "Не публиковать, пока владелец аккаунта не согласует тон и доступ.")
    },
    {
      id: "vc",
      name: "VC.ru",
      type: text("media", "медиа"),
      formType: "social",
      group: "unused",
      status: "later",
      clientUse: "planned",
      modules: ["content-factory", "distribution", "proof-engine"],
      owner: text("No owner yet", "Владелец не назначен"),
      url: "",
      summary: text("Useful for long-form market arguments and founder voice.", "Подходит для длинных рыночных материалов и голоса основателя."),
      permissions: ["prepare", "approval"],
      limits: text("No external publishing without final owner review.", "Не публиковать наружу без финального ревью собственника.")
    },
    {
      id: "habr",
      name: "Habr",
      type: text("media", "медиа"),
      formType: "social",
      group: "unused",
      status: "later",
      clientUse: "planned",
      modules: ["content-factory", "proof-engine"],
      owner: text("No owner yet", "Владелец не назначен"),
      url: "",
      summary: text("Useful for technical trust and infrastructure credibility.", "Подходит для технического доверия и инфраструктурной экспертизы."),
      permissions: ["prepare", "approval"],
      limits: text("Do not publish technical claims without expert review.", "Не публиковать технические утверждения без экспертной проверки.")
    },
    {
      id: "ads",
      name: "Ads",
      type: text("advertising", "реклама"),
      formType: "other",
      group: "unused",
      status: "later",
      clientUse: "not-used",
      modules: ["distribution", "results-loop"],
      owner: text("No owner yet", "Владелец не назначен"),
      url: "",
      summary: text("Can amplify proven demand pages later.", "Позже может усиливать уже проверенные страницы спроса."),
      permissions: ["read", "prepare", "approval"],
      limits: text("Do not launch spend automatically.", "Не запускать рекламный бюджет автоматически.")
    },
    {
      id: "webhooks",
      name: "Webhooks",
      type: text("automation", "автоматизация"),
      formType: "other",
      group: "unused",
      status: "later",
      clientUse: "planned",
      modules: ["publishing-approval", "results-loop"],
      owner: text("No owner yet", "Владелец не назначен"),
      url: "",
      summary: text("Can pass approved events into other tools.", "Могут передавать согласованные события в другие инструменты."),
      permissions: ["approval"],
      limits: text("No outgoing sensitive events until the destination is named by the owner.", "Не отправлять чувствительные события, пока собственник не назовёт точного получателя.")
    }
  ];
  return tools.map((tool) => ({ ...tool, ...(state.toolOverrides[tool.id] || {}) }));
}

function selectedTool() {
  return toolInventory().find((tool) => tool.id === state.selectedToolId) || {
    id: "custom",
    name: text("New tool", "Новый инструмент"),
    type: text("other", "другое"),
    formType: "other",
    group: "active",
    status: "needs-setup",
    clientUse: "active",
    modules: ["offer-brain"],
    owner: "",
    url: "",
    summary: text("Add the tool your team already uses or wants to connect.", "Добавьте инструмент, который команда уже использует или хочет подключить."),
    permissions: ["read"],
    limits: ""
  };
}

function toolSummaryRow(tool) {
  return `
    <div class="tool-summary-row">
      <div>
        <strong>${escapeHtml(tool.name)}</strong>
        <span>${escapeHtml(tool.type)} · ${escapeHtml(tool.owner || text("No owner yet", "Владелец не назначен"))}</span>
        <span>${escapeHtml(clientUseLabel(tool.clientUse))}</span>
      </div>
      ${toolStatusBadge(tool.status)}
    </div>
  `;
}

function toolConnectorCard(tool) {
  const selected = tool.id === state.selectedToolId;
  const buttonLabel = tool.status === "connected"
    ? text("View", "Смотреть")
    : tool.status === "not-used"
      ? text("Add", "Добавить")
      : text("Configure", "Настроить");

  return `
    <article class="tool-card ${selected ? "selected" : ""}">
      <div>
        <div class="tool-card-title">
          <strong>${escapeHtml(tool.name)}</strong>
          ${toolStatusBadge(tool.status)}
          ${clientUseBadge(tool.clientUse)}
        </div>
        <span>${escapeHtml(tool.summary)}</span>
        <div class="module-chip-row">
          ${tool.modules.map((moduleId) => `<span>${escapeHtml(moduleShortLabel(moduleId))}</span>`).join("")}
        </div>
      </div>
      <button class="button secondary" data-action="select-tool" data-id="${escapeAttr(tool.id)}">${escapeHtml(buttonLabel)}</button>
    </article>
  `;
}

function toolConnectionForm(tool) {
  const permissions = ["read", "prepare", "approval", "publish"];

  return `
    <article class="panel full tool-form-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${text("Connection details", "Что нужно для подключения")}</p>
          <h3>${escapeHtml(tool.name)}</h3>
        </div>
        ${toolStatusBadge(tool.status)}
      </div>
      <form class="form-grid tool-form" id="toolForm">
        <div class="form-grid two-col">
          ${toolInput(text("Tool name", "Название инструмента"), "toolName", tool.id === "custom" ? "" : tool.name, text("For example: HubSpot, WordPress, Telegram", "Например: HubSpot, WordPress, Telegram"))}
          ${toolSelect(text("Tool type", "Тип инструмента"), "toolType", tool.formType)}
        </div>
        <div class="form-grid two-col">
          ${toolInput(text("URL or endpoint", "URL или endpoint"), "toolUrl", tool.url, text("Link to the service, account, form, or endpoint", "Ссылка на сервис, аккаунт, форму или endpoint"))}
          ${toolInput(text("Key, token, or webhook URL", "Ключ, токен или webhook URL"), "toolSecret", "", text("Only if this tool needs one", "Только если инструменту это нужно"))}
        </div>
        <div class="form-grid two-col">
          ${clientUseSelect(text("Does the client use it now?", "Клиент сейчас этим пользуется?"), "toolClientUse", tool.clientUse)}
          ${toolInput(text("Who owns access", "Кто владеет доступом"), "toolOwner", tool.owner, text("Person or role responsible for access", "Человек или роль, отвечающие за доступ"))}
        </div>
        <div class="permission-block">
          <span class="meta-label">${text("What to enable with this tool", "Что включить через этот инструмент")}</span>
          <div class="module-check-grid">
            ${growthModules().map((module) => `
              <label class="check"><input type="checkbox" ${tool.modules.includes(module.id) ? "checked" : ""} /> ${escapeHtml(module.shortLabel)}</label>
            `).join("")}
          </div>
        </div>
        <div class="permission-block">
          <span class="meta-label">${text("What the system may do", "Что системе разрешено делать")}</span>
          <div class="check-grid">
            ${permissions.map((permission) => `
              <label class="check"><input type="checkbox" ${tool.permissions.includes(permission) ? "checked" : ""} /> ${escapeHtml(toolPermissionLabel(permission))}</label>
            `).join("")}
          </div>
        </div>
        ${textarea(text("Limits: what must not happen", "Ограничения / что нельзя делать"), "toolLimits", tool.limits)}
        <div class="detail-actions">
          <button type="button" class="button primary" data-action="save-tool">${text("Save setup", "Сохранить настройку")}</button>
          <button type="button" class="button secondary" data-action="request-tool-owner">${text("Mark access owner needed", "Нужен владелец доступа")}</button>
        </div>
      </form>
    </article>
  `;
}

function growthModulesPanel() {
  return `
    <article class="panel full modules-panel">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">${text("What to enable", "Что включить")}</p>
          <h3>${text("Eight parts of the growth system", "8 частей системы роста")}</h3>
        </div>
      </div>
      <div class="module-grid">
        ${growthModules().map((module) => `
          <article class="module-card">
            <div class="module-card-top">
              <strong>${escapeHtml(module.name)}</strong>
              ${moduleStatusBadge(module.status)}
            </div>
            <p>${escapeHtml(module.description)}</p>
            <div class="module-chip-row">
              ${module.tools.map((tool) => `<span>${escapeHtml(tool)}</span>`).join("")}
            </div>
          </article>
        `).join("")}
      </div>
    </article>
  `;
}

function growthModules() {
  return [
    {
      id: "offer-brain",
      name: "Offer Brain",
      shortLabel: text("Offer Brain", "Offer Brain"),
      status: "enabled",
      description: text(
        "One source of product meaning: ICP, pains, proof, cases, objections, tone and forbidden claims.",
        "Единая база смысла продукта: для кого, боли, доказательства, кейсы, возражения, тон и запретные формулировки."
      ),
      tools: [text("Company profile", "Компания"), text("Proof library", "Доказательства")]
    },
    {
      id: "programmatic-seo",
      name: "Programmatic SEO Pages",
      shortLabel: text("SEO pages", "SEO-страницы"),
      status: "client-work",
      description: text(
        "Pages by demand matrix: region, industry, problem, product, integrations and comparisons.",
        "Страницы по матрице спроса: регион, отрасль, боль, продукт, интеграции и сравнения."
      ),
      tools: [text("Website / CMS", "Сайт / CMS"), text("Analytics", "Аналитика")]
    },
    {
      id: "ai-search",
      name: "AI Search / GPT SEO / GEO",
      shortLabel: text("AI Search", "AI-поиск"),
      status: "prepare",
      description: text(
        "Entity pages, clear product definitions, FAQ answers, schema, sitemap and proof pages.",
        "Entity-страницы, понятные определения продуктов, FAQ-ответы, schema, sitemap и страницы доказательств."
      ),
      tools: [text("Website / CMS", "Сайт / CMS"), text("Analytics", "Аналитика")]
    },
    {
      id: "content-factory",
      name: "Content Factory",
      shortLabel: text("Content Factory", "Фабрика контента"),
      status: "enabled",
      description: text(
        "Turns one idea into articles, posts, email, FAQ, video scripts and sales battlecards.",
        "Превращает одну идею в статьи, посты, письма, FAQ, сценарии видео и sales-материалы."
      ),
      tools: ["Telegram", "Email", "VC.ru"]
    },
    {
      id: "proof-engine",
      name: "Proof Engine",
      shortLabel: text("Proof Engine", "Доказательства"),
      status: "client-work",
      description: text(
        "Mini-cases, before/after, screenshots, process numbers, demos and benefit calculators.",
        "Мини-кейсы, before/after, скриншоты, цифры процессов, демо-сценарии и калькуляторы выгоды."
      ),
      tools: [text("Tables", "Таблицы"), "CRM", text("Website / CMS", "Сайт / CMS")]
    },
    {
      id: "publishing-approval",
      name: "Publishing & Approval",
      shortLabel: text("Publishing", "Публикации"),
      status: "enabled",
      description: text(
        "Approval gates before public posts, risky claims, client names and competitor comparisons.",
        "Контур согласований перед публичными постами, рискованными обещаниями, именами клиентов и сравнениями."
      ),
      tools: ["Telegram", text("Website / CMS", "Сайт / CMS"), "Email"]
    },
    {
      id: "distribution",
      name: "Distribution Channels",
      shortLabel: text("Distribution", "Дистрибуция"),
      status: "prepare",
      description: text(
        "Channel plan for Telegram, email, LinkedIn-style posts, VC.ru, Habr and paid amplification.",
        "План каналов для Telegram, email, LinkedIn-style постов, VC.ru, Habr и платного усиления."
      ),
      tools: ["Telegram", "Email", "LinkedIn", "VC.ru"]
    },
    {
      id: "results-loop",
      name: "Results & Growth Loop",
      shortLabel: text("Results loop", "Цикл результатов"),
      status: "prepare",
      description: text(
        "Connects traffic, leads, calls, CRM stages and content improvements into one feedback loop.",
        "Связывает переходы, заявки, звонки, CRM-этапы и улучшения материалов в один цикл обратной связи."
      ),
      tools: [text("Analytics", "Аналитика"), "CRM", text("Call tracking", "Call tracking")]
    }
  ];
}

function moduleShortLabel(moduleId) {
  return growthModules().find((module) => module.id === moduleId)?.shortLabel || labelize(moduleId);
}

function moduleStatusBadge(status) {
  const statuses = {
    enabled: { label: text("Enabled", "Включено"), className: "connected" },
    "client-work": { label: text("Client work now", "В работе у клиента"), className: "client-work" },
    prepare: { label: text("Prepare next", "Подготовить"), className: "needs-setup" },
    later: { label: text("Later", "Позже"), className: "later" }
  };
  const meta = statuses[status] || statuses.prepare;
  return `<span class="tool-status ${meta.className}">${escapeHtml(meta.label)}</span>`;
}

function clientUseLabel(status) {
  const statuses = {
    active: text("Client uses now", "Клиент уже использует"),
    testing: text("Client is testing", "Клиент тестирует"),
    "not-used": text("Not used by client", "Клиент не использует"),
    planned: text("Planned for later", "Запланировано позже")
  };
  return statuses[status] || statuses["not-used"];
}

function clientUseBadge(status) {
  const className = status === "active" ? "client-active" : status === "testing" ? "client-testing" : "client-muted";
  return `<span class="client-use ${className}">${escapeHtml(clientUseLabel(status))}</span>`;
}

function toolInput(label, id, value, placeholder = "") {
  return `<label>${escapeHtml(label)}<input id="${escapeAttr(id)}" value="${escapeAttr(value || "")}" placeholder="${escapeAttr(placeholder)}" /></label>`;
}

function clientUseSelect(label, id, selectedValue) {
  const options = [
    ["active", text("Client uses now", "Клиент уже использует")],
    ["testing", text("Client is testing", "Клиент тестирует")],
    ["not-used", text("Not used by client", "Клиент не использует")],
    ["planned", text("Planned for later", "Запланировано позже")]
  ];

  return `
    <label>${escapeHtml(label)}
      <select id="${escapeAttr(id)}">
        ${options.map(([value, labelText]) => `<option value="${escapeAttr(value)}" ${value === selectedValue ? "selected" : ""}>${escapeHtml(labelText)}</option>`).join("")}
      </select>
    </label>
  `;
}

function toolSelect(label, id, selectedValue) {
  const options = [
    ["site", text("Website / CMS", "Сайт / CMS")],
    ["social", text("Social network", "Соцсеть")],
    ["crm", "CRM"],
    ["analytics", text("Analytics", "Аналитика")],
    ["email", "Email"],
    ["sheet", text("Spreadsheet", "Таблица")],
    ["other", text("Other", "Другое")]
  ];

  return `
    <label>${escapeHtml(label)}
      <select id="${escapeAttr(id)}">
        ${options.map(([value, labelText]) => `<option value="${escapeAttr(value)}" ${value === selectedValue ? "selected" : ""}>${escapeHtml(labelText)}</option>`).join("")}
      </select>
    </label>
  `;
}

function toolPermissionLabel(permission) {
  const labels = {
    read: text("Read only", "Только читать"),
    prepare: text("Prepare materials", "Готовить материалы"),
    approval: text("Send to approval", "Отправлять на согласование"),
    publish: text("Publish after approval", "Публиковать после согласования")
  };
  return labels[permission] || permission;
}

function toolStatusBadge(status) {
  const meta = toolStatusMeta(status);
  return `<span class="tool-status ${meta.className}">${escapeHtml(meta.label)}</span>`;
}

function toolStatusMeta(status) {
  const statuses = {
    connected: { label: text("Connected", "Подключено"), className: "connected" },
    "needs-setup": { label: text("Needs setup", "Нужно настроить"), className: "needs-setup" },
    "not-used": { label: text("Not used", "Не используем"), className: "not-used" },
    later: { label: text("Later", "Позже"), className: "later" }
  };
  return statuses[status] || statuses["needs-setup"];
}

function getApprovalContext(item) {
  const calendarItem = state.calendar.find((entry) => entry.id === item.target_id || entry.id === item.calendar_item_id);
  const contentItem =
    state.content.find((entry) => entry.id === item.target_id || entry.id === item.content_item_id || entry.id === calendarItem?.content_item_id) ||
    null;
  const channel = calendarItem?.channel || contentItem?.channel || channelFromScope(item.scope);
  const title = approvalTitle(item, calendarItem, contentItem, channel);
  const when = calendarItem?.scheduled_for ? formatDate(calendarItem.scheduled_for) : tr("not scheduled");
  const riskFlags = normalizeFlags(item.risk_flags);
  const requestedBy = ownerActor(item.requested_by);
  const assetType = materialKind(contentItem?.content_type || calendarItem?.channel || item.scope || item.target_type);
  const previewText = buildPreviewText(item, calendarItem, contentItem, channel);
  const localEvents = state.activity.filter((event) => event.approvalId === item.id);
  const audit = [
    {
      at: item.created_at ? formatDate(item.created_at) : "Today",
      actor: requestedBy,
      event: text("Prepared material and asked for approval before public use.", "Подготовила материал и запросила согласование перед публикацией.")
    },
    ...localEvents.map((event) => ({
      ...event,
      actor: ownerActor(event.actor),
      event: tr(labelize(event.event))
    })),
    ...(item.decided_at
      ? [
          {
            at: formatDate(item.decided_at),
            actor: ownerActor(item.decided_by || "Human reviewer"),
            event: `${labelize(item.status)}${item.decision_note ? `: ${item.decision_note}` : ""}`
          }
        ]
      : [])
  ];

  return {
    title,
    channel,
    when,
    source: calendarItem || contentItem || null,
    assetType,
    requestedBy,
    reason: approvalReason(item, channel),
    outcome: approvalOutcome(item, channel),
    riskFlags,
    previewText,
    checklist: riskChecklist(item, riskFlags, channel, calendarItem, contentItem),
    audit
  };
}

function buildPreviewText(item, calendarItem, contentItem, channel) {
  if (item.preview) return item.preview;
  if (contentItem?.metadata?.preview) return contentItem.metadata.preview;
  if (channel === "telegram") {
    return text(
      [
        "AgentResult turns B2B growth from scattered content tasks into a clear weekly system.",
        "",
        "What it does:",
        "- turns the offer into pages and topics",
        "- prepares useful drafts without SEO spam",
        "- asks for approval before public publishing",
        "- assembles a weekly material pack even before integrations are connected",
        "",
        "Next step: review the launch pack and approve the first public post."
      ].join("\n"),
      [
        "AgentResult превращает B2B-продвижение из набора разрозненных задач в понятную недельную систему.",
        "",
        "Что она делает:",
        "- превращает оффер в страницы и темы",
        "- готовит полезные черновики без SEO-спама",
        "- спрашивает согласование перед публичной публикацией",
        "- собирает недельный пакет материалов даже до подключения интеграций",
        "",
        "Следующий шаг: проверить стартовый пакет и согласовать первый публичный пост."
      ].join("\n")
    );
  }
  if (channel === "website") {
    return text(
      "H1: AI Growth OS for B2B companies\nMeta: Build demand maps, evidence-backed materials and approval-safe publishing workflows without creating SEO spam.\nPrimary CTA: Build the first content pack",
      "H1: AI Growth OS для B2B-компаний\nMeta: Карта спроса, доказательные материалы и безопасные approval-first публикации без SEO-спама.\nГлавный CTA: Собрать первый контент-пакет"
    );
  }
  if (channel === "email") {
    return text(
      "Subject: A safer start for AgentResult growth automation\nBody: Start with one offer, one weekly pack and one approval queue. Manual handoff first, then result tracking.",
      "Тема: Безопасный старт автоматизации роста AgentResult\nТело: Начните с одного оффера, одного недельного пакета и одной очереди согласований. Сначала ручная передача, затем контроль результата."
    );
  }
  return calendarItem?.title || contentItem?.title || item.summary || text("Preview will appear when a draft or publishing item is connected.", "Предпросмотр появится, когда будет связан черновик или пункт календаря.");
}

function renderAssetPreview(context) {
  return `<pre class="asset-preview-text">${escapeHtml(context.previewText)}</pre>`;
}

function contentStatusForDecision(status) {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  return "draft";
}

function approvalReason(item, channel) {
  const channelName = displayChannel(channel);
  if (item.scope === "sensitive_claim") return text("This contains claims that need proof or human review before public use.", "Здесь есть утверждения, которым нужны доказательства или человеческая проверка до публикации.");
  if (item.scope === "social_post") return text(`This will be posted to ${channelName}; public channel publishing always requires approval.`, `Это уйдёт в ${channelName}; публичные публикации всегда проходят согласование.`);
  if (item.scope === "publish") return text("This lets the material move to publishing or the weekly material pack.", "Это разрешает материалу перейти к публикации или недельному пакету материалов.");
  return text("This action affects public-facing growth assets and needs a human decision.", "Это влияет на публичные growth-материалы, поэтому нужно решение человека.");
}

function approvalOutcome(item, channel) {
  const channelName = displayChannel(channel);
  if (item.scope === "publish") return text(`The material can be moved to the publishing plan for ${channelName}.`, `Материал можно поставить в план публикаций для ${channelName}.`);
  if (item.scope === "social_post") return text(`The ${channelName} post can move from review to the publishing plan.`, `Пост для ${channelName} сможет перейти из проверки в план публикаций.`);
  if (item.scope === "sensitive_claim") return text("The draft can keep the claim; otherwise it must be rewritten or supported with proof.", "Черновик сможет оставить утверждение; иначе его нужно переписать или подкрепить proof.");
  return text("The linked workflow can proceed to the next status.", "Связанный workflow сможет перейти в следующий статус.");
}

function riskChecklist(item, flags, channel, calendarItem, contentItem) {
  return [
    {
      ok: Boolean(calendarItem || contentItem),
      label: text("The exact material is linked", "Материал связан с заявкой"),
      note: calendarItem || contentItem ? text("You can open the source text or calendar item.", "Можно открыть исходный текст или пункт календаря.") : text("Link the exact draft or calendar item before publishing.", "Перед публикацией нужно связать черновик или пункт календаря.")
    },
    {
      ok: Boolean(channel && channel !== "unknown"),
      label: text("Channel and date are clear", "Канал и дата понятны"),
      note: channel ? text(`Target channel: ${displayChannel(channel)}.`, `Канал: ${displayChannel(channel)}.`) : text("Choose a publishing channel.", "Выберите канал публикации.")
    },
    {
      ok: !flags.some((flag) => ["public claim", "sensitive claim", "proof required"].includes(flag)),
      label: text("No unsupported revenue promise", "Нет обещания гарантированной выручки"),
      note: flags.includes("proof required") ? text("Add proof or soften the claim.", "Добавьте доказательство или смягчите формулировку.") : text("No risky revenue guarantee is visible.", "Рискованного обещания выручки не видно.")
    },
    {
      ok: item.scope !== "sensitive_claim",
      label: text("Figures and names are confirmed", "Цифры и имена подтверждены"),
      note: item.scope === "sensitive_claim" ? text("Proof or rewrite is required before approval.", "Перед согласованием нужно доказательство или переписывание.") : text("No unconfirmed metrics or client names are visible.", "Неподтверждённых цифр и имён клиентов не видно.")
    },
    {
      ok: true,
      label: text("Tone matches the company", "Тон соответствует компании"),
      note: text("Practical, specific, without hype.", "Практично, конкретно, без хайпа.")
    }
  ];
}

function normalizeFlags(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function channelFromScope(scope) {
  if (scope === "newsletter_send") return "email";
  if (scope === "social_post") return "social";
  if (scope === "publish") return "publishing";
  return "unknown";
}

function approvalTitle(item, calendarItem = null, contentItem = null, channel = "") {
  const raw = calendarItem?.title || contentItem?.title || item?.summary || "";
  const lower = raw.toLowerCase();
  const channelName = displayChannel(channel || calendarItem?.channel || contentItem?.channel || channelFromScope(item?.scope));
  const linkedTitle = calendarItem?.title || contentItem?.title;

  if (linkedTitle) return linkedTitle;
  if (lower.includes("telegram") || channel === "telegram") return text("Telegram post publication", "Публикация Telegram-поста");
  if (lower.includes("comparison")) return text("Comparison page claims", "Утверждения на странице сравнения");
  if (lower.includes("weekly") || lower.includes("pack")) return text("Weekly material pack", "Недельный пакет материалов");
  if (item?.scope === "sensitive_claim") return text("Risky claim in public material", "Рискованное утверждение в публичном материале");
  if (item?.scope === "publish") return text(`Publication for ${channelName}`, `Публикация: ${channelName}`);
  return raw || text("Material approval", "Согласование материала");
}

function ownerActor(value) {
  const raw = String(value || "").trim();
  if (!raw) return text("System", "Система");
  if (/human|reviewer|owner|egor|егор/i.test(raw)) return text("Human reviewer", "Человек-ревьюер");
  return text("System", "Система");
}

function ownerActivityEvent(event) {
  const raw = String(event || "");
  if (/approval|согласован/i.test(raw)) return text("Prepared a material for approval", "Подготовлен материал на согласование");
  if (/public-channel|контур согласования/i.test(raw)) return text("Checked public publishing rules", "Проверены правила публичной публикации");
  if (/package|pack|manual|недельный пакет/i.test(raw)) return text("Assembled a weekly material pack", "Собран недельный пакет материалов");
  return tr(raw);
}

function materialKind(value) {
  const kind = labelize(value);
  if (kind.includes("telegram")) return text("Telegram post", "Пост Telegram");
  if (kind.includes("landing") || kind.includes("website")) return text("Website page", "Страница сайта");
  if (kind.includes("email") || kind.includes("newsletter")) return text("Email newsletter", "Email-рассылка");
  if (kind.includes("social")) return text("Social post", "Пост в соцсети");
  if (kind.includes("publish")) return text("Publication", "Публикация");
  if (kind.includes("comparison")) return text("Comparison page", "Страница сравнения");
  return text("Public material", "Публичный материал");
}

function buildTodayActions(pending, reviewContent) {
  const actions = [
    ...pending.map((item) => {
      const context = getApprovalContext(item);
      return {
        title: text(`Decide: ${context.title}`, `Решить: ${context.title}`),
        meta: text("Public publishing is blocked until you decide.", "Публичная публикация ждёт вашего решения."),
        actionLabel: text("Open", "Открыть"),
        action: "go-approval",
        id: item.id
      };
    }),
    ...reviewContent.map((item) => ({
      title: text(`Review draft: ${item.title}`, `Проверить черновик: ${item.title}`),
      meta: text(`${labelize(item.channel || item.content_type || "material")} · next step: ${nextContentAction(item.status)}`, `${tr(labelize(item.channel || item.content_type || "material"))} · следующий шаг: ${tr(nextContentAction(item.status))}`),
      actionLabel: text("Review", "Проверить"),
      action: "go-content",
      id: item.id
    }))
  ];

  if (!actions.length) {
    actions.push(
      {
        title: text("Create the first client acquisition topic", "Создать первую тему для привлечения клиентов"),
        meta: text("Start with product, pain, comparison and lead magnet opportunities.", "Начните с продукта, боли, сравнения и лид-магнита."),
        actionLabel: text("Open", "Открыть"),
        action: "go-demand-map",
        id: "demand"
      },
      {
        title: text("Assemble a weekly material pack", "Собрать недельный пакет материалов"),
        meta: text("Prepare one week of approved texts for manual publishing.", "Подготовьте неделю утверждённых текстов для ручной публикации."),
        actionLabel: text("Build", "Собрать"),
        action: "go-manual-export",
        id: "pack"
      }
    );
  }

  return actions.slice(0, 5);
}

function automationRow(label, description, value) {
  return `
    <div class="automation-row">
      <div>
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(description)}</span>
      </div>
      <div class="automation-meter" aria-label="${escapeAttr(`${label}: ${value}%`)}"><span style="width:${value}%"></span></div>
    </div>
  `;
}

function nextContentAction(status) {
  const actions = {
    idea: "generate research",
    brief: "write draft",
    draft: "send to review",
    review: "approve or request changes",
    approved: "schedule",
    scheduled: "publish/export"
  };
  return actions[status] || "choose next step";
}

function metricCard(label, value, note, tone = "") {
  return `<article class="metric-panel ${tone}"><span>${escapeHtml(tr(label))}</span><strong>${escapeHtml(String(value))}</strong><p>${escapeHtml(tr(note))}</p></article>`;
}

function queuePanel(title, rows) {
  return `<article class="panel"><div class="panel-heading compact"><h3>${escapeHtml(tr(title))}</h3></div><div class="stack-list">${rows.join("") || `<p class="empty-note">${tr("Nothing here.")}</p>`}</div></article>`;
}

function row(title, meta, actionLabel, action, id) {
  return `
    <div class="list-item">
      <div>
        <strong>${escapeHtml(title || "Untitled")}</strong>
        <span>${escapeHtml(tr(meta || ""))}</span>
      </div>
      <button class="button secondary" data-action="${escapeAttr(action)}" data-id="${escapeAttr(id || "")}">${escapeHtml(tr(actionLabel))}</button>
    </div>
  `;
}

function pipelineRows() {
  const statuses = ["idea", "brief", "draft", "review", "approved", "scheduled"];
  return statuses.map((status) => {
    const count = state.content.filter((item) => item.status === status).length;
    return row(labelize(status), `${count} items`, count ? "Open" : "Add", "go-content", status);
  });
}

function readyToPublishRows() {
  const ready = [
    ...state.content.filter((item) => ["review", "approved", "scheduled"].includes(item.status)).map((item) => ({
      id: item.id,
      title: item.title,
      meta: `${displayChannel(item.channel || item.content_type || "material")} · ${tr(labelize(item.status))}`,
      action: "go-content",
      label: item.status === "review" ? text("Review", "Проверить") : text("Open", "Открыть")
    })),
    ...state.calendar.filter((item) => ["review", "scheduled"].includes(item.status)).map((item) => ({
      id: item.id,
      title: item.title,
      meta: `${displayChannel(item.channel || "channel")} · ${item.scheduled_for || tr("not scheduled")}`,
      action: "go-calendar",
      label: text("Open", "Открыть")
    }))
  ];

  return ready.slice(0, 5).map((item) => row(item.title, item.meta, item.label, item.action, item.id));
}

function systemDoneRows() {
  const fallback = [
    [text("Found client acquisition topics", "Найдено тем для привлечения клиентов"), text(`${state.demand.length} opportunities`, `${state.demand.length} возможностей`)],
    [text("Prepared materials", "Подготовлено материалов"), text(`${state.content.length} drafts and assets`, `${state.content.length} черновиков и материалов`)],
    [text("Created publication plan", "Создан план публикаций"), text(`${state.calendar.length} calendar items`, `${state.calendar.length} пунктов календаря`)]
  ];

  const activityRows = state.activity.slice(0, 3).map((item) => [
    ownerActivityEvent(item.event),
    text(`${ownerActor(item.actor)} · ${item.at}`, `${ownerActor(item.actor)} · ${tr(item.at)}`)
  ]);

  return (activityRows.length ? activityRows : fallback)
    .map(([title, meta], index) => row(title, meta, text("View", "Смотреть"), "go-analytics", `done-${index}`));
}

function taskQueueRows() {
  const tasks = state.tasks.slice(0, 5);
  if (!tasks.length) {
    return [
      row(
        text("Create first operator task", "Создать первую операторскую задачу"),
        text("Turn a decision, metric or missing access into work.", "Превратить решение, метрику или недостающий доступ в работу."),
        text("Create", "Создать"),
        "create-task",
        "first-task"
      )
    ];
  }
  return tasks.map((task) => row(task.title, `${task.owner} · ${tr(labelize(task.status || "next"))}`, task.status === "done" ? text("View", "Смотреть") : text("Done", "Готово"), task.status === "done" ? "go-analytics" : "complete-task", task.id));
}

function demandProblem(item) {
  const type = labelize(item.item_type || "");
  if (type.includes("comparison")) return text("Helps compare options without vague promises", "Помогает сравнить варианты без мутных обещаний");
  if (type.includes("pain")) return text("Explains a painful situation and the way out", "Объясняет боль и понятный выход");
  if (type.includes("tool")) return text("Turns interest into a lead magnet or audit", "Превращает интерес в лид-магнит или аудит");
  if (type.includes("region")) return text("Shows relevance for a specific market", "Показывает релевантность для конкретного рынка");
  return item.intent || text("Shows why this offer matters", "Показывает, зачем нужен оффер");
}

function demandNextAction(item) {
  const status = item.status || "idea";
  if (status === "idea") return text("Research search intent", "Изучить спрос");
  if (status === "research") return text("Prepare page brief", "Подготовить ТЗ страницы");
  if (status === "brief") return text("Write draft", "Написать черновик");
  if (status === "review") return text("Approve or request changes", "Согласовать или запросить правки");
  if (status === "approved") return text("Schedule publication", "Запланировать публикацию");
  return text("Improve from results", "Усилить по результатам");
}

function materialGoal(item) {
  const type = labelize(item.content_type || item.channel || "");
  if (type.includes("telegram")) return text("Explain the offer and start demand", "Объяснить оффер и запустить спрос");
  if (type.includes("landing")) return text("Convert search intent into a request", "Превратить спрос в заявку");
  if (type.includes("article")) return text("Build trust through a deeper argument", "Усилить доверие через развёрнутую аргументацию");
  return text("Move the buyer one step closer", "Подвинуть клиента на один шаг ближе");
}

function materialAudience(item) {
  return item.audience || item.persona || text("B2B owner or operator", "Собственник или оператор B2B");
}

function materialBrief(item) {
  const brief = item.metadata?.brief || item.metadata?.goal || item.metadata?.note || "";
  if (brief) return String(brief).slice(0, 120);
  return text("Brief not prepared yet", "Бриф ещё не подготовлен");
}

function materialProofLine(item) {
  const proof = item.metadata?.proof || item.metadata?.source || "";
  return `<span>${escapeHtml(text("Proof", "Доказательство"))}: ${escapeHtml(proof ? String(proof).slice(0, 120) : text("Needs proof before strong claims", "Нужно доказательство перед сильными утверждениями"))}</span>`;
}

function materialWorkflowFacts(item) {
  const approval = state.approvals.find((entry) => (entry.target_id === item.id || entry.content_item_id === item.id) && entry.status === "pending");
  const calendar = state.calendar.find((entry) => entry.content_item_id === item.id);
  const facts = [];
  if (approval) facts.push(text("Waiting for owner approval", "Ждёт согласования собственника"));
  if (calendar) facts.push(`${displayChannel(calendar.channel || "channel")} · ${formatDate(calendar.scheduled_for)}`);
  if (!facts.length) facts.push(text("Not yet linked to approval or publishing plan", "Пока не связан с согласованием или планом публикаций"));
  return `<div class="material-workflow-facts">${facts.map((fact) => `<span>${escapeHtml(fact)}</span>`).join("")}</div>`;
}

function materialPrimaryAction(item) {
  if (item.status === "approved") return { action: "schedule-content", label: text("Schedule material", "Запланировать") };
  if (item.status === "review") return { action: "go-approvals", label: text("Open approvals", "Открыть согласования") };
  if (item.status === "scheduled" || item.status === "published") return { action: "go-calendar", label: text("Open calendar", "Открыть календарь") };
  return { action: "open-content-detail", label: text("Open material", "Открыть материал") };
}

function miniSection(title, items) {
  return `<article class="panel compact-panel"><div class="panel-heading compact"><h3>${escapeHtml(title)}</h3></div><div class="stack-list">${items.map((item) => `<div class="mini-row">${escapeHtml(item)}</div>`).join("")}</div></article>`;
}

function table(headers, rows) {
  if (!rows.length) return `<p class="empty-note">No records yet.</p>`;
  return `
    <div class="data-table" style="--cols:${headers.length}">
      ${headers.map((header) => `<div class="table-head">${escapeHtml(tr(header))}</div>`).join("")}
      ${rows.flatMap((rowCells) => rowCells.map((cell) => {
        const isHtml = typeof cell === "string" && cell.trim().startsWith("<");
        return `<div class="table-cell">${isHtml ? cell : escapeHtml(tr(labelize(cell)))}</div>`;
      })).join("")}
    </div>
  `;
}

function field(label, id, value) {
  return `<label>${escapeHtml(tr(label))}<input id="${escapeAttr(id)}" value="${escapeAttr(value || "")}" /></label>`;
}

function numberField(label, id, value) {
  return `<label>${escapeHtml(tr(label))}<input id="${escapeAttr(id)}" type="number" min="0" step="1" value="${escapeAttr(value || 0)}" /></label>`;
}

function selectField(label, id, options, selectedValue) {
  return `
    <label>${escapeHtml(tr(label))}
      <select id="${escapeAttr(id)}">
        ${options.map(([value, labelText]) => `<option value="${escapeAttr(value)}" ${value === selectedValue ? "selected" : ""}>${escapeHtml(labelText)}</option>`).join("")}
      </select>
    </label>
  `;
}

function statusOptions() {
  return [
    ["idea", text("Idea", "Идея")],
    ["brief", text("Brief", "Бриф")],
    ["draft", text("Draft", "Черновик")],
    ["review", text("Review", "Проверка")],
    ["approved", text("Approved", "Согласовано")],
    ["scheduled", text("Scheduled", "Запланировано")],
    ["published", text("Published", "Опубликовано")]
  ];
}

function textarea(label, id, value) {
  return `<label>${escapeHtml(tr(label))}<textarea id="${escapeAttr(id)}" rows="4">${escapeHtml(value || "")}</textarea></label>`;
}

function textValue(value) {
  return Array.isArray(value) ? value.join("\n") : value || "";
}

function statusChip(status) {
  return `<span class="status-chip">${escapeHtml(tr(labelize(status)))}</span>`;
}

function labelize(value) {
  return String(value || "").replaceAll("_", " ").replaceAll("-", " ");
}

function displayChannel(value) {
  const label = labelize(value || "channel").toLowerCase();
  if (label === "manual export" || label === "manual") return text("material pack", "пакет материалов");
  if (label === "vc") return "VC.ru";
  if (label === "telegram") return "Telegram";
  if (label === "website") return text("website", "сайт");
  if (label === "social") return text("social channels", "соцсети");
  if (label === "publishing") return text("publishing plan", "план публикаций");
  return tr(label);
}

function formatDate(value) {
  if (!value) return "not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(currentLang === "ru" ? "ru-RU" : "en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function loadLocalJson(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function saveLocalJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function syncWorkspaceState(partial = {}) {
  persistWorkspaceState(partial).catch(() => {});
}

function getSelectedApproval() {
  return state.approvals.find((item) => item.id === state.selectedApprovalId) || state.approvals[0] || null;
}

function approvalIdForTarget(targetId = "") {
  if (!targetId) return "";
  const approval = state.approvals.find((item) => item.id === targetId || item.target_id === targetId);
  return approval?.id || "";
}

function bindScreenEvents() {
  elements.screenRoot.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action, button.dataset.id));
  });
  elements.routeActions.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action, button.dataset.id));
  });
  elements.modalRoot.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action, button.dataset.id));
  });
}

async function handleAction(action, id) {
  const selected = getSelectedApproval();
  const actionHandlers = {
    "refresh-data": loadData,
    "open-help": () => {
      state.helpOpen = true;
      render();
    },
    "close-help": () => {
      state.helpOpen = false;
      localStorage.setItem("aiGrowthOsHelpSeen", "true");
      render();
    },
    "go-approvals": () => {
      state.helpOpen = false;
      localStorage.setItem("aiGrowthOsHelpSeen", "true");
      openPublicationTab("approvals", approvalIdForTarget(id));
    },
    "go-approval": () => {
      openPublicationTab("approvals", id);
    },
    "set-publication-tab": () => openPublicationTab(id),
    "set-settings-tab": () => openSettingsTab(id),
    "select-tool": () => {
      state.selectedToolId = id || "crm";
      openSettingsTab("tools");
    },
    "new-tool": () => {
      state.selectedToolId = "custom";
      openSettingsTab("tools");
    },
    "go-route": () => setRoute(id || "overview"),
    "go-content": () => setRoute("content-pipeline"),
    "go-demand-map": () => setRoute("growth-plan"),
    "go-offer-brain": () => setRoute("offer-brain"),
    "go-analytics": () => setRoute("analytics"),
    "go-calendar": () => openPublicationTab("calendar"),
    "complete-task": () => completeTask(id),
    "go-settings": () => setRoute("settings"),
    "go-manual-export": () => openPublicationTab("pack"),
    "save-offer": saveOffer,
    "create-setup-tasks": createSetupTasks,
    "generate-demand": requestDemandMap,
    "add-demand": () => openFormModal("demand"),
    "new-content": () => openFormModal("content"),
    "generate-brief": prepareNextBrief,
    "select-approval": () => {
      state.selectedApprovalId = id;
      render();
    },
    "open-approve-modal": () => openDecisionModal("approve"),
    "open-reject-modal": () => openDecisionModal("reject"),
    "open-changes-modal": () => openDecisionModal("request-changes"),
    "submit-decision": () => submitDecision(),
    "submit-demand-form": () => submitDemandForm(),
    "submit-content-form": () => submitContentForm(),
    "submit-content-edit-form": () => submitContentEditForm(),
    "submit-metrics-form": () => submitMetricsForm(),
    "submit-content-comment": () => submitContentComment(id),
    "submit-schedule-form": () => submitScheduleForm(),
    "submit-calendar-note-form": () => submitCalendarNoteForm(),
    "content-from-demand": () => createContentFromDemand(id),
    "task-from-demand": () => createTaskFromDemand(id),
    "publish-from-demand": () => publishFromDemand(id),
    "send-content-approval": () => sendContentToApproval(id),
    "schedule-content": () => openFormModal("schedule", { contentId: id }),
    "export-content": () => exportContentItem(id),
    "close-modal": () => closeModal(),
    "open-source": () => openSelectedSource(),
    "open-risk-checklist": () => showToast(text("Checklist is visible in the approval detail.", "Чеклист уже открыт в деталях согласования.")),
    "open-content-detail": () => openContentDetail(id),
    "schedule-item": () => openFormModal("schedule"),
    "export-calendar": exportCalendarCsv,
    "mark-calendar-published": () => updateCalendarStatus(id, "published"),
    "mark-calendar-exported": () => updateCalendarStatus(id, "handed_off"),
    "edit-calendar-note": () => openFormModal("calendarNote", { itemId: id }),
    "assemble-pack": assemblePack,
    "download-pack": downloadPack,
    "copy-pack": copyPackTexts,
    "open-calendar": () => openPublicationTab("calendar"),
    "preview-pack-item": () => {
      state.selectedPackItem = id || state.selectedPackItem;
      render();
    },
    "create-task": () => openFormModal("task"),
    "enable-autopilot": () => showToast(text("Autopilot settings are saved locally for this prototype.", "Настройки автопилота пока сохраняются локально в прототипе.")),
    "save-autopilot": saveAutopilotSettings,
    "save-channels": saveChannelSettings,
    "save-tool": saveToolSetup,
    "request-tool-owner": requestToolOwner,
    "import-metrics": () => openFormModal("metrics"),
    "generate-improvements": generateImprovementTasks,
    "submit-task-form": submitTaskForm
  };

  await actionHandlers[action]?.();
}

async function copyPackTexts() {
  const packText = packageAssets()
    .map((asset) => [`# ${asset.label}`, asset.preview].join("\n\n"))
    .join("\n\n---\n\n");

  try {
    await navigator.clipboard.writeText(packText);
    showToast(text("Package texts copied.", "Тексты пакета скопированы."));
  } catch {
    showToast(text("Could not copy package texts in this browser.", "Не удалось скопировать тексты пакета в этом браузере."));
  }
}

async function createContentFromDemand(id) {
  const demand = state.demand.find((item) => item.id === id);
  if (!demand) return;
  const item = contentDraftFromDemand(demand, "brief");
  const saved = await saveContentItem(item);
  state.content = mergeLocalItems(state.content, [saved]);
  state.metrics.content_items = state.content.length;
  addActivity("Growth Orchestrator", `Created material from demand: ${demand.title}`);
  showToast(text("Material created from growth plan.", "Материал создан из плана роста."));
  setRoute("content-pipeline");
}

async function createTaskFromDemand(id) {
  const demand = state.demand.find((item) => item.id === id);
  if (!demand) return;
  await addLocalTask({
    title: text(`Prepare demand asset: ${demand.title}`, `Подготовить материал спроса: ${demand.title}`),
    owner: "Growth Orchestrator",
    status: "next",
    note: demandBusinessReason(demand),
    source: "growth-plan",
    targetType: "demand_map_item",
    targetId: demand.id
  });
  addActivity("Growth Orchestrator", `Created task from demand: ${demand.title}`);
  showToast(text("Growth task created.", "Задача по росту создана."));
  setRoute("overview");
}

async function publishFromDemand(id) {
  const demand = state.demand.find((item) => item.id === id);
  if (!demand) return;
  const saved = await saveContentItem(contentDraftFromDemand(demand, "review"));
  state.content = mergeLocalItems(state.content, [saved]);
  await sendContentToApproval(saved.id, { silent: true });
  openFormModal("schedule", { contentId: saved.id });
}

function contentDraftFromDemand(demand, status = "brief") {
  const contentType = demandContentType(demand);
  return {
    id: `local-content-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    title: demand.title,
    content_type: contentType,
    channel: contentType === "telegram_post" ? "telegram" : "website",
    status,
    owner: "Growth Orchestrator",
    audience: demand.audience || text("B2B owner", "Собственник B2B"),
    metadata: {
      owner: "Growth Orchestrator",
      brief: [
        demandBusinessReason(demand),
        demandProblem(demand),
        text("Use practical owner language: money, requests, tasks, control, result.", "Писать языком собственника: деньги, заявки, задачи, контроль, результат."),
        text("Avoid guaranteed revenue, guaranteed debt recovery and autonomous public actions.", "Не обещать гарантированный рост, возврат дебиторки и автономные публичные действия.")
      ].join("\n"),
      proof: demand.notes?.proof || text("Use AgentResult WebApp prototype and build-in-public story.", "Использовать WebApp-прототип AgentResult и build-in-public историю.")
    },
    created_at: new Date().toISOString()
  };
}

function demandContentType(demand) {
  const type = labelize(demand.item_type || "");
  if (type.includes("post")) return "telegram_post";
  if (type.includes("lead")) return "lead_magnet";
  if (type.includes("article")) return "article_outline";
  return "landing_page";
}

async function sendContentToApproval(id, options = {}) {
  const item = state.content.find((entry) => entry.id === id);
  if (!item) return;
  item.status = "review";
  item.updated_at = new Date().toISOString();
  await saveContentItem(item);
  state.content = mergeLocalItems(state.content, [item]);
  const existing = state.approvals.find((approval) => approval.target_type === "content_item" && approval.target_id === item.id && approval.status === "pending");
  if (!existing) {
    let approval = {
      id: `local-approval-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      summary: text(`Approve ${item.title}`, `Согласовать: ${item.title}`),
      scope: item.channel === "telegram" ? "social_post" : "publish",
      target_type: "content_item",
      target_id: item.id,
      status: "pending",
      risk_flags: approvalFlagsForContent(item),
      requested_by: "Publishing QA",
      preview: item.metadata?.body || item.metadata?.brief || "",
      created_at: new Date().toISOString()
    };
    if (state.online && !String(item.id || "").startsWith("local-")) {
      const result = await api("/approvals", {
        method: "POST",
        body: JSON.stringify({
          scope: approval.scope,
          targetType: approval.target_type,
          targetId: item.id,
          riskFlags: approval.risk_flags,
          summary: approval.summary
        })
      }).catch(() => null);
      if (result?.data) approval = { ...approval, ...result.data };
    }
    if (String(approval.id || "").startsWith("local-")) {
      state.localApprovals.unshift(approval);
      saveLocalJson("aiGrowthOsLocalApprovals", state.localApprovals);
    }
    state.approvals = mergeLocalItems(state.approvals, [approval]);
    state.selectedApprovalId = approval.id;
  }
  state.metrics.pending_approvals = state.approvals.filter((approval) => approval.status === "pending").length;
  addActivity("Publishing QA", `Sent material to approval: ${item.title}`);
  if (!options.silent) {
    showToast(text("Material sent to approval.", "Материал отправлен на согласование."));
    openPublicationTab("approvals", state.selectedApprovalId);
  }
}

function approvalFlagsForContent(item) {
  const flags = ["public claim"];
  if (item.channel === "telegram" || item.content_type === "telegram_post") flags.push("channel publishing");
  if (!item.metadata?.proof) flags.push("proof required");
  return flags;
}

function exportContentItem(id) {
  const item = state.content.find((entry) => entry.id === id);
  if (!item) return;
  const body = [
    `# ${item.title}`,
    "",
    `${text("Status", "Статус")}: ${tr(labelize(item.status || "idea"))}`,
    `${text("Channel", "Канал")}: ${displayChannel(item.channel || item.content_type)}`,
    `${text("Brief", "Бриф")}:`,
    item.metadata?.brief || "",
    "",
    `${text("Proof", "Доказательство")}:`,
    item.metadata?.proof || "",
    "",
    `${text("Text", "Текст")}:`,
    item.metadata?.body || item.metadata?.preview || ""
  ].join("\n");
  downloadTextFile(`${slugify(item.title)}.txt`, body);
  showToast(text("Material exported as TXT.", "Материал выгружен как TXT."));
}

function slugify(value) {
  return String(value || "agentresult-material")
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "agentresult-material";
}

function prepareNextBrief() {
  const item = state.content.find((entry) => entry.status === "idea") || state.content.find((entry) => entry.status === "draft") || state.content[0];
  if (!item) {
    openFormModal("content");
    return;
  }
  item.status = "brief";
  item.metadata = {
    ...(item.metadata || {}),
    brief: text(
      "Buyer, pain, proof, safe claims, channel, next step.",
      "Кто покупатель, какая боль, какие доказательства, безопасные утверждения, канал, следующий шаг."
    )
  };
  item.updated_at = new Date().toISOString();
  upsertLocalItem("aiGrowthOsLocalContent", state.localContent, item);
  showToast(text(`Brief prepared: ${item.title}`, `Бриф подготовлен: ${item.title}`));
  setRoute("content-pipeline");
}

function exportCalendarCsv() {
  const headers = ["title", "channel", "scheduled_for", "status", "content_item_id"];
  const rows = state.calendar.map((item) => headers.map((key) => csvCell(item[key] || "")).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  downloadTextFile("agentresult-publishing-calendar.csv", csv, "text/csv");
  showToast(text("Publishing plan CSV downloaded.", "CSV плана публикаций скачан."));
}

function saveAutopilotSettings() {
  state.autopilotSettings = Object.fromEntries(
    [...document.querySelectorAll("[data-autopilot-key]")].map((input) => [input.dataset.autopilotKey, input.checked])
  );
  saveLocalJson("aiGrowthOsAutopilotSettings", state.autopilotSettings);
  showToast(text("Autopilot rules saved.", "Правила автопилота сохранены."));
}

function saveChannelSettings() {
  state.channelSettings = Object.fromEntries(
    [...document.querySelectorAll("[data-channel-key]")].map((input) => [input.dataset.channelKey, input.checked])
  );
  saveLocalJson("aiGrowthOsChannelSettings", state.channelSettings);
  showToast(text("Channel rules saved.", "Правила каналов сохранены."));
}

function downloadPack() {
  if (!state.exportAssembled) {
    showToast(text("Assemble the package first.", "Сначала соберите пакет."));
    return;
  }
  const packText = packageAssets()
    .map((asset) => [`# ${asset.label}`, asset.preview].join("\n\n"))
    .join("\n\n---\n\n");
  downloadTextFile("agentresult-weekly-content-pack.txt", packText);
  showToast(text("Material pack downloaded as TXT.", "Пакет материалов скачан как TXT."));
}

async function updateCalendarStatus(id, status) {
  const item = state.calendar.find((entry) => entry.id === id);
  if (!item) return;
  item.status = status;
  item.updated_at = new Date().toISOString();
  let persisted = false;
  if (state.online && !String(id).startsWith("local-calendar")) {
    const result = await api(`/publishing/items/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }).catch(() => null);
    persisted = Boolean(result?.data);
    if (result?.data) state.calendar = mergeLocalItems(state.calendar, [result.data]);
  }
  if (!persisted) upsertLocalItem("aiGrowthOsLocalCalendar", state.localCalendar, item);
  const linkedContent = state.content.find((entry) => entry.id === item.content_item_id);
  if (linkedContent && isShippedStatus(status)) {
    linkedContent.status = status === "published" ? "published" : "scheduled";
    linkedContent.updated_at = new Date().toISOString();
    await persistContentState(linkedContent);
  }
  state.metrics.published_materials = shippedCalendarCount(state.calendar);
  addActivity("Publishing QA", `Updated publication status: ${item.title} -> ${labelize(status)}`);
  showToast(text("Publication status updated.", "Статус публикации обновлён."));
  openPublicationTab("calendar");
}

async function persistContentState(item) {
  const saved = await saveContentItem(item);
  state.content = mergeLocalItems(state.content, [saved]);
  return saved;
}

async function persistCalendarState(item) {
  const saved = String(item.id || "").startsWith("local-calendar")
    ? item
    : (await api(`/publishing/items/${item.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: item.status })
      }).catch(() => null))?.data || item;
  if (saved === item || String(saved.id || "").startsWith("local-calendar")) {
    upsertLocalItem("aiGrowthOsLocalCalendar", state.localCalendar, item);
  }
  state.calendar = mergeLocalItems(state.calendar, [saved]);
  return saved;
}

async function completeTask(id) {
  const task = state.tasks.find((entry) => entry.id === id);
  if (!task) return;
  task.status = "done";
  if (state.online && !String(id).startsWith("local-task")) {
    await api(`/tasks/${id}/approve`, { method: "POST", body: JSON.stringify({}) }).catch(() => null);
  }
  upsertLocalItem("aiGrowthOsLocalTasks", state.localTasks, task);
  addActivity(task.owner || "System", `Completed task: ${task.title}`);
  showToast(text("Task marked done.", "Задача отмечена выполненной."));
  setRoute("overview");
}

function csvCell(value) {
  const raw = String(value ?? "");
  return /[",\n]/.test(raw) ? `"${raw.replaceAll('"', '""')}"` : raw;
}

function downloadTextFile(filename, contents, mimeType = "text/plain") {
  const blob = new Blob([contents], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function packageAssets() {
  return [
    {
      id: "seo",
      label: text("SEO page: AI Growth OS", "SEO-страница: AI Growth OS"),
      preview: text(
        "H1: AI Growth OS for B2B companies\nMeta: Turn an offer into useful pages, proof-backed materials and an approval-safe publishing rhythm.\nCTA: Assemble the first weekly growth pack.",
        "H1: AI Growth OS для B2B-компаний\nMeta: Превратите оффер в полезные страницы, доказательные материалы и безопасный ритм публикаций.\nCTA: Собрать первый недельный пакет роста."
      )
    },
    {
      id: "telegram",
      label: text("Telegram posts: 2", "Посты Telegram: 2"),
      preview: text(
        "Post 1: AI Growth OS is not an AI writer. It is a weekly operating loop: demand map, proof, draft, approval, publication, result.\n\nPost 2: The safest first automation is not automatic publishing. It is a clear approval queue where the owner sees what will go public and why.",
        "Пост 1: AI Growth OS — не «AI-писатель». Это недельный операционный цикл: карта спроса, доказательства, черновик, согласование, публикация, результат.\n\nПост 2: Самая безопасная первая автоматизация — не автопубликация. Это понятная очередь согласований, где собственник видит, что выйдет наружу и зачем."
      )
    },
    {
      id: "vc",
      label: text("VC article: 1", "Статья VC: 1"),
      preview: text(
        "Outline: Why B2B companies need a growth operating system\n1. The content volume trap\n2. Client acquisition topics as an operating model\n3. Proof before claims\n4. Manual distribution as a reliable start\n5. What to automate next",
        "План: зачем B2B-компаниям операционная система роста\n1. Ловушка объёма контента\n2. Темы привлечения клиентов как операционная модель\n3. Доказательства до утверждений\n4. Ручная дистрибуция как надёжный старт\n5. Что автоматизировать дальше"
      )
    },
    {
      id: "email",
      label: text("Email newsletter: 1", "Email-рассылка: 1"),
      preview: text(
        "Subject: A safer start for AgentResult growth automation\n\nBody: Start with one offer, one weekly pack and one approval queue. Manual handoff first, then result tracking.",
        "Тема: Безопасный старт автоматизации роста AgentResult\n\nТело: Начните с одного оффера, одного недельного пакета и одной очереди согласований. Сначала ручная передача, затем контроль результата."
      )
    },
    {
      id: "lead-magnet",
      label: text("Lead magnet: 1", "Лид-магнит: 1"),
      preview: text(
        "AI Growth OS Readiness Checklist\n- Offer clarity\n- ICP and pains\n- Proof assets\n- Demand map coverage\n- Approval owner\n- Manual export readiness",
        "Чеклист готовности к AI Growth OS\n- Ясность оффера\n- Кому продаём и какие боли закрываем\n- Доказательства\n- Покрытие тем привлечения\n- Кто согласует публикации\n- Готовность пакета материалов"
      )
    },
    {
      id: "calendar",
      label: text("Publishing calendar CSV", "Календарь публикаций CSV"),
      preview: text(
        "date,channel,title,status,approval_owner\n2026-05-26,telegram,AI Growth OS launch post,review,Egor\n2026-05-27,website,AI Growth OS overview page,draft,Egor",
        "date,channel,title,status,approval_owner\n2026-05-26,telegram,Launch-пост AI Growth OS,review,Egor\n2026-05-27,website,Обзорная страница AI Growth OS,draft,Egor"
      )
    }
  ];
}

function assemblePack() {
  state.exportAssembled = true;
  syncWorkspaceState({
    exportAssembled: true,
    pack_handoff_note: text(
      "Use this pack only after approval. Manual send, manual publish, then confirm what actually went live.",
      "Использовать пакет только после согласования. Сначала ручная передача, потом ручная публикация, затем подтверждение, что реально вышло."
    )
  });
  addActivity("System", "Assembled weekly material pack preview");
  showToast(text("Package preview assembled. ZIP download will be available after storage is connected.", "Предпросмотр пакета собран. ZIP появится после подключения хранилища."));
  render();
}

function openSelectedSource() {
  const selected = getSelectedApproval();
  const context = selected ? getApprovalContext(selected) : null;
  if (!context?.source) {
    showToast(text("No linked source material yet.", "Исходный материал пока не привязан."));
    return;
  }
  if (selected.target_type === "publishing_calendar_item") {
    openPublicationTab("calendar");
    return;
  }
  if (selected.target_type === "content_item") {
    setRoute("content-pipeline");
    return;
  }
  showToast(text("Source is linked, but its dedicated screen is not built yet.", "Источник связан, но отдельный экран для него ещё не собран."));
}

async function openContentDetail(id = "") {
  if (id && state.content.some((item) => item.id === id)) {
    await loadContentDetail(id);
    openFormModal("contentDetail", { itemId: id });
    return;
  }
  const selected = getSelectedApproval();
  const context = selected ? getApprovalContext(selected) : null;
  const contentId = context?.source?.content_item_id || (selected?.target_type === "content_item" ? selected.target_id : "");
  if (contentId && state.content.some((item) => item.id === contentId)) {
    await loadContentDetail(contentId);
    openFormModal("contentDetail", { itemId: contentId });
    return;
  }
  showToast(text("No text draft is linked to this approval yet.", "К этому согласованию пока не привязана версия текста."));
}

async function loadContentDetail(id) {
  if (!id) return null;
  const fallback = buildContentDetailFallback(id);
  if (state.online) {
    const result = await api(`/content/items/${id}/detail`).catch(() => null);
    if (result?.data) {
      const merged = {
        ...fallback,
        ...result.data,
        item: result.data.item || fallback?.item || null,
        demandItem: result.data.demandItem || fallback?.demandItem || null,
        approvals: result.data.approvals?.length ? result.data.approvals : fallback?.approvals || [],
        calendar: result.data.calendar?.length ? result.data.calendar : fallback?.calendar || [],
        comments: result.data.comments?.length ? result.data.comments : fallback?.comments || []
      };
      if (merged.item) {
        state.contentDetails[id] = merged;
        return merged;
      }
    }
  }
  if (fallback) state.contentDetails[id] = fallback;
  return fallback;
}

function openDecisionModal(action) {
  const selected = getSelectedApproval();
  if (!selected) {
    showToast(text("Select a material first.", "Сначала выберите материал."));
    return;
  }
  state.formModal = null;
  state.decisionModal = { approvalId: selected.id, action };
  render();
}

function openFormModal(type, payload = {}) {
  state.decisionModal = null;
  state.formModal = { type, ...payload };
  render();
}

function closeModal() {
  state.decisionModal = null;
  state.formModal = null;
  render();
}

function submitDemandForm() {
  const title = document.querySelector("#demandTitle")?.value.trim();
  if (!title) {
    showToast(text("Add a topic title.", "Добавьте название темы."));
    return;
  }
  const item = {
    id: `local-demand-${Date.now()}`,
    title,
    item_type: document.querySelector("#demandType")?.value || "product_page",
    intent: "manual",
    audience: document.querySelector("#demandAudience")?.value.trim() || text("B2B owner", "Собственник B2B"),
    status: document.querySelector("#demandStatus")?.value || "idea",
    priority: Math.max(10, 70 - state.localDemand.length * 3),
    notes: { manual: true, proof: document.querySelector("#demandNotes")?.value.trim() || "" },
    created_at: new Date().toISOString()
  };
  state.localDemand.unshift(item);
  state.demand = mergeLocalItems(state.demand, [item]);
  saveLocalJson("aiGrowthOsLocalDemand", state.localDemand);
  state.formModal = null;
  showToast(text("Topic added to the growth plan.", "Тема добавлена в план роста."));
  setRoute("growth-plan");
}

async function submitContentForm() {
  const title = document.querySelector("#contentTitle")?.value.trim();
  if (!title) {
    showToast(text("Add a material title.", "Добавьте название материала."));
    return;
  }
  const item = {
    id: `local-content-${Date.now()}`,
    title,
    content_type: document.querySelector("#contentType")?.value || "telegram_post",
    channel: document.querySelector("#contentChannel")?.value.trim() || "telegram",
    status: document.querySelector("#contentStatus")?.value || "idea",
    owner: document.querySelector("#contentOwner")?.value.trim() || "Egor",
    audience: text("B2B owner", "Собственник B2B"),
    metadata: {
      owner: document.querySelector("#contentOwner")?.value.trim() || "Egor",
      brief: document.querySelector("#contentGoal")?.value.trim() || "",
      body: document.querySelector("#contentBody")?.value.trim() || ""
    },
    created_at: new Date().toISOString()
  };
  const saved = await saveContentItem(item);
  state.content = mergeLocalItems(state.content, [saved]);
  state.metrics.content_items = state.content.length;
  addActivity(item.owner || "Growth Orchestrator", `Created material: ${item.title}`);
  state.formModal = null;
  showToast(text("Material added to the workflow.", "Материал добавлен в workflow."));
  setRoute("content-pipeline");
}

async function submitContentEditForm() {
  const id = document.querySelector("#contentEditId")?.value || "";
  const item = state.content.find((entry) => entry.id === id);
  if (!item) {
    showToast(text("Material was not found.", "Материал не найден."));
    return;
  }
  item.title = document.querySelector("#contentEditTitle")?.value.trim() || item.title;
  item.content_type = document.querySelector("#contentEditType")?.value || item.content_type;
  item.channel = document.querySelector("#contentEditChannel")?.value.trim() || item.channel;
  item.status = document.querySelector("#contentEditStatus")?.value || item.status;
  item.owner = document.querySelector("#contentEditOwner")?.value.trim() || item.owner || item.metadata?.owner;
  item.metadata = {
    ...(item.metadata || {}),
    owner: item.owner,
    brief: document.querySelector("#contentEditBrief")?.value.trim() || "",
    body: document.querySelector("#contentEditBody")?.value.trim() || "",
    proof: document.querySelector("#contentEditProof")?.value.trim() || ""
  };
  item.updated_at = new Date().toISOString();
  const saved = await saveContentItem(item);
  state.content = mergeLocalItems(state.content, [saved]);
  addActivity(item.owner || "Growth Orchestrator", `Saved material: ${item.title}`);
  state.formModal = null;
  showToast(text("Material saved.", "Материал сохранён."));
  setRoute("content-pipeline");
}

async function submitScheduleForm() {
  const contentId = document.querySelector("#scheduleContentId")?.value || "";
  const content = state.content.find((item) => item.id === contentId);
  if (!content) {
    showToast(text("Select a material first.", "Сначала выберите материал."));
    return;
  }
  const status = document.querySelector("#scheduleStatus")?.value || "review";
  const calendarItem = {
    id: `local-calendar-${Date.now()}`,
    content_item_id: content.id,
    title: content.title,
    channel: document.querySelector("#scheduleChannel")?.value.trim() || content.channel || "telegram",
    scheduled_for: document.querySelector("#scheduleDate")?.value.trim() || defaultScheduleDate(),
    status,
    metadata: {
      handoff_note: status === "scheduled"
        ? text("Проверьте канал, формат и финальную публикацию вручную. После выхода отметьте статус как published.", "Check the channel, format and final publication manually. After it goes live, mark it as published.")
        : ""
    },
    created_at: new Date().toISOString()
  };
  content.status = status === "scheduled" ? "scheduled" : "review";
  content.updated_at = new Date().toISOString();
  await saveContentItem(content);
  const savedCalendarItem = await saveCalendarItem(calendarItem);
  state.calendar = mergeLocalItems(state.calendar, [savedCalendarItem]);
  if (status === "review" && String(savedCalendarItem.id || "").startsWith("local-")) {
    const approval = {
      id: `local-approval-${Date.now()}`,
      summary: text(`Approve ${content.title}`, `Согласовать: ${content.title}`),
      scope: "publish",
      target_type: "publishing_calendar_item",
      target_id: savedCalendarItem.id,
      status: "pending",
      risk_flags: ["channel publishing"],
      requested_by: "Publishing QA",
      created_at: new Date().toISOString()
    };
    state.localApprovals.unshift(approval);
    state.approvals = mergeLocalItems(state.approvals, [approval]);
    saveLocalJson("aiGrowthOsLocalApprovals", state.localApprovals);
  }
  state.metrics.calendar_items = state.calendar.length;
  state.metrics.pending_approvals = state.approvals.filter((item) => item.status === "pending").length;
  addActivity("Publishing QA", `Scheduled material: ${content.title}`);
  state.formModal = null;
  showToast(text("Material added to publishing plan.", "Материал добавлен в план публикаций."));
  if (state.online && !String(savedCalendarItem.id || "").startsWith("local-")) await loadData();
  openPublicationTab("calendar");
}

async function submitCalendarNoteForm() {
  const id = document.querySelector("#calendarNoteId")?.value || "";
  const item = state.calendar.find((entry) => entry.id === id);
  if (!item) {
    showToast(text("Calendar item was not found.", "Пункт календаря не найден."));
    return;
  }

  item.metadata = {
    ...(item.metadata || {}),
    handoff_note: document.querySelector("#calendarNoteBody")?.value.trim() || ""
  };
  item.updated_at = new Date().toISOString();

  if (state.online && !String(item.id || "").startsWith("local-calendar")) {
    try {
      const result = await api(`/publishing/items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ metadata: item.metadata })
      });
      if (result?.data) state.calendar = mergeLocalItems(state.calendar, [result.data]);
    } catch {
      upsertLocalItem("aiGrowthOsLocalCalendar", state.localCalendar, item);
    }
  } else {
    upsertLocalItem("aiGrowthOsLocalCalendar", state.localCalendar, item);
  }

  addActivity("Owner", `Updated handoff note: ${item.title}`);
  state.formModal = null;
  showToast(text("Handoff note saved.", "Заметка для передачи сохранена."));
  openPublicationTab("calendar");
}

async function submitMetricsForm() {
  const metrics = {
    leads: numberValue("#metricLeads"),
    tasks_created: numberValue("#metricTasks"),
    published_materials: numberValue("#metricPublished"),
    receivables_in_progress: numberValue("#metricReceivables"),
    promised_payments: numberValue("#metricPromised"),
    recovered_payments: numberValue("#metricRecovered")
  };
  state.metrics = { ...state.metrics, ...metrics };
  saveLocalJson("aiGrowthOsMetrics", metrics);
  if (state.online) {
    const result = await api("/analytics/summary", {
      method: "POST",
      body: JSON.stringify(metrics)
    }).catch(() => null);
    if (result?.data) {
      state.formModal = null;
      showToast(text("Results saved to the system.", "Результаты сохранены в системе."));
      await loadData();
      setRoute("analytics");
      return;
    }
  }
  state.formModal = null;
  showToast(text("Results saved locally.", "Результаты сохранены локально."));
  setRoute("analytics");
}

async function submitContentComment(id = "") {
  const contentId = id || document.querySelector("#contentEditId")?.value || "";
  const body = document.querySelector("#contentCommentBody")?.value.trim() || "";
  if (!contentId || !body) {
    showToast(text("Add a comment first.", "Сначала добавьте комментарий."));
    return;
  }
  let comment = {
    id: `local-comment-${Date.now()}`,
    body,
    user_name: state.me?.name || "Owner",
    created_at: new Date().toISOString()
  };
  if (state.online) {
    const result = await api(`/content/items/${contentId}/comment`, {
      method: "POST",
      body: JSON.stringify({ body })
    }).catch(() => null);
    if (result?.data) comment = { ...comment, ...result.data };
  }
  const detail = state.contentDetails[contentId] || buildContentDetailFallback(contentId);
  if (detail) {
    detail.comments = [comment, ...(detail.comments || [])];
    state.contentDetails[contentId] = detail;
  }
  addActivity(state.me?.name || "Owner", `Оставил комментарий по материалу: ${body}`);
  showToast(text("Comment saved.", "Комментарий сохранён."));
  openFormModal("contentDetail", { itemId: contentId });
}

async function submitTaskForm() {
  const title = document.querySelector("#taskTitle")?.value.trim();
  if (!title) {
    showToast(text("Add a task title.", "Добавьте название задачи."));
    return;
  }
  await addLocalTask({
    title,
    owner: document.querySelector("#taskOwner")?.value || "Growth Orchestrator",
    status: document.querySelector("#taskStatus")?.value || "next",
    note: document.querySelector("#taskNote")?.value.trim() || "",
    source: "manual"
  });
  addActivity("Growth Orchestrator", `Created task: ${title}`);
  state.formModal = null;
  showToast(text("Task created.", "Задача создана."));
  setRoute("overview");
}

function saveToolSetup() {
  const selected = selectedTool();
  const override = {
    name: document.querySelector("#toolName")?.value.trim() || selected.name,
    formType: document.querySelector("#toolType")?.value || selected.formType,
    type: document.querySelector("#toolType")?.value || selected.type,
    url: document.querySelector("#toolUrl")?.value.trim() || "",
    owner: document.querySelector("#toolOwner")?.value.trim() || "",
    clientUse: document.querySelector("#toolClientUse")?.value || selected.clientUse,
    status: selected.status === "connected" ? "connected" : "needs-setup",
    limits: document.querySelector("#toolLimits")?.value.trim() || ""
  };
  state.toolOverrides[selected.id] = override;
  saveLocalJson("aiGrowthOsToolOverrides", state.toolOverrides);
  addActivity("Growth Orchestrator", `Saved tool setup: ${override.name}`);
  showToast(text("Tool setup saved locally.", "Настройка инструмента сохранена локально."));
  render();
}

async function saveContentItem(item) {
  if (state.online) {
    try {
      const isLocal = String(item.id || "").startsWith("local-");
      const result = isLocal
        ? await api("/content/items", { method: "POST", body: JSON.stringify(withoutLocalId(item)) })
        : await api(`/content/items/${item.id}`, { method: "PATCH", body: JSON.stringify(withoutLocalId(item)) });
      return result.data || item;
    } catch {
      // Fallback to browser storage if API persistence is not available for this item.
    }
  }
  upsertLocalItem("aiGrowthOsLocalContent", state.localContent, item);
  return item;
}

async function saveCalendarItem(item) {
  if (state.online) {
    try {
      const result = await api("/publishing/schedule", { method: "POST", body: JSON.stringify(withoutLocalId(item)) });
      return result.data || item;
    } catch {
      // Fallback to browser storage if API persistence is not available.
    }
  }
  upsertLocalItem("aiGrowthOsLocalCalendar", state.localCalendar, item);
  return item;
}

function withoutLocalId(item) {
  if (!String(item.id || "").startsWith("local-")) return item;
  const { id, ...rest } = item;
  return rest;
}

async function requestToolOwner() {
  const selected = selectedTool();
  state.toolOverrides[selected.id] = {
    ...(state.toolOverrides[selected.id] || {}),
    owner: text("Access owner needed", "Нужен владелец доступа"),
    status: "needs-setup",
    accessNeeded: true
  };
  saveLocalJson("aiGrowthOsToolOverrides", state.toolOverrides);
  await addLocalTask({
    title: text(`Assign access owner for ${selected.name}`, `Назначить владельца доступа: ${selected.name}`),
    owner: "Owner",
    status: "blocked",
    note: text("Connection cannot move forward until a responsible person is named.", "Подключение не двинется дальше, пока не назначен ответственный."),
    source: "tools"
  });
  addActivity("Growth Orchestrator", `Marked access owner needed: ${selected.name}`);
  showToast(text("Access owner task created.", "Задача на владельца доступа создана."));
  render();
}

async function generateImprovementTasks() {
  const metrics = deriveMetrics(state.metrics);
  const suggestions = [];
  if (!metrics.leads) {
    suggestions.push({
      title: text("Connect first lead source", "Подключить первый источник заявок"),
      owner: "Sales owner",
      status: "next",
      note: text("Leads are still zero, so the growth loop has no demand signal.", "Заявок пока 0, поэтому у цикла роста нет сигнала спроса.")
    });
  }
  if (!metrics.published_materials) {
    suggestions.push({
      title: text("Publish or hand off first approved material", "Опубликовать или передать первый согласованный материал"),
      owner: "Publishing QA",
      status: "next",
      note: text("Prepared assets do not count as results until they leave the system.", "Подготовленные материалы не считаются результатом, пока не вышли наружу.")
    });
  }
  if (!metrics.receivables_in_progress) {
    suggestions.push({
      title: text("Import first receivables list", "Загрузить первый список дебиторки"),
      owner: "Owner",
      status: "next",
      note: text("DebtorPilot needs a CSV/XLSX starting point before follow-up automation.", "DebtorPilot нужен стартовый CSV/XLSX до автоматизации дожима.")
    });
  }
  if (!suggestions.length) {
    suggestions.push({
      title: text("Review strongest performing asset", "Разобрать самый сильный материал"),
      owner: "Growth Orchestrator",
      status: "next",
      note: text("Use current results to choose the next page, post or follow-up.", "Использовать текущие результаты, чтобы выбрать следующую страницу, пост или касание.")
    });
  }
  for (const task of suggestions) {
    await addLocalTask({ ...task, source: "analytics" });
  }
  state.metrics.improvement_tasks = state.tasks.filter((task) => task.source === "analytics").length;
  addActivity("Growth Orchestrator", `Created improvement tasks: ${suggestions.length}`);
  showToast(text("Improvement tasks created.", "Задачи на улучшение созданы."));
  setRoute("analytics");
}

async function addLocalTask(task) {
  const row = {
    id: `local-task-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
    ...task
  };
  if (state.online) {
    try {
      const result = await api("/tasks", {
        method: "POST",
        body: JSON.stringify({
          role: task.owner || "growth_orchestrator",
          taskType: task.source || "manual_task",
          targetType: task.targetType,
          targetId: task.targetId,
          payload: task
        })
      });
      const persisted = normalizeTask(result.data);
      state.tasks = mergeLocalItems(state.tasks, [persisted]);
      state.metrics.tasks_created = state.tasks.length;
      return persisted;
    } catch {
      // Fall back to browser storage when local API task creation is unavailable.
    }
  }
  state.localTasks.unshift(row);
  state.tasks = mergeLocalItems(state.tasks, [row]);
  state.metrics.tasks_created = state.tasks.length;
  saveLocalJson("aiGrowthOsLocalTasks", state.localTasks);
  return row;
}

function upsertLocalItem(storageKey, collection, item) {
  const index = collection.findIndex((entry) => entry.id === item.id);
  if (index >= 0) collection[index] = item;
  else collection.unshift(item);
  saveLocalJson(storageKey, collection);
}

function numberValue(selector) {
  return Math.max(0, Number(document.querySelector(selector)?.value || 0) || 0);
}

async function submitDecision() {
  const modal = state.decisionModal;
  const item = modal ? state.approvals.find((approval) => approval.id === modal.approvalId) : null;
  const note = document.querySelector("#decisionNote")?.value.trim() || "";

  if (!modal || !item) {
    closeModal();
    return;
  }

  if ((modal.action === "reject" || modal.action === "request-changes") && !note) {
    showToast(text("A comment is required for reject or request changes.", "Для отклонения или правок нужен комментарий."));
    return;
  }

  state.decisionModal = null;
  await decideApproval(item, modal.action, note);
}

async function saveOffer() {
  const payload = {
    name: document.querySelector("#companyName")?.value.trim() || "Untitled B2B Company",
    website_url: document.querySelector("#companyWebsite")?.value.trim() || "",
    profile: {
      positioning: document.querySelector("#companyPositioning")?.value.trim() || "",
      products: document.querySelector("#companyProducts")?.value.trim() || "",
      icp: document.querySelector("#companyIcp")?.value.trim() || "",
      pains: document.querySelector("#companyPains")?.value.trim() || "",
      proof: document.querySelector("#companyProof")?.value.trim() || "",
      forbiddenClaims: document.querySelector("#forbiddenClaims")?.value.trim() || "",
      tone: document.querySelector("#toneRules")?.value.trim() || "",
      competitors: document.querySelector("#companyCompetitors")?.value.trim() || "",
      domains: document.querySelector("#companyDomains")?.value.trim() || "",
      channels: document.querySelector("#companyChannels")?.value.trim() || "",
      approvalOwner: document.querySelector("#approvalOwner")?.value.trim() || ""
    }
  };

  state.offer = { ...state.offer, ...payload };
  localStorage.setItem("aiGrowthOsOfferDraft", JSON.stringify(payload));

  if (!state.online) {
    showToast(text("Saved locally. Connection is offline.", "Сохранил локально. Подключение сейчас недоступно."));
    render();
    return;
  }

  try {
    await api("/offer", { method: "PUT", body: JSON.stringify(payload) });
    showToast(text("Company profile saved.", "Профиль компании сохранён."));
    await loadData();
  } catch {
    showToast(text("Could not save company profile.", "Не удалось сохранить профиль компании."));
    render();
  }
}

async function createSetupTasks() {
  const profile = state.offer?.profile || {};
  const gaps = ownerSetupGaps(profile);
  if (!gaps.length) {
    showToast(text("Company setup is already complete.", "Настройка компании уже заполнена."));
    return;
  }
  const existingTitles = new Set(state.tasks.map((task) => String(task.title || "")));
  const tasks = gaps.slice(0, 5).map((gap) => ({
    title: text(`Fill company setup: ${gap}`, `Заполнить настройку компании: ${gap}`),
    owner: "Owner",
    status: "next",
    note: text("This improves agent briefs, approvals and result interpretation.", "Это улучшает брифы агентов, согласования и понимание результатов."),
    source: "company-setup"
  })).filter((task) => !existingTitles.has(task.title));
  if (!tasks.length) {
    showToast(text("Company setup tasks already exist.", "Задачи по настройке компании уже есть."));
    setRoute("overview");
    return;
  }
  for (const task of tasks) {
    await addLocalTask(task);
  }
  addActivity("Growth Orchestrator", `Created company setup tasks: ${tasks.length}`);
  showToast(text("Company setup tasks created.", "Задачи по настройке компании созданы."));
  setRoute("overview");
}

async function requestDemandMap() {
  if (!state.online) {
    showToast(text("Connection is offline. Plan generation needs the local service.", "Подключение недоступно. Для составления плана нужен локальный сервис."));
    return;
  }

  try {
    await api("/demand-map/generate", {
      method: "POST",
      body: JSON.stringify({ source: "dashboard", company: state.offer?.name })
    });
    showToast(text("Client acquisition plan is queued.", "План привлечения клиентов поставлен в очередь."));
    await loadData();
  } catch {
    showToast(text("Could not queue client acquisition plan.", "Не удалось поставить план привлечения в очередь."));
  }
}

async function decideApproval(item, action, note = "") {
  if (!item) {
    showToast(text("Select a material first.", "Сначала выберите материал."));
    return;
  }

  const nextStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "changes_requested";

  if (!state.online || isLocalApproval(item)) {
    item.status = nextStatus;
    item.decision_note = note;
    item.decided_at = new Date().toISOString();
    await applyDecisionToSource(item, nextStatus);
    persistLocalApproval(item);
    appendAudit(item, nextStatus, note);
    showToast(decisionToast(nextStatus));
    render();
    return;
  }

  try {
    await api(`/approvals/${item.id}/${action}`, {
      method: "POST",
      body: JSON.stringify({ note })
    });
    item.status = nextStatus;
    item.decision_note = note;
    item.decided_at = new Date().toISOString();
    await applyDecisionToSource(item, nextStatus);
    persistLocalApproval(item);
    appendAudit(item, nextStatus, note);
    showToast(decisionToast(nextStatus));
    await loadData();
  } catch {
    showToast(text("Could not update the decision.", "Не удалось сохранить решение."));
  }
}

function isLocalApproval(item) {
  const id = String(item?.id || "");
  return !id || id.startsWith("a") || id.startsWith("local-");
}

function persistLocalApproval(item) {
  upsertLocalItem("aiGrowthOsLocalApprovals", state.localApprovals, item);
  state.metrics.pending_approvals = state.approvals.filter((approval) => approval.status === "pending").length;
  state.metrics.approvals_total = state.approvals.length;
}

async function applyDecisionToSource(approval, decisionStatus) {
  const context = getApprovalContext(approval);
  const source = context.source;
  if (!source) return;
  if (approval.target_type === "content_item") {
    source.status = decisionStatus === "approved" ? "approved" : decisionStatus === "changes_requested" ? "draft" : "rejected";
    source.updated_at = new Date().toISOString();
    await persistContentState(source);
    const linkedCalendar = state.calendar.find((item) => item.content_item_id === source.id);
    if (linkedCalendar) {
      linkedCalendar.status =
        decisionStatus === "approved" ? "scheduled" : decisionStatus === "changes_requested" ? "draft" : "rejected";
      linkedCalendar.updated_at = new Date().toISOString();
      await persistCalendarState(linkedCalendar);
    }
    return;
  }
  if (approval.target_type === "publishing_calendar_item") {
    source.status = decisionStatus === "approved" ? "scheduled" : decisionStatus === "changes_requested" ? "draft" : "rejected";
    source.updated_at = new Date().toISOString();
    await persistCalendarState(source);
    const linkedContent = state.content.find((item) => item.id === source.content_item_id);
    if (linkedContent) {
      linkedContent.status =
        source.status === "scheduled" ? "scheduled" : decisionStatus === "changes_requested" ? "draft" : decisionStatus === "rejected" ? "rejected" : linkedContent.status;
      linkedContent.updated_at = new Date().toISOString();
      await persistContentState(linkedContent);
    }
  }
}

function appendAudit(item, status, note) {
  addActivity("Human reviewer", `${labelize(status)}${note ? `: ${note}` : ""}`, { approvalId: item.id });
}

function addActivity(actor, event, extra = {}) {
  state.activity.unshift({
    ...extra,
    at: "Just now",
    actor,
    event
  });
  saveLocalJson("aiGrowthOsActivity", state.activity);
  syncWorkspaceState({ activity: state.activity.slice(0, 50) });
}

function decisionToast(status) {
  if (status === "approved") return text("Material approved.", "Материал согласован.");
  if (status === "rejected") return text("Material rejected.", "Материал отклонён.");
  return text("Changes requested.", "Запрошены правки.");
}

function restoreLocalDraft() {
  const raw = localStorage.getItem("aiGrowthOsOfferDraft");
  if (!raw) return;
  try {
    state.offer = { ...state.offer, ...JSON.parse(raw) };
  } catch {
    localStorage.removeItem("aiGrowthOsOfferDraft");
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

elements.navList.addEventListener("click", (event) => {
  const link = event.target.closest("[data-route]");
  if (!link) return;
  event.preventDefault();
  setRoute(link.dataset.route);
});

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

document.querySelector("#helpButton")?.addEventListener("click", () => {
  state.helpOpen = true;
  render();
});

window.addEventListener("hashchange", () => {
  state.route = normalizeRoute(location.hash);
  render();
});

restoreLocalDraft();
if (!location.hash) location.hash = "/overview";
render();
loadData();
