# AgentResult VPS SRE Runbook

[![AgentResult VPS health](https://github.com/adsDDoS/Groth_OS_AgentResult/actions/workflows/agentresult-vps-health.yml/badge.svg)](https://github.com/adsDDoS/Groth_OS_AgentResult/actions/workflows/agentresult-vps-health.yml)

Use this page before and after any AgentResult VPS work. This is the operational
source of truth for keeping the owner-control contour alive.

Scope:

- Project: AgentResult OS / GrothOS content factory.
- VPS: `root@91.103.140.101`.
- Repo checkout on VPS: `/opt/agentresult-os/app`.
- Runtime files on VPS: `/opt/agentresult-os/runtime`.
- This is not freebuff infrastructure. Do not treat AgentResult containers as
  disposable during unrelated VPS cleanup.

## Expected State

- `agentresult-os-backend` is running on `127.0.0.1:18830->3000/tcp`.
- `agentresult-os-backend` has no `TELEGRAM_BOT_TOKEN`.
- `agentresult-os-backend` does not run owner-control polling.
- `agentresult-os-telegram-owner-control` is running on
  `127.0.0.1:18831->3000/tcp`.
- `agentresult-os-telegram-owner-control` has
  `AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING=1`.
- `agentresult-client-owner-updates.service` is `enabled` and `active`.
- `agentresult-vps-health.timer` is `enabled` and `active`.
- Telegram webhook URL for the owner-control bot is empty. This contour uses
  polling, not webhook delivery.
- The owner-control bot token exists only in
  `agentresult-os-telegram-owner-control`.
- Classic Hermes Telegram gateway containers (`agentresult-agent-*`) are not
  polling the same owner-control bot token.

## Golden Commands

Run the invariant guard:

```bash
npm run vps:agentresult-health
```

Install or refresh the recurring health timer:

```bash
npm run vps:agentresult-health:install-timer
```

Run the safe alert drill:

```bash
npm run vps:agentresult-health:drill
```

Run the production Telegram result-flow smoke:

```bash
npm run telegram:production-smoke
```

Deploy or refresh only the owner-control container:

```bash
CONTAINER_NAME=agentresult-os-telegram-owner-control \
HOST_PORT=18831 \
AGENTRESULT_ENV_SOURCE=file \
scripts/deploy-backend-vps.sh
```

Restore the owner update systemd service:

```bash
ssh root@91.103.140.101 'systemctl enable --now agentresult-client-owner-updates.service'
```

For deploy-specific image verification:

```bash
EXPECTED_OWNER_IMAGE_TAG=<git-short-sha> npm run vps:agentresult-health
```

## Monitor

`agentresult-vps-health.timer` runs every 15 minutes on the VPS.

Files:

- `/opt/agentresult-os/runtime/agentresult-vps-health.env`: alert config.
- `/opt/agentresult-os/runtime/agentresult-vps-health.log`: recurring guard log.
- `/opt/agentresult-os/runtime/agentresult-vps-health-drill.log`: drill log.

Manual GitHub workflow:

- Workflow name: `AgentResult VPS health`.
- Required secret: `AGENTRESULT_VPS_SSH_KEY`.
- Optional input: `expected_owner_image_tag`.
- Launch path: GitHub repo -> Actions -> `AgentResult VPS health` ->
  `Run workflow` -> branch `main`.
- Leave `expected_owner_image_tag` empty for a general invariant check; set it
  to a git short SHA when verifying a specific owner-control deploy.

## Recovery

If the owner-control container is missing, redeploy it:

```bash
CONTAINER_NAME=agentresult-os-telegram-owner-control \
HOST_PORT=18831 \
AGENTRESULT_ENV_SOURCE=file \
scripts/deploy-backend-vps.sh
npm run vps:agentresult-health
```

If `agentresult-client-owner-updates.service` is disabled or stopped:

```bash
ssh root@91.103.140.101 'systemctl enable --now agentresult-client-owner-updates.service'
npm run vps:agentresult-health
```

If Telegram webhook is set for the owner-control bot, restart or redeploy
`agentresult-os-telegram-owner-control`. Startup clears the webhook with
`drop_pending_updates=false`, then the health guard must pass.

If the owner-control bot token is present in the wrong container, remove it from
that container's env and redeploy. The regular demo API should be deployed with
`STRIP_TELEGRAM_ENV=1`; only `agentresult-os-telegram-owner-control` should carry
the token.

If the timer is missing:

```bash
npm run vps:agentresult-health:install-timer
systemctl status agentresult-vps-health.timer --no-pager -l
```

## Forbidden Actions

- Do not remove `agentresult-os-telegram-owner-control`.
- Do not disable `agentresult-client-owner-updates.service`.
- Do not call Telegram `setWebhook` for the owner-control bot.
- Do not put `TELEGRAM_BOT_TOKEN` into `agentresult-os-backend`.
- Do not start classic `agentresult-agent-*` Telegram polling containers with
  the same owner-control bot token.
- Do not run freebuff cleanup or deploy scripts assuming AgentResult containers
  are disposable.

## Manual VPS Work Protocol

Before manual VPS work:

```bash
npm run vps:agentresult-health
```

After manual VPS work:

```bash
npm run vps:agentresult-health
```

After changing monitor, timer, alert, owner-control container, webhook, or token
isolation:

```bash
npm run vps:agentresult-health:drill
```

Docs-only commits do not require a backend redeploy. Any container, env, token,
systemd, or Telegram delivery change must end with a passing health guard.
