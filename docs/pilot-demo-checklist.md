# Pilot Demo Checklist

Use this before a first client-safe GrothOS demo.

Квалификация перед показом:

```text
docs/pilot-qualification-note.md
```

Intake перед пилотом:

```text
docs/pilot-onboarding-intake.md
```

Week-1 execution board:

```text
docs/pilot-week-1-execution-board.md
```

Day 7 review:

```text
docs/pilot-day-7-review-template.md
```

Week-2 expansion board:

```text
docs/pilot-week-2-expansion-board.md
```

Canonical script:

```text
docs/pilot-demo-script.md
```

One-page operator card:

```text
docs/demo-operator-card.md
```

Pilot call packet:

```text
docs/pilot-call-packet.md
```

Pre-call dry run:

```text
docs/pre-call-dry-run.md
```

Stable dashboard:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=pilot&v=precall-dryrun#/overview
```

## Show

- `Сегодня`: main action, status cells, action queue.
- `Публикации`: queue, live check, published.
- `Результаты`: URL, channel, reactions, next content step.

## Scenario

```text
topic decision -> manager QA -> release queue -> live confirmation -> publication result
```

## Say

```text
GrothOS turns content production into a controlled loop: topic, owner decision, QA, release, confirmed publication, and next content step.
```

```text
Передано в выпуск не равно опубликовано. Результат появляется только после подтверждения выхода.
```

```text
Мы не обещаем продажи от поста без аналитики. Сначала фиксируем факт выхода, первичную реакцию и следующий контент-шаг.
```

## Avoid

- `База`
- `Настройки`
- backend/API/VPS/GitHub/Vercel
- reset commands
- slash-command training
- raw tokens or env values
- money/revenue attribution
- CRM claims
- guaranteed growth
- autopublishing as default
- long dashboard walkthrough

## Pre-Call Verify

```bash
npm run dashboard:smoke
npm run pilot-demo:owner-flow-smoke
npm run vps:agentresult-health
bash scripts/smoke-demo-api-proxy-vps.sh
```

Optional only if Telegram will be shown:

```bash
npm run telegram:production-smoke
```

## Security

- Old Telegram token is allowed only for internal demo/pre-production.
- Rotate token before client pilot with real client data.
- Do not paste token values into chat, docs, screenshots, or calls.
