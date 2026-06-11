#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@91.103.140.101}"
APP_DIR="${APP_DIR:-/opt/agentresult-os/app}"
CONTAINER_NAME="${CONTAINER_NAME:-agentresult-os-backend}"
NETWORK_NAME="${NETWORK_NAME:-agentresult-os-net}"
RUNTIME_DIR="${RUNTIME_DIR:-/opt/agentresult-os/backend-runtime}"
HOST_BIND="${HOST_BIND:-127.0.0.1}"
HOST_PORT="${HOST_PORT:-18830}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"
MEMORY_LIMIT="${MEMORY_LIMIT:-384m}"
MEMORY_SWAP="${MEMORY_SWAP:-$MEMORY_LIMIT}"
ALLOW_LOCAL_STORAGE="${AGENTRESULT_ALLOW_LOCAL_STORAGE:-0}"
ENV_SOURCE="${AGENTRESULT_ENV_SOURCE:-container}"
STRIP_TELEGRAM_ENV="${STRIP_TELEGRAM_ENV:-0}"

ssh "$VPS_HOST" \
  "APP_DIR='$APP_DIR' CONTAINER_NAME='$CONTAINER_NAME' NETWORK_NAME='$NETWORK_NAME' RUNTIME_DIR='$RUNTIME_DIR' HOST_BIND='$HOST_BIND' HOST_PORT='$HOST_PORT' CONTAINER_PORT='$CONTAINER_PORT' MEMORY_LIMIT='$MEMORY_LIMIT' MEMORY_SWAP='$MEMORY_SWAP' ALLOW_LOCAL_STORAGE='$ALLOW_LOCAL_STORAGE' ENV_SOURCE='$ENV_SOURCE' STRIP_TELEGRAM_ENV='$STRIP_TELEGRAM_ENV' bash -s" <<'REMOTE'
set -euo pipefail

cd "$APP_DIR"

if [ "$ENV_SOURCE" = "file" ]; then
  if [ ! -f .env ]; then
    echo "AGENTRESULT_ENV_SOURCE=file but .env was not found in $APP_DIR" >&2
    exit 1
  fi
  cp .env /tmp/agentresult-backend.env
elif docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  docker inspect "$CONTAINER_NAME" --format '{{range .Config.Env}}{{println .}}{{end}}' > /tmp/agentresult-backend.env
else
  if [ ! -f .env ]; then
    echo "No running backend container and no .env found in $APP_DIR" >&2
    exit 1
  fi
  cp .env /tmp/agentresult-backend.env
fi

if [ "$STRIP_TELEGRAM_ENV" = "1" ]; then
  sed -i '/^\(TELEGRAM_\|HERMES_TELEGRAM_\|AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_\)/d' /tmp/agentresult-backend.env
fi

STORAGE_MODE="$(grep -E '^AI_GROWTH_OS_STORAGE=' /tmp/agentresult-backend.env | tail -1 | cut -d= -f2- || true)"
if [ "${STORAGE_MODE:-auto}" = "local" ] && [ "$ALLOW_LOCAL_STORAGE" != "1" ]; then
  echo "Refusing deploy: backend is configured with AI_GROWTH_OS_STORAGE=local." >&2
  echo "For private pilot use Postgres storage. For an explicit demo deploy, rerun with AGENTRESULT_ALLOW_LOCAL_STORAGE=1." >&2
  rm -f /tmp/agentresult-backend.env
  exit 2
fi

git pull --ff-only origin main
SHA="$(git rev-parse --short HEAD)"

docker build -f apps/backend/Dockerfile -t "agentresult-os-backend:$SHA" .

if [ "${STORAGE_MODE:-auto}" != "local" ]; then
  docker run --rm \
    --network "$NETWORK_NAME" \
    -v "$RUNTIME_DIR:/runtime" \
    --env-file /tmp/agentresult-backend.env \
    "agentresult-os-backend:$SHA" \
    node apps/backend/dist/db/migrate.js
fi

if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  docker stop "$CONTAINER_NAME" >/dev/null || true
  docker rm "$CONTAINER_NAME" >/dev/null || true
fi

docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --network "$NETWORK_NAME" \
  --memory "$MEMORY_LIMIT" \
  --memory-swap "$MEMORY_SWAP" \
  -p "$HOST_BIND:$HOST_PORT:$CONTAINER_PORT" \
  -v "$RUNTIME_DIR:/runtime" \
  --env-file /tmp/agentresult-backend.env \
  "agentresult-os-backend:$SHA"

rm -f /tmp/agentresult-backend.env
docker ps --filter "name=$CONTAINER_NAME" --format '{{.Names}} {{.Image}} {{.Status}}'
REMOTE
