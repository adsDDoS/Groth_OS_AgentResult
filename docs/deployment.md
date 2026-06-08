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
https://joined-detailed-their-pets.trycloudflare.com/api/agentresult-os-demo
```

This is intentionally a read-only dashboard demo contour. It must not start LAB agents, OS Hermes, Telegram polling, or a second public Caddy on ports `80`/`443`.

VPS containers for the demo contour:

- `agentresult-os-postgres`: demo Postgres, memory-limited.
- `agentresult-os-backend`: demo API, memory-limited, `AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING=0`.
- `agentresult-os-hermes`: keep stopped unless explicitly testing Hermes generation.

The public route is added to the existing `agentresult-proxy` Caddy container with:

```bash
scripts/deploy-demo-api-proxy-vps.sh
```

That script connects `agentresult-proxy` to `agentresult-os-net` and adds only this read-only prefix:

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
- Replace the quick `trycloudflare.com` URL with a named tunnel or stable domain before customer-facing use.

## Backups

```bash
bash scripts/backup-postgres.sh
```

Store backups outside the VPS as well.

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
