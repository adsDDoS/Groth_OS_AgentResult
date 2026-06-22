#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@91.103.140.101}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-agentresult-postgres}"
BACKUP_DIR="${BACKUP_DIR:-/opt/agentresult-os/backups}"
POSTGRES_USER="${POSTGRES_USER:-ai_growth_os}"
POSTGRES_DB="${POSTGRES_DB:-ai_growth_os}"

ssh "$VPS_HOST" \
  "POSTGRES_CONTAINER='$POSTGRES_CONTAINER' BACKUP_DIR='$BACKUP_DIR' POSTGRES_USER='$POSTGRES_USER' POSTGRES_DB='$POSTGRES_DB' bash -s" <<'REMOTE'
set -euo pipefail

mkdir -p "$BACKUP_DIR"
stamp="$(date +%Y%m%d-%H%M%S)"
backup_file="$BACKUP_DIR/agentresult-$stamp.sql"

docker exec "$POSTGRES_CONTAINER" \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  > "$backup_file"

test -s "$backup_file"
printf '%s\n' "$backup_file"
REMOTE
