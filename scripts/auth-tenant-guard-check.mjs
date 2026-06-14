#!/usr/bin/env node

import fastify from "fastify";

const allowedTenantId = "00000000-0000-0000-0000-000000000001";
const blockedTenantId = "10000000-0000-4000-8000-000000000001";
const apiKey = "preprod-test-key";

process.env.AI_GROWTH_OS_STORAGE = "local";
process.env.AGENTRESULT_REQUIRE_API_KEY = "1";
process.env.AGENTRESULT_API_KEY = apiKey;
process.env.AGENTRESULT_ALLOWED_TENANT_IDS = allowedTenantId;

const { authPlugin } = await import("../apps/backend/dist/modules/auth/plugin.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const app = fastify({ logger: false });
await authPlugin(app);

app.get("/health", async () => ({ ok: true }));
app.get("/private", async (request) => ({
  tenantId: request.tenantId,
  userId: request.userId,
  role: request.userRole
}));

app.setErrorHandler((error, _request, reply) => {
  const normalizedError = error instanceof Error ? error : new Error("Unknown error");
  const statusCode = Number(normalizedError.statusCode ?? 500);
  reply.status(statusCode).send({
    error: normalizedError.name,
    message: normalizedError.message,
    code: normalizedError.code
  });
});

try {
  const publicHealth = await app.inject({ method: "GET", url: "/health" });
  assert(publicHealth.statusCode === 200, `public health should pass, saw ${publicHealth.statusCode}`);

  const noKey = await app.inject({
    method: "GET",
    url: "/private",
    headers: { "x-tenant-id": allowedTenantId }
  });
  assert(noKey.statusCode === 401, `missing API key should be rejected, saw ${noKey.statusCode}`);
  assert(noKey.json().code === "AGENTRESULT_API_KEY_REQUIRED", `missing API key code mismatch: ${noKey.body}`);

  const wrongTenant = await app.inject({
    method: "GET",
    url: "/private",
    headers: {
      "x-agentresult-api-key": apiKey,
      "x-tenant-id": blockedTenantId
    }
  });
  assert(wrongTenant.statusCode === 403, `blocked tenant should be rejected, saw ${wrongTenant.statusCode}`);
  assert(wrongTenant.json().code === "AGENTRESULT_TENANT_NOT_ALLOWED", `blocked tenant code mismatch: ${wrongTenant.body}`);

  const allowed = await app.inject({
    method: "GET",
    url: "/private",
    headers: {
      "x-agentresult-api-key": apiKey,
      "x-tenant-id": allowedTenantId
    }
  });
  assert(allowed.statusCode === 200, `allowed tenant should pass, saw ${allowed.statusCode} ${allowed.body}`);
  assert(allowed.json().tenantId === allowedTenantId, `allowed tenant mismatch: ${allowed.body}`);

  console.log("Auth tenant guard check passed");
} finally {
  await app.close();
}
