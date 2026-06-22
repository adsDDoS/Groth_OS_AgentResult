# AgentResult Pre-Production Milestone

Use this milestone before claiming readiness for the first customer pilot.

## Status

Current state: production readiness cut completed for software/runtime gates.

Paid pilot status: ready to schedule the first private paid pilot after the
operator rotates the Telegram owner-control token through BotFather.

Closed:

- Backend/dashboard/Telegram content-factory core gate exists.
- VPS owner-control health runs through systemd timer.
- GitHub Actions `AgentResult VPS health` runs manually and on a 30-minute
  schedule.
- Backend can enforce API-key access and tenant whitelist through environment
  variables.
- Backup restore drill command exists.
- Pilot week execution/review loop is backend-owned through week 5 and creates
  `pilot_week_6_scope` from the shared scope proposal builder.
- Telegram advisor intent is read-only and supports short follow-up context
  history without state mutation.
- Production backend and Telegram owner-control are deployed on `be3b96a`.
- Production backend and owner-control enforce `AGENTRESULT_REQUIRE_API_KEY=1`.
- Production tenant allowlist is restricted to the demo tenant and pilot tenant.
- Production Telegram owner-control `/pilot`, advisor, follow-up, week command
  boundary, API-key guard, and blocked-tenant guard have been smoke-tested.
- Fresh VPS Postgres backup and restore drill passed on 2026-06-22.

Blocked by operator action:

- Rotate the leaked Telegram owner-control bot token through BotFather.

Still required before customer pilot:

- Rotate the Telegram owner-control bot token through BotFather with
  `NEW_TELEGRAM_BOT_TOKEN=<new-token> npm run vps:rotate-owner-token`.
- Rotate any other pasted or exposed production secrets.

## Required Gates

```bash
npm run content-factory:check
npm run auth:tenant-guard:check
npm run telegram:regression
npm run telegram:day-seven-review:check
npm run pilot:week-two-execution:check
npm run dashboard:smoke
npm run telegram:production-smoke
npm run telegram:pilot-production-smoke
npm run telegram:polling-invariant
npm run vps:agentresult-health
npm run vps:restore-drill
```

GitHub Actions:

```text
AgentResult VPS health -> latest scheduled/manual run is green
Dashboard smoke -> latest main run is green
```

Backup restore:

```bash
bash scripts/backup-postgres.sh
BACKUP_FILE=./backups/<backup>.sql npm run db:restore-drill
```

VPS backup restore:

```bash
backup_file="$(npm run --silent vps:backup-postgres)"
BACKUP_FILE="$backup_file" npm run vps:restore-drill
```

The VPS backup command defaults to the active `agentresult-postgres` container,
which is attached to `agentresult-os-net` with the `agentresult-os-postgres`
alias used by the backend `DATABASE_URL`.

## Pilot Auth Env

```text
AGENTRESULT_REQUIRE_API_KEY=1
AGENTRESULT_API_KEY=<generated-secret>
AGENTRESULT_ALLOWED_TENANT_IDS=00000000-0000-0000-0000-000000000001,10000000-0000-4000-8000-000000000001
```

`/health` remains public for uptime probes. All other backend API routes require
`x-agentresult-api-key` when the guard is enabled.

## Tenant Reset Policy

Demo tenant `00000000-0000-0000-0000-000000000001` may be reset by demo smoke
and reset scripts.

Pilot tenant `10000000-0000-4000-8000-000000000001` must not be reset during
client demo or paid pilot operation without an explicit operator action recorded
for that tenant.
