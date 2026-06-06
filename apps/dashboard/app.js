import { createToolsModule } from "./modules/tools.js?v=agentresult-working-os-88";
import { createPublicationsModule } from "./modules/publications.js?v=agentresult-working-os-88";
import { createCompanyGrowthModule } from "./modules/company-growth.js?v=agentresult-working-os-88";

const params = new URLSearchParams(window.location.search);
if (params.get("demo") === "reset") {
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith("aiGrowthOs")) localStorage.removeItem(key);
  }
  localStorage.setItem("aiGrowthOsLang", "ru");
}

const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const queryApiBase = params.get("api");
const queryTenantId = params.get("tenant");
if (queryApiBase) localStorage.setItem("aiGrowthOsApiBase", queryApiBase);
if (queryTenantId) localStorage.setItem("aiGrowthOsTenantId", queryTenantId);
const configuredApiBase = localStorage.getItem("aiGrowthOsApiBase");
const API_BASE = configuredApiBase || (isLocalHost ? "http://localhost:3000" : "");
const IS_PRODUCTION_DEMO = !isLocalHost && !configuredApiBase;
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
  "Strategy": "Стратегия",
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
  "Access": "Доступы",
  "Launch readiness": "Готовность запуска",
  "Rules": "Правила",
  "Rules, access, and launch": "Правила, доступы и запуск",
  "Revenue direction": "Куда двигаем выручку",
  "Work that can go outside": "Материалы для внешнего выпуска",
  "Approve, hand off, publish": "Согласовать, передать, выпустить",
  "Business signals": "Бизнес-сигналы",
  "Summary": "Сводка",
  "Client acquisition workflow": "Цикл привлечения клиентов",
  "What can be approved, planned, or exported": "Что можно согласовать, запланировать или забрать",
  "30-day client acquisition plan": "30-дневный план привлечения",
  "What we sell, to whom, and why we are trusted": "Что продаём, кому и за счёт чего нам доверяют",
  "Pages and topics that can bring demand": "Страницы и темы, которые приводят спрос",
  "Drafts, posts, pages, emails": "Черновики, посты, страницы, письма",
  "Decisions before public publishing": "Решения перед публичной публикацией",
  "When and where materials go live": "Когда и где выходят материалы",
  "Approved texts for manual publishing": "Утверждённые материалы",
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
  "Publishing APIs are not connected": "Публикации требуют настройки",
  "Manual-first export is active": "Материалы готовы к передаче",
  "Public distribution waits for approval": "Публичная дистрибуция ждёт согласования",
  "No backend issue detected": "Сервис работает штатно",
  "Backend is offline": "Сервис недоступен",
  "API connected": "Сервис подключён",
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
  "Calendar": "Календарь",
  "Pack builder": "Сборщик пакета",
  "Weekly content pack": "Недельный контент-пакет",
  "manual-first": "через подтверждение",
  "Week": "Неделя",
  "Channels": "Каналы",
  "SEO pages": "SEO-страницы",
  "Email": "Email",
  "Lead magnet": "Лид-магнит",
  "Package contents": "Состав пакета",
  "Product mode": "Режим продукта",
  "Manual-first": "Ручной режим",
  "Backend API": "Сервис данных",
  "Tenant": "Тенант",
  "Postgres source of truth": "Postgres как источник правды",
  "connected": "подключён",
  "not connected": "не подключён",
  "Backend online": "Сервис онлайн",
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
  "done": "готово",
  "completed": "готово",
  "queued": "в очереди",
  "in progress": "в работе",
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
  "approval gate": "согласование",
  "waiting for owner decision": "ждёт решения",
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
  "owner": "ответственный",
  "unassigned": "не назначен",
  "no deadline": "без дедлайна",
  "Offer Brain saved to Postgres.": "Оффер сохранён в Postgres.",
  "Could not save Offer Brain.": "Не удалось сохранить оффер.",
  "Saved locally. Backend is offline.": "Сохранено на этом устройстве. Сервис недоступен.",
  "Backend is offline. Demand generation requires the API.": "Сервис недоступен. Для составления плана нужно подключение.",
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
  "Calendar CSV export prepared for manual workflow.": "CSV календаря подготовлен.",
  "Agent task form is next: role, target, payload.": "Следующий шаг — форма агентной задачи: роль, цель, payload.",
  "Analytics import accepts CSV or API payloads.": "Можно загрузить CSV или данные из подключённого сервиса.",
  "Analytics Agent task queued placeholder.": "Заглушка: задача Analytics Agent будет поставлена в очередь.",
  "Risk checklist is visible in the approval detail.": "Чеклист рисков уже открыт в деталях согласования.",
  "Approval required before scheduled publishing can run.": "Нужно согласование перед запуском публикации по расписанию.",
  "Agent workflow": "Работа системы",
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
  { route: "growth-plan", title: "Strategy" },
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
  technical: { label: "Launch readiness" },
  autopilot: { label: "Rules" },
  tools: { label: "Access" }
};

const routes = {
  overview: { title: "Today", kicker: "Summary" },
  "growth-plan": { title: "Strategy", kicker: "Revenue direction" },
  "offer-brain": { title: "Company", kicker: "What we sell, to whom, and why we are trusted" },
  "content-pipeline": { title: "Materials", kicker: "Work that can go outside" },
  publications: { title: "Publications", kicker: "Approve, hand off, publish" },
  analytics: { title: "Results", kicker: "Business signals" },
  settings: { title: "Settings", kicker: "Rules, access, and launch" },
  "demand-map": { title: "Strategy", kicker: "Client acquisition workflow" },
  approvals: { title: "Publications", kicker: "What can be approved, planned, or exported" },
  "publishing-calendar": { title: "Publications", kicker: "What can be approved, planned, or exported" },
  "manual-export": { title: "Publications", kicker: "What can be approved, planned, or exported" },
  agents: { title: "Settings", kicker: "Rules, access, and launch" }
};

const demo = {
  offer: {
    name: "AgentResult",
    website_url: "https://agentresult-crm.vercel.app/",
    positioning:
      "AgentResult строит B2B AI-agent systems, которые помогают собственнику держать под контролем продажи, рост и операционные процессы через понятный Telegram-пульт.",
    profile: {
      positioning:
        "B2B AI-agent systems для продаж, роста, CRM-автоматизации и операционного контроля. Основной формат: агентная система + рабочий контур + Telegram-контур управления + интеграции.",
      icp:
        "Собственники B2B-компаний, агентства, интеграторы, SaaS-команды, сервисные компании и бизнесы с длинным циклом сделки, дебиторкой и слабой CRM-дисциплиной.",
      pains:
        "Лиды теряются; менеджеры не ведут CRM; повторные касания пропускаются; собственник не видит реальную картину продаж; контент хаотичен; сайт не создаёт спрос; дебиторка висит без системы; AI кажется рискованным.",
      proof:
        "Рабочий WebApp-прототип AgentResult, собранная архитектура рабочий контур -> хранилище -> Telegram/WebApp, отдельный прототип AI Growth OS и build-in-public история, где AgentResult строит AgentResult на AgentResult.",
      forbiddenClaims:
        "No guaranteed revenue growth, no guaranteed debt recovery, no 'replace the whole sales team', no error-free autonomy, no legal actions without approval, no automatic publishing or sending without approval.",
      tone: "Practical, direct, confident, owner-level, no hype.",
      competitors:
        "CRM integrators, Bitrix24 and amoCRM implementers, AI automation shops, performance agencies, no-code automators, internal operators, generic AI tools and SDR services.",
      products:
        "AgentResult Sales OS — AI-agent sales system / CRM automation\nAgentResult Collect / DebtorPilot — AI collection automation / receivables\nAI Growth OS — B2B growth/content/SEO/GEO operating system",
      domains: "agentresult-crm.vercel.app\nagentresult.ru\napp.agentresult.ru\napi.agentresult.ru\nagentresult.online",
      channels: "Telegram-контур управления, website/CMS, email, Bitrix24/amoCRM later, CSV/XLSX fallback",
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
      target_id: "c1",
      content_item_id: "c1",
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
      target_id: "c2",
      content_item_id: "c2",
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
      target_id: "p3",
      calendar_item_id: "p3",
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
  helpOpen: false,
  exportAssembled: loadLocalJson("aiGrowthOsWorkspaceState", {}).exportAssembled === true,
  publicationTab: "approvals",
  calendarFilter: "all",
  settingsTab: "technical",
  selectedToolId: "",
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
  if (calendarNoteIdFromHash(hash)) return "publications";
  return routes[route] ? route : "overview";
}

function calendarNoteIdFromHash(hash = location.hash) {
  const route = String(hash || "").replace(/^#\/?/, "");
  const match = route.match(/^publications\/note\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : "";
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

function openPublicationCalendar(filter = "all") {
  state.calendarFilter = ["all", "review", "scheduled", "handed_off", "published"].includes(filter) ? filter : "all";
  openPublicationTab("calendar");
}

function openSettingsTab(tab) {
  state.settingsTab = settingsTabs[tab] ? tab : "technical";
  setRoute("settings");
}

async function api(path, options = {}) {
  if (!API_BASE) throw new Error("Workspace API is not configured");
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
    state.demand = Array.isArray(demand.data) ? demand.data : state.demand;
    state.approvals = Array.isArray(approvals.data) ? approvals.data : state.approvals;
    state.agents = agents.data?.length ? agents.data : demo.agents;
    state.content = Array.isArray(content.data) ? content.data : state.content;
    state.calendar = Array.isArray(calendar.data) ? calendar.data : state.calendar;
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
  state.tasks = mergeLocalItems(state.tasks, state.localTasks).map(normalizeVisibleTask);
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
    ["Workflow link verification material", "Проверка согласования и публикации"],
    ["Проверка owner workflow: согласование и публикация", "Проверка согласования и публикации"],
    ["Weekly AgentResult growth pack", "Недельный пакет публикаций AgentResult"],
    ["AI agents for B2B sales", "AI-агенты для B2B-продаж"],
    ["How to recover overdue receivables without hiring an operator", "Как системно возвращать просроченную дебиторку"],
    ["Как вернуть просроченную дебиторку без отдельного оператора", "Как системно возвращать просроченную дебиторку"],
    ["Telegram CRM for the owner", "Telegram CRM для собственника"],
    ["Owner workflow demand topic", "Проверка согласования и публикации"],
    ["Owner workflow material", "Проверка согласования и публикации"],
    ["AI agent for Bitrix24", "AI-агент для Bitrix24"],
    ["AI agent for amoCRM", "AI-агент для amoCRM"]
  ]);

  for (const item of state.demand) {
    if (replacements.has(item.title)) item.title = replacements.get(item.title);
    if (item.audience === "B2B owner") item.audience = "Собственники B2B-компаний";
    if (item.audience === "B2B owners") item.audience = "Собственники B2B-компаний";
    if (item.audience === "Owners who do not want to live inside CRM") item.audience = "Собственники, которым не хочется жить внутри CRM";
    if (item.audience === "Owners and finance leads with overdue invoices") item.audience = "Собственники и финансисты с просроченной дебиторкой";
  }
  for (const item of state.content) {
    if (replacements.has(item.title)) item.title = replacements.get(item.title);
    if (item.audience === "B2B owner") item.audience = "Собственники B2B-компаний";
    if (item.persona === "B2B owner") item.persona = "Собственники B2B-компаний";
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

function handedOffCalendarCount(items = state.calendar) {
  return (items || []).filter((item) => item.status === "handed_off").length;
}

function normalizeTask(task) {
  const payload = task?.payload || {};
  const rawStatus = payload.status || task.status || "queued";
  return {
    id: task.id,
    title: cleanVisibleText(payload.title || labelize(task.task_type || "task")),
    owner: payload.owner || task.agent_role || text("System", "Система"),
    status: ["approved", "completed"].includes(rawStatus) ? "done" : rawStatus,
    note: cleanVisibleText(payload.note || payload.reason || ""),
    source: payload.source || task.task_type || "backend",
    created_at: task.created_at
  };
}

function normalizeVisibleTask(task) {
  return {
    ...task,
    title: cleanVisibleText(task.title),
    note: cleanVisibleText(task.note || "")
  };
}

function cleanVisibleText(value) {
  return String(value || "")
    .replace(/Assign access owner for Telegram WebApp/gi, text("Assign Telegram access responsible", "Назначить ответственного за Telegram"))
    .replace(/Telegram WebApp/g, text("Telegram control", "Telegram-пульт"))
    .replace(/B2B owner/g, text("B2B owners", "Собственники B2B-компаний"))
    .replace(/owner workflow/gi, text("approval and publishing", "согласование и публикация"))
    .replace(/without hiring an operator/gi, text("systematically", "системно"))
    .trim();
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
  const calendarNoteId = calendarNoteIdFromHash();
  if (calendarNoteId) {
    state.publicationTab = "calendar";
    state.decisionModal = null;
    state.formModal = { type: "calendarNote", itemId: calendarNoteId };
  }
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
  renderRouteModal();
  translateTree(elements.routeActions);
  translateTree(elements.screenRoot);
  translateTree(elements.modalRoot);
  bindScreenEvents();
}

function renderRouteModal() {
  const calendarNoteId = calendarNoteIdFromHash();
  if (!calendarNoteId) return;
  state.decisionModal = null;
  state.formModal = { type: "calendarNote", itemId: calendarNoteId };
  elements.modalRoot.innerHTML = renderFormModal();
}

function renderChrome() {
  document.querySelector(".brand-lockup h1").textContent = tr("Growth Control");
  const helpButton = document.querySelector("#helpButton");
  helpButton.textContent = text("Guide", "Инструкция");
  helpButton.hidden = true;
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
            <h3 id="guideTitle">${text("Guide", "Инструкция")}</h3>
          </div>
          <button class="button secondary" data-action="close-help">${tr("Close")}</button>
        </div>
        <div class="guide-steps">
          ${guideStep("1", text("Review decisions", "Проверьте решения"), text("Approvals show what is waiting before publication.", "В согласованиях видно, что ждёт решения перед публикацией."))}
          ${guideStep("2", text("Approve or return", "Согласуйте или верните"), text("Materials move forward only after the decision.", "Материалы двигаются дальше только после решения."))}
          ${guideStep("3", text("Check results", "Проверьте результат"), text("Published items and leads are tracked in Results.", "Публикации и заявки отслеживаются в результатах."))}
        </div>
        <div class="modal-warning">${text("This guide is available from the top bar.", "Инструкция доступна в верхней панели.")}</div>
        <div class="detail-actions">
          <button class="button primary" data-action="close-help">${text("Close", "Закрыть")}</button>
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
  const modalTitle = action === "approve" ? text("Approve", "Согласовать") : action === "reject" ? text("Reject", "Отклонить") : text("Request changes", "Нужны правки");
  const submitLabel = modalTitle;

  elements.modalRoot.innerHTML = `
    <div class="modal-backdrop" role="presentation" data-action="close-modal"></div>
    <section class="decision-modal" role="dialog" aria-modal="true" aria-labelledby="decisionTitle">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${text("Decision", "Решение")}</p>
          <h3 id="decisionTitle">${escapeHtml(modalTitle)}</h3>
        </div>
        <button class="button secondary" data-action="close-modal">${escapeHtml(text("Close", "Закрыть"))}</button>
      </div>
      <div class="decision-context">
        <strong>${escapeHtml(tr(context?.title || "Approval request"))}</strong>
        <span>${escapeHtml(displayChannel(context?.channel || "channel"))} · ${escapeHtml(context?.when || tr("not scheduled"))}</span>
      </div>
      <label>
        ${escapeHtml(text("Comment", "Комментарий"))}${requiresNote ? "" : ` <span>${escapeHtml(text("optional", "необязательно"))}</span>`}
        <textarea id="decisionNote" rows="4" placeholder="${escapeAttr(requiresNote ? text("What to change", "Что изменить") : text("Note", "Заметка"))}"></textarea>
      </label>
      <div class="detail-actions">
        <button class="button ${action === "reject" ? "danger" : "primary"}" data-action="submit-decision">${escapeHtml(submitLabel)}</button>
        <button class="button secondary" data-action="close-modal">${escapeHtml(text("Cancel", "Отмена"))}</button>
      </div>
    </section>
  `;
}

function renderFormModal() {
  const modal = state.formModal || {};
  const scheduleContent = state.content.find((item) => item.id === modal.contentId) || state.content[0] || null;
  const configs = {
    demand: {
      eyebrow: text("Strategy", "Стратегия"),
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
      eyebrow: text("Release", "Выпуск"),
      title: text("Plan item", "Пункт плана"),
      submit: "submit-schedule-form",
      button: text("Save", "Сохранить"),
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
      eyebrow: text("Release", "Выпуск"),
      title: text("Note", "Заметка"),
      submit: "submit-calendar-note-form",
      button: text("Save", "Сохранить"),
      body: calendarNoteForm(modal.itemId)
    },
    contentDetail: {
      eyebrow: text("Material", "Материал"),
      title: text("Edit", "Правка"),
      submit: "submit-content-edit-form",
      button: text("Save", "Сохранить"),
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
  return `
    <input id="contentEditId" type="hidden" value="${escapeAttr(item.id || "")}" />
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
    ${textarea(text("Text", "Текст"), "contentEditBody", item.metadata?.body || "")}
    ${textarea(text("Proof", "Доказательство"), "contentEditProof", item.metadata?.proof || "")}
    ${textarea(text("Comment", "Комментарий"), "contentCommentBody", "")}
    <div class="detail-actions">
      <button type="button" class="button secondary" data-action="submit-content-comment" data-id="${escapeAttr(item.id || "")}">${text("Add", "Добавить")}</button>
    </div>
  `;
}

function calendarNoteForm(itemId) {
  const item = state.calendar.find((entry) => entry.id === itemId);
  if (!item) {
    return `
      <input id="calendarNoteId" type="hidden" value="${escapeAttr(itemId || "")}" />
      <div class="decision-context">
        <strong>${escapeHtml(text("Release plan item", "Пункт плана"))}</strong>
        <span>${escapeHtml(text("Release note", "Заметка к выпуску"))}</span>
      </div>
      ${textarea(text("Note", "Заметка"), "calendarNoteBody", "")}
    `;
  }
  return `
    <input id="calendarNoteId" type="hidden" value="${escapeAttr(item.id)}" />
    <div class="decision-context">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(displayChannel(item.channel || "manual"))} · ${escapeHtml(formatDate(item.scheduled_for))}</span>
    </div>
    ${textarea(text("Note", "Заметка"), "calendarNoteBody", publishingOwnerNote(item))}
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
    approvals: [],
    calendar: [],
    pack: [
      actionButton("Assemble package", "primary", "assemble-pack"),
      actionButton(text("Download TXT", "Скачать TXT"), state.exportAssembled ? "secondary" : "secondary disabled", "download-pack"),
      actionButton("Copy texts", "secondary", "copy-pack")
    ]
  };
  const actions = {
    overview: [],
    "growth-plan": [],
    "offer-brain": [actionButton(text("Save", "Сохранить"), "primary", "save-offer")],
    "content-pipeline": [],
    publications: publicationActions[currentPublicationTab()],
    analytics: [],
    settings: currentSettingsTab() === "tools"
      ? []
      : currentSettingsTab() === "technical"
        ? []
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
  const publishedCount = state.calendar.filter((item) => item.status === "published").length;
  const handedOffCount = handedOffCalendarCount(state.calendar);
  const blockers = growthBlockers(pending);
  const ownerMoves = ownerNextMoves(pending);

  return `
    ${hermesDailyBrief(pending, blockers, ownerMoves)}
    ${resultPath(pending, publishedCount)}
    ${todaySignalStrip({ pendingCount: pending.length, handedOffCount })}
  `;
}

function todaySignalStrip({ pendingCount, handedOffCount }) {
  return `
    <section class="today-signal-strip">
      ${compactMetric(text("Decisions", "Решения"), pendingCount, text("waiting for owner", "ждут собственника"))}
      ${compactMetric(text("Manual handoff", "Передано вручную"), handedOffCount, text("awaiting confirmation", "ждёт подтверждения"))}
      ${compactMetric(text("Leads", "Заявки"), state.metrics.leads || 0, text("from forms, CRM or replies", "из форм, CRM или ответов"))}
    </section>
  `;
}

function compactMetric(label, value, note) {
  return `
    <article class="compact-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
      <p>${escapeHtml(note)}</p>
    </article>
  `;
}

function resultPath(pending, publishedCount) {
  const pendingApproval = pending[0] || state.approvals.find((item) => item.status === "pending");
  const releaseItem =
    state.calendar.find((item) => item.status === "handed_off") ||
    state.calendar.find((item) => item.status === "scheduled");
  const hasMaterial = state.content.length > 0;
  const hasApprovalDecision = state.approvals.some((item) => item.status === "approved");
  const hasLeads = Number(state.metrics.leads || 0) > 0;
  const releaseAction = releaseItem?.status === "handed_off" ? "mark-calendar-published" : "mark-calendar-exported";
  const releaseLabel = releaseItem?.status === "handed_off"
    ? text("Confirm live", "Подтвердить выход")
    : text("Mark handed off", "Отметить передачу");
  const releaseNote = releaseItem?.status === "handed_off"
    ? text("Waiting for live confirmation.", "Ждёт подтверждения выхода.")
    : text("Ready for manual handoff.", "Готово к ручной передаче.");
  const steps = [
    {
      title: text("Prepared", "Подготовлено"),
      note: text("Material or task is ready.", "Материал или задача готовы."),
      state: hasMaterial ? "done" : "active",
      action: "go-content",
      label: text("Materials", "Материалы")
    },
    {
      title: text("Decision", "Решение"),
      note: pendingApproval
        ? text("Owner approval is needed.", "Нужно согласование собственника.")
        : text("Approval gate is clear.", "Контур согласования чист."),
      state: pendingApproval ? "active" : hasApprovalDecision ? "done" : "muted",
      action: pendingApproval ? "open-demo-approval" : "go-approvals",
      id: pendingApproval?.id || "",
      label: pendingApproval ? text("Approve", "Согласовать") : text("Approvals", "Согласования")
    },
    {
      title: text("Release", "Выпуск"),
      note: releaseItem
        ? releaseNote
        : text("Appears after approval.", "Появится после согласования."),
      state: publishedCount ? "done" : releaseItem ? "active" : "muted",
      action: releaseItem ? releaseAction : "go-calendar",
      id: releaseItem?.id || "",
      label: releaseItem ? releaseLabel : text("Publications", "Публикации")
    },
    {
      title: text("Signal", "Сигнал"),
      note: hasLeads
        ? text(`${state.metrics.leads} leads in Results.`, `${state.metrics.leads} заявки в результатах.`)
        : text("Record the first lead or reply after release.", "Зафиксируйте первую заявку или ответ после выпуска."),
      state: hasLeads ? "done" : publishedCount ? "active" : "muted",
      action: "go-analytics",
      label: text("Results", "Результаты")
    }
  ];

  return `
    <section class="result-path" aria-label="${escapeAttr(text("Path to result", "Путь до результата"))}">
      <div class="result-path-head">
        <p class="eyebrow">${text("Path to result", "Цепочка до результата")}</p>
        <h3>${text("Prepared -> approved -> released -> signal", "Подготовлено -> согласовано -> выпущено -> сигнал")}</h3>
      </div>
      <div class="result-path-steps">
        ${steps.map((step, index) => `
          <article class="result-path-step ${step.state}">
            <span>${index + 1}</span>
            <strong>${escapeHtml(step.title)}</strong>
            <p>${escapeHtml(step.note)}</p>
            <button class="button secondary table-button" data-action="${escapeAttr(step.action)}" data-id="${escapeAttr(step.id || "")}">${escapeHtml(step.label)}</button>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function hermesDailyBrief(pending, blockers, ownerMoves) {
  const urgent = pending[0] ? getApprovalContext(pending[0]) : null;
  const title = urgent
    ? text(`Approve: ${urgent.title}`, `Согласовать: ${urgent.title}`)
    : blockers[0]?.title || text("No urgent decisions", "Срочных решений нет");
  const note = urgent
    ? text("Nothing goes public before this decision.", "До этого решения наружу ничего не уйдёт.")
    : text("No owner action is needed right now.", "Сейчас действие собственника не нужно.");
  const action = urgent ? "go-approval" : ownerMoves[0]?.action || "go-demand-map";
  const label = urgent ? text("Open decision", "Открыть решение") : ownerMoves[0]?.label || text("Open plan", "Открыть план");

  return `
    <section class="hermes-brief">
      <div>
        <p class="eyebrow">${text("Main", "Главное")}</p>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(note)}</p>
        <button class="button primary" data-action="${escapeAttr(action)}" data-id="${escapeAttr(pending[0]?.id || ownerMoves[0]?.id || "")}">${escapeHtml(label)}</button>
      </div>
    </section>
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
    meta: text("Use the material pack until channels are connected.", "Используйте пакет материалов, пока каналы не подключены."),
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
  return companyGrowthModule.renderGrowthPlan();
}

function workflowStrip(activeStep = canonicalRoute()) {
  const steps = [
    ["offer-brain", "offer-brain", text("Company", "Компания"), text("Set the offer and boundaries", "Настроили оффер и рамки")],
    ["growth-plan", "growth-plan", text("Strategy", "Стратегия"), text("Found demand and priorities", "Нашли спрос и приоритеты")],
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
  return companyGrowthModule.renderOfferBrain();
}

function ownerSetupGaps(profile) {
  return companyGrowthModule.ownerSetupGaps(profile);
}

function demandBusinessReason(item) {
  return companyGrowthModule.demandBusinessReason(item);
}

function renderContentPipeline() {
  const focusItems = materialFocusItems();
  const nextItem = focusItems[0] || null;
  const queues = materialOwnerQueues(nextItem?.id || "");
  const waiting = state.content.filter((item) => item.status === "review").length;
  const ready = state.content.filter((item) => ["approved", "scheduled"].includes(item.status)).length;
  const needsWork = state.content.filter((item) => ["idea", "brief", "draft"].includes(item.status)).length;
  const nextAction = nextItem ? materialPrimaryAction(nextItem) : { action: "go-demand-map", label: text("Open strategy", "Открыть стратегию") };

  return `
    <section class="material-command">
      <div>
        <p class="eyebrow">${text("Next material", "Следующий материал")}</p>
        <h3>${escapeHtml(nextItem ? materialQueueTitle(nextItem) : text("No material is waiting", "Материалов в очереди нет"))}</h3>
        <p>${escapeHtml(nextItem ? materialQueueNote(nextItem) : text("Create a material from strategy when there is a real demand topic.", "Создайте материал из стратегии, когда есть реальная тема спроса."))}</p>
        <button class="button primary" data-action="${escapeAttr(nextAction.action)}" data-id="${escapeAttr(nextItem?.id || "")}">${escapeHtml(nextAction.label)}</button>
      </div>
      <div class="material-summary compact">
        ${compactMaterialMetric(text("Needs decision", "Ждёт решения"), waiting)}
        ${compactMaterialMetric(text("Ready outside", "Готово наружу"), ready)}
        ${compactMaterialMetric(text("Needs work", "Нужно дописать"), needsWork)}
      </div>
    </section>
    <section class="material-queue-grid">
      ${queues.map(materialQueueColumn).join("")}
    </section>
  `;
}

function compactMaterialMetric(label, value) {
  return `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
    </article>
  `;
}

function materialFocusItems() {
  const order = { review: 0, approved: 1, scheduled: 2, draft: 3, brief: 4, idea: 5, published: 6 };
  return [...state.content].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
}

function materialOwnerQueues(excludeId = "") {
  const items = materialFocusItems();
  return [
    {
      title: text("Needs decision", "Ждёт решения"),
      note: text("Approve or return before release.", "Согласовать или вернуть перед выпуском."),
      items: items.filter((item) => item.status === "review" && item.id !== excludeId),
      empty: text("No decisions waiting.", "Нет материалов на решении.")
    },
    {
      title: text("Ready outside", "Готово наружу"),
      note: text("Put into release plan or hand off.", "Поставить в план выпуска или передать."),
      items: items.filter((item) => ["approved", "scheduled"].includes(item.status) && item.id !== excludeId),
      empty: text("Nothing ready for release yet.", "Пока ничего не готово к выпуску.")
    },
    {
      title: text("Needs work", "Нужно дописать"),
      note: text("Finish text before approval.", "Дописать текст перед согласованием."),
      items: items.filter((item) => ["idea", "brief", "draft"].includes(item.status) && item.id !== excludeId),
      empty: text("No drafts waiting.", "Нет черновиков в ожидании.")
    }
  ];
}

function materialQueueColumn(queue) {
  return `
    <section class="material-queue-column">
      <div class="material-queue-head">
        <div>
          <strong>${escapeHtml(queue.title)}</strong>
          <span>${escapeHtml(queue.note)}</span>
        </div>
        <em>${escapeHtml(String(queue.items.length))}</em>
      </div>
      <div class="material-queue-items">
        ${queue.items.length ? queue.items.map(materialQueueCard).join("") : `<p class="empty-note">${escapeHtml(queue.empty)}</p>`}
      </div>
    </section>
  `;
}

function materialQueueCard(item) {
  const primary = materialPrimaryAction(item);
  return `
    <article class="material-queue-card">
      <div>
        <span>${escapeHtml(materialOwnerStage(item))} · ${escapeHtml(displayChannel(item.channel || item.content_type || "content"))}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(materialOwnerOutcome(item))}</p>
      </div>
      <div class="card-actions">
        <button class="button secondary table-button" data-action="${escapeAttr(primary.action)}" data-id="${escapeAttr(item.id || "")}">${escapeHtml(primary.label)}</button>
      </div>
    </article>
  `;
}

function materialListCard(item) {
  const primary = materialPrimaryAction(item);
  const secondary = materialSecondaryAction(item);
  return `
    <article class="material-list-card">
      <div class="material-list-main">
        <div class="material-card-top">
          <div>
            <span class="material-stage">${escapeHtml(materialOwnerStage(item))}</span>
            <strong>${escapeHtml(item.title)}</strong>
          </div>
          <span class="material-type">${escapeHtml(displayChannel(item.channel || item.content_type || "content"))}</span>
        </div>
        <div class="material-path-mini">${materialStagePath(item)}</div>
        <p>${escapeHtml(materialOneLine(item))}</p>
        ${materialWorkflowFacts(item)}
      </div>
      <div class="material-list-actions">
        <button class="button primary" data-action="${escapeAttr(primary.action)}" data-id="${escapeAttr(item.id || "")}">${escapeHtml(primary.label)}</button>
        <button class="button secondary" data-action="${escapeAttr(secondary.action)}" data-id="${escapeAttr(item.id || "")}">${escapeHtml(secondary.label)}</button>
      </div>
    </article>
  `;
}

function materialQueueTitle(item) {
  if (item.status === "review") return text(`Decide: ${item.title}`, `Решить: ${item.title}`);
  if (item.status === "approved") return text(`Ready to publish: ${item.title}`, `Готово к выпуску: ${item.title}`);
  if (item.status === "scheduled") return text(`Confirm release: ${item.title}`, `Подтвердить выпуск: ${item.title}`);
  if (["idea", "brief", "draft"].includes(item.status)) return text(`Finish: ${item.title}`, `Дописать: ${item.title}`);
  return item.title;
}

function materialQueueNote(item) {
  if (item.status === "review") return text("Owner decision is needed before this goes outside.", "Нужно решение собственника, прежде чем материал выйдет наружу.");
  if (item.status === "approved") return text("The material is approved. Put it into the publication plan or hand it off.", "Материал согласован. Поставьте его в план публикаций или передайте вручную.");
  if (item.status === "scheduled") return text("The material is in the publication plan. Confirm when it goes live.", "Материал стоит в плане публикаций. Подтвердите, когда он выйдет.");
  if (["idea", "brief", "draft"].includes(item.status)) return text("The material is not ready for approval yet.", "Материал ещё не готов к согласованию.");
  return text("Open the material to choose the next action.", "Откройте материал, чтобы выбрать следующий шаг.");
}

function materialStagePath(item) {
  const stages = [
    ["draft", text("Draft", "Черновик")],
    ["review", text("Review", "Проверка")],
    ["approved", text("Approval", "Согласование")],
    ["scheduled", text("Publication", "Публикация")]
  ];
  const current = materialPathIndex(item.status);
  return stages.map(([key, label], index) => `<span class="${index < current ? "done" : index === current ? "active" : ""}">${escapeHtml(label)}</span>`).join("");
}

function materialPathIndex(status = "") {
  if (status === "review") return 1;
  if (status === "approved") return 2;
  if (status === "scheduled" || status === "published") return 3;
  return 0;
}

function materialOneLine(item) {
  return [
    displayChannel(item.channel || item.content_type || "content"),
    materialAudience(item),
    materialOwnerOutcome(item)
  ].filter(Boolean).join(" · ");
}

function renderPublications() {
  return publicationsModule.renderPublications();
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
    ${resultNextMovePanel(metrics)}
    ${resultSignalPanel(metrics)}
    ${resultProofStrip(metrics)}
    <article class="panel full">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${text("Next work", "Следующая работа")}</p>
          <h3>${text("What to fix next", "Что исправить дальше")}</h3>
        </div>
      </div>
      ${resultActionList(metrics)}
    </article>
  `;
}

function resultSignalPanel(metrics) {
  const signal = primaryBusinessSignal(metrics);
  return `
    <section class="result-signal-panel">
      <div>
        <p class="eyebrow">${text("Business signal", "Бизнес-сигнал")}</p>
        <h3>${escapeHtml(signal.title)}</h3>
        <p>${escapeHtml(signal.note)}</p>
      </div>
      <strong>${escapeHtml(signal.value)}</strong>
    </section>
  `;
}

function primaryBusinessSignal(metrics) {
  if (metrics.leads) {
    return {
      value: String(metrics.leads),
      title: text("New demand is visible", "Появился спрос"),
      note: text("Leads are recorded from forms, CRM or replies. Next step: check quality and source.", "Заявки зафиксированы из форм, CRM или ответов. Дальше проверяем качество и источник.")
    };
  }
  if (metrics.recovered_payments) {
    return {
      value: String(metrics.recovered_payments),
      title: text("Money returned", "Деньги вернулись"),
      note: text("Recovered payments are counted only after confirmation.", "Возврат денег считается только после подтверждения.")
    };
  }
  if (metrics.published_materials) {
    return {
      value: String(metrics.published_materials),
      title: text("Work went outside", "Работа вышла наружу"),
      note: text("Published or handed-off materials are visible. Next signal should come from a lead, form or reply.", "Видны опубликованные или переданные материалы. Следующий сигнал ждём из заявки, формы или ответа.")
    };
  }
  return {
    value: "0",
    title: text("No market signal yet", "Рыночного сигнала пока нет"),
    note: text("Preparation is visible, but no lead, reply or confirmed live signal has been recorded yet.", "Подготовка видна, но заявка, ответ или подтверждённый внешний сигнал ещё не зафиксированы.")
  };
}

function resultProofStrip(metrics) {
  const handedOffCount = handedOffCalendarCount(state.calendar);
  const publishedCount = state.calendar.filter((item) => item.status === "published").length;
  const proof = [
    [text("Published", "Вышло"), publishedCount, text("confirmed live", "подтверждённый выход")],
    [text("Manual handoff", "Передано вручную"), handedOffCount, text("awaiting live confirmation", "ждёт подтверждения выхода")],
    [text("Waiting decision", "Ждёт решения"), metrics.pending_approvals, text("before release", "до выпуска")],
    [text("Leads", "Заявки"), metrics.leads, text("from forms, CRM or replies", "из форм, CRM или ответов")],
    [text("Next tasks", "Следующие задачи"), metrics.tasks_created, text("created from signals", "созданы по сигналам")]
  ];
  return `<div class="metric-grid">${proof.map(([label, value, note], index) => metricCard(label, value, note, index === 3 ? "dark" : index === 4 ? "coral" : "")).join("")}</div>`;
}

function resultActionList(metrics) {
  const openTasks = state.tasks.filter((task) => !["done", "approved"].includes(task.status));
  if (openTasks.length) {
    return `
      <div class="result-action-list">
        ${openTasks.slice(0, 5).map((task) => `
          <article class="result-action-row">
            <div>
              <span>${escapeHtml(displayWorkOwner(task.owner))} · ${escapeHtml(tr(labelize(task.status || "next")))}</span>
              <strong>${escapeHtml(task.title)}</strong>
              <p>${escapeHtml(task.note || text("Action required", "Требуется действие"))}</p>
            </div>
            ${taskAction(task)}
          </article>
        `).join("")}
      </div>
    `;
  }
  return `
    <div class="result-empty-action">
      <strong>${escapeHtml(text("No improvement tasks yet", "Задач улучшения пока нет"))}</strong>
      <p>${escapeHtml(metrics.leads || metrics.published_materials
        ? text("Create tasks from the current signals when you are ready to tighten the loop.", "Создайте задачи по текущим сигналам, когда будете готовы усиливать контур.")
        : text("First get a release or recorded lead, then improvement tasks will become useful.", "Сначала нужен выпуск или зафиксированная заявка, потом задачи улучшения станут полезными."))}</p>
    </div>
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
      <button class="button ${next.variant}" data-action="${escapeAttr(next.action)}" data-id="${escapeAttr(next.id || "")}">${escapeHtml(next.label)}</button>
    </article>
  `;
}

function resultNextMove(metrics) {
  const handedOffCount = handedOffCalendarCount(state.calendar);
  if (!metrics.leads && !metrics.published_materials) {
    return {
      title: text("Get the first public signal and first demand signal into the system", "Дайте системе первый внешний выпуск и первый сигнал спроса"),
      note: text("Until a material is released and a lead is recorded, results show preparation, not the market.", "Пока нет выпуска и заявки, результаты показывают подготовку, а не рынок."),
      action: "generate-improvements",
      label: text("Create improvement tasks", "Создать задачи улучшения"),
      variant: "primary"
    };
  }
  if (handedOffCount) {
    return {
      title: text("Confirm manually handed-off materials after they go live", "Подтвердите выход материалов, переданных вручную"),
      note: text("Open the publishing plan and mark the handed-off items as published once the channel owner confirms release.", "Откройте план публикаций и отметьте переданные вручную материалы как опубликованные после подтверждения выхода."),
      action: "go-calendar-handoff",
      label: text("Open publishing plan", "Открыть план публикаций"),
      variant: "primary"
    };
  }
  if (metrics.pending_approvals) {
    const pendingApproval = state.approvals.find((item) => item.status === "pending");
    return {
      title: text("Clear pending approvals before pushing more materials", "Разберите согласования перед новым выпуском"),
      note: text("Approval-first only works if owner decisions do not pile up.", "Approval-first работает, когда решения собственника не копятся."),
      action: "go-approvals",
      id: pendingApproval?.id || "",
      label: text("Open approvals", "Открыть согласования"),
      variant: "primary"
    };
  }
  if (!metrics.leads) {
    return {
      title: text("Record the first demand signal after release", "Зафиксируйте первый сигнал спроса после выпуска"),
      note: text("For Growth Control, useful results start with a reply, request, form lead or CRM signal.", "Для Growth Control полезный результат начинается с ответа, заявки, формы или CRM-сигнала."),
      action: "import-metrics",
      label: text("Add signal", "Добавить сигнал"),
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

function renderSettings() {
  const tab = currentSettingsTab();
  const tabRenderers = {
    technical: renderTechnicalSettings,
    autopilot: renderAutopilotSettings,
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
    ${settingsNextStep(tab)}
    ${tabRenderers[tab]()}
  `;
}

function settingsTabContext(tab) {
  const contexts = {
    technical: [
      text("Launch readiness", "Готовность запуска"),
      text("Rules, access and the first controlled release.", "Правила, доступы и первый управляемый выпуск.")
    ],
    autopilot: [
      text("Rules", "Правила"),
      text("What AgentResult may prepare, what needs approval, and where materials may go.", "Что AgentResult может готовить, что требует согласования и куда можно выпускать.")
    ],
    tools: [
      text("Access", "Доступы"),
      text("What is connected, what blocks launch, and who should give access.", "Что подключено, что блокирует запуск и кто должен дать доступ.")
    ]
  };
  const [title, note] = contexts[tab] || contexts.technical;
  return `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(note)}</span>`;
}

function settingsNextStep(tab) {
  const steps = {
    technical: {
      eyebrow: text("What to do now", "Что сделать сейчас"),
      title: text("Close the first launch blocker", "Закрыть первый блокер запуска"),
      note: text("Open Access and assign who gives the production workspace, domain or sender access.", "Откройте Доступы и назначьте, кто даёт рабочий контур, домен или отправителя."),
      action: "set-settings-tab",
      id: "tools",
      label: text("Open Access", "Открыть Доступы")
    },
    autopilot: {
      eyebrow: text("What to do now", "Что сделать сейчас"),
      title: text("Keep release approval-first", "Оставить выпуск через согласование"),
      note: text("AgentResult may prepare work. Public release should still wait for the owner's final click.", "AgentResult может готовить работу. Публичный выпуск должен ждать финального клика собственника."),
      action: "save-autopilot",
      id: "",
      label: text("Save rules", "Сохранить правила")
    },
    tools: {
      eyebrow: text("What to do now", "Что сделать сейчас"),
      title: text("Assign the owner for the next access", "Назначить владельца следующего доступа"),
      note: text("Start with the AgentResult workspace or sender access. Without this, release stays manual.", "Начните с рабочего контура AgentResult или отправителя. Без этого выпуск остаётся ручным."),
      action: "select-tool",
      id: "backend",
      label: text("Open access task", "Открыть задачу доступа")
    }
  };
  const step = steps[tab] || steps.technical;
  const action = tab === "technical"
    ? `<button class="button primary" data-action="${escapeAttr(step.action)}" data-id="${escapeAttr(step.id)}">${escapeHtml(step.label)}</button>`
    : "";
  return `
    <section class="settings-next-step">
      <div>
        <p class="eyebrow">${escapeHtml(step.eyebrow)}</p>
        <strong>${escapeHtml(step.title)}</strong>
        <span>${escapeHtml(step.note)}</span>
      </div>
      ${action}
    </section>
  `;
}

function approvalWaitNote(count) {
  if (currentLang === "ru") {
    const verb = pluralRu(count, "ждёт", "ждут", "ждут");
    return `${count} ${pluralRu(count, "согласование", "согласования", "согласований")} ${verb} перед выпуском.`;
  }
  return count === 1 ? "1 approval waits before release." : `${count} approvals wait before release.`;
}

function pluralRu(count, one, few, many) {
  const lastTwo = Math.abs(count) % 100;
  const last = lastTwo % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

function renderTechnicalSettings() {
  const pendingApprovals = state.approvals.filter((item) => item.status === "pending").length;
  const readyMaterials = state.content.filter((item) => ["approved", "scheduled", "published"].includes(item.status)).length;
  const launchItems = [
    {
      label: text("Control loop", "Контур контроля"),
      value: pendingApprovals ? text("Needs decisions", "Есть решения") : text("Clear", "Чисто"),
      note: pendingApprovals
        ? approvalWaitNote(pendingApprovals)
        : text("No public action is waiting on the owner.", "Публичные действия не ждут собственника.")
    },
    {
      label: text("Materials", "Материалы"),
      value: String(readyMaterials),
      note: text("Approved, planned or already published.", "Согласовано, запланировано или уже вышло.")
    },
    {
      label: text("Result data", "Данные результата"),
      value: state.online ? text("Connected", "Подключены") : text("Demo surface", "Демо-контур"),
      note: state.online
        ? text("Tasks, approvals and materials are saved in the workspace.", "Задачи, согласования и материалы сохраняются в контуре.")
        : text("Shows the first controlled loop without local services.", "Показывает первый управляемый цикл без локальных сервисов.")
    }
  ];
  const detailItems = [
    {
      label: text("Workspace", "Рабочий контур"),
      value: state.online ? text("Connected", "Подключён") : text("Demo", "Демо"),
      note: state.online
        ? text("Shared workspace is available.", "Рабочее пространство доступно.")
        : IS_PRODUCTION_DEMO
          ? text("Approvals, handoff and results are shown without local services.", "Согласования, передача и результаты показаны без локальных сервисов.")
          : text("Approvals, handoff and results are shown as a product scenario.", "Согласования, передача и результаты показаны как продуктовый сценарий.")
    },
    {
      label: text("Owner", "Владелец"),
      value: state.me?.name || text("Owner", "Собственник"),
      note: displayWorkOwner(state.me?.role || "owner")
    },
    {
      label: text("Production workspace", "Рабочий запуск"),
      value: state.online ? text("Active", "Активен") : text("Next step", "Следующий шаг"),
      note: text("Connect the workspace, domain and access after approval of the demo loop.", "Подключить рабочий контур, домен и доступы после согласования демо-цикла.")
    }
  ];
  return `
    <article class="panel full system-status-panel">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">${text("Launch readiness", "Готовность запуска")}</p>
          <h3>${state.online ? text("Ready for controlled work", "Можно вести управляемую работу") : text("Ready to review", "Готово к просмотру")}</h3>
        </div>
        <span class="status-dot ${state.online ? "online" : "offline"}"></span>
      </div>
      <div class="launch-readiness-strip">
        ${launchItems.map((item) => `
          <article>
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
            <p>${escapeHtml(item.note)}</p>
          </article>
        `).join("")}
      </div>
      <details class="technical-details">
        <summary>${text("Workspace details", "Детали рабочего контура")}</summary>
        <div class="settings-list">
          ${detailItems.map((item) => `
            <div><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)} · ${escapeHtml(item.note)}</strong></div>
          `).join("")}
          <div><span>${text("Service address", "Адрес сервиса")}</span><strong>${escapeHtml(API_BASE || text("Not connected", "Не подключён"))}</strong></div>
          <div><span>${text("Workspace", "Рабочая область")}</span><strong>${escapeHtml(TENANT_ID)}</strong></div>
        </div>
      </details>
    </article>
  `;
}

function renderAutopilotSettings() {
  const toggles = [
    ["prepare-topics", text("Prepare topics", "Готовить темы"), true],
    ["write-drafts", text("Write drafts", "Писать черновики"), true],
    ["assemble-pack", text("Assemble weekly pack", "Собирать недельный пакет"), true],
    ["approval-reminders", text("Remind about approvals", "Напоминать о согласовании"), true],
    ["direct-publishing", text("Publish without final owner click", "Публиковать без финального клика собственника"), false]
  ];
  const channels = [
    ["website", text("Website pages", "Страницы сайта"), true],
    ["telegram", "Telegram", true],
    ["email", "Email", true],
    ["calendar", text("Publishing calendar", "Календарь публикаций"), true],
    ["vc", "VC.ru", false],
    ["habr", "Habr", false]
  ];

  return `
    <section class="rules-control-grid">
      <article class="panel rules-main-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("AgentResult rules", "Правила AgentResult")}</p>
            <h3>${text("Preparation is automatic. Release is approval-first.", "Подготовка автоматическая. Выпуск через согласование.")}</h3>
          </div>
        </div>
        <div class="rules-check-block">
          <span class="meta-label">${text("AgentResult may do", "AgentResult может делать")}</span>
          <div class="check-grid single">
            ${toggles.map(([key, label, checked]) => `<label class="check"><input type="checkbox" data-autopilot-key="${escapeAttr(key)}" ${state.autopilotSettings[key] ?? checked ? "checked" : ""} /> ${escapeHtml(label)}</label>`).join("")}
          </div>
        </div>
        <div class="rules-check-block">
          <span class="meta-label">${text("Approved materials may go to", "Согласованные материалы можно выпускать в")}</span>
          <div class="check-grid">
            ${channels.map(([key, label, checked]) => `<label class="check"><input type="checkbox" data-channel-key="${escapeAttr(key)}" ${state.channelSettings[key] ?? checked ? "checked" : ""} /> ${escapeHtml(label)}</label>`).join("")}
          </div>
        </div>
        <div class="detail-actions">
          <button type="button" class="button primary" data-action="save-autopilot">${escapeHtml(text("Save rules", "Сохранить правила"))}</button>
        </div>
      </article>
      <article class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Approval gate", "Контур согласования")}</p>
            <h3>${text("What never goes out automatically", "Что не уходит наружу автоматически")}</h3>
          </div>
        </div>
        <div class="automation-list">
          ${automationRow(text("AgentResult prepares", "AgentResult готовит"), text("Topics, briefs, drafts, weekly packs and approval reminders.", "Темы, ТЗ, черновики, недельные пакеты и напоминания о согласовании."), 78)}
          ${automationRow(text("Owner decides", "Собственник решает"), text("Public publishing, strong claims, client names and competitor comparisons.", "Публичный выпуск, сильные обещания, имена клиентов и сравнения с конкурентами."), 100)}
          ${automationRow(text("Manual handoff stays available", "Ручная передача остаётся"), text("Until direct posting, site updates and email sends are connected safely.", "Пока прямой выпуск, обновление сайта и email не подключены безопасно."), 58)}
        </div>
      </article>
    </section>
  `;
}

function renderToolsSettings() {
  return toolsModule.renderToolsSettings();
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
        title: context.title,
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
  const value = item.audience || item.persona || "";
  if (value === "B2B owner") return text("B2B owners", "Собственники B2B-компаний");
  if (/operator|оператор/i.test(value)) return text("B2B decision makers", "Ответственные за продажи и рост");
  return value || text("B2B decision makers", "Ответственные за продажи и рост");
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
  if (approval) facts.push(text("Waiting for approval", "Ждёт согласования"));
  if (calendar) facts.push(`${displayChannel(calendar.channel || "channel")} · ${formatDate(calendar.scheduled_for)}`);
  if (!facts.length) facts.push(text("Not yet linked to approval or publishing plan", "Пока не связан с согласованием или планом публикаций"));
  return `<div class="material-workflow-facts">${facts.map((fact) => `<span>${escapeHtml(fact)}</span>`).join("")}</div>`;
}

function materialOwnerStage(item) {
  if (item.status === "review") return text("Needs decision", "Ждёт решения");
  if (item.status === "approved") return text("Ready to plan", "Готов к плану");
  if (item.status === "scheduled") return text("Ready outside", "Готово наружу");
  if (item.status === "published") return text("Already out", "Уже вышло");
  return text("Needs work", "Нужно дописать");
}

function materialOwnerOutcome(item) {
  if (item.status === "review") return text("approve or request changes", "согласовать или запросить правки");
  if (item.status === "approved") return text("put into publication plan", "поставить в план публикаций");
  if (item.status === "scheduled") return text("publish or hand off", "выпустить или передать");
  if (item.status === "published") return text("already counted in results", "уже учтено в результатах");
  return text("finish and send to approval", "дописать и отправить на согласование");
}

function materialPrimaryAction(item) {
  if (item.status === "approved") return { action: "schedule-content", label: text("Schedule material", "Запланировать") };
  if (item.status === "review") return { action: "go-approvals", label: text("Open approvals", "Открыть согласования") };
  if (item.status === "scheduled" || item.status === "published") return { action: "go-calendar", label: text("Open calendar", "Открыть календарь") };
  return { action: "open-content-detail", label: text("Open material", "Открыть материал") };
}

function displayWorkOwner(value) {
  const raw = String(value || "").trim();
  if (!raw) return text("Responsible", "Ответственный");
  if (/owner/i.test(raw)) return text("Owner", "Собственник");
  if (/sales/i.test(raw)) return text("Sales", "Продажи");
  if (/publishing/i.test(raw)) return text("Publishing", "Публикации");
  if (/growth|orchestrator/i.test(raw)) return text("Growth", "Рост");
  if (/content/i.test(raw)) return text("Materials", "Материалы");
  return tr(raw);
}

function materialSecondaryAction(item) {
  if (item.status === "idea" || item.status === "brief" || item.status === "draft") return { action: "send-content-approval", label: text("Send to approval", "На согласование") };
  if (item.status === "review") return { action: "open-content-detail", label: text("Edit", "Править") };
  if (item.status === "approved" || item.status === "scheduled") return { action: "export-content", label: text("Download text", "Скачать текст") };
  return { action: "open-content-detail", label: text("Details", "Детали") };
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
  const approval = state.approvals.find((item) => item.id === targetId || item.target_id === targetId || item.calendar_item_id === targetId);
  return approval?.id || "";
}

function bindScreenEvents() {
  if (!document.documentElement.dataset.noteLinkBound) {
    document.documentElement.dataset.noteLinkBound = "true";
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#/publications/note/"]');
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const itemId = decodeURIComponent(href.replace("#/publications/note/", ""));
      if (!itemId) return;
      event.preventDefault();
      event.stopPropagation();
      if (location.hash !== href) history.pushState(null, "", href);
      state.route = "publications";
      state.publicationTab = "calendar";
      openFormModal("calendarNote", { itemId });
    }, true);
  }
  [elements.screenRoot, elements.routeActions, elements.modalRoot].forEach((root) => {
    if (!root || root.dataset.actionsBound) return;
    root.dataset.actionsBound = "true";
    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button || !root.contains(button) || button.disabled) return;
      event.preventDefault();
      void handleAction(button.dataset.action, button.dataset.id);
    });
    root.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      const control = event.target.closest('[role="button"][data-action]');
      if (!control || !root.contains(control)) return;
      event.preventDefault();
      void handleAction(control.dataset.action, control.dataset.id);
    });
  });
  [elements.screenRoot, elements.routeActions, elements.modalRoot].forEach((root) => {
    root?.querySelectorAll("[data-action]").forEach((button) => {
      if (button.dataset.actionBound) return;
      button.dataset.actionBound = "true";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        void handleAction(button.dataset.action, button.dataset.id);
      });
    });
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
    "open-demo-approval": () => {
      if (id) state.selectedApprovalId = id;
      openDecisionModal("approve");
    },
    "set-publication-tab": () => openPublicationTab(id),
    "set-calendar-filter": () => {
      state.calendarFilter = ["all", "review", "scheduled", "handed_off", "published"].includes(id) ? id : "all";
      render();
    },
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
    "go-content": () => id ? openContentDetail(id) : setRoute("content-pipeline"),
    "go-demand-map": () => setRoute("growth-plan"),
    "go-offer-brain": () => setRoute("offer-brain"),
    "go-analytics": () => setRoute("analytics"),
    "go-calendar": () => openPublicationTab("calendar"),
    "go-calendar-handoff": () => openPublicationCalendar("handed_off"),
    "complete-task": () => completeTask(id),
    "go-settings": () => setRoute("settings"),
    "go-manual-export": () => openPublicationTab("pack"),
    "save-offer": saveOffer,
    "create-setup-tasks": createSetupTasks,
    "generate-demand": requestDemandMap,
    "add-demand": () => openFormModal("demand"),
    "add-demand-topic": () => openFormModal("demand"),
    "new-content": () => openFormModal("content"),
    "generate-brief": prepareNextBrief,
    "select-approval": () => {
      state.selectedApprovalId = id;
      render();
    },
    "toggle-approval-preview": () => {
      state.expandedApprovalPreviewId = state.expandedApprovalPreviewId === id ? "" : id;
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
    "confirm-handed-off": confirmHandedOffCalendarItems,
    "edit-calendar-note": () => openFormModal("calendarNote", { itemId: id }),
    "assemble-pack": assemblePack,
    "download-pack": downloadPack,
    "copy-pack": copyPackTexts,
    "copy-pack-item": () => copyPackItem(id),
    "mark-pack-handoff": () => markPackAssetHandedOff(id),
    "open-calendar": () => openPublicationTab("calendar"),
    "preview-pack-item": () => {
      state.selectedPackItem = id || state.selectedPackItem;
      render();
    },
    "create-task": () => openFormModal("task"),
    "enable-autopilot": () => showToast(text("Autopilot settings are saved locally for this prototype.", "Настройки автопилота пока сохраняются локально в прототипе.")),
    "save-autopilot": saveAutopilotSettings,
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

async function copyPackItem(id) {
  const asset = packageAssets().find((item) => item.id === id) || packageAssets().find((item) => item.id === state.selectedPackItem);
  if (!asset) return;
  try {
    await navigator.clipboard.writeText(asset.preview);
    showToast(text("Selected text copied.", "Выбранный текст скопирован."));
  } catch {
    downloadTextFile(`${slugify(asset.label)}.txt`, asset.preview);
    showToast(text("Clipboard is blocked; selected text downloaded as TXT.", "Буфер обмена недоступен; выбранный текст скачан как TXT."));
  }
}

async function markPackAssetHandedOff(id) {
  const asset = packageAssets().find((item) => item.id === id) || packageAssets().find((item) => item.id === state.selectedPackItem);
  if (!asset) return;
  const channel = packAssetChannel(asset.id);
  const existing = state.calendar.find((item) => item.metadata?.pack_asset_id === asset.id || item.title === asset.label);
  const item = existing || {
    id: `local-calendar-${Date.now()}`,
    title: asset.label,
    channel,
    scheduled_for: defaultScheduleDate(),
    created_at: new Date().toISOString(),
    metadata: {}
  };
  item.status = "handed_off";
  item.updated_at = new Date().toISOString();
  item.metadata = {
    ...(item.metadata || {}),
    pack_asset_id: asset.id,
    handoff_note: text(
      `Manual handoff recorded for ${asset.label}. Confirm live status after publication.`,
      `Ручная передача зафиксирована: ${asset.label}. После выхода подтвердите публикацию.`
    )
  };
  upsertLocalItem("aiGrowthOsLocalCalendar", state.localCalendar, item);
  state.calendar = mergeLocalItems(state.calendar, [item]);
  state.metrics.calendar_items = state.calendar.length;
  state.metrics.published_materials = shippedCalendarCount(state.calendar);
  addActivity("Publishing QA", `Marked pack asset handed off: ${asset.label}`);
  showToast(text("Handoff recorded in the release plan.", "Передача зафиксирована в плане выпуска."));
  openPublicationTab("calendar");
}

function packAssetChannel(id) {
  const channels = {
    seo: "website",
    telegram: "telegram",
    vc: "vc",
    email: "email",
    "lead-magnet": "website",
    calendar: "manual_export"
  };
  return channels[id] || "manual_export";
}

async function createContentFromDemand(id) {
  const demand = state.demand.find((item) => item.id === id);
  if (!demand) return;
  const item = contentDraftFromDemand(demand, "brief");
  const saved = await saveContentItem(item);
  state.content = mergeLocalItems(state.content, [saved]);
  state.metrics.content_items = state.content.length;
  addActivity("Growth Orchestrator", `Created material from demand: ${demand.title}`);
  showToast(text("Material created from strategy.", "Материал создан из стратегии."));
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
  let item = state.content.find((entry) => entry.id === id);
  if (!item) return;
  item.status = "review";
  item.updated_at = new Date().toISOString();
  item = await saveContentItem(item);
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
  state.channelSettings = Object.fromEntries(
    [...document.querySelectorAll("[data-channel-key]")].map((input) => [input.dataset.channelKey, input.checked])
  );
  saveLocalJson("aiGrowthOsAutopilotSettings", state.autopilotSettings);
  saveLocalJson("aiGrowthOsChannelSettings", state.channelSettings);
  showToast(text("Rules saved.", "Правила сохранены."));
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

async function confirmHandedOffCalendarItems() {
  const items = state.calendar.filter((item) => item.status === "handed_off");
  if (!items.length) return;
  for (const item of items) {
    item.status = "published";
    item.updated_at = new Date().toISOString();
    await persistCalendarState(item);
    const linkedContent = state.content.find((entry) => entry.id === item.content_item_id);
    if (linkedContent) {
      linkedContent.status = "published";
      linkedContent.updated_at = new Date().toISOString();
      await persistContentState(linkedContent);
    }
  }
  state.metrics.published_materials = shippedCalendarCount(state.calendar);
  state.calendarFilter = "published";
  addActivity("Publishing QA", `Confirmed manual handoff: ${items.length}`);
  showToast(text("Publication confirmed.", "Выпуск подтверждён."));
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
  if (calendarNoteIdFromHash()) {
    location.hash = "/publications";
    return;
  }
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
  showToast(text("Topic added to strategy.", "Тема добавлена в стратегию."));
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
  let content = state.content.find((item) => item.id === contentId);
  if (!content) {
    showToast(text("Select a material first.", "Сначала выберите материал."));
    return;
  }
  const requestedStatus = document.querySelector("#scheduleStatus")?.value || "review";
  const approvedForPublishing = state.approvals.some((approval) =>
    approval.status === "approved" &&
    ((approval.target_type === "content_item" && approval.target_id === content.id) ||
      (approval.content_item_id && approval.content_item_id === content.id))
  ) || content.status === "approved";
  const status = approvedForPublishing && requestedStatus === "scheduled" ? "scheduled" : "review";
  content.status = status === "scheduled" ? "scheduled" : "review";
  content.updated_at = new Date().toISOString();
  content = await saveContentItem(content);
  state.content = mergeLocalItems(state.content, [content]);
  const calendarItem = {
    id: `local-calendar-${Date.now()}`,
    content_item_id: content.id,
    title: content.title,
    channel: document.querySelector("#scheduleChannel")?.value.trim() || content.channel || "telegram",
    scheduled_for: document.querySelector("#scheduleDate")?.value.trim() || defaultScheduleDate(),
    status,
    metadata: {
      handoff_note: status === "scheduled"
        ? text("Check the channel, format and final publication manually. After it goes live, mark it as published.", "Проверьте канал, формат и финальную публикацию вручную. После выхода отметьте материал как опубликованный.")
        : ""
    },
    created_at: new Date().toISOString()
  };
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
  let item = state.calendar.find((entry) => entry.id === id);
  if (!item) {
    item = {
      id: id || `local-calendar-${Date.now()}`,
      title: text("Release plan item", "Пункт плана"),
      channel: "manual",
      scheduled_for: defaultScheduleDate(),
      status: "scheduled",
      metadata: {},
      created_at: new Date().toISOString()
    };
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
  toolsModule.saveToolSetup();
}

async function saveContentItem(item) {
  if (state.online) {
    try {
      const isLocal = String(item.id || "").startsWith("local-");
      const result = isLocal
        ? await api("/content/items", { method: "POST", body: JSON.stringify(contentItemPayload(item, { stripId: true })) })
        : await api(`/content/items/${item.id}`, { method: "PATCH", body: JSON.stringify(contentItemPayload(item)) });
      const saved = result.data || item;
      if (isLocal && saved.id && saved.id !== item.id) {
        removeLocalItem("aiGrowthOsLocalContent", state.localContent, item.id);
        return saved;
      }
      return saved;
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
      const result = await api("/publishing/schedule", { method: "POST", body: JSON.stringify(calendarItemPayload(item, { stripId: true })) });
      return result.data || item;
    } catch {
      // Fallback to browser storage if API persistence is not available.
    }
  }
  upsertLocalItem("aiGrowthOsLocalCalendar", state.localCalendar, item);
  return item;
}

function contentItemPayload(item, options = {}) {
  const metadata = {
    ...(item.metadata || {}),
    owner: item.metadata?.owner || item.owner || "",
    audience: item.metadata?.audience || item.audience || ""
  };
  const payload = {
    demand_map_item_id: item.demand_map_item_id || null,
    title: item.title,
    content_type: item.content_type || "telegram_post",
    channel: item.channel || "website",
    status: item.status || "idea",
    target_url: item.target_url || null,
    metadata
  };
  if (!options.stripId && item.id) payload.id = item.id;
  return payload;
}

function calendarItemPayload(item, options = {}) {
  const payload = {
    content_item_id: item.content_item_id || null,
    title: item.title,
    channel: item.channel || "telegram",
    status: item.status === "scheduled" ? "scheduled" : "review",
    scheduled_for: item.scheduled_for || defaultScheduleDate(),
    timezone: item.timezone || "Europe/Moscow",
    export_path: item.export_path || null,
    metadata: item.metadata || {}
  };
  if (!options.stripId && item.id) payload.id = item.id;
  return payload;
}

function removeLocalItem(key, collection, id) {
  const next = collection.filter((entry) => entry.id !== id);
  collection.splice(0, collection.length, ...next);
  saveLocalJson(key, collection);
}

async function requestToolOwner() {
  await toolsModule.requestToolOwner();
}

async function generateImprovementTasks() {
  const metrics = deriveMetrics(state.metrics);
  const suggestions = [];
  if (!metrics.leads) {
    suggestions.push({
      title: text("Connect first lead source", "Подключить первый источник заявок"),
      owner: text("Sales", "Продажи"),
      status: "next",
      note: text("Leads are still zero, so the growth loop has no demand signal.", "Заявок пока 0, поэтому у цикла роста нет сигнала спроса.")
    });
  }
  if (!metrics.published_materials) {
    suggestions.push({
      title: text("Publish or hand off first approved material", "Опубликовать или передать первый согласованный материал"),
      owner: text("Publishing", "Публикации"),
      status: "next",
      note: text("Prepared materials become a result only after release or confirmed handoff.", "Подготовленные материалы становятся результатом после выпуска или подтверждённой передачи.")
    });
  }
  if (!metrics.leads && metrics.published_materials) {
    suggestions.push({
      title: text("Connect a signal source", "Подключить источник сигналов"),
      owner: text("Sales", "Продажи"),
      status: "next",
      note: text("Connect a form, CRM or table so requests after release are tracked.", "Подключить форму, CRM или таблицу, чтобы заявки после выпуска попадали в контур.")
    });
  }
  if (!suggestions.length) {
    suggestions.push({
      title: text("Review strongest performing asset", "Разобрать самый сильный материал"),
      owner: text("Growth", "Рост"),
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
  if ((item.status || "pending") !== "pending") {
    showToast(text("Decision is already saved.", "Решение уже сохранено."));
    closeModal();
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
    state.selectedApprovalId = state.approvals.find((approval) => approval.status === "pending")?.id || "";
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
    appendAudit(item, nextStatus, note);
    state.selectedApprovalId = state.approvals.find((approval) => approval.status === "pending")?.id || "";
    showToast(decisionToast(nextStatus));
    await loadData();
  } catch {
    showToast(text("Could not update the decision.", "Не удалось сохранить решение."));
  }
}

function isLocalApproval(item) {
  const id = String(item?.id || "");
  return !id || id.startsWith("local-approval-");
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

const toolsModule = createToolsModule({
  state,
  text,
  escapeHtml,
  escapeAttr,
  compactMetric,
  textarea,
  saveLocalJson,
  addLocalTask,
  addActivity,
  showToast,
  render
});

const publicationsModule = createPublicationsModule({
  state,
  publicationTabs,
  currentPublicationTab,
  escapeHtml,
  escapeAttr,
  text,
  tr,
  compactMetric,
  getApprovalContext,
  displayChannel,
  labelize,
  getSelectedApproval,
  statusChip,
  renderAssetPreview,
  actionButton,
  formatDate,
  currentLangValue: () => currentLang,
  field,
  packageAssets
});

const companyGrowthModule = createCompanyGrowthModule({
  state,
  text,
  tr,
  escapeHtml,
  escapeAttr,
  field,
  textarea,
  textValue,
  labelize,
  demandNextAction
});

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
