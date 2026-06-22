#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@91.103.140.101}"
OWNER_CONTAINER="${OWNER_CONTAINER:-agentresult-os-telegram-owner-control}"
OWNER_URL="${OWNER_URL:-http://127.0.0.1:18831}"
BACKEND_IMAGE="${BACKEND_IMAGE:-}"
RESET_DEMO="${RESET_DEMO:-1}"

ssh "$VPS_HOST" \
  "OWNER_CONTAINER='$OWNER_CONTAINER' OWNER_URL='$OWNER_URL' BACKEND_IMAGE='$BACKEND_IMAGE' RESET_DEMO='$RESET_DEMO' bash -s" <<'REMOTE'
set -euo pipefail

fail() {
  echo "telegram pilot command production smoke failed: $*" >&2
  exit 1
}

container_line="$(docker ps --filter "name=^/$OWNER_CONTAINER$" --format '{{.Names}} {{.Image}} {{.Status}}' | head -1)"
[ -n "$container_line" ] || fail "$OWNER_CONTAINER is not running"
case "$container_line" in
  *" Up "*) ;;
  *) fail "$OWNER_CONTAINER is not up: $container_line" ;;
esac

env_output="$(docker inspect "$OWNER_CONTAINER" --format '{{range .Config.Env}}{{println .}}{{end}}')"
api_key="$(printf '%s\n' "$env_output" | sed -n 's/^AGENTRESULT_API_KEY=//p' | tail -1)"
tenant_id="$(printf '%s\n' "$env_output" | sed -n 's/^AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_TENANT_ID=//p' | tail -1)"
bot_token="$(printf '%s\n' "$env_output" | sed -n 's/^TELEGRAM_BOT_TOKEN=//p' | tail -1)"
chat_id="$(
  printf '%s\n' "$env_output" \
    | sed -n 's/^TELEGRAM_OWNER_CONTROL_ALERT_CHAT_ID=//p; s/^AGENTRESULT_VPS_HEALTH_ALERT_CHAT_ID=//p; s/^TELEGRAM_ALLOWED_USERS=//p' \
    | head -1 \
    | cut -d, -f1
)"

[ -n "$api_key" ] || fail "AGENTRESULT_API_KEY is missing in $OWNER_CONTAINER"
[ -n "$tenant_id" ] || fail "AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_TENANT_ID is missing in $OWNER_CONTAINER"
[ -n "$bot_token" ] || fail "TELEGRAM_BOT_TOKEN is missing in $OWNER_CONTAINER"
[ -n "$chat_id" ] || fail "no Telegram smoke chat id found in $OWNER_CONTAINER env"

if [ -z "$BACKEND_IMAGE" ]; then
  BACKEND_IMAGE="$(docker inspect "$OWNER_CONTAINER" --format '{{.Config.Image}}')"
fi

reset_demo() {
  [ "$RESET_DEMO" = "1" ] || return 0
  docker run --rm \
    --network agentresult-os-net \
    --env-file /opt/agentresult-os/app/.env \
    "$BACKEND_IMAGE" \
    node apps/backend/dist/db/reset-pilot-demo.js >/dev/null
}

reset_demo
trap reset_demo EXIT

API_KEY="$api_key" TENANT_ID="$tenant_id" OWNER_URL="$OWNER_URL" BOT_TOKEN="$bot_token" CHAT_ID="$chat_id" node <<'NODE'
const apiKey = process.env.API_KEY;
const tenantId = process.env.TENANT_ID;
const ownerUrl = process.env.OWNER_URL;
const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const response = await fetch(`${ownerUrl}/telegram/commands`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-tenant-id": tenantId,
    "x-agentresult-api-key": apiKey
  },
  body: JSON.stringify({
    command: "/pilot",
    note: "production smoke /pilot"
  })
});
const body = await response.json();
if (!response.ok) {
  throw new Error(`/pilot command failed: ${response.status} ${JSON.stringify(body)}`);
}
const data = body?.data || {};
const text = String(data.text || "");
if (data.command !== "pilot" || !text.includes("Week-1 pilot запущен") || !data.pilot?.approval?.id) {
  throw new Error(`unexpected /pilot response: ${JSON.stringify(body)}`);
}

const smokeText = [
  "GrothOS production smoke: /pilot",
  "",
  text,
  "",
  `tenant: ${tenantId}`,
  `approval: ${data.pilot.approval.id}`
].join("\n").slice(0, 3900);

const sendResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    chat_id: chatId,
    text: smokeText,
    disable_web_page_preview: true
  })
});
const sendBody = await sendResponse.json();
if (!sendResponse.ok || !sendBody.ok) {
  throw new Error(`sendMessage failed: ${sendResponse.status} ${JSON.stringify(sendBody)}`);
}

console.log(JSON.stringify({
  ok: true,
  command: data.command,
  tenantId,
  chatId,
  approvalId: data.pilot.approval.id,
  messageId: sendBody.result?.message_id || null
}, null, 2));
NODE

echo "telegram pilot command production smoke passed"
REMOTE
