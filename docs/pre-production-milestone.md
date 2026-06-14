# AgentResult Pre-Production Milestone

Use this milestone before claiming readiness for the first customer pilot.

## Status

Current state: in progress.

Closed:

- Backend/dashboard/Telegram content-factory core gate exists.
- VPS owner-control health runs through systemd timer.
- GitHub Actions `AgentResult VPS health` runs manually and on a 30-minute
  schedule.
- Backend can enforce API-key access and tenant whitelist through environment
  variables.
- Backup restore drill command exists.

Blocked by operator action:

- Rotate the leaked Telegram owner-control bot token through BotFather.

Still required before customer pilot:

- Deploy backend with `AGENTRESULT_REQUIRE_API_KEY=1`.
- Set `AGENTRESULT_API_KEY` to a generated secret.
- Set `AGENTRESULT_ALLOWED_TENANT_IDS` to the pilot tenant IDs only.
- Run a fresh Postgres backup and restore drill.
- Rotate all pasted or exposed production secrets.

## Required Gates

```bash
npm run content-factory:check
npm run telegram:production-smoke
npm run vps:agentresult-health
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

## Pilot Auth Env

```text
AGENTRESULT_REQUIRE_API_KEY=1
AGENTRESULT_API_KEY=<generated-secret>
AGENTRESULT_ALLOWED_TENANT_IDS=00000000-0000-0000-0000-000000000001,10000000-0000-4000-8000-000000000001
```

`/health` remains public for uptime probes. All other backend API routes require
`x-agentresult-api-key` when the guard is enabled.
