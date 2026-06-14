# GrothOS Demo Operator Card

Шпаргалка для первого client-safe показа. Держать созвон в 7 минутах.

## Ссылка

https://dashboard-orpin-mu-26.vercel.app/?demo=pilot&v=precall-dryrun#/overview

## 3 Экрана

1. `Сегодня`: главное действие, статусы, очередь.
2. `Публикации`: очередь выпуска, проверка выхода, опубликовано.
3. `Результаты`: URL, первичные реакции, следующий контент-шаг.

## 5 Фраз

1. GrothOS превращает производство текста в управляемый контур: тема, решение, QA, выпуск, подтверждённая публикация, следующий шаг.
2. Я покажу не AI-писателя, а рабочий контур текстовой контент-фермы.
3. Передано в выпуск не равно опубликовано. Результат появляется только после подтверждения выхода.
4. Мы не обещаем продажи от поста без аналитики. Сначала фиксируем факт выхода, первичную реакцию и следующий контент-шаг.
5. Первый пилот должен доказать управляемость производства: тема не теряется, текст не зависает, выпуск подтверждается.

## Не Открывать

- `База`
- `Настройки`
- backend/API/VPS/GitHub/Vercel
- reset-команды
- токены или env-значения
- Telegram, если не попросили
- кнопки next-step в Results, если не попросили

## Не Говорить

- leads / CRM / guaranteed growth
- autopublishing as default
- full autonomy
- revenue attribution
- replacing the editor
- "this is just AI writing posts"

## Emergency Fallback

1. Остановить клики.
2. Сказать:

```text
Я не буду чинить это на созвоне. Покажу саму продуктовую логику на трёх стабильных экранах.
```

3. Открыть экраны напрямую:

   - https://dashboard-orpin-mu-26.vercel.app/?demo=pilot&v=precall-dryrun#/overview
   - https://dashboard-orpin-mu-26.vercel.app/?demo=pilot&v=precall-dryrun#/publications
   - https://dashboard-orpin-mu-26.vercel.app/?demo=pilot&v=precall-dryrun#/analytics

4. Закрыть фразой:

```text
Пилот проверяет не магию, а управляемость: что готово, что согласовано, что вышло, и какой следующий контент-шаг.
```

## Перед Созвоном

Запустить до созвона, не во время: `npm run dashboard:smoke`.

Security: старый Telegram token только для internal demo. Rotate before client data.
