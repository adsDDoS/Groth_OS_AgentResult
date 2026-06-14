#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@91.103.140.101}"
CONTAINER_NAME="${CONTAINER_NAME:-agentresult-os-telegram-owner-control}"
EXPECTED_IMAGE_TAG="${EXPECTED_IMAGE_TAG:-}"
HOST_URL="${HOST_URL:-http://127.0.0.1:18831}"

ssh "$VPS_HOST" \
  "CONTAINER_NAME='$CONTAINER_NAME' EXPECTED_IMAGE_TAG='$EXPECTED_IMAGE_TAG' HOST_URL='$HOST_URL' bash -s" <<'REMOTE'
set -euo pipefail

fail() {
  echo "telegram publication-result smoke failed: $*" >&2
  exit 1
}

container_line="$(docker ps --filter "name=$CONTAINER_NAME" --format '{{.Names}} {{.Image}} {{.Status}}' | head -1)"
[ -n "$container_line" ] || fail "$CONTAINER_NAME is not running"

name="$(printf '%s\n' "$container_line" | awk '{print $1}')"
image="$(printf '%s\n' "$container_line" | awk '{print $2}')"
status="$(printf '%s\n' "$container_line" | cut -d' ' -f3-)"

[ "$name" = "$CONTAINER_NAME" ] || fail "unexpected container name: $container_line"
if [ -n "$EXPECTED_IMAGE_TAG" ]; then
  case "$image" in
    *":$EXPECTED_IMAGE_TAG") ;;
    *) fail "expected image tag $EXPECTED_IMAGE_TAG, got $image" ;;
  esac
fi
case "$status" in
  Up*) ;;
  *) fail "$CONTAINER_NAME is not up: $status" ;;
esac
echo "container ok: $name $image $status"

env_output="$(docker inspect "$CONTAINER_NAME" --format '{{range .Config.Env}}{{println .}}{{end}}')"
printf '%s\n' "$env_output" | grep -qx 'AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING=1' \
  || fail "AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING is not 1"
tenant_id="$(printf '%s\n' "$env_output" | sed -n 's/^AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_TENANT_ID=//p' | tail -1)"
[ -n "$tenant_id" ] || fail "AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_TENANT_ID is missing"
echo "polling env ok"

bot_token="$(printf '%s\n' "$env_output" | sed -n 's/^TELEGRAM_BOT_TOKEN=//p' | tail -1)"
[ -n "$bot_token" ] || fail "TELEGRAM_BOT_TOKEN is missing"
same_token_containers="$(
  for container in $(docker ps --format '{{.Names}}'); do
    if docker inspect "$container" --format '{{range .Config.Env}}{{println .}}{{end}}' \
      | grep -qx "TELEGRAM_BOT_TOKEN=$bot_token"; then
      printf '%s\n' "$container"
    fi
  done
)"
unexpected_same_token_containers="$(printf '%s\n' "$same_token_containers" | grep -vx "$CONTAINER_NAME" || true)"
[ -z "$unexpected_same_token_containers" ] \
  || fail "owner-control bot token is also present in: $(printf '%s' "$unexpected_same_token_containers" | paste -sd ',' -)"
echo "single token owner ok"

docker exec "$CONTAINER_NAME" sh -lc \
  "grep -q 'Пришлите URL публикации' apps/backend/dist/modules/telegram/routes.js && grep -q 'telegram_publication_result_confirmation' apps/backend/dist/modules/telegram/routes.js" \
  || fail "publication result dialog marker is missing in deployed bundle"
echo "dialog marker ok"

webhook_json="$(docker exec "$CONTAINER_NAME" node -e '
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN missing");
  process.exit(2);
}
const response = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`, { method: "POST" });
const body = await response.json();
console.log(JSON.stringify({
  ok: Boolean(body.ok),
  url: body.result?.url || "",
  pending_update_count: body.result?.pending_update_count ?? null,
  last_error_message: body.result?.last_error_message || ""
}));
')"

printf '%s\n' "$webhook_json" | node -e '
let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const data = JSON.parse(input);
  if (!data.ok || data.url) {
    console.error(input);
    process.exit(1);
  }
  console.log("webhook empty ok");
});
' || fail "Telegram webhook is not empty"

curl -fsS -m 15 "$HOST_URL/health" | node -e '
let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const body = JSON.parse(input);
  if (body.status !== "ok") {
    console.error(input);
    process.exit(1);
  }
  console.log("health ok");
});
' || fail "health check failed"

curl -fsS -m 15 \
  -H "content-type: application/json" \
  -H "x-tenant-id: $tenant_id" \
  -d '{"text":"что по результату"}' \
  "$HOST_URL/telegram/intent" | node -e '
let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const body = JSON.parse(input);
  const data = body?.data || {};
  const text = String(data.text || "");
  const counts = data.ownerBrief?.counts || {};
  if (data.intent !== "result" || !text.includes("AgentResult Growth Control")) {
    console.error(input);
    process.exit(1);
  }
  if (typeof counts.handedOff !== "number" || typeof counts.published !== "number") {
    console.error(input);
    process.exit(1);
  }
  console.log(JSON.stringify({
    intent: data.intent,
    handedOff: counts.handedOff,
    published: counts.published,
    buttons: (data.buttons || []).map((button) => button.label)
  }));
});
' || fail "read-only Telegram intent smoke failed"

echo "telegram publication-result production smoke passed"
REMOTE
