#!/usr/bin/env node

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const port = Number(process.env.DASHBOARD_SMOKE_PORT || 4173);
const baseUrl = process.env.DASHBOARD_SMOKE_URL || `http://127.0.0.1:${port}`;
const smokeVersion = process.env.DASHBOARD_SMOKE_VERSION || "smoke";
const shouldStartServer = !process.env.DASHBOARD_SMOKE_URL;
const waitTimeoutMs = Number(process.env.DASHBOARD_SMOKE_TIMEOUT_MS || 30_000);

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright is not installed. Run: npm install");
  process.exit(1);
}

const server = shouldStartServer
  ? spawn("python3", ["-m", "http.server", String(port), "-d", "apps/dashboard"], {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"]
    })
  : null;

let serverError = "";
if (server) {
  server.stderr.on("data", (chunk) => {
    serverError += chunk.toString();
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForDashboard() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (server && server.exitCode !== null) {
      throw new Error(`Dashboard server exited early: ${serverError.trim() || `code ${server.exitCode}`}`);
    }
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Dashboard did not respond at ${baseUrl}`);
}

function assertDashboardScriptContract() {
  const appJs = readFileSync("apps/dashboard/app.js", "utf8");
  assert(appJs.includes('"complete-pilot-week-review"'), "Dashboard week-N review buttons are missing");
  assert(appJs.includes("api(`/pilot/week-${week}/review`"), "Dashboard week-N review must call backend pilot command");
  assert(appJs.includes('api("/pilot/week-3/execution"'), "Dashboard must load backend week-3 execution state");
  assert(appJs.includes('api("/pilot/week-4/execution"'), "Dashboard must load backend week-4 execution state");
  assert(appJs.includes("state.weekThreeExecution"), "Dashboard week-3 execution state slot is missing");
  assert(appJs.includes("state.weekFourExecution"), "Dashboard week-4 execution state slot is missing");
  assert(appJs.includes("setPilotWeekExecutionState(week, null)"), "Dashboard must clear generic week execution after backend review");
  assert(appJs.includes("executeStartPilotWeekExecutionCommand(pilotWeek"), "Dashboard must start approved pilot week scopes generically");
  assert(appJs.includes("function pilotWeekExecutionPanel"), "Dashboard must render week-N execution with a generic panel");
  assert(appJs.includes("function pilotScopeWeek(scope)"), "Dashboard pilot scope approval helper is missing");
  assert(appJs.includes("pilotScopeWeek(item?.scope)"), "Dashboard pilot scope title should support week-3 scope approvals");
}

async function clickUnique(page, selector) {
  const locator = page.locator(selector);
  const count = await locator.count();
  if (count !== 1) {
    const state = await page.evaluate(() => ({
      url: location.href,
      text: document.body.innerText.slice(0, 1200)
    }));
    throw new Error(`${selector} expected 1 element, saw ${count} at ${state.url}: ${state.text}`);
  }
  await locator.click();
}

async function confirmPublicationResult(page) {
  await page.locator('[data-action="mark-calendar-published"]').first().click();
  await page.waitForSelector("#publicationResultUrl");
  await page.fill("#publicationResultUrl", "https://t.me/agentresult/100");
  await page.fill("#publicationResultFormat", "telegram_post");
  await page.fill("#publicationResultComments", "2");
  await page.fill("#publicationResultReposts", "1");
  await page.fill("#publicationResultSaves", "3");
  await page.fill("#publicationResultReactions", "8");
  await page.selectOption("#publicationResultNextStep", "reuse");
  await page.fill("#publicationResultNextStepNote", "Переиспользовать тезисы в следующем материале.");
  await clickUnique(page, '[data-action="submit-publication-result-form"]');
}

async function pageState(page) {
  return page.evaluate(() => {
    const releaseHeads = [...document.querySelectorAll(".release-queue-head")].map((node) => node.textContent.trim());
    const publishedColumn = [...document.querySelectorAll(".release-queue-column")]
      .find((node) => node.textContent.includes("Вышло") || node.textContent.includes("Published"));
    return {
      url: location.href,
      routeTitle: document.querySelector("#sectionTitle")?.textContent?.trim() || "",
      pendingApprovals: document.querySelectorAll(".approval-item").length,
      staleP3DecisionCards: [...document.querySelectorAll(".release-queue-card")]
        .filter((node) => node.textContent.includes("Недельный пакет публикаций AgentResult") && node.textContent.includes("Согласовать тему"))
        .length,
      qaEvidence: document.body.innerText.includes("QA менеджера пройден, 5/5") || document.body.innerText.includes("Manager QA passed, 5/5"),
      releaseQueueActions: document.querySelectorAll('[data-action="mark-calendar-exported"]').length,
      resultConfirmActions: document.querySelectorAll('[data-action="mark-calendar-published"]').length,
      hasOpenResults: document.body.innerText.includes("Открыть результаты") || document.body.innerText.includes("Open results"),
      hasPublicationResults: document.body.innerText.includes("Результаты публикаций")
        || document.body.innerText.includes("РЕЗУЛЬТАТЫ ПУБЛИКАЦИЙ")
        || document.body.innerText.includes("Publication results")
        || document.body.innerText.includes("PUBLICATION RESULTS"),
      publicationResultStepActions: document.querySelectorAll('[data-action="set-publication-result-step"]').length,
      publicationResultCanonicalActions: [...document.querySelectorAll('[data-action="set-publication-result-step"]')]
        .filter((node) => String(node.dataset.id || "").startsWith("publication-result-") && String(node.dataset.id || "").split("|").length === 3)
        .length,
      hasPublicationResultUrl: document.body.innerText.includes("https://t.me/agentresult/100"),
      hasPublicationResultReactions: document.body.innerText.includes("2 комм.") || document.body.innerText.includes("2 comments"),
      hasReuseMaterial: document.body.innerText.includes("Переиспользовать:") || document.body.innerText.includes("Reuse:"),
      hasExpandMaterial: (() => {
        const raw = localStorage.getItem("aiGrowthOsLocalContent") || "[]";
        try {
          return JSON.parse(raw).some((item) => item.content_type === "article_outline" && String(item.title || "").includes("Расширить:"));
        } catch {
          return false;
        }
      })(),
      hasUpdateTask: (() => {
        const raw = localStorage.getItem("aiGrowthOsLocalTasks") || "[]";
        try {
          return JSON.parse(raw).some((task) => task.source === "publication_result_update" && String(task.title || "").includes("Обновить опубликованный материал"));
        } catch {
          return false;
        }
      })(),
      storedPublishedCount: (() => {
        const raw = localStorage.getItem("aiGrowthOsLocalCalendar") || "[]";
        try {
          return JSON.parse(raw).filter((item) => item.status === "published").length;
        } catch {
          return 0;
        }
      })(),
      publishedCount: publishedColumn?.querySelector(".release-queue-head em")?.textContent?.trim() || "",
      releaseHeads
    };
  });
}

async function assertNoConsoleErrors(page, allowBefore = 0) {
  const errors = await page.evaluate((offset) => {
    return (window.__dashboardSmokeErrors || []).slice(offset);
  }, allowBefore);
  assert(errors.length === 0, `Console errors: ${errors.join(" | ")}`);
}

async function assertResponsiveShell(page) {
  const routes = ["overview", "growth-plan", "offer-brain", "content-pipeline", "publications", "analytics", "settings"];
  const viewports = [
    { name: "mobile", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 1000 }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of routes) {
      await page.goto(`${baseUrl}/?v=${smokeVersion}-responsive#/${route}`);
      await page.waitForSelector("#screenRoot");
      const shell = await page.evaluate(() => {
        const languageSwitch = document.querySelector(".language-switch")?.getBoundingClientRect();
        return {
          bodyWidth: document.body.scrollWidth,
          documentWidth: document.documentElement.scrollWidth,
          hasLanguageSwitch: Boolean(languageSwitch && languageSwitch.width > 0 && languageSwitch.height > 0),
          title: document.querySelector("#sectionTitle")?.textContent?.trim() || "",
          viewportWidth: window.innerWidth
        };
      });
      assert(shell.title, `Responsive ${viewport.name}/${route}: title is empty`);
      assert(shell.hasLanguageSwitch, `Responsive ${viewport.name}/${route}: language switch is hidden`);
      assert(
        shell.documentWidth <= shell.viewportWidth + 2 && shell.bodyWidth <= shell.viewportWidth + 2,
        `Responsive ${viewport.name}/${route}: horizontal overflow ${Math.max(shell.documentWidth, shell.bodyWidth)} > ${shell.viewportWidth}`
      );
    }
  }
}

async function assertClientDemoSeed(page) {
  await page.goto(`${baseUrl}/?demo=client&v=${smokeVersion}-client#/overview`, { timeout: waitTimeoutMs });
  await page.waitForSelector("#screenRoot", { timeout: waitTimeoutMs });
  const overview = await page.evaluate(() => ({
    commandTitle: document.querySelector(".command-center-head h3")?.textContent?.trim() || "",
    hasInternalText: /demo|демо|reset|github|vps|token/i.test(document.body.innerText),
    nav: [...document.querySelectorAll(".nav-link")].map((node) => node.textContent.trim()),
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  assert(overview.commandTitle === "Согласовать тему недели", `Client demo Today action is not concise: ${overview.commandTitle}`);
  assert(overview.nav.join("|") === "Сегодня|Публикации|Результаты", `Client demo nav is not client-safe: ${overview.nav.join("|")}`);
  assert(!overview.hasInternalText, "Client demo overview shows internal demo text");
  assert(overview.width <= overview.viewport + 2, `Client demo overview overflows: ${overview.width} > ${overview.viewport}`);

  await page.goto(`${baseUrl}/?demo=client&v=${smokeVersion}-client#/analytics`, { timeout: waitTimeoutMs });
  await page.waitForSelector(".results-desk-layout", { timeout: waitTimeoutMs });
  const results = await page.evaluate(() => ({
    actionCount: document.querySelectorAll('[data-action="set-publication-result-step"]').length,
    hasReadonlyStep: Boolean(document.querySelector(".result-next-step-readonly")),
    hasUrl: document.body.innerText.includes("https://t.me/grothos_content/128"),
    hasReactions: document.body.innerText.includes("4 комм.") || document.body.innerText.includes("4 comments"),
    hasNextStep: document.body.innerText.includes("расширить в большой материал") || document.body.innerText.includes("expand into a larger text"),
    hasInternalText: /demo|демо|reset|github|vps|token/i.test(document.body.innerText),
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  assert(results.actionCount === 0, `Client demo result actions should be hidden: ${results.actionCount}`);
  assert(results.hasReadonlyStep, "Client demo readonly next-step marker is missing");
  assert(results.hasUrl, "Client demo publication result URL is missing");
  assert(results.hasReactions, "Client demo publication reactions are missing");
  assert(results.hasNextStep, "Client demo next content step is missing");
  assert(!results.hasInternalText, "Client demo Results shows internal demo text");
  assert(results.width <= results.viewport + 2, `Client demo Results overflows: ${results.width} > ${results.viewport}`);
  await assertNoConsoleErrors(page);
}

async function assertPilotExecutionSeed(page) {
  await page.goto(`${baseUrl}/?demo=pilot-execution&v=${smokeVersion}-pilot-execution#/overview`, { timeout: waitTimeoutMs });
  await page.waitForSelector("#screenRoot", { timeout: waitTimeoutMs });
  const overview = await page.evaluate(() => ({
    commandTitle: document.querySelector(".command-center-head h3")?.textContent?.trim() || "",
    nav: [...document.querySelectorAll(".nav-link")].map((node) => node.textContent.trim()),
    hasDay7Task: document.body.innerText.includes("Day 7: review"),
    hasNoLeadLanguage: !/guaranteed leads|guaranteed revenue/i.test(document.body.innerText),
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  assert(overview.commandTitle === "Выпуск у менеджера: Day 7: review next content step and week-2 scope", `Pilot execution Today action mismatch: ${overview.commandTitle}`);
  assert(overview.nav.join("|") === "Сегодня|Материалы|Публикации|Результаты|База|Настройки", `Pilot execution nav is not operator-complete: ${overview.nav.join("|")}`);
  assert(overview.hasDay7Task, "Pilot execution Today does not show Day-7 review path");
  assert(overview.hasNoLeadLanguage, "Pilot execution seed shows forbidden guarantee language");
  assert(overview.width <= overview.viewport + 2, `Pilot execution overview overflows: ${overview.width} > ${overview.viewport}`);

  await page.goto(`${baseUrl}/?demo=pilot-execution&v=${smokeVersion}-pilot-execution#/content-pipeline`, { timeout: waitTimeoutMs });
  await page.waitForSelector(".material-command", { timeout: waitTimeoutMs });
  const materials = await page.evaluate(() => ({
    hasFirstBrief: document.body.innerText.includes("Как не терять выпуск контента между идеей и публикацией"),
    hasBriefAngle: document.body.innerText.includes("тема, черновик, QA, выпуск и результат живут в разных чатах"),
    hasQa: document.body.innerText.includes("QA passed") || document.body.innerText.includes("QA пройден"),
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  assert(materials.hasFirstBrief, "Pilot execution first material title is missing");
  assert(materials.hasBriefAngle, "Pilot execution material brief angle is missing");
  assert(materials.hasQa, "Pilot execution QA path is missing");
  assert(materials.width <= materials.viewport + 2, `Pilot execution materials overflow: ${materials.width} > ${materials.viewport}`);

  await page.goto(`${baseUrl}/?demo=pilot-execution&v=${smokeVersion}-pilot-execution#/settings`, { timeout: waitTimeoutMs });
  await page.waitForSelector("#screenRoot", { timeout: waitTimeoutMs });
  const roles = await page.evaluate(() => ({
    hasApprovalOwner: document.body.innerText.includes("Founder / managing partner"),
    hasReleaseOwner: document.body.innerText.includes("Content operator or chief of staff"),
    hasResultSource: document.body.innerText.includes("Telegram post URL"),
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  assert(roles.hasApprovalOwner, "Pilot execution approval owner role is missing");
  assert(roles.hasReleaseOwner, "Pilot execution release owner role is missing");
  assert(roles.hasResultSource, "Pilot execution result source is missing");
  assert(roles.width <= roles.viewport + 2, `Pilot execution settings overflow: ${roles.width} > ${roles.viewport}`);

  await page.goto(`${baseUrl}/?demo=pilot-execution&v=${smokeVersion}-pilot-execution#/analytics`, { timeout: waitTimeoutMs });
  await page.waitForSelector(".results-desk-layout", { timeout: waitTimeoutMs });
  const results = await page.evaluate(() => ({
    actionCount: document.querySelectorAll('[data-action="set-publication-result-step"]').length,
    hasUrl: document.body.innerText.includes("https://t.me/founder_channel/42"),
    hasReactions: document.body.innerText.includes("3 комм.") || document.body.innerText.includes("3 comments"),
    hasDay7Path: document.body.innerText.includes("Day 7 review path"),
    hasNoGuaranteedLeadLanguage: !/guaranteed leads|guaranteed revenue/i.test(document.body.innerText),
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth
  }));
  assert(results.actionCount >= 4, `Pilot execution result actions should remain operator-active: ${results.actionCount}`);
  assert(results.hasUrl, "Pilot execution publication result URL is missing");
  assert(results.hasReactions, "Pilot execution publication reactions are missing");
  assert(results.hasDay7Path, "Pilot execution Day-7 review path is missing from Results");
  assert(results.hasNoGuaranteedLeadLanguage, "Pilot execution Results shows forbidden guarantee language");
  assert(results.width <= results.viewport + 2, `Pilot execution Results overflows: ${results.width} > ${results.viewport}`);
  await assertNoConsoleErrors(page);
}

async function assertStartWeekOnePilotFlow(page) {
  await page.goto(`${baseUrl}/?demo=reset&v=${smokeVersion}-start-pilot#/overview`, { timeout: waitTimeoutMs });
  await page.waitForSelector("#screenRoot", { timeout: waitTimeoutMs });
  await clickUnique(page, '[data-action="open-week-one-pilot-start"]');
  await page.waitForSelector("#pilotStartIcp", { timeout: waitTimeoutMs });
  await clickUnique(page, '[data-action="submit-week-one-pilot-start"]');
  await page.waitForURL(`${baseUrl}/?demo=reset&v=${smokeVersion}-start-pilot#/publications`);
  await page.waitForSelector(".tabs-panel", { timeout: waitTimeoutMs });

  const started = await page.evaluate(() => {
    const localContent = JSON.parse(localStorage.getItem("aiGrowthOsLocalContent") || "[]");
    const localCalendar = JSON.parse(localStorage.getItem("aiGrowthOsLocalCalendar") || "[]");
    const localApprovals = JSON.parse(localStorage.getItem("aiGrowthOsLocalApprovals") || "[]");
    const workspace = JSON.parse(localStorage.getItem("aiGrowthOsWorkspaceState") || "{}");
    return {
      hasApproval: localApprovals.some((item) => item.status === "pending" && String(item.summary || "").includes("Согласовать тему недели")),
      hasFirstMaterial: localContent.some((item) => String(item.title || "").includes("Как не терять выпуск контента") && item.status === "review"),
      hasBrief: localContent.some((item) => String(item.metadata?.brief || "").includes("тема, черновик, QA, выпуск и результат живут в разных чатах")),
      hasReleasePath: localCalendar.some((item) => String(item.title || "").includes("Day 4/5") && item.status === "scheduled"),
      hasDay7Review: localCalendar.some((item) => String(item.title || "").includes("Day 7: review") && item.status === "scheduled"),
      hasWorkspaceMarker: Boolean(workspace.activePilotWorkspace?.day_7_review_id),
      visibleApproval: document.body.innerText.includes("Согласовать тему недели: Как не терять выпуск контента между идеей и публикацией"),
      width: document.documentElement.scrollWidth,
      viewport: window.innerWidth
    };
  });
  assert(started.hasApproval, "Start week-1 pilot did not create pending topic approval");
  assert(started.hasFirstMaterial, "Start week-1 pilot did not create first material");
  assert(started.hasBrief, "Start week-1 pilot did not create material brief");
  assert(started.hasReleasePath, "Start week-1 pilot did not create release confirmation path");
  assert(started.hasDay7Review, "Start week-1 pilot did not create Day-7 review");
  assert(started.hasWorkspaceMarker, "Start week-1 pilot did not persist workspace marker");
  assert(started.visibleApproval, "Started pilot approval is not visible in Publication Desk");
  assert(started.width <= started.viewport + 2, `Started pilot publications overflow: ${started.width} > ${started.viewport}`);

  await page.evaluate((version) => history.replaceState(null, "", `/?v=${version}-start-pilot-persist#/publications`), smokeVersion);
  await page.reload();
  await page.waitForSelector(".tabs-panel", { timeout: waitTimeoutMs });
  const persisted = await page.evaluate(() => {
    const localCalendar = JSON.parse(localStorage.getItem("aiGrowthOsLocalCalendar") || "[]");
    return {
      hasDay7Review: localCalendar.some((item) => String(item.title || "").includes("Day 7: review next content step and week-2 scope")),
      hasApproval: document.body.innerText.includes("Согласовать тему недели: Как не терять выпуск контента между идеей и публикацией"),
      width: document.documentElement.scrollWidth,
      viewport: window.innerWidth
    };
  });
  assert(persisted.hasDay7Review, "Reload lost started pilot Day-7 review");
  assert(persisted.hasApproval, "Reload lost started pilot approval");
  assert(persisted.width <= persisted.viewport + 2, `Started pilot reload overflow: ${persisted.width} > ${persisted.viewport}`);
  await assertNoConsoleErrors(page);
}

async function run() {
  assertDashboardScriptContract();
  await waitForDashboard();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(waitTimeoutMs);
  page.setDefaultNavigationTimeout(waitTimeoutMs);
  await page.addInitScript(() => {
    window.__dashboardSmokeErrors = [];
    window.addEventListener("error", (event) => {
      window.__dashboardSmokeErrors.push(event.message || "window error");
    });
    window.addEventListener("unhandledrejection", (event) => {
      window.__dashboardSmokeErrors.push(String(event.reason || "unhandled rejection"));
    });
  });

  try {
    await assertClientDemoSeed(page);
    await assertPilotExecutionSeed(page);
    await assertStartWeekOnePilotFlow(page);

    await page.goto(`${baseUrl}/?demo=reset&v=${smokeVersion}#/publications`, { timeout: waitTimeoutMs });
    await page.waitForSelector(".tabs-panel", { timeout: waitTimeoutMs });

    const initial = await pageState(page);
    assert(initial.routeTitle === "Публикации", "Publications route did not load in RU");
    assert(initial.pendingApprovals === 1, `Expected one pending topic approval, saw ${initial.pendingApprovals}`);
    assert(initial.staleP3DecisionCards === 0, "Stale p3 calendar item is asking for topic approval");
    await assertNoConsoleErrors(page);

    await clickUnique(page, '[data-action="approve-weekly-batch"]');
    await clickUnique(page, '[data-action="confirm-weekly-batch-approval"]');
    await page.waitForURL(`${baseUrl}/?demo=reset&v=${smokeVersion}#/content-pipeline`);
    await page.waitForSelector('[data-action="mark-manager-qa-passed"]', { timeout: waitTimeoutMs });
    await clickUnique(page, '[data-action="mark-manager-qa-passed"]');
    await page.waitForURL(`${baseUrl}/?demo=reset&v=${smokeVersion}#/publications`);
    await page.waitForSelector('[data-action="mark-calendar-exported"]');

    const afterQa = await pageState(page);
    assert(afterQa.qaEvidence, "Release queue does not show QA evidence 5/5");
    assert(afterQa.releaseQueueActions === 1, `Expected one release queue action, saw ${afterQa.releaseQueueActions}`);
    assert(afterQa.pendingApprovals === 0, "Topic approvals should be clear after weekly batch approval");

    await clickUnique(page, '[data-action="mark-calendar-exported"]');
    const afterExport = await pageState(page);
    assert(afterExport.resultConfirmActions >= 1, "Result confirmation action is missing after live-check handoff");

    await confirmPublicationResult(page);
    await page.waitForURL(`${baseUrl}/?demo=reset&v=${smokeVersion}#/analytics`);
    await page.waitForSelector(".results-desk-layout");
    await page.goto(`${baseUrl}/?v=${smokeVersion}#/publications`);
    await page.waitForSelector(".tabs-panel");
    const afterPublish = await pageState(page);
    assert(afterPublish.releaseQueueActions === 0, "Release queue should be empty after result confirmation");
    assert(afterPublish.hasOpenResults, "Next action should open Results after confirmation");
    assert(Number(afterPublish.publishedCount || 0) >= 2 || afterPublish.storedPublishedCount >= 1, `Published count did not increment: ${afterPublish.publishedCount}`);
    await page.goto(`${baseUrl}/?v=${smokeVersion}#/analytics`);
    await page.waitForSelector("#screenRoot");
    const analyticsState = await pageState(page);
    assert(analyticsState.hasPublicationResults, "Results screen should show publication results");
    assert(analyticsState.publicationResultStepActions >= 3, "Publication result next-step actions are missing");
    assert(
      analyticsState.publicationResultCanonicalActions === analyticsState.publicationResultStepActions,
      "Publication result next-step actions should use publication_result ids"
    );
    assert(analyticsState.hasPublicationResultUrl, "Publication result URL is missing from Results");
    assert(analyticsState.hasPublicationResultReactions, "Publication result reactions are missing from Results");
    await page.locator('[data-action="set-publication-result-step"]').filter({ hasText: /Расширить|Expand/ }).first().click();
    await page.waitForURL(`${baseUrl}/?v=${smokeVersion}#/content-pipeline`);
    const afterExpand = await pageState(page);
    assert(afterExpand.hasExpandMaterial, "Expand next step should create an article_outline content item");
    await page.goto(`${baseUrl}/?v=${smokeVersion}#/analytics`);
    await page.waitForSelector("#screenRoot");
    await page.locator('[data-action="set-publication-result-step"]').filter({ hasText: /Update|Обновить/ }).first().click();
    await page.waitForURL(`${baseUrl}/?v=${smokeVersion}#/overview`);
    const afterUpdate = await pageState(page);
    assert(afterUpdate.hasUpdateTask, "Update next step should create a publication update task");

    await page.goto(`${baseUrl}/?demo=reset&v=${smokeVersion}-persist#/publications`);
    await page.waitForSelector(".tabs-panel");
    await page.evaluate((version) => history.replaceState(null, "", `/?v=${version}-persist#/publications`), smokeVersion);
    await clickUnique(page, '[data-action="approve-weekly-batch"]');
    await clickUnique(page, '[data-action="confirm-weekly-batch-approval"]');
    await page.waitForURL(`${baseUrl}/?v=${smokeVersion}-persist#/content-pipeline`);
    await page.reload();
    await page.waitForSelector('[data-action="mark-manager-qa-passed"]');
    await clickUnique(page, '[data-action="mark-manager-qa-passed"]');
    await page.waitForURL(`${baseUrl}/?v=${smokeVersion}-persist#/publications`);
    await page.waitForSelector('[data-action="mark-calendar-exported"]');
    await clickUnique(page, '[data-action="mark-calendar-exported"]');
    await confirmPublicationResult(page);
    await page.waitForURL(`${baseUrl}/?v=${smokeVersion}-persist#/analytics`);
    await page.reload();
    await page.waitForSelector("#screenRoot");
    const afterResultReload = await pageState(page);
    assert(afterResultReload.hasPublicationResults, "Reload lost the publication result");
    await page.goto(`${baseUrl}/?v=${smokeVersion}-persist#/publications`);
    await page.waitForSelector(".tabs-panel");
    const afterReload = await pageState(page);
    assert(afterReload.pendingApprovals === 0, "Reload restored a pending topic approval");
    assert(afterReload.staleP3DecisionCards === 0, "Reload restored stale p3 decision card");
    assert(afterReload.hasOpenResults, "Reload lost the completed result state");
    await assertNoConsoleErrors(page);

    await assertResponsiveShell(page);

    console.log("Dashboard smoke passed");
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  if (server) server.kill("SIGTERM");
}
