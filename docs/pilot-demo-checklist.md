# Pilot Demo Checklist

Use before a client pilot-demo of AgentResult Growth Control.

Canonical web demo contract:

```text
docs/customer-demo-contract.md
```

## Ready

- Demo tenant reset is complete.
- Dashboard opens on the demo tenant.
- Telegram/API full owner-flow smoke passes.
- Main pilot tenant was not reset.
- No owner-facing copy says Hermes.
- No Growth Control screen shows `Деньги: 0`.
- Telegram owner-control uses ordinary phrases, not slash-command training.
- The old Telegram bot token is allowed only for internal demo/pre-production;
  rotate it before any client pilot.

## Demo Path

1. Open `Сегодня`.
2. Open `Публикации`.
3. Send `что готово`.
4. Send `покажи первый`.
5. Send `согласую`.
6. Send `передал в выпуск`.
7. Send `вышло`.
8. Send publication URL.
9. Send format.
10. Send primary reactions.
11. Open `Результаты` or send `что по результату`.

## Verify

```bash
npm run content-factory:check
npm run pilot-demo:owner-flow-smoke
npm run telegram:production-smoke
npm run vps:agentresult-health
bash scripts/smoke-demo-api-proxy-vps.sh
```

Stable dashboard link:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=pilot#/overview
```

## Say

```text
AgentResult готовит работу, собственник принимает решение, команда выпускает, система фиксирует статус и сигнал.
```

```text
Передано не равно вышло. Материал считается результатом только после подтверждения выхода.
```

```text
Пилот не про магическую автономность. Он про устойчивый контур контроля: готово, решение, выпуск, результат.
```

## Avoid

- backend terminology
- slash-command training
- promises of guaranteed growth
- autopublishing as default
- money metrics without a real source
- long dashboard walkthrough
- leaked or pasted token values
