# API

All responses use:

```json
{ "data": {} }
```

Local development uses `x-tenant-id` for tenant context.

## Core

- `GET /health`
- `GET /me`

## Tenants / Users

- `GET /tenants/current`
- `POST /tenants`
- `GET /users`
- `POST /users`

## Offer Brain

- `GET /offer`
- `PUT /offer`
- `GET /products`
- `POST /products`
- `GET /icp`
- `POST /icp`
- `GET /proof-points`
- `POST /proof-points`
- `GET /competitors`
- `POST /competitors`

## Demand Map

- `GET /demand-map`
- `POST /demand-map/generate`
- `POST /demand-map/items`
- `PATCH /demand-map/items/:id`

## Content

- `GET /content/items`
- `GET /content/items/:id`
- `POST /content/items`
- `POST /content/items/:id/generate-brief`
- `POST /content/items/:id/generate-draft`
- `POST /content/items/:id/repurpose`
- `POST /content/items/:id/comment`
- `POST /content/items/:id/archive`

## Approvals

- `GET /approvals`
- `POST /approvals/:id/approve`
- `POST /approvals/:id/reject`
- `POST /approvals/:id/request-changes`

## Publishing

- `GET /publishing/calendar`
- `POST /publishing/schedule`
- `POST /publishing/items/:id/publish`
- `POST /publishing/items/:id/unpublish`

Publishing creates jobs only after required approval exists.

## SEO/GEO

- `POST /seo/analyze-page`
- `POST /seo/generate-brief`
- `POST /seo/internal-links`
- `POST /geo/generate-ai-answer-blocks`
- `POST /geo/generate-llms-txt`
- `POST /geo/entity-page-brief`

## Lead Magnets

- `GET /lead-magnets`
- `POST /lead-magnets`
- `POST /lead-magnets/:id/generate`

## Analytics

- `GET /analytics/overview`
- `POST /analytics/import`
- `POST /analytics/generate-improvement-tasks`

## Agents / Tasks

- `GET /agents`
- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
- `GET /tasks/:id/events`
- `POST /tasks/:id/approve`
- `POST /tasks/:id/reject`
- `POST /tasks/:id/pause`
- `POST /tasks/:id/handoff`

## Hermes

- `POST /hermes/tasks/:id/dispatch`
- `POST /hermes/tasks/:id/result`

`POST /hermes/tasks/:id/dispatch` prepares a backend-owned task envelope for Hermes and records a `task_runs` row with status `dispatch_prepared`. It does not publish, send, or make owner decisions.

`POST /hermes/tasks/:id/result` accepts a structured Hermes result envelope, validates it, writes the result to the task, and records a `hermes_result_received` task event. Proposed actions remain proposed; backend approval rules decide what becomes an approval, release, handoff, or result later.

Result body:

```json
{
  "runId": "optional-task-run-uuid",
  "status": "completed",
  "summary": "Prepared draft and risk flags.",
  "artifacts": [
    {
      "type": "draft",
      "targetType": "content_item",
      "targetId": "content-item-uuid",
      "payload": {}
    }
  ],
  "proposedActions": [
    {
      "type": "approval_request",
      "scope": "social_post",
      "summary": "Owner approval required before release.",
      "payload": {}
    }
  ],
  "riskFlags": ["public claim"]
}
```

## Telegram

- `GET /telegram/owner-brief`
- `POST /telegram/owner-brief/send`
- `POST /telegram/actions`
- `POST /telegram/commands`
- `POST /telegram/commands/send`
- `POST /telegram/intent`
- `POST /telegram/materials`
- `POST /telegram/webhook`

`GET /telegram/owner-brief` returns the current owner-control state for Hermes and the future Telegram control surface. It does not send messages or publish anything. The response includes pending decisions, manually handed-off materials waiting for confirmation, confirmed outputs, result counters, the next owner action, and `telegramMessage` preview data.

`telegramMessage` contains:

- `text`: concise owner-facing message text;
- `buttons`: action descriptors such as `approval.approve`, `approval.request_changes`, and `publishing.confirm_live`;
- `callbackData`: compact callback payload for Telegram inline buttons;
- `delivery: "preview_only"` until a real Telegram sender is connected.

`POST /telegram/actions` executes one prepared Telegram-control action against the existing backend workflow and returns a refreshed `ownerBrief`. It does not send external Telegram messages.

`POST /telegram/commands` executes a predictable owner-facing command and returns ready-to-send text for Hermes Telegram. It is the preferred path for slash commands and short owner commands where model interpretation should be minimized.

`POST /telegram/intent` maps ordinary owner language to safe backend commands/actions. It is the preferred path for natural-language Telegram messages where the owner should not need slash commands.

The same intent router can be used by the backend owner-control polling middleware. Enable it with `AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING=1` only after disabling Hermes polling for the same bot token. The middleware uses the Telegram allowlist, routes owner text through backend intent logic, and sends back only owner-facing text.

Supported intent body:

```json
{
  "text": "согласую",
  "note": "optional owner note"
}
```

Common intent examples:

- `что дальше`, `что требует решения` -> brief;
- `что делать каждый день`, `как с тобой работать` -> daily owner loop;
- `покажи пост`, `покажи материал`, `можно посмотреть материал` -> current material;
- `ок`, `окей`, `согласую`, `одобряю`, `можно выпускать`, `да, согласую` -> approve current decision;
- `нужны правки`, `переделай` -> request changes;
- `передал`, `передал в выпуск`, `пусть выложат` -> manual handoff;
- `вышло`, `опубликовано`, `пост вышел` -> confirm published;
- `опубликуй напрямую`, `отправь в канал` -> direct publishing boundary response;
- `что по результату` -> result summary.

Owner-facing response text should use natural action language instead of listing slash commands as the main next step. Slash commands remain supported as a technical compatibility contract for Hermes quick commands and dry-runs.

Approval safety: approval words inside longer questions must not approve anything. For example, `окей, что нам нужно делать каждый день?` maps to daily owner loop, not approval. Standalone `ок` / `окей` is approval.

Command response includes:

- `text`: ready owner-facing text;
- `buttons`: optional command buttons for Telegram UI;
- `ownerBrief`: refreshed owner-control state;
- `actionResult`: only when the command records a backend action.

Supported command body:

```json
{
  "command": "/brief",
  "targetId": "optional-approval-uuid",
  "note": "optional owner note"
}
```

Supported commands:

- `/brief`: current decisions, handoffs, outputs, leads, next action; money only when there is a real monetary signal;
- `/post`: text of the material waiting for approval;
- `/osapprove`: records approval for the current or specified decision in backend owner-control mode;
- `/changes`: records that changes are needed;
- `/handoff`: marks the current approved material as manually handed off for release;
- `/published`: confirms that a handed-off material went live;
- `/reset`: restarts the Telegram owner-control dialogue without deleting AgentResult OS data;
- `/demo_reset`: explicitly resets local demo state;
- `/onboarding`: starts step-by-step setup in Telegram.

Command button shape:

```json
{
  "command": "/osapprove",
  "label": "Согласовать",
  "targetId": "optional-approval-uuid"
}
```

`POST /telegram/commands/send` executes the same command contract, then sends the resulting text to the configured owner chat with Telegram inline buttons. Use `dryRun: true` to inspect the exact Telegram payload without sending.

Supported body:

```json
{
  "command": "/brief",
  "targetId": "optional-approval-uuid",
  "note": "optional owner note",
  "dryRun": true
}
```

`POST /telegram/materials` saves a newly prepared Telegram material from Hermes into backend state. It creates a content item, stores the text, opens an approval request, and returns owner-facing next commands. It does not publish the material or send it to a channel.

Supported body:

```json
{
  "title": "Почему прораб не заменит систему",
  "bodyMd": "Prepared post text...",
  "channel": "telegram",
  "contentType": "telegram_post",
  "note": "optional source note"
}
```

`POST /telegram/owner-brief/send` sends the current owner brief to the configured Telegram owner chat with inline control buttons. It only sends the decision summary and prepared control actions. It does not publish materials, send emails, or perform owner decisions by itself.

Required environment variables for live delivery:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_APPROVAL_CHAT_ID`

Dry-run body:

```json
{
  "dryRun": true
}
```

Supported action body:

```json
{
  "action": "approval.approve",
  "targetId": "approval-or-calendar-uuid",
  "note": "optional owner note"
}
```

Supported actions:

- `approval.approve`
- `approval.request_changes`
- `publishing.confirm_live`

`POST /telegram/webhook` accepts Telegram webhook events. When the event contains `callback_query.data` in the supported `action:targetId` format, the backend executes the same prepared action as `POST /telegram/actions` and returns a refreshed `ownerBrief`. It also supports compact command callbacks generated by `POST /telegram/commands/send`. It records the event in integrations and does not publish materials or make decisions outside the command/action contract.
