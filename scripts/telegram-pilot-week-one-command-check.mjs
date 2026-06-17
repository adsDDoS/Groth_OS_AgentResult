#!/usr/bin/env node

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT ?? 3342);
const tempDir = mkdtempSync(join(tmpdir(), "agentresult-telegram-pilot-"));
const dataFile = join(tempDir, "local-data.json");
const tenantId = "00000000-0000-0000-0000-000000000001";
const otherTenantId = "00000000-0000-0000-0000-000000000002";
let server;
let serverStdout = "";
let serverStderr = "";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
    env: {
      ...process.env,
      ...(options.env ?? {})
    }
  });

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`${command} ${args.join(" ")} failed${output ? `\n${output}` : ""}`);
  }

  return result.stdout;
}

async function request(path, body, selectedTenantId = tenantId) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-tenant-id": selectedTenantId
    },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload.data;
}

async function get(path, selectedTenantId = tenantId) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    headers: { "x-tenant-id": selectedTenantId }
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload.data;
}

async function waitForBackend() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 150));
  }
  throw new Error("Backend did not start for Telegram pilot command check");
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

function expectIncludes(value, fragment, label) {
  if (!String(value).includes(fragment)) {
    throw new Error(`${label}: expected text to include "${fragment}", got:\n${value}`);
  }
}

async function assertPilotWorkspace(selectedTenantId, expectedTitle) {
  const content = await get("/content/items", selectedTenantId);
  const approvals = await get("/approvals", selectedTenantId);
  const calendar = await get("/publishing/calendar", selectedTenantId);
  const tasks = await get("/tasks", selectedTenantId);
  const audit = await get("/owner-action-audit", selectedTenantId);
  const offer = await get("/offer", selectedTenantId);

  const material = content.find((item) => item.title === expectedTitle);
  expect(material, `pilot material missing for ${selectedTenantId}`);
  expect(material.status === "review", `pilot material should be in review, saw ${material.status}`);
  expect(String(material.metadata?.brief || "").includes("topic boundary -> draft -> QA -> release -> URL -> next step"), "pilot brief missing canonical loop");
  expect(approvals.some((item) => item.target_id === material.id && item.status === "pending"), "pilot approval missing");
  expect(calendar.filter((item) => item.content_item_id === material.id).length >= 5, "pilot calendar board missing");
  expect(calendar.some((item) => String(item.title).startsWith("Day 7:") && item.content_item_id === material.id), "Day 7 review missing");
  expect(tasks.some((item) => item.task_type === "pilot_day_7_review" && item.target_id === material.id), "Day 7 review task missing");
  expect(audit.some((item) => item.action === "pilot.week_1.start" && item.target_id === material.id), "pilot audit event missing");
  expect(String(offer.profile?.forbiddenClaims || "").includes("No guaranteed leads"), "forbidden claims not persisted to profile");

  return material;
}

async function main() {
  if (process.env.SKIP_BACKEND_BUNDLE !== "1") {
    run("npm", ["run", "backend:bundle"], { stdio: "inherit" });
  }

  server = spawn("node", ["apps/backend/.runtime/backend.cjs"], {
    cwd: root,
    env: {
      ...process.env,
      AI_GROWTH_OS_STORAGE: "local",
      AI_GROWTH_OS_LOCAL_DATA_PATH: dataFile,
      HOST: "127.0.0.1",
      PORT: String(port),
      HERMES_API_KEY: "",
      HERMES_MODEL: "hermes-agent"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  server.stderr.on("data", (chunk) => {
    serverStderr += chunk.toString();
  });
  server.stdout.on("data", (chunk) => {
    serverStdout += chunk.toString();
  });

  await waitForBackend();

  const commandTitle = "Telegram pilot command material";
  const commandResult = await request("/telegram/commands", {
    command: "/pilot",
    note: [
      "icp: Founder-led B2B service team",
      "channel: telegram",
      `material: ${commandTitle}`,
      "approval owner: Founder",
      "release owner: Operator",
      "result owner: Operator",
      "result source: Telegram URL and reactions",
      "forbidden: No guaranteed leads, no guaranteed revenue"
    ].join("\n")
  });

  expectIncludes(commandResult.text, "Week-1 pilot запущен", "pilot command response");
  expectIncludes(commandResult.text, commandTitle, "pilot command response material");
  expect(commandResult.command === "pilot", `pilot command marker mismatch: ${commandResult.command}`);
  expect(commandResult.pilot?.content?.title === commandTitle, "pilot command did not return backend pilot content");
  expect(commandResult.ownerBrief?.counts?.decisions >= 1, "pilot command ownerBrief should include a pending decision");
  expect((commandResult.buttons || []).some((button) => button.command === "osapprove"), "pilot command should return approval button");
  await assertPilotWorkspace(tenantId, commandTitle);

  const intentTitle = "Intent pilot material";
  const intentResult = await request("/telegram/intent", {
    text: `запусти week-1 pilot\nматериал: ${intentTitle}\nканал: telegram\nответственный за выпуск: Operator`
  }, otherTenantId);

  expect(intentResult.intent === "pilot_week_1_start", `pilot intent mismatch: ${intentResult.intent}`);
  expectIncludes(intentResult.text, "Week-1 pilot запущен", "pilot intent response");
  expectIncludes(intentResult.text, intentTitle, "pilot intent response material");
  await assertPilotWorkspace(otherTenantId, intentTitle);

  const firstTenantContent = await get("/content/items", tenantId);
  expect(!firstTenantContent.some((item) => item.title === intentTitle), "pilot intent leaked across tenants");

  console.log("Telegram pilot week-1 command check passed");
}

main().catch((error) => {
  console.error(error.message);
  if (serverStdout.trim()) console.error(serverStdout.trim());
  if (serverStderr.trim()) console.error(serverStderr.trim());
  process.exitCode = 1;
}).finally(() => {
  if (server && !server.killed) server.kill("SIGTERM");
  rmSync(tempDir, { force: true, recursive: true });
});
