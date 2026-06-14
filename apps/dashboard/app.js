import { createToolsModule } from "./modules/tools.js?v=agentresult-working-os-121";
import { createPublicationsModule } from "./modules/publications.js?v=agentresult-working-os-132";
import { createCompanyGrowthModule } from "./modules/company-growth.js?v=agentresult-working-os-121";

const params = new URLSearchParams(window.location.search);
const demoMode = params.get("demo");
const isPilotDemo = demoMode === "pilot";
const PILOT_DEMO_TENANT_ID = "10000000-0000-4000-8000-000000000001";
const PRODUCTION_API_BASE = "/api/agentresult-os-demo";

if (demoMode === "reset" || isPilotDemo) {
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith("aiGrowthOs")) localStorage.removeItem(key);
  }
  localStorage.setItem("aiGrowthOsLang", "ru");
}

const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const queryApiBase = params.get("api") || (isPilotDemo ? PRODUCTION_API_BASE : "");
const queryTenantId = params.get("tenant") || (isPilotDemo ? PILOT_DEMO_TENANT_ID : "");
if (queryApiBase) localStorage.setItem("aiGrowthOsApiBase", queryApiBase);
if (queryTenantId) localStorage.setItem("aiGrowthOsTenantId", queryTenantId);
const configuredApiBase = localStorage.getItem("aiGrowthOsApiBase");
const API_BASE = configuredApiBase || (isLocalHost ? "http://localhost:3000" : "");
const IS_PRODUCTION_DEMO = isPilotDemo || (!isLocalHost && !configuredApiBase);
const rawTenantId = localStorage.getItem("aiGrowthOsTenantId");
const TENANT_ID =
  rawTenantId && rawTenantId !== "null" && rawTenantId !== "undefined"
    ? rawTenantId
    : "00000000-0000-0000-0000-000000000001";
const LANG_KEY = "aiGrowthOsLang";
let currentLang = localStorage.getItem(LANG_KEY) || "ru";

const RU = {
  "Growth Control": "GrothOS",
  "Home": "Сегодня",
  "Today": "Сегодня",
  "Strategy": "Стратегия",
  "Company": "Компания",
  "Publications": "Публикации",
  "Where to Find Clients": "Где искать клиентов",
  "Materials": "Материалы",
  "Topics": "Темы",
  "Release Queue": "Очередь выпуска",
  "Pack": "Пакет",
  "Automation": "Автоматизация",
  "Preparation rules": "Правила подготовки",
  "Results": "Результаты",
  "Settings": "Настройки",
  "Command Center": "Сегодня",
  "Content Pipeline": "Материалы",
  "Publication Desk": "Публикации",
  "Results Desk": "Результаты",
  "Knowledge Base": "База",
  "Waiting Live Check": "Проверка выхода",
  "Published": "Опубликовано",
  "Operate": "Операции",
  "Control": "Система",
  "Planning archive": "Архив планирования",
  "Offer, proof, author voice": "Оффер, доказательства, голос автора",
  "Materials in production": "Материалы в производстве",
  "Release queue and live check": "Выпуск и проверка",
  "Publication results and next steps": "Итоги публикаций",
  "Tools": "Инструменты",
  "Access": "Доступы",
  "Launch readiness": "Готовность запуска",
  "Approval rules": "Правила согласования",
  "Control status": "Состояние контроля",
  "Rules": "Настройки",
  "Command center": "Командный центр",
  "Cycle details": "Детали цикла",
  "Plan": "Стратегия",
  "Context": "Компания",
  "Release": "Публикации",
  "Result": "Результаты",
  "Rules, access, and launch": "Правила, доступы и запуск",
  "Revenue direction": "Куда двигаем выручку",
  "Work that can go outside": "Темы и тексты для выпуска",
  "Topics, QA, release": "Темы, QA, выпуск",
  "Business signals": "Бизнес-сигналы",
  "Publication signals": "Сигналы публикаций",
  "Summary": "Сегодня",
  "Client acquisition workflow": "Цикл привлечения клиентов",
  "What moves from topic to result": "Что движется от темы к результату",
  "30-day client acquisition plan": "30-дневный план привлечения",
  "What we sell, to whom, and why we are trusted": "Что продаём, кому и за счёт чего нам доверяют",
  "Pages and topics that can bring demand": "Страницы и темы, которые приводят спрос",
  "Drafts, posts, pages, emails": "Черновики, посты, страницы, письма",
  "Decisions before public publishing": "Решения перед публичной публикацией",
  "When and where materials go live": "Когда и где выходят материалы",
  "Approved texts for release queue": "Очередь выпуска",
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
  "Enable preparation rules": "Включить правила подготовки",
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
  "Drafts that need editorial action": "AI-тексты на QA менеджера",
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
  "Manager release queue is active": "Очередь выпуска активна",
  "Public distribution waits for approval": "Публичная дистрибуция ждёт согласования",
  "No backend issue detected": "Сервис работает штатно",
  "Backend is offline": "Сервис недоступен",
  "API connected": "Сервис подключён",
  "Demo data is active": "Активны демо-данные",
  "Publishing APIs": "Каналы выпуска",
  "Manager-controlled release active": "Выпуск через менеджера",
  "Next best actions": "Лучшие следующие действия",
  "Fastest path to useful demand": "Самый короткий путь к полезному спросу",
  "operator-light": "минимум оператора",
  "Automation level": "Уровень автоматизации",
  "What the OS can do now": "Что ОС умеет сейчас",
  "Done by OS": "ОС делает сама",
  "Needs human": "Нужен человек",
  "Blocked by integrations": "Заблокировано интеграциями",
  "Preparation candidates": "Кандидаты на подготовку",
  "Release queue, approval gates, content pack structure, status tracking": "Очередь выпуска, контур согласований, структура контент-пакета, статусы",
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
  "SEO page, Telegram posts, VC outline, email, lead magnet.": "Страница сайта, посты в Telegram, план статьи для VC, email, лид-магнит.",
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
  "manager-controlled": "через менеджера",
  "Week": "Неделя",
  "Channels": "Каналы",
  "SEO pages": "SEO-страницы",
  "Email": "Email",
  "Lead magnet": "Лид-магнит",
  "Package contents": "Состав пакета",
  "Product mode": "Режим продукта",
  "Manager-controlled": "Через менеджера",
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
  "handed off": "ждёт подтверждения результата",
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
  "publish/export": "запустить выпуск",
  "mark as released": "отметить выпуск",
  "mark as published": "подтвердить результат",
  "approval gate": "согласование",
  "waiting for owner decision": "ждёт решения",
  "ready for handoff": "очередь выпуска",
  "already shipped": "уже выпущено",
  "product page": "продуктовая страница",
  "pain page": "страница боли",
  "comparison page": "страница сравнения",
  "tool page": "страница-инструмент",
  "telegram post": "пост Telegram",
  "landing page": "лендинг",
  "vc article": "статья VC",
  "manual export": "fallback-выпуск",
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
  "Package preview assembled. ZIP remains disabled until package storage is connected.": "Предпросмотр пакета собран. ZIP будет доступен после подключения хранилища пакетов.",
  "ZIP storage is not connected yet. Button is disabled until package storage exists.": "ZIP-хранилище ещё не подключено. Кнопка выключена до появления хранилища пакетов.",
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
  "Schedule form will create a release queue item and approval request.": "Форма планирования создаст пункт очереди выпуска и согласование.",
  "Calendar CSV export prepared for fallback release.": "CSV календаря подготовлен для резервного выпуска.",
  "Agent task form is next: role, target, payload.": "Следующий шаг — форма агентной задачи: роль, цель, payload.",
  "Analytics import accepts CSV or API payloads.": "Можно загрузить CSV или данные из подключённого сервиса.",
  "Analytics Agent task queued placeholder.": "Заглушка: задача Analytics Agent будет поставлена в очередь.",
  "Risk checklist is visible in the approval detail.": "Чеклист рисков уже открыт в деталях согласования.",
  "Approval required before scheduled publishing can run.": "Нужно согласование перед запуском публикации по расписанию.",
  "Agent workflow": "Рабочий контур",
  "Human reviewer": "Собственник",
  "Just now": "Только что",
  "Today": "Сегодня",
  "Target channel: telegram.": "Целевой канал: Telegram.",
  "AI Growth OS launch post": "Launch-пост AgentResult Growth Control",
  "telegram": "Telegram",
  "website": "сайт",
  "email": "email",
  "channel publishing": "публикация в канал",
  "public claim": "публичное утверждение",
  "competitor comparison": "сравнение с конкурентом",
  "proof required": "нужны доказательства",
  "multi-channel distribution": "мультиканальная дистрибуция",
  "Growth Orchestrator": "AgentResult",
  "Publishing QA": "Контроль выпуска",
  "Content Factory": "Подготовка материалов",
  "Release Pack": "Пакет выпуска",
  "Created publishing approval request": "Создал заявку на согласование публикации",
  "Flagged public-channel approval gate": "Отметил обязательное согласование публичного канала",
  "Prepared release pack outline": "Подготовил структуру пакета выпуска",
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
  { route: "overview", title: "Command Center", group: "operate", primary: true },
  { route: "content-pipeline", title: "Content Pipeline", group: "operate" },
  { route: "publications", title: "Publication Desk", group: "operate" },
  { route: "analytics", title: "Results Desk", group: "operate" },
  { route: "offer-brain", title: "Knowledge Base", group: "control" },
  { route: "settings", title: "Settings", group: "control" }
];

const routeAliases = {
  "demand-map": "growth-plan",
  strategy: "growth-plan",
  company: "offer-brain",
  materials: "content-pipeline",
  content: "content-pipeline",
  approvals: "publications",
  "publishing-calendar": "publications",
  "manual-export": "publications",
  agents: "settings"
};

const publicationTabs = {
  approvals: { route: "approvals", label: "Release Queue" },
  calendar: { route: "publishing-calendar", label: "Waiting Live Check" },
  pack: { route: "manual-export", label: "Published" }
};

const publicationRoutes = Object.fromEntries(Object.entries(publicationTabs).map(([tab, item]) => [item.route, tab]));

const settingsTabs = {
  technical: { label: "Launch readiness" },
  autopilot: { label: "Approval rules" },
  tools: { label: "Access" }
};

const routes = {
  overview: { title: "Command Center", kicker: "Today" },
  "growth-plan": { title: "Knowledge Base", kicker: "Planning archive" },
  "offer-brain": { title: "Knowledge Base", kicker: "Offer, proof, author voice" },
  "content-pipeline": { title: "Content Pipeline", kicker: "Materials in production" },
  publications: { title: "Publication Desk", kicker: "Release queue and live check" },
  analytics: { title: "Results Desk", kicker: "Publication results and next steps" },
  settings: { title: "Settings", kicker: "Rules, access, and launch" },
  "demand-map": { title: "Knowledge Base", kicker: "Client acquisition workflow" },
  strategy: { title: "Knowledge Base", kicker: "Planning archive" },
  company: { title: "Knowledge Base", kicker: "Offer, proof, author voice" },
  materials: { title: "Content Pipeline", kicker: "Materials in production" },
  content: { title: "Content Pipeline", kicker: "Materials in production" },
  approvals: { title: "Publication Desk", kicker: "Release queue and live check" },
  "publishing-calendar": { title: "Publication Desk", kicker: "Release queue and live check" },
  "manual-export": { title: "Publication Desk", kicker: "Release queue and live check" },
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
        "Собственники B2B-компаний, агентства, интеграторы, SaaS-команды и сервисные компании, где материалы, заявки и решения часто зависают между людьми.",
      pains:
        "Материалы готовятся, но не выходят; заявки и ответы теряются; решения собственника запаздывают; команда работает в чатах; результат после выпуска не фиксируется.",
      proof:
        "Рабочий WebApp-прототип AgentResult, собранная архитектура рабочий контур -> хранилище -> Telegram/WebApp, прототип Growth Control и build-in-public история, где AgentResult строит AgentResult на AgentResult.",
      forbiddenClaims:
        "No guaranteed revenue growth, no guaranteed debt recovery, no 'replace the whole sales team', no error-free autonomy, no legal actions without approval, no automatic publishing or sending without approval.",
      tone: "Фразы автора: 'меньше каши', 'через решение', 'похоже на рабочий контур'. Стоп-слова: революционный, магия, гарантированный рост. Убрать AI-шаблон: 'в современном мире', длинные вступления, пустые списки преимуществ. Прямота: коротко, рабоче, без канцелярита. Proof/risk: не обещать магию и гарантированный рост. Решение QA: похоже / не похоже на автора.",
      authorVoiceContract: "Фразы автора: 'меньше каши', 'через решение', 'похоже на рабочий контур'. Стоп-слова: революционный, магия, гарантированный рост. Убрать AI-шаблон: 'в современном мире', длинные вступления, пустые списки преимуществ. Прямота: коротко, рабоче, без канцелярита. Proof/risk: не обещать магию и гарантированный рост. Решение QA: похоже / не похоже на автора.",
      competitors:
        "CRM integrators, Bitrix24 and amoCRM implementers, AI automation shops, performance agencies, no-code automators, internal operators, generic AI tools and SDR services.",
      products:
        "AgentResult Growth Control — контур решений, выпуска и результата\nAgentResult Sales OS — AI-agent sales system / CRM automation\nAgentResult Collect — отдельный контур денежных сигналов",
      domains: "agentresult-crm.vercel.app\nagentresult.ru\napp.agentresult.ru\napi.agentresult.ru\nagentresult.online",
      channels: "Telegram-контур управления, website/CMS, email, Bitrix24/amoCRM later, CSV/XLSX fallback",
      approvalOwner: "Owner approves public publishing, risky claims, client names, competitor comparisons and money-sensitive actions.",
      releaseOwner: "Менеджер контента проверяет фактологию, стиль автора и иишность перед выпуском.",
      firstSignalSource: "URL публикации, реакции канала, комментарии, репосты, сохранения или ручная отметка собственника."
    }
  },
  demand: [
    { id: "d1", title: "AI-агенты для B2B-продаж", item_type: "product_page", intent: "commercial", audience: "Собственники B2B-компаний", priority: 100, status: "brief" },
    { id: "d2", title: "Telegram CRM для собственника", item_type: "use_case_page", intent: "problem-aware", audience: "Собственники, которым не хочется жить внутри CRM", priority: 92, status: "brief" },
    { id: "d3", title: "Почему материалы не должны зависать в чатах", item_type: "pain_page", intent: "problem-aware", audience: "Собственники и руководители роста", priority: 88, status: "research" },
    { id: "d4", title: "AgentResult Growth Control для B2B-компаний", item_type: "product_page", intent: "commercial", audience: "Собственники и маркетинг B2B-компаний", priority: 84, status: "draft" }
  ],
  content: [
    { id: "c1", title: "Почему одного AI-агента недостаточно, чтобы наладить продажи", content_type: "telegram_post", channel: "telegram", status: "review", owner: "Egor" },
    { id: "c2", title: "AgentResult Growth Control для B2B-компаний", content_type: "landing_page", channel: "website", status: "draft", owner: "Egor" },
    { id: "c3", title: "Почему B2B-компаниям нужна агентная операционная система, а не только CRM", content_type: "article_outline", channel: "website", status: "brief", owner: "Egor" },
    { id: "c4", title: "Email: безопасный запуск AgentResult Growth Control", content_type: "email", channel: "email", status: "draft", owner: "Egor" },
    { id: "c5", title: "Лид-магнит: чеклист готовности к AgentResult Growth Control", content_type: "lead_magnet", channel: "website", status: "idea", owner: "Egor" }
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
      requested_by: "AgentResult",
      preview: "Сам по себе AI не двигает продажи. Нужен операционный контур: задачи, CRM, согласования, Telegram-контроль и история действий."
    },
    {
      id: "a2",
      summary: "Согласовать формулировки для страницы AgentResult Growth Control",
      scope: "sensitive_claim",
      target_type: "content_item",
      target_id: "c2",
      content_item_id: "c2",
      status: "approved",
      risk_flags: ["competitor comparison", "proof required"],
      requested_by: "Контроль выпуска",
      decided_by: "owner",
      decision_note: "Можно ставить в очередь выпуска менеджера.",
      preview: "Перед публичной публикацией странице нужны формулировки, подкреплённые доказательствами."
    },
    {
      id: "a3",
      summary: "Согласовать недельный пакет публикаций AgentResult",
      scope: "publish",
      target_type: "publishing_calendar_item",
      target_id: "p3",
      calendar_item_id: "p3",
      status: "approved",
      risk_flags: ["multi-channel distribution"],
      requested_by: "Content Factory",
      decided_by: "owner",
      decision_note: "Пакет можно ставить в очередь выпуска менеджера.",
      preview: "В пакете: страница сайта, два Telegram-поста, план статьи, письмо и лид-магнит."
    }
  ],
  calendar: [
    { id: "p1", title: "Telegram-пост: почему бизнесу нужен операционный контур, а не один AI-агент", channel: "telegram", scheduled_for: "2026-05-28 10:00", status: "published" },
    { id: "p2", content_item_id: "c2", title: "AgentResult Growth Control для B2B-компаний", channel: "website", scheduled_for: "2026-05-29 12:00", status: "scheduled" },
    { id: "p3", title: "Недельный пакет публикаций AgentResult", channel: "manual_export", scheduled_for: "2026-05-30 16:00", status: "draft" }
  ],
  agents: [
    "AgentResult",
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
    "Контроль выпуска"
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
  distributionSignals: [],
  publicationResults: [],
  publicationResultsSource: "derived",
  selectedPublicationResultId: "",
  resultSignals: [],
  agents: demo.agents,
  tasks: [],
  metrics: {
    content_items: demo.content.length,
    calendar_items: demo.calendar.length,
    pending_approvals: demo.approvals.filter((item) => item.status === "pending").length,
    tasks_created: 0,
    approvals_total: demo.approvals.length,
    published_materials: shippedCalendarCount(demo.calendar),
    distribution_signals: 0,
    result_signals: 0,
    leads: 3,
    receivables_in_progress: 0,
    promised_payments: 0,
    recovered_payments: 0,
    ...loadLocalJson("aiGrowthOsMetrics", {})
  },
  decisionModal: null,
  formModal: null,
  batchApprovalModal: false,
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
    { at: "Today 09:42", actor: "AgentResult", event: "Подготовил первый недельный пакет материалов AgentResult" },
    { at: "Today 09:39", actor: "Контроль выпуска", event: "Отметил контур согласования для продуктовых формулировок" },
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

    const [me, offer, demand, approvals, agents, metrics, content, calendar, distributionSignals, publicationResults, workspaceState] = await Promise.all([
      api("/me"),
      api("/offer"),
      api("/demand-map"),
      api("/approvals"),
      api("/agents"),
      api("/analytics/overview"),
      api("/content/items"),
      api("/publishing/calendar"),
      api("/distribution-signals").catch(() => api("/result-signals").catch(() => ({ data: [] }))),
      api("/publication-results").catch(() => ({ data: [] })),
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
    state.distributionSignals = Array.isArray(distributionSignals.data) ? distributionSignals.data : state.distributionSignals;
    const backendPublicationResults = Array.isArray(publicationResults.data) ? publicationResults.data : [];
    state.publicationResults = backendPublicationResults.length
      ? backendPublicationResults
      : derivePublicationResults(state.distributionSignals, state.calendar, state.content);
    state.publicationResultsSource = backendPublicationResults.length ? "backend" : "derived";
    state.resultSignals = state.distributionSignals;
    state.workspaceState = workspaceState.data && typeof workspaceState.data === "object" ? workspaceState.data : state.workspaceState;
    state.tasks = Array.isArray(tasks.data) ? tasks.data.map(normalizeTask) : [];
    state.metrics = {
      ...deriveMetrics(metrics.data || {}),
      ...loadLocalJson("aiGrowthOsMetrics", {}),
      pending_approvals: state.approvals.filter((item) => item.status === "pending").length,
      calendar_items: state.calendar.length,
      content_items: state.content.length,
      approvals_total: state.approvals.length,
      published_materials: shippedCalendarCount(state.calendar),
      distribution_signals: state.distributionSignals.length,
      result_signals: state.distributionSignals.length
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
      published_materials: shippedCalendarCount(state.calendar),
      distribution_signals: state.distributionSignals.length,
      result_signals: state.distributionSignals.length
    };
    state.publicationResults = derivePublicationResults(state.distributionSignals, state.calendar, state.content);
    state.publicationResultsSource = "derived";
  }

  if (shouldUseLocalWorkspaceFallback()) {
    state.demand = mergeLocalItems(state.demand, state.localDemand);
    state.content = mergeLocalItems(state.content, state.localContent);
    state.calendar = mergeLocalItems(state.calendar, state.localCalendar);
    state.approvals = mergeLocalItems(state.approvals, state.localApprovals);
    state.tasks = mergeLocalItems(state.tasks, state.localTasks).map(normalizeVisibleTask);
  } else {
    state.tasks = state.tasks.map(normalizeVisibleTask);
  }
  normalizePilotProfileDefaults();
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
  refreshPublicationResults();

  if (!state.selectedApprovalId && state.approvals[0]) state.selectedApprovalId = state.approvals[0].id;
  render();
}

function mergeLocalItems(remoteItems, localItems) {
  const byId = new Map((remoteItems || []).map((item) => [item.id, item]));
  for (const item of localItems || []) byId.set(item.id, item);
  return [...byId.values()];
}

function shouldUseLocalWorkspaceFallback() {
  return !state.online || IS_PRODUCTION_DEMO;
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
  if (!shouldUseLocalWorkspaceFallback()) return;
  await reconcileApprovedCalendarApprovals();

  for (const contentItem of state.content) {
    const linkedCalendar = state.calendar.find((item) => item.content_item_id === contentItem.id);
    if (!linkedCalendar) continue;

    if (contentItem.status === "approved" && !["scheduled", "handed_off", "published"].includes(linkedCalendar.status)) {
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

async function reconcileApprovedCalendarApprovals() {
  const terminalStatuses = new Set(["scheduled", "handed_off", "published"]);
  const approvedCalendarApprovals = state.approvals.filter((approval) =>
    approval.status === "approved" && approval.target_type === "publishing_calendar_item"
  );

  for (const approval of approvedCalendarApprovals) {
    const calendarId = approval.calendar_item_id || approval.target_id;
    const linkedCalendar = state.calendar.find((item) => item.id === calendarId);
    if (!linkedCalendar || terminalStatuses.has(linkedCalendar.status)) continue;

    linkedCalendar.status = "scheduled";
    linkedCalendar.updated_at = new Date().toISOString();
    linkedCalendar.metadata = {
      ...(linkedCalendar.metadata || {}),
      approval_id: approval.id,
      decision_note: approval.decision_note || linkedCalendar.metadata?.decision_note || "",
      decided_by: approval.decided_by || linkedCalendar.metadata?.decided_by || "",
      decided_at: approval.decided_at || linkedCalendar.metadata?.decided_at || linkedCalendar.updated_at
    };
    await persistCalendarState(linkedCalendar);
  }
}

function normalizePilotProfileDefaults() {
  if (!IS_PRODUCTION_DEMO) return;
  state.offer = {
    ...state.offer,
    profile: {
      ...(demo.offer?.profile || {}),
      ...(state.offer?.profile || {})
    }
  };
}

function normalizeAgentResultLanguageArtifacts() {
  const replacements = new Map([
    ["Workflow link verification material", "Проверка согласования и публикации"],
    ["Проверка owner workflow: согласование и публикация", "Проверка согласования и публикации"],
    ["Weekly AgentResult growth pack", "Недельный пакет публикаций AgentResult"],
    ["AI agents for B2B sales", "AI-агенты для B2B-продаж"],
    ["How to recover overdue receivables without hiring an operator", "Как не терять решения и выпуск в чатах"],
    ["Как вернуть просроченную дебиторку без отдельного оператора", "Как не терять решения и выпуск в чатах"],
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
    if (item.audience === "Owners and finance leads with overdue invoices") item.audience = "Собственники и руководители роста";
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
  return String(status || "") === "published";
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
    distribution_signals: Number(safeSource.distribution_signals ?? safeSource.result_signals ?? state.distributionSignals.length ?? state.resultSignals.length ?? 0),
    result_signals: Number(safeSource.result_signals ?? safeSource.distribution_signals ?? state.distributionSignals.length ?? state.resultSignals.length ?? 0),
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

function derivePublicationResults(signals = [], calendarItems = [], contentItems = []) {
  const calendarById = new Map(calendarItems.map((item) => [String(item.id || ""), item]));
  const contentById = new Map(contentItems.map((item) => [String(item.id || ""), item]));
  const sourceSignals = signals.length
    ? signals
    : calendarItems.filter((item) => item.status === "published").map((item) => distributionSignalFromCalendar(item));
  return sourceSignals.map((signal) => {
    const calendarItem = calendarById.get(String(signal.calendar_item_id || "")) || null;
    const contentItem = contentById.get(String(signal.content_item_id || calendarItem?.content_item_id || "")) || null;
    return publicationResultFromSignal(signal, calendarItem, contentItem);
  });
}

function distributionSignalFromCalendar(item) {
  return {
    id: `calendar-distribution-signal-${item.id}`,
    calendar_item_id: item.id,
    content_item_id: item.content_item_id || null,
    status: "confirmed",
    source: item.channel || "manual",
    signal_type: "distribution_signal.confirmed",
    title: item.title,
    note: item.metadata?.result_note || text("Confirmed publication", "Подтверждённая публикация"),
    occurred_at: item.updated_at || item.scheduled_for || "",
    confirmed_by: item.metadata?.published_confirmed_by || null,
    metadata: {
      calendar_item_id: item.id,
      title: item.title,
      status: "confirmed"
    }
  };
}

function publicationResultFromSignal(signal, calendarItem = null, contentItem = null) {
  const signalMeta = signal?.metadata || {};
  const calendarMeta = calendarItem?.metadata || {};
  const contentMeta = contentItem?.metadata || {};
  const result = calendarMeta.publication_result || {};
  const reactions = result.reactions || {
    comments: Number(result.comments ?? signalMeta.comments ?? 0),
    reposts: Number(result.reposts ?? signalMeta.reposts ?? 0),
    saves: Number(result.saves ?? signalMeta.saves ?? 0),
    reactions: Number(result.reactions_count ?? signalMeta.reactions_count ?? 0)
  };
  const rawNextStep = result.next_step || signalMeta.next_step;
  const nextStep = ["reuse", "expand", "update", "leave"].includes(rawNextStep) ? rawNextStep : "leave";
  const url = result.publication_url || calendarMeta.publication_url || signalMeta.publication_url || "";
  return {
    id: `publication-result-${signal?.id || calendarItem?.id || Date.now()}`,
    distribution_signal_id: signal?.id || "",
    calendar_item_id: signal?.calendar_item_id || calendarItem?.id || "",
    content_item_id: signal?.content_item_id || calendarItem?.content_item_id || "",
    title: signal?.title || calendarItem?.title || contentItem?.title || text("Confirmed publication", "Подтверждённая публикация"),
    channel: calendarItem?.channel || signal?.source || "manual",
    format: contentItem?.content_type || calendarMeta.format || contentMeta.format || "publication",
    publication_url: url,
    status: signal?.status || "confirmed",
    confirmed_at: signal?.occurred_at || calendarItem?.updated_at || "",
    primary_reactions: reactions,
    next_step: nextStep,
    next_step_note: result.next_step_note || signalMeta.next_step_note || "",
    evidence: {
      has_url: Boolean(url),
      has_reactions: Object.values(reactions).some((value) => Number(value) > 0),
      source: signal?.source || calendarItem?.channel || "manual"
    }
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
  const showOnline = state.online && !IS_PRODUCTION_DEMO;
  helpButton.textContent = showOnline ? text("Online", "Онлайн") : text("Demo", "Демо");
  helpButton.hidden = false;
  helpButton.setAttribute("aria-label", showOnline ? text("Backend online", "Backend online") : text("Demo mode", "Demo mode"));
  helpButton.classList.toggle("online", showOnline);
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
            <p class="eyebrow">${text("Help", "Справка")}</p>
            <h3 id="guideTitle">${text("Weekly workflow", "Недельный цикл")}</h3>
          </div>
          <button class="button secondary" data-action="close-help">${tr("Close")}</button>
        </div>
        <div class="guide-steps">
          ${guideStep("1", text("Weekly topics", "Темы недели"), text("Approve topics and boundaries once a week.", "Согласуйте темы и границы один раз в неделю."))}
          ${guideStep("2", text("Manager QA", "Менеджер QA"), text("Routine text QA stays with the manager.", "Рутинный QA текста остаётся у менеджера."))}
          ${guideStep("3", text("Check results", "Проверьте результат"), text("Confirmed releases and distribution signals are tracked in Results.", "Подтверждённые выпуски и сигналы дистрибуции отслеживаются в результатах."))}
        </div>
        <div class="modal-warning">${text("Help stays available from the top bar.", "Справка доступна в верхней панели.")}</div>
        <div class="detail-actions">
          <button class="button primary" data-action="close-help">${text("Close", "Закрыть")}</button>
          <button class="button secondary" data-action="go-approvals">${text("Go to weekly topics", "К темам недели")}</button>
        </div>
      </section>
    `;
    return;
  }

  if (state.batchApprovalModal) {
    elements.modalRoot.innerHTML = renderWeeklyBatchApprovalModal();
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
  const modalTitle = action === "approve" ? text("Approve weekly topic", "Согласовать тему недели") : action === "reject" ? text("Skip weekly topic", "Не брать тему недели") : text("Request boundary changes", "Правки по границе");
  const submitLabel = modalTitle;

  elements.modalRoot.innerHTML = `
    <div class="modal-backdrop" role="presentation" data-action="close-modal"></div>
    <section class="decision-modal" role="dialog" aria-modal="true" aria-labelledby="decisionTitle">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${text("Weekly topic", "Тема недели")}</p>
          <h3 id="decisionTitle">${escapeHtml(modalTitle)}</h3>
        </div>
        <button class="button secondary" data-action="close-modal">${escapeHtml(text("Close", "Закрыть"))}</button>
      </div>
      <div class="decision-context">
        <strong>${escapeHtml(tr(context?.title || "Weekly topic"))}</strong>
        <span>${escapeHtml(displayChannel(context?.channel || "channel"))} · ${escapeHtml(context?.when || tr("not scheduled"))}</span>
      </div>
      <label>
        ${escapeHtml(text("Comment", "Комментарий"))}${requiresNote ? "" : ` <span>${escapeHtml(text("optional", "необязательно"))}</span>`}
        <textarea id="decisionNote" rows="4" placeholder="${escapeAttr(requiresNote ? text("Which boundary, claim or fact must change", "Какую границу, утверждение или факт изменить") : text("Optional boundary note", "Заметка по границе, если нужна"))}"></textarea>
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
  const publicationResultItem = state.calendar.find((item) => item.id === modal.itemId) || null;
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
      title: text("Record first distribution signals", "Зафиксировать первые сигналы дистрибуции"),
      submit: "submit-metrics-form",
      button: text("Save signals", "Сохранить сигналы"),
      body: `
        <div class="form-grid two-col">
          ${numberField(text("Primary reactions", "Первичные реакции"), "metricLeads", state.metrics.leads || 0)}
          ${numberField(text("Follow-up actions", "Следующие действия"), "metricTasks", state.metrics.tasks_created || 0)}
        </div>
        <div class="form-grid">
          ${numberField(text("Confirmed releases", "Подтверждённые выпуски"), "metricPublished", state.metrics.published_materials || 0)}
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
            ["AgentResult", "AgentResult"],
            ["Подготовка материалов", text("Material preparation", "Подготовка материалов")],
            ["Контроль выпуска", text("Release control", "Контроль выпуска")],
            ["Sales owner", text("Sales owner", "Ответственный за продажи")]
          ], "AgentResult")}
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
    publicationResult: {
      eyebrow: text("Publication result", "Результат публикации"),
      title: text("Confirm publication result", "Подтвердить результат публикации"),
      submit: "submit-publication-result-form",
      button: text("Confirm result", "Подтвердить результат"),
      body: publicationResultForm(publicationResultItem)
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

function renderWeeklyBatchApprovalModal() {
  const pending = state.approvals.filter((approval) => approval.status === "pending");
  const contexts = pending.map((item) => getApprovalContext(item));
  const titles = contexts.map((context) => context.title).filter(Boolean);
  const channels = [...new Set(contexts.map((context) => displayChannel(context.channel)).filter(Boolean))];
  const riskCount = contexts.filter((context) => (context.checklist || []).some((check) => !check.ok)).length;
  const title = pending.length === 1
    ? titles[0] || text("weekly topic", "тема недели")
    : text(`${pending.length} weekly topics`, `${pending.length} тем недели`);
  return `
    <div class="modal-backdrop" role="presentation" data-action="close-modal"></div>
    <section class="decision-modal weekly-batch-modal" role="dialog" aria-modal="true" aria-labelledby="weeklyBatchDecisionTitle">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${text("Owner decision", "Решение собственника")}</p>
          <h3 id="weeklyBatchDecisionTitle">${text("Approve weekly batch", "Согласовать пакет недели")}</h3>
        </div>
        <button class="button secondary" data-action="close-modal">${escapeHtml(text("Close", "Закрыть"))}</button>
      </div>
      <div class="decision-context">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(channels.join(", ") || text("channel not set", "канал не задан"))} · ${escapeHtml(riskCount ? text(`${riskCount} risk checks`, `${riskCount} проверок риска`) : text("No obvious risk", "Явного риска нет"))}</span>
      </div>
      <div class="weekly-batch-confirmation">
        <div>
          <span>${text("Will be saved", "Будет зафиксировано")}</span>
          <strong>${escapeHtml(text("Topic and boundary for the week", "Тема и граница недели"))}</strong>
        </div>
        <div>
          <span>${text("Will not happen", "Не произойдёт")}</span>
          <strong>${escapeHtml(text("No automatic publishing", "Без автоматической публикации"))}</strong>
        </div>
        <div>
          <span>${text("Next status", "Следующий статус")}</span>
          <strong>${escapeHtml(text("AgentResult drafts -> manager QA", "AgentResult пишет -> QA менеджера"))}</strong>
        </div>
      </div>
      <div class="modal-warning">${escapeHtml(text("Routine text release moves through manager QA without another owner approval. Exceptions return to the owner.", "Рутинный выпуск текста идёт через QA менеджера без нового согласования собственника. Исключения вернутся собственнику."))}</div>
      <div class="detail-actions">
        <button class="button primary" data-action="confirm-weekly-batch-approval">${escapeHtml(text("Approve weekly batch", "Согласовать пакет недели"))}</button>
        <button class="button secondary" data-action="close-modal">${escapeHtml(text("Cancel", "Отмена"))}</button>
      </div>
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
        <strong>${escapeHtml(text("Release queue item", "Пункт очереди выпуска"))}</strong>
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

function publishingOwnerNote(item) {
  return String(item?.metadata?.handoff_note || item?.metadata?.owner_note || item?.metadata?.result_note || "").trim();
}

function publicationResultForm(item) {
  const result = item?.metadata?.publication_result || {};
  const reactions = result.reactions || {};
  return `
    <input id="publicationResultCalendarId" type="hidden" value="${escapeAttr(item?.id || "")}" />
    <div class="decision-context">
      <strong>${escapeHtml(item?.title || text("Publication", "Публикация"))}</strong>
      <span>${escapeHtml(displayChannel(item?.channel || "manual"))} · ${escapeHtml(text("Confirm only after the material is visible.", "Подтверждайте только после видимого выхода."))}</span>
    </div>
    ${field(text("Publication URL", "URL публикации"), "publicationResultUrl", result.publication_url || "")}
    <div class="form-grid two-col">
      ${field(text("Format", "Формат"), "publicationResultFormat", result.format || item?.metadata?.format || "")}
      ${selectField(text("Next content step", "Следующий контент-шаг"), "publicationResultNextStep", [
        ["reuse", text("Reuse", "Переиспользовать")],
        ["expand", text("Expand", "Расширить")],
        ["update", text("Update", "Обновить")],
        ["leave", text("Leave", "Оставить")]
      ], result.next_step || "reuse")}
    </div>
    <div class="form-grid two-col">
      ${numberField(text("Comments", "Комментарии"), "publicationResultComments", reactions.comments || 0)}
      ${numberField(text("Reposts", "Репосты"), "publicationResultReposts", reactions.reposts || 0)}
      ${numberField(text("Saves", "Сохранения"), "publicationResultSaves", reactions.saves || 0)}
      ${numberField(text("Reactions", "Реакции"), "publicationResultReactions", reactions.reactions || 0)}
    </div>
    ${textarea(text("Next step note", "Заметка к следующему шагу"), "publicationResultNextStepNote", result.next_step_note || "")}
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
  const groups = [
    [text("Operate", "Работа"), navItems.filter((item) => item.group === "operate")],
    [text("Control", "Контроль"), navItems.filter((item) => item.group === "control")]
  ];
  elements.navList.innerHTML = groups.map(([label, items]) => `
    <div class="nav-group">
      <span class="nav-group-label">${escapeHtml(label)}</span>
      ${items.map((item) => `
        <a href="#/${item.route}" class="nav-link ${item.primary ? "primary" : ""}" data-route="${item.route}">${escapeHtml(tr(item.title))}</a>
      `).join("")}
    </div>
  `).join("");
  elements.navList.querySelectorAll("[data-route]").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === activeRoute);
  });
  elements.navList.querySelector(".nav-link.active")?.scrollIntoView({ block: "nearest", inline: "nearest" });
}

function renderActions() {
  const routeKey = canonicalRoute();
  const publicationActions = {
    approvals: [],
    calendar: [],
    pack: [
      actionButton("Assemble package", "secondary", "assemble-pack"),
      actionButton(text("Download TXT", "Скачать TXT"), state.exportAssembled ? "secondary" : "secondary disabled", "download-pack"),
      actionButton("Copy texts", "secondary", "copy-pack")
    ]
  };
  const actions = {
    overview: [],
    "growth-plan": [],
    "offer-brain": [actionButton(text("Save", "Сохранить"), "secondary", "save-offer")],
    "content-pipeline": [],
    publications: publicationActions[currentPublicationTab()],
    analytics: [],
    settings: currentSettingsTab() === "tools"
      ? []
      : currentSettingsTab() === "technical"
        ? []
        : []
  };
  const detailHomeAction = routeKey === "overview" ? [] : [actionButton(text("Back to Today", "К Сегодня"), "secondary", "go-overview")];
  elements.routeActions.innerHTML = [...detailHomeAction, ...(actions[routeKey] || [])].join("");
}

function actionButton(label, variant, action) {
  const disabled = variant.includes("disabled");
  return `<button class="button ${variant}" data-action="${action}" ${disabled ? "disabled" : ""}>${escapeHtml(tr(label))}</button>`;
}

function renderOverview() {
  const pending = state.approvals.filter((item) => item.status === "pending");
  return `
    ${ownerCommandCenter(pending)}
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

function ownerCommandCenter(pending) {
  const command = ownerCommandPriority(pending);
  const statuses = ownerCommandStatuses(pending);
  const rows = commandCenterRows(pending);
  const activeRows = rows.filter((row) => row.state !== "done").length;

  return `
    <section class="owner-command-center" aria-label="${escapeAttr(text("Owner command center", "Командный центр собственника"))}">
      <div class="command-center-head">
        <div>
          <p class="eyebrow">${text("Command Center", "Командный центр")}</p>
          <h3>${escapeHtml(command.title)}</h3>
          <p>${escapeHtml(command.note)}</p>
        </div>
        <button class="button primary" data-action="${escapeAttr(command.action)}" data-id="${escapeAttr(command.id || "")}">${escapeHtml(command.label)}</button>
      </div>
      <div class="owner-command-statuses">
        ${statuses.map((item) => `
          <article class="${item.state}">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(String(item.value))}</strong>
            <p>${escapeHtml(item.note)}</p>
          </article>
        `).join("")}
      </div>
      <div class="command-center-workbench">
        <div class="command-center-table-head">
          <div>
            <p class="eyebrow">${text("Action queue", "Очередь действий")}</p>
            <h4>${escapeHtml(text(`${activeRows} active items`, `${activeRows} активных пунктов`))}</h4>
          </div>
          <div class="command-center-filters" aria-label="${escapeAttr(text("Queue filters", "Фильтры очереди"))}">
            <span>${escapeHtml(state.online ? text("Backend source", "Источник: backend") : text("Demo source", "Источник: демо"))}</span>
            <span>${escapeHtml(text("Owner + manager loop", "Контур: собственник + менеджер"))}</span>
          </div>
        </div>
        <div class="command-center-table" role="table" aria-label="${escapeAttr(text("Command Center action queue", "Очередь действий командного центра"))}">
          <div class="command-center-row command-center-row-header" role="row">
            <span role="columnheader">${escapeHtml(text("Priority", "Приоритет"))}</span>
            <span role="columnheader">${escapeHtml(text("Work item", "Объект"))}</span>
            <span role="columnheader">${escapeHtml(text("Owner", "Роль"))}</span>
            <span role="columnheader">${escapeHtml(text("State", "Статус"))}</span>
            <span role="columnheader">${escapeHtml(text("Due", "Срок"))}</span>
            <span role="columnheader">${escapeHtml(text("Action", "Действие"))}</span>
          </div>
          ${rows.map(commandCenterRow).join("")}
        </div>
      </div>
    </section>
  `;
}

function commandCenterRows(pending) {
  const rows = [];
  pending.forEach((approval) => {
    const context = getApprovalContext(approval);
    rows.push({
      priority: text("P1", "P1"),
      kind: text("Approval", "Согласование"),
      title: context.title || approval.summary || text("Owner decision", "Решение собственника"),
      meta: approval.summary || context.channel || "",
      owner: text("Owner", "Собственник"),
      state: "active",
      status: text("Needs decision", "Ждёт решения"),
      due: formatDate(context.raw?.scheduled_for || context.when || approval.created_at),
      action: "go-approval",
      id: approval.id,
      label: text("Open", "Открыть")
    });
  });

  state.content
    .filter((item) => ["approved", "revised_draft"].includes(materialOwnerStatus(item)) && !materialCalendarItem(item))
    .forEach((item) => {
      rows.push({
        priority: text("P2", "P2"),
        kind: text("QA", "QA"),
        title: item.title,
        meta: `${displayChannel(item.channel || "manual")} · ${tr(labelize(item.content_type || "material"))}`,
        owner: text("Manager", "Менеджер"),
        state: "active",
        status: text("QA needed", "Нужен QA"),
        due: formatDate(item.updated_at || item.created_at),
        action: "mark-manager-qa-passed",
        id: item.id,
        label: text("QA passed", "QA пройден")
      });
    });

  state.calendar
    .filter((item) => item.status === "scheduled")
    .forEach((item) => {
      rows.push({
        priority: text("P2", "P2"),
        kind: text("Release", "Выпуск"),
        title: item.title,
        meta: displayChannel(item.channel || "manual"),
        owner: text("Release owner", "Ответственный"),
        state: "queued",
        status: text("Ready for handoff", "К передаче"),
        due: formatDate(item.scheduled_for || item.updated_at),
        action: "mark-calendar-exported",
        id: item.id,
        label: text("Hand off", "Передать")
      });
    });

  state.calendar
    .filter((item) => item.status === "handed_off")
    .forEach((item) => {
      rows.push({
        priority: text("P1", "P1"),
        kind: text("Live check", "Проверка выхода"),
        title: item.title,
        meta: displayChannel(item.channel || "manual"),
        owner: text("Owner", "Собственник"),
        state: "active",
        status: text("Needs result", "Ждёт результат"),
        due: formatDate(item.updated_at || item.scheduled_for),
        action: "mark-calendar-published",
        id: item.id,
        label: text("Confirm", "Подтвердить")
      });
    });

  const openResults = state.publicationResults.filter((item) => !item.next_step || item.next_step === "leave").slice(0, 3);
  openResults.forEach((item) => {
    rows.push({
      priority: text("P3", "P3"),
      kind: text("Result", "Результат"),
      title: item.title || text("Publication result", "Результат публикации"),
      meta: `${displayChannel(item.channel || "manual")} · ${item.publication_url || text("URL recorded", "URL зафиксирован")}`,
      owner: text("Content lead", "Контент-лид"),
      state: "muted",
      status: text("Choose next step", "Выбрать шаг"),
      due: formatDate(item.confirmed_at || item.occurred_at),
      action: "go-analytics",
      id: item.calendar_item_id || item.id,
      label: text("Review", "Смотреть")
    });
  });

  if (!rows.length) {
    rows.push({
      priority: text("P3", "P3"),
      kind: text("Planning", "Планирование"),
      title: text("Choose the next content topic", "Выбрать следующую тему"),
      meta: text("No blocking action is waiting.", "Блокирующих действий нет."),
      owner: text("Owner", "Собственник"),
      state: "done",
      status: text("Clear", "Чисто"),
      due: text("Today", "Сегодня"),
      action: "go-demand-map",
      id: "",
      label: text("Plan", "План")
    });
  }

  return rows.sort((a, b) => commandPriorityRank(a.priority) - commandPriorityRank(b.priority));
}

function commandPriorityRank(priority) {
  if (String(priority).includes("1")) return 1;
  if (String(priority).includes("2")) return 2;
  return 3;
}

function commandCenterRow(row) {
  return `
    <div class="command-center-row ${escapeAttr(row.state)}" role="row">
      <span role="cell"><em class="queue-priority">${escapeHtml(row.priority)}</em></span>
      <span role="cell" class="queue-title">
        <strong>${escapeHtml(row.title)}</strong>
        <small>${escapeHtml(row.kind)} · ${escapeHtml(row.meta || text("No extra context", "Без контекста"))}</small>
      </span>
      <span role="cell">${escapeHtml(row.owner)}</span>
      <span role="cell"><mark>${escapeHtml(row.status)}</mark></span>
      <span role="cell">${escapeHtml(row.due || text("Not set", "Не задано"))}</span>
      <span role="cell">
        <button class="button secondary table-button" data-action="${escapeAttr(row.action)}" data-id="${escapeAttr(row.id || "")}">${escapeHtml(row.label)}</button>
      </span>
    </div>
  `;
}

function weeklyRhythmPanel() {
  const steps = [
    {
      label: text("Owner", "Собственник"),
      title: text("Weekly topic approved", "Тема недели согласована")
    },
    {
      label: text("AgentResult", "AgentResult"),
      title: text("AI draft + style check", "AI-текст + проверка стиля")
    },
    {
      label: text("Manager QA", "Менеджер QA"),
      title: text("Style and facts checked", "Стиль и факты проверены")
    },
    {
      label: text("Publications / Results", "Публикации / результаты"),
      title: text("Release queue -> confirmation -> signal", "Очередь выпуска -> подтверждение -> сигнал")
    }
  ];

  return `
    <section class="weekly-rhythm-panel" aria-label="${escapeAttr(text("Weekly rhythm", "Недельный ритм"))}">
      <div class="weekly-rhythm-head">
        <p class="eyebrow">${text("Weekly rhythm", "Недельный ритм")}</p>
        <h3>${text("Topic -> text -> QA -> release -> signal", "Тема -> текст -> QA -> выпуск -> сигнал")}</h3>
      </div>
      <div class="weekly-rhythm-grid">
        ${steps.map((step) => `
          <article class="weekly-rhythm-step">
            <span>${escapeHtml(step.label)}</span>
            <strong>${escapeHtml(step.title)}</strong>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function ownerCommandPriority(pending) {
  const handoff = state.calendar.find((item) => item.status === "handed_off");
  if (handoff) {
    return {
      title: text(`Confirm result: ${handoff.title}`, `Подтвердить результат: ${handoff.title}`),
      note: text("Confirm only after the release is live.", "Подтвердить только после выхода."),
      action: "mark-calendar-published",
      id: handoff.id,
      label: text("Confirm result", "Подтвердить результат")
    };
  }

  const pendingApproval = pending[0] || null;
  if (pendingApproval) {
    const context = getApprovalContext(pendingApproval);
    return {
      title: text(`Approve weekly topic: ${context.title}`, `Согласовать тему недели: ${context.title}`),
      note: text("Approve the topic and boundary once. Then AgentResult drafts; manager QA moves it to release.", "Согласовать тему и границу один раз. Дальше AgentResult пишет; менеджер QA ведёт к выпуску."),
      action: "go-approval",
      id: pendingApproval.id,
      label: text("Approve topic", "Согласовать тему")
    };
  }

  const scheduled = state.calendar.find((item) => item.status === "scheduled");
  if (scheduled) {
    return {
      title: text(`Release is with manager: ${scheduled.title}`, `Выпуск у менеджера: ${scheduled.title}`),
      note: text("No owner decision now. Next check: release status.", "Сейчас решение не нужно. Следующий контроль: статус выпуска."),
      action: "go-calendar",
      id: scheduled.id,
      label: text("Open status", "Открыть статус")
    };
  }

  const approved = state.content.find((item) => materialOwnerStatus(item) === "approved");
  if (approved) {
    return {
      title: text(`Text QA is with manager: ${approved.title}`, `QA текста у менеджера: ${approved.title}`),
      note: text("Manager checks facts, AI-ishness and author voice.", "Менеджер проверяет факты, иишность и стиль."),
      action: "go-content",
      id: approved.id,
      label: text("Open status", "Открыть статус")
    };
  }

  const publishedCount = state.calendar.filter((item) => item.status === "published").length;
  if (publishedCount) {
    return {
      title: text("Check the publication result", "Проверить результат публикации"),
      note: text("Check channel, URL, first reactions, and next content step.", "Проверьте канал, URL, первые реакции и следующий контент-шаг."),
      action: "go-analytics",
      id: "",
      label: text("Open results", "Открыть результаты")
    };
  }

  return {
    title: text("Choose the next weekly topic", "Выбрать следующую тему недели"),
    note: text("No urgent owner decision is waiting. Start from one demand topic and move it to release.", "Срочных решений собственника нет. Начните с одной темы спроса и доведите её до выпуска."),
    action: "go-demand-map",
    id: "",
    label: text("Open strategy", "Открыть стратегию")
  };
}

function ownerLoopBlockingAction() {
  const handoff = state.calendar.find((item) => item.status === "handed_off");
  if (handoff) {
    return {
      title: text(`Confirm result: ${handoff.title}`, `Подтвердить результат: ${handoff.title}`),
      note: text("Confirm only after the release is live.", "Подтвердить только после выхода."),
      action: "mark-calendar-published",
      id: handoff.id,
      label: text("Confirm result", "Подтвердить результат")
    };
  }

  const pendingApproval = state.approvals.find((item) => item.status === "pending");
  if (pendingApproval) {
    const context = getApprovalContext(pendingApproval);
    return {
      title: text(`Resolve exception: ${context.title}`, `Закрыть исключение: ${context.title}`),
      note: text("Only owner boundaries and risky claims block release.", "Блокируют только границы собственника и рискованные утверждения."),
      action: "go-approval",
      id: pendingApproval.id,
      label: text("Approve topic", "Согласовать тему")
    };
  }

  return null;
}

function ownerCommandStatuses(pending) {
  const handoffs = state.calendar.filter((item) => item.status === "handed_off").length;
  const readyRelease = state.calendar.filter((item) => item.status === "scheduled").length +
    state.content.filter((item) => materialOwnerStatus(item) === "approved" && !materialCalendarItem(item)).length;
  const published = state.calendar.filter((item) => item.status === "published").length;
  const signals = Number(state.metrics.leads || 0);

  return [
    {
      label: text("Result confirmation", "Подтверждение результата"),
      value: handoffs ? text("Awaiting owner", "Ждёт собственника") : text("Clear", "Чисто"),
      note: handoffs ? text("Only after live.", "Только после выхода.") : text("No wait.", "Не ждёт."),
      state: handoffs ? "active" : "muted"
    },
    {
      label: text("Weekly topics", "Темы недели"),
      value: pending.length ? text("Decision needed", "Ждёт решения") : text("Approved", "Согласовано"),
      note: pending.length ? text("Approve boundary.", "Согласовать границу.") : text("Clear.", "Чисто."),
      state: pending.length ? "active" : "done"
    },
    {
      label: text("Release queue", "Очередь выпуска"),
      value: readyRelease ? text("With manager", "У менеджера") : text("Empty", "Пусто"),
      note: readyRelease ? text("Manager owns it.", "У менеджера.") : text("Empty.", "Пусто."),
      state: readyRelease ? "active" : "muted"
    },
    {
      label: text("Result", "Результат"),
      value: signals ? text("Signal recorded", "Есть сигнал") : published ? text("Release counted", "Выход учтён") : text("No signal", "Нет сигнала"),
      note: signals ? text("Source recorded.", "Источник зафиксирован.") : published ? text("Watch signal.", "Смотрим сигнал.") : text("No signal yet.", "Сигнала пока нет."),
      state: signals ? "done" : published ? "active" : "muted"
    }
  ];
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
    ? text("Confirm result", "Подтвердить результат")
    : text("Open release status", "Открыть статус выпуска");
  const releaseNote = releaseItem?.status === "handed_off"
    ? text("Owner confirms result after release.", "Собственник подтверждает результат после выхода.")
    : text("Manager owns the release queue action.", "Действие в очереди выпуска у менеджера.");
  const steps = [
    {
      title: text("Prepared", "Подготовлено"),
      note: text("AgentResult draft or release item is ready.", "Готов черновик AgentResult или пункт выпуска."),
      state: hasMaterial ? "done" : "active",
      action: "go-content",
      label: text("Materials", "Материалы")
    },
    {
      title: text("Weekly topic", "Тема недели"),
      note: pendingApproval
        ? text("Topic and owner boundary are waiting.", "Ждёт тема и граница собственника.")
        : text("Weekly topic approval is clear.", "Темы недели согласованы."),
      state: pendingApproval ? "active" : hasApprovalDecision ? "done" : "muted",
      action: pendingApproval ? "open-demo-approval" : "go-approvals",
      id: pendingApproval?.id || "",
      label: pendingApproval ? text("Approve topic", "Согласовать тему") : text("Weekly topics", "Темы недели")
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
        ? text(`${state.metrics.leads} primary reactions in Results.`, `${state.metrics.leads} первичные реакции в результатах.`)
        : text("Record the first URL, reaction, comment, repost, save, or owner mark after release.", "Зафиксируйте первый URL, реакцию, комментарий, репост, сохранение или отметку собственника после выпуска."),
      state: hasLeads ? "done" : publishedCount ? "active" : "muted",
      action: "go-analytics",
      label: text("Results", "Результаты")
    }
  ];

  return `
    <section class="result-path" aria-label="${escapeAttr(text("Path to result", "Путь до результата"))}">
      <div class="result-path-head">
        <p class="eyebrow">${text("Path to result", "Цепочка до результата")}</p>
        <h3>${text("Topic -> AI draft -> QA -> release -> signal", "Тема -> AI-текст -> QA -> выпуск -> сигнал")}</h3>
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
    ? text(`Approve weekly topic: ${urgent.title}`, `Согласовать тему недели: ${urgent.title}`)
    : blockers[0]?.title || text("No urgent decisions", "Срочных решений нет");
  const note = urgent
    ? text("Approve the topic and boundaries once; text QA stays with the manager.", "Согласуйте тему и границы один раз; QA текста у менеджера.")
    : text("No owner action is needed right now.", "Сейчас действие собственника не нужно.");
  const action = urgent ? "go-approval" : ownerMoves[0]?.action || "go-demand-map";
  const label = urgent ? text("Open topic", "Открыть тему") : ownerMoves[0]?.label || text("Open plan", "Открыть план");

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
      title: text("Weekly topics need owner boundaries", "Темам недели нужны границы собственника"),
      meta: text(`${pending.length} topic(s) waiting`, `${pending.length} тем ждут`),
      label: text("Open", "Открыть"),
      action: "go-approvals",
      id: "approval-block"
    });
  }
  if (!state.metrics.leads) {
    blockers.push({
      title: text("No publication reaction is recorded", "Не зафиксирована реакция публикации"),
      meta: text("The content loop needs a URL, reaction, comment, repost, save, or reuse mark.", "Контент-контуру нужен URL, реакция, комментарий, репост, сохранение или отметка переиспользования."),
      label: text("Import", "Загрузить"),
      action: "import-metrics",
      id: "lead-signal"
    });
  }
  if (!state.calendar.some((item) => isShippedStatus(item.status))) {
    blockers.push({
      title: text("No material has been released yet", "Ни один материал ещё не вышел"),
      meta: text("AI drafts become business value after QA, release, and result tracking.", "AI-черновики становятся ценностью после QA, выпуска и фиксации результата."),
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
      title: text("Approve the first weekly topic", "Согласовать первую тему недели"),
      meta: getApprovalContext(pending[0]).title,
      label: text("Topic", "Тема"),
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
      title: text("Record first distribution signals", "Зафиксировать первые сигналы дистрибуции"),
      meta: text("URLs, channel reactions, comments, reposts, saves, owner marks, or confirmed releases.", "URL, реакции канала, комментарии, репосты, сохранения, отметки собственника или подтверждённые выпуски."),
      label: text("Add signal", "Добавить сигнал"),
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
    ["publications", "publications", text("Publications", "Публикации"), text("Topics, QA, release", "Темы, QA, выпуск")],
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
        <h3>${text("Approve weekly topics once; let manager QA handle the text routine.", "Согласуйте темы недели один раз; рутинный QA текста у менеджера.")}</h3>
      </div>
      <div class="guide-mini">
        ${guideStep("1", text("Topics", "Темы"), text("Open weekly topics.", "Откройте темы недели."))}
        ${guideStep("2", text("Boundaries", "Границы"), text("Approve or return the boundary.", "Согласуйте или верните границу."))}
        ${guideStep("3", text("QA", "QA"), text("Manager checks the text routine.", "Рутину текста проверяет менеджер."))}
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
  const summary = materialFlowSummary(nextItem);
  const nextAction = nextItem ? materialPrimaryAction(nextItem) : { action: "go-demand-map", label: text("Open strategy", "Открыть стратегию") };
  const nextStatus = nextItem ? materialOwnerStatus(nextItem) : "";
  const commandOwnsAction = !nextItem || ["review", "handed_off"].includes(nextStatus);

  return `
    <section class="material-command">
      <div>
        <p class="eyebrow">${text("Weekly content flow", "Недельный выпуск")}</p>
        <h3>${escapeHtml(nextItem ? materialQueueTitle(nextItem) : text("No weekly topic is waiting", "Тем недели в очереди нет"))}</h3>
        <p>${escapeHtml(nextItem ? materialQueueNote(nextItem) : text("Create one weekly demand topic.", "Создайте одну тему спроса на неделю."))}</p>
        ${commandOwnsAction
          ? `<button class="button primary" data-action="${escapeAttr(nextAction.action)}" data-id="${escapeAttr(nextAction.id || nextItem?.id || "")}">${escapeHtml(nextAction.label)}</button>`
          : `<span class="status-chip">${escapeHtml(materialQueueStatusLabel(nextItem))}</span>`}
      </div>
      <div class="material-summary compact">
        ${compactMaterialMetric(text("Topic approved", "Тема согласована"), summary.topic)}
        ${compactMaterialMetric(text("AI draft", "AI-текст"), summary.draft)}
        ${compactMaterialMetric(text("Manager QA", "QA менеджера"), summary.qa)}
        ${compactMaterialMetric(text("Release queue", "Очередь выпуска"), summary.release)}
      </div>
    </section>
    ${managerWorkspace()}
    <section class="material-queue-grid">
      ${queues.map(materialQueueColumn).join("")}
    </section>
  `;
}

function materialFlowSummary(focusItem = null) {
  const focusStatus = focusItem ? materialOwnerStatus(focusItem) : "";
  if (focusStatus) {
    return {
      topic: focusStatus === "review" ? text("Decision needed", "Ждёт решения") : text("Approved", "Согласовано"),
      draft: focusStatus === "needs_revision" ? text("Needs revision", "Нужна доработка") : ["scheduled", "handed_off", "published"].includes(focusStatus) ? text("Final", "Финальный") : ["approved", "revised_draft"].includes(focusStatus) ? text("Ready for QA", "Готов к QA") : ["idea", "brief", "draft", "changes"].includes(focusStatus) ? text("In work", "В работе") : text("Not yet", "Пока нет"),
      qa: ["scheduled", "handed_off", "published"].includes(focusStatus) ? text("Passed", "Пройден") : ["approved", "revised_draft"].includes(focusStatus) ? text("Waiting", "Ждёт") : focusStatus === "needs_revision" ? text("Blocked", "Заблокирован") : text("Next", "Следующий"),
      release: focusStatus === "handed_off" ? text("Awaiting result", "Ждёт результата") : focusStatus === "scheduled" ? text("With manager", "У менеджера") : focusStatus === "published" ? text("Counted", "Учтено") : text("Not yet", "Пока нет")
    };
  }

  const statuses = state.content.map(materialOwnerStatus);
  const hasReview = statuses.includes("review");
  const hasQa = statuses.some((status) => ["approved", "revised_draft"].includes(status));
  const hasScheduled = statuses.includes("scheduled");
  const hasHandedOff = statuses.includes("handed_off");
  const hasPublished = statuses.includes("published");
  const hasRevision = statuses.includes("needs_revision");
  const hasDraftWork = statuses.some((status) => ["idea", "brief", "draft", "changes"].includes(status));

  return {
    topic: hasReview ? text("Decision needed", "Ждёт решения") : hasQa || hasScheduled || hasHandedOff || hasPublished ? text("Approved", "Согласовано") : text("Clear", "Чисто"),
    draft: hasRevision ? text("Needs revision", "Нужна доработка") : hasQa || hasScheduled || hasHandedOff || hasPublished ? text("Ready for QA", "Готов к QA") : hasDraftWork ? text("In work", "В работе") : text("Not yet", "Пока нет"),
    qa: hasScheduled || hasHandedOff || hasPublished ? text("Passed", "Пройден") : hasQa ? text("Waiting", "Ждёт") : hasRevision ? text("Blocked", "Заблокирован") : text("Next", "Следующий"),
    release: hasHandedOff ? text("Awaiting result", "Ждёт результата") : hasScheduled ? text("With manager", "У менеджера") : hasPublished ? text("Counted", "Учтено") : text("Not yet", "Пока нет")
  };
}

function managerWorkspace() {
  const focusItems = materialFocusItems();
  const hasQaItems = focusItems.some((item) => materialNeedsManagerQa(item));
  const hasRevisionItems = focusItems.some((item) => materialOwnerStatus(item) === "needs_revision");
  const workspaceBody = hasQaItems
    ? `${managerQaSurface()}${hasRevisionItems ? `${managerDailyRunbook()}${weeklyOperatorConsole()}${sourcePackRevisionWorkspace()}` : ""}`
    : `${managerDailyRunbook()}${weeklyOperatorConsole()}${sourcePackRevisionWorkspace()}${managerQaSurface()}`;
  return `
    <section class="manager-workspace" aria-label="${escapeAttr(text("Manager workspace", "Рабочая очередь менеджера"))}">
      <div class="manager-workspace-head">
        <div>
          <p class="eyebrow">${text("Manager workspace", "Рабочая очередь менеджера")}</p>
          <h3>${text("QA, style check, release, signal", "QA, проверка стиля, выпуск, сигнал")}</h3>
        </div>
        <span>${escapeHtml(text("Owner sees decisions and result", "Собственник видит решения и результат"))}</span>
      </div>
      ${workspaceBody}
    </section>
  `;
}

function managerDailyRunbook() {
  const focusItems = materialFocusItems();
  const buckets = weeklyOperatorBuckets(focusItems);
  const revisionItems = focusItems.filter((item) => materialOwnerStatus(item) === "needs_revision");
  const ownerEscalations = focusItems.filter((item) => materialOwnerStatus(item) === "review");
  const activeCount = buckets.qaItems.length + buckets.releaseItems.length + buckets.signalItems.length + revisionItems.length + ownerEscalations.length;
  const rows = [
    {
      action: "go-content",
      id: "",
      label: text("Open work queue", "Открыть очередь"),
      meta: text(`${activeCount} active items`, `${activeCount} активных пунктов`),
      note: text("QA, release, signal, revisions, escalations.", "QA, выпуск, сигнал, доработки, эскалации."),
      status: text("Use workspace below", "Рабочие действия ниже"),
      title: text("Morning check", "Проверить утром")
    },
    managerRunbookItem({
      empty: text("No release queue item for today.", "Нет пункта выпуска на сегодня."),
      fallbackAction: "go-calendar",
      fallbackLabel: text("Open release queue", "Открыть очередь"),
      item: buckets.releaseItems[0],
      meta: text("Manager release", "Выпуск менеджера"),
      status: text("In manager queue", "В очереди менеджера"),
      title: text("Release today", "Выпустить сегодня")
    }),
    managerRunbookItem({
      empty: text("No weak AI text is blocked by Source Pack.", "Нет слабого AI-текста, заблокированного Source Pack."),
      fallbackAction: "go-content",
      fallbackLabel: text("Open materials", "Открыть материалы"),
      item: revisionItems[0],
      meta: text("Source Pack revision", "Доработка Source Pack"),
      status: text("In manager queue", "В очереди менеджера"),
      title: text("Return weak AI text", "Завернуть AI-текст")
    }),
    managerRunbookItem({
      empty: text("No release is waiting for distribution check.", "Нет выпуска в ожидании проверки дистрибуции."),
      fallbackAction: "go-analytics",
      fallbackLabel: text("Open results", "Открыть результаты"),
      item: buckets.signalItems[0],
      meta: text("Distribution signal", "Сигнал дистрибуции"),
      status: text("In manager queue", "В очереди менеджера"),
      title: text("Capture publication result", "Зафиксировать результат")
    }),
    managerRunbookItem({
      empty: text("No owner decision is blocking the day.", "Нет решения собственника, которое блокирует день."),
      fallbackAction: "go-approvals",
      fallbackLabel: text("Open decisions", "Открыть решения"),
      item: ownerEscalations[0],
      meta: text("Owner escalation", "Эскалация собственнику"),
      status: text("Owner surface", "Поверхность собственника"),
      title: text("Escalate to owner", "Эскалировать собственнику")
    })
  ];

  return `
    <div class="manager-daily-runbook" aria-label="${escapeAttr(text("Manager daily work", "Работа менеджера на день"))}">
      <div class="manager-daily-head">
        <div>
          <p class="eyebrow">${text("Manager work", "Работа менеджера")}</p>
          <h3>${text("Today: QA, release, signal", "Сегодня: QA, выпуск, сигнал")}</h3>
        </div>
        <span>${escapeHtml(text("Owner: decisions and result", "Собственник: решения и результат"))}</span>
      </div>
      <div class="manager-daily-list">
        ${rows.map(managerRunbookRow).join("")}
      </div>
    </div>
  `;
}

function managerRunbookItem(input) {
  return {
    label: input.status || input.fallbackLabel,
    meta: input.meta,
    note: input.item ? input.item.title : input.empty,
    title: input.title
  };
}

function managerRunbookRow(row) {
  return `
    <article class="manager-daily-row">
      <div>
        <span>${escapeHtml(row.meta)}</span>
        <strong>${escapeHtml(row.title)}</strong>
        <p>${escapeHtml(row.note)}</p>
      </div>
      <span class="status-chip">${escapeHtml(row.label)}</span>
    </article>
  `;
}

function weeklyOperatorConsole() {
  const focusItems = materialFocusItems();
  const buckets = weeklyOperatorBuckets(focusItems);
  const columns = [
    {
      title: text("Approved topics", "Согласованные темы"),
      count: buckets.approvedTopics.length,
      note: text("Boundary approved.", "Граница согласована."),
      items: buckets.approvedTopics,
      empty: text("Approved topics now move into AI text for QA.", "Согласованные темы сейчас переходят в AI-текст на QA.")
    },
    {
      title: text("AI text for QA", "AI-текст на QA"),
      count: buckets.qaItems.length,
      note: text("Facts, voice, AI-ishness.", "Факты, стиль, иишность."),
      items: buckets.qaItems,
      actionMode: "status",
      statusLabel: text("Use Manager QA below", "Действие в блоке QA ниже"),
      empty: text("No AI text is waiting for QA.", "Нет AI-текста на QA.")
    },
    {
      title: text("Source Pack revision", "Доработка Source Pack"),
      count: buckets.revisionItems.length,
      note: text("Revise before QA.", "Доработать до QA."),
      items: buckets.revisionItems,
      empty: text("No weak AI text is blocked by Source Pack.", "Нет слабого AI-текста, заблокированного Source Pack.")
    },
    {
      title: text("Release queue", "Очередь выпуска"),
      count: buckets.releaseItems.length,
      note: text("Release is in manager queue.", "Выпуск в очереди менеджера."),
      items: buckets.releaseItems,
      empty: text("No text is queued for release.", "Нет текста в очереди выпуска.")
    },
    {
      title: text("Out", "Вышло"),
      count: buckets.publishedItems.length,
      note: text("Confirmed release.", "Подтверждённый выпуск."),
      items: buckets.publishedItems,
      empty: text("No confirmed release this week.", "Нет подтверждённого выпуска за неделю.")
    },
    {
      title: text("Signal needed", "Нужен сигнал"),
      count: buckets.signalItems.length,
      note: text("Signal still needed.", "Нужен сигнал."),
      items: buckets.signalItems,
      empty: text("No release is waiting for signal capture.", "Нет выпуска в ожидании сигнала.")
    }
  ];

  return `
    <div class="weekly-operator-console" aria-label="${escapeAttr(text("Weekly operator console", "Операторская консоль недели"))}">
      <div class="weekly-operator-head">
        <div>
          <p class="eyebrow">${text("Manager queue", "Очередь менеджера")}</p>
          <h3>${text("QA, release, signal", "QA, выпуск, сигнал")}</h3>
        </div>
        <span>${escapeHtml(text("One queue", "Одна очередь"))}</span>
      </div>
      <div class="weekly-operator-grid">
        ${columns.map(weeklyOperatorColumn).join("")}
      </div>
    </div>
  `;
}

function weeklyOperatorBuckets(items = materialFocusItems()) {
  const buckets = {
    approvedTopics: [],
    qaItems: [],
    revisionItems: [],
    releaseItems: [],
    publishedItems: [],
    signalItems: []
  };

  items.forEach((item) => {
    const status = materialOwnerStatus(item);
    if (status === "owner_approved" || status === "drafting") buckets.approvedTopics.push(item);
    else if (status === "needs_revision") buckets.revisionItems.push(item);
    else if (["approved", "revised_draft", "draft", "changes"].includes(status)) buckets.qaItems.push(item);
    else if (status === "scheduled") buckets.releaseItems.push(item);
    else if (status === "published") buckets.publishedItems.push(item);
    else if (status === "handed_off") buckets.signalItems.push(item);
  });

  return buckets;
}

function weeklyOperatorColumn(column) {
  const item = column.items[0] || null;
  const action = item ? materialPrimaryAction(item) : null;
  const actionMarkup = item && column.actionMode === "status"
    ? `<span class="status-chip">${escapeHtml(column.statusLabel || materialQueueStatusLabel(item))}</span>`
    : item
      ? `<button class="button secondary table-button" data-action="${escapeAttr(action.action)}" data-id="${escapeAttr(action.id || item.id || "")}">${escapeHtml(action.label)}</button>`
      : "";
  return `
    <article class="weekly-operator-column ${column.count ? "active" : "muted"}">
      <div>
        <span>${escapeHtml(column.title)}</span>
        <strong>${escapeHtml(String(column.count))}</strong>
        <p>${escapeHtml(column.note)}</p>
      </div>
      ${item ? `
        <div class="weekly-operator-item">
          <b>${escapeHtml(item.title)}</b>
          <small>${escapeHtml(materialOwnerOutcome(item))}</small>
        </div>
        ${actionMarkup}
      ` : ""}
    </article>
  `;
}

function sourcePackRevisionWorkspace() {
  const revisionItems = materialFocusItems()
    .filter((item) => materialOwnerStatus(item) === "needs_revision")
    .slice(0, 3);
  if (!revisionItems.length) return "";
  const profile = state.offer?.profile || {};

  return `
    <details class="source-pack-revision-workspace" open aria-label="${escapeAttr(text("Source Pack revision workspace", "Рабочее место доработки Source Pack"))}">
      <summary class="manager-qa-head">
        <div>
          <p class="eyebrow">${text("Source Pack gate", "Source Pack gate")}</p>
          <h3>${text("Revise before QA", "Доработать до QA")}</h3>
          <p>${text("Only passed text enters manager QA.", "В QA идёт только passed-текст.")}</p>
        </div>
        <strong>${escapeHtml(String(revisionItems.length))}</strong>
      </summary>
      ${authorVoiceContractPanel(profile)}
      <div class="source-pack-revision-list">
        ${revisionItems.map(sourcePackRevisionCard).join("")}
      </div>
    </details>
  `;
}

function sourcePackRevisionCard(item) {
  const issues = qualityGateIssues(item);
  const textareaId = `sourcePackRevisionBody-${item.id}`;
  return `
    <article class="source-pack-revision-card">
      <div class="source-pack-revision-head">
        <div>
          <span>${escapeHtml(displayChannel(item.channel || item.content_type || "content"))}</span>
          <strong>${escapeHtml(item.title)}</strong>
        </div>
        <span class="status-chip">${escapeHtml(text("Blocked before QA", "Не входит в QA"))}</span>
      </div>
      <div class="source-pack-issues">
        <span>${escapeHtml(text("Reasons", "Причины"))}</span>
        ${issues.map((issue) => `<strong>${escapeHtml(issue)}</strong>`).join("")}
      </div>
      <label class="source-pack-editor">
        <span>${escapeHtml(text("Revised text", "Исправленный текст"))}</span>
        <textarea id="${escapeAttr(textareaId)}" rows="8">${escapeHtml(contentBodyText(item))}</textarea>
      </label>
      <div class="card-actions">
        <button class="button primary" data-action="rerun-quality-gate" data-id="${escapeAttr(item.id || "")}">${escapeHtml(text("Apply Source Pack gate", "Применить Source Pack gate"))}</button>
        <span class="muted">${escapeHtml(text("Then manager QA.", "Дальше QA менеджера."))}</span>
      </div>
    </article>
  `;
}

function qualityGateIssues(item) {
  const gate = item?.metadata?.quality_gate || {};
  const issues = Array.isArray(gate.issues) ? gate.issues.map((issue) => String(issue || "").trim()).filter(Boolean) : [];
  return issues.length ? issues : [text("Revise against Source Pack before manager QA.", "Переписать по Source Pack до QA менеджера.")];
}

function contentBodyText(item) {
  return String(item?.body_md || item?.metadata?.body || item?.metadata?.preview || item?.metadata?.brief || "").trim();
}

function managerQaSurface(excludeId = "") {
  const qaItems = materialFocusItems()
    .filter((item) => materialNeedsManagerQa(item) && item.id !== excludeId)
    .slice(0, 1);
  const profile = state.offer?.profile || {};

  return `
    <details class="manager-qa-surface" ${qaItems.length ? "open" : ""}>
      <summary class="manager-qa-head">
        <div>
          <p class="eyebrow">${text("Manager QA", "Менеджер QA")}</p>
          <h3>${text("Text quality gate", "Контроль текста перед выпуском")}</h3>
          <p>${text("One text. Facts, author voice, AI-ishness, boundaries, format.", "Один текст. Факты, стиль автора, иишность, границы, формат.")}</p>
        </div>
        <strong>${escapeHtml(String(qaItems.length))}</strong>
      </summary>
      <div class="manager-qa-checks">
        ${managerQaChecklist().map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
      ${authorVoiceContractPanel(profile)}
      <div class="manager-qa-list">
        ${qaItems.length ? qaItems.map(managerQaCard).join("") : `<p class="empty-note">${text("No AI text is waiting for manager QA.", "Нет AI-текста на QA менеджера.")}</p>`}
      </div>
    </details>
  `;
}

function managerQaChecklist() {
  return managerQaChecklistFields().map((item) => item.label);
}

function managerQaChecklistFields() {
  return [
    { key: "factsProof", label: text("Facts and proof checked", "Факты и proof проверены") },
    { key: "authorVoice", label: text("Author voice matched", "Похоже на стиль автора") },
    { key: "aiIshnessRemoved", label: text("AI-ishness removed", "Иишность убрана") },
    { key: "ownerBoundaries", label: text("Owner boundaries kept", "Границы собственника соблюдены") },
    { key: "channelFormat", label: text("Channel format", "Формат канала") }
  ];
}

function authorVoiceContractText(profile = {}) {
  return textValue(
    profile.authorVoiceContract || profile.styleGuard || profile.tone || profile.approvalOwner,
    text(
      "Author phrases: add 3-5 real phrases. Stop-words: list words to remove. AI templates: remove generic openings and empty benefit lists. Directness: keep the author's level of directness. Proof/risk: keep claim boundaries. QA decision: matches / does not match the author.",
      "Фразы автора: 3-5 реальных формулировок. Стоп-слова: что убрать. AI-шаблоны: убрать общие вступления и пустые списки преимуществ. Прямота: сохранить уровень прямоты автора. Proof/risk: держать границы утверждений. Решение QA: похоже / не похоже на автора."
    )
  );
}

function authorVoiceSourcePack(profile = {}) {
  const contract = authorVoiceContractText(profile);
  const fallback = {
    phrases: text("'less clutter', 'through a decision', 'working control loop'", "'меньше каши', 'через решение', 'рабочий контур'"),
    stopWords: text("revolutionary, magic, guaranteed growth", "революционный, магия, гарантированный рост"),
    aiTemplates: text("generic openings, empty benefit lists, inflated adjectives", "общие вступления, пустые списки преимуществ, раздутые прилагательные"),
    directness: text("short, direct, work-focused", "коротко, прямо, по делу"),
    proofRisk: text("no claims without proof, no guaranteed result promises", "без утверждений без proof и обещаний гарантированного результата"),
    decision: text("matches / does not match the author", "похоже / не похоже на автора")
  };
  const patterns = [
    ["phrases", [/фразы автора[:：]\s*([^.;\n]+)/i, /author phrases[:：]\s*([^.;\n]+)/i]],
    ["stopWords", [/стоп-слова[:：]\s*([^.;\n]+)/i, /stop-words[:：]\s*([^.;\n]+)/i]],
    ["aiTemplates", [/ai-шаблон(?:ы)?[:：]\s*([^.;\n]+)/i, /убрать ai-шаблон(?:ы)?[:：]\s*([^.;\n]+)/i, /ai templates[:：]\s*([^.;\n]+)/i]],
    ["directness", [/прямота[:：]\s*([^.;\n]+)/i, /directness[:：]\s*([^.;\n]+)/i]],
    ["proofRisk", [/proof\/risk[:：]\s*([^.;\n]+)/i, /границы[:：]\s*([^.;\n]+)/i]],
    ["decision", [/решение qa[:：]\s*([^.;\n]+)/i, /decision[:：]\s*([^.;\n]+)/i]]
  ];

  return Object.fromEntries(patterns.map(([key, matchers]) => {
    const found = matchers.map((pattern) => contract.match(pattern)?.[1]?.trim()).find(Boolean);
    return [key, found || fallback[key]];
  }));
}

function authorVoiceContractPanel(profile = {}) {
  const pack = authorVoiceSourcePack(profile);
  const sourceItems = [
    [text("Author phrases", "Фразы автора"), compactDisplayText(pack.phrases, 78)],
    [text("Stop-words", "Стоп-слова"), compactDisplayText(pack.stopWords, 78)],
    [text("Banned AI structures", "Запрещённые AI-конструкции"), compactDisplayText(pack.aiTemplates, 78)],
    [text("Directness", "Прямота"), compactDisplayText(pack.directness, 78)],
    [text("Proof/risk boundaries", "Proof/risk границы"), compactDisplayText(pack.proofRisk, 78)],
    [text("QA decision", "Решение QA"), compactDisplayText(pack.decision, 78)]
  ];
  return `
    <article class="manager-qa-contract">
      <div>
        <p class="eyebrow">${text("Author voice check", "Проверка стиля автора")}</p>
      </div>
      <div class="author-source-grid">
        ${sourceItems.map(([label, value]) => `
          <div>
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function materialNeedsManagerQa(item) {
  return ["approved", "revised_draft", "draft", "changes"].includes(materialOwnerStatus(item));
}

function managerQaCard(item) {
  const primary = materialPrimaryAction(item);
  const comment = text(
    "Facts, proof, author voice, AI-ishness, owner boundaries and channel format checked.",
    "Факты, proof, стиль автора, иишность, границы собственника и формат канала проверены."
  );
  return `
    <article class="manager-qa-card">
      <div>
        <span>${escapeHtml(materialOwnerStage(item))} · ${escapeHtml(displayChannel(item.channel || item.content_type || "content"))}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(managerQaOutcome(item))}</p>
      </div>
      <div class="manager-qa-decision" data-manager-qa-id="${escapeAttr(item.id || "")}">
        <div class="manager-qa-decision-grid">
          ${managerQaChecklistFields().map((field) => `
            <label>
              <input type="checkbox" data-qa-check="${escapeAttr(field.key)}" checked>
              <span>${escapeHtml(field.label)}</span>
            </label>
          `).join("")}
        </div>
        <label class="manager-qa-verdict">
          <span>${escapeHtml(text("Verdict", "Вердикт"))}</span>
          <select data-qa-verdict>
            <option value="matches_author" selected>${escapeHtml(text("Matches the author", "Похоже на автора"))}</option>
            <option value="does_not_match_author">${escapeHtml(text("Does not match the author", "Не похоже на автора"))}</option>
          </select>
        </label>
        <label class="manager-qa-comment">
          <span>${escapeHtml(text("QA comment", "Комментарий QA"))}</span>
          <textarea data-qa-comment rows="2">${escapeHtml(comment)}</textarea>
        </label>
      </div>
      <div class="manager-qa-actions">
        <button class="button primary table-button" data-action="${escapeAttr(primary.action)}" data-id="${escapeAttr(primary.id || item.id || "")}">${escapeHtml(primary.label)}</button>
        <button class="button secondary table-button" data-action="return-manager-qa-revision" data-id="${escapeAttr(item.id || "")}">${escapeHtml(text("Return for revision", "Вернуть на доработку"))}</button>
      </div>
    </article>
  `;
}

function managerQaOutcome(item) {
  const status = materialOwnerStatus(item);
  if (status === "approved") return text("Check facts, proof, voice, AI-ishness, boundaries.", "Проверить факты, proof, стиль, иишность, границы.");
  if (status === "changes") return text("Fix boundary exception, then QA.", "Исправить исключение по границе, затем QA.");
  return text("Check text before release.", "Проверить текст перед выпуском.");
}

function managerQaDecisionFromDom(content) {
  const root = [...document.querySelectorAll(".manager-qa-decision")]
    .find((item) => item.dataset.managerQaId === String(content.id || ""));
  const checklist = Object.fromEntries(managerQaChecklistFields().map((field) => {
    const input = root?.querySelector(`[data-qa-check="${field.key}"]`);
    return [field.key, input ? Boolean(input.checked) : false];
  }));
  const verdict = root?.querySelector("[data-qa-verdict]")?.value || "";
  const comment = root?.querySelector("[data-qa-comment]")?.value.trim() || "";
  return { checklist, verdict, comment };
}

function managerQaDecisionIsPassing(decision = {}) {
  const checklist = decision.checklist || {};
  return managerQaChecklistFields().every((field) => checklist[field.key] === true) && decision.verdict === "matches_author";
}

function managerQaContractForContent(content, decision = {}) {
  const profile = state.offer?.profile || {};
  const sourcePack = authorVoiceSourcePack(profile);
  const checklist = {
    factsProof: decision.checklist?.factsProof === true,
    authorVoice: decision.checklist?.authorVoice === true,
    aiIshnessRemoved: decision.checklist?.aiIshnessRemoved === true,
    ownerBoundaries: decision.checklist?.ownerBoundaries === true,
    channelFormat: decision.checklist?.channelFormat === true
  };
  const passed = managerQaDecisionIsPassing({ checklist, verdict: decision.verdict });
  const comment = String(decision.comment || "").trim();
  return {
    status: passed ? "passed" : "needs_revision",
    checkedAt: new Date().toISOString(),
    checkedBy: profile.releaseOwner || content.owner || text("Manager QA", "Менеджер QA"),
    checklist,
    comment,
    sourcePack,
    verdict: {
      authorVoice: decision.verdict === "matches_author" ? "matches_author" : "does_not_match_author",
      aiIshness: checklist.aiIshnessRemoved ? "removed" : "needs_revision",
      proofRisk: checklist.factsProof && checklist.ownerBoundaries ? "within_boundaries" : "needs_revision",
      decision: decision.verdict === "matches_author" ? "matches_author" : "does_not_match_author"
    }
  };
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
  const order = { handed_off: 0, review: 1, needs_revision: 2, approved: 3, revised_draft: 4, scheduled: 5, changes: 6, draft: 7, brief: 8, idea: 9, published: 10 };
  return [...state.content].sort((a, b) => (order[materialOwnerStatus(a)] ?? 9) - (order[materialOwnerStatus(b)] ?? 9));
}

function materialOwnerQueues(excludeId = "") {
  const items = materialFocusItems();
  return [
    {
      title: text("Weekly topics", "Темы недели"),
      note: text("Approve or return boundary.", "Согласовать или вернуть границу."),
      items: items.filter((item) => materialOwnerStatus(item) === "review" && item.id !== excludeId),
      empty: text("No weekly topic decisions waiting.", "Нет тем недели на решении.")
    },
    {
      title: text("Release queue", "Очередь выпуска"),
      note: text("Release is in manager queue.", "Выпуск в очереди менеджера."),
      items: items.filter((item) => ["approved", "scheduled"].includes(materialOwnerStatus(item)) && item.id !== excludeId),
      empty: text("No text is queued for release yet.", "В очереди выпуска пока пусто.")
    },
    {
      title: text("Result confirmation", "Подтверждение результата"),
      note: text("Confirm after live.", "Подтвердить после выхода."),
      items: items.filter((item) => materialOwnerStatus(item) === "handed_off" && item.id !== excludeId),
      empty: text("No releases are waiting for confirmation.", "Нет выпусков на подтверждении.")
    },
    {
      title: text("AI drafts / QA", "AI-черновики / QA"),
      note: text("Drafts, style check, QA.", "Тексты, проверка стиля, QA."),
      items: items.filter((item) => ["needs_revision", "idea", "brief", "draft", "changes"].includes(materialOwnerStatus(item)) && item.id !== excludeId),
      empty: text("No drafts are waiting for QA.", "Нет черновиков на QA.")
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
  const status = materialOwnerStatus(item);
  const queueOwnsAction = ["review", "handed_off"].includes(status);
  return `
    <article class="material-queue-card">
      <div>
        <span>${escapeHtml(materialOwnerStage(item))} · ${escapeHtml(displayChannel(item.channel || item.content_type || "content"))}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(materialOwnerOutcome(item))}</p>
      </div>
      <div class="card-actions">
        ${queueOwnsAction
          ? `<button class="button secondary table-button" data-action="${escapeAttr(primary.action)}" data-id="${escapeAttr(primary.id || item.id || "")}">${escapeHtml(primary.label)}</button>`
          : `<span class="status-chip">${escapeHtml(materialQueueStatusLabel(item))}</span>`}
      </div>
    </article>
  `;
}

function materialQueueStatusLabel(item) {
  const status = materialOwnerStatus(item);
  if (status === "scheduled") return text("In manager release queue", "В очереди выпуска менеджера");
  if (status === "approved" || status === "revised_draft") return text("Manager QA owns next action", "Следующее действие у QA менеджера");
  if (status === "needs_revision") return text("Source Pack revision", "Доработка Source Pack");
  if (["draft", "changes", "idea", "brief"].includes(status)) return text("Preparing topic", "Тема в подготовке");
  if (status === "published") return text("Counted in results", "Учтено в результатах");
  return materialOwnerStage(item);
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
  const status = materialOwnerStatus(item);
  if (status === "review") return text(`Approve weekly topic: ${item.title}`, `Согласовать тему недели: ${item.title}`);
  if (status === "approved") return text(`Manager QA clears release: ${item.title}`, `QA менеджера допускает выпуск: ${item.title}`);
  if (status === "handed_off") return text(`Confirm result: ${item.title}`, `Подтвердить результат: ${item.title}`);
  if (status === "scheduled") return text(`Release status: ${item.title}`, `Статус выпуска: ${item.title}`);
  if (status === "changes") return text(`Update weekly boundary: ${item.title}`, `Обновить границу недели: ${item.title}`);
  if (["idea", "brief", "draft"].includes(status)) return text(`Topic in preparation: ${item.title}`, `Тема в подготовке: ${item.title}`);
  return item.title;
}

function materialQueueNote(item) {
  const status = materialOwnerStatus(item);
  if (status === "review") return text("Owner approves topic and boundary.", "Собственник согласует тему и границу.");
  if (status === "approved") return text("Manager QA checks the text.", "Менеджер QA проверяет текст.");
  if (status === "handed_off") return text("Confirm after release is live.", "Подтвердить после выхода.");
  if (status === "scheduled") return text("Release is in manager queue.", "Выпуск в очереди менеджера.");
  if (status === "changes") return text("Update the topic boundary.", "Обновите границу темы.");
  if (["idea", "brief", "draft"].includes(status)) return text("Preparing for owner approval.", "Готовится к согласованию.");
  return text("Open for next action.", "Открыть следующий шаг.");
}

function materialStagePath(item) {
  const stages = [
    ["draft", text("Topic", "Тема")],
    ["review", text("Boundaries", "Границы")],
    ["approved", text("Manager QA", "QA менеджера")],
    ["scheduled", text("Release", "Выпуск")]
  ];
  const current = materialPathIndex(materialOwnerStatus(item));
  return stages.map(([key, label], index) => `<span class="${index < current ? "done" : index === current ? "active" : ""}">${escapeHtml(label)}</span>`).join("");
}

function materialPathIndex(status = "") {
  if (status === "review") return 1;
  if (status === "approved") return 2;
  if (status === "scheduled" || status === "handed_off" || status === "published") return 3;
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
            <p class="eyebrow">${text("Preparation rules", "Правила подготовки")}</p>
            <h3>${text("What AgentResult may prepare before approval", "Что AgentResult может готовить до согласования")}</h3>
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
  const results = publicationResultsForDesk();
  const selected = results.find((item) => item.id === state.selectedPublicationResultId) || results[0] || null;
  return `
    ${resultsDeskMetrics(results)}
    <section class="results-desk-layout" aria-label="${escapeAttr(text("Results Desk", "Стол результатов"))}">
      <article class="panel full results-desk-table-panel">
        <div class="panel-heading compact">
          <div>
            <p class="eyebrow">${text("Publication results", "Результаты публикаций")}</p>
            <h3>${escapeHtml(text(`${results.length} confirmed publications`, `${results.length} подтверждённых публикаций`))}</h3>
          </div>
        </div>
        ${resultsDeskTable(results)}
      </article>
      ${resultsDeskDetail(selected)}
    </section>
  `;
}

function publicationResultsForDesk() {
  const rawResults = state.publicationResults.length
    ? state.publicationResults
    : derivePublicationResults(state.distributionSignals, state.calendar, state.content);
  return rawResults.map((item) => normalizePublicationResultForDesk(item));
}

function normalizePublicationResultForDesk(item = {}) {
  const calendarItem = state.calendar.find((entry) => String(entry.id || "") === String(item.calendar_item_id || item.calendarItemId || ""));
  const contentItem = state.content.find((entry) => String(entry.id || "") === String(item.content_item_id || item.contentItemId || calendarItem?.content_item_id || ""));
  const calendarMeta = calendarItem?.metadata || {};
  const resultMeta = calendarMeta.publication_result || {};
  const itemMeta = item.metadata || {};
  const reactionSource = item.primary_reactions || item.primaryReactions || resultMeta.reactions || itemMeta.primary_reactions || itemMeta.reactions || {};
  const reactions = {
    comments: Number(reactionSource.comments ?? item.comments ?? resultMeta.comments ?? 0),
    reposts: Number(reactionSource.reposts ?? item.reposts ?? resultMeta.reposts ?? 0),
    saves: Number(reactionSource.saves ?? item.saves ?? resultMeta.saves ?? 0),
    reactions: Number(reactionSource.reactions ?? reactionSource.reactions_count ?? item.reactions ?? item.reactions_count ?? resultMeta.reactions_count ?? 0)
  };
  const rawNextStep = item.next_step || item.nextStep || resultMeta.next_step || itemMeta.next_step || "leave";
  const nextStep = ["reuse", "expand", "update", "leave"].includes(rawNextStep) ? rawNextStep : "leave";
  const publicationUrl = item.publication_url || item.publicationUrl || resultMeta.publication_url || calendarMeta.publication_url || itemMeta.publication_url || "";
  return {
    ...item,
    id: item.id || `publication-result-${calendarItem?.id || item.calendar_item_id || item.content_item_id || "untracked"}`,
    calendar_item_id: item.calendar_item_id || item.calendarItemId || calendarItem?.id || "",
    content_item_id: item.content_item_id || item.contentItemId || calendarItem?.content_item_id || contentItem?.id || "",
    title: item.title || calendarItem?.title || contentItem?.title || text("Confirmed publication", "Подтверждённая публикация"),
    channel: item.channel || calendarItem?.channel || item.source || itemMeta.source || "manual",
    format: item.format || resultMeta.format || calendarMeta.format || contentItem?.content_type || "publication",
    publication_url: publicationUrl,
    confirmed_at: item.confirmed_at || item.confirmedAt || resultMeta.confirmed_at || calendarMeta.published_confirmed_at || item.created_at || calendarItem?.updated_at || "",
    primary_reactions: reactions,
    next_step: nextStep,
    next_step_note: item.next_step_note || item.nextStepNote || resultMeta.next_step_note || itemMeta.next_step_note || "",
    evidence: {
      ...(item.evidence || {}),
      has_url: Boolean(publicationUrl),
      has_reactions: Object.values(reactions).some((value) => Number(value) > 0)
    }
  };
}

function resultsDeskMetrics(results = []) {
  const withUrl = results.filter((item) => Boolean(item.publication_url)).length;
  const reactionTotal = results.reduce((sum, item) => {
    const reactions = item.primary_reactions || {};
    return sum + Object.values(reactions).reduce((inner, value) => inner + Number(value || 0), 0);
  }, 0);
  const nextSteps = results.filter((item) => item.next_step && item.next_step !== "leave").length;
  const channels = new Set(results.map((item) => item.channel || "manual"));
  const metrics = [
    [text("Confirmed", "Подтверждено"), results.length, text("publication results", "результатов публикаций")],
    [text("With URL", "С URL"), withUrl, text("source attached", "источник прикреплён")],
    [text("Primary reactions", "Первичные реакции"), reactionTotal, text("comments, saves, reposts", "комментарии, сохранения, репосты")],
    [text("Next steps", "Следующие шаги"), nextSteps, text("reuse, expand, update", "переиспользовать, расширить, обновить")],
    [text("Channels", "Каналы"), channels.size, text("distribution surfaces", "площадки дистрибуции")]
  ];
  return `
    <section class="results-desk-metrics" aria-label="${escapeAttr(text("Results Desk metrics", "Метрики стола результатов"))}">
      ${metrics.map(([label, value, note]) => `
        <article>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(String(value))}</strong>
          <p>${escapeHtml(note)}</p>
        </article>
      `).join("")}
    </section>
  `;
}

function resultsDeskTable(results = []) {
  if (!results.length) {
    return `
      <div class="results-desk-empty">
        <strong>${escapeHtml(text("No publication results yet", "Результатов публикаций пока нет"))}</strong>
        <p>${escapeHtml(text("Confirm a live release in Publication Desk to create the first result.", "Подтвердите выход в Публикационном столе, чтобы создать первый результат."))}</p>
        <button class="button secondary table-button" data-action="go-calendar">${escapeHtml(text("Open Publication Desk", "Открыть Публикационный стол"))}</button>
      </div>
    `;
  }
  const headers = [
    text("Publication", "Публикация"),
    text("URL", "URL"),
    text("Channel", "Канал"),
    text("Format", "Формат"),
    text("Reactions", "Реакции"),
    text("Next step", "Следующий шаг"),
    text("Actions", "Действия")
  ];
  return `
    <div class="results-desk-table" style="--results-cols:${headers.length}">
      ${headers.map((header) => `<div class="results-table-head">${escapeHtml(header)}</div>`).join("")}
      ${results.map((item) => resultsDeskRow(item).join("")).join("")}
    </div>
  `;
}

function resultsDeskRow(item) {
  const reactions = publicationReactionSummary(item.primary_reactions || {});
  const url = item.publication_url || text("not attached", "не прикреплён");
  const isSelected = item.id === state.selectedPublicationResultId || (!state.selectedPublicationResultId && publicationResultsForDesk()[0]?.id === item.id);
  return [
    `<div class="results-table-cell result-title-cell"><button class="result-title-button ${isSelected ? "active" : ""}" data-action="select-publication-result" data-id="${escapeAttr(item.id)}"><strong>${escapeHtml(item.title || text("Confirmed publication", "Подтверждённая публикация"))}</strong><span>${escapeHtml(formatDate(item.confirmed_at || item.created_at || ""))}</span></button></div>`,
    `<div class="results-table-cell"><span class="result-url">${escapeHtml(url)}</span></div>`,
    `<div class="results-table-cell">${escapeHtml(displayChannel(item.channel || "manual"))}</div>`,
    `<div class="results-table-cell">${escapeHtml(labelize(item.format || "publication"))}</div>`,
    `<div class="results-table-cell">${escapeHtml(reactions)}</div>`,
    `<div class="results-table-cell"><mark>${escapeHtml(publicationNextStepLabel(item.next_step))}</mark></div>`,
    `<div class="results-table-cell"><div class="button-row compact">${publicationResultActions(item)}</div></div>`
  ];
}

function resultsDeskDetail(item) {
  if (!item) {
    return `
      <aside class="panel results-desk-detail" aria-label="${escapeAttr(text("Publication result detail", "Детали результата публикации"))}">
        <div class="empty-state">
          <h3>${escapeHtml(text("No result selected", "Результат не выбран"))}</h3>
          <p>${escapeHtml(text("Publication details appear after the first confirmed release.", "Детали появятся после первого подтверждённого выпуска."))}</p>
        </div>
      </aside>
    `;
  }
  const reactions = item.primary_reactions || {};
  const reactionRows = [
    [text("Comments", "Комментарии"), reactions.comments || 0],
    [text("Reposts", "Репосты"), reactions.reposts || 0],
    [text("Saves", "Сохранения"), reactions.saves || 0],
    [text("Reactions", "Реакции"), reactions.reactions || 0]
  ];
  return `
    <aside class="panel results-desk-detail" aria-label="${escapeAttr(text("Publication result detail", "Детали результата публикации"))}">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">${text("Publication result", "Результат публикации")}</p>
          <h3>${escapeHtml(item.title || text("Confirmed publication", "Подтверждённая публикация"))}</h3>
        </div>
      </div>
      <div class="result-detail-grid">
        <div><span>${escapeHtml(text("URL", "URL"))}</span><strong>${escapeHtml(item.publication_url || text("not attached", "не прикреплён"))}</strong></div>
        <div><span>${escapeHtml(text("Channel", "Канал"))}</span><strong>${escapeHtml(displayChannel(item.channel || "manual"))}</strong></div>
        <div><span>${escapeHtml(text("Format", "Формат"))}</span><strong>${escapeHtml(labelize(item.format || "publication"))}</strong></div>
        <div><span>${escapeHtml(text("Confirmed", "Подтверждено"))}</span><strong>${escapeHtml(formatDate(item.confirmed_at || ""))}</strong></div>
      </div>
      <div class="result-reaction-grid">
        ${reactionRows.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`).join("")}
      </div>
      <div class="result-next-step-box">
        <span>${escapeHtml(text("Next content step", "Следующий контент-шаг"))}</span>
        <strong>${escapeHtml(publicationNextStepLabel(item.next_step))}</strong>
        <div class="button-row compact">${publicationResultActions(item)}</div>
      </div>
    </aside>
  `;
}

function publicationReactionSummary(reactions = {}) {
  return [
    [text("comments", "комм."), reactions.comments],
    [text("reposts", "репосты"), reactions.reposts],
    [text("saves", "сохр."), reactions.saves],
    [text("reactions", "реакции"), reactions.reactions]
  ].filter(([, value]) => Number(value) > 0)
    .map(([label, value]) => `${value} ${label}`)
    .join(" · ") || text("No primary reactions yet", "Первичных реакций пока нет");
}

function publicationResultActions(item) {
  return `
    <button class="button secondary table-button" data-action="set-publication-result-step" data-id="${escapeAttr(`${item.id}|${item.calendar_item_id}|reuse`)}">${escapeHtml(text("Reuse", "Переисп."))}</button>
    <button class="button secondary table-button" data-action="set-publication-result-step" data-id="${escapeAttr(`${item.id}|${item.calendar_item_id}|expand`)}">${escapeHtml(text("Expand", "Расширить"))}</button>
    <button class="button secondary table-button" data-action="set-publication-result-step" data-id="${escapeAttr(`${item.id}|${item.calendar_item_id}|update`)}">${escapeHtml(text("Update", "Обновить"))}</button>
    <button class="button secondary table-button" data-action="set-publication-result-step" data-id="${escapeAttr(`${item.id}|${item.calendar_item_id}|leave`)}">${escapeHtml(text("Leave", "Оставить"))}</button>
  `;
}

function publicationResultsPanel() {
  const results = state.publicationResults.length
    ? state.publicationResults
    : derivePublicationResults(state.distributionSignals, state.calendar, state.content);
  if (!results.length) return "";
  return `
    <article class="panel full publication-results-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${text("Publication results", "Результаты публикаций")}</p>
          <h3>${text("What went out and what to do next", "Что вышло и что делать дальше")}</h3>
        </div>
      </div>
      <div class="result-action-list">
        ${results.slice(0, 6).map((item) => publicationResultRow(item)).join("")}
      </div>
    </article>
  `;
}

function publicationResultRow(item) {
  const reactions = item.primary_reactions || {};
  const reactionSummary = [
    [text("comments", "комм."), reactions.comments],
    [text("reposts", "репосты"), reactions.reposts],
    [text("saves", "сохр."), reactions.saves],
    [text("reactions", "реакции"), reactions.reactions]
  ].filter(([, value]) => Number(value) > 0)
    .map(([label, value]) => `${value} ${label}`)
    .join(" · ") || text("No primary reactions yet", "Первичных реакций пока нет");
  const nextLabel = publicationNextStepLabel(item.next_step);
  const url = item.publication_url || "";
  const source = [
    displayChannel(item.channel || "manual"),
    labelize(item.format || "publication")
  ].filter(Boolean).join(" · ");
  return `
    <article class="result-action-row publication-result-row">
      <div>
        <span>${escapeHtml(source)}</span>
        <strong>${escapeHtml(item.title || text("Confirmed publication", "Подтверждённая публикация"))}</strong>
        <p>${escapeHtml(url || text("URL not attached yet", "URL пока не прикреплён"))}</p>
        <p>${escapeHtml(`${reactionSummary}. ${text("Next:", "Дальше:")} ${nextLabel}`)}</p>
      </div>
      <div class="button-row compact">
        <button class="button secondary table-button" data-action="set-publication-result-step" data-id="${escapeAttr(`${item.id}|${item.calendar_item_id}|reuse`)}">${escapeHtml(text("Reuse", "Переисп."))}</button>
        <button class="button secondary table-button" data-action="set-publication-result-step" data-id="${escapeAttr(`${item.id}|${item.calendar_item_id}|expand`)}">${escapeHtml(text("Expand", "Расширить"))}</button>
        <button class="button secondary table-button" data-action="set-publication-result-step" data-id="${escapeAttr(`${item.id}|${item.calendar_item_id}|update`)}">${escapeHtml(text("Update", "Обновить"))}</button>
        <button class="button secondary table-button" data-action="set-publication-result-step" data-id="${escapeAttr(`${item.id}|${item.calendar_item_id}|leave`)}">${escapeHtml(text("Leave", "Оставить"))}</button>
      </div>
    </article>
  `;
}

function publicationNextStepLabel(step = "leave") {
  const labels = {
    reuse: text("reuse in the next material", "переиспользовать в следующем материале"),
    expand: text("expand into a larger text", "расширить в большой материал"),
    update: text("update the published material", "обновить опубликованный материал"),
    leave: text("leave as published", "оставить как опубликованное")
  };
  return labels[step] || labels.leave;
}

function resultConfirmationClarityPanel() {
  const profile = state.offer?.profile || {};
  const signalSource = String(profile.firstSignalSource || text("publication URL, channel reaction, comment, repost, save, or owner mark", "URL публикации, реакция канала, комментарий, репост, сохранение или отметка собственника")).replace(/[.!?]+$/, "");
  const waiting = state.calendar.filter((item) => item.status === "handed_off");
  const confirmed = state.calendar.filter((item) => item.status === "published");
  if (!waiting.length && !confirmed.length) return "";

  const releaseItems = [...waiting, ...confirmed].slice(0, 3);
  const title = waiting.length
    ? text("Result, not new approval", "Результат, не новое согласование")
    : text("Release confirmed; watch signal", "Выпуск подтверждён; смотрим сигнал");
  const note = waiting.length
    ? text(
      "Only the live release fact is confirmed.",
      "Подтверждается только факт выхода."
    )
    : text(
      "Result needs a URL, channel reaction, comment, repost, save, or owner mark.",
      "Результату нужен URL, реакция канала, комментарий, репост, сохранение или отметка."
    );

  return `
    <section class="result-confirmation-clarity" aria-label="${escapeAttr(text("Result confirmation clarity", "Пояснение подтверждения результата"))}">
      <div>
        <p class="eyebrow">${text("After release", "После выпуска")}</p>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(note)}</p>
      </div>
      <div class="result-confirmation-grid">
        ${releaseItems.map((item) => `
          <article>
            <span>${escapeHtml(displayChannel(item.channel || "manual"))}</span>
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.status === "published"
              ? text("Counted in Results.", "Учтено в результатах.")
              : text("Confirm after visible in channel.", "Подтвердить после выхода в канале."))}</p>
          </article>
        `).join("")}
      </div>
      <div class="result-confirmation-rules">
        <span>${escapeHtml(text("Counts as result: confirmed live release.", "Считаем результатом: подтверждённый выход."))}</span>
        <span>${escapeHtml(text(`Expected signal: ${signalSource}.`, `Ожидаемый сигнал: ${signalSource}.`))}</span>
        <span>${escapeHtml(text("No new text approval.", "Без нового согласования текста."))}</span>
      </div>
    </section>
  `;
}

function resultSignalContractPanel(metrics) {
  const profile = state.offer?.profile || {};
  const source = compactDisplayText(String(profile.firstSignalSource || text("publication URL, channel reaction, comment, repost, save, or owner mark", "URL публикации, реакция канала, комментарий, репост, сохранение или отметка собственника")).replace(/[.!?]+$/, ""), 84);
  const marker = compactDisplayText(String(profile.releaseOwner || text("Owner or manager QA", "Собственник или менеджер QA")).replace(/[.!?]+$/, ""), 64);
  const signals = [
    text("Publication URL", "URL публикации"),
    text("Channel reaction", "Реакция канала"),
    text("Channel comment", "Комментарий"),
    text("Reuse mark", "Отметка для переиспользования")
  ];
  const hasDistributionSignal = Number(metrics.distribution_signals || metrics.result_signals || 0) > 0;
  const publishedCount = state.calendar.filter((item) => item.status === "published").length;
  const contractNote = hasDistributionSignal
    ? text(`Recorded. Source: ${source}. Marked by: ${marker}.`, `Зафиксировано. Источник: ${source}. Отмечает: ${marker}.`)
    : publishedCount
      ? text(`Publication is live. Watch: ${source}. Marked by: ${marker}.`, `Публикация вышла. Смотрим: ${source}. Отмечает: ${marker}.`)
      : text(`After release: ${source}. Marked by: ${marker}.`, `После выпуска: ${source}. Отмечает: ${marker}.`);
  return `
    <article class="panel full result-signal-contract">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">${text("Distribution signal", "Сигнал дистрибуции")}</p>
          <h3>${hasDistributionSignal ? text("Publication result recorded", "Результат публикации зафиксирован") : text("Publication check source", "Источник проверки публикации")}</h3>
        </div>
      </div>
      <p>${escapeHtml(contractNote)}</p>
      <p>${escapeHtml(text("Next step: reuse, expand, update, or leave as published.", "Следующий шаг: переиспользовать, расширить, обновить или оставить как опубликованное."))}</p>
      <div class="readiness-chip-row">
        ${signals.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
      </div>
    </article>
  `;
}

function resultFlowPanel(metrics) {
  const signal = primaryBusinessSignal(metrics);
  const next = resultNextMove(metrics);
  const signalAction = resultSignalAction(metrics);
  const publishedCount = state.calendar.filter((item) => item.status === "published").length;
  const handedOffCount = handedOffCalendarCount(state.calendar);
  const releaseNote = handedOffCount
    ? text(`${handedOffCount} awaiting result confirmation.`, `${handedOffCount} ждёт подтверждения результата.`)
    : publishedCount
      ? text("Confirmed materials are counted in the result.", "Подтверждённые материалы учтены в результате.")
      : text("Release appears here after confirmation.", "Выпуск появится здесь после подтверждения.");
  const steps = [
    {
      title: text("Confirmed release", "Подтверждённый выпуск"),
      value: String(publishedCount),
      note: releaseNote,
      state: publishedCount ? "done" : handedOffCount ? "active" : "muted",
      action: handedOffCount ? "go-calendar-handoff" : "go-calendar",
      label: handedOffCount ? text("Confirm result", "Подтвердить результат") : text("Open publications", "Открыть публикации"),
      support: true
    },
    {
      title: text("Signal", "Сигнал"),
      value: signal.value,
      note: signal.note,
      state: Number(signal.value || 0) ? "done" : publishedCount ? "active" : "muted",
      action: signalAction.action,
      label: signalAction.label,
      support: true
    },
    {
      title: text("Next step", "Следующий шаг"),
      value: "",
      note: next.title,
      state: "active",
      action: next.action,
      id: next.id || "",
      label: next.label
    }
  ];

  return `
    <section class="result-path analytics-flow" aria-label="${escapeAttr(text("Result flow", "Логика результата"))}">
      <div class="result-path-head">
        <p class="eyebrow">${text("Result loop", "Контур результата")}</p>
        <h3>${text("Release -> signal -> next", "Выпуск -> сигнал -> дальше")}</h3>
      </div>
      <div class="result-path-steps">
        ${steps.map((step, index) => `
          <article class="result-path-step ${step.state}">
            <span>${index + 1}</span>
            <strong>${escapeHtml(step.value ? `${step.title}: ${step.value}` : step.title)}</strong>
            <p>${escapeHtml(step.note)}</p>
            ${step.support ? "" : `<button class="button secondary table-button" data-action="${escapeAttr(step.action)}" data-id="${escapeAttr(step.id || "")}">${escapeHtml(step.label)}</button>`}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function resultSignalAction(metrics) {
  if (IS_PRODUCTION_DEMO && metrics.leads) {
    return {
      action: "show-result-source",
      label: text("Check source", "Проверить источник")
    };
  }
  return {
    action: "import-metrics",
    label: metrics.leads ? text("Check source", "Проверить источник") : text("Add signal", "Добавить сигнал")
  };
}

function primaryBusinessSignal(metrics) {
  if (metrics.leads) {
    return {
      value: String(metrics.leads),
      title: text("New demand is visible", "Появился спрос"),
      note: text("Check source and quality.", "Проверить источник и качество.")
    };
  }
  if (metrics.recovered_payments) {
    return {
      value: String(metrics.recovered_payments),
      title: text("Money returned", "Деньги вернулись"),
      note: text("Recovered payments are counted only after confirmation.", "Возврат денег считается только после подтверждения.")
    };
  }
  if (metrics.distribution_signals || metrics.result_signals) {
    return {
      value: String(metrics.distribution_signals || metrics.result_signals),
      title: text("Publication result confirmed", "Результат публикации подтверждён"),
      note: text("Confirmed release created a distribution signal.", "Подтверждённый выпуск создал сигнал дистрибуции.")
    };
  }
  if (metrics.published_materials) {
    return {
      value: String(metrics.published_materials),
      title: text("Work has been released", "Работа вышла"),
      note: text("Waiting for URL, channel reaction, comment, or reuse mark.", "Ждём URL, реакцию канала, комментарий или отметку для переиспользования.")
    };
  }
  return {
    value: "0",
    title: text("No publication signal yet", "Сигнала публикации пока нет"),
    note: text("No URL, channel reaction, comment, or reuse mark yet.", "Пока нет URL, реакции канала, комментария или отметки для переиспользования.")
  };
}

function compactDisplayText(value, limit = 96) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  const sliced = normalized.slice(0, limit).replace(/\s+\S*$/, "").replace(/[.!?,;:]+$/, "").trim();
  return `${sliced || normalized.slice(0, limit - 1)}...`;
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
            ${taskAction(task, { demoReview: IS_PRODUCTION_DEMO })}
          </article>
        `).join("")}
      </div>
    `;
  }
  return `
    <div class="result-empty-action">
      <strong>${escapeHtml(text("No follow-up actions yet", "Следующих действий пока нет"))}</strong>
      <p>${escapeHtml(metrics.leads || metrics.published_materials
        ? text("Create follow-up actions from the current signals when you are ready to tighten the loop.", "Создайте следующие действия по текущим сигналам, когда будете готовы усиливать контур.")
        : text("First get a release or recorded distribution signal, then follow-up actions will become useful.", "Сначала нужен выпуск или зафиксированный сигнал дистрибуции, потом следующие действия станут полезными."))}</p>
    </div>
  `;
}

function resultNextMove(metrics) {
  const loopAction = ownerLoopBlockingAction();
  if (loopAction) {
    return {
      title: loopAction.title,
      note: loopAction.note,
      action: loopAction.action,
      id: loopAction.id,
      label: loopAction.label,
      variant: "primary"
    };
  }
  if (!metrics.leads && !metrics.published_materials) {
    return {
      title: text("Get the first release and distribution signal into the system", "Зафиксируйте первый выпуск и сигнал дистрибуции"),
      note: text("Until a material is released and a URL, reaction, comment, or owner mark is recorded, results show preparation, not distribution.", "Пока нет выпуска и URL, реакции, комментария или отметки собственника, результаты показывают подготовку, а не дистрибуцию."),
      action: "import-metrics",
      label: text("Add signal", "Добавить сигнал"),
      variant: "primary"
    };
  }
  if (metrics.pending_approvals) {
    const pendingApproval = state.approvals.find((item) => item.status === "pending");
    return {
      title: text("Clear pending approvals before pushing more materials", "Разберите согласования перед новым выпуском"),
      note: text("Approval-first works when owner decisions do not pile up.", "Выпуск через согласование работает, когда решения собственника не копятся."),
      action: "go-approvals",
      id: pendingApproval?.id || "",
      label: text("Open approvals", "Открыть согласования"),
      variant: "primary"
    };
  }
  if (!metrics.leads) {
    return {
      title: text("Record the first distribution signal after release", "Зафиксируйте первый сигнал дистрибуции после выпуска"),
      note: text("For the first pilot, a useful result starts with a publication URL, channel reaction, comment, repost, save, or owner mark.", "Для первого пилота полезный результат начинается с URL публикации, реакции канала, комментария, репоста, сохранения или отметки собственника."),
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

function taskAction(task, options = {}) {
  if (task.status === "done" || task.status === "approved") return `<span class="muted">${escapeHtml(text("Done", "Готово"))}</span>`;
  if (options.demoReview) return `<span class="muted">${escapeHtml(text("Next work", "Следующая работа"))}</span>`;
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
      text("Readiness, blockers, access owner.", "Готовность, блокеры, владелец доступа.")
    ],
    autopilot: [
      text("Approval rules", "Правила согласования"),
      text("AgentResult, manager QA, owner approval.", "AgentResult, QA менеджера, решения собственника.")
    ],
    tools: [
      text("Access", "Доступы"),
      text("Connected, blocked, owner.", "Подключено, заблокировано, ответственный.")
    ]
  };
  const [title, note] = contexts[tab] || contexts.technical;
  return `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(note)}</span>`;
}

function settingsNextStep(tab) {
  const loopAction = tab === "technical" ? ownerLoopBlockingAction() : null;
  if (loopAction) {
    return `
      <section class="settings-next-step">
        <div>
          <p class="eyebrow">${escapeHtml(text("Owner loop first", "Сначала рабочий цикл"))}</p>
          <strong>${escapeHtml(loopAction.title)}</strong>
          <span>${escapeHtml(text("Next action is in the release loop.", "Следующее действие в контуре выпуска."))}</span>
        </div>
        <button class="button primary" data-action="${escapeAttr(loopAction.action)}" data-id="${escapeAttr(loopAction.id || "")}">${escapeHtml(loopAction.label)}</button>
      </section>
    `;
  }

  const steps = {
    technical: {
      eyebrow: text("Owner next step", "Следующий шаг собственника"),
      title: text("Assign blocking access owner", "Назначить владельца доступа"),
      note: text("Workspace, domain, sender or channel.", "Рабочий контур, домен, отправитель или канал."),
      action: "set-settings-tab",
      id: "tools",
      label: text("Open Access", "Открыть Доступы")
    },
    autopilot: {
      eyebrow: text("Owner next step", "Следующий шаг собственника"),
      title: text("Keep approval-first", "Оставить approval-first"),
      note: text("Topics, exceptions, result confirmation.", "Темы, исключения, подтверждение результата."),
      action: "save-autopilot",
      id: "",
      label: text("Save rules", "Сохранить правила")
    },
    tools: {
      eyebrow: text("Owner next step", "Следующий шаг собственника"),
      title: text("Assign access owner", "Назначить ответственного"),
      note: text("Only blocker, owner and next action.", "Только блокер, владелец и следующий шаг."),
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
  const profile = state.offer?.profile || {};
  const pilotGaps = pilotIntakeGaps(profile);
  const launchItems = [
    {
      label: text("Pilot intake", "Контекст пилота"),
      value: pilotGaps.length ? text(`${pilotGaps.length} missing`, `${pilotGaps.length} не хватает`) : text("Ready", "Готов"),
      note: pilotGaps[0] || text("First loop ready.", "Первый цикл готов.")
    },
    {
      label: text("Control loop", "Контур контроля"),
      value: pendingApprovals ? text("Needs decisions", "Есть решения") : text("Clear", "Чисто"),
      note: pendingApprovals
        ? approvalWaitNote(pendingApprovals)
        : text("No owner wait.", "Собственник не блокирует.")
    },
    {
      label: text("Manager QA", "Менеджер QA"),
      value: profile.releaseOwner ? text("Assigned", "Назначен") : text("Missing", "Не назначен"),
      note: profile.releaseOwner || text("Facts, voice, AI-ishness.", "Факты, стиль, иишность.")
    },
    {
      label: text("First signal", "Первый сигнал"),
      value: profile.firstSignalSource ? text("Source set", "Источник задан") : text("Missing", "Не задан"),
      note: profile.firstSignalSource || text("Publication URL, reaction, comment, repost, save, or mark.", "URL публикации, реакция, комментарий, репост, сохранение или отметка.")
    }
  ];
  const nextBlocker = pilotGaps[0] || (pendingApprovals ? text("Weekly topic", "Тема недели") : text("Access owner", "Владелец доступа"));
  return `
    <article class="panel full system-status-panel">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">${text("Owner control", "Контроль собственника")}</p>
          <h3>${state.online ? text("Workspace is connected", "Рабочий контур подключён") : text("Demo loop is ready to review", "Демо-цикл готов к просмотру")}</h3>
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
      <div class="owner-control-summary">
        <span>${escapeHtml(text("Next owner-level action", "Следующее действие собственника"))}</span>
        <strong>${escapeHtml(nextBlocker)}</strong>
        <p>${escapeHtml(text("Connected, blocker, owner, next action.", "Подключено, блокер, владелец, следующий шаг."))}</p>
      </div>
    </article>
  `;
}

function pilotIntakeGaps(profile = {}) {
  const fields = [
    ["positioning", text("Offer", "Оффер")],
    ["icp", "ICP"],
    ["pains", text("Pains", "Боли")],
    ["proof", text("Proof", "Доказательства")],
    ["forbiddenClaims", text("Limits", "Ограничения")],
    ["channels", text("Release channel", "Канал выпуска")],
    ["releaseOwner", text("Manager QA", "Менеджер QA")],
    ["firstSignalSource", text("First signal source", "Источник первого сигнала")]
  ];
  return fields.filter(([key]) => !String(profile[key] || "").trim()).map(([, label]) => label);
}

function renderAutopilotSettings() {
  const toggles = [
    ["prepare-topics", text("Prepare weekly topics", "Готовить темы недели"), true],
    ["write-drafts", text("Write drafts from approved topics", "Писать тексты по согласованным темам"), true],
    ["source-pack-gate", text("Filter weak drafts through Source Pack", "Отсеивать слабые тексты через Source Pack"), true],
    ["manager-qa", text("Route passing drafts to manager QA", "Передавать прошедшие тексты в QA менеджера"), true],
    ["approval-reminders", text("Remind about approvals", "Напоминать о согласовании"), true],
    ["direct-publishing", text("Publish without release control", "Публиковать без контроля выпуска"), false]
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
            <h3>${text("Topic, text, QA, release, signal.", "Тема, текст, QA, выпуск, сигнал.")}</h3>
          </div>
        </div>
        <div class="rules-check-block">
          <span class="meta-label">${text("AgentResult may prepare", "AgentResult может готовить")}</span>
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
            <h3>${text("What never goes out automatically", "Что не выпускается автоматически")}</h3>
          </div>
        </div>
        <div class="automation-list">
          ${automationRow(text("AgentResult prepares", "AgentResult готовит"), text("Weekly topics, approved-topic drafts, Source Pack checks and approval reminders.", "Темы недели, тексты по согласованным темам, проверки Source Pack и напоминания о согласовании."), 78)}
          ${automationRow(text("Manager QA clears", "Менеджер QA допускает"), text("Facts, proof, author voice, AI-ishness, owner boundaries and channel format.", "Факты, proof, стиль автора, иишность, границы собственника и формат канала."), 88)}
          ${automationRow(text("Owner decides", "Собственник решает"), text("Weekly topics, exceptions, risky claims and result confirmation.", "Темы недели, исключения, рискованные утверждения и подтверждение результата."), 100)}
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
        "Next step: approve the weekly topics and boundaries; AgentResult drafts, manager QA checks, release follows."
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
        "Следующий шаг: согласовать темы недели и границы; AgentResult пишет, менеджер QA проверяет, дальше выпуск."
      ].join("\n")
    );
  }
  if (channel === "website") {
    return text(
      "H1: AgentResult Growth Control for B2B companies\nMeta: Turn weekly topics and owner boundaries into AI drafts, manager QA, regular release and tracked signals.\nPrimary CTA: Start the first controlled release",
      "H1: AgentResult Growth Control для B2B-компаний\nMeta: Превратите темы недели и границы собственника в AI-тексты, QA менеджера, регулярный выпуск и фиксируемые сигналы.\nГлавный CTA: Запустить первый управляемый выпуск"
    );
  }
  if (channel === "email") {
    return text(
      "Subject: A safer start for AgentResult content release\nBody: Start with weekly topics, AI drafts, manager QA, controlled release, and result tracking.",
      "Тема: Безопасный старт выпуска контента AgentResult\nТело: Начните с тем недели, AI-черновиков, QA менеджера, контролируемого выпуска и фиксации результата."
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
  if (item.scope === "sensitive_claim") return text("Approve the boundary for claims that need proof or owner-level risk control.", "Согласуйте границу утверждений, где нужны доказательства или контроль риска собственника.");
  if (item.scope === "social_post") return text(`Approve the weekly topic and public boundary for ${channelName}; manager QA checks the final text.`, `Согласуйте тему недели и публичные границы для ${channelName}; финальный текст проверяет менеджер QA.`);
  if (item.scope === "publish") return text("This approves the weekly release direction before AgentResult drafts and manager QA.", "Это согласует направление недельного выпуска до AI-текстов и QA менеджера.");
  return text("This affects weekly public output and needs an owner-level boundary decision.", "Это влияет на недельный публичный выпуск, поэтому нужно решение собственника по границам.");
}

function approvalOutcome(item, channel) {
  const channelName = displayChannel(channel);
  if (item.scope === "publish") return text(`AgentResult can draft for ${channelName}; manager QA checks quality before release.`, `AgentResult сможет писать для ${channelName}; менеджер QA проверит качество перед выпуском.`);
  if (item.scope === "social_post") return text(`The ${channelName} topic can move into AI drafting and manager QA.`, `Тема для ${channelName} перейдёт в AI-подготовку и QA менеджера.`);
  if (item.scope === "sensitive_claim") return text("AgentResult keeps the approved boundary; exceptions return to the owner.", "AgentResult держит согласованную границу; исключения возвращаются собственнику.");
  return text("The weekly release can proceed without owner editing every text.", "Недельный выпуск сможет идти без редактуры каждого текста собственником.");
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
      label: text("Author voice matches", "Похоже на стиль автора"),
      note: text("Author phrases are preserved; generic AI structure is removed.", "Фразы автора сохранены; AI-шаблон убран.")
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
  return raw || text("Weekly topic approval", "Согласование темы недели");
}

function ownerActor(value) {
  const raw = String(value || "").trim();
  if (!raw) return text("System", "Система");
  if (/human|reviewer|owner|egor|егор/i.test(raw)) return text("Human reviewer", "Человек-ревьюер");
  return text("System", "Система");
}

function ownerActivityEvent(event) {
  const raw = String(event || "");
  if (/approval|согласован/i.test(raw)) return text("Prepared a weekly topic for approval", "Подготовлена тема недели на согласование");
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
        meta: text("Prepare one week of approved texts for fallback release.", "Подготовьте неделю утверждённых текстов для резервного выпуска."),
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
    [text("Created manager release queue", "Создана очередь выпуска менеджера"), text(`${state.calendar.length} release items`, `${state.calendar.length} пунктов выпуска`)]
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
  if (!facts.length) facts.push(text("Not yet linked to approval or release queue", "Пока не связан с согласованием или очередью выпуска"));
  return `<div class="material-workflow-facts">${facts.map((fact) => `<span>${escapeHtml(fact)}</span>`).join("")}</div>`;
}

function materialApprovalState(item) {
  const approvals = state.approvals
    .filter((entry) => entry.target_id === item.id || entry.content_item_id === item.id)
    .sort((a, b) => new Date(b.decided_at || b.updated_at || b.created_at || 0).getTime() - new Date(a.decided_at || a.updated_at || a.created_at || 0).getTime());
  return approvals[0] || null;
}

function materialCalendarItem(item) {
  return state.calendar.find((entry) => entry.content_item_id === item.id) || null;
}

function materialOwnerStatus(item) {
  const calendar = materialCalendarItem(item);
  if (calendar?.status === "published") return "published";
  if (calendar?.status === "handed_off") return "handed_off";
  if (calendar?.status === "scheduled") return "scheduled";
  if (item.status === "needs_revision") return "needs_revision";
  if (item.status === "revised_draft") return "revised_draft";

  const approval = materialApprovalState(item);
  if (approval?.status === "pending") return "review";
  if (approval?.status === "approved") return "approved";
  if (["changes_requested", "rejected"].includes(String(approval?.status || ""))) return "changes";

  if (item.status === "review") return "draft";
  return item.status || "idea";
}

function materialOwnerStage(item) {
  const status = materialOwnerStatus(item);
  if (status === "review") return text("Weekly topic decision", "Тема недели на решении");
  if (status === "approved") return text("AI draft / QA", "AI-черновик / QA");
  if (status === "scheduled") return text("Release queue", "Очередь выпуска");
  if (status === "handed_off") return text("Result confirmation", "Подтверждение результата");
  if (status === "published") return text("Already out", "Уже вышло");
  if (status === "changes") return text("Needs changes", "Нужны правки");
  if (status === "needs_revision") return text("Needs revision before QA", "Нужно переписать до QA");
  if (status === "revised_draft") return text("Revised draft / QA", "Исправленный текст / QA");
  return text("AI draft / QA", "AI-черновик / QA");
}

function materialOwnerOutcome(item) {
  const status = materialOwnerStatus(item);
  if (status === "review") return text("next: approve weekly topic and boundaries", "следующее: согласовать тему недели и границы");
  if (status === "approved") return text("next: manager QA checks facts, author voice, AI-ishness, then release queue", "следующее: менеджер QA проверяет факты, стиль автора, иишность, затем очередь выпуска");
  if (status === "scheduled") return text("next: manager release queue", "следующее: очередь выпуска у менеджера");
  if (status === "handed_off") return text("next: owner confirms result", "следующее: собственник подтверждает результат");
  if (status === "published") return text("result: already counted", "результат: уже учтено");
  if (status === "changes") return text("next: update the boundary and return to owner", "следующее: обновить границу и вернуть собственнику");
  if (status === "needs_revision") return text("next: revise against Source Pack before manager QA", "следующее: переписать по Source Pack до QA менеджера");
  if (status === "revised_draft") return text("next: manager QA checks revised text", "следующее: менеджер QA проверяет исправленный текст");
  return text("next: finish the topic and send for owner approval", "следующее: доработать тему и отправить собственнику");
}

function materialPrimaryAction(item) {
  const status = materialOwnerStatus(item);
  const approval = materialApprovalState(item);
  const calendar = materialCalendarItem(item);
  if (status === "handed_off" && calendar) return { action: "mark-calendar-published", id: calendar.id, label: text("Confirm result", "Подтвердить результат") };
  if (status === "scheduled" && calendar) return { action: "mark-calendar-exported", id: calendar.id, label: text("Open release status", "Открыть статус выпуска") };
  if (status === "approved" || status === "revised_draft") return { action: "mark-manager-qa-passed", id: item.id, label: text("QA passed", "QA пройден") };
  if (status === "needs_revision") return { action: "rerun-quality-gate", id: item.id, label: text("Apply Source Pack gate", "Применить Source Pack gate") };
  if (status === "review") return { action: approval?.id ? "go-approval" : "go-approvals", id: approval?.id || item.id, label: text("Approve topic", "Согласовать тему") };
  if (status === "published") return { action: "go-analytics", id: item.id, label: text("Open results", "Открыть результаты") };
  if (["draft", "changes"].includes(status)) return { action: "schedule-content", id: item.id, label: text("Open topic", "Открыть тему") };
  return { action: "open-content-detail", id: item.id, label: text("Open topic", "Открыть тему") };
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
  const status = materialOwnerStatus(item);
  if (["draft", "changes"].includes(status)) return { action: "schedule-content", label: text("Open topic", "Открыть тему") };
  if (["idea", "brief"].includes(status)) return { action: "send-content-approval", label: text("Send weekly topic", "Тему на согласование") };
  if (status === "review") return { action: "open-content-detail", label: text("Context", "Контекст") };
  if (status === "approved" || status === "scheduled" || status === "handed_off") return { action: "export-content", label: text("Open text", "Открыть текст") };
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
  if (label === "publishing") return text("release queue", "очередь выпуска");
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
    "go-overview": () => setRoute("overview"),
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
    "approve-weekly-batch": () => openWeeklyBatchApprovalModal(),
    "confirm-weekly-batch-approval": () => approveWeeklyTopicBatch(),
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
    "submit-publication-result-form": () => submitPublicationResultForm(),
    "content-from-demand": () => createContentFromDemand(id),
    "task-from-demand": () => createTaskFromDemand(id),
    "publish-from-demand": () => publishFromDemand(id),
    "send-content-approval": () => sendContentToApproval(id),
    "mark-manager-qa-passed": () => markManagerQaPassed(id),
    "return-manager-qa-revision": () => returnManagerQaRevision(id),
    "show-quality-gate": () => showQualityGate(id),
    "rerun-quality-gate": () => rerunQualityGate(id),
    "schedule-content": () => openFormModal("schedule", { contentId: id }),
    "export-content": () => exportContentItem(id),
    "close-modal": () => closeModal(),
    "open-source": () => openSelectedSource(),
    "open-risk-checklist": () => showToast(text("Checklist is visible in the approval detail.", "Чеклист уже открыт в деталях согласования.")),
    "open-content-detail": () => openContentDetail(id),
    "schedule-item": () => openFormModal("schedule"),
    "export-calendar": exportCalendarCsv,
    "mark-calendar-published": () => openPublicationResultModal(id),
    "mark-calendar-exported": () => updateCalendarStatus(id, "handed_off"),
    "select-publication-result": () => {
      state.selectedPublicationResultId = id;
      render();
    },
    "set-publication-result-step": () => setPublicationResultStep(id),
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
    "enable-autopilot": () => showToast(text("Preparation rules are saved locally for this prototype.", "Правила подготовки пока сохраняются локально в прототипе.")),
    "save-autopilot": saveAutopilotSettings,
    "save-tool": saveToolSetup,
    "request-tool-owner": requestToolOwner,
    "import-metrics": () => openFormModal("metrics"),
    "show-result-source": () => showToast(text(
      `${state.metrics.leads || 0} leads are recorded in the result loop. Next step: check quality and source before the next release.`,
      `${state.metrics.leads || 0} заявки зафиксированы в контуре результата. Дальше — проверить качество и источник перед новым выпуском.`
    )),
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
      `Manager started release for ${asset.label}. Owner confirms result after publication.`,
      `Менеджер запустил выпуск: ${asset.label}. После выхода собственник подтверждает результат.`
    )
  };
  upsertLocalItem("aiGrowthOsLocalCalendar", state.localCalendar, item);
  state.calendar = mergeLocalItems(state.calendar, [item]);
  state.metrics.calendar_items = state.calendar.length;
  state.metrics.published_materials = shippedCalendarCount(state.calendar);
  addActivity("Контроль выпуска", `Manager started release for pack asset: ${asset.label}`);
  showToast(text("Manager release started. Result waits for owner confirmation.", "Менеджер запустил выпуск. Результат ждёт подтверждения собственника."));
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
  addActivity("AgentResult", `Created material from demand: ${demand.title}`);
  showToast(text("Material created from strategy.", "Материал создан из стратегии."));
  setRoute("content-pipeline");
}

async function createTaskFromDemand(id) {
  const demand = state.demand.find((item) => item.id === id);
  if (!demand) return;
  await addLocalTask({
    title: text(`Prepare demand asset: ${demand.title}`, `Подготовить материал спроса: ${demand.title}`),
    owner: "AgentResult",
    status: "next",
    note: demandBusinessReason(demand),
    source: "growth-plan",
    targetType: "demand_map_item",
    targetId: demand.id
  });
  addActivity("AgentResult", `Created task from demand: ${demand.title}`);
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
    owner: "AgentResult",
    audience: demand.audience || text("B2B owner", "Собственник B2B"),
    metadata: {
      owner: "AgentResult",
      brief: [
        demandBusinessReason(demand),
        demandProblem(demand),
        text("Use practical owner language: money, requests, tasks, control, result.", "Писать языком собственника: деньги, заявки, задачи, контроль, результат."),
        text("Avoid guaranteed revenue, guaranteed debt recovery and autonomous public actions.", "Не обещать гарантированный рост, денежный результат и автономные публичные действия.")
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
      requested_by: "Контроль выпуска",
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
  addActivity("Контроль выпуска", `Sent weekly topic to approval: ${item.title}`);
  if (!options.silent) {
    showToast(text("Weekly topic sent to owner approval.", "Тема недели отправлена на согласование собственнику."));
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
  showToast(text("Text opened as TXT.", "Текст открыт как TXT."));
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
  showToast(text("Release queue CSV downloaded.", "CSV очереди выпуска скачан."));
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
  showToast(text("Pack downloaded as TXT.", "Пакет скачан как TXT."));
}

async function updateCalendarStatus(id, status, options = {}) {
  const item = state.calendar.find((entry) => entry.id === id);
  if (!item) return;
  if (state.online && !String(id).startsWith("local-calendar")) {
    const endpoint = status === "handed_off"
      ? `/publishing/items/${id}/handoff`
      : status === "published"
        ? `/publishing/items/${id}/confirm-live`
        : `/publishing/items/${id}/status`;
    const result = await api(endpoint, {
      method: status === "handed_off" || status === "published" ? "POST" : "PATCH",
      body: JSON.stringify(status === "handed_off" || status === "published" ? (options.payload || {}) : { status })
    }).catch(() => null);
    if (!result?.data) {
      showToast(text("Could not update release status.", "Не удалось обновить статус выпуска."));
      return;
    }
    await loadData();
  } else {
    item.status = status;
    item.updated_at = new Date().toISOString();
    if (options.metadata) {
      item.metadata = {
        ...(item.metadata || {}),
        ...options.metadata
      };
    }
    upsertLocalItem("aiGrowthOsLocalCalendar", state.localCalendar, item);
    const linkedContent = state.content.find((entry) => entry.id === item.content_item_id);
    if (linkedContent && isShippedStatus(status)) {
      linkedContent.status = status === "published" ? "published" : "handed_off";
      linkedContent.updated_at = new Date().toISOString();
      await persistContentState(linkedContent);
    }
    if (status === "published") ensureLocalDistributionSignal(item);
  }
  state.metrics.published_materials = shippedCalendarCount(state.calendar);
  refreshPublicationResults();
  addActivity("Контроль выпуска", `Updated publication status: ${item.title} -> ${labelize(status)}`);
  showToast(status === "published"
    ? text("Result confirmed and counted.", "Результат подтверждён и учтён.")
    : text("Release status updated.", "Статус выпуска обновлён."));
  openPublicationTab("calendar");
}

async function submitPublicationResultForm() {
  const id = document.querySelector("#publicationResultCalendarId")?.value || "";
  const item = state.calendar.find((entry) => entry.id === id);
  if (!item) {
    showToast(text("Select a publication first.", "Сначала выберите публикацию."));
    return;
  }
  const nextStep = document.querySelector("#publicationResultNextStep")?.value || "reuse";
  const nextStepNote = document.querySelector("#publicationResultNextStepNote")?.value.trim() || publicationNextStepLabel(nextStep);
  const payload = {
    note: nextStepNote,
    publicationUrl: document.querySelector("#publicationResultUrl")?.value.trim() || "",
    format: document.querySelector("#publicationResultFormat")?.value.trim() || item.channel || "publication",
    primaryReactions: {
      comments: numberValue("#publicationResultComments"),
      reposts: numberValue("#publicationResultReposts"),
      saves: numberValue("#publicationResultSaves"),
      reactions: numberValue("#publicationResultReactions")
    },
    nextStep,
    nextStepNote
  };
  const now = new Date().toISOString();
  const metadata = {
    result_note: payload.note,
    published_confirmed_by: state.me.userId || state.me.name || null,
    published_confirmed_at: now,
    publication_result: {
      publication_url: payload.publicationUrl,
      format: payload.format,
      reactions: payload.primaryReactions,
      next_step: payload.nextStep,
      next_step_note: payload.nextStepNote,
      confirmed_at: now,
      confirmed_by: state.me.userId || state.me.name || null
    }
  };
  state.formModal = null;
  await updateCalendarStatus(id, "published", { payload, metadata });
  const updatedItem = state.calendar.find((entry) => entry.id === id) || item;
  await executePublicationNextStep(updatedItem, nextStep);
  goRoute("analytics");
}

async function confirmHandedOffCalendarItems() {
  const items = state.calendar.filter((item) => item.status === "handed_off");
  if (!items.length) return;
  for (const item of items) {
    item.status = "published";
    item.updated_at = new Date().toISOString();
    await persistCalendarState(item);
    ensureLocalDistributionSignal(item);
    const linkedContent = state.content.find((entry) => entry.id === item.content_item_id);
    if (linkedContent) {
      linkedContent.status = "published";
      linkedContent.updated_at = new Date().toISOString();
      await persistContentState(linkedContent);
    }
  }
  state.metrics.published_materials = shippedCalendarCount(state.calendar);
  refreshPublicationResults();
  state.calendarFilter = "published";
  addActivity("Контроль выпуска", `Confirmed release result: ${items.length}`);
  showToast(text("Result confirmed and counted.", "Результат подтверждён и учтён."));
  openPublicationTab("calendar");
}

function ensureLocalDistributionSignal(item) {
  if (state.distributionSignals.some((signal) => signal.calendar_item_id === item.id)) return;
  const signal = {
    id: `local-distribution-signal-${item.id}`,
    calendar_item_id: item.id,
    content_item_id: item.content_item_id || null,
    status: "confirmed",
    source: item.channel || "manual",
    signal_type: "distribution_signal.confirmed",
    title: item.title,
    note: item.metadata?.result_note || text("Confirmed publication", "Подтверждённая публикация"),
    occurred_at: item.updated_at || new Date().toISOString(),
    confirmed_by: item.metadata?.published_confirmed_by || state.me.userId || null,
    metadata: {
      calendar_item_id: item.id,
      title: item.title,
      status: "confirmed"
    }
  };
  state.distributionSignals = [signal, ...state.distributionSignals];
  state.resultSignals = state.distributionSignals;
  state.metrics.distribution_signals = state.distributionSignals.length;
  state.metrics.result_signals = state.distributionSignals.length;
}

function refreshPublicationResults() {
  if (state.publicationResultsSource === "backend") return;
  state.publicationResults = derivePublicationResults(state.distributionSignals, state.calendar, state.content);
  state.publicationResultsSource = "derived";
}

async function setPublicationResultStep(encoded = "") {
  const [publicationResultId = "", calendarId = "", step = "leave"] = String(encoded).split("|");
  const item = state.calendar.find((entry) => entry.id === calendarId);
  if (!item) return;
  const nextStep = ["reuse", "expand", "update", "leave"].includes(step) ? step : "leave";
  if (state.online && !String(item.id || "").startsWith("local-calendar") && nextStep !== "leave") {
    await executePublicationNextStep(item, nextStep, {
      publicationResultId,
      requireBackend: true
    });
    return;
  }

  item.metadata = {
    ...(item.metadata || {}),
    publication_result: {
      ...(item.metadata?.publication_result || {}),
      next_step: nextStep,
      next_step_note: publicationNextStepLabel(nextStep),
      decided_at: new Date().toISOString(),
      decided_by: state.me.userId || state.me.name || null
    }
  };
  item.updated_at = new Date().toISOString();

  if (state.online && !String(item.id || "").startsWith("local-calendar")) {
    const result = await api(`/publishing/items/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ metadata: item.metadata })
    }).catch(() => null);
    if (result?.data) state.calendar = mergeLocalItems(state.calendar, [result.data]);
  } else {
    upsertLocalItem("aiGrowthOsLocalCalendar", state.localCalendar, item);
  }

  refreshPublicationResults();
  await executePublicationNextStep(item, nextStep, { publicationResultId });
}

async function executePublicationNextStep(item, nextStep = "leave", options = {}) {
  if (nextStep === "leave") {
    showToast(text("Publication left as is.", "Публикация оставлена как есть."));
    setRoute("analytics");
    return null;
  }
  const existingAction = item.metadata?.publication_result?.next_step_action || null;
  if (existingAction?.type === nextStep && existingAction.target_id) {
    showToast(text("Next content action already exists.", "Следующее контент-действие уже создано."));
    if (existingAction.target_type === "content_item") setRoute("content-pipeline");
    else setRoute("overview");
    return existingAction;
  }

  const backendAction = await executePublicationNextStepCommand(item, nextStep, options.publicationResultId);
  if (!backendAction && options.requireBackend) {
    showToast(text("Could not create next content action.", "Не удалось создать следующее контент-действие."));
    return null;
  }
  const action = backendAction || (nextStep === "update"
    ? await createPublicationUpdateTask(item)
    : await createPublicationFollowupContent(item, nextStep));
  if (!action) return null;
  if (!backendAction) await savePublicationNextStepAction(item, nextStep, action);
  if (action.target_type === "content_item") {
    showToast(nextStep === "expand"
      ? text("Article outline created from the publication result.", "План статьи создан из результата публикации.")
      : text("New reusable material created from the publication result.", "Новый материал для переиспользования создан из результата публикации."));
    setRoute("content-pipeline");
  } else {
    showToast(text("Update task created from the publication result.", "Задача на правку создана из результата публикации."));
    setRoute("overview");
  }
  return action;
}

async function executePublicationNextStepCommand(item, nextStep, explicitPublicationResultId = "") {
  if (!state.online || String(item.id || "").startsWith("local-calendar")) return null;
  const publicationResult = state.publicationResults.find((entry) => entry.calendar_item_id === item.id);
  const publicationResultId = explicitPublicationResultId || publicationResult?.id || item.id;
  try {
    const response = await api(`/publication-results/${publicationResultId}/${nextStep}`, {
      method: "POST",
      body: JSON.stringify({
        note: item.metadata?.publication_result?.next_step_note || publicationNextStepLabel(nextStep)
      })
    });
    const data = response?.data || {};
    if (data.calendar_item) {
      state.calendar = mergeLocalItems(state.calendar, [data.calendar_item]);
      item.metadata = data.calendar_item.metadata || item.metadata;
      item.updated_at = data.calendar_item.updated_at || item.updated_at;
    }
    if (data.publication_result) state.publicationResults = mergeLocalItems(state.publicationResults, [data.publication_result]);
    if (data.target_type === "content_item" && data.target) {
      state.content = mergeLocalItems(state.content, [data.target]);
      state.metrics.content_items = state.content.length;
    }
    if (data.target_type === "task" && data.target) {
      state.tasks = mergeLocalItems(state.tasks, [normalizeTask(data.target)]).map(normalizeVisibleTask);
      state.metrics.tasks_created = state.tasks.length;
    }
    if (data.publication_result) state.publicationResultsSource = "backend";
    refreshPublicationResults();
    return data.action || null;
  } catch {
    return null;
  }
}

async function createPublicationFollowupContent(item, nextStep) {
  const sourceContent = state.content.find((entry) => entry.id === item.content_item_id) || {};
  const result = item.metadata?.publication_result || {};
  const isExpand = nextStep === "expand";
  const titlePrefix = isExpand ? text("Expand", "Расширить") : text("Reuse", "Переиспользовать");
  const contentItem = {
    id: `local-content-${nextStep}-${Date.now()}`,
    demand_map_item_id: sourceContent.demand_map_item_id || null,
    title: `${titlePrefix}: ${item.title}`,
    content_type: isExpand ? "article_outline" : (sourceContent.content_type || "telegram_post"),
    channel: isExpand ? "website" : (sourceContent.channel || item.channel || "telegram"),
    status: "idea",
    owner: sourceContent.owner || "AgentResult",
    body_md: "",
    metadata: {
      source_publication_result: true,
      source_calendar_item_id: item.id,
      source_content_item_id: item.content_item_id || null,
      source_publication_url: result.publication_url || "",
      next_step: nextStep,
      brief: isExpand
        ? text(`Expand the strongest angle from: ${item.title}`, `Расширить сильный тезис из публикации: ${item.title}`)
        : text(`Reuse the strongest angle from: ${item.title}`, `Переиспользовать сильный тезис из публикации: ${item.title}`),
      proof: result.next_step_note || result.publication_url || ""
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const saved = await saveContentItem(contentItem);
  state.content = mergeLocalItems(state.content, [saved]);
  state.metrics.content_items = state.content.length;
  addActivity("AgentResult", `Created ${nextStep} content from publication result: ${item.title}`);
  return { type: nextStep, target_type: "content_item", target_id: saved.id, created_at: new Date().toISOString() };
}

async function createPublicationUpdateTask(item) {
  const result = item.metadata?.publication_result || {};
  const task = await addLocalTask({
    title: text(`Update published material: ${item.title}`, `Обновить опубликованный материал: ${item.title}`),
    owner: text("Release control", "Контроль выпуска"),
    status: "next",
    note: [
      result.publication_url ? text(`URL: ${result.publication_url}`, `URL: ${result.publication_url}`) : "",
      result.next_step_note || publicationNextStepLabel("update")
    ].filter(Boolean).join("\n"),
    source: "publication_result_update",
    targetType: "publishing_calendar_item",
    targetId: item.id
  });
  addActivity("AgentResult", `Created update task from publication result: ${item.title}`);
  return { type: "update", target_type: "task", target_id: task.id, created_at: new Date().toISOString() };
}

async function savePublicationNextStepAction(item, nextStep, action) {
  item.metadata = {
    ...(item.metadata || {}),
    publication_result: {
      ...(item.metadata?.publication_result || {}),
      next_step: nextStep,
      next_step_action: action
    }
  };
  item.updated_at = new Date().toISOString();
  if (state.online && !String(item.id || "").startsWith("local-calendar")) {
    const result = await api(`/publishing/items/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ metadata: item.metadata })
    }).catch(() => null);
    if (result?.data) state.calendar = mergeLocalItems(state.calendar, [result.data]);
  } else {
    upsertLocalItem("aiGrowthOsLocalCalendar", state.localCalendar, item);
  }
  refreshPublicationResults();
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
      label: text("Website page: AgentResult Growth Control", "Страница сайта: AgentResult Growth Control"),
      preview: text(
        "H1: AgentResult Growth Control for B2B companies\nMeta: Turn weekly topics into AI drafts, manager QA, controlled release, and tracked distribution signals.\nCTA: Start the first controlled release.",
        "H1: AgentResult Growth Control для B2B-компаний\nMeta: Превратите темы недели в AI-тексты, QA менеджера, контролируемый выпуск и фиксируемые сигналы дистрибуции.\nCTA: Запустить первый управляемый выпуск."
      )
    },
    {
      id: "telegram",
      label: text("Telegram posts: 2", "Посты Telegram: 2"),
      preview: text(
        "Post 1: AgentResult Growth Control is not an AI writer. It is a weekly control loop: topic, proof, draft, approval, release, result.\n\nPost 2: The safest first automation is not automatic publishing. It is a clear approval queue where the owner sees what will go public and why.",
        "Пост 1: AgentResult Growth Control — не «AI-писатель». Это рабочий цикл: тема, доказательства, черновик, согласование, выпуск, результат.\n\nПост 2: Самая безопасная первая автоматизация — не автопубликация. Это понятная очередь согласований, где собственник видит, что выйдет и зачем."
      )
    },
    {
      id: "vc",
      label: text("VC article: 1", "Статья VC: 1"),
      preview: text(
        "Outline: Why B2B companies need a growth operating system\n1. The content volume trap\n2. Weekly client acquisition topics\n3. Proof before claims\n4. Manager QA against AI-ish text\n5. Controlled release and result tracking",
        "План: зачем B2B-компаниям операционная система роста\n1. Ловушка объёма контента\n2. Темы привлечения клиентов на неделю\n3. Доказательства до утверждений\n4. QA менеджера против иишного текста\n5. Контролируемый выпуск и фиксация результата"
      )
    },
    {
      id: "email",
      label: text("Email newsletter: 1", "Email-рассылка: 1"),
      preview: text(
        "Subject: A safer start for AgentResult content release\n\nBody: Start with weekly topics, AI drafts, manager QA, controlled release, and result tracking.",
        "Тема: Безопасный старт выпуска контента AgentResult\n\nТело: Начните с тем недели, AI-черновиков, QA менеджера, контролируемого выпуска и фиксации результата."
      )
    },
    {
      id: "lead-magnet",
      label: text("Lead magnet: 1", "Лид-магнит: 1"),
      preview: text(
        "AgentResult Growth Control Readiness Checklist\n- Offer clarity\n- ICP and pains\n- Proof assets\n- Weekly topic owner\n- Manager QA owner\n- Release channel",
        "Чеклист готовности к AgentResult Growth Control\n- Ясность оффера\n- Кому продаём и какие боли закрываем\n- Доказательства\n- Кто согласует темы недели\n- Кто проверяет QA\n- Канал выпуска"
      )
    }
  ];
}

function assemblePack() {
  state.exportAssembled = true;
  syncWorkspaceState({
    exportAssembled: true,
    pack_handoff_note: text(
      "Use this pack only after approval and manager QA. Channel release stays in the manager queue, then owner confirms the result.",
      "Использовать пакет только после согласования и QA менеджера. Канальный выпуск остаётся в очереди менеджера, затем собственник подтверждает результат."
    )
  });
  addActivity("System", "Assembled weekly material pack preview");
  showToast(text("Package preview assembled. ZIP will be available after package storage is connected.", "Предпросмотр пакета собран. ZIP появится после подключения хранилища пакетов."));
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
    showToast(text("Select a weekly topic first.", "Сначала выберите тему недели."));
    return;
  }
  state.formModal = null;
  state.batchApprovalModal = false;
  state.decisionModal = { approvalId: selected.id, action };
  render();
}

function openFormModal(type, payload = {}) {
  state.decisionModal = null;
  state.batchApprovalModal = false;
  state.formModal = { type, ...payload };
  render();
}

function openPublicationResultModal(id = "") {
  const item = state.calendar.find((entry) => entry.id === id)
    || state.calendar.find((entry) => entry.status === "handed_off")
    || null;
  if (!item) {
    showToast(text("No release is waiting for result confirmation.", "Нет выпуска в ожидании подтверждения результата."));
    return;
  }
  openFormModal("publicationResult", { itemId: item.id });
}

function openWeeklyBatchApprovalModal() {
  const pending = state.approvals.filter((approval) => approval.status === "pending");
  if (!pending.length) {
    showToast(text("No weekly topics are waiting.", "Нет тем недели на согласовании."));
    return;
  }
  state.decisionModal = null;
  state.formModal = null;
  state.batchApprovalModal = true;
  render();
}

function closeModal() {
  state.decisionModal = null;
  state.formModal = null;
  state.batchApprovalModal = false;
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
  addActivity(item.owner || "AgentResult", `Created material: ${item.title}`);
  state.formModal = null;
  showToast(text("Material added to the work loop.", "Материал добавлен в рабочий контур."));
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
  addActivity(item.owner || "AgentResult", `Saved material: ${item.title}`);
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
        ? text("Before release, check the channel, final text, format, and manager QA. After it goes live, mark it as out.", "Перед выпуском проверьте канал, финальный текст, формат и QA менеджера. После выхода отметьте: вышло.")
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
      requested_by: "Контроль выпуска",
      created_at: new Date().toISOString()
    };
    state.localApprovals.unshift(approval);
    state.approvals = mergeLocalItems(state.approvals, [approval]);
    saveLocalJson("aiGrowthOsLocalApprovals", state.localApprovals);
  }
  state.metrics.calendar_items = state.calendar.length;
  state.metrics.pending_approvals = state.approvals.filter((item) => item.status === "pending").length;
  addActivity("Контроль выпуска", `Scheduled material: ${content.title}`);
  state.formModal = null;
  showToast(text("Material added to the manager release queue.", "Материал добавлен в очередь выпуска менеджера."));
  if (state.online && !String(savedCalendarItem.id || "").startsWith("local-")) await loadData();
  openPublicationTab("calendar");
}

async function markManagerQaPassed(id) {
  const content = state.content.find((item) => item.id === id);
  if (!content) {
    showToast(text("Select a weekly topic first.", "Сначала выберите тему недели."));
    return;
  }
  const status = materialOwnerStatus(content);
  if (!["approved", "revised_draft"].includes(status)) {
    showToast(text("Manager QA can be closed after owner topic approval or Source Pack revision.", "QA менеджера закрывается после согласования темы или доработки по Source Pack."));
    return;
  }
  const qaDecision = managerQaDecisionFromDom(content);
  const qaContract = managerQaContractForContent(content, qaDecision);
  if (qaContract.status !== "passed") {
    showToast(text("QA is not passed. Close every check and confirm the text matches the author.", "QA не пройден. Закройте все пункты и подтвердите, что текст похож на автора."));
    return;
  }
  const existing = state.calendar.find((item) => item.content_item_id === content.id);
  if (existing) {
    existing.status = "scheduled";
    existing.updated_at = new Date().toISOString();
    existing.metadata = {
      ...(existing.metadata || {}),
      qa_passed_at: new Date().toISOString(),
      qa_note: qaContract.comment || text(
        "Manager QA passed: facts, proof, author voice, AI-ishness, owner boundaries and channel format checked.",
        "QA менеджера пройден: проверены факты, proof, стиль автора, иишность, границы собственника и формат канала."
      ),
      manager_qa_contract: qaContract
    };
    await persistCalendarState(existing);
  } else {
    await createCalendarItemForApprovedContent(content, materialApprovalState(content), qaContract);
  }
  content.status = "scheduled";
  content.updated_at = new Date().toISOString();
  content.metadata = {
    ...(content.metadata || {}),
    manager_qa_status: "passed",
    manager_qa_passed_at: qaContract.checkedAt,
    manager_qa_contract: qaContract
  };
  await persistContentState(content);
  state.metrics.calendar_items = state.calendar.length;
  state.metrics.published_materials = shippedCalendarCount(state.calendar);
  showToast(text("QA passed. Text moved to the manager release queue.", "QA пройден. Текст поставлен в очередь выпуска менеджера."));
  openPublicationTab("approvals");
}

async function returnManagerQaRevision(id) {
  const content = state.content.find((item) => item.id === id);
  if (!content) {
    showToast(text("Select a text first.", "Сначала выберите текст."));
    return;
  }
  content.status = "draft";
  content.updated_at = new Date().toISOString();
  content.metadata = {
    ...(content.metadata || {}),
    manager_qa_status: "needs_revision",
    manager_qa_note: text("Returned from manager QA for revision.", "Возвращено из QA менеджера на доработку.")
  };
  await persistContentState(content);
  showToast(text("Returned for revision. No owner approval opened.", "Возвращено на доработку. Новое согласование собственника не открыто."));
  setRoute("content-pipeline");
}

function showQualityGate(id) {
  const content = state.content.find((item) => item.id === id);
  const gate = content?.metadata?.quality_gate || {};
  const issues = Array.isArray(gate.issues) ? gate.issues.filter(Boolean) : [];
  const firstIssue = issues[0] || text("Revise against Source Pack before manager QA.", "Переписать по Source Pack до QA менеджера.");
  showToast(text(`Needs revision before QA: ${firstIssue}`, `Нужно переписать до QA: ${firstIssue}`));
}

async function rerunQualityGate(id) {
  const content = state.content.find((item) => item.id === id);
  if (!content) {
    showToast(text("Select a material first.", "Сначала выберите материал."));
    return;
  }
  const revisedBody = document.getElementById(`sourcePackRevisionBody-${id}`)?.value.trim() || contentBodyText(content);
  if (!revisedBody) {
    showToast(text("Add revised text before applying Source Pack gate.", "Добавьте исправленный текст перед применением Source Pack gate."));
    return;
  }
  showQualityGate(id);
  if (!state.online) {
    showToast(text("Backend is needed to recheck the Source Pack gate.", "Для повторной проверки Source Pack нужен backend."));
    return;
  }
  try {
    const result = await api(`/content/items/${id}/source-pack-gate`, {
      method: "POST",
      body: JSON.stringify({ bodyMd: revisedBody, revisedBy: "AgentResult" })
    });
    const item = result.data?.item || null;
    if (item) {
      state.content = mergeLocalItems(state.content, [item]);
      if (item.status === "revised_draft") {
        showToast(text("Source Pack gate passed. Text moved to manager QA.", "Source Pack gate пройден. Текст перешёл в QA менеджера."));
      } else {
        const issues = result.data?.qualityGate?.issues || [];
        showToast(text(`Still needs revision: ${issues[0] || "Source Pack"}`, `Ещё нужна доработка: ${issues[0] || "Source Pack"}`));
      }
      render();
    }
  } catch {
    showToast(text("Could not recheck Source Pack now.", "Не удалось повторно проверить Source Pack."));
  }
}

async function submitCalendarNoteForm() {
  const id = document.querySelector("#calendarNoteId")?.value || "";
  let item = state.calendar.find((entry) => entry.id === id);
  if (!item) {
    item = {
      id: id || `local-calendar-${Date.now()}`,
      title: text("Release queue item", "Пункт очереди выпуска"),
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

  addActivity("Manager release queue", `Updated release note: ${item.title}`);
  state.formModal = null;
  showToast(text("Release note saved.", "Заметка к выпуску сохранена."));
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
    owner: document.querySelector("#taskOwner")?.value || "AgentResult",
    status: document.querySelector("#taskStatus")?.value || "next",
    note: document.querySelector("#taskNote")?.value.trim() || "",
    source: "manual"
  });
  addActivity("AgentResult", `Created task: ${title}`);
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
      title: text("Set first signal source", "Задать первый источник сигнала"),
      owner: text("Growth control", "Контроль роста"),
      status: "next",
      note: text("No distribution signal is recorded yet. Use a URL, channel reaction, comment, repost, save, or owner mark.", "Сигнал дистрибуции ещё не зафиксирован. Подойдёт URL, реакция канала, комментарий, репост, сохранение или отметка собственника.")
    });
  }
  if (!metrics.published_materials) {
    suggestions.push({
      title: text("Release the first approved text", "Выпустить первый согласованный текст"),
      owner: text("Publishing", "Публикации"),
      status: "next",
      note: text("AI drafts become a result only after QA, release, and confirmation.", "AI-черновики становятся результатом только после QA, выпуска и подтверждения.")
    });
  }
  if (!metrics.leads && metrics.published_materials) {
    suggestions.push({
      title: text("Record first signal after release", "Зафиксировать первый сигнал после выпуска"),
      owner: text("Growth control", "Контроль роста"),
      status: "next",
      note: text("Use the agreed pilot source: reply, request, form, channel comment or owner mark.", "Используйте согласованный источник пилота: ответ, заявку, форму, комментарий в канале или отметку собственника.")
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
  addActivity("AgentResult", `Created improvement tasks: ${suggestions.length}`);
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
    showToast(text("A note is required to skip a topic or request boundary changes.", "Для отказа от темы или правок по границе нужен комментарий."));
    return;
  }

  state.decisionModal = null;
  await decideApproval(item, modal.action, note);
}

async function saveOffer() {
  const authorVoiceContract = document.querySelector("#toneRules")?.value.trim() || "";
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
      tone: authorVoiceContract,
      authorVoiceContract,
      competitors: document.querySelector("#companyCompetitors")?.value.trim() || "",
      domains: document.querySelector("#companyDomains")?.value.trim() || "",
      channels: document.querySelector("#companyChannels")?.value.trim() || "",
      approvalOwner: document.querySelector("#approvalOwner")?.value.trim() || "",
      releaseOwner: document.querySelector("#releaseOwner")?.value.trim() || "",
      firstSignalSource: document.querySelector("#firstSignalSource")?.value.trim() || ""
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
  addActivity("AgentResult", `Created company setup tasks: ${tasks.length}`);
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
    showToast(text("Select a weekly topic first.", "Сначала выберите тему недели."));
    return;
  }
  if ((item.status || "pending") !== "pending") {
    showToast(text("Decision is already saved.", "Решение уже сохранено."));
    closeModal();
    return;
  }

  const nextStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "changes_requested";

  if (!state.online || isLocalApproval(item) || IS_PRODUCTION_DEMO) {
    item.status = nextStatus;
    item.decision_note = note;
    item.decided_at = new Date().toISOString();
    await applyDecisionToSource(item, nextStatus);
    persistLocalApproval(item);
    appendAudit(item, nextStatus, note);
    state.selectedApprovalId = state.approvals.find((approval) => approval.status === "pending")?.id || "";
    showToast(decisionToast(nextStatus));
    routeAfterDecision(nextStatus);
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
    appendAudit(item, nextStatus, note);
    state.selectedApprovalId = state.approvals.find((approval) => approval.status === "pending")?.id || "";
    showToast(decisionToast(nextStatus));
    await loadData();
    routeAfterDecision(nextStatus);
  } catch {
    showToast(text("Could not update the decision.", "Не удалось сохранить решение."));
  }
}

async function approveWeeklyTopicBatch() {
  const pending = state.approvals.filter((approval) => approval.status === "pending");
  if (!pending.length) {
    showToast(text("No weekly topics are waiting.", "Нет тем недели на согласовании."));
    return;
  }

  const note = text("Weekly topic batch approved.", "Пакет тем недели согласован.");
  for (const item of pending) {
    if (!state.online || isLocalApproval(item) || IS_PRODUCTION_DEMO) {
      item.status = "approved";
      item.decision_note = note;
      item.decided_at = new Date().toISOString();
      await applyDecisionToSource(item, "approved");
      persistLocalApproval(item);
      appendAudit(item, "approved", note);
      continue;
    }

    try {
      await api(`/approvals/${item.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ note })
      });
      item.status = "approved";
      item.decision_note = note;
      item.decided_at = new Date().toISOString();
      appendAudit(item, "approved", note);
    } catch {
      showToast(text("Could not approve the full weekly batch.", "Не удалось согласовать весь пакет недели."));
      return;
    }
  }

  state.selectedApprovalId = "";
  state.batchApprovalModal = false;
  state.metrics.pending_approvals = state.approvals.filter((approval) => approval.status === "pending").length;
  showToast(text("Weekly batch approved. Next status: AgentResult drafts -> manager QA.", "Пакет недели согласован. Следующий статус: AgentResult пишет -> QA менеджера."));
  if (state.online && !IS_PRODUCTION_DEMO) await loadData();
  setRoute("content-pipeline");
}

function routeAfterDecision(status) {
  if (status === "approved") {
    setRoute("content-pipeline");
    return;
  }
  render();
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
    if (decisionStatus === "approved") ensureApprovedContentDraft(source, approval);
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

function ensureApprovedContentDraft(contentItem, approval = null) {
  const metadata = contentItem.metadata || {};
  const existing = String(contentItem.body_md || metadata.body || metadata.brief || "").trim();
  if (existing) return;
  const preview = String(approval?.preview || "").trim();
  const fallback = text(
    "One AI agent does not fix content operations by itself. The owner needs a controlled loop: topics, proof, draft, manager QA, regular release, and a visible distribution signal.\n\nAgentResult keeps that loop explicit. The owner approves the weekly topic once; AgentResult prepares the text; the manager removes AI-ish wording and checks the author's style before release.",
    "Один AI-агент сам по себе не наводит порядок в контент-операциях. Собственнику нужен управляемый контур: темы, proof, текст, QA менеджера, регулярный выпуск и видимый сигнал дистрибуции.\n\nAgentResult держит этот контур явным. Собственник один раз согласует тему недели; AgentResult готовит текст; менеджер убирает иишность и проверяет стиль автора перед выпуском."
  );
  contentItem.metadata = {
    ...metadata,
    body: preview ? `${preview}\n\n${fallback}` : fallback
  };
}

async function createCalendarItemForApprovedContent(contentItem, approval = null, qaContract = null) {
  const checkedAt = qaContract?.checkedAt || new Date().toISOString();
  const item = {
    id: `local-calendar-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    title: contentItem.title,
    channel: contentItem.channel || contentItem.content_type || "manual_export",
    status: "scheduled",
    scheduled_for: defaultScheduleDate(),
    content_item_id: contentItem.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {
      approval_id: approval?.id || "",
      qa_passed_at: checkedAt,
      qa_note: qaContract?.comment || text(
        "Manager QA passed: facts, proof, author voice, AI-ishness, owner boundaries and channel format checked.",
        "QA менеджера пройден: проверены факты, proof, стиль автора, иишность, границы собственника и формат канала."
      ),
      manager_qa_contract: qaContract,
      release_note: text(
        "Manager QA passed. Text is ready for the release queue without another owner approval.",
        "QA менеджера пройден. Текст готов к очереди выпуска без нового согласования собственника."
      )
    }
  };
  await persistCalendarState(item);
  state.metrics.calendar_items = state.calendar.length;
  state.metrics.published_materials = shippedCalendarCount(state.calendar);
}

function appendAudit(item, status, note) {
  addActivity("Собственник", `${labelize(status)}${note ? `: ${note}` : ""}`, { approvalId: item.id });
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
  if (status === "approved") return text("Weekly topic approved.", "Тема недели согласована.");
  if (status === "rejected") return text("Weekly topic skipped.", "Тема недели снята.");
  return text("Boundary changes requested.", "Запрошены правки по границе.");
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
