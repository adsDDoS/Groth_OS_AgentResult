import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const routes = readFileSync(resolve(root, "apps/backend/src/modules/telegram/routes.ts"), "utf8");
const smoke = readFileSync(resolve(root, "scripts/smoke-telegram-publication-result-vps.sh"), "utf8");
const deployment = readFileSync(resolve(root, "docs/deployment.md"), "utf8");

function assertIncludes(source, fragment, label) {
  if (!source.includes(fragment)) {
    throw new Error(`${label}: missing ${fragment}`);
  }
}

assertIncludes(routes, "function startTelegramOwnerControlPolling", "telegram routes");
assertIncludes(routes, "deleteWebhook", "telegram routes");
assertIncludes(routes, "drop_pending_updates: false", "telegram routes");
assertIncludes(routes, "ensureTelegramOwnerControlPollingMode(app)", "telegram routes");
assertIncludes(routes, "getUpdates", "telegram routes");
assertIncludes(smoke, "getWebhookInfo", "production smoke");
assertIncludes(smoke, "webhook empty ok", "production smoke");
assertIncludes(deployment, "Telegram webhook URL is empty", "deployment docs");
assertIncludes(deployment, "owner-control bot token must stay polling-only", "deployment docs");

console.log("telegram polling invariant ok");
