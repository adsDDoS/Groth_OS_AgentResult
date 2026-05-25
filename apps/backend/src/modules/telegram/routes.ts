import type { FastifyInstance } from "fastify";
import { config } from "../../config.js";
import { query } from "../../db/client.js";

export async function telegramRoutes(app: FastifyInstance) {
  app.post("/telegram/webhook", async (request, reply) => {
    const secret = request.headers["x-telegram-bot-api-secret-token"];
    if (config.telegramWebhookSecret && secret !== config.telegramWebhookSecret) {
      return reply.status(401).send({ error: "invalid webhook secret" });
    }

    await query(
      `insert into integrations (tenant_id, provider, status, config)
       values ($1, 'telegram_webhook_event', 'received', $2)`,
      [request.tenantId, request.body ?? {}]
    );

    return { ok: true };
  });
}
