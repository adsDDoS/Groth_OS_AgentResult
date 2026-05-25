import type { FastifyInstance } from "fastify";
import { createAgentTask } from "../agents/runner.js";

export async function geoRoutes(app: FastifyInstance) {
  app.post("/geo/generate-ai-answer-blocks", async (request) => ({
    data: await createAgentTask({
      tenantId: request.tenantId,
      role: "geo_ai_search",
      taskType: "generate_ai_answer_blocks",
      payload: request.body as Record<string, unknown>,
      createdBy: request.userId
    })
  }));

  app.post("/geo/generate-llms-txt", async (request) => ({
    data: await createAgentTask({
      tenantId: request.tenantId,
      role: "geo_ai_search",
      taskType: "generate_llms_txt",
      payload: request.body as Record<string, unknown>,
      createdBy: request.userId
    })
  }));

  app.post("/geo/entity-page-brief", async (request) => ({
    data: await createAgentTask({
      tenantId: request.tenantId,
      role: "geo_ai_search",
      taskType: "entity_page_brief",
      payload: request.body as Record<string, unknown>,
      createdBy: request.userId
    })
  }));
}
