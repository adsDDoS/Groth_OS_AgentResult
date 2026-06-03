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

## Telegram

- `GET /telegram/owner-brief`
- `POST /telegram/actions`
- `POST /telegram/webhook`

`GET /telegram/owner-brief` returns the current owner-control state for Hermes and the future Telegram control surface. It does not send messages or publish anything. The response includes pending decisions, manually handed-off materials waiting for confirmation, confirmed outputs, result counters, the next owner action, and `telegramMessage` preview data.

`telegramMessage` contains:

- `text`: concise owner-facing message text;
- `buttons`: action descriptors such as `approval.approve`, `approval.request_changes`, and `publishing.confirm_live`;
- `callbackData`: compact callback payload for Telegram inline buttons;
- `delivery: "preview_only"` until a real Telegram sender is connected.

`POST /telegram/actions` executes one prepared Telegram-control action against the existing backend workflow and returns a refreshed `ownerBrief`. It does not send external Telegram messages.

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

`POST /telegram/webhook` accepts Telegram webhook events. When the event contains `callback_query.data` in the supported `action:targetId` format, the backend executes the same prepared action as `POST /telegram/actions` and returns a refreshed `ownerBrief`. It records the event in integrations and does not send messages to Telegram.
