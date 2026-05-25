import type { FastifyInstance } from "fastify";
import { query } from "./db/client.js";
import { approvalsRoutes } from "./modules/approvals/routes.js";
import { registerCrudRoutes } from "./modules/common/routes.js";
import { contentRoutes } from "./modules/content/routes.js";
import { geoRoutes } from "./modules/geo/routes.js";
import { publishingRoutes } from "./modules/publishing/routes.js";
import { seoRoutes } from "./modules/seo/routes.js";
import { taskRoutes } from "./modules/tasks/routes.js";
import { telegramRoutes } from "./modules/telegram/routes.js";
import { createAgentTask } from "./modules/agents/runner.js";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok" }));

  app.get("/me", async (request) => ({
    data: {
      tenantId: request.tenantId,
      userId: request.userId ?? null
    }
  }));

  app.get("/tenants/current", async (request) => {
    const result = await query("select * from tenants where id = $1", [request.tenantId]);
    return { data: result.rows[0] ?? null };
  });

  registerCrudRoutes(app, { prefix: "/tenants", table: "tenants" });
  registerCrudRoutes(app, { prefix: "/users", table: "users", tenantScoped: true });

  app.get("/offer", async (request) => {
    const result = await query("select * from companies where tenant_id = $1 order by created_at asc limit 1", [request.tenantId]);
    return { data: result.rows[0] ?? null };
  });

  app.put("/offer", async (request) => {
    const existing = await query("select id from companies where tenant_id = $1 order by created_at asc limit 1", [request.tenantId]);
    const body = request.body as Record<string, unknown>;
    if (existing.rowCount) {
      const result = await query(
        `update companies set name = coalesce($2, name), profile = coalesce($3, profile), updated_at = now()
         where id = $1 returning *`,
        [existing.rows[0].id, body.name ?? null, body.profile ?? null]
      );
      return { data: result.rows[0] };
    }
    const result = await query("insert into companies (tenant_id, name, profile) values ($1, $2, $3) returning *", [
      request.tenantId,
      body.name ?? "New B2B Company",
      body.profile ?? {}
    ]);
    return { data: result.rows[0] };
  });

  registerCrudRoutes(app, { prefix: "/products", table: "products", tenantScoped: true });
  registerCrudRoutes(app, { prefix: "/icp", table: "icp_profiles", tenantScoped: true });
  registerCrudRoutes(app, { prefix: "/proof-points", table: "proof_points", tenantScoped: true });
  registerCrudRoutes(app, { prefix: "/competitors", table: "competitors", tenantScoped: true });

  app.get("/demand-map", async (request) => {
    const result = await query("select * from demand_map_items where tenant_id = $1 order by priority desc, created_at desc", [
      request.tenantId
    ]);
    return { data: result.rows };
  });

  app.post("/demand-map/generate", async (request) => ({
    data: await createAgentTask({
      tenantId: request.tenantId,
      role: "growth_orchestrator",
      taskType: "generate_demand_map",
      payload: request.body as Record<string, unknown>,
      createdBy: request.userId
    })
  }));

  registerCrudRoutes(app, {
    prefix: "/demand-map/items",
    table: "demand_map_items",
    tenantScoped: true,
    routes: { patch: "/demand-map/items/:id" }
  });

  await contentRoutes(app);
  await approvalsRoutes(app);
  await publishingRoutes(app);
  await seoRoutes(app);
  await geoRoutes(app);

  registerCrudRoutes(app, { prefix: "/lead-magnets", table: "lead_magnets", tenantScoped: true });
  app.post("/lead-magnets/:id/generate", async (request) => ({
    data: await createAgentTask({
      tenantId: request.tenantId,
      role: "lead_magnet",
      taskType: "generate_lead_magnet",
      targetType: "lead_magnet",
      targetId: (request.params as { id: string }).id,
      payload: request.body as Record<string, unknown>,
      createdBy: request.userId
    })
  }));

  app.get("/analytics/overview", async (request) => {
    const result = await query(
      `select
        (select count(*) from content_items where tenant_id = $1) as content_items,
        (select count(*) from publishing_calendar_items where tenant_id = $1) as calendar_items,
        (select count(*) from approvals where tenant_id = $1 and status = 'pending') as pending_approvals`,
      [request.tenantId]
    );
    return { data: result.rows[0] };
  });

  registerCrudRoutes(app, { prefix: "/analytics/import", table: "analytics_imports", tenantScoped: true });
  app.post("/analytics/generate-improvement-tasks", async (request) => ({
    data: await createAgentTask({
      tenantId: request.tenantId,
      role: "analytics",
      taskType: "generate_improvement_tasks",
      payload: request.body as Record<string, unknown>,
      createdBy: request.userId
    })
  }));

  await taskRoutes(app);
  await telegramRoutes(app);
}
