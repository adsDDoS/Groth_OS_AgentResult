const UPSTREAM_BASE = process.env.AGENTRESULT_OS_DEMO_UPSTREAM || "http://91.103.140.101:18082";

const ALLOWED_PATHS = new Set([
  "health",
  "me",
  "offer",
  "demand-map",
  "approvals",
  "agents",
  "analytics/overview",
  "content/items",
  "publishing/calendar",
  "workspace/state",
  "tasks",
]);

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "content-type, x-tenant-id");
}

function resolvePath(request) {
  const value = request.query.path;
  const path = Array.isArray(value) ? value.join("/") : value || "";
  return path.replace(/^\/+/, "").replace(/\/+$/, "");
}

export default async function handler(request, response) {
  setCors(response);

  const path = resolvePath(request);

  if (!ALLOWED_PATHS.has(path)) {
    response.status(404).json({ error: "not_found" });
    return;
  }

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "GET") {
    response.status(404).json({ error: "not_found" });
    return;
  }

  const upstreamUrl = new URL(`/${path}`, UPSTREAM_BASE);
  const upstreamResponse = await fetch(upstreamUrl, {
    headers: {
      "x-tenant-id": request.headers["x-tenant-id"] || "",
    },
  });

  const body = await upstreamResponse.text();
  response.status(upstreamResponse.status);
  response.setHeader("content-type", upstreamResponse.headers.get("content-type") || "application/json");
  response.send(body);
}
