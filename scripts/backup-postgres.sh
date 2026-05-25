#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

docker compose -f infra/docker-compose.yml exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-ai_growth_os}" "${POSTGRES_DB:-ai_growth_os}" \
  > "$BACKUP_DIR/ai-growth-os-$STAMP.sql"

echo "Backup written to $BACKUP_DIR/ai-growth-os-$STAMP.sql"
