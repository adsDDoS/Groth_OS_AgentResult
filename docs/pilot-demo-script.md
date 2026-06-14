# GrothOS Client-Safe Demo Script

Purpose: show a serious content-ops control surface in 7 minutes without turning the call into product training.

Stable dashboard:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=pilot&v=visual-pass#/overview
```

One-line positioning:

```text
GrothOS turns content production into a controlled loop: topic, owner decision, QA, release, confirmed publication, and next content step.
```

## Demo Shape

Show only three screens:

1. `Сегодня`
2. `Публикации`
3. `Результаты`

Show one scenario:

```text
topic decision -> manager QA -> release queue -> live confirmation -> publication result
```

Do not show:

- `База`
- `Настройки`
- backend/API endpoints
- Vercel/GitHub/VPS
- raw Telegram token or env values
- reset commands
- slash-command training
- unfinished CRM, money, demand, or revenue attribution areas

## Opening

Say:

```text
Я покажу не AI-писателя, а производственный контур текстовой контент-фермы: что готовим, что согласовано, что вышло, и что делать с результатом дальше.
```

Then open:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=pilot&v=visual-pass#/overview
```

## Screen 1: Сегодня

Goal: prove this is a control surface, not a demo landing page.

Say:

```text
Это экран ежедневного контроля. Здесь не надо разбирать весь dashboard: видно главное действие, очередь работы и где сейчас стоит выпуск.
```

Point at:

- top action
- four status cells
- action queue

Do not explain every card.

Say only if asked:

```text
Dashboard нужен для контроля и аудита. Ежедневная работа может идти через Telegram, но источник состояния один.
```

Transition:

```text
Теперь покажу место, где материал проходит от решения к выходу.
```

## Screen 2: Публикации

Open:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=pilot&v=visual-pass#/publications
```

Say:

```text
Публикации разделены на три понятных состояния: очередь выпуска, проверка выхода и опубликовано. Важно: передано в выпуск не равно опубликовано.
```

Point at:

- `Очередь выпуска`
- `Проверка выхода`
- `Опубликовано`
- pending owner decision or ready release row
- QA evidence if present

Use this explanation:

```text
Собственник один раз задаёт границу темы. Дальше текст проходит QA и выпуск. Собственник возвращается только на исключение или подтверждение результата.
```

If demonstrating the click flow, do only this path:

1. approve weekly topic
2. let route move to `Материалы`
3. click `QA пройден`
4. return to `Публикации`
5. click `К проверке выхода`
6. click `Подтвердить результат` or `Отметить: вышло`

Do not open:

- settings
- integration/access panels
- backend health pages
- raw generated text editor unless specifically requested

Transition:

```text
После выхода нас интересует не обещание продаж, а производственный результат публикации.
```

## Screen 3: Результаты

Open:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=pilot&v=visual-pass#/analytics
```

Say:

```text
Результаты здесь про контент-операции: URL, канал, формат, первичные реакции и следующий контент-шаг.
```

Point at:

- confirmed publications count
- URL column
- primary reactions
- next step actions: reuse, expand, update, leave

Use this wording:

```text
Мы не говорим "пост принёс деньги", пока нет реальной аналитики. Сначала фиксируем факт выхода и первичную реакцию, потом решаем: переиспользовать, расширить, обновить или оставить.
```

Close with:

```text
Первый пилот должен доказать управляемость производства: тема не теряется, текст не зависает, выпуск подтверждается, результат превращается в следующий контент-шаг.
```

## Telegram Mention

Do not make Telegram the main demo unless the client specifically asks about daily work.

If asked, say:

```text
В рабочем режиме собственник может писать обычными фразами: "что готово", "покажи первый", "согласую", "передал в выпуск", "вышло". Но на первом показе я держу фокус на продуктовой логике.
```

Allowed phrases for internal smoke:

```text
что готово
покажи первый
согласую
передал в выпуск
вышло
что по результату
```

## What Not To Say

Avoid:

```text
лиды
гарантированный рост
автопостинг без контроля
CRM уже подключена
полная автономность
мы заменяем редактора
это просто AI пишет посты
```

Use instead:

```text
публикация
первичная реакция
следующий контент-шаг
контур производства
контроль выхода
QA
решение собственника
```

## Pre-Call Checks

Run:

```bash
npm run dashboard:smoke
npm run pilot-demo:owner-flow-smoke
npm run vps:agentresult-health
bash scripts/smoke-demo-api-proxy-vps.sh
```

Optional if Telegram will be shown:

```bash
npm run telegram:production-smoke
```

Security note:

```text
Old Telegram token is acceptable only for internal demo/pre-production. Rotate before client pilot with real client data.
```
