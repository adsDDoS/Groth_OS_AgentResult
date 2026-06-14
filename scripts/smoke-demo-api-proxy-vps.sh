#!/usr/bin/env bash
set -euo pipefail

DEMO_API_URL="${DEMO_API_URL:-https://dashboard-orpin-mu-26.vercel.app/api/agentresult-os-demo}"
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
  if (!Array.isArray(body?.data)) {
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

curl -sS -m 15 \
  -H "x-tenant-id: $DEMO_TENANT_ID" \
  "$DEMO_API_URL/result-signals" | node -e '
let s = "";
process.stdin.on("data", c => s += c);
process.stdin.on("end", () => {
  const body = JSON.parse(s);
  if (!Array.isArray(body?.data)) {
    console.error(s);
    process.exit(1);
  }
  console.log("demo result signals ok");
});
'

TASKS_STATUS="$(
  curl -sS -m 15 \
    -o /tmp/agentresult-demo-tasks-response.json \
    -w "%{http_code}" \
    -X POST \
    -H "content-type: application/json" \
    -H "x-tenant-id: $DEMO_TENANT_ID" \
    "$DEMO_API_URL/tasks" \
    --data '{"title":"smoke write should be blocked"}'
)"

if [ "$TASKS_STATUS" != "401" ] && [ "$TASKS_STATUS" != "403" ] && [ "$TASKS_STATUS" != "404" ] && [ "$TASKS_STATUS" != "405" ]; then
  cat /tmp/agentresult-demo-tasks-response.json >&2
  exit 1
fi

rm -f /tmp/agentresult-demo-tasks-response.json
echo "demo write guard ok"
