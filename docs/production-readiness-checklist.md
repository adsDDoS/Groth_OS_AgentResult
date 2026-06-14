# AgentResult Production Readiness Checklist

Last checked: 2026-06-14.

## Current Verdict

AgentResult is ready for controlled demo and private-beta operation, not full
customer production.

The working contour is:

```text
AgentResult prepares -> owner decides -> manual handoff -> publication confirmed -> result recorded
```

The strongest production-ready part is the backend-owned content factory state
machine plus Telegram owner-control polling on the VPS. The weakest part is
customer-production hardening: secrets, auth, tenant isolation, real channel
integrations, backup/restore drills, and visual dashboard polish.

## Verified Working

- Backend TypeScript build passes.
- Shared domain state machine check passes.
- Approval side effects pass.
- Publishing command guards pass.
- Telegram polling invariant passes.
- Telegram owner-control regression passes.
- Dashboard smoke passes.
- Live Vercel demo API proxy passes read and write-guard checks.
- VPS owner-control production smoke passes.
- VPS invariant health passes.
- `agentresult-vps-health.timer` is enabled and active.
- GitHub Actions `AgentResult VPS health` is configured with a restricted
  forced-command SSH key and a repository secret.

## Evidence Commands

Local gates:

```bash
npm run build
npm run domain:check
npm run lint
npm run dashboard:smoke
npm run telegram:regression
npm run content-factory:check
```

Live/VPS gates:

```bash
bash scripts/smoke-demo-api-proxy-vps.sh
npm run telegram:production-smoke
npm run vps:agentresult-health
```

External ops gate:

```text
GitHub Actions -> AgentResult VPS health -> Run workflow
```

## Real Product Capabilities

- Approval-first content lifecycle is implemented in backend contracts.
- Publishing status distinguishes approved, handed off, and published.
- `publication_result` / distribution result data exists above calendar state.
- Results commands can mark next content action: reuse, expand, update.
- Telegram owner-control understands ordinary owner phrases for the current
  content loop.
- Telegram owner-control polling clears webhook and avoids webhook/polling
  split-brain.
- Owner-control bot token is isolated to the owner-control container by health
  checks.
- Dashboard can run as a stable sales/demo and private-beta control surface.
- Static Vercel demo has a guarded API proxy and write guard.
- VPS health has both systemd timer and GitHub manual workflow coverage.
- GitHub Actions VPS health also runs every 30 minutes.
- API-key and tenant whitelist guard exists for pilot deployments.

## Demo / Private-Beta Only

- The Vercel dashboard is primarily a demo/private-beta surface.
- `?demo=pilot` and `?demo=reset` are demo browser-state flows.
- Local storage mode is development/demo only.
- Manual handoff is the production-safe publishing path; direct channel
  publishing is not connected.
- Result metrics are first-order production signals, not revenue attribution.
- Telegram owner-control is the daily surface; dashboard is still the setup,
  trust, and fallback surface.

## Do Not Show As Production

- Do not claim autonomous publishing.
- Do not claim automatic Telegram channel posting, VC.ru posting, CMS posting,
  email delivery, or ad/CRM integration.
- Do not show empty money metrics or imply measured revenue attribution.
- Do not expose Hermes/tool/runtime terminology to customers.
- Do not show raw logs, terminal output, stack traces, or backend probes in the
  owner surface.
- Do not use a leaked Telegram token in a customer pilot.
- Do not reset the main pilot tenant during a demo.
- Do not run Hermes gateway polling and backend owner-control polling on the
  same bot token.

## Blocking Before Customer Production

1. Rotate the leaked Telegram owner-control bot token through BotFather and run
   `NEW_TELEGRAM_BOT_TOKEN=<new-token> npm run vps:rotate-owner-token`.
2. Deploy pilot backend with `AGENTRESULT_REQUIRE_API_KEY=1`,
   `AGENTRESULT_API_KEY`, and `AGENTRESULT_ALLOWED_TENANT_IDS`.
3. Define tenant provisioning and reset policy outside demo-only flows.
4. Run a fresh backup restore drill with `npm run db:restore-drill`.
5. Lock down production secrets and rotate anything pasted into chat, logs, or
   screenshots.
6. Keep scheduled GitHub Actions health checks green.
7. Decide which external channels are manual-only and which will become native
   integrations.

## Product Gaps Before Visual Dashboard Work

- Owner onboarding needs a real setup flow, not only demo seed assumptions.
- The dashboard needs a tighter operational IA around Today, Publications,
  Results, Settings, and company setup.
- Results should become a work center for next content decisions, not only a
  confirmation counter.
- Telegram should stay concise and action-led; slash commands should remain
  compatibility shortcuts.
- Production copy must consistently sell a controlled content factory, not a
  generic AI dashboard.
- Admin/runtime health should remain separate from customer-facing screens.

## Readiness Rule

Before any production or private-pilot claim, these must be true:

- `npm run content-factory:check` passes.
- `npm run auth:tenant-guard:check` passes.
- `npm run telegram:production-smoke` passes.
- `npm run vps:agentresult-health` passes.
- The latest `AgentResult VPS health` GitHub Actions run is green.
- No known leaked token remains active.
- The demo story matches `docs/customer-demo-contract.md`.
