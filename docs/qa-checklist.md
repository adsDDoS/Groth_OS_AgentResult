# AgentResult OS QA Checklist

## Scope

This checklist covers the owner-facing dashboard demo and local mode. The goal is to protect the core loop:

```text
Hermes prepares -> owner approves -> material is released or handed off -> result is tracked
```

## Release Gates

- Dashboard loads on Vercel without showing `localhost`.
- RU/ENG switch works on all main sections.
- No owner-facing screen uses backend-admin language.
- Public actions remain approval-first.
- Manual handoff is visible separately from confirmed publication.
- Local demo reset works with `?demo=reset`.

## Smoke Scenarios

### 1. Today

- Open `#/overview`.
- Expected:
  - screen title is `Сегодня`;
  - one primary owner decision is visible;
  - result chain shows preparation, approval, release, signal;
  - no duplicate `Контроль` block;
  - top actions do not overload the screen.

### 2. Strategy

- Open `#/growth-plan`.
- Expected:
  - screen title is `Стратегия`;
  - one `Приоритет недели` is visible;
  - queue shows next moves without repeating the weekly priority CTA;
  - old `Деньги / Скорость / Доказательство` filter is not visible;
  - top actions are empty;
  - each queue action says `Подготовить`.

### 3. Company

- Open `#/offer-brain`.
- Expected:
  - screen title is `Компания`;
  - top action says `Сохранить`;
  - first screen shows launch context, control, and first release;
  - visible form focuses on offer, buyer, pains, proof, forbidden claims, approval rules;
  - `Дополнительный контекст` is collapsed by default;
  - saving does not break local fallback.

### 4. Publications Handoff

- Open `#/publications`.
- Go to `Пакет материалов`.
- Select `Telegram`.
- Click `Передано`.
- Expected:
  - publication plan opens;
  - item status becomes `Передано вручную`;
  - action `Подтвердить` is available;
  - no automatic publication is implied.

### 5. Materials Actions

- Open `#/content-pipeline`.
- Expected:
  - decision materials open the approval queue;
  - draft materials can be sent to approval;
  - text export is labelled as `Скачать текст`, not `Передать`;
  - only actions that update the release plan use handoff language.

### 6. Results

- After manual handoff, open `#/analytics`.
- Expected:
  - metric `Передано вручную` is visible;
  - count is `1`;
  - note says `ждёт подтверждения выхода`;
  - owner can understand what still needs confirmation.

### 7. Confirm Publication

- Return to publication plan.
- Click `Подтвердить` for handed-off item.
- Expected:
  - item moves to published state;
  - `Передано вручную` count decreases;
  - published output is counted in results;
  - toast confirms the release.

### 8. Language Switch

- Switch to ENG on `Компания`, `Стратегия`, `Публикации`, `Результаты`.
- Switch back to РУС.
- Expected:
  - titles, buttons, and key labels change;
  - no mixed admin wording appears;
  - route state is preserved.

## Regression Areas

- Empty states for approvals, materials, publication plan, and results.
- Mobile layout at 390px width.
- Tablet layout at 768px width.
- Desktop layout at 1440px width.
- Vercel demo without backend.
- Local mode with backend on `127.0.0.1:3000`.
- LocalStorage state after manual handoff and demo reset.

## Recommended QA Role

Bring in senior QA after the Company screen is stable. The first QA pass should produce:

- scenario matrix;
- browser/device matrix;
- bug list with severity;
- smoke suite review;
- regression checklist for every deploy.
