#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@91.103.140.101}"
NETWORK_NAME="${NETWORK_NAME:-agentresult-os-net}"
CONTAINER_NAME="${CONTAINER_NAME:-agentresult-os-demo-api-proxy}"
BACKEND_UPSTREAM="${BACKEND_UPSTREAM:-agentresult-os-backend:3000}"
DEMO_API_DOMAIN="${DEMO_API_DOMAIN:-91-103-140-101.sslip.io}"

ssh "$VPS_HOST" \
  "NETWORK_NAME='$NETWORK_NAME' CONTAINER_NAME='$CONTAINER_NAME' BACKEND_UPSTREAM='$BACKEND_UPSTREAM' DEMO_API_DOMAIN='$DEMO_API_DOMAIN' bash -s" <<'REMOTE'
set -euo pipefail

docker network inspect "$NETWORK_NAME" >/dev/null

mkdir -p /opt/agentresult-os/demo-api-proxy
cat > /opt/agentresult-os/demo-api-proxy/Caddyfile <<CADDY
${DEMO_API_DOMAIN} {
  encode zstd gzip

  header {
    Access-Control-Allow-Origin "*"
    Access-Control-Allow-Methods "GET, OPTIONS"
    Access-Control-Allow-Headers "content-type, x-tenant-id"
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options "nosniff"
    Referrer-Policy "strict-origin-when-cross-origin"
  }

  @options method OPTIONS
  respond @options 204

  @demoRead {
    method GET
    path /health /me /offer /demand-map /approvals /agents /analytics/overview /content/items /publishing/calendar /workspace/state /tasks
  }
  reverse_proxy @demoRead ${BACKEND_UPSTREAM}

  respond 404
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
  -p 80:80 \
  -p 443:443 \
  -v /opt/agentresult-os/demo-api-proxy/Caddyfile:/etc/caddy/Caddyfile:ro \
  -v agentresult_demo_api_caddy_data:/data \
  -v agentresult_demo_api_caddy_config:/config \
  caddy:2-alpine

docker ps --filter "name=$CONTAINER_NAME" --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}'
REMOTE
