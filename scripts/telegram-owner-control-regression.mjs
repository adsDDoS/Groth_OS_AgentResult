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

async function get(path) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`);
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

function expectNoCommandUx(result, label) {
  const text = String(result.text ?? "");
  const forbidden = ["/post", "/osapprove", "/changes", "/handoff", "/published"];
  const leaked = forbidden.find((fragment) => text.includes(fragment));
  if (leaked) {
    throw new Error(`${label}: leaked command UX "${leaked}" in text:\n${text}`);
  }

  const buttonLabels = (result.buttons ?? []).map((button) => String(button.label ?? ""));
  const slashLabel = buttonLabels.find((item) => item.includes("/"));
  if (slashLabel) {
    throw new Error(`${label}: leaked slash command in button label "${slashLabel}"`);
  }
}

function expectNoOwnerNoise(result, label) {
  const text = String(result.text ?? "");
  const forbidden = [
    "💻",
    "terminal:",
    "tool:",
    "skill_view",
    "Approved permanently",
    "curl ",
    "DEBUG",
    "stack trace",
    "Деньги: 0"
  ];
  const leaked = forbidden.find((fragment) => text.includes(fragment));
  if (leaked) {
    throw new Error(`${label}: leaked implementation noise "${leaked}" in text:\n${text}`);
  }
}

function expectButtonLabels(result, expectedLabels, label) {
  const labels = (result.buttons ?? []).map((button) => button.label);
  const missing = expectedLabels.filter((expected) => !labels.includes(expected));
  if (missing.length) {
    throw new Error(`${label}: expected buttons ${expectedLabels.join(", ")}, got ${labels.join(", ") || "none"}`);
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

async function calendarStatusCounts() {
  const rows = await get("/publishing/calendar");
  return rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});
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

  const onboardingStart = await request("/telegram/commands", { command: "/onboarding" });
  expectIncludes(onboardingStart.text, "Шаг 1/7", "onboarding start");
  expectNoCommandUx(onboardingStart, "onboarding start");

  const onboardingClient = await request("/telegram/intent", {
    text: "AgentResult Growth Control для B2B-компаний: регулярный выпуск материалов через согласование собственника"
  });
  expectIncludes(onboardingClient.text, "Шаг 2/7", "onboarding client step");
  expectNoCommandUx(onboardingClient, "onboarding client step");

  const onboardingChannel = await request("/telegram/intent", {
    text: "Собственники B2B-компаний, которым нужен контроль выпуска и результата"
  });
  expectIncludes(onboardingChannel.text, "Шаг 3/7", "onboarding channel step");

  const onboardingReleaseOwner = await request("/telegram/intent", { text: "Telegram и сайт" });
  expectIncludes(onboardingReleaseOwner.text, "Шаг 4/7", "onboarding release owner step");

  const onboardingFirstSignal = await request("/telegram/intent", { text: "Егор, собственник" });
  expectIncludes(onboardingFirstSignal.text, "Шаг 5/7", "onboarding first signal step");

  const onboardingRules = await request("/telegram/intent", { text: "Заявки формы, ответы в Telegram и ручная отметка собственника" });
  expectIncludes(onboardingRules.text, "Шаг 6/7", "onboarding approval rules step");

  const onboardingFirstMaterial = await request("/telegram/intent", { text: "Публичные утверждения и выпуск от имени компании" });
  expectIncludes(onboardingFirstMaterial.text, "Шаг 7/7", "onboarding first material step");

  const onboardingComplete = await request("/telegram/intent", { text: "Пост про контроль выпуска без автопубликации" });
  expectEquals(onboardingComplete.intent, "onboarding_complete", "onboarding complete intent");
  expectIncludes(onboardingComplete.text, "Ответственный за выпуск: Егор, собственник", "onboarding release owner summary");
  expectIncludes(onboardingComplete.text, "Первый сигнал: Заявки формы, ответы в Telegram", "onboarding first signal summary");
  expectNoCommandUx(onboardingComplete, "onboarding complete");
  if (!onboardingComplete.hermesJob?.taskId) {
    throw new Error("onboarding did not create the first material task");
  }

  const offer = await get("/offer");
  expectEquals(offer.profile.releaseOwner, "Егор, собственник", "company release owner");
  expectEquals(offer.profile.firstSignalSource, "Заявки формы, ответы в Telegram и ручная отметка собственника", "company first signal source");
  expectEquals(offer.profile.onboarding.firstMaterial, "Пост про контроль выпуска без автопубликации", "company onboarding first material");

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
  expectNoCommandUx(ready, "ready list");
  expectButtonLabels(ready, ["Материал", "Согласовать", "Правки"], "ready buttons");

  const first = await request("/telegram/intent", { text: "покажи первый" });
  expectIncludes(first.text, "контроль выпуска материалов", "show first");
  expectNoCommandUx(first, "show first");
  expectButtonLabels(first, ["Согласовать", "Правки"], "show first buttons");
  expectEquals(first.buttons?.[0]?.targetId, ready.ownerBrief.decisions[0].id, "show first target");

  const byTopic = await request("/telegram/intent", { text: "покажи про контроль выпуска" });
  expectIncludes(byTopic.text, "контроль выпуска материалов", "show by topic");
  expectNoCommandUx(byTopic, "show by topic");
  expectEquals(byTopic.buttons?.[0]?.targetId, ready.ownerBrief.decisions[0].id, "show by topic target");

  const notFound = await request("/telegram/intent", { text: "покажи про несуществующий материал" });
  expectEquals(notFound.intent, "show_material_not_found", "unknown material intent");
  expectNoCommandUx(notFound, "unknown material intent");

  const changes = await request("/telegram/intent", { text: "нужны правки по второму" });
  expectIncludes(changes.text, "нужны правки", "request changes by ordinal");
  expectIncludes(changes.text, "вернётся в работу", "request changes next action");
  expectNoCommandUx(changes, "request changes by ordinal");
  if (changes.ownerBrief.decisions.some((decision) => decision.contentTitle === "Второй тестовый материал")) {
    throw new Error("request changes by ordinal did not remove the second material from pending decisions");
  }

  const approved = await request("/telegram/intent", { text: "согласую контроль выпуска" });
  expectIncludes(approved.text, "согласовано", "approve by topic");
  expectIncludes(approved.text, "передать материал в выпуск", "approve next action");
  expectNoCommandUx(approved, "approve by topic");
  expectNoOwnerNoise(approved, "approve by topic");
  if (approved.ownerBrief.decisions.some((decision) => decision.contentTitle === "Контроль выпуска материалов")) {
    throw new Error("approve by topic did not remove the selected material from pending decisions");
  }

  const handoff = await request("/telegram/intent", { text: "передал в выпуск" });
  expectEquals(handoff.intent, "manual_handoff", "manual handoff intent");
  expectIncludes(handoff.text, "Передано в выпуск вручную.", "manual handoff");
  expectIncludes(handoff.text, "подтвердить", "manual handoff next action");
  expectNoCommandUx(handoff, "manual handoff");
  expectNoOwnerNoise(handoff, "manual handoff");
  expectEquals(handoff.ownerBrief.counts.handedOff, 1, "owner brief handed off count");

  const handoffCounts = await calendarStatusCounts();
  expectEquals(handoffCounts.handed_off, 1, "calendar handed_off count");
  const publishedBeforeConfirm = handoffCounts.published ?? 0;

  const resultAfterHandoff = await request("/telegram/intent", { text: "что по результату" });
  expectEquals(resultAfterHandoff.intent, "result", "result after handoff intent");
  expectIncludes(resultAfterHandoff.text, "Передано вручную: 1", "result after handoff");
  expectIncludes(resultAfterHandoff.text, "Следующий шаг: подтвердить выход", "result after handoff next action");
  expectNoCommandUx(resultAfterHandoff, "result after handoff");
  expectNoOwnerNoise(resultAfterHandoff, "result after handoff");

  const confirmed = await request("/telegram/intent", { text: "вышло" });
  expectEquals(confirmed.intent, "confirm_published", "confirm published intent");
  expectIncludes(confirmed.text, "Выход подтверждён", "confirm published");
  expectNoCommandUx(confirmed, "confirm published");
  expectNoOwnerNoise(confirmed, "confirm published");
  expectEquals(confirmed.ownerBrief.counts.handedOff, 0, "owner brief handed off after publish");
  expectEquals(confirmed.ownerBrief.counts.published, publishedBeforeConfirm + 1, "owner brief published after publish");

  const publishedCounts = await calendarStatusCounts();
  expectEquals(publishedCounts.handed_off ?? 0, 0, "calendar handed_off after publish");
  expectEquals(publishedCounts.published, publishedBeforeConfirm + 1, "calendar published count");

  const resultAfterPublished = await request("/telegram/intent", { text: "что по результату" });
  expectEquals(resultAfterPublished.intent, "result", "result after published intent");
  expectIncludes(resultAfterPublished.text, `Вышло: ${publishedBeforeConfirm + 1}`, "result after published");
  expectNoCommandUx(resultAfterPublished, "result after published");
  expectNoOwnerNoise(resultAfterPublished, "result after published");

  const nextTopic = await request("/telegram/intent", { text: "поставь следующую тему в работу про контроль результата" });
  expectEquals(nextTopic.intent, "prepare_next_material", "prepare next material intent");
  expectIncludes(nextTopic.text, "Задача поставлена в работу.", "prepare next material");
  expectIncludes(nextTopic.text, "контроль результата", "prepare next material topic");
  expectNoCommandUx(nextTopic, "prepare next material");

  const nextBrief = await request("/telegram/intent", { text: "что дальше" });
  expectIncludes(nextBrief.text, "Готовится", "brief preparing block");
  expectNoCommandUx(nextBrief, "brief after prepare");

  const published = await request("/telegram/intent", { text: "что вышло" });
  expectEquals(published.intent, "published_status", "published status intent");
  expectIncludes(published.text, "Последний опубликованный материал", "published status card");
  expectButtonLabels(published, ["Переиспользовать", "Расширить", "Обновить"], "published status next-step buttons");
  expectNoCommandUx(published, "published status");

  const publicationResultId = published.ownerBrief.publishedResults?.[0]?.id;
  if (!publicationResultId) throw new Error("published status should include a publication result id");
  const contentBeforeReuse = await get("/content/items");
  const reuse = await request("/telegram/commands", { command: "/reuse", targetId: publicationResultId });
  expectIncludes(reuse.text, "переиспользовать материал", "publication result reuse");
  expectNoCommandUx(reuse, "publication result reuse");
  const contentAfterReuse = await get("/content/items");
  expectEquals(contentAfterReuse.length, contentBeforeReuse.length + 1, "reuse should create content item");

  const expand = await request("/telegram/intent", { text: "расширь опубликованный материал в статью" });
  expectEquals(expand.intent, "publication_result_expand", "publication result expand intent");
  expectIncludes(expand.text, "расширить материал", "publication result expand");
  const contentAfterExpand = await get("/content/items");
  const outline = contentAfterExpand.find((item) => item.content_type === "article_outline" && item.metadata?.source_publication_result === true);
  if (!outline) throw new Error("expand should create article_outline content item");

  const update = await request("/telegram/commands", { command: "/update", targetId: publicationResultId });
  expectIncludes(update.text, "обновить опубликованный материал", "publication result update");
  const tasks = await get("/tasks");
  const updateTask = tasks.find((task) => task.task_type === "publication_result_update" && task.payload?.publicationResultId === publicationResultId);
  if (!updateTask) throw new Error("update should create publication_result_update task");

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
