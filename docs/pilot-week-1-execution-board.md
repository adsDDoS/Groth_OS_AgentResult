# GrothOS Pilot Week-1 Execution Board

Использовать после `docs/pilot-onboarding-intake.md`. Цель первой недели — провести один материал через полный контур: тема -> черновик -> QA -> выпуск -> подтверждение -> review.

| День | Фокус | Владелец | Действие | Выход | Gate |
| --- | --- | --- | --- | --- | --- |
| Day 0 | Setup | Operator + owner | Заполнить intake: канал, роли, cadence, формат, forbidden claims, result source. | Готовый pilot context. | Есть канал, approval owner, QA/release owner, result owner. |
| Day 1 | Topics | Approval owner | Выбрать 1-3 темы недели и согласовать границу первой темы. | Approved topic boundary. | Тема понятна, risky claims отмечены. |
| Day 2 | Draft | Operator/editor | Подготовить первый черновик в выбранном формате. | Draft ready for QA. | Черновик похож на voice, не нарушает forbidden claims. |
| Day 3 | QA | QA/release owner | Проверить фактуру, стиль, риски, готовность к выпуску. | QA passed or changes requested. | Нет спорных claims без owner approval. |
| Day 4 | Release | QA/release owner | Передать материал в канал или ответственному за ручной выпуск. | Release handoff recorded. | Передано не равно опубликовано; нужен live check. |
| Day 5 | Confirmation | Result owner | Подтвердить факт выхода: URL, канал, формат, первичные реакции. | Publication result recorded. | Есть URL/source или manual owner mark. |
| Day 7 | Review | Owner + operator | Разобрать первую неделю и выбрать next content step. | Reuse / expand / update / leave. | Понятно, что делать со следующим материалом. |

## Daily Rule

- Один день — один основной переход состояния.
- Не расширять пилот до новых каналов до Day 7 review.
- Не считать материал опубликованным без URL/source confirmation.
- Не добавлять CRM/revenue attribution в week 1.

## Done

Week 1 успешна, если:

- одна тема прошла owner decision;
- один материал прошёл QA;
- выпуск передан или опубликован;
- результат подтверждён URL/source;
- зафиксирован следующий контент-шаг.

## Escalate

Остановить week-1 flow и вернуться к intake, если:

- нет решения по теме дольше agreed waiting time;
- QA нашёл forbidden claim;
- канал выпуска оказался недоступен;
- никто не может подтвердить URL/source;
- клиент меняет goal с production control на guaranteed commercial result.
