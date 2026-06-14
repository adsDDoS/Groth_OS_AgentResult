# AgentResult OS Demo / Private Beta Baseline

Access: `internal-only`

## Status

AgentResult OS dashboard is the current demo and private-beta control surface.

Baseline version:

- production dashboard: `https://dashboard-orpin-mu-26.vercel.app`
- demo link: `https://dashboard-orpin-mu-26.vercel.app/?demo=pilot#/overview`
- latest asset version: `agentresult-working-os-90`
- customer demo contract: `docs/customer-demo-contract.md`
- current demo-flow hardening commit: `1594d7c`

## What Is Stable

- Owner-facing IA: `Сегодня`, `Стратегия`, `Компания`, `Материалы`, `Публикации`, `Результаты`, `Настройки`.
- Approval-first owner loop: decision -> handoff/release -> result.
- Manual handoff is separate from confirmed publication.
- RU/ENG switch remains available on mobile, tablet, and desktop.
- Dashboard avoids backend-admin language on owner screens.
- Responsive smoke covers 390, 768, and 1440 widths.

## Release Gate

Before treating a dashboard change as ready:

```bash
node --check apps/dashboard/app.js
npm run dashboard:smoke
npm run lint
npm run build
```

`npm run dashboard:smoke` must protect:

- owner loop;
- manual handoff count;
- confirmed publication count;
- RU/ENG visibility;
- route titles;
- horizontal overflow.

## Next Product Block

The next block is Hermes / Telegram control surface.

Telegram is not a publication channel for AgentResult OS. It is the owner control surface for:

- concise daily summary;
- decisions;
- approvals;
- manual handoff confirmation;
- task status;
- result signals.

First backend contract:

```text
GET /telegram/owner-brief
```

This endpoint prepares the owner-control state for Hermes and Telegram without sending external messages.

Current renderer:

- returns `telegramMessage.text`;
- returns action buttons for approval, changes, and publication confirmation;
- includes compact `callbackData` for Telegram inline buttons;
- supports dry-run delivery checks before a real Telegram sender is connected.

Owner brief delivery:

```text
POST /telegram/owner-brief/send
```

It sends the current owner brief to the configured owner chat when `TELEGRAM_BOT_TOKEN` and `TELEGRAM_APPROVAL_CHAT_ID` are set. It sends only the control summary and inline buttons; it does not publish, send emails, or make decisions automatically.

Current action endpoint:

```text
POST /telegram/actions
```

It executes prepared control actions against existing backend state and returns a refreshed owner brief. It does not send external Telegram messages.

Webhook callback handling:

```text
POST /telegram/webhook
```

When Telegram sends a callback query with supported `action:targetId` data, the backend executes the same prepared action and returns a refreshed owner brief. The event is recorded for audit; external Telegram sending remains disconnected.
