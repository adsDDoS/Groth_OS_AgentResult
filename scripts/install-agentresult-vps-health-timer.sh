#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@91.103.140.101}"
APP_DIR="${APP_DIR:-/opt/agentresult-os/app}"
TIMER_NAME="${TIMER_NAME:-agentresult-vps-health}"
CHECK_INTERVAL="${CHECK_INTERVAL:-15min}"
LOG_FILE="${LOG_FILE:-/opt/agentresult-os/runtime/agentresult-vps-health.log}"
ENV_FILE="${ENV_FILE:-/opt/agentresult-os/runtime/agentresult-vps-health.env}"

ssh "$VPS_HOST" \
  "APP_DIR='$APP_DIR' TIMER_NAME='$TIMER_NAME' CHECK_INTERVAL='$CHECK_INTERVAL' LOG_FILE='$LOG_FILE' ENV_FILE='$ENV_FILE' bash -s" <<'REMOTE'
set -euo pipefail

cd "$APP_DIR"
git pull --ff-only origin main

mkdir -p "$(dirname "$LOG_FILE")"
if [ ! -f "$ENV_FILE" ]; then
  alert_chat_id="$(sed -n 's/^TELEGRAM_OWNER_CONTROL_ALERT_CHAT_ID=//p; s/^AGENTRESULT_VPS_HEALTH_ALERT_CHAT_ID=//p; s/^TELEGRAM_ALLOWED_USERS=//p' .env 2>/dev/null | head -1 | cut -d, -f1 || true)"
  {
    printf 'AGENTRESULT_VPS_HEALTH_ALERT_CHAT_ID=%s\n' "$alert_chat_id"
    printf 'OWNER_CONTAINER=agentresult-os-telegram-owner-control\n'
    printf 'LOG_FILE=%s\n' "$LOG_FILE"
  } > "$ENV_FILE"
  chmod 600 "$ENV_FILE"
fi

cat >"/etc/systemd/system/${TIMER_NAME}.service" <<SERVICE
[Unit]
Description=AgentResult VPS invariant health guard

[Service]
Type=oneshot
WorkingDirectory=${APP_DIR}
EnvironmentFile=-${ENV_FILE}
ExecStart=${APP_DIR}/scripts/run-agentresult-vps-health-monitor.sh
SERVICE

cat >"/etc/systemd/system/${TIMER_NAME}.timer" <<TIMER
[Unit]
Description=Run AgentResult VPS invariant health guard every ${CHECK_INTERVAL}

[Timer]
OnBootSec=2min
OnUnitActiveSec=${CHECK_INTERVAL}
Unit=${TIMER_NAME}.service
Persistent=true

[Install]
WantedBy=timers.target
TIMER

systemctl daemon-reload
systemctl enable --now "${TIMER_NAME}.timer"
systemctl start "${TIMER_NAME}.service"
systemctl status "${TIMER_NAME}.timer" --no-pager -l | sed -n '1,18p'
systemctl status "${TIMER_NAME}.service" --no-pager -l | sed -n '1,18p' || true
printf 'env file: %s\n' "$ENV_FILE"
tail -40 "$LOG_FILE" || true
REMOTE
