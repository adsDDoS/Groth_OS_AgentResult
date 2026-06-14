#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@91.103.140.101}"
APP_DIR="${APP_DIR:-/opt/agentresult-os/app}"
DRILL_LOG_FILE="${DRILL_LOG_FILE:-/opt/agentresult-os/runtime/agentresult-vps-health-drill.log}"
DRILL_CHAT_ID="${AGENTRESULT_VPS_HEALTH_DRILL_CHAT_ID:-${TELEGRAM_OWNER_CONTROL_ALERT_CHAT_ID:-}}"

ssh "$VPS_HOST" \
  "APP_DIR='$APP_DIR' DRILL_LOG_FILE='$DRILL_LOG_FILE' DRILL_CHAT_ID='$DRILL_CHAT_ID' bash -s" <<'REMOTE'
set -euo pipefail

cd "$APP_DIR"

if [ -z "${DRILL_CHAT_ID:-}" ]; then
  DRILL_CHAT_ID="$(sed -n 's/^AGENTRESULT_VPS_HEALTH_ALERT_CHAT_ID=//p; s/^TELEGRAM_OWNER_CONTROL_ALERT_CHAT_ID=//p; s/^TELEGRAM_ALLOWED_USERS=//p' .env /opt/agentresult-os/runtime/agentresult-vps-health.env 2>/dev/null | head -1 | cut -d, -f1 || true)"
fi

[ -n "${DRILL_CHAT_ID:-}" ] || {
  echo "agentresult vps health drill failed: alert chat id is not configured" >&2
  exit 1
}

rm -f "$DRILL_LOG_FILE"

set +e
AGENTRESULT_VPS_HEALTH_DRY_RUN_ALERT=1 \
AGENTRESULT_VPS_HEALTH_ALERT_CHAT_ID="$DRILL_CHAT_ID" \
AGENTRESULT_VPS_HEALTH_COMMAND='bash -c "echo forced-agentresult-vps-health-drill-failure; exit 42"' \
LOG_FILE="$DRILL_LOG_FILE" \
scripts/run-agentresult-vps-health-monitor.sh
drill_status=$?
set -e

[ "$drill_status" -eq 42 ] || {
  echo "agentresult vps health drill failed: expected status 42, got $drill_status" >&2
  cat "$DRILL_LOG_FILE" >&2 || true
  exit 1
}

grep -q 'forced-agentresult-vps-health-drill-failure' "$DRILL_LOG_FILE" \
  || {
    echo "agentresult vps health drill failed: forced failure marker missing" >&2
    cat "$DRILL_LOG_FILE" >&2 || true
    exit 1
  }

grep -q 'fail agentresult-vps invariant failed status=42' "$DRILL_LOG_FILE" \
  || {
    echo "agentresult vps health drill failed: failure log marker missing" >&2
    cat "$DRILL_LOG_FILE" >&2 || true
    exit 1
  }

grep -q 'dry-run alert chat=' "$DRILL_LOG_FILE" \
  || {
    echo "agentresult vps health drill failed: dry-run alert marker missing" >&2
    cat "$DRILL_LOG_FILE" >&2 || true
    exit 1
  }

echo "dry-run alert path ok"

AGENTRESULT_VPS_HEALTH_LOCAL=1 npm run vps:agentresult-health

echo "agentresult vps health drill passed"
REMOTE
