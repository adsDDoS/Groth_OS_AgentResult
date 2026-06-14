import type { FastifyInstance } from "fastify";
import { query } from "./db/client.js";
import { insertJson } from "./modules/common/repository.js";
import { approvalsRoutes } from "./modules/approvals/routes.js";
import { registerCrudRoutes } from "./modules/common/routes.js";
import { contentRoutes } from "./modules/content/routes.js";
import { geoRoutes } from "./modules/geo/routes.js";
import { hermesRoutes } from "./modules/hermes/index.js";
import { publishingRoutes } from "./modules/publishing/routes.js";
import { resultSignalRoutes } from "./modules/result-signals/routes.js";
import { seoRoutes } from "./modules/seo/routes.js";
import { taskRoutes } from "./modules/tasks/routes.js";
import { telegramRoutes } from "./modules/telegram/routes.js";
import { createAgentTask } from "./modules/agents/runner.js";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok" }));

  app.get("/me", async (request) => ({
    data: await (async () => {
      const user = await query("select * from users where id = $1 and tenant_id = $2", [request.userId, request.tenantId]).catch(() => ({ rows: [] }));
      const row = user.rows[0] ?? null;
      const role = String(row?.role || request.userRole || "owner");
      return {
        tenantId: request.tenantId,
        userId: request.userId ?? null,
        role,
        name: row?.name ?? "Owner",
        email: row?.email ?? null,
        permissions: role === "owner"
          ? ["approve", "publish", "configure", "results", "tasks"]
          : ["edit", "comment", "schedule", "tasks"]
      };
    })()
  }));

  app.get("/tenants/current", async (request) => {
    const result = await query("select * from tenants where id = $1", [request.tenantId]);
    return { data: result.rows[0] ?? null };
  });

  app.get("/workspace/state", async (request) => {
    const result = await query("select * from tenants where id = $1", [request.tenantId]);
    const tenant = result.rows[0] ?? null;
    const settings = tenant?.settings && typeof tenant.settings === "object" ? (tenant.settings as Record<string, unknown>) : {};
    return { data: settings.dashboard_state ?? {} };
  });

  app.put("/workspace/state", async (request) => {
    const current = await query("select * from tenants where id = $1", [request.tenantId]);
    const tenant = current.rows[0] ?? null;
    const currentSettings =
      tenant?.settings && typeof tenant.settings === "object" ? ({ ...(tenant.settings as Record<string, unknown>) } as Record<string, unknown>) : {};
    const nextState = request.body && typeof request.body === "object" ? (request.body as Record<string, unknown>) : {};
    currentSettings.dashboard_state = {
      ...(currentSettings.dashboard_state && typeof currentSettings.dashboard_state === "object"
        ? (currentSettings.dashboard_state as Record<string, unknown>)
        : {}),
      ...nextState
    };
    const result = await query("update tenants set settings = $2 where id = $1 returning *", [request.tenantId, currentSettings]);
    const settings = result.rows[0]?.settings && typeof result.rows[0].settings === "object"
      ? (result.rows[0].settings as Record<string, unknown>)
      : {};
    return { data: settings.dashboard_state ?? {} };
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
        `update companies set name = coalesce($2, name), profile = coalesce($3, profile), website_url = coalesce($4, website_url), updated_at = now()
         where id = $1 returning *`,
        [existing.rows[0].id, body.name ?? null, body.profile ?? null, body.website_url ?? null]
      );
      return { data: result.rows[0] };
    }
    const result = await query("insert into companies (tenant_id, name, profile, website_url) values ($1, $2, $3, $4) returning *", [
      request.tenantId,
      body.name ?? "New B2B Company",
      body.profile ?? {},
      body.website_url ?? null
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
  await resultSignalRoutes(app);
  await seoRoutes(app);
  await geoRoutes(app);
  await hermesRoutes(app);

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
    const latestImport = await query("select * from analytics_imports where tenant_id = $1 order by created_at desc limit $2", [
      request.tenantId,
      1
    ]).catch(() => ({ rows: [] }));
    const summary = latestImport.rows[0]?.payload && typeof latestImport.rows[0].payload === "object"
      ? (latestImport.rows[0].payload as Record<string, unknown>)
      : {};
    const result = await query(
      `select
        (select count(*) from content_items where tenant_id = $1) as content_items,
        (select count(*) from publishing_calendar_items where tenant_id = $1) as calendar_items,
        (select count(*) from approvals where tenant_id = $1 and status = 'pending') as pending_approvals,
        (select count(*) from approvals where tenant_id = $1) as approvals_total,
        (select count(*) from publishing_calendar_items where tenant_id = $1 and status in ('published', 'handed_off')) as published_materials,
        (select count(*) from conversion_events where tenant_id = $1 and event_type = 'result_signal.confirmed') as result_signals,
        (select count(*) from tasks where tenant_id = $1) as tasks_created,
        0 as leads,
        0 as receivables_in_progress,
        0 as promised_payments,
        0 as recovered_payments`,
      [request.tenantId]
    );
    return {
      data: {
        ...(result.rows[0] ?? {}),
        leads: Number(summary.leads ?? result.rows[0]?.leads ?? 0),
        tasks_created: Number(summary.tasks_created ?? result.rows[0]?.tasks_created ?? 0),
        published_materials: Number(summary.published_materials ?? result.rows[0]?.published_materials ?? 0),
        result_signals: Number(summary.result_signals ?? result.rows[0]?.result_signals ?? 0),
        receivables_in_progress: Number(summary.receivables_in_progress ?? result.rows[0]?.receivables_in_progress ?? 0),
        promised_payments: Number(summary.promised_payments ?? result.rows[0]?.promised_payments ?? 0),
        recovered_payments: Number(summary.recovered_payments ?? result.rows[0]?.recovered_payments ?? 0),
        source: latestImport.rows[0]?.source ?? null,
        imported_at: latestImport.rows[0]?.created_at ?? null
      }
    };
  });

  registerCrudRoutes(app, { prefix: "/analytics/import", table: "analytics_imports", tenantScoped: true });
  app.post("/analytics/summary", async (request) => ({
    data: await insertJson(
      "analytics_imports",
      {
        source: "owner_manual",
        payload: request.body as Record<string, unknown>
      },
      request.tenantId
    )
  }));
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
