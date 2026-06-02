export function createPublicationsModule(ctx) {
  const {
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
    currentLangValue,
    field,
    packageAssets
  } = ctx;

function renderPublications() {
  const tab = currentPublicationTab();
  const tabRenderers = {
    approvals: renderApprovals,
    calendar: renderPublishingCalendar,
    pack: renderManualExport
  };

  return `
    <section class="tabs-panel" aria-label="${escapeAttr(text("Publication workspace", "Работа с публикациями"))}">
      <div class="segmented-tabs" role="tablist">
        ${Object.entries(publicationTabs).map(([key, item]) => `
          <button class="tab-button ${tab === key ? "active" : ""}" role="tab" aria-selected="${tab === key ? "true" : "false"}" data-action="set-publication-tab" data-id="${escapeAttr(key)}">
            ${escapeHtml(tr(item.label))}
          </button>
        `).join("")}
      </div>
      ${tab === "approvals" ? "" : `<div class="tab-context">${publicationTabContext(tab)}</div>`}
    </section>
    ${tabRenderers[tab]()}
  `;
}

function publicationCockpit() {
  const pending = state.approvals.filter((item) => item.status === "pending");
  const calendarReview = state.calendar.filter((item) => item.status === "review");
  const orphanCalendarReview = calendarReview.filter((item) => !state.approvals.some((approval) =>
    approval.status === "pending" && (approval.target_id === item.id || approval.calendar_item_id === item.id)
  ));
  const scheduled = state.calendar.filter((item) => item.status === "scheduled");
  const handedOff = state.calendar.filter((item) => item.status === "handed_off");
  const published = state.calendar.filter((item) => item.status === "published");
  const next = pending[0]
    ? {
        label: text("Needs decision", "Требует решения"),
        title: getApprovalContext(pending[0]).title,
        action: "go-approval",
        id: pending[0].id,
        actionLabel: text("Open", "Открыть"),
        filter: text("Approval", "Согласование")
      }
    : orphanCalendarReview[0]
      ? {
          label: text("Needs approval", "Нужно согласование"),
          title: orphanCalendarReview[0].title,
          action: "go-calendar",
          id: orphanCalendarReview[0].id,
          actionLabel: text("Plan", "План"),
          filter: text("Calendar", "Календарь")
        }
    : scheduled[0]
      ? {
          label: text("Ready", "Готово"),
          title: scheduled[0].title,
          action: "go-calendar",
          id: scheduled[0].id,
          actionLabel: text("Plan", "План"),
          filter: text("Release", "Выпуск")
        }
      : handedOff[0]
        ? {
            label: text("Confirm", "Подтвердить"),
            title: handedOff[0].title,
            action: "go-calendar",
            id: handedOff[0].id,
            actionLabel: text("Plan", "План"),
            filter: text("Handoff", "Передача")
          }
      : {
          label: text("Published", "Опубликовано"),
          title: published[0]?.title || text("No urgent publication action", "Срочных действий по публикациям нет"),
          action: "go-analytics",
          id: "",
          actionLabel: text("Results", "Результаты"),
          filter: text("Result", "Результат")
        };

  return `
    <section class="publication-cockpit">
      <div class="publication-cockpit-main">
        <p class="eyebrow">${escapeHtml(next.filter)}</p>
        <h3>${escapeHtml(next.title)}</h3>
        <div class="publication-cockpit-action">
          <span>${escapeHtml(next.label)}</span>
          <button class="button primary" data-action="${escapeAttr(next.action)}" data-id="${escapeAttr(next.id || "")}">${escapeHtml(next.actionLabel)}</button>
        </div>
      </div>
      <div class="publication-cockpit-stats">
        ${compactMetric(text("Decision", "Решение"), pending.length + orphanCalendarReview.length, text("before release", "до выпуска"))}
        ${compactMetric(text("Ready", "Готово"), scheduled.length, text("release", "выпуск"))}
        ${compactMetric(text("Handoff", "Передано"), handedOff.length, text("confirm", "подтвердить"))}
        ${compactMetric(text("Live", "Вышло"), published.length, text("in Results", "в результатах"))}
      </div>
    </section>
  `;
}

function publicationTabContext(tab) {
  const contexts = {
    approvals: [
      text("Decision", "Решение"),
      text("Approve, edit, or reject.", "Согласовать, вернуть или отклонить.")
    ],
    calendar: [
      text("Release plan", "План выпуска"),
      text("Approved materials by channel, date and next handoff.", "Согласованные материалы по каналу, дате и следующей передаче.")
    ],
    pack: [
      text("Manual handoff", "Ручная передача"),
      text("Approved texts for channels where direct publishing is not connected yet.", "Согласованные тексты для каналов, где прямой выпуск ещё не подключён.")
    ]
  };
  const [title, note] = contexts[tab] || contexts.approvals;
  return `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(note)}</span>`;
}

function renderApprovals() {
  const pendingApprovals = state.approvals.filter((item) => item.status === "pending");
  const selected = pendingApprovals.find((item) => item.id === state.selectedApprovalId) || pendingApprovals[0] || null;
  return `
    <div class="approval-workspace">
      <section class="approval-list panel">
        <div class="panel-heading compact">
          <div>
            <p class="eyebrow">${text("Decision inbox", "Очередь решений")}</p>
            <h3>${pendingApprovals.length} ${text("waiting", "ждут решения")}</h3>
          </div>
        </div>
        <div class="approval-items">
          ${pendingApprovals.map((item) => {
            const context = getApprovalContext(item);
            return `
              <button class="approval-item ${item.id === selected?.id ? "selected" : ""}" data-action="select-approval" data-id="${escapeAttr(item.id)}">
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
  const previewExpanded = state.expandedApprovalPreviewId === item.id;
  return `
    <div class="panel-heading approval-heading-compact">
      <div>
        <p class="eyebrow">${text("Decision", "Решение")}</p>
        <h3>${escapeHtml(context.title)}</h3>
      </div>
      ${statusChip(item.status || "pending")}
    </div>
    <div class="approval-decision-strip">
      <div>
        <span>${text("Risk", "Риск")}</span>
        <strong>${escapeHtml(approvalRiskSummary(context.checklist))}</strong>
      </div>
      <div>
        <span>${text("Channel", "Канал")}</span>
        <strong>${escapeHtml(displayChannel(context.channel))}</strong>
      </div>
      <div>
        <span>${text("Date", "Дата")}</span>
        <strong>${escapeHtml(context.when)}</strong>
      </div>
    </div>
    <div class="preview-pane approval-preview-pane ${previewExpanded ? "expanded" : ""}">
      <p class="eyebrow">${text("Text preview", "Текст")}</p>
      ${renderAssetPreview(context)}
      <button class="button secondary table-button approval-preview-toggle" data-action="toggle-approval-preview" data-id="${escapeAttr(item.id)}">
        ${escapeHtml(previewExpanded ? text("Collapse", "Свернуть") : text("Expand", "Развернуть"))}
      </button>
    </div>
    <div class="detail-actions">
      ${approvalDetailActions(item)}
    </div>
  `;
}

function approvalDetailActions(item) {
  if ((item.status || "pending") !== "pending") {
    return `
      <span class="decision-complete">${escapeHtml(text("Decision saved", "Решение сохранено"))}</span>
      ${actionButton("Open calendar", "secondary", "go-calendar")}
    `;
  }
  return `
    ${actionButton("Approve", "primary", "open-approve-modal")}
    ${actionButton("Request changes", "secondary", "open-changes-modal")}
    ${actionButton("Reject", "danger", "open-reject-modal")}
  `;
}

function approvalRiskSummary(checklist) {
  const failed = (checklist || []).filter((check) => !check.ok);
  if (!failed.length) return text("No obvious risk", "Явного риска нет");
  if (failed.length === 1) return tr(failed[0].label);
  return text(`${failed.length} risks need attention`, `${failed.length} риска требуют внимания`);
}

function approvalRiskDetails(checklist) {
  const failed = (checklist || []).filter((check) => !check.ok);
  if (!failed.length) return "";
  return `
    <div class="approval-risk-summary">
      ${failed.map((check) => `
        <div>
          <strong>${escapeHtml(tr(check.label))}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function renderPublishingCalendar() {
  const queues = publishingReleaseQueues();
  return `
    <article class="panel full">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">${text("Release plan", "План выпуска")}</p>
          <h3>${text("What needs a decision, confirmation, or result", "Что требует решения, подтверждения или результата")}</h3>
        </div>
      </div>
      <div class="release-queue-grid">
        ${queues.map((queue) => releaseQueueColumn(queue)).join("")}
      </div>
    </article>
  `;
}

function publishingReleaseQueues() {
  return [
    {
      id: "decision",
      title: text("Needs decision", "Ждёт решения"),
      note: text("Approve, return, or reject before anything goes outside.", "Согласовать, вернуть или отклонить до выхода наружу."),
      items: state.calendar.filter((item) => ["review", "draft"].includes(item.status)),
      empty: text("No decisions waiting.", "Нет решений на ожидании.")
    },
    {
      id: "handoff",
      title: text("Release or confirm", "Передать или подтвердить"),
      note: text("Hand off ready texts or confirm live materials.", "Передайте готовые тексты или подтвердите выход."),
      items: state.calendar.filter((item) => ["scheduled", "handed_off"].includes(item.status)),
      empty: text("No release actions waiting.", "Нет действий по выпуску.")
    },
    {
      id: "published",
      title: text("Published", "Вышло"),
      note: text("Released materials that already count in Results.", "Материалы, которые уже считаются в результатах."),
      items: state.calendar.filter((item) => item.status === "published"),
      empty: text("Nothing published yet.", "Пока ничего не вышло.")
    }
  ];
}

function releaseQueueColumn(queue) {
  return `
    <section class="release-queue-column">
      <div class="release-queue-head">
        <div>
          <strong>${escapeHtml(queue.title)}</strong>
          <span>${escapeHtml(queue.note)}</span>
        </div>
        <em>${escapeHtml(String(queue.items.length))}</em>
      </div>
      <div class="release-queue-items">
        ${queue.items.length ? queue.items.map((item) => releaseQueueCard(item, queue.id)).join("") : `<p class="empty-note">${escapeHtml(queue.empty)}</p>`}
      </div>
    </section>
  `;
}

function releaseQueueCard(item, queueId) {
  const note = publishingOwnerNote(item);
  return `
    <article class="release-queue-card">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(displayChannel(item.channel || "manual"))} · ${escapeHtml(formatDate(item.scheduled_for))}</span>
      </div>
      ${note ? `<p>${escapeHtml(note)}</p>` : ""}
      <div class="card-actions">
        ${releaseQueueAction(item, queueId)}
        <a class="button secondary table-button" href="./#/publications/note/${escapeAttr(item.id)}">${escapeHtml(text("Note", "Заметка"))}</a>
      </div>
    </article>
  `;
}

function releaseQueueAction(item, queueId) {
  if (queueId === "decision") return `<button class="button secondary table-button" data-action="go-approvals" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Approve", "Согласовать"))}</button>`;
  if (queueId === "handoff" && item.status === "handed_off") return `<button class="button primary table-button" data-action="mark-calendar-published" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Confirm", "Подтвердить"))}</button>`;
  if (queueId === "handoff") return `<button class="button secondary table-button" data-action="mark-calendar-exported" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Handed off", "Передано"))}</button>`;
  return `<span class="muted">${escapeHtml(text("In Results", "В результатах"))}</span>`;
}

function calendarBulkControl(count) {
  return `
    <div class="calendar-bulk-control">
      <div>
        <span>${escapeHtml(text("Manual handoff", "Передано вручную"))}</span>
        <strong>${escapeHtml(text(`${count} to confirm`, `${count} на подтверждение`))}</strong>
      </div>
      <button class="button primary table-button" data-action="confirm-handed-off">${escapeHtml(text("Confirm", "Подтвердить"))}</button>
    </div>
  `;
}

function publishingCalendarFilters() {
  return [
    ["all", text("All", "Все")],
    ["handed_off", text("Manual handoff", "Передано вручную")],
    ["scheduled", text("Ready to release", "Готово к выпуску")],
    ["review", text("Needs decision", "Ждёт решения")],
    ["published", text("Published", "Опубликовано")]
  ].map(([id, label]) => ({
    id,
    label,
    count: id === "all" ? state.calendar.length : state.calendar.filter((item) => item.status === id).length
  }));
}

function publicationChannelMatrix() {
  const channels = [
    {
      name: text("Website / CMS", "Сайт / CMS"),
      status: text("manual release", "ручной выпуск"),
      note: text("Best for search demand, proof pages and conversion forms.", "Для поискового спроса, страниц доверия и форм заявки."),
      action: "set-publication-tab",
      id: "pack",
      label: text("Take approved text", "Забрать текст")
    },
    {
      name: "Telegram",
      status: text("manual release", "ручной выпуск"),
      note: text("Works through subscribers, forwards, reactions and founder distribution.", "Работает через подписчиков, репосты, реакции и дистрибуцию основателя."),
      action: "set-publication-tab",
      id: "pack",
      label: text("Take post", "Забрать пост")
    },
    {
      name: "Email",
      status: text("needs sender access", "нужен доступ отправителя"),
      note: text("Strong when CRM or a segmented contact base is connected.", "Силен, когда подключена CRM или сегментированная база."),
      action: "select-tool",
      id: "email",
      label: text("Open access", "Открыть доступ")
    },
    {
      name: "VC.ru / Habr",
      status: text("manual release", "ручной выпуск"),
      note: text("Useful for expert articles, technical trust and market arguments.", "Для экспертных статей, технического доверия и рыночных аргументов."),
      action: "set-publication-tab",
      id: "pack",
      label: text("Take article", "Забрать статью")
    }
  ];
  return `
    <div class="publication-channel-matrix" aria-label="${escapeAttr(text("Publishing channels", "Каналы выпуска"))}">
      ${channels.map((channel) => `
        <article>
          <strong>${escapeHtml(channel.name)}</strong>
          <span>${escapeHtml(channel.status)}</span>
          <p>${escapeHtml(channel.note)}</p>
          <button class="button secondary table-button" data-action="${escapeAttr(channel.action)}" data-id="${escapeAttr(channel.id)}">${escapeHtml(channel.label)}</button>
        </article>
      `).join("")}
    </div>
  `;
}

function calendarAction(item) {
  if (item.status === "published") return `<span class="muted">${escapeHtml(text("Published", "Выпущено"))}</span>`;
  if (item.status === "handed_off") return `<button class="button secondary table-button" data-action="mark-calendar-published" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Confirm", "Подтвердить"))}</button>`;
  if (item.status === "scheduled") {
    return `<button class="button secondary table-button" data-action="mark-calendar-exported" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Handed off", "Передано"))}</button>`;
  }
  if (item.status === "review") {
    return `<button class="button secondary table-button" data-action="go-approvals" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Approve", "Согласовать"))}</button>`;
  }
  return `<button class="button secondary table-button" data-action="mark-calendar-exported" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Handed off", "Передано"))}</button>`;
}

function publishingWeekGroups(items = null) {
  const groups = new Map();
  for (const item of [...(items || state.calendar)].sort((a, b) => String(a.scheduled_for || "").localeCompare(String(b.scheduled_for || "")))) {
    const key = publishingDayKey(item.scheduled_for);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.entries()];
}

function calendarEmptyState(filter) {
  const message = filter === "handed_off"
    ? text("No handoff to confirm.", "Нет передач на подтверждение.")
    : text("No items.", "Нет материалов.");
  return `
    <section class="calendar-empty-state">
      <strong>${escapeHtml(message)}</strong>
    </section>
  `;
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
  return new Intl.DateTimeFormat(currentLangValue() === "ru" ? "ru-RU" : "en", {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(date);
}

function publishingCalendarCard(item) {
  const note = publishingOwnerNote(item);
  return `
    <article class="calendar-card">
      <div class="calendar-card-top">
        <strong>${escapeHtml(item.title)}</strong>
        ${statusChip(item.status || "draft")}
      </div>
      <span>${escapeHtml(displayChannel(item.channel || "manual"))} · ${escapeHtml(formatDate(item.scheduled_for))}</span>
      <a class="calendar-note-block ${note ? "filled" : ""}" href="./#/publications/note/${escapeAttr(item.id)}">
        <span>${escapeHtml(text("Note", "Заметка"))}</span>
        <strong>${escapeHtml(note || text("No note", "Нет заметки"))}</strong>
      </a>
      <div class="card-actions">
        ${calendarAction(item)}
        <a class="button secondary table-button" href="./#/publications/note/${escapeAttr(item.id)}">${escapeHtml(text("Note", "Заметка"))}</a>
      </div>
    </article>
  `;
}

function publishingOwnerNote(item) {
  return String(item?.metadata?.handoff_note || item?.metadata?.owner_note || "").trim();
}

function renderManualExport() {
  const assets = packageAssets();
  const selectedAsset = assets.find((asset) => asset.id === state.selectedPackItem) || assets[0];
  const selectedHandoff = packHandoffItem(selectedAsset.id);
  return `
    <div class="handoff-workspace">
      <article class="panel handoff-queue-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${text("Material", "Материал")}</p>
            <h3>${text("Channel queue", "Очередь по каналам")}</h3>
          </div>
        </div>
        <div class="handoff-queue">
          ${assets.map((asset) => handoffAssetRow(asset)).join("")}
        </div>
      </article>

      <article class="panel handoff-detail-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${escapeHtml(handoffChannelLabel(selectedAsset.id))}</p>
            <h3>${escapeHtml(selectedAsset.label)}</h3>
          </div>
          <div class="handoff-actions inline">
            <button class="button primary" data-action="copy-pack-item" data-id="${escapeAttr(selectedAsset.id)}">${escapeHtml(text("Copy text", "Скопировать"))}</button>
            ${selectedHandoff
              ? `<button class="button secondary" data-action="open-calendar">${escapeHtml(text("Open release plan", "Открыть план выпуска"))}</button>`
              : `<button class="button secondary" data-action="mark-pack-handoff" data-id="${escapeAttr(selectedAsset.id)}">${escapeHtml(text("Handed off", "Передано"))}</button>`}
            ${selectedAsset.id === "email" ? `<button class="button secondary" data-action="select-tool" data-id="email">${escapeHtml(text("Access", "Доступ"))}</button>` : ""}
          </div>
        </div>
        ${selectedHandoff ? `
          <div class="handoff-status-strip">
            <span>${escapeHtml(handoffStatusLabel(selectedHandoff.status))}</span>
            <strong>${escapeHtml(text("Confirm publication after it goes live.", "После выхода подтвердите публикацию."))}</strong>
          </div>
        ` : ""}
        <div class="pack-detail">
          <p class="eyebrow">${text("Text", "Текст")}</p>
          <pre class="asset-preview-text">${escapeHtml(selectedAsset.preview)}</pre>
        </div>
        <button class="button secondary handoff-plan-link" data-action="open-calendar">${escapeHtml(text("Release plan", "План выпуска"))}</button>
      </article>
    </div>
  `;
}

function handoffAssetRow(asset) {
  const handoffItem = packHandoffItem(asset.id);
  return `
    <button class="handoff-asset-row ${asset.id === state.selectedPackItem ? "selected" : ""}" data-action="preview-pack-item" data-id="${escapeAttr(asset.id)}">
      <div>
        <strong>${escapeHtml(asset.label)}</strong>
        <span>${escapeHtml(handoffChannelLabel(asset.id))}</span>
      </div>
      <em>${escapeHtml(handoffItem ? handoffStatusLabel(handoffItem.status) : text("Open", "Открыть"))}</em>
    </button>
  `;
}

function packHandoffItem(assetId) {
  return state.calendar.find((item) => item.metadata?.pack_asset_id === assetId);
}

function handoffStatusLabel(status) {
  if (status === "published") return text("Published", "Выпущено");
  if (status === "handed_off") return text("Manual handoff", "Передано вручную");
  return text("In release plan", "В плане выпуска");
}

function handoffChannelLabel(id) {
  return handoffInstructionMeta(id).channel;
}

function handoffInstructionMeta(id) {
  const map = {
    seo: {
      channel: text("Website / CMS", "Сайт / CMS")
    },
    telegram: {
      channel: "Telegram"
    },
    vc: {
      channel: "VC.ru / Habr"
    },
    email: {
      channel: "Email"
    },
    "lead-magnet": {
      channel: text("Lead magnet", "Лид-магнит")
    },
    calendar: {
      channel: text("Release plan", "План выпуска")
    }
  };
  return map[id] || map.telegram;
}

  return {
    renderPublications
  };
}
