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

Configurable variables:

- `VPS_HOST`, default `root@91.103.140.101`
- `APP_DIR`, default `/opt/agentresult-os/app`
- `CONTAINER_NAME`, default `agentresult-os-backend`
- `HOST_PORT`, default `18830`

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
