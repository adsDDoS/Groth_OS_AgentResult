# Pilot Readiness Rehearsal

Date: 2026-06-14

Production URL:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=pilot&v=visual-pass#/overview
```

Script:

```text
docs/pilot-demo-script.md
```

## Result

Client-safe dashboard rehearsal passed on production.

Automated browser pass completed the full path:

```text
Сегодня -> Публикации -> approve topic -> Материалы QA -> release queue -> live check -> result form -> Результаты
```

Observed final state:

- `Демо` badge stays visible.
- `Публикации` live check has one result confirmation CTA.
- `Результаты` opens after publication result confirmation.
- Results show URL, channel, reactions, and next content step.
- Stable client entry reloads back to `Сегодня`.
- No horizontal overflow observed.

Rehearsal browser time: about 5 seconds automated.
Talk-track budget: 6 minutes. Keep 1 minute buffer for questions.

## Fixed During Rehearsal

- Removed duplicate `Подтвердить результат` CTA in live check.
- Kept production demo badge as `Демо` instead of switching to `Онлайн`.
- Changed publication result confirmation to land on `Результаты`.
- Stopped auto-creating the next content item during result confirmation; next-step actions now happen from Results.
- Bumped dashboard cache keys so production loads current `app.js` and `modules/publications.js`.
- Updated dashboard smoke to match the new Results-first contract.

## Remaining Friction

- `Сегодня` can show both a pending topic and a manager/release item because the seeded demo contains more than one work item. Treat this as proof of a queue, not a single-item wizard.
- Results has several next-step buttons in table/detail surfaces. Do not click them during the first client-safe demo unless asked.
- A transient browser console 404 appeared during one run, but a resource-level retry did not reproduce any failing production asset. Not a show blocker.
- Old Telegram token is still acceptable only for internal demo/pre-production. Rotate before any client pilot with real data.

## Show Order

1. `Сегодня`: top action, status cells, queue.
2. `Публикации`: three states and the one release path.
3. `Результаты`: URL, primary reactions, next content step.

## Do Not Open

- `База`
- `Настройки`
- backend/API/VPS/GitHub/Vercel
- reset commands
- tokens or env values
- CRM or revenue attribution areas
