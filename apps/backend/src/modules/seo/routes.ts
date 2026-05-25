import type { FastifyInstance } from "fastify";
import { createAgentTask } from "../agents/runner.js";

export async function seoRoutes(app: FastifyInstance) {
  app.post("/seo/analyze-page", async (request) => ({
    data: await createAgentTask({
      tenantId: request.tenantId,
      role: "seo_research",
      taskType: "analyze_page",
      payload: request.body as Record<string, unknown>,
      createdBy: request.userId
    })
  }));

  app.post("/seo/generate-brief", async (request) => ({
    data: await createAgentTask({
      tenantId: request.tenantId,
      role: "page_brief",
      taskType: "generate_seo_brief",
      payload: request.body as Record<string, unknown>,
      createdBy: request.userId
    })
  }));

  app.post("/seo/internal-links", async (request) => ({
    data: await createAgentTask({
      tenantId: request.tenantId,
      role: "seo_research",
      taskType: "suggest_internal_links",
      payload: request.body as Record<string, unknown>,
      createdBy: request.userId
    })
  }));
}
