import "dotenv/config";

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST ?? "0.0.0.0",
  port: Number(process.env.PORT ?? 3000),
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
