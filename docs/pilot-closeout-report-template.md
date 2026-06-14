# GrothOS Pilot Closeout Report Template

Использовать после `docs/pilot-operating-manual.md`. Цель отчёта — зафиксировать итог пилота и перевести его в решение: continue, narrow, repair или stop.

## 1. Pilot Summary

- Клиент:
- Период:
- Основной канал:
- Формат:
- Scope пилота:
- Итог в одном предложении:

## 2. Что Доказали

- Content loop прошёл: yes / partial / no.
- Owner decision работает: yes / partial / no.
- QA/release gate работает: yes / partial / no.
- Publication result подтверждается: yes / partial / no.
- Next content step понятен: yes / partial / no.

## 3. Что Не Доказали

- Commercial impact:
- CRM/revenue attribution:
- Автопубликация:
- Multi-channel scale:
- Analytics integration:
- Другое:

## 4. Production Metrics

| Metric | Value | Note |
| --- | --- | --- |
| Topics approved |  |  |
| Drafts produced |  |  |
| QA passed |  |  |
| Release handoffs |  |  |
| Published URLs confirmed |  |  |
| Primary reactions recorded |  |  |
| Next content steps selected |  |  |

## 5. Blockers

- Approval:
- Draft:
- QA:
- Release:
- Confirmation:
- Result source:
- Scope/control:

## 6. Decision

Выбрать одно:

- Continue: loop повторился, можно продлевать пилот или переводить в paid usage.
- Narrow: ценность есть, но нужен один канал/формат/cadence.
- Repair: blocker понятен, сначала чиним процесс.
- Stop: нет владельцев, result source или production-control value.

```text
decision:
why:
owner:
date:
```

## 7. Commercial Next Step

Выбрать одно:

- Продлить пилот на 2 недели.
- Перевести в paid pilot.
- Сузить offer и повторить week 1.
- Запланировать repair sprint.
- Закрыть без продажи.

Если выбран платный или repair next step, использовать offer one-pager:

```text
docs/pilot-pricing-offer-one-pager.md
```

```text
commercial_next_step:
price_or_scope:
decision_deadline:
follow_up_owner:
```

## Report Is Valid If

- перечислены доказанные и недоказанные зоны;
- production metrics заполнены без revenue claims;
- blockers названы конкретно;
- выбрано одно решение;
- есть коммерческий next step.
