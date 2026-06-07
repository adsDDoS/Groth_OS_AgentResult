#!/usr/bin/env bash
set -euo pipefail

DEMO_API_URL="${DEMO_API_URL:-https://91-103-140-101.sslip.io}"
DEMO_TENANT_ID="${DEMO_TENANT_ID:-10000000-0000-4000-8000-000000000001}"

curl -sS -m 15 "$DEMO_API_URL/health" | node -e '
let s = "";
process.stdin.on("data", c => s += c);
process.stdin.on("end", () => {
  const body = JSON.parse(s);
  if (body.status !== "ok") process.exit(1);
  console.log("health ok");
});
'

curl -sS -m 15 \
  -H "x-tenant-id: $DEMO_TENANT_ID" \
  "$DEMO_API_URL/approvals" | node -e '
let s = "";
process.stdin.on("data", c => s += c);
process.stdin.on("end", () => {
  const body = JSON.parse(s);
  const count = Array.isArray(body?.data) ? body.data.filter((item) => item.status === "pending").length : 0;
  if (count !== 1) {
    console.error(s);
    process.exit(1);
  }
  console.log("demo approvals ok");
});
'

curl -sS -m 15 \
  -H "x-tenant-id: $DEMO_TENANT_ID" \
  "$DEMO_API_URL/analytics/overview" | node -e '
let s = "";
process.stdin.on("data", c => s += c);
process.stdin.on("end", () => {
  const body = JSON.parse(s);
  const data = body?.data || {};
  if (Number(data.published_materials) !== 1 || Number(data.leads) !== 3) {
    console.error(s);
    process.exit(1);
  }
  console.log("demo results ok");
});
'
