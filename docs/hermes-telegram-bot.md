# Hermes Telegram Bot

This document defines how to connect Hermes Agent to a Telegram bot for AgentResult OS.

## Decision

Hermes may own the Telegram conversation with the owner.

AgentResult backend must still own:

- approvals;
- publication status;
- handoff confirmation;
- task state;
- audit events;
- result records.

In this mode:

```text
Owner in Telegram -> Hermes Agent -> AgentResult backend action/result APIs -> stored state
```

Hermes answers and reasons. Backend records decisions and business state.

## Bot Ownership Rule

Do not use the same Telegram bot token in two webhook receivers at the same time.

Choose one mode:

- `Hermes-owned bot`: Hermes receives Telegram messages and calls backend APIs.
- `Backend-owned bot`: backend receives Telegram callbacks and sends owner briefs.

For the requested setup, use `Hermes-owned bot`.

That means:

- set `HERMES_TELEGRAM_BOT_TOKEN`;
- set `HERMES_TELEGRAM_ALLOWED_USERS` to the owner's numeric Telegram user ID;
- optionally set `HERMES_TELEGRAM_HOME_CHANNEL` to the same ID for direct-message delivery;
- keep backend `TELEGRAM_BOT_TOKEN` empty unless you intentionally run a separate backend bot;
- keep backend `POST /telegram/actions` available for Hermes to call;
- keep backend `POST /telegram/owner-brief/send` available only for backend-owned or dry-run delivery.

## Environment

Root `.env`:

```bash
HERMES_BASE_URL=http://hermes:8642
HERMES_API_KEY=

HERMES_TELEGRAM_BOT_TOKEN=replace-with-bot-token
HERMES_TELEGRAM_ALLOWED_USERS=replace-with-owner-user-id
HERMES_TELEGRAM_HOME_CHANNEL=replace-with-owner-user-id
HERMES_TELEGRAM_MODE=owner_control

AI_GROWTH_OS_AGENT_API_KEY=replace-with-backend-agent-key

TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_APPROVAL_CHAT_ID=
```

Hermes service receives:

- `AI_GROWTH_OS_BACKEND_URL=http://backend:3000`;
- `AI_GROWTH_OS_AGENT_API_KEY`;
- `TELEGRAM_BOT_TOKEN`, mapped from `HERMES_TELEGRAM_BOT_TOKEN`;
- `TELEGRAM_ALLOWED_USERS`, mapped from `HERMES_TELEGRAM_ALLOWED_USERS`;
- `TELEGRAM_HOME_CHANNEL`, mapped from `HERMES_TELEGRAM_HOME_CHANNEL`;
- `HERMES_TELEGRAM_MODE=owner_control`.

Hermes expects numeric Telegram user IDs in `TELEGRAM_ALLOWED_USERS`. A Telegram username is not enough. For a direct owner bot, `HERMES_TELEGRAM_ALLOWED_USERS` and `HERMES_TELEGRAM_HOME_CHANNEL` can usually be the same numeric ID.

## Runtime Shape

Current repository state:

- `infra/docker-compose.yml` has a `hermes` service under the `agents` profile.
- the service uses the official `nousresearch/hermes-agent:latest` image;
- the service starts `gateway run`;
- Hermes state is stored in ignored local path `.runtime/hermes`;
- the AgentResult skill pack is mounted into `/opt/data/skills`;
- `SOUL.md` is mounted into `/opt/data/SOUL.md`.

Target runtime:

```text
docker compose -f infra/docker-compose.yml --profile agents up -d --build
```

Then Hermes should start its Telegram gateway using the configured bot token and the AgentResult workspace.

The old `agents/hermes-template/entrypoint.sh` remains only as a local template fallback and is not used by the compose service.

## Agent Rules

Hermes may:

- talk to the owner in Telegram;
- show the current decision queue;
- summarize tasks and results;
- prepare materials;
- propose approval, handoff, release, or result actions;
- call backend APIs for recorded actions.

Hermes must not:

- publish directly;
- send emails directly;
- approve content by itself;
- confirm publication by itself;
- mark money-sensitive actions complete outside backend;
- store Telegram, CRM, CMS, bank, or email credentials in memory.
- expose terminal commands, tool logs, raw skill names, stack traces, or backend probing in the owner chat.

## Backend APIs Hermes Should Use

Read:

```text
GET /telegram/owner-brief
GET /tasks
GET /tasks/:id
GET /tasks/:id/events
```

Actions:

```text
POST /telegram/commands
POST /telegram/actions
POST /hermes/tasks/:id/dispatch
POST /hermes/tasks/:id/result
```

Preferred Telegram commands:

- `/brief`: show current owner-control state.
- `/post`: show the material waiting for approval.
- `/approve`: record approval through backend.
- `/changes`: request changes through backend.
- `/onboarding`: start setup flow through Telegram.

Hermes should call `POST /telegram/commands` for these commands and send only the returned `text` to the owner.

When the command response includes `buttons`, Hermes should render them as Telegram inline buttons or command shortcuts when the messaging gateway supports it. Button text and command payload should come from backend response, not from model improvisation.

Supported owner action body:

```json
{
  "action": "approval.approve",
  "targetId": "uuid",
  "note": "optional owner note"
}
```

Supported action ids:

- `approval.approve`
- `approval.request_changes`
- `publishing.confirm_live`

## First Smoke

1. Start backend.
2. Start Hermes with Telegram gateway enabled.
3. Send `/start` to the bot.
4. Ask: `Что требует моего решения?`
5. Hermes should call `GET /telegram/owner-brief`.
6. Hermes should answer with:
   - decisions count;
   - handed-off materials waiting for confirmation;
   - published count;
   - leads;
   - next owner action.
   - material text when the owner asks to see the item waiting for approval.
7. Press or send an approval command.
8. Hermes should call `POST /telegram/actions`.
9. Backend should record the action.
10. Recheck `GET /telegram/owner-brief`.

## Production Notes

- Run Hermes and backend on a private Docker network.
- Give Hermes an API key with only required backend scopes.
- Do not expose Hermes internal API publicly.
- Keep the Telegram bot token only in the Hermes service.
- Use backend audit events to review every recorded decision.
- Keep owner-facing copy concise: decisions, tasks, control, release, result.
- Add `/onboarding` as the future setup path in Telegram: business context, approval rules, channels, access, first release, result tracking.
