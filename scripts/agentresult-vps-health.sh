#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@91.103.140.101}"
BACKEND_CONTAINER="${BACKEND_CONTAINER:-agentresult-os-backend}"
OWNER_CONTAINER="${OWNER_CONTAINER:-agentresult-os-telegram-owner-control}"
OWNER_SERVICE="${OWNER_SERVICE:-agentresult-client-owner-updates.service}"
BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:18830}"
OWNER_URL="${OWNER_URL:-http://127.0.0.1:18831}"
EXPECTED_OWNER_IMAGE_TAG="${EXPECTED_OWNER_IMAGE_TAG:-}"

ssh "$VPS_HOST" \
  "BACKEND_CONTAINER='$BACKEND_CONTAINER' OWNER_CONTAINER='$OWNER_CONTAINER' OWNER_SERVICE='$OWNER_SERVICE' BACKEND_URL='$BACKEND_URL' OWNER_URL='$OWNER_URL' EXPECTED_OWNER_IMAGE_TAG='$EXPECTED_OWNER_IMAGE_TAG' bash -s" <<'REMOTE'
set -euo pipefail

fail() {
  echo "agentresult vps health failed: $*" >&2
  exit 1
}

container_line() {
  docker ps --filter "name=^/$1$" --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}' | head -1
}

container_env() {
  docker inspect "$1" --format '{{range .Config.Env}}{{println .}}{{end}}'
}

assert_running_container() {
  local name="$1"
  local expected_port="$2"
  local line
  line="$(container_line "$name")"
  [ -n "$line" ] || fail "$name is not running"
  case "$line" in
    *" Up "*) ;;
    *) fail "$name is not up: $line" ;;
  esac
  printf '%s\n' "$line" | grep -q "$expected_port" \
    || fail "$name does not expose expected port $expected_port: $line"
  echo "container ok: $line"
}

assert_health() {
  local url="$1"
  curl -fsS -m 15 "$url/health" | node -e '
let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const body = JSON.parse(input);
  if (body.status !== "ok") {
    console.error(input);
    process.exit(1);
  }
});
' || fail "health check failed: $url"
  echo "health ok: $url"
}

assert_running_container "$BACKEND_CONTAINER" "127.0.0.1:18830->3000/tcp"
assert_running_container "$OWNER_CONTAINER" "127.0.0.1:18831->3000/tcp"

owner_line="$(container_line "$OWNER_CONTAINER")"
owner_image="$(printf '%s\n' "$owner_line" | awk '{print $2}')"
if [ -n "$EXPECTED_OWNER_IMAGE_TAG" ]; then
  case "$owner_image" in
    *":$EXPECTED_OWNER_IMAGE_TAG") ;;
    *) fail "$OWNER_CONTAINER expected image tag $EXPECTED_OWNER_IMAGE_TAG, got $owner_image" ;;
  esac
  echo "owner image tag ok: $owner_image"
else
  echo "owner image: $owner_image"
fi

service_enabled="$(systemctl is-enabled "$OWNER_SERVICE" 2>&1 || true)"
service_active="$(systemctl is-active "$OWNER_SERVICE" 2>&1 || true)"
[ "$service_enabled" = "enabled" ] || fail "$OWNER_SERVICE is not enabled: $service_enabled"
[ "$service_active" = "active" ] || fail "$OWNER_SERVICE is not active: $service_active"
echo "systemd ok: $OWNER_SERVICE enabled active"

backend_env="$(container_env "$BACKEND_CONTAINER")"
owner_env="$(container_env "$OWNER_CONTAINER")"

printf '%s\n' "$backend_env" | grep -qx 'AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING=1' \
  && fail "$BACKEND_CONTAINER must not run owner-control polling"
printf '%s\n' "$backend_env" | grep -q '^TELEGRAM_BOT_TOKEN=' \
  && fail "$BACKEND_CONTAINER must not contain TELEGRAM_BOT_TOKEN"
echo "backend telegram isolation ok"

printf '%s\n' "$owner_env" | grep -qx 'AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING=1' \
  || fail "$OWNER_CONTAINER is missing AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING=1"
tenant_id="$(printf '%s\n' "$owner_env" | sed -n 's/^AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_TENANT_ID=//p' | tail -1)"
[ -n "$tenant_id" ] || fail "$OWNER_CONTAINER is missing AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_TENANT_ID"
bot_token="$(printf '%s\n' "$owner_env" | sed -n 's/^TELEGRAM_BOT_TOKEN=//p' | tail -1)"
[ -n "$bot_token" ] || fail "$OWNER_CONTAINER is missing TELEGRAM_BOT_TOKEN"
echo "owner polling env ok"

same_token_containers="$(
  for container in $(docker ps --format '{{.Names}}'); do
    if docker inspect "$container" --format '{{range .Config.Env}}{{println .}}{{end}}' \
      | grep -qx "TELEGRAM_BOT_TOKEN=$bot_token"; then
      printf '%s\n' "$container"
    fi
  done
)"
unexpected_same_token_containers="$(printf '%s\n' "$same_token_containers" | grep -vx "$OWNER_CONTAINER" || true)"
[ -z "$unexpected_same_token_containers" ] \
  || fail "owner-control bot token is also present in: $(printf '%s' "$unexpected_same_token_containers" | paste -sd ',' -)"
echo "token isolation ok"

docker logs --tail 120 "$OWNER_CONTAINER" 2>&1 \
  | grep -q 'Telegram owner-control polling middleware is enabled' \
  || fail "$OWNER_CONTAINER logs do not show owner-control polling middleware"
echo "polling log marker ok"

webhook_json="$(docker exec "$OWNER_CONTAINER" node -e '
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
});
' || fail "Telegram webhook is not empty: $webhook_json"
echo "webhook empty ok"

assert_health "$BACKEND_URL"
assert_health "$OWNER_URL"

curl -fsS -m 15 \
  -H "content-type: application/json" \
  -H "x-tenant-id: $tenant_id" \
  -d '{"text":"что по результату"}' \
  "$OWNER_URL/telegram/intent" | node -e '
let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const body = JSON.parse(input);
  const data = body?.data || {};
  if (data.intent !== "result" || !String(data.text || "").includes("AgentResult Growth Control")) {
    console.error(input);
    process.exit(1);
  }
  console.log(JSON.stringify({
    intent: data.intent,
    buttons: (data.buttons || []).map((button) => button.label)
  }));
});
' || fail "owner-control Telegram intent check failed"

echo "agentresult vps health passed"
REMOTE
