#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@91.103.140.101}"
CONTAINER_NAME="${CONTAINER_NAME:-agentresult-os-telegram-owner-control}"
LOG_FILE="${LOG_FILE:-/opt/agentresult-os/runtime/telegram-owner-control-monitor.log}"
ALERT_CHAT_ID="${TELEGRAM_OWNER_CONTROL_ALERT_CHAT_ID:-}"

set +e
output="$(CONTAINER_NAME="$CONTAINER_NAME" VPS_HOST="$VPS_HOST" npm run telegram:production-smoke 2>&1)"
status=$?
set -e

ssh "$VPS_HOST" \
  "CONTAINER_NAME='$CONTAINER_NAME' LOG_FILE='$LOG_FILE' ALERT_CHAT_ID='$ALERT_CHAT_ID' STATUS='$status' bash -s" <<'REMOTE'
set -euo pipefail

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
    return 0
  fi

  docker exec \
    -e TELEGRAM_OWNER_CONTROL_ALERT_CHAT_ID="$ALERT_CHAT_ID" \
    -e TELEGRAM_OWNER_CONTROL_ALERT_TEXT="$message" \
    "$CONTAINER_NAME" \
    node -e '
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_OWNER_CONTROL_ALERT_CHAT_ID;
const text = process.env.TELEGRAM_OWNER_CONTROL_ALERT_TEXT;
if (!token || !chatId || !text) process.exit(0);
const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ chat_id: chatId, text })
});
if (!response.ok) process.exit(1);
' >/dev/null
}

if [ "$STATUS" -eq 0 ]; then
  append_log "ok telegram-owner-control invariant healthy"
  exit 0
fi

append_log "fail telegram-owner-control invariant failed"

alert_text="AgentResult Telegram owner-control monitor failed on $(hostname): polling/webhook/token invariant is broken. Run npm run telegram:production-smoke locally."
send_alert "$alert_text" || append_log "warn alert delivery failed"
REMOTE

printf '%s\n' "$output"
exit "$status"
