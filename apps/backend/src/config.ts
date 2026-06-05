import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

for (const candidate of [resolve(process.cwd(), ".env"), resolve(process.cwd(), "../../.env")]) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: false });
  }
}

function booleanEnv(value: string | undefined, fallback = false) {
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST ?? "0.0.0.0",
  port: Number(process.env.PORT ?? 3000),
  storageMode: process.env.AI_GROWTH_OS_STORAGE ?? "auto",
  databaseUrl: process.env.DATABASE_URL ?? "postgres://ai_growth_os:ai_growth_os@localhost:5432/ai_growth_os",
  jwtSecret: process.env.JWT_SECRET ?? "dev-only-change-me",
  modelProvider: process.env.MODEL_PROVIDER ?? "openrouter",
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openRouterModel: process.env.OPENROUTER_MODEL ?? "anthropic/claude-3.5-sonnet",
  hermesBaseUrl: process.env.HERMES_BASE_URL ?? "http://localhost:8080",
  hermesApiKey: process.env.HERMES_API_KEY ?? "",
  hermesModel: process.env.HERMES_MODEL ?? "hermes-agent",
  hermesRequestTimeoutMs: Number(process.env.HERMES_REQUEST_TIMEOUT_MS ?? 180000),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? process.env.HERMES_TELEGRAM_BOT_TOKEN ?? "",
  telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET ?? "",
  telegramApprovalChatId: process.env.TELEGRAM_APPROVAL_CHAT_ID ?? "",
  telegramAllowedUsers: process.env.TELEGRAM_ALLOWED_USERS ?? process.env.HERMES_TELEGRAM_ALLOWED_USERS ?? "",
  telegramOwnerControlPolling: booleanEnv(process.env.AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING),
  telegramOwnerControlPollIntervalMs: Number(process.env.AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLL_INTERVAL_MS ?? 1500),
  telegramOwnerControlTenantId: process.env.AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_TENANT_ID ?? "00000000-0000-0000-0000-000000000001",
  telegramOwnerControlUserId: process.env.AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_USER_ID ?? "77777777-7777-4777-8777-777777777771"
};
