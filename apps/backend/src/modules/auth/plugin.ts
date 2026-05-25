import type { FastifyInstance } from "fastify";

export async function authPlugin(app: FastifyInstance) {
  app.addHook("preHandler", async (request) => {
    const tenantHeader = request.headers["x-tenant-id"];
    const userHeader = request.headers["x-user-id"];
    request.tenantId = Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader ?? "00000000-0000-0000-0000-000000000001";
    request.userId = Array.isArray(userHeader) ? userHeader[0] : userHeader;
  });
}
