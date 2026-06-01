import { spawn } from "node:child_process";
import { existsSync, mkdirSync, renameSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const runtimeDir = resolve(root, "apps/backend/.runtime");
const backendPort = Number(process.env.PORT ?? 3000);
const dashboardPort = Number(process.env.DASHBOARD_PORT ?? 4173);
const localDataPath = process.env.AI_GROWTH_OS_LOCAL_DATA_PATH ?? resolve(runtimeDir, "agentresult.local-data.json");
const resetDemoState = process.argv.includes("--reset-demo") || process.env.AGENTRESULT_RESET_DEMO === "1";

mkdirSync(runtimeDir, { recursive: true });
if (resetDemoState && existsSync(localDataPath)) {
  renameSync(localDataPath, `${localDataPath}.${Date.now()}.bak`);
}

await run("npm", ["run", "backend:bundle"]);

const children = [];
const backend = start("node", ["apps/backend/.runtime/backend.cjs"], {
  AI_GROWTH_OS_STORAGE: "local",
  AI_GROWTH_OS_LOCAL_DATA_PATH: localDataPath,
  HOST: "127.0.0.1",
  PORT: String(backendPort)
});
children.push(backend);

await waitForUrl(`http://127.0.0.1:${backendPort}/health`, "backend");

const dashboard = start("python3", ["-m", "http.server", String(dashboardPort), "-d", "apps/dashboard", "--bind", "127.0.0.1"]);
children.push(dashboard);

await waitForUrl(`http://127.0.0.1:${dashboardPort}`, "dashboard");

console.log("");
console.log("AgentResult local workspace is running.");
console.log(`Dashboard: http://127.0.0.1:${dashboardPort}`);
console.log(`Backend:   http://127.0.0.1:${backendPort}`);
console.log(`Local data: ${localDataPath}`);
console.log("");
console.log("Press Ctrl+C to stop both services.");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => shutdown(signal));
}

function start(command, args, env = {}) {
  const child = spawn(command, args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: "inherit"
  });

  child.on("exit", (code, signal) => {
    if (code !== 0 && signal === null) {
      console.error(`${command} exited with code ${code}`);
      shutdown("child-exit");
    }
  });

  return child;
}

function run(command, args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: root,
      env: process.env,
      stdio: "inherit"
    });

    child.on("exit", (code) => {
      if (code === 0) resolveRun();
      else rejectRun(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function waitForUrl(url, label) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 15000) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Service is still starting.
    }
    await sleep(350);
  }
  throw new Error(`Timed out waiting for ${label} at ${url}`);
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function shutdown(reason) {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  if (reason !== "SIGINT") {
    console.log(`Stopped local workspace: ${reason}`);
  }
  process.exit(0);
}
