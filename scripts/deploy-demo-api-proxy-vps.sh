#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@91.103.140.101}"
NETWORK_NAME="${NETWORK_NAME:-agentresult-os-net}"
CONTAINER_NAME="${CONTAINER_NAME:-agentresult-os-demo-readonly-proxy}"
BACKEND_UPSTREAM="${BACKEND_UPSTREAM:-agentresult-os-backend:3000}"
HOST_PORT="${HOST_PORT:-18082}"

ssh "$VPS_HOST" \
  "NETWORK_NAME='$NETWORK_NAME' CONTAINER_NAME='$CONTAINER_NAME' BACKEND_UPSTREAM='$BACKEND_UPSTREAM' HOST_PORT='$HOST_PORT' bash -s" <<'REMOTE'
set -euo pipefail

docker network inspect "$NETWORK_NAME" >/dev/null
docker inspect agentresult-os-backend >/dev/null

mkdir -p /opt/agentresult-os/demo-readonly-proxy
cat > /opt/agentresult-os/demo-readonly-proxy/Caddyfile <<CADDY
:80 {
  encode gzip

  @demoOptions {
    method OPTIONS
    path /health /me /offer /demand-map /approvals /agents /analytics/overview /content/items /publishing/calendar /workspace/state /tasks
  }
  handle @demoOptions {
    reverse_proxy ${BACKEND_UPSTREAM}
  }

  @demoRead {
    method GET
    path /health /me /offer /demand-map /approvals /agents /analytics/overview /content/items /publishing/calendar /workspace/state /tasks
  }
  handle @demoRead {
    reverse_proxy ${BACKEND_UPSTREAM}
  }

  handle {
    respond 404
  }
}
CADDY

if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  docker stop "$CONTAINER_NAME" >/dev/null || true
  docker rm "$CONTAINER_NAME" >/dev/null || true
fi

docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --network "$NETWORK_NAME" \
  --memory 128m \
  --memory-swap 128m \
  -p "$HOST_PORT:80" \
  -v /opt/agentresult-os/demo-readonly-proxy/Caddyfile:/etc/caddy/Caddyfile:ro \
  caddy:2-alpine >/dev/null

docker exec "$CONTAINER_NAME" caddy validate --config /etc/caddy/Caddyfile
docker ps --filter "name=$CONTAINER_NAME" --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}'
REMOTE
