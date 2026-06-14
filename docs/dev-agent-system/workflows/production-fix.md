# Production Fix Playbook

This playbook is for production bugs in AgentResult OS, especially dashboard flows where local demo state, owner decisions, and Vercel deployment can drift.

Example incident: dashboard publications showed a stale owner decision because approval `a3` was already approved while linked calendar item `p3` stayed in `draft`.

## 1. Investigate

Lead Product Engineer:

- restate the user-visible bug;
- define the owner-facing expected behavior;
- write acceptance criteria before editing.

Repo Archaeologist:

- confirm repo path and Git remote;
- confirm branch and worktree status;
- read `AGENTS.md` and `knowledge.md`;
- find the source files for the affected route, state seed, and deploy root.

Expected evidence:

```bash
git status --short --branch
git remote -v
rg -n "publications|publishing_calendar_item|approval" apps docs scripts
```

## 2. Model The State

Backend Domain Agent:

- identify the entities and state transitions;
- decide whether the issue is seed data, reconciliation logic, UI filtering, or backend contract;
- keep `handed_off` distinct from `published`;
- preserve approval-first behavior.

For publications, the invariant is:

```text
approved publishing_calendar_item approval
  -> linked calendar item draft/review becomes scheduled
  -> linked calendar item handed_off/published is not overwritten
```

Owner decision column invariant:

```text
show only calendar items that genuinely require owner decision
```

## 3. Implement

Frontend Product Agent:

- keep the owner flow coherent:
  - topic approval;
  - manager QA;
  - release queue;
  - live check;
  - published/results;
- remove stale decision cards only through correct state logic;
- keep RU/ENG behavior intact.

Backend Domain Agent:

- attach decision metadata when available:
  - `decision_note`;
  - `decided_by`;
  - `decided_at`;
- avoid overwriting `handed_off` or `published`.

## 4. Verify Locally

QA Smoke Agent:

Run focused checks:

```bash
npm run build
npm run lint
npm run dashboard:smoke
```

For publications, verify:

- initial `/?demo=reset&v=next#/publications` has one pending topic approval;
- no stale approved `p3` item asks for `Согласовать тему`;
- approval moves to `#/content-pipeline`;
- `QA пройден` returns to publications;
- release queue shows QA evidence `5/5`;
- `К проверке выхода` opens result confirmation;
- `Подтвердить результат` or `Отметить: вышло` makes release queue `0`;
- published count increments;
- next action becomes `Открыть результаты`;
- reload without `demo=reset` keeps the completed state.

## 5. Deploy Through Git

DevOps Deploy Agent:

- confirm Vercel project root is `apps/dashboard`;
- confirm Git repo is `adsDDoS/Groth_OS_AgentResult`;
- confirm build command is `npm run build`;
- confirm output directory is `public`;
- commit and push before production deploy;
- inspect the ready deployment and aliases.

Expected evidence:

```bash
npx vercel project inspect dashboard --scope adsddosss-4657s-projects
git push origin main
npx vercel ls dashboard --scope adsddosss-4657s-projects
npx vercel inspect <deployment-url> --scope adsddosss-4657s-projects
```

## 6. Verify Production

QA Smoke Agent:

- check the stable production URL:

```text
https://dashboard-orpin-mu-26.vercel.app/?demo=reset&v=prod-smoke#/publications
```

- if headless Playwright hits Vercel Security Checkpoint, use a real browser session and record that limitation;
- verify the same owner flow as local;
- verify reload persistence without `demo=reset`.

Known limitation:

```text
Vercel Security Checkpoint can block headless production smoke with Code 21.
This is not proof that the dashboard flow failed. Use real-browser verification for production until the checkpoint policy is changed.
```

## 7. Document And Close

Docs Runbook Agent:

- update runbooks if deployment, smoke, or environment behavior changed;
- keep the note short and command-oriented.

Lead Product Engineer:

- confirm Git status is clean;
- confirm no temporary browser/bridge/server process is left running;
- write final result with evidence;
- propose the next weighted goal.

