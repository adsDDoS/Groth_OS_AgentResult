export function createToolsModule(ctx) {
  const {
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
  } = ctx;

  function renderToolsSettings() {
    const tools = toolInventory();
    const focusTools = ownerToolFocus(tools);
    const selected = selectedTool(focusTools[0]?.id);

    return `
      ${toolReadinessCockpit(tools)}
      <section class="tools-owner-grid">
        <div class="stack-panels">
          ${toolAccessQueue(focusTools, selected.id)}
        </div>
        ${toolConnectionForm(selected)}
      </section>
    `;
  }

  function toolReadinessCockpit(tools) {
    const connected = tools.filter((tool) => tool.status === "connected").length;
    const needsSetup = tools.filter((tool) => tool.status === "needs-setup").length;
    const blockers = tools.filter((tool) => tool.status === "needs-setup" || tool.accessNeeded);
    const nextBlocker = blockers[0] || tools.find((tool) => tool.status === "later");
    return `
      <section class="tool-readiness-cockpit">
        <div>
          <p class="eyebrow">${text("Launch access", "Доступы для запуска")}</p>
          <h3>${nextBlocker ? escapeHtml(nextBlocker.name) : text("No urgent access task", "Срочных доступов нет")}</h3>
          <p>${nextBlocker ? escapeHtml(toolNextAccessNote(nextBlocker)) : escapeHtml(text("The first loop can run through approvals, releases and result tracking.", "Первый цикл может идти через согласования, выпуск и отслеживание результата."))}</p>
        </div>
        <div class="tool-readiness-metrics">
          ${compactMetric(text("Connected", "Подключено"), connected, text("ready now", "готово сейчас"))}
          ${compactMetric(text("Blocks launch", "Блокирует запуск"), needsSetup, text("needs owner access", "нужен доступ от владельца"))}
          ${compactMetric(text("Responsible", "Ответственный"), nextBlocker?.owner || text("Owner clear", "Владелец понятен"), text("who gives access", "кто даёт доступ"))}
        </div>
      </section>
    `;
  }

  function ownerToolFocus(tools) {
    const importantIds = ["backend", "email", "telegram-webapp", "site-cms"];
    const important = importantIds.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean);
    const blockers = tools.filter((tool) => importantIds.includes(tool.id) && (tool.status === "needs-setup" || tool.accessNeeded));
    return uniqueById([...blockers, ...important]).slice(0, 6);
  }

  function uniqueById(items) {
    const seen = new Set();
    return items.filter((item) => {
      if (!item || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  function toolAccessQueue(tools, selectedId = "") {
    return `
      <article class="panel">
        <div class="panel-heading compact">
          <div>
            <p class="eyebrow">${text("Access queue", "Очередь доступов")}</p>
            <h3>${text("Only what affects launch", "Только то, что влияет на запуск")}</h3>
          </div>
        </div>
        <div class="tool-owner-list">
          ${tools.map((tool) => toolOwnerRow(tool, selectedId)).join("")}
        </div>
      </article>
    `;
  }

  function toolOwnerRow(tool, selectedId = "") {
    return `
      <button class="tool-owner-row ${tool.id === selectedId ? "selected" : ""}" data-action="select-tool" data-id="${escapeAttr(tool.id)}">
        <div>
          <strong>${escapeHtml(tool.name)}</strong>
          <span>${escapeHtml(toolOwnerOutcome(tool))}</span>
        </div>
        ${toolStatusBadge(tool.status)}
      </button>
    `;
  }

  function toolOwnerOutcome(tool) {
    if (tool.status === "connected") return text("Ready for the first controlled loop", "Готово для первого управляемого цикла");
    if (tool.status === "needs-setup") return toolNextAccessNote(tool);
    if (tool.status === "later") return text("Useful later, not a blocker today", "Полезно позже, сегодня не блокер");
    return text("Not needed for the first sale/demo loop", "Не нужно для первого продающего демо");
  }

  function toolNextAccessNote(tool) {
    if (tool.id === "email") return text("Sender or SMTP access is needed before email follow-ups.", "Нужен отправитель или SMTP-доступ для email-касаний.");
    if (tool.id === "backend") return text("Production workspace and domains are the next launch step.", "Следующий шаг запуска — рабочий контур и домены.");
    if (tool.id === "crm") return text("CRM owner should confirm URL, fields and allowed actions.", "Владелец CRM должен подтвердить URL, поля и разрешённые действия.");
    return tool.owner ? text(`Access owner: ${tool.owner}`, `Ответственный: ${tool.owner}`) : text("Name who owns access.", "Назначьте владельца доступа.");
  }

  function toolInventory() {
    const tools = [
      {
        id: "telegram-webapp",
        name: text("Telegram Control Center", "Telegram-контур управления"),
        type: text("owner approval surface", "контур согласований"),
        formType: "social",
        group: "active",
        status: "connected",
        clientUse: "active",
        modules: ["offer-brain", "publishing-approval", "results-loop"],
        owner: "Egor / AgentResult",
        url: "https://agentresult-crm.vercel.app/",
        summary: text("A Telegram-native surface for approvals, tasks, statuses and result checks.", "Telegram-поверхность для согласований, задач, статусов и проверки результата."),
        permissions: ["read", "approval"],
        limits: text("Not a publishing channel. It is the control surface for owner decisions.", "Не канал публикации. Это контур управления решениями собственника.")
      },
      {
        id: "backend",
        name: text("AgentResult workspace", "Рабочий контур AgentResult"),
        type: text("controlled workspace", "управляемый контур"),
        formType: "other",
        group: "active",
        status: "needs-setup",
        clientUse: "testing",
        modules: ["publishing-approval", "results-loop", "proof-engine"],
        owner: "AgentResult",
        url: "https://api.agentresult.ru",
        summary: text("Keeps tasks, approvals, events and integrations in one controlled workspace.", "Держит задачи, согласования, события и интеграции в одном рабочем контуре."),
        permissions: ["read", "prepare", "approval"],
        limits: text("Do not bypass approval rules or expose sensitive access.", "Не обходить правила согласования и не раскрывать чувствительные доступы.")
      },
      {
        id: "hermes",
        name: text("Preparation engine", "Движок подготовки"),
        type: text("owner assistant", "помощник собственника"),
        formType: "other",
        group: "active",
        status: "connected",
        clientUse: "testing",
        modules: ["content-factory", "proof-engine", "results-loop"],
        owner: "AgentResult",
        url: text("Connected inside AgentResult workspace", "Подключён внутри рабочего контура AgentResult"),
        summary: text("Prepares briefs, drafts, analysis and action proposals.", "Готовит ТЗ, черновики, анализ и предложения действий."),
        permissions: ["read", "prepare"],
        limits: text("No public access and no side effects without owner approval.", "Нет публичного доступа и внешних действий без согласования.")
      },
      {
        id: "postgres",
        name: text("Data storage", "Хранилище данных"),
        type: text("workspace data", "данные рабочего контура"),
        formType: "other",
        group: "active",
        status: "connected",
        clientUse: "active",
        modules: ["offer-brain", "results-loop", "proof-engine"],
        owner: "AgentResult",
        url: text("Connected inside AgentResult workspace", "Подключено внутри рабочего контура AgentResult"),
        summary: text("Stores tasks, approvals, CRM signals and events.", "Хранит задачи, согласования, CRM-сигналы и события."),
        permissions: ["read"],
        limits: text("No direct access from public screens.", "Не давать прямой доступ из публичных экранов.")
      },
      {
        id: "openrouter",
        name: text("AI model access", "Доступ к AI-моделям"),
        type: text("preparation engine", "движок подготовки"),
        formType: "other",
        group: "active",
        status: "connected",
        clientUse: "active",
        modules: ["content-factory", "proof-engine"],
        owner: "AgentResult",
        url: text("Through AgentResult workspace", "Через рабочий контур AgentResult"),
        summary: text("Provides model calls through the controlled AgentResult workspace.", "Даёт вызовы моделей через управляемый контур AgentResult."),
        permissions: ["prepare"],
        limits: text("No direct calls from owner screens.", "Не вызывать напрямую из экранов собственника.")
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
        url: text("Add CRM link", "Добавьте ссылку на CRM"),
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
        summary: text("Fallback for signals, metrics and handoff before full integrations.", "Запасной способ для сигналов, метрик и передачи материалов до полных интеграций."),
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
        limits: text("No external publishing without final owner review.", "Не выпускать без финального решения собственника.")
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
    const baseIds = new Set(tools.map((tool) => tool.id));
    const customTools = Object.entries(state.toolOverrides)
      .filter(([id]) => !baseIds.has(id))
      .map(([id, override]) => ({
        ...customTool(),
        ...override,
        id,
        name: override.name || text("New tool", "Новый инструмент")
      }));
    return [
      ...tools.map((tool) => ({ ...tool, ...(state.toolOverrides[tool.id] || {}) })),
      ...customTools
    ];
  }

  function selectedTool(fallbackId = "") {
    if (state.selectedToolId === "custom") return customTool();
    return toolInventory().find((tool) => tool.id === state.selectedToolId)
      || toolInventory().find((tool) => tool.id === fallbackId)
      || customTool();
  }

  function customTool() {
    return {
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

  function toolConnectionForm(tool) {
    const permissions = ["read", "prepare", "approval"];
    const isCustom = tool.id === "custom";

    return `
      <article class="panel tool-form-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Selected access", "Выбранный доступ")}</p>
            <h3>${escapeHtml(tool.name)}</h3>
          </div>
          ${toolStatusBadge(tool.status)}
        </div>
        <form class="form-grid tool-form" id="toolForm">
          <input type="hidden" id="toolSelectedId" value="${escapeAttr(tool.id)}" />
          ${isCustom ? toolInput(text("Tool name", "Название инструмента"), "toolName", "", text("For example: CRM, forms, storage", "Например: CRM, формы, хранилище")) : ""}
          ${toolInput(text("Access link", "Ссылка на доступ"), "toolUrl", tool.url, text("Service, account or form", "Сервис, аккаунт или форма"))}
          ${toolInput(text("Who owns it", "Кто владеет доступом"), "toolOwner", tool.owner, text("Person or role responsible for access", "Человек или роль, отвечающие за доступ"))}
          <div class="permission-block">
            <span class="meta-label">${text("What the system may do", "Что системе разрешено делать")}</span>
            <div class="check-grid compact">
              ${permissions.map((permission) => `
                <label class="check"><input type="checkbox" data-tool-permission="${escapeAttr(permission)}" ${tool.permissions.includes(permission) ? "checked" : ""} /> ${escapeHtml(toolPermissionLabel(permission))}</label>
              `).join("")}
            </div>
          </div>
          ${textarea(text("Limits", "Ограничения"), "toolLimits", tool.limits)}
          <div class="detail-actions">
            <button type="button" class="button primary" data-action="save-tool">${text("Save setup", "Сохранить настройку")}</button>
            <button type="button" class="button secondary" data-action="request-tool-owner">${text("Mark access owner needed", "Нужен владелец доступа")}</button>
          </div>
        </form>
      </article>
    `;
  }

  function toolInput(label, id, value, placeholder = "") {
    return `<label>${escapeHtml(label)}<input id="${escapeAttr(id)}" value="${escapeAttr(value || "")}" placeholder="${escapeAttr(placeholder)}" /></label>`;
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

  function saveToolSetup() {
    const selectedId = document.querySelector("#toolSelectedId")?.value || "";
    const selected = selectedTool(selectedId);
    const permissions = Array.from(document.querySelectorAll("[data-tool-permission]"))
      .filter((input) => input.checked)
      .map((input) => input.dataset.toolPermission)
      .filter(Boolean);
    const override = {
      name: document.querySelector("#toolName")?.value.trim() || selected.name,
      formType: selected.formType,
      type: selected.type,
      url: document.querySelector("#toolUrl")?.value.trim() || "",
      owner: document.querySelector("#toolOwner")?.value.trim() || "",
      clientUse: selected.clientUse,
      permissions: permissions.length ? permissions : selected.permissions,
      status: selected.status === "connected" ? "connected" : "needs-setup",
      limits: document.querySelector("#toolLimits")?.value.trim() || ""
    };
    const overrideId = selected.id === "custom" ? `custom-${Date.now()}` : selected.id;
    state.toolOverrides[overrideId] = { ...override, id: overrideId };
    state.selectedToolId = overrideId;
    saveLocalJson("aiGrowthOsToolOverrides", state.toolOverrides);
    addActivity("AgentResult", `Saved tool setup: ${override.name}`);
    showToast(text("Tool setup saved locally.", "Настройка инструмента сохранена локально."));
    render();
  }

  async function requestToolOwner() {
    const selectedId = document.querySelector("#toolSelectedId")?.value || "";
    const selected = selectedTool(selectedId);
    state.toolOverrides[selected.id] = {
      ...(state.toolOverrides[selected.id] || {}),
      owner: text("Access responsible needed", "Нужен ответственный за доступ"),
      status: "needs-setup",
      accessNeeded: true
    };
    saveLocalJson("aiGrowthOsToolOverrides", state.toolOverrides);
    await addLocalTask({
      title: text(`Assign access responsible for ${selected.name}`, `Назначить ответственного за доступ: ${selected.name}`),
      owner: "Owner",
      status: "blocked",
      note: text("Connection cannot move forward until a responsible person is named.", "Подключение не двинется дальше, пока не назначен ответственный."),
      source: "tools"
    });
    addActivity("AgentResult", `Marked access responsible needed: ${selected.name}`);
    showToast(text("Access task created.", "Задача по доступу создана."));
    render();
  }

  return {
    renderToolsSettings,
    saveToolSetup,
    requestToolOwner
  };
}
