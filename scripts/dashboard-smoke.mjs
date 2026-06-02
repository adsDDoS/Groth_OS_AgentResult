#!/usr/bin/env node

import { spawn } from "node:child_process";

const port = Number(process.env.DASHBOARD_SMOKE_PORT || 4173);
const baseUrl = process.env.DASHBOARD_SMOKE_URL || `http://127.0.0.1:${port}`;
const shouldStartServer = !process.env.DASHBOARD_SMOKE_URL;

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright is not installed. Run: npm i -D playwright");
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function includesAny(value, variants) {
  const normalized = String(value).toLocaleLowerCase();
  return variants.some((variant) => normalized.includes(String(variant).toLocaleLowerCase()));
}

async function getPageText(page) {
  return page.locator("body").innerText();
}

async function metricValue(page, label) {
  return page.locator(".metric-panel", { hasText: label }).locator("strong").first().innerText();
}

async function run() {
  await waitForDashboard();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  try {
    await page.goto(`${baseUrl}/?demo=reset&v=smoke#/overview`);
    await page.waitForSelector("#screenRoot");

    assert(await page.locator("#sectionTitle").innerText() === "Сегодня", "Today route did not load in RU");
    assert((await page.locator(".result-path-step").count()) === 4, "Today result chain should have 4 steps");
    assert(!(await getPageText(page)).includes("КонтрольКонтроль"), "Today has duplicated control copy");

    await page.goto(`${baseUrl}/?v=smoke#/growth-plan`);
    await page.waitForSelector(".plan-brief");
    await page.locator(".plan-brief").filter({ hasText: /Приоритет недели|Weekly priority/ }).waitFor();
    await page.locator(".growth-queue-row").nth(2).waitFor();
    const growthText = await page.locator(".plan-brief").innerText();
    const fullGrowthText = await getPageText(page);
    assert(includesAny(await page.locator("#sectionTitle").innerText(), ["Стратегия", "Strategy"]), "Strategy title is wrong");
    assert(includesAny(growthText, ["Приоритет недели", "Weekly priority"]), `Strategy must show weekly priority. Saw: ${growthText}`);
    assert(!includesAny(fullGrowthText, ["Фильтр решений", "Decision filter"]), "Old decision filter is visible");
    assert(!includesAny(fullGrowthText, ["Скорость", "Speed"]), "Old speed tile is visible");
    assert((await page.locator(".growth-queue-row").count()) === 3, "Strategy should show 3 queue rows");
    assert((await page.locator("#routeActions .button").count()) === 0, "Strategy top actions should be empty");

    await page.goto(`${baseUrl}/?v=smoke#/offer-brain`);
    await page.waitForSelector(".company-launch-panel");
    assert(includesAny(await page.locator("#sectionTitle").innerText(), ["Компания", "Company"]), "Company title is wrong");
    assert(includesAny(await page.locator("#routeActions .button").innerText(), ["Сохранить", "Save"]), "Company save action is not localized");
    assert(!(await page.locator(".company-advanced").evaluate((node) => node.open)), "Additional context should be collapsed");

    await page.locator('[data-lang="en"]').click();
    assert(await page.locator("#sectionTitle").innerText() === "Company", "ENG switch failed on Company");
    await page.locator('[data-lang="ru"]').click();
    assert(await page.locator("#sectionTitle").innerText() === "Компания", "RU switch failed on Company");

    await page.goto(`${baseUrl}/?v=smoke#/publications`);
    await page.waitForSelector(".tabs-panel");
    await page.locator('[data-action="set-publication-tab"][data-id="pack"]').click();
    await page.locator('[data-action="preview-pack-item"][data-id="telegram"]').click();
    await page.locator('[data-action="mark-pack-handoff"][data-id="telegram"]').click();
    await page.waitForSelector('[data-action="mark-calendar-published"]');
    assert((await page.locator('[data-action="mark-calendar-published"]').count()) > 0, "Manual handoff confirm action is missing");

    await page.goto(`${baseUrl}/?v=smoke#/analytics`);
    await page.waitForSelector(".metric-panel");
    assert(includesAny(await getPageText(page), ["Передано вручную", "Manual handoff"]), "Results should show manual handoff metric");
    assert((await metricValue(page, "Передано вручную").catch(() => metricValue(page, "Manual handoff"))) === "1", "Manual handoff count should be 1");

    await page.goto(`${baseUrl}/?v=smoke#/publications`);
    await page.waitForSelector(".tabs-panel");
    await page.locator('[data-action="set-publication-tab"][data-id="calendar"]').click();
    await page.locator('[data-action="mark-calendar-published"]').first().click();
    await page.waitForTimeout(300);
    await page.goto(`${baseUrl}/?v=smoke#/analytics`);
    await page.waitForSelector(".metric-panel");
    assert((await metricValue(page, "Передано вручную").catch(() => metricValue(page, "Manual handoff"))) === "0", "Manual handoff count should return to 0 after confirmation");

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
