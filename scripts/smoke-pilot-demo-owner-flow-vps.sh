#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST:-root@91.103.140.101}"
OWNER_CONTAINER="${OWNER_CONTAINER:-agentresult-os-telegram-owner-control}"
BACKEND_IMAGE="${BACKEND_IMAGE:-}"
OWNER_URL="${OWNER_URL:-http://127.0.0.1:18831}"

ssh "$VPS_HOST" \
  "OWNER_CONTAINER='$OWNER_CONTAINER' BACKEND_IMAGE='$BACKEND_IMAGE' OWNER_URL='$OWNER_URL' bash -s" <<'REMOTE'
set -euo pipefail

fail() {
  echo "pilot demo owner-flow smoke failed: $*" >&2
  exit 1
}

env_output="$(docker inspect "$OWNER_CONTAINER" --format '{{range .Config.Env}}{{println .}}{{end}}')"
api_key="$(printf '%s\n' "$env_output" | sed -n 's/^AGENTRESULT_API_KEY=//p' | tail -1)"
tenant_id="$(printf '%s\n' "$env_output" | sed -n 's/^AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_TENANT_ID=//p' | tail -1)"
[ -n "$api_key" ] || fail "AGENTRESULT_API_KEY is missing in $OWNER_CONTAINER"
[ -n "$tenant_id" ] || fail "AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_TENANT_ID is missing in $OWNER_CONTAINER"

if [ -z "$BACKEND_IMAGE" ]; then
  BACKEND_IMAGE="$(docker inspect "$OWNER_CONTAINER" --format '{{.Config.Image}}')"
fi

reset_demo() {
  docker run --rm \
    --network agentresult-os-net \
    --env-file /opt/agentresult-os/app/.env \
    "$BACKEND_IMAGE" \
    node apps/backend/dist/db/reset-pilot-demo.js >/dev/null
}

reset_demo

API_KEY="$api_key" TENANT_ID="$tenant_id" OWNER_URL="$OWNER_URL" node <<'NODE'
const apiKey = process.env.API_KEY;
const tenantId = process.env.TENANT_ID;
const ownerUrl = process.env.OWNER_URL;

async function intent(text) {
  const response = await fetch(`${ownerUrl}/telegram/intent`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-tenant-id": tenantId,
      "x-agentresult-api-key": apiKey
    },
    body: JSON.stringify({ text })
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`${text}: ${response.status} ${JSON.stringify(body)}`);
  return body.data;
}

function assert(condition, message, data) {
  if (!condition) throw new Error(`${message}: ${JSON.stringify(data)}`);
}

const steps = [];

let data = await intent("что готово");
assert(data.intent === "ready_for_decision", "ready intent mismatch", data);
assert(data.text.includes("Ждёт решения: 1"), "ready should show one pending decision", data);
steps.push({ phrase: "что готово", intent: data.intent, decisions: data.ownerBrief?.counts?.decisions });

data = await intent("покажи первый");
assert(data.intent === "show_material", "show material intent mismatch", data);
assert(data.text.includes("AgentResult готовит материал") && data.text.includes("Следующий шаг"), "show first should include material and next action", data);
steps.push({ phrase: "покажи первый", intent: data.intent });

data = await intent("согласую");
assert(data.intent === "approve_current", "approve current intent mismatch", data);
assert(data.text.toLowerCase().includes("согласовано"), "approve should confirm decision", data);
steps.push({ phrase: "согласую", intent: data.intent, decisions: data.ownerBrief?.counts?.decisions });

data = await intent("передал в выпуск");
assert(data.intent === "manual_handoff", "handoff intent mismatch", data);
assert(data.text.includes("Передано в выпуск вручную"), "handoff should confirm manual release handoff", data);
steps.push({ phrase: "передал в выпуск", intent: data.intent, handedOff: data.ownerBrief?.counts?.handedOff });

data = await intent("вышло");
assert(data.intent === "confirm_published", "confirm published intent mismatch", data);
assert(data.text.includes("Пришлите URL публикации"), "confirm live should ask for URL", data);
steps.push({ phrase: "вышло", intent: data.intent });

data = await intent("https://t.me/agentresult/300");
assert(data.intent === "publication_result_confirmation_url", "publication URL intent mismatch", data);
assert(data.text.includes("Укажите формат"), "URL step should ask for format", data);
steps.push({ phrase: "URL", intent: data.intent });

data = await intent("telegram_post");
assert(data.intent === "publication_result_confirmation_format", "publication format intent mismatch", data);
assert(data.text.includes("Укажите первичные реакции"), "format step should ask for reactions", data);
steps.push({ phrase: "telegram_post", intent: data.intent });

data = await intent("комментарии 2, репосты 1, сохранения 3, реакции 8");
assert(data.intent === "publication_result_confirmation_complete", "publication result complete intent mismatch", data);
assert(data.text.includes("Данные результата сохранены"), "reactions step should save result", data);
assert(data.ownerBrief?.counts?.published === 2, "published count should become 2", data);
assert(data.ownerBrief?.counts?.handedOff === 0, "handoff count should return to 0", data);
steps.push({ phrase: "реакции", intent: data.intent, published: data.ownerBrief.counts.published });

data = await intent("что по результату");
assert(data.intent === "result", "result intent mismatch", data);
assert(data.text.includes("Вышло: 2"), "result should show 2 published after full flow", data);
assert(!data.text.includes("Деньги: 0"), "result should not show empty money", data);
steps.push({ phrase: "что по результату", intent: data.intent, published: data.ownerBrief?.counts?.published });

console.log(JSON.stringify({ ok: true, tenantId, steps }, null, 2));
NODE

reset_demo
echo "pilot demo owner-flow smoke passed and demo tenant reset"
REMOTE
