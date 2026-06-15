# GrothOS Client Demo Call Dry Run v3

Access: `operator-only`

Use this for the first client call. Keep the dashboard route to 7 minutes, then stop showing and ask qualification/intake questions.

## Production Link

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=client&v=client-demo-v3#/overview
```

Direct route fallback:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=client&v=client-demo-v3#/overview
https://dashboard-orpin-mu-26.vercel.app/?demo=client&v=client-demo-v3#/publications
https://dashboard-orpin-mu-26.vercel.app/?demo=client&v=client-demo-v3#/analytics
```

## 7-Minute Route

| Time | Screen | Say | Show |
| ---: | --- | --- | --- |
| 0:00-0:40 | Opening | `Я покажу GrothOS не как AI-писателя, а как рабочий контур текстовой контент-фермы: тема, решение, QA, выпуск, подтверждённая публикация и следующий шаг.` | Keep on `Сегодня`. |
| 0:40-2:00 | `Сегодня` | `Это ежедневный пульт. Собственник видит не весь шум производства, а главное решение дня, статус выпуска и что уже вернулось результатом.` | Top action, status cells, action queue. |
| 2:00-2:20 | Transition | `Теперь покажу, как материал проходит от решения к выходу.` | Click `Публикации`. |
| 2:20-4:45 | `Публикации` | `Здесь разделены решение, выпуск и проверка выхода. Важно: передано в выпуск не равно опубликовано. Результат появляется только когда выход подтверждён.` | Topics, workboard, published count, `Открыть результаты`. |
| 4:45-5:05 | Transition | `После выхода смотрим уже не на процесс, а на производственный результат публикации.` | Click `Результаты`. |
| 5:05-6:30 | `Результаты` | `Результат для контент-фермы — это URL, канал, формат, первичные реакции и решение, что делать дальше с этим материалом.` | URL, reactions, selected next content step. |
| 6:30-7:00 | Close | `Первый пилот должен доказать управляемость выпуска: тема не теряется, текст не зависает, публикация подтверждается, а результат превращается в следующий контент-шаг.` | Stop clicking. |

## Exact Opening

```text
Я покажу GrothOS не как AI-писателя, а как рабочий контур текстовой контент-фермы: тема, решение, QA, выпуск, подтверждённая публикация и следующий шаг.
```

## Exact Closing

```text
Первый пилот должен доказать управляемость выпуска: тема не теряется, текст не зависает, публикация подтверждается, а результат превращается в следующий контент-шаг. Если запускать пилот на одну неделю, какой канал и какой тип материала нам стоит взять первым?
```

## One Follow-Up Message

```text
Спасибо за разговор. Коротко зафиксирую, что показали:

1. GrothOS ведёт производство текста как контур: тема -> решение -> QA -> выпуск -> подтверждённая публикация -> следующий контент-шаг.
2. В первом пилоте проверяем не “магические продажи от статьи”, а управляемость выпуска: материал не теряется, выход подтверждается URL, первичная реакция фиксируется.
3. Стартовый сценарий: выбрать один канал, один тип материалов, недельный cadence и ответственных за решение, QA, выпуск и подтверждение результата.

Следующий шаг: заполнить короткий intake по каналу, ролям, формату, forbidden claims и источнику подтверждения результата.
```

## Do Not Say

- guaranteed leads
- sales attribution from Telegram or vc.ru article
- CRM automation
- autopublishing without human approval
- replacement of editor, owner, or release manager
- "это просто генератор постов"

## Do Not Open

- `Материалы`
- `База`
- `Настройки`
- backend/API/VPS/GitHub/Vercel
- Telegram, tokens, env, deploy details
- `?demo=reset`, `?demo=pilot`, local URLs

## Dry Run Result

Date: 2026-06-15

Production DOM check passed:

- `Сегодня` top action: `Согласовать тему недели`.
- Navigation: `Сегодня`, `Публикации`, `Результаты`.
- `Публикации`: `Рабочие пункты выпуска` and `Открыть результаты` visible.
- `Результаты`: publication URL visible, next content step visible, result action buttons hidden.
- Console errors: none observed.

Call-readiness decision: ready for the first controlled client conversation.
