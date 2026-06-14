#!/usr/bin/env node

import { spawn } from "node:child_process";

const port = Number(process.env.DASHBOARD_SMOKE_PORT || 4173);
const baseUrl = process.env.DASHBOARD_SMOKE_URL || `http://127.0.0.1:${port}`;
const shouldStartServer = !process.env.DASHBOARD_SMOKE_URL;

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
    if (server?.exitCode !== null) {
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
      await page.goto(`${baseUrl}/?v=smoke-responsive#/${route}`);
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

async function run() {
  await waitForDashboard();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
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
    await page.goto(`${baseUrl}/?demo=reset&v=smoke#/publications`);
    await page.waitForSelector(".tabs-panel");

    const initial = await pageState(page);
    assert(initial.routeTitle === "Публикации", "Publications route did not load in RU");
    assert(initial.pendingApprovals === 1, `Expected one pending topic approval, saw ${initial.pendingApprovals}`);
    assert(initial.staleP3DecisionCards === 0, "Stale p3 calendar item is asking for topic approval");
    await assertNoConsoleErrors(page);

    await clickUnique(page, '[data-action="approve-weekly-batch"]');
    await clickUnique(page, '[data-action="confirm-weekly-batch-approval"]');
    await page.waitForURL(`${baseUrl}/?demo=reset&v=smoke#/content-pipeline`);
    await clickUnique(page, '[data-action="mark-manager-qa-passed"]');
    await page.waitForURL(`${baseUrl}/?demo=reset&v=smoke#/publications`);
    await page.waitForSelector('[data-action="mark-calendar-exported"]');

    const afterQa = await pageState(page);
    assert(afterQa.qaEvidence, "Release queue does not show QA evidence 5/5");
    assert(afterQa.releaseQueueActions === 1, `Expected one release queue action, saw ${afterQa.releaseQueueActions}`);
    assert(afterQa.pendingApprovals === 0, "Topic approvals should be clear after weekly batch approval");

    await clickUnique(page, '[data-action="mark-calendar-exported"]');
    const afterExport = await pageState(page);
    assert(afterExport.resultConfirmActions >= 1, "Result confirmation action is missing after live-check handoff");

    await page.locator('[data-action="mark-calendar-published"]').first().click();
    const afterPublish = await pageState(page);
    assert(afterPublish.releaseQueueActions === 0, "Release queue should be empty after result confirmation");
    assert(afterPublish.hasOpenResults, "Next action should open Results after confirmation");
    assert(Number(afterPublish.publishedCount) >= 2, `Published count did not increment: ${afterPublish.publishedCount}`);

    await page.goto(`${baseUrl}/?demo=reset&v=smoke-persist#/publications`);
    await page.waitForSelector(".tabs-panel");
    await page.evaluate(() => history.replaceState(null, "", "/?v=smoke-persist#/publications"));
    await clickUnique(page, '[data-action="approve-weekly-batch"]');
    await clickUnique(page, '[data-action="confirm-weekly-batch-approval"]');
    await page.waitForURL(`${baseUrl}/?v=smoke-persist#/content-pipeline`);
    await page.reload();
    await page.waitForSelector('[data-action="mark-manager-qa-passed"]');
    await clickUnique(page, '[data-action="mark-manager-qa-passed"]');
    await page.waitForURL(`${baseUrl}/?v=smoke-persist#/publications`);
    await page.waitForSelector('[data-action="mark-calendar-exported"]');
    await clickUnique(page, '[data-action="mark-calendar-exported"]');
    await page.locator('[data-action="mark-calendar-published"]').first().click();
    await page.reload();
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
