#!/usr/bin/env bash
set -euo pipefail

BACKUP_FILE="${BACKUP_FILE:-${1:-}}"
CONTAINER_NAME="${CONTAINER_NAME:-agentresult-restore-drill-$RANDOM}"
POSTGRES_IMAGE="${POSTGRES_IMAGE:-postgres:16}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-restore_drill_password}"
RESTORE_ROLE="${RESTORE_ROLE:-ai_growth_os}"
RESTORE_DB="${RESTORE_DB:-ai_growth_os}"

if [ -z "$BACKUP_FILE" ]; then
  echo "BACKUP_FILE is required" >&2
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

cleanup() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run -d \
  --name "$CONTAINER_NAME" \
  -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  "$POSTGRES_IMAGE" >/dev/null

for _ in $(seq 1 30); do
  if docker exec "$CONTAINER_NAME" pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

docker exec "$CONTAINER_NAME" pg_isready -U postgres >/dev/null
docker exec "$CONTAINER_NAME" psql -v ON_ERROR_STOP=1 -U postgres -d postgres \
  -c "create role $RESTORE_ROLE login;" \
  -c "create database $RESTORE_DB owner $RESTORE_ROLE;" >/dev/null
docker exec -i "$CONTAINER_NAME" psql -v ON_ERROR_STOP=1 -U postgres -d "$RESTORE_DB" < "$BACKUP_FILE" >/dev/null

table_count="$(docker exec "$CONTAINER_NAME" psql -At -U postgres -d "$RESTORE_DB" -c "select count(*) from information_schema.tables where table_schema = 'public';")"
if [ "${table_count:-0}" -le 0 ]; then
  echo "Restore drill failed: no public tables found after restore" >&2
  exit 1
fi

echo "Restore drill passed: restored $table_count public tables from $BACKUP_FILE"
