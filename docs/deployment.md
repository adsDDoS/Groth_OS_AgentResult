# Deployment

## Local Docker

```bash
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d --build
```

## Dashboard Vercel

Use the smoke-gated deploy command from the repository root:

```bash
npm run dashboard:deploy
```

This runs the owner-flow smoke suite before production deploy:

- Today cockpit
- Strategy
- Company setup
- Publications manual handoff
- Results handoff signal
- release confirmation
- RU/ENG switch

For a local check without deploy:

```bash
npm run dashboard:smoke
```

The GitHub Actions workflow `.github/workflows/dashboard-smoke.yml` runs the same smoke suite on pull requests and pushes to `main`.

## Backend Access Guard

Local development and disposable demos may keep the default header-based tenant
selection. Customer pilot and production deployments must enable the API-key and
tenant whitelist guard:

```text
AGENTRESULT_REQUIRE_API_KEY=1
AGENTRESULT_API_KEY=<generated-secret>
AGENTRESULT_ALLOWED_TENANT_IDS=00000000-0000-0000-0000-000000000001,10000000-0000-4000-8000-000000000001
```

When enabled, `/health` stays public for uptime checks. Other backend routes
require `x-agentresult-api-key` and the request tenant must be listed in
`AGENTRESULT_ALLOWED_TENANT_IDS`.

Check the guard locally:

```bash
npm run auth:tenant-guard:check
```

## VPS

1. Create a Linux VPS.
2. Install Docker and Docker Compose plugin.
3. Clone your repository.
4. Copy `.env.example` to `.env`.
5. Set production values:
   - `DATABASE_URL`
   - `POSTGRES_PASSWORD`
   - `JWT_SECRET`
   - `OPENROUTER_API_KEY`
   - `CADDY_DOMAIN`
   - optional Telegram and SMTP values
   - optional Hermes Telegram values from `docs/hermes-telegram-bot.md`
6. Point DNS to the VPS.
7. Start services:

```bash
docker compose -f infra/docker-compose.yml up -d --build
```

8. Check health:

```bash
curl https://your-domain.example/health
```

## Storage Modes

Use separate storage modes for demo and private pilot.

- `AI_GROWTH_OS_STORAGE=local` is only for local development, smoke tests, and disposable demos. It stores state in a runtime JSON file and is not a private-pilot persistence layer.
- Private pilot and customer-facing VPS deployments must use Postgres through `DATABASE_URL`.
- Do not rely on implicit `auto` fallback for pilot data. If Postgres is unavailable, the deployment should fail loudly instead of silently becoming a file-backed demo.

Recommended private-pilot env:

```bash
AI_GROWTH_OS_STORAGE=postgres
DATABASE_URL=postgres://ai_growth_os:<strong-password>@postgres:5432/ai_growth_os
```

The backend deploy script refuses to deploy `AI_GROWTH_OS_STORAGE=local` unless explicitly run with:

```bash
AGENTRESULT_ALLOW_LOCAL_STORAGE=1 scripts/deploy-backend-vps.sh
```

Use that override only for a disposable demo.

## Backend Deploy

Use the smoke-gated local checks first:

```bash
npm run lint
npm run build
npm run telegram:regression
```

Then deploy only the backend container:

```bash
scripts/deploy-backend-vps.sh
```

For the read-only Vercel demo backend, strip Telegram owner-control env while reusing the current container env:

```bash
STRIP_TELEGRAM_ENV=1 scripts/deploy-backend-vps.sh
```

This keeps the demo API separate from the Telegram owner-control container. The demo backend should not keep `TELEGRAM_*`, `HERMES_TELEGRAM_*`, or `AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_*` values in its runtime env.

For a local-storage to Postgres cutover on VPS:

1. Create or update `/opt/agentresult-os/app/.env` with `AI_GROWTH_OS_STORAGE=postgres` and `DATABASE_URL`.
2. Keep the previous runtime JSON mounted in `/opt/agentresult-os/backend-runtime`.
3. Deploy from the env file so the old local-storage container env is not reused:

```bash
AGENTRESULT_ENV_SOURCE=file scripts/deploy-backend-vps.sh
```

The deploy script runs Postgres migrations before starting the backend when storage is not `local`.

4. Import the previous local state once:

```bash
docker run --rm \
  --network agentresult-os-net \
  -v /opt/agentresult-os/backend-runtime:/runtime \
  --env-file /opt/agentresult-os/app/.env \
  agentresult-os-backend:<sha> \
  node apps/backend/dist/db/import-local-json.js /runtime/agentresult-os.local-data.json --apply
```

Configurable variables:

- `VPS_HOST`, default `root@91.103.140.101`
- `APP_DIR`, default `/opt/agentresult-os/app`
- `CONTAINER_NAME`, default `agentresult-os-backend`
- `HOST_PORT`, default `18830`

## Production-Safe OS Demo

The Vercel dashboard demo uses the pilot tenant:

```text
10000000-0000-4000-8000-000000000001
```

Demo URL:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=pilot#/overview
```

Current demo API base:

```text
https://dashboard-orpin-mu-26.vercel.app/api/agentresult-os-demo
```

This is intentionally a read-only dashboard demo contour. It must not start LAB agents, OS Hermes, Telegram polling, or a public Caddy on ports `80`/`443`. The browser uses a stable Vercel same-origin API path; Vercel serverless proxies to a small HTTP-only read-only proxy on the VPS.

VPS containers for the demo contour:

- `agentresult-os-postgres`: demo Postgres, memory-limited.
- `agentresult-os-backend`: demo API, memory-limited, `AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING=0`.
- `agentresult-os-demo-readonly-proxy`: HTTP-only upstream for Vercel serverless, memory limit `128m/128m`.
- `agentresult-os-hermes`: keep stopped unless explicitly testing Hermes generation.

The VPS read-only upstream proxy is deployed with:

```bash
scripts/deploy-demo-api-proxy-vps.sh
```

That script starts `agentresult-os-demo-readonly-proxy` on `:18082` with only this read-only upstream surface:

```text
http://91.103.140.101:18082
```

The stable Vercel API prefix is:

```text
/api/agentresult-os-demo
```

Allowed methods and paths:

- `GET` / `OPTIONS`
- `/health`
- `/me`
- `/offer`
- `/demand-map`
- `/approvals`
- `/agents`
- `/analytics/overview`
- `/publication-results`
- `/distribution-signals`
- `/result-signals`
- `/content/items`
- `/publishing/calendar`
- `/workspace/state`
- `/tasks`

Smoke check:

```bash
scripts/smoke-demo-api-proxy-vps.sh
```

Expected result:

```text
health ok
demo approvals ok
demo results ok
```

Before Vercel deploy:

```bash
node --check apps/dashboard/app.js
npm run lint
npm run build
```

Deploy dashboard:

```bash
cd apps/dashboard
npx vercel --prod
```

Operational guardrails:

- Keep `agentresult-os-hermes` stopped for the dashboard demo.
- Keep `AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING=0` for `agentresult-os-backend`.
- Do not expose write routes through the demo prefix.
- Do not run LAB/n8n/debtorpilot while working on this 3.8 GB VPS.
- Keep the customer-facing demo on the stable Vercel URL. If moving off Vercel serverless later, replace the VPS upstream with a named Cloudflare tunnel or real API domain.

## Production Telegram Owner-Control

Run Telegram owner-control as a separate backend container from the read-only Vercel demo backend.

Start with the one-page SRE runbook for any VPS operation:
[`docs/agentresult-vps-sre-runbook.md`](agentresult-vps-sre-runbook.md).

Current container split:

- `agentresult-os-backend`: Vercel demo API, `127.0.0.1:18830`, no Telegram polling.
- `agentresult-os-telegram-owner-control`: Telegram polling backend, `127.0.0.1:18831`, same Postgres state, `AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING=1`.

The owner-control bot token must stay polling-only in this contour. When
`AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING=1`, backend startup clears the
Telegram webhook with `drop_pending_updates=false` before polling. Do not add a
deploy step that calls Telegram `setWebhook` for the same token unless the
owner-control container is deliberately switched out of polling mode.
The same bot token must not be present in the regular demo API container. Deploy
the demo API with `STRIP_TELEGRAM_ENV=1` and keep token-bearing Telegram env
only in `agentresult-os-telegram-owner-control`.

The Telegram owner-control container should use the same pilot tenant that Vercel demo opens:

```text
AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_TENANT_ID=10000000-0000-4000-8000-000000000001
AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_USER_ID=77777777-7777-4777-8777-777777777771
```

Deploy or refresh only the Telegram owner-control container:

```bash
CONTAINER_NAME=agentresult-os-telegram-owner-control \
HOST_PORT=18831 \
AGENTRESULT_ENV_SOURCE=file \
scripts/deploy-backend-vps.sh
```

Required checks:

```bash
npm run telegram:production-smoke
npm run vps:agentresult-health
```

For a deploy-specific image tag gate, run either check with
`EXPECTED_IMAGE_TAG=<git-short-sha>`.

Optional recurring monitor:

```bash
npm run telegram:production-monitor
npm run vps:agentresult-health:install-timer
```

`npm run telegram:production-monitor` runs the full VPS health guard, appends a
timestamped line to `/opt/agentresult-os/runtime/telegram-owner-control-monitor.log`,
and can send a short Telegram alert when `TELEGRAM_OWNER_CONTROL_ALERT_CHAT_ID`
is set locally.

`npm run vps:agentresult-health:install-timer` installs a VPS-side systemd
timer named `agentresult-vps-health.timer`. By default it runs every 15 minutes,
writes full output to `/opt/agentresult-os/runtime/agentresult-vps-health.log`,
uses the repository checkout at `/opt/agentresult-os/app`, and sends a Telegram
alert on failure.

The timer reads alert settings from:

```text
/opt/agentresult-os/runtime/agentresult-vps-health.env
```

`AGENTRESULT_VPS_HEALTH_ALERT_CHAT_ID` should contain the Telegram user or chat
id that receives failure alerts. The installer creates this file on first run
from `TELEGRAM_OWNER_CONTROL_ALERT_CHAT_ID`, `AGENTRESULT_VPS_HEALTH_ALERT_CHAT_ID`,
or the first `TELEGRAM_ALLOWED_USERS` value in `/opt/agentresult-os/app/.env`.
Edit the runtime env file directly if alerts should go to another owner channel.

Run a safe alert drill without stopping real services:

```bash
npm run vps:agentresult-health:drill
```

The drill forces a fake failing health command, writes to
`/opt/agentresult-os/runtime/agentresult-vps-health-drill.log`, requires the
failure marker and dry-run alert marker, and then runs the real health guard.
It does not stop containers, disable systemd units, change webhooks, or send a
real Telegram message.

There is also a GitHub Actions workflow named `AgentResult VPS health`. It runs
every 30 minutes and can be run manually from Actions. Configure repository
secret `AGENTRESULT_VPS_SSH_KEY` with a private key that can SSH into the VPS.
The optional `expected_owner_image_tag` input turns on strict image-tag checking
for manual runs.

Expected state:

- both backend containers are memory-limited;
- `agentresult-os-telegram-owner-control` runs the current git short SHA image tag;
- `agentresult-os-telegram-owner-control` logs `Telegram owner-control polling middleware is enabled`;
- Telegram webhook URL is empty;
- the deployed bundle contains the Telegram publication-result confirmation dialog;
- Hermes is not polling the same bot token;
- classic Hermes Telegram gateway containers (`agentresult-agent-*`) are stopped or rebuilt without `TELEGRAM_BOT_TOKEN` for this owner-control bot;
- ordinary owner phrases route through backend intent logic;
- Vercel demo and Telegram owner-control use the same tenant state.

Do not start the classic `agentresult-agent-*` Telegram gateway containers against the owner-control bot token during Growth Control production cutover. They run Hermes `gateway run` and will compete for Telegram `getUpdates`, causing missed updates, noisy errors, and possible owner-facing tool/terminal leakage. If the classic agents are needed again, recreate them without this bot token or assign them a separate bot token and allowlist.

Quick cutover verification:

```bash
npm run telegram:production-smoke
```

### VPS recovery checklist

Use this checklist after any manual VPS work, cross-project deploy, disk cleanup,
or accidental SSH change.

Required AgentResult OS state:

- `agentresult-os-backend` is running on `127.0.0.1:18830` without Telegram
  polling env.
- `agentresult-os-telegram-owner-control` is running on `127.0.0.1:18831`
  with `AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING=1`.
- `agentresult-client-owner-updates.service` is `enabled` and `active` unless a
  deliberate owner-notification migration replaces it.
- Telegram webhook URL for the owner-control bot is empty. This contour uses
  polling, not webhook delivery.
- The owner-control bot token exists only in
  `agentresult-os-telegram-owner-control`; no demo backend or Hermes gateway
  container may share it.

Do not do these during unrelated VPS work:

- Do not remove `agentresult-os-telegram-owner-control`.
- Do not disable `agentresult-client-owner-updates.service`.
- Do not call Telegram `setWebhook` for the owner-control bot.
- Do not put `TELEGRAM_BOT_TOKEN` into `agentresult-os-backend`.
- Do not start classic `agentresult-agent-*` Telegram polling containers with
  the same owner-control bot token.

Fast inspection:

```bash
ssh root@91.103.140.101 'docker ps --format "{{.Names}} {{.Image}} {{.Status}} {{.Ports}}" | grep -E "agentresult-os-(backend|telegram-owner-control)"'
ssh root@91.103.140.101 'systemctl is-enabled agentresult-client-owner-updates.service && systemctl is-active agentresult-client-owner-updates.service'
npm run vps:agentresult-health
```

Restore deleted owner-control container:

```bash
CONTAINER_NAME=agentresult-os-telegram-owner-control \
HOST_PORT=18831 \
AGENTRESULT_ENV_SOURCE=file \
scripts/deploy-backend-vps.sh
```

Restore disabled owner update service:

```bash
ssh root@91.103.140.101 'systemctl enable --now agentresult-client-owner-updates.service'
```

After recovery, `npm run vps:agentresult-health` must print
`agentresult vps health passed`.

Before larger product or visual changes, run the local Content Factory Core gate:

```bash
npm run content-factory:check
```

It verifies approval side effects, publishing commands, publication results,
Telegram owner-control regression, the polling/webhook invariant, and the
dashboard publication flow. For a backend-only pass, set
`CONTENT_FACTORY_SKIP_DASHBOARD_SMOKE=1`.

## Backups

```bash
bash scripts/backup-postgres.sh
```

Store backups outside the VPS as well.

Run a restore drill before customer pilot and after backup changes:

```bash
BACKUP_FILE=./backups/<backup>.sql npm run db:restore-drill
```

The restore drill starts a disposable Postgres container, restores the SQL file,
verifies that public tables exist, and removes the container on exit.

For the AgentResult VPS, create and drill a fresh backup in-place:

```bash
backup_file="$(npm run --silent vps:backup-postgres)"
BACKUP_FILE="$backup_file" npm run vps:restore-drill
```

The VPS drill uses a disposable Postgres container on the VPS and removes it on
exit.

## Production Notes

- Replace dev tenant auth with proper authentication before customer use.
- Rotate secrets before private-pilot use.
- Restrict database ports.
- Use API keys for agent workers.
- Enable logs and monitoring.
- Test restore from backup.

## Security Checklist

Treat any secret pasted into chat, shell history, screenshots, or logs as compromised.

Rotate before private pilot:

- Telegram bot token through BotFather.
- OpenRouter API key.
- VPS root password; prefer SSH keys and disable password login.
- `JWT_SECRET`.
- `HERMES_API_KEY`.
- `POSTGRES_PASSWORD`.
- Any future CRM, email, Google, Notion, Airtable, Vercel, or analytics tokens.

Secret placement:

- VPS runtime secrets live only in `/opt/agentresult-os/app/.env` or the managed server secret store.
- Do not commit `.env` or runtime JSON data.
- Do not print env files in chat, CI logs, or Telegram.
- Hermes-specific Telegram variables stay inside the Hermes service mapping: `HERMES_TELEGRAM_BOT_TOKEN` -> `TELEGRAM_BOT_TOKEN`.
