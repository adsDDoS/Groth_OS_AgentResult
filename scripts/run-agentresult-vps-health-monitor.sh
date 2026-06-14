#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/agentresult-os/app}"
OWNER_CONTAINER="${OWNER_CONTAINER:-agentresult-os-telegram-owner-control}"
LOG_FILE="${LOG_FILE:-/opt/agentresult-os/runtime/agentresult-vps-health.log}"
ALERT_CHAT_ID="${AGENTRESULT_VPS_HEALTH_ALERT_CHAT_ID:-${TELEGRAM_OWNER_CONTROL_ALERT_CHAT_ID:-}}"
DRY_RUN_ALERT="${AGENTRESULT_VPS_HEALTH_DRY_RUN_ALERT:-0}"
HEALTH_COMMAND="${AGENTRESULT_VPS_HEALTH_COMMAND:-npm run vps:agentresult-health}"

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

append_log() {
  mkdir -p "$(dirname "$LOG_FILE")"
  printf '%s %s\n' "$(timestamp)" "$*" >> "$LOG_FILE"
}

send_alert() {
  local message="$1"
  if [ -z "${ALERT_CHAT_ID:-}" ]; then
    append_log "warn alert chat id is not configured"
    return 0
  fi

  if [ "$DRY_RUN_ALERT" = "1" ]; then
    append_log "dry-run alert chat=$ALERT_CHAT_ID text=$message"
    return 0
  fi

  docker exec \
    -e AGENTRESULT_VPS_HEALTH_ALERT_CHAT_ID="$ALERT_CHAT_ID" \
    -e AGENTRESULT_VPS_HEALTH_ALERT_TEXT="$message" \
    "$OWNER_CONTAINER" \
    node -e '
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.AGENTRESULT_VPS_HEALTH_ALERT_CHAT_ID;
const text = process.env.AGENTRESULT_VPS_HEALTH_ALERT_TEXT;
if (!token || !chatId || !text) process.exit(0);
const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ chat_id: chatId, text })
});
if (!response.ok) {
  const body = await response.text();
  console.error(body);
  process.exit(1);
}
' >/dev/null
}

cd "$APP_DIR"

set +e
output="$(AGENTRESULT_VPS_HEALTH_LOCAL=1 bash -lc "$HEALTH_COMMAND" 2>&1)"
status=$?
set -e

if [ "$status" -eq 0 ]; then
  append_log "ok agentresult-vps invariant healthy"
  printf '%s\n' "$output" >> "$LOG_FILE"
  exit 0
fi

append_log "fail agentresult-vps invariant failed status=$status"
printf '%s\n' "$output" >> "$LOG_FILE"

alert_text="AgentResult VPS health failed on $(hostname): owner-control/systemd/webhook/token invariant is broken. Run npm run vps:agentresult-health from the repo."
send_alert "$alert_text" || append_log "warn alert delivery failed"
exit "$status"
