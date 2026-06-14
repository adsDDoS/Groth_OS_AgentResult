import { readFile } from "node:fs/promises";
const root = new URL("../", import.meta.url);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function read(path) {
  return readFile(new URL(path, root), "utf8");
}

function request(handler, url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = {
      method: options.method || "GET",
      url,
      headers: options.headers || {},
      on(event, callback) {
        if (event === "end") queueMicrotask(callback);
        return req;
      }
    };
    let body = "";
    const headers = {};
    const res = {
      statusCode: 200,
      setHeader(name, value) {
        headers[name.toLowerCase()] = value;
      },
      getHeaders() {
        return headers;
      },
      end(chunk, encoding, callback) {
        if (chunk) body += Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
        if (typeof encoding === "function") encoding();
        if (callback) callback();
        resolve({
          statusCode: res.statusCode,
          headers,
          body
        });
      }
    };

    Promise.resolve(handler(req, res)).catch(reject);
  });
}

const app = await read("app.js");
const publications = await read("modules/publications.js");
const vercel = JSON.parse(await read("vercel.json"));
const { default: apiHandler } = await import(new URL("../api/os-demo.js", import.meta.url));

assert(app.includes("reconcileApprovedCalendarApprovals"), "missing approved calendar approval reconciliation");
assert(app.includes('target_type === "publishing_calendar_item"'), "calendar approval reconciliation does not target publishing calendar items");
assert(app.includes('terminalStatuses.has(linkedCalendar.status)'), "reconciliation may overwrite terminal calendar statuses");
assert(publications.includes("calendarItemNeedsOwnerDecision"), "missing publication decision-column filter");
assert(publications.includes('approval.status === "pending"'), "decision column must only use pending approvals");
assert(publications.includes('approval.target_type === "publishing_calendar_item"'), "decision column must filter calendar approvals");
assert(
  vercel.rewrites?.some((rewrite) => rewrite.source === "/api/agentresult-os-demo/:path*" && rewrite.destination.includes("/api/os-demo")),
  "missing /api/agentresult-os-demo rewrite"
);

const health = await request(apiHandler, "/api/agentresult-os-demo/health?path=health");
assert(health.statusCode === 200, "health route failed");
assert(JSON.parse(health.body).status === "ok", "health route returned invalid payload");

const approvals = await request(apiHandler, "/api/agentresult-os-demo/approvals?path=approvals");
const approvalRows = JSON.parse(approvals.body).data;
assert(approvalRows.some((item) => item.status === "pending" && item.target_type === "content_item"), "missing pending content approval");
assert(
  approvalRows.some((item) => item.status === "approved" && item.target_type === "publishing_calendar_item"),
  "missing approved calendar approval fixture"
);

const calendar = await request(apiHandler, "/api/agentresult-os-demo/publishing/calendar?path=publishing/calendar");
const calendarRows = JSON.parse(calendar.body).data;
assert(calendarRows.some((item) => item.status === "draft" && item.channel === "manual_export"), "missing draft manual export fixture");

console.log("dashboard smoke ok");
