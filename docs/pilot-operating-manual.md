# GrothOS Pilot Operating Manual

Access: `operator-only`

Использовать как главный маршрут пилота. Цель — провести клиента от квалификации до решения после второй недели без расползания scope.

## Route

| Этап | Документ | Решение | Next |
| --- | --- | --- | --- |
| Qualification | `docs/pilot-qualification-note.md` | Идём в пилот / рано / не наш клиент. | Intake или stop. |
| Intake | `docs/pilot-onboarding-intake.md` | Есть канал, роли, cadence, format, forbidden claims, result source. | Week 1. |
| Week 1 | `docs/pilot-week-1-execution-board.md` | Один материал прошёл topic -> draft -> QA -> release -> confirmation. | Day 7 review. |
| Day 7 review | `docs/pilot-day-7-review-template.md` | Go / Narrow / Repair / No-go. | Week 2, repair или stop. |
| Week 2 expansion | `docs/pilot-week-2-expansion-board.md` | Same loop / narrow expansion / channel test / repair week. | Final decision. |
| Decision | This manual | Continue / narrow / repair / stop. | Closeout report. |
| Closeout | `docs/pilot-closeout-report-template.md` | Commercial next step. | Offer or stop. |
| Offer | `docs/pilot-pricing-offer-one-pager.md` | Paid pilot / narrow loop / repair sprint. | Follow-up message. |
| Follow-up | `docs/pilot-sales-follow-up-templates.md` | Continue / Narrow / Repair message. | Start paid scope or close. |

## Operating Rules

- Один основной канал до Day 7.
- Одно расширение максимум на week 2.
- Handoff не считается publication result.
- Publication result требует URL/source или честного blocker.
- Не обещать leads, sales, CRM attribution или guaranteed growth.
- Не добавлять интеграции, пока один content loop не повторяется.

## Gates

Переходить дальше можно только если:

- Qualification: клиент принимает production-control метрику.
- Intake: есть approval owner, QA/release owner и result owner.
- Week 1: есть owner decision и QA gate.
- Day 7: выбран `next_content_step` и `week_2_decision`.
- Week 2: не добавлено больше одного нового измерения.

## Final Decision

Continue:

- loop повторился;
- роли понятны;
- result source подтверждается;
- клиент видит ценность в управлении производством текста.

Narrow:

- ценность есть, но каналов/форматов слишком много;
- оставить один канал, один формат, один cadence.

Repair:

- blocker понятен и исправим;
- следующая неделя сначала чинит approval, QA, release или confirmation.

Stop:

- нет владельца решений;
- нет result source;
- клиент требует guaranteed commercial result;
- пилот создаёт больше ручного хаоса, чем убирает.

## Demo Support

Для первого показа использовать:

```text
docs/pilot-demo-checklist.md
```

## Closeout

После финального решения заполнить:

```text
docs/pilot-closeout-report-template.md
```

Если есть коммерческий next step, собрать предложение:

```text
docs/pilot-pricing-offer-one-pager.md
```

После предложения отправить follow-up:

```text
docs/pilot-sales-follow-up-templates.md
```
