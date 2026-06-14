#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@91.103.140.101}"
APP_DIR="${APP_DIR:-/opt/agentresult-os/app}"
EXPECTED_BOT_USERNAME="${EXPECTED_BOT_USERNAME:-groth_os_bot}"
OWNER_CONTAINER="${OWNER_CONTAINER:-agentresult-os-telegram-owner-control}"
OWNER_HOST_PORT="${OWNER_HOST_PORT:-18831}"
NEW_TOKEN="${NEW_TELEGRAM_BOT_TOKEN:-}"

fail() {
  echo "telegram owner-control token rotation failed: $*" >&2
  exit 1
}

[ -n "$NEW_TOKEN" ] || fail "NEW_TELEGRAM_BOT_TOKEN is required"
case "$NEW_TOKEN" in
  *$'\n'*|*$'\r'*|*" "*)
    fail "NEW_TELEGRAM_BOT_TOKEN must be a single token value"
    ;;
esac

TOKEN_B64="$(printf '%s' "$NEW_TOKEN" | base64 | tr -d '\n')"
unset NEW_TOKEN

ssh "$VPS_HOST" \
  "APP_DIR='$APP_DIR' TOKEN_B64='$TOKEN_B64' EXPECTED_BOT_USERNAME='$EXPECTED_BOT_USERNAME' bash -s" <<'REMOTE'
set -euo pipefail

cd "$APP_DIR"
token="$(printf '%s' "$TOKEN_B64" | base64 -d)"
unset TOKEN_B64

bot_username="$(TELEGRAM_BOT_TOKEN="$token" node -e '
const token = process.env.TELEGRAM_BOT_TOKEN;
const response = await fetch("https://api.telegram.org/bot" + token + "/getMe", { method: "POST" });
const body = await response.json();
if (!body.ok || !body.result?.username) {
  console.error("invalid Telegram bot token");
  process.exit(1);
}
console.log(body.result.username);
')"

[ "$bot_username" = "$EXPECTED_BOT_USERNAME" ] || {
  echo "expected bot username @$EXPECTED_BOT_USERNAME, got @$bot_username" >&2
  exit 1
}

[ -f .env ] || {
  echo ".env not found in $APP_DIR" >&2
  exit 1
}

backup=".env.bak-token-rotation-$(date -u +%Y%m%d%H%M%S)"
cp .env "$backup"
chmod 600 "$backup" || true

TOKEN_VALUE="$token" node -e '
const fs = require("fs");
const path = ".env";
const token = process.env.TOKEN_VALUE;
let text = fs.readFileSync(path, "utf8");
const line = "TELEGRAM_BOT_TOKEN=" + token;
if (/^TELEGRAM_BOT_TOKEN=.*$/m.test(text)) {
  text = text.replace(/^TELEGRAM_BOT_TOKEN=.*$/m, line);
} else {
  if (text && !text.endsWith("\n")) text += "\n";
  text += line + "\n";
}
fs.writeFileSync(path, text, { mode: 0o600 });
'
unset token

printf 'bot username ok: @%s\n' "$bot_username"
printf 'env backup: %s\n' "$backup"
REMOTE

CONTAINER_NAME="$OWNER_CONTAINER" \
HOST_PORT="$OWNER_HOST_PORT" \
AGENTRESULT_ENV_SOURCE=file \
scripts/deploy-backend-vps.sh

npm run telegram:production-smoke
npm run vps:agentresult-health

echo "telegram owner-control token rotation passed"
