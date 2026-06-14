#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@91.103.140.101}"
APP_DIR="${APP_DIR:-/opt/agentresult-os/app}"
TIMER_NAME="${TIMER_NAME:-agentresult-vps-health}"
CHECK_INTERVAL="${CHECK_INTERVAL:-15min}"
LOG_FILE="${LOG_FILE:-/opt/agentresult-os/runtime/agentresult-vps-health.log}"

ssh "$VPS_HOST" \
  "APP_DIR='$APP_DIR' TIMER_NAME='$TIMER_NAME' CHECK_INTERVAL='$CHECK_INTERVAL' LOG_FILE='$LOG_FILE' bash -s" <<'REMOTE'
set -euo pipefail

cd "$APP_DIR"
git pull --ff-only origin main

cat >"/etc/systemd/system/${TIMER_NAME}.service" <<SERVICE
[Unit]
Description=AgentResult VPS invariant health guard

[Service]
Type=oneshot
WorkingDirectory=${APP_DIR}
ExecStart=/usr/bin/env bash -lc 'npm run vps:agentresult-health >> ${LOG_FILE} 2>&1'
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
systemctl status "${TIMER_NAME}.service" --no-pager -l | sed -n '1,18p'
tail -40 "$LOG_FILE" || true
REMOTE
