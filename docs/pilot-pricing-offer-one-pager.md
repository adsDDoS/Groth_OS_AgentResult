# GrothOS Pilot Pricing / Offer One-Pager

Использовать после `docs/pilot-closeout-report-template.md`. Цель — перевести closeout decision в конкретное предложение, а не в размытое обсуждение.

## Offer Rule

- Не продавать leads, sales или revenue attribution.
- Продавать управляемый production loop: темы, черновики, QA, выпуск, URL/source, реакции, next content step.
- Предлагать только один следующий вариант, если decision очевиден.
- Если decision спорный, выбрать самый узкий безопасный вариант.

## Option A: Paid Pilot

Когда предлагать:

- decision: Continue;
- content loop повторился;
- owner видит ценность в visibility/control;
- result source подтверждается.

Scope:

- 2-4 недели;
- 1-2 канала;
- 1-2 формата;
- weekly topics, drafts, QA, release handoff, publication result, closeout.

```text
price:
term:
included_materials:
channels:
owners:
success_metric:
```

## Option B: Narrow Production Loop

Когда предлагать:

- decision: Narrow;
- ценность есть, но scope расползается;
- нужен один канал, один формат, один cadence.

Scope:

- 2 недели;
- 1 канал;
- 1 формат;
- 1 weekly operating board;
- no new integrations.

```text
price:
term:
channel:
format:
cadence:
success_metric:
```

## Option C: Repair Sprint

Когда предлагать:

- decision: Repair;
- blocker понятен и исправим;
- без repair пилот нельзя честно расширять.

Scope:

- 3-5 рабочих дней;
- чинится один blocker: approval, QA, release, confirmation или result source;
- новых каналов и форматов нет;
- итог — повтор week 1 или stop.

```text
price:
term:
blocker:
repair_output:
repeat_gate:
owner:
```

## Do Not Offer

Не предлагать продолжение, если:

- decision: Stop;
- нет approval owner;
- нет result source;
- клиент требует guaranteed commercial result;
- клиент хочет автопубликацию без QA/owner decision.

## Closing Line

```text
На пилоте мы проверяли не магию продаж, а управляемость производства текста. Следующий шаг — либо расширить рабочий контур, либо сузить его, либо починить конкретный blocker.
```

## Offer Is Valid If

- выбран один основной вариант;
- scope и срок конечны;
- success metric не является revenue claim;
- owner и decision deadline указаны;
- следующий шаг можно начать без новых интеграций.
