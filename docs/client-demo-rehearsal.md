# GrothOS Client Demo Rehearsal

Access: `internal-only`

Date: 2026-06-15

Production URL:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=client&v=client-demo-v3#/overview
```

Script:

```text
docs/client-demo-route-script.md
```

## Result

Production route rehearsal passed for the first client-safe dashboard showing:

```text
Сегодня -> Публикации -> Результаты
```

Checked directly on production:

- `Сегодня` opens with the client-demo state and no console errors.
- `Публикации` opens with one owner decision, one published result counted, and no console errors.
- `Результаты` opens with one publication result, URL, channel, reactions, next content step, and no console errors.
- Direct routes preserve `?demo=client&v=client-demo-v3`.

## Fixed During Rehearsal

- Renamed the mixed owner/release work table from `Очередь выпуска` to `Рабочие пункты выпуска`.
- Bumped dashboard cache keys for `app.js` and `modules/publications.js`.
- Hid `Материалы` from client-demo navigation so the first call stays on `Сегодня -> Публикации -> Результаты`.
- Replaced Results next-step action buttons with a read-only pilot marker in client-demo mode.

Reason: the page already has a top metric where release queue can be `0`, while the work table can still contain an owner decision. The new label avoids explaining the dashboard taxonomy during a client call.

## Remaining Friction

1. `Сегодня` still shows three active items. Treat this as a production queue, not a single-step wizard. In the call, point only at the top action and status cells.
2. `Материалы` is still available by direct route for operator QA, but it is not exposed in client-demo navigation.
3. Results next-step buttons are hidden in client-demo mode. Explain the selected next content step instead of clicking controls.

## Call Notes

Use these words if the owner asks why there are several active rows:

```text
Это не линейный мастер. Это рабочая очередь: собственник видит своё решение, менеджер видит выпуск, а результат фиксируется отдельно.
```

Use these words before opening Results:

```text
Теперь важно не количество постов само по себе, а что мы знаем после выхода: URL, площадка, первичная реакция и следующий контент-шаг.
```

## QA Status

- Production DOM route check: passed.
- Console errors: none observed on the three client-demo screens.
- Local dashboard smoke: passed.
- Local visual hardening QA: passed. Client-demo nav shows only `Сегодня`, `Публикации`, `Результаты`; Results has no `set-publication-result-step` buttons.
- Full-page screenshot capture in the in-app browser timed out during QA. Not a product blocker; repeat visual capture with a normal browser if a screenshot artifact is needed.
