# GrothOS Client Demo Route Script

Access: `operator-only`

Короткий маршрут для первого client-safe показа dashboard. Держать открытым у оператора, не шарить как документ.

## Exact Link

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=client&v=client-demo-v1#/overview
```

Direct routes:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=client&v=client-demo-v1#/overview
https://dashboard-orpin-mu-26.vercel.app/?demo=client&v=client-demo-v1#/publications
https://dashboard-orpin-mu-26.vercel.app/?demo=client&v=client-demo-v1#/analytics
```

## 3 Screens

| Screen | Time | Point |
| --- | ---: | --- |
| `Сегодня` | 90 sec | Owner sees the one decision/action that matters today. |
| `Публикации` | 3 min | Material moves through QA, release queue, live check, and published. |
| `Результаты` | 2 min | Publication result records URL, channel, reactions, and next content step. |

Do not exceed 7 minutes before asking qualification questions.

## 5 Phrases

1. GrothOS не пишет контент в пустоту; он держит производственный контур текста.
2. Собственник видит решения и риски, а не весь шум производства.
3. Передано в выпуск не равно опубликовано: результат появляется только после подтверждения выхода.
4. Результат для контент-фермы — это URL, канал, первичная реакция и следующий контент-шаг.
5. Первый пилот доказывает регулярность и управляемость выпуска, а не обещает продажи из одной статьи.

## Click Route

1. Open `Сегодня`.
2. Point at the top action and status cells.
3. Open `Публикации`.
4. Show `Очередь выпуска`, `Проверка выхода`, `Опубликовано`.
5. Open `Результаты`.
6. Show the publication URL, reactions, and `Расширить / Переиспользовать / Оставить`.
7. Stop and ask:

```text
Если запускать пилот на одну неделю, какой канал и какой тип материала нам стоит взять первым?
```

## Stop List

Do not open:

- `База`
- `Настройки`
- backend/API/VPS/GitHub/Vercel
- raw Telegram, token, env, or deploy details
- docs marked `operator-only` or `internal-only`
- `?demo=reset`, `?demo=pilot`, or raw local URLs

Do not promise:

- guaranteed leads
- sales attribution from Telegram or vc.ru article
- CRM automation
- autopublishing without human approval
- replacement of editor, owner, or release manager

## If State Looks Wrong

Reload the exact link:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=client&v=client-demo-v1#/overview
```

If the browser blocks automation or asks for a Vercel check, use the normal signed-in browser and continue with direct routes.

If asked about real client data, say:

```text
Для реального пилота сначала заполняем intake: канал, роли, cadence, формат, forbidden claims и источник подтверждения результата.
```

## Success Criteria

- Demo stays inside `Сегодня -> Публикации -> Результаты`.
- Client repeats the value as "managed content production", not "AI writer".
- Next step is qualification or intake, not custom feature brainstorming.
