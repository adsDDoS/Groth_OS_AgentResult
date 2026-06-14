# Codex Agent Instructions

Before making changes in this repository, read `knowledge.md`.

`knowledge.md` is the source of truth for AgentResult OS product direction, UX rules, demo state, backend/local mode, forbidden claims, and next logical steps.

`docs/product-course.md` is the compact course that should survive every new
chat. Use it to keep work aligned around the content-production operating
cockpit, backend-owned domain truth, and the mandatory next weighted goal.

`docs/product-direction.md` is the durable product course. Use it before
dashboard, Telegram, backend workflow, and agent task changes so the product
stays a serious operating cockpit, not a text-heavy AI demo.

## Project Identity

AgentResult OS is an owner-facing B2B operating system for the Russian market.

Do not treat it as:

- backend admin
- generic AI dashboard
- internal engineering console
- tutorial product
- content generator toy

Use owner-facing language:

- money
- leads
- tasks
- decisions
- control
- result
- approval
- publication
- handoff

Avoid raw backend terminology in the main UI.

## Non-Negotiables

- Do not rewrite the dashboard from scratch.
- Do not break RU/ENG switching.
- Do not reintroduce text-heavy dashboard explanations.
- Do not bring back phrases such as "Роль дашборда" or "Как работать с AgentResult".
- Do not bypass approval-first behavior.
- Do not add demo data that contradicts the sales story.
- Do not promise guaranteed growth, guaranteed receivables recovery, or AI without errors.
- After any meaningful change, propose the next logical product/technical step.

## Product Rule

The core loop is:

```text
Hermes prepares -> owner approves -> system publishes or hands off -> result is tracked
```

Every screen should help the owner answer at least one question:

- What needs my decision?
- What did the system do?
- What blocks growth or money?
- What is ready to go outside?
- What result appeared?
- What is my next action?

If a section does not support this loop, remove, compress, or rethink it.

## Local Run

Project path:

```text
/Applications/Работа/Учеба/Codex/ai-growth-os
```

Run local mode:

```bash
npm run local:agentresult
```

Run clean demo mode:

```bash
npm run local:agentresult:demo
```

Dashboard:

```text
http://127.0.0.1:4173
```

Clean browser demo state:

```text
http://127.0.0.1:4173/?demo=reset#/overview
```

Backend:

```text
http://127.0.0.1:3000
```

## Verification

After dashboard JS changes, run:

```bash
node --check apps/dashboard/app.js
```

After local runner changes, run:

```bash
node --check scripts/local-agentresult.mjs
```

When feasible, run:

```bash
npm run lint
npm run build
```

For UI work, verify the dashboard in browser.

Check:

- no console errors
- RU/ENG still works
- no English leakage in RU owner screens
- no old admin/tutorial phrases returned
- demo-flow remains coherent
- metrics match visible state

## Key Files

- `knowledge.md`
- `README.md`
- `apps/dashboard/index.html`
- `apps/dashboard/app.js`
- `apps/dashboard/styles.css`
- `apps/backend/src/db/memory.ts`
- `apps/backend/src/modules/content/routes.ts`
- `apps/backend/src/modules/publishing/routes.ts`
- `apps/backend/src/modules/common/repository.ts`
- `scripts/local-agentresult.mjs`
- `package.json`
