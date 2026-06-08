export function createCompanyGrowthModule(ctx) {
  const {
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
  } = ctx;

function renderGrowthPlan() {
  const topItems = topDemandItems();
  const top = topItems[0];
  const queueItems = top ? topItems.slice(1) : topItems;
  const nextMoves = queueItems.length ? queueItems.map(growthQueueRow).join("") : fallbackGrowthMoves(top);
  return `
    ${growthPlanBrief(top)}
    <section class="growth-command-board">
      <article class="panel growth-queue-panel">
        <div class="panel-heading compact">
          <div>
            <p class="eyebrow">${text("Next moves", "Следующие ходы")}</p>
            <h3>${text("After the weekly priority", "После приоритета недели")}</h3>
          </div>
          <span class="pill">${queueItems.length || 1} ${text("in focus", "в фокусе")}</span>
        </div>
        <div class="growth-queue">
          ${nextMoves}
        </div>
      </article>
    </section>
  `;
}

function growthPlanBrief(top) {
  const action = top ? "content-from-demand" : "add-demand-topic";
  const label = top ? text("Prepare material", "Подготовить материал") : text("Add revenue topic", "Добавить тему выручки");
  return `
    <section class="plan-brief">
      <div>
        <p class="eyebrow">${text("Weekly priority", "Приоритет недели")}</p>
        <h3>${escapeHtml(top?.title || text("One revenue topic", "Одна тема выручки"))}</h3>
        <p>${escapeHtml(top ? demandBusinessReason(top) : text("Add one topic that can become a material, release and market signal.", "Добавьте одну тему, которая станет материалом, выпуском и сигналом рынка."))}</p>
      </div>
      <button class="button primary" data-action="${escapeAttr(action)}" data-id="${escapeAttr(top?.id || "")}">${escapeHtml(label)}</button>
    </section>
  `;
}

function topDemandItems() {
  return [...state.demand].sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0)).slice(0, 3);
}

function renderOfferBrain() {
  const profile = state.offer?.profile || {};
  const setupCompleteness = ownerSetupCompleteness(profile);
  return `
    <section class="owner-setup-strip">
      ${ownerSetupCard(text("Launch context", "Контекст запуска"), `${setupCompleteness}%`, text("Enough for first safe cycle", "Достаточно для первого цикла"))}
      ${ownerSetupCard(text("Control", "Контроль"), text("Approval first", "Через согласование"), text("Public actions need a decision", "Публичные действия через решение"))}
      ${ownerSetupCard(text("Next result", "Следующий результат"), text("First release", "Первый выпуск"), text("Material, handoff, signal", "Материал, передача, сигнал"))}
    </section>
    ${ownerSetupGapsPanel(profile)}
    <div class="company-launch-layout">
      <article class="panel company-launch-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Minimum for launch", "Минимум для запуска")}</p>
            <h3>${text("What AgentResult can use safely", "Что AgentResult может использовать безопасно")}</h3>
          </div>
        </div>
        <form class="form-grid company-profile-form" id="offerForm">
          ${field(text("Company name", "Название компании"), "companyName", state.offer?.name || "")}
          ${field(text("Website", "Сайт"), "companyWebsite", state.offer?.website_url || "")}
          ${textarea(text("Offer", "Оффер"), "companyPositioning", state.offer?.positioning || profile.positioning || "")}
          ${textarea(text("Buyer", "Клиент"), "companyIcp", profile.icp || "")}
          ${textarea(text("Pain we solve", "Боль, которую решаем"), "companyPains", profile.pains || "")}
          ${textarea(text("Proof we can use", "Доказательства"), "companyProof", profile.proof || "")}
          ${textarea(text("Forbidden claims", "Запрещённые обещания"), "forbiddenClaims", profile.forbiddenClaims || "")}
          ${textarea(text("Approval rules", "Правила согласования"), "approvalOwner", profile.approvalOwner || "")}
          <details class="company-advanced">
            <summary>${text("Additional context", "Дополнительный контекст")}</summary>
            <div class="form-grid company-advanced-grid">
              ${textarea(text("Products and formats", "Продукты и форматы"), "companyProducts", textValue(profile.products))}
              ${textarea(text("Tone", "Тон"), "toneRules", profile.tone || "")}
              ${textarea(text("Competitors and alternatives", "Конкуренты и альтернативы"), "companyCompetitors", profile.competitors || "")}
              ${textarea(text("Domains and entry points", "Домены и точки входа"), "companyDomains", profile.domains || "")}
              ${textarea(text("Channels and integrations", "Каналы и интеграции"), "companyChannels", profile.channels || "")}
            </div>
          </details>
        </form>
      </article>

      ${companySummaryPanel(profile)}
    </div>
  `;
}

function ownerSetupCompleteness(profile) {
  const keys = ["positioning", "icp", "pains", "proof", "forbiddenClaims", "approvalOwner"];
  const completed = keys.filter((key) => String(profile[key] || "").trim()).length;
  return Math.round((completed / keys.length) * 100);
}

function ownerSetupGaps(profile) {
  const fields = [
    ["positioning", text("What we sell", "Что продаём")],
    ["icp", text("Who we sell to", "Кому продаём")],
    ["pains", text("Which problems we solve", "Какие проблемы решаем")],
    ["proof", text("Proof we can use", "Доказательства")],
    ["forbiddenClaims", text("Forbidden promises", "Запрещённые обещания")],
    ["approvalOwner", text("Approval owner rules", "Правила согласования")]
  ];
  return fields.filter(([key]) => !String(profile[key] || "").trim()).map(([, label]) => label);
}

function ownerSetupGapsPanel(profile) {
  const gaps = ownerSetupGaps(profile);
  const ready = gaps.length === 0;
  const visibleGaps = ready ? [text("Ready for first working cycle", "Готово к первому рабочему циклу")] : gaps.slice(0, 3);
  return `
    <article class="panel full setup-readiness-panel">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">${text("Launch readiness", "Готовность запуска")}</p>
          <h3>${ready ? text("Ready for first release", "Готово к первому выпуску") : text("Missing launch context", "Не хватает контекста для запуска")}</h3>
        </div>
        <button class="button secondary" data-action="create-setup-tasks" ${ready ? "disabled" : ""}>${text("Create tasks", "Создать задачи")}</button>
      </div>
      <div class="readiness-chip-row">
        ${visibleGaps.map((gap) => `<span>${escapeHtml(gap)}</span>`).join("")}
      </div>
    </article>
  `;
}

function companySummaryPanel(profile) {
  const usable = [
    profile.positioning && text("Offer", "Оффер"),
    profile.icp && text("Buyer", "Клиент"),
    profile.pains && text("Pains", "Боли"),
    profile.proof && text("Proof", "Доказательства"),
    profile.forbiddenClaims && text("Limits", "Ограничения")
  ].filter(Boolean);
  const guardrails = [
    profile.forbiddenClaims ? text("Risky claims are bounded", "Рискованные обещания ограничены") : text("Add forbidden claims", "Добавьте запрещённые обещания"),
    profile.approvalOwner ? text("Decision rule is clear", "Правило решения понятно") : text("Set approval rules", "Задайте правила согласования"),
    profile.proof ? text("Proof is ready for materials", "Доказательства готовы для материалов") : text("Add proof", "Добавьте доказательства")
  ];
  return `
    <article class="panel company-summary-panel">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">${text("Control summary", "Сводка контроля")}</p>
          <h3>${text("Ready, blocked, next", "Готово, блокер, следующий шаг")}</h3>
        </div>
      </div>
      <div class="company-signal-list">
        ${companySignalRow(text("Ready", "Готово"), usable.length ? usable.join(" · ") : text("Not enough data yet", "Пока мало данных"))}
        ${guardrails.map((item) => companySignalRow(text("Control", "Контроль"), item)).join("")}
      </div>
    </article>
  `;
}

function companySignalRow(label, value) {
  return `
    <div class="company-signal-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
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


function growthQueueRow(item, index) {
  return `
    <article class="growth-queue-row">
      <span>${index + 1}</span>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(demandBusinessReason(item))}</p>
      </div>
      <em>
        <span>${escapeHtml(demandApprovalState(item))}</span>
        <small>${escapeHtml(demandNextAction(item))}</small>
      </em>
      <div class="growth-row-actions">
        <button class="button primary" data-action="content-from-demand" data-id="${escapeAttr(item.id)}">${text("Prepare", "Подготовить")}</button>
      </div>
    </article>
  `;
}

function fallbackGrowthMoves(top) {
  const title = top
    ? text("Turn the weekly priority into one material", "Превратить приоритет недели в один материал")
    : text("Choose the first demand topic", "Выбрать первую тему спроса");
  const note = top
    ? text("Prepare the material, approve it, then check the first signal.", "Подготовить материал, согласовать и проверить первый сигнал.")
    : text("Start with one topic that can produce release and signal.", "Начните с одной темы, которая даст выпуск и сигнал.");
  const action = top ? "content-from-demand" : "add-demand-topic";
  const label = top ? text("Prepare", "Подготовить") : text("Add topic", "Добавить тему");
  return `
    <article class="growth-queue-row">
      <span>1</span>
      <div>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(note)}</p>
      </div>
      <em>
        <span>${escapeHtml(text("Next decision", "Следующее решение"))}</span>
        <small>${escapeHtml(text("Material -> release -> signal", "Материал -> выпуск -> сигнал"))}</small>
      </em>
      <div class="growth-row-actions">
        <button class="button primary" data-action="${escapeAttr(action)}" data-id="${escapeAttr(top?.id || "")}">${escapeHtml(label)}</button>
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


  return {
    renderGrowthPlan,
    renderOfferBrain,
    ownerSetupGaps,
    demandBusinessReason
  };
}
