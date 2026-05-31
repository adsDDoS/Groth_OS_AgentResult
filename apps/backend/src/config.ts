import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

for (const candidate of [resolve(process.cwd(), ".env"), resolve(process.cwd(), "../../.env")]) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: false });
  }
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
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET ?? "",
  telegramApprovalChatId: process.env.TELEGRAM_APPROVAL_CHAT_ID ?? ""
};
