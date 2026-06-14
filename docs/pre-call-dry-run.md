# GrothOS Pre-Call Dry Run

Date: 2026-06-14

Production URL:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=pilot&v=precall-dryrun#/overview
```

## Result

Status: ready after copy-fix deploy verification.

Target time: 7 minutes.

Observed run shape: 3 screens only, no forbidden sections opened.

## Screens

1. `Сегодня`: main action, status cells, action queue.
2. `Публикации`: release queue, live check, published count.
3. `Результаты`: publication URL, primary reactions, next content step.

## Guardrails

- Did not open `База`.
- Did not open `Настройки`.
- Did not open backend/API/VPS/GitHub/Vercel during demo path.
- Did not use reset commands during the demo path.
- Did not expose tokens or env values.
- Did not demonstrate Telegram or Results next-step mutations.

## Friction Found

The first screen still used a sales-oriented demo topic:

```text
Почему одного AI-агента недостаточно, чтобы наладить продажи
```

This conflicted with the current product framing: GrothOS is a text content factory control surface, not a CRM/lead product.

## Fix

Changed pilot/demo copy to content-ops language:

```text
Почему контент-ферме нужен операционный контур, а не один AI-агент
```

Also updated the approval summary and preview to describe topics, texts, approvals, release, URL confirmation, primary reactions, and next content step.

## Final Gate

Before the call:

```bash
npm run dashboard:smoke
```

Then open the production URL above and stay inside the three-screen script.
