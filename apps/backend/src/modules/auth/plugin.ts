import type { FastifyInstance } from "fastify";
import { config } from "../../config.js";
import { query } from "../../db/client.js";

const defaultTenantId = "00000000-0000-0000-0000-000000000001";
const defaultOwnerId = "77777777-7777-4777-8777-777777777771";
const publicPaths = new Set(["/health"]);

function singleHeader(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function reject(statusCode: number, message: string, code: string) {
  const error = new Error(message) as Error & { statusCode?: number; code?: string };
  error.statusCode = statusCode;
  error.code = code;
  throw error;
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function authPlugin(app: FastifyInstance) {
  app.addHook("preHandler", async (request) => {
    const rawTenantId = singleHeader(request.headers["x-tenant-id"]);
    const rawUserId = singleHeader(request.headers["x-user-id"]);
    request.tenantId =
      rawTenantId && rawTenantId !== "null" && rawTenantId !== "undefined"
        ? rawTenantId
        : defaultTenantId;
    request.userId = rawUserId && rawUserId !== "null" && rawUserId !== "undefined" ? rawUserId : defaultOwnerId;

    if (config.requireApiKey && !publicPaths.has(request.routeOptions.url || request.url)) {
      if (!config.apiKey) {
        reject(500, "AGENTRESULT_API_KEY is required when AGENTRESULT_REQUIRE_API_KEY=1", "AGENTRESULT_API_KEY_MISSING");
      }
      const providedApiKey = singleHeader(request.headers["x-agentresult-api-key"]);
      if (providedApiKey !== config.apiKey) {
        reject(401, "Valid AgentResult API key is required", "AGENTRESULT_API_KEY_REQUIRED");
      }

      const allowedTenantIds = splitCsv(config.allowedTenantIds);
      if (allowedTenantIds.length > 0 && !allowedTenantIds.includes(request.tenantId)) {
        reject(403, "Tenant is not allowed for this deployment", "AGENTRESULT_TENANT_NOT_ALLOWED");
      }
    }

    const user = await query("select * from users where id = $1 and tenant_id = $2", [request.userId, request.tenantId]).catch(() => null);
    request.userRole = String(user?.rows?.[0]?.role || "owner");
  });
}
