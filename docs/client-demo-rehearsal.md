# GrothOS Client Demo Rehearsal

Access: `internal-only`

Date: 2026-06-15

Production URL:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=client&v=client-demo-v1#/overview
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
- Direct routes preserve `?demo=client&v=client-demo-v1`.

## Fixed During Rehearsal

- Renamed the mixed owner/release work table from `Очередь выпуска` to `Рабочие пункты выпуска`.
- Bumped dashboard cache keys for `app.js` and `modules/publications.js`.

Reason: the page already has a top metric where release queue can be `0`, while the work table can still contain an owner decision. The new label avoids explaining the dashboard taxonomy during a client call.

## Remaining Friction

1. `Сегодня` still shows three active items. Treat this as a production queue, not a single-step wizard. In the call, point only at the top action and status cells.
2. `Материалы` stays visible in navigation. Keep it off-screen in the talk track unless the client asks about manager QA.
3. Results next-step buttons are real-looking controls. Do not click them in the first showing; use them only to explain that publication results create the next content step.

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
- Full-page screenshot capture in the in-app browser timed out during QA. Not a product blocker; repeat visual capture with a normal browser if a screenshot artifact is needed.
