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
  const tab = preferredPublicationTab(currentPublicationTab());
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
    ${publicationPilotStrip()}
    ${tabRenderers[tab]()}
  `;
}

function preferredPublicationTab(tab) {
  const pending = state.approvals.some((item) => item.status === "pending");
  const releaseQueue = state.calendar.some((item) => ["scheduled", "handed_off"].includes(item.status) && isReleaseQueueReadyItem(item));
  if (tab === "approvals" && !pending && releaseQueue) return "calendar";
  return tab;
}

function publicationStateStrip() {
  const pending = state.approvals.filter((item) => item.status === "pending").length;
  const scheduled = state.calendar.filter((item) => item.status === "scheduled" && isReleaseQueueReadyItem(item)).length;
  const handedOff = state.calendar.filter((item) => item.status === "handed_off").length;
  const published = state.calendar.filter((item) => item.status === "published").length;
  const items = [
    [text("Weekly topics", "Темы недели"), pending ? text("Decision needed", "Ждёт решения") : text("Clear", "Чисто"), text("owner boundaries", "границы собственника")],
    [text("Release queue", "Очередь выпуска"), scheduled ? text("With manager", "У менеджера") : text("Empty", "Пусто"), text("AI draft and manager QA passed", "AI-текст и QA пройдены")],
    [text("Result confirmation", "Подтверждение результата"), handedOff ? text("Awaiting owner", "Ждёт собственника") : text("Clear", "Чисто"), text("after live release", "после выхода")],
    [text("Results", "Результаты"), published ? text("Counted", "Учтено") : text("No release", "Нет выхода"), text("tracked separately", "учтено отдельно")]
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
  const next = publicationNextAction();
  const qaOwner = stripTrailingPunctuation(profile.releaseOwner || text("manager QA is not assigned", "менеджер QA не назначен"));
  const firstSignal = stripTrailingPunctuation(profile.firstSignalSource || text("signal source is not set", "источник сигнала не задан"));
  const actionBelow = next.action === "mark-calendar-exported";

  return `
    <section class="publication-pilot-strip" aria-label="${escapeAttr(text("Next publication action", "Следующее действие по выпуску"))}">
      <article>
        <div>
          <span>${escapeHtml(next.audience || text("Next action", "Следующее действие"))}</span>
          <strong>${escapeHtml(next.title)}</strong>
        </div>
        <p>${escapeHtml(next.note)}</p>
        ${next.action === "go-approval" ? "" : `<p class="publication-next-meta">${escapeHtml(text(`QA: ${qaOwner}. Signal: ${firstSignal}.`, `QA: ${qaOwner}. Сигнал: ${firstSignal}.`))}</p>`}
        ${next.action === "go-approval" || actionBelow
          ? `<span class="status-chip">${escapeHtml(actionBelow ? text("Action in release queue", "Действие в очереди") : text("Topic decision below", "Решение ниже"))}</span>`
          : `<button class="button secondary table-button publication-next-action" data-action="${escapeAttr(next.action)}" data-id="${escapeAttr(next.id || "")}">${escapeHtml(next.label)}</button>`}
      </article>
    </section>
  `;
}

function stripTrailingPunctuation(value) {
  return String(value || "").trim().replace(/[.!?]+$/, "");
}

function publicationNextAction() {
  const pendingItem = state.approvals.find((item) => item.status === "pending");
  const handedOffItem = state.calendar.find((item) => item.status === "handed_off");
  const scheduledItem = state.calendar.find((item) => item.status === "scheduled" && isReleaseQueueReadyItem(item));
  const published = state.calendar.some((item) => item.status === "published");

  if (handedOffItem) {
    return {
      title: text("Owner confirms the result.", "Собственник подтверждает результат."),
      note: text("The manager started release. Only confirmed live releases move into Results.", "Менеджер запустил выпуск. В результат попадает только подтверждённый выход."),
      audience: text("Next owner action", "Следующее действие собственника"),
      action: "mark-calendar-published",
      id: handedOffItem.id,
      label: text("Confirm result", "Подтвердить результат")
    };
  }
  if (pendingItem) {
    return {
      title: text("Approve the weekly topic.", "Согласовать тему недели."),
      note: text("One owner decision sets the topic boundary. Then AgentResult drafts; manager QA moves the text to release without another owner approval.", "Одно решение задаёт границу темы. Дальше AgentResult пишет; менеджер QA ведёт текст к выпуску без нового согласования собственника."),
      audience: text("Next owner action", "Следующее действие собственника"),
      action: "go-approval",
      id: pendingItem.id,
      label: text("Approve topic", "Согласовать тему")
    };
  }
  if (scheduledItem) {
    return {
      title: text("Release is in the manager queue.", "Выпуск в очереди менеджера."),
      note: text("QA is passed. The manager owns channel release; owner returns for result confirmation.", "QA пройден. Канальный выпуск на менеджере; собственник возвращается подтвердить результат."),
      audience: text("Next manager action", "Следующее действие менеджера"),
      action: "mark-calendar-exported",
      id: scheduledItem.id,
      label: text("Move to live check", "К проверке выхода")
    };
  }
  if (published) {
    return {
      title: text("Check the result signal.", "Проверить сигнал результата."),
      note: text("Confirmed releases should lead to a lead, reply, CRM event, or task.", "Подтверждённый выпуск должен привести к заявке, ответу, CRM-событию или задаче."),
      audience: text("Next workspace check", "Следующая проверка контура"),
      action: "go-analytics",
      id: "",
      label: text("Open results", "Открыть результаты")
    };
  }
  return {
    title: text("Prepare the first material.", "Подготовить первый материал."),
    note: text("Start with setup and weekly topics, then move through AI draft, Source Pack, manager QA, release queue, result confirmation, and signal.", "Начните с настройки и тем недели, затем проведите их через AI-текст, Source Pack, QA менеджера, очередь выпуска, подтверждение результата и сигнал."),
    audience: text("Next setup action", "Следующее действие настройки"),
    action: "go-demand-map",
    id: "",
    label: text("Open strategy", "Открыть стратегию")
  };
}

function publicationTabContext(tab) {
  const contexts = {
    approvals: [
      text("Topics", "Темы"),
      text("Owner approves boundaries once.", "Собственник один раз утверждает границы.")
    ],
    calendar: [
      text("Release queue", "Очередь выпуска"),
      text("After QA, release stays in the manager queue; owner confirms only the result.", "После QA выпуск в очереди менеджера; собственник подтверждает только результат.")
    ],
    pack: [
      text("Pack", "Пакет"),
      text("Approved texts for manual channel release.", "Тексты для ручного выпуска в каналах.")
    ]
  };
  const [title, note] = contexts[tab] || contexts.approvals;
  return `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(note)}</span>`;
}

function renderApprovals() {
  const pendingApprovals = state.approvals.filter((item) => item.status === "pending");
  const selected = pendingApprovals.find((item) => item.id === state.selectedApprovalId) || pendingApprovals[0] || null;
  return `
    ${weeklyTopicBatchPanel(pendingApprovals)}
    <div class="approval-workspace">
      <section class="approval-list panel">
        <div class="panel-heading compact">
          <div>
            <p class="eyebrow">${text("Weekly topic approval", "Согласование тем недели")}</p>
            <h3>${pendingApprovals.length} ${text("waiting", "ждут согласования")}</h3>
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
          }).join("") || `<p class="empty-note">${text("No weekly topics are waiting for owner approval.", "Нет тем недели на согласовании.")}</p>`}
        </div>
      </section>

      <section class="approval-detail panel">
        ${selected ? approvalDetail(selected) : approvalEmptyState(pendingApprovals.length)}
      </section>
    </div>
  `;
}

function weeklyTopicBatchPanel(items) {
  if (!items.length) return "";
  const contexts = items.slice(0, 5).map((item) => ({ item, context: getApprovalContext(item) }));
  const riskyCount = contexts.filter(({ context }) => approvalRiskSummary(context.checklist) !== text("No obvious risk", "Явного риска нет")).length;
  const channels = [...new Set(contexts.map(({ context }) => displayChannel(context.channel)).filter(Boolean))];
  return `
    <section class="panel full weekly-topic-batch" aria-label="${escapeAttr(text("Weekly topic batch", "Пакет тем недели"))}">
      <div class="panel-heading compact">
        <div>
          <p class="eyebrow">${text("Topics", "Темы")}</p>
          <h3>${escapeHtml(text(`${items.length} topics for one owner decision`, weeklyTopicCountLabel(items.length)))}</h3>
        </div>
        <div class="handoff-actions inline">
          <button class="button primary table-button" data-action="approve-weekly-batch">${escapeHtml(text("Approve weekly batch", "Согласовать пакет недели"))}</button>
          <button class="button secondary table-button" data-action="open-changes-modal">${escapeHtml(text("Return topic boundary", "Вернуть границу"))}</button>
        </div>
      </div>
      <div class="approval-decision-strip">
        <div>
          <span>${text("Channels", "Каналы")}</span>
          <strong>${escapeHtml(channels.join(", ") || text("not set", "не заданы"))}</strong>
        </div>
        <div>
          <span>${text("Risks", "Риски")}</span>
          <strong>${escapeHtml(riskyCount ? text(`${riskyCount} need attention`, `${riskyCount} требуют внимания`) : text("No obvious risk", "Явного риска нет"))}</strong>
        </div>
        <div>
          <span>${text("Text control", "Контроль текста")}</span>
          <strong>${escapeHtml(text("Draft -> style check -> QA", "Текст -> проверка стиля -> QA"))}</strong>
        </div>
        <div>
          <span>${text("After approval", "После согласования")}</span>
          <strong>${escapeHtml(text("No repeat owner approval", "Без повторного согласования"))}</strong>
        </div>
        <div>
          <span>${text("Author voice", "Стиль автора")}</span>
          <strong>${escapeHtml(text("Checked in manager QA", "Проверка в QA"))}</strong>
        </div>
      </div>
    </section>
  `;
}

function weeklyTopicCountLabel(count) {
  const noun = count % 10 === 1 && count % 100 !== 11
    ? "тема"
    : ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100) ? "темы" : "тем");
  return `${count} ${noun} на одно решение собственника`;
}

function weeklyBatchBoundary(contexts, channels, riskyCount) {
  const profile = state.offer?.profile || {};
  const proof = stringValue(profile.proof || profile.differentiators || profile.proofAssets, text("proof from company context", "proof из контекста компании"));
  const forbidden = stringValue(profile.forbiddenClaims || profile.restrictions || profile.approvalOwner, text("no unsupported promises or risky claims", "без неподтверждённых обещаний и рискованных утверждений"));
  return text(
    `${contexts.length} topics, channels: ${channels.join(", ") || "not set"}. Boundary: use ${proof}; avoid ${forbidden}. Risk flags: ${riskyCount || "none"}.`,
    `${contexts.length} тем, каналы: ${channels.join(", ") || "не заданы"}. Граница: опираться на ${proof}; не использовать ${forbidden}. Риски: ${riskyCount || "нет"}.`
  );
}

function weeklyBatchSourcePack() {
  const profile = state.offer?.profile || {};
  const pack = parseAuthorVoiceSourcePack(stringValue(
    profile.authorVoiceContract || profile.styleGuard || profile.tone || profile.approvalRules,
    text(
      "Author phrases: add 3-5 real phrases. Stop-words: list words to remove. AI templates: remove generic openings. Directness: keep the author's directness. Proof/risk: keep claim boundaries.",
      "Фразы автора: 3-5 реальных формулировок. Стоп-слова: что убрать. AI-шаблоны: убрать общие вступления. Прямота: сохранить прямоту автора. Proof/risk: держать границы утверждений."
    )
  ));
  return [
    [text("Author voice", "Стиль автора"), pack.phrases],
    [text("Stop-words", "Стоп-слова"), pack.stopWords],
    [text("Banned AI structures", "Запрещённые AI-конструкции"), pack.aiTemplates],
    [text("Proof/risk boundary", "Proof/risk граница"), pack.proofRisk],
    [text("Manager QA decision", "Решение QA менеджера"), text("matches / does not match the author", "похоже / не похоже на автора")]
  ];
}

function parseAuthorVoiceSourcePack(contract) {
  const fallback = {
    phrases: text("'less clutter', 'working control loop'", "'меньше каши', 'рабочий контур'"),
    stopWords: text("magic, guaranteed growth, autopilot", "магия, гарантированный рост, автопилот"),
    aiTemplates: text("generic openings, empty benefit lists", "общие вступления, пустые списки преимуществ"),
    proofRisk: text("no claims without proof", "без утверждений без proof")
  };
  const patterns = [
    ["phrases", [/фразы автора[:：]\s*([^.;\n]+)/i, /author phrases[:：]\s*([^.;\n]+)/i]],
    ["stopWords", [/стоп-слова[:：]\s*([^.;\n]+)/i, /stop-words[:：]\s*([^.;\n]+)/i]],
    ["aiTemplates", [/ai-шаблон(?:ы)?[:：]\s*([^.;\n]+)/i, /ai templates[:：]\s*([^.;\n]+)/i]],
    ["proofRisk", [/proof\/risk[:：]\s*([^.;\n]+)/i, /границы[:：]\s*([^.;\n]+)/i]]
  ];

  return Object.fromEntries(patterns.map(([key, matchers]) => {
    const found = matchers.map((pattern) => contract.match(pattern)?.[1]?.trim()).find(Boolean);
    return [key, found || fallback[key]];
  }));
}

function stringValue(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function approvalEmptyState(count) {
  if (count > 0) {
    return `<div class="empty-state"><h3>${text("Select a weekly topic", "Выберите тему недели")}</h3><p>${text("Approve the topic and boundaries, or return the boundary for changes.", "Согласуйте тему и границы или верните границу на правки.")}</p></div>`;
  }

  return `
    <div class="empty-state">
      <h3>${text("Weekly topics are clear", "Темы недели согласованы")}</h3>
      <p>${text("AgentResult drafts the text and manager QA checks quality. The owner returns only for exceptions, result confirmation, or the next weekly topics.", "AgentResult пишет текст, менеджер QA проверяет качество. Собственник возвращается только к исключениям, подтверждению результата или следующим темам недели.")}</p>
      <div class="detail-actions">
        <button class="button primary" data-action="open-calendar">${escapeHtml(text("Open manager queue", "Открыть очередь менеджера"))}</button>
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
        <p class="eyebrow">${text("Weekly topic", "Тема недели")}</p>
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
      <p class="eyebrow">${text("Topic context", "Контекст темы")}</p>
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
      <span class="decision-complete">${escapeHtml(text("Topic boundary saved", "Граница темы сохранена"))}</span>
      ${actionButton("Open calendar", "secondary", "go-calendar")}
    `;
  }
  return `
    ${actionButton(text("Boundary changes", "Правки по границе"), "secondary", "open-changes-modal")}
    ${actionButton(text("Skip topic", "Не брать тему"), "danger", "open-reject-modal")}
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
          <p class="eyebrow">${text("Release queue", "Очередь выпуска")}</p>
          <h3>${text("QA ready -> manager release queue -> result confirmation", "QA готово -> очередь выпуска -> подтверждение результата")}</h3>
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
      title: text("Weekly topics", "Темы недели"),
      note: text("Owner approves topics before AgentResult drafts.", "Собственник согласует темы до AI-текста."),
      items: state.calendar.filter(calendarItemNeedsOwnerDecision),
      empty: text("No decisions waiting.", "Нет решений на ожидании.")
    },
    {
      id: "handoff",
      title: text("Release queue", "Очередь выпуска"),
      note: text("QA passed. Manager owns channel release; owner confirms only the result after it is live.", "QA пройден. Канальный выпуск на менеджере; собственник подтверждает только результат после выхода."),
      items: state.calendar.filter((item) => ["scheduled", "handed_off"].includes(item.status) && isReleaseQueueReadyItem(item)),
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

function calendarItemNeedsOwnerDecision(item) {
  if (!["review", "draft"].includes(item.status)) return false;
  return state.approvals.some((approval) =>
    approval.status === "pending" &&
    approval.target_type === "publishing_calendar_item" &&
    (approval.calendar_item_id === item.id || approval.target_id === item.id)
  );
}

function isReleaseQueueReadyItem(item) {
  if (item.status === "handed_off") return true;
  const content = state.content.find((entry) => entry.id === item.content_item_id) || null;
  return Boolean(content?.metadata?.manager_qa_contract || item.metadata?.manager_qa_contract);
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
  const content = state.content.find((entry) => entry.id === item.content_item_id) || null;
  const profile = state.offer?.profile || {};
  const manager = stripTrailingPunctuation(profile.releaseOwner || text("manager QA", "менеджер QA"));
  const preview = releaseTextPreview(content, item);
  const isReleaseQueue = queueId === "handoff";
  return `
    <article class="release-queue-card">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(displayChannel(item.channel || "manual"))} · ${escapeHtml(formatDate(item.scheduled_for))} · ${escapeHtml(text(`Manager: ${manager}`, `Ответственный: ${manager}`))}</span>
      </div>
      ${isReleaseQueue ? managerReleaseEvidence(item, content) : ""}
      ${preview ? `<pre class="asset-preview-text release-text-preview">${escapeHtml(preview)}</pre>` : ""}
      ${note ? `<p>${escapeHtml(note)}</p>` : ""}
      <div class="card-actions">
        ${releaseQueueAction(item, queueId)}
        ${!isReleaseQueue && note ? `<a class="button secondary table-button" href="./#/publications/note/${escapeAttr(item.id)}">${escapeHtml(text("Release note", "Пакет выпуска"))}</a>` : ""}
      </div>
    </article>
  `;
}

function releaseTextPreview(content, item = null) {
  const raw = content?.body_md || content?.metadata?.body || content?.metadata?.brief || "";
  const value = String(raw || "").trim();
  if (!value) {
    const title = content?.title || item?.title || "";
    return title ? text(`Release text: ${title}`, `Текст к выпуску: ${title}`) : "";
  }
  return value.length > 360 ? `${value.slice(0, 360).trim()}...` : value;
}

function managerReleaseChecklist(item, content) {
  const qa = content?.metadata?.manager_qa_contract || item.metadata?.manager_qa_contract || null;
  const checks = [
    [text("Text is final and visible", "Текст финальный и виден"), Boolean(content?.body_md || content?.metadata?.body || content?.metadata?.brief)],
    [text("Channel is set", "Канал указан"), Boolean(item.channel)],
    [text("Responsible manager is set", "Ответственный указан"), Boolean((state.offer?.profile || {}).releaseOwner || content?.owner)],
    [text("Manager QA passed", "QA менеджера пройден"), Boolean(qa || item.metadata?.qa_passed_at)],
    [text("After live: mark as out", "После выхода: отметить «вышло»"), item.status === "handed_off"]
  ];
  return `
    <div class="release-preflight">
      <strong>${escapeHtml(text("Release checklist", "Чеклист выпуска"))}</strong>
      ${checks.map(([label, ok]) => `
        <span class="${ok ? "done" : "pending"}">${escapeHtml(label)}</span>
      `).join("")}
    </div>
  `;
}

function managerReleaseEvidence(item, content) {
  return `
    <div class="release-evidence-grid">
      <div>
        <span>${escapeHtml(text("Channel", "Канал"))}</span>
        <strong>${escapeHtml(displayChannel(item.channel || "manual"))}</strong>
      </div>
      <div>
        <span>${escapeHtml(text("Final text", "Финальный текст"))}</span>
        <strong>${escapeHtml(text("Ready for release", "Готов к выпуску"))}</strong>
      </div>
      <div>
        <span>${escapeHtml(text("QA evidence", "Доказательство QA"))}</span>
        <strong>${escapeHtml(managerReleaseQaEvidenceLabel(item, content))}</strong>
      </div>
      <div>
        <span>${escapeHtml(text("Next step", "Следующий шаг"))}</span>
        <strong>${escapeHtml(item.status === "handed_off" ? text("Confirm live result", "Подтвердить выход") : text("Release in channel", "Выпустить в канал"))}</strong>
      </div>
    </div>
    ${managerReleaseQaContract(item, content)}
  `;
}

function managerReleaseQaEvidenceLabel(item, content) {
  const qa = content?.metadata?.manager_qa_contract || item.metadata?.manager_qa_contract || null;
  if (!qa) return text("QA decision missing", "Нет решения QA");
  const checklist = qa.checklist || {};
  const passedCount = ["factsProof", "authorVoice", "aiIshnessRemoved", "ownerBoundaries", "channelFormat"]
    .filter((key) => checklist[key] === true).length;
  return text(`Manager QA passed, ${passedCount}/5`, `QA менеджера пройден, ${passedCount}/5`);
}

function managerReleaseQaContract(item, content) {
  const qa = content?.metadata?.manager_qa_contract || item.metadata?.manager_qa_contract || null;
  if (!qa) {
    return `
      <div class="release-qa-contract pending">
        <strong>${escapeHtml(text("QA evidence", "Доказательство QA"))}</strong>
        <span>${escapeHtml(text("Missing manager QA decision", "Нет решения менеджера QA"))}</span>
      </div>
    `;
  }
  const checklist = qa.checklist || {};
  const passedCount = ["factsProof", "authorVoice", "aiIshnessRemoved", "ownerBoundaries", "channelFormat"]
    .filter((key) => checklist[key] === true).length;
  const verdict = qa.verdict?.decision === "matches_author"
    ? text("matches the author", "похоже на автора")
    : text("does not match the author", "не похоже на автора");
  const comment = String(qa.comment || item.metadata?.qa_note || "").trim();
  return `
    <div class="release-qa-contract">
      <strong>${escapeHtml(text("QA evidence", "Доказательство QA"))}</strong>
      <span>${escapeHtml(text(`Verdict: ${verdict}`, `Вердикт: ${verdict}`))}</span>
      <span>${escapeHtml(text(`Checklist: ${passedCount}/5`, `Чеклист: ${passedCount}/5`))}</span>
      ${comment ? `<p>${escapeHtml(comment)}</p>` : ""}
    </div>
  `;
}

function releaseQueueAction(item, queueId) {
  if (queueId === "decision") return `<button class="button secondary table-button" data-action="go-approvals" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Approve topic", "Согласовать тему"))}</button>`;
  if (queueId === "handoff" && item.status === "handed_off") return `<button class="button primary table-button" data-action="mark-calendar-published" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Mark as out", "Отметить: вышло"))}</button>`;
  if (queueId === "handoff") return `<button class="button secondary table-button" data-action="mark-calendar-exported" data-id="${escapeAttr(item.id)}">${escapeHtml(text("Move to live check", "К проверке выхода"))}</button>`;
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
              ? `<button class="button secondary" data-action="open-calendar">${escapeHtml(text("Open manager queue", "Открыть очередь менеджера"))}</button>`
              : `<button class="button secondary" data-action="mark-pack-handoff" data-id="${escapeAttr(selectedAsset.id)}">${escapeHtml(text("Add to release queue", "В очередь выпуска"))}</button>`}
            ${selectedAsset.id === "email" ? `<button class="button secondary" data-action="select-tool" data-id="email">${escapeHtml(text("Access", "Доступ"))}</button>` : ""}
          </div>
        </div>
        ${selectedHandoff ? `
          <div class="handoff-status-strip">
            <span>${escapeHtml(handoffStatusLabel(selectedHandoff.status))}</span>
            <strong>${escapeHtml(text("Owner confirms result after it goes live.", "Собственник подтверждает результат после выхода."))}</strong>
          </div>
        ` : ""}
        <div class="pack-detail">
          <p class="eyebrow">${text("Text", "Текст")}</p>
          <pre class="asset-preview-text">${escapeHtml(selectedAsset.preview)}</pre>
        </div>
        ${selectedHandoff ? "" : `<button class="button secondary handoff-plan-link" data-action="open-calendar">${escapeHtml(text("Release queue", "Очередь выпуска"))}</button>`}
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
  if (status === "handed_off") return text("Result confirmation", "Подтверждение результата");
  return text("In manager release queue", "В очереди выпуска менеджера");
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
      channel: text("Release queue", "Очередь выпуска")
    }
  };
  return map[id] || map.telegram;
}

  return {
    renderPublications
  };
}
