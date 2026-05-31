import type { FastifyInstance } from "fastify";
import { query } from "../../db/client.js";

const defaultTenantId = "00000000-0000-0000-0000-000000000001";
const defaultOwnerId = "77777777-7777-4777-8777-777777777771";

export async function authPlugin(app: FastifyInstance) {
  app.addHook("preHandler", async (request) => {
    const tenantHeader = request.headers["x-tenant-id"];
    const userHeader = request.headers["x-user-id"];
    const rawTenantId = Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader;
    const rawUserId = Array.isArray(userHeader) ? userHeader[0] : userHeader;
    request.tenantId =
      rawTenantId && rawTenantId !== "null" && rawTenantId !== "undefined"
        ? rawTenantId
        : defaultTenantId;
    request.userId = rawUserId && rawUserId !== "null" && rawUserId !== "undefined" ? rawUserId : defaultOwnerId;

    const user = await query("select * from users where id = $1 and tenant_id = $2", [request.userId, request.tenantId]).catch(() => null);
    request.userRole = String(user?.rows?.[0]?.role || "owner");
  });
}
