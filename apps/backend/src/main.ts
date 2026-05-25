import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import fastify from "fastify";
import { config } from "./config.js";
import { authPlugin } from "./modules/auth/plugin.js";
import { registerRoutes } from "./routes.js";

const app = fastify({
  logger: true
});

await app.register(helmet);
await app.register(cors, { origin: true });
await app.register(authPlugin);
await registerRoutes(app);

app.setErrorHandler((error, _request, reply) => {
  const normalizedError = error instanceof Error ? error : new Error("Unknown error");
  const statusCode = Number((normalizedError as { statusCode?: number }).statusCode ?? 500);
  app.log.error(normalizedError);
  reply.status(statusCode).send({
    error: normalizedError.name,
    message: normalizedError.message,
    code: (normalizedError as { code?: string }).code
  });
});

await app.listen({ host: config.host, port: config.port });
