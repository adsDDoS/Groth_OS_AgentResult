#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@91.103.140.101}"
NETWORK_NAME="${NETWORK_NAME:-agentresult-os-net}"
PROXY_CONTAINER_NAME="${PROXY_CONTAINER_NAME:-agentresult-proxy}"
PROXY_CADDYFILE="${PROXY_CADDYFILE:-/opt/agentresult/reverse-proxy/Caddyfile}"
BACKEND_UPSTREAM="${BACKEND_UPSTREAM:-agentresult-os-backend:3000}"
DEMO_API_PREFIX="${DEMO_API_PREFIX:-/api/agentresult-os-demo}"

ssh "$VPS_HOST" \
  "NETWORK_NAME='$NETWORK_NAME' PROXY_CONTAINER_NAME='$PROXY_CONTAINER_NAME' PROXY_CADDYFILE='$PROXY_CADDYFILE' BACKEND_UPSTREAM='$BACKEND_UPSTREAM' DEMO_API_PREFIX='$DEMO_API_PREFIX' bash -s" <<'REMOTE'
set -euo pipefail

docker network inspect "$NETWORK_NAME" >/dev/null
docker inspect "$PROXY_CONTAINER_NAME" >/dev/null
test -f "$PROXY_CADDYFILE"

if ! docker inspect "$PROXY_CONTAINER_NAME" --format '{{range $name, $_ := .NetworkSettings.Networks}}{{println $name}}{{end}}' | grep -qx "$NETWORK_NAME"; then
  docker network connect "$NETWORK_NAME" "$PROXY_CONTAINER_NAME"
fi

cp "$PROXY_CADDYFILE" "$PROXY_CADDYFILE.bak.$(date +%Y%m%d%H%M%S)"

python3 - "$PROXY_CADDYFILE" "$DEMO_API_PREFIX" "$BACKEND_UPSTREAM" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
prefix = sys.argv[2].rstrip("/")
upstream = sys.argv[3]
text = path.read_text()
start = "  # AgentResult OS demo API: begin\n"
end = "  # AgentResult OS demo API: end\n"

block = f"""{start}  @agentresult_os_demo_options {{
    method OPTIONS
    path {prefix}/health {prefix}/me {prefix}/offer {prefix}/demand-map {prefix}/approvals {prefix}/agents {prefix}/analytics/overview {prefix}/content/items {prefix}/publishing/calendar {prefix}/workspace/state {prefix}/tasks
  }}
  handle @agentresult_os_demo_options {{
    uri strip_prefix {prefix}
    reverse_proxy {upstream}
  }}

  @agentresult_os_demo_read {{
    method GET
    path {prefix}/health {prefix}/me {prefix}/offer {prefix}/demand-map {prefix}/approvals {prefix}/agents {prefix}/analytics/overview {prefix}/content/items {prefix}/publishing/calendar {prefix}/workspace/state {prefix}/tasks
  }}
  handle @agentresult_os_demo_read {{
    uri strip_prefix {prefix}
    reverse_proxy {upstream}
  }}

  handle {prefix}/* {{
    respond 404
  }}
{end}"""

if start in text and end in text:
    before, rest = text.split(start, 1)
    _, after = rest.split(end, 1)
    text = before + block + after
else:
    marker = "\n  handle @public_readiness {"
    if marker not in text:
        raise SystemExit("Caddyfile insertion marker not found")
    text = text.replace(marker, "\n" + block + marker, 1)

path.write_text(text)
PY

docker exec "$PROXY_CONTAINER_NAME" caddy validate --config /etc/caddy/Caddyfile
docker exec "$PROXY_CONTAINER_NAME" caddy reload --config /etc/caddy/Caddyfile
docker ps --filter "name=$PROXY_CONTAINER_NAME" --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}'
REMOTE
