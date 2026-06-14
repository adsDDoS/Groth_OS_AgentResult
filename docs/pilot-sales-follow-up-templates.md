# GrothOS Pilot Sales Follow-Up Templates

Access: `operator-only`

Использовать после `docs/pilot-pricing-offer-one-pager.md`. Цель — отправить короткое сообщение по closeout decision без нового объяснения продукта.

## Continue

Когда использовать: closeout decision `Continue`, offer option `Paid Pilot`.

```text
Спасибо за пилот. Мы увидели главное: контур производства текста повторяется — темы проходят согласование, текст доходит до QA/выпуска, результат можно подтвердить URL/source, а следующий контент-шаг становится понятным.

Предлагаю не расширять хаотично, а перевести это в paid pilot на [term]: [included_materials], [channels], [owners]. Success metric остаётся production-control: сколько материалов прошло loop, где опубликовано, что получили как первичную реакцию и какой next content step выбран.

Следующий шаг: согласовать scope/price до [decision_deadline] и стартовать с [start_date].
```

## Narrow

Когда использовать: closeout decision `Narrow`, offer option `Narrow Production Loop`.

```text
Спасибо за пилот. Ценность видна, но сейчас лучше не расширять каналы и форматы. Самый здоровый следующий шаг — сузить контур до одного канала, одного формата и одного weekly cadence.

Предлагаю narrow production loop на [term]: канал [channel], формат [format], ритм [cadence]. Цель — стабильно проводить материалы через topic -> draft -> QA -> release -> confirmation без новых интеграций и без размывания ответственности.

Следующий шаг: подтвердить узкий scope до [decision_deadline] и запустить следующую неделю с [start_date].
```

## Repair

Когда использовать: closeout decision `Repair`, offer option `Repair Sprint`.

```text
Спасибо за пилот. Сейчас рано расширять контур: главный blocker — [blocker]. Хорошая новость в том, что он конкретный и его можно чинить отдельно, не смешивая с новыми каналами или форматами.

Предлагаю repair sprint на [term]: исправляем [blocker], на выходе получаем [repair_output], после чего повторяем week 1 gate и честно решаем continue / narrow / stop.

Следующий шаг: назначить owner [owner], подтвердить repair scope до [decision_deadline] и стартовать с [start_date].
```

## Message Rules

- Отправлять только один вариант.
- Не обещать leads, sales или revenue attribution.
- Не добавлять новый функционал в follow-up.
- Не предлагать offer при decision `Stop`.
- Всегда указывать decision deadline и конкретный next action.
