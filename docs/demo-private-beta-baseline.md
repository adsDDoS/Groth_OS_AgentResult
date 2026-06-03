# AgentResult OS Demo / Private Beta Baseline

## Status

AgentResult OS dashboard is the current demo and private-beta control surface.

Baseline version:

- production dashboard: `https://dashboard-orpin-mu-26.vercel.app`
- latest asset version: `agentresult-working-os-87`
- CI gate: `Dashboard smoke #14` passed on commit `1e6a7ee`

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
- stays `preview_only` until a real Telegram sender is connected.
