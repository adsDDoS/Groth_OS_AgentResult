import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT ?? 3341);
const tempDir = mkdtempSync(join(tmpdir(), "agentresult-telegram-regression-"));
const dataFile = join(tempDir, "local-data.json");
let server;
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

async function request(path, body) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload.data;
}

async function waitForBackend() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 150));
  }
  throw new Error("Backend did not start for Telegram regression");
}

function expectIncludes(value, fragment, label) {
  if (!String(value).includes(fragment)) {
    throw new Error(`${label}: expected text to include "${fragment}", got:\n${value}`);
  }
}

function expectEquals(value, expected, label) {
  if (value !== expected) {
    throw new Error(`${label}: expected "${expected}", got "${value}"`);
  }
}

async function createMaterial(title, bodyMd) {
  return request("/telegram/materials", {
    title,
    bodyMd,
    channel: "telegram",
    contentType: "telegram_post"
  });
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

  await waitForBackend();

  await createMaterial(
    "Второй тестовый материал",
    "Текст второго тестового материала для проверки выбора по номеру в Telegram owner-control."
  );
  await createMaterial(
    "Контроль выпуска материалов",
    "Тестовый материал про контроль выпуска материалов. Он нужен для проверки выбора по теме."
  );

  const ready = await request("/telegram/intent", { text: "что готово" });
  expectIncludes(ready.text, "Контроль выпуска материалов", "ready list");
  expectIncludes(ready.text, "Второй тестовый материал", "ready list");

  const first = await request("/telegram/intent", { text: "покажи первый" });
  expectIncludes(first.text, "контроль выпуска материалов", "show first");
  expectEquals(first.buttons?.[0]?.targetId, ready.ownerBrief.decisions[0].id, "show first target");

  const byTopic = await request("/telegram/intent", { text: "покажи про контроль выпуска" });
  expectIncludes(byTopic.text, "контроль выпуска материалов", "show by topic");
  expectEquals(byTopic.buttons?.[0]?.targetId, ready.ownerBrief.decisions[0].id, "show by topic target");

  const notFound = await request("/telegram/intent", { text: "покажи про несуществующий материал" });
  expectEquals(notFound.intent, "show_material_not_found", "unknown material intent");

  const changes = await request("/telegram/intent", { text: "нужны правки по второму" });
  expectIncludes(changes.text, "нужны правки", "request changes by ordinal");
  if (changes.ownerBrief.decisions.some((decision) => decision.contentTitle === "Второй тестовый материал")) {
    throw new Error("request changes by ordinal did not remove the second material from pending decisions");
  }

  const approved = await request("/telegram/intent", { text: "согласую контроль выпуска" });
  expectIncludes(approved.text, "согласовано", "approve by topic");
  if (approved.ownerBrief.decisions.some((decision) => decision.contentTitle === "Контроль выпуска материалов")) {
    throw new Error("approve by topic did not remove the selected material from pending decisions");
  }

  const published = await request("/telegram/intent", { text: "что вышло" });
  expectEquals(published.intent, "published_status", "published status intent");

  console.log("Telegram owner-control regression passed");
}

main().catch((error) => {
  console.error(error.message);
  if (serverStderr.trim()) console.error(serverStderr.trim());
  process.exitCode = 1;
}).finally(() => {
  if (server && !server.killed) server.kill("SIGTERM");
  rmSync(tempDir, { force: true, recursive: true });
});
