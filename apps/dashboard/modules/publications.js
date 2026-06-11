export function createPublicationsModule(ctx) {
  const {
    state,
    publicationTabs,
    currentPublicationTab,
    escapeHtml,
    escapeAttr,
    text,
    tr,
    getApprovalContext,
    displayChannel,
    labelize,
    statusChip,
    renderAssetPreview,
    actionButton,
    formatDate,
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
    ${publicationStateStrip()}
    ${publicationPilotStrip()}
    ${tabRenderers[tab]()}
  `;
}

function publicationStateStrip() {
  const pending = state.approvals.filter((item) => item.status === "pending").length;
  const handedOff = state.calendar.filter((item) => item.status === "handed_off").length;
  const published = state.calendar.filter((item) => item.status === "published").length;
  const items = [
    [text("Waiting decision", "Ждёт решения"), pending, text("approve or return", "согласовать или вернуть")],
    [text("Manual handoff", "Передано вручную"), handedOff, text("waiting live confirmation", "ждёт подтверждения выхода")],
    [text("Published", "Вышло"), published, text("counted in results", "учтено в результатах")]
  ];

  return `
    <section class="publication-state-strip" aria-label="${escapeAttr(text("Release state", "Состояние выпуска"))}">
      ${items.map(([label, value, note]) => `
        <article>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(String(value))}</strong>
          <p>${escapeHtml(note)}</p>
        </article>
      `).join("")}
    </section>
  `;
}

function publicationPilotStrip() {
  const profile = state.offer?.profile || {};
  const pending = state.approvals.filter((item) => item.status === "pending").length;
  const handedOff = state.calendar.filter((item) => item.status === "handed_off").length;
  const scheduled = state.calendar.filter((item) => item.status === "scheduled").length;
  const published = state.calendar.filter((item) => item.status === "published").length;
  const nextStep = pending
    ? text("Close the owner decision.", "Закрыть решение собственника.")
    : handedOff
      ? text("Confirm live status.", "Подтвердить выход.")
      : scheduled
        ? text("Hand off the approved material.", "Передать согласованный материал.")
        : published
          ? text("Check result and choose the next topic.", "Проверить результат и выбрать следующую тему.")
          : text("Prepare the first material.", "Подготовить первый материал.");
  const items = [
    [
      text("Release owner", "Ответственный за выпуск"),
      profile.releaseOwner || text("Not assigned", "Не назначен"),
      text("who receives the approved material", "кто получает согласованный материал")
    ],
    [
      text("First signal", "Первый сигнал"),
      profile.firstSignalSource || text("Not set", "Не задан"),
      text("where we check the result", "где проверяем результат")
    ],
    [
      text("Next step", "Следующий шаг"),
      nextStep,
      text("keeps the pilot moving", "двигает пилот дальше")
    ]
  ];

  return `
    <section class="publication-pilot-strip" aria-label="${escapeAttr(text("Pilot release context", "Контекст выпуска пилота"))}">
      ${items.map(([label, value, note]) => `
        <article>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
          <p>${escapeHtml(note)}</p>
        </article>
      `).join("")}
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
              <div class="approval-item ${item.id === selected?.id ? "selected" : ""}" role="button" tabindex="0" data-action="select-approval" data-id="${escapeAttr(item.id)}">
                <strong>${escapeHtml(context.title)}</strong>
                <span>${escapeHtml(displayChannel(context.channel))} · ${escapeHtml(context.when)} · ${escapeHtml(tr(labelize(item.status || "pending")))}</span>
              </div>
            `;
          }).join("") || `<p class="empty-note">${text("No materials waiting for approval.", "Нет материалов на согласовании.")}</p>`}
        </div>
      </section>

      <section class="approval-detail panel">
        ${selected ? approvalDetail(selected) : approvalEmptyState(pendingApprovals.length)}
      </section>
    </div>
  `;
}

function approvalEmptyState(count) {
  if (count > 0) {
    return `<div class="empty-state"><h3>${text("Select a decision", "Выберите решение")}</h3><p>${text("Open a material from the queue to approve it, return changes, or reject it.", "Откройте материал из очереди: согласовать, вернуть на правки или отклонить.")}</p></div>`;
  }

  return `
    <div class="empty-state">
      <h3>${text("Decision queue is clear", "Очередь решений чиста")}</h3>
      <p>${text("There is no material waiting for the owner right now. Check the release plan or take the next material from the pack.", "Сейчас нет материала, который ждёт решения собственника. Проверьте план выпуска или возьмите следующий материал из пакета.")}</p>
      <div class="detail-actions">
        <button class="button primary" data-action="open-calendar">${escapeHtml(text("Open release plan", "Открыть план выпуска"))}</button>
        <button class="button secondary" data-action="set-publication-tab" data-id="pack">${escapeHtml(text("Open material pack", "Открыть пакет материалов"))}</button>
      </div>
    </div>
  `;
}

function approvalDetail(item) {
  const context = getApprovalContext(item);
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
    <div class="preview-pane approval-preview-pane">
      <p class="eyebrow">${text("Text preview", "Текст")}</p>
      ${renderAssetPreview(context)}
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
      note: text("Approve, return, or reject before release.", "Согласовать, вернуть или отклонить перед выпуском."),
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
        ${note ? `<a class="button secondary table-button" href="./#/publications/note/${escapeAttr(item.id)}">${escapeHtml(text("Instruction", "Инструкция"))}</a>` : ""}
      </div>
    </article>
  `;
}

function releaseQueueAction(item, queueId) {
  if (queueId === "decision") return `<button class="button secondary table-button" data-action="go-approvals" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Approve", "Согласовать"))}</button>`;
  if (queueId === "handoff" && item.status === "handed_off") return `<button class="button primary table-button" data-action="mark-calendar-published" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Mark as published", "Отметить как опубликованное"))}</button>`;
  if (queueId === "handoff") return `<button class="button secondary table-button" data-action="mark-calendar-exported" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Record handoff", "Отметить передачу"))}</button>`;
  return `<span class="muted">${escapeHtml(text("In Results", "В результатах"))}</span>`;
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
              : `<button class="button secondary" data-action="mark-pack-handoff" data-id="${escapeAttr(selectedAsset.id)}">${escapeHtml(text("Record handoff", "Отметить передачу"))}</button>`}
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
        ${selectedHandoff ? "" : `<button class="button secondary handoff-plan-link" data-action="open-calendar">${escapeHtml(text("Release plan", "План выпуска"))}</button>`}
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
