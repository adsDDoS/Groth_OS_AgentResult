# Hermes Agent Integration

This document defines how Hermes Agent should be introduced into AgentResult OS.

Sources reviewed:

- https://hermes-agent.nousresearch.com/docs/
- https://github.com/NousResearch/hermes-agent
- https://hermes-agent.nousresearch.com/docs/user-guide/messaging
- https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram
- https://hermes-agent.nousresearch.com/docs/user-guide/features/tools
- https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
- https://hermes-agent.nousresearch.com/docs/user-guide/features/memory
- https://hermes-agent.nousresearch.com/docs/user-guide/features/cron
- https://hermes-agent.nousresearch.com/docs/developer-guide/architecture
- https://hermes-agent.nousresearch.com/docs/ko/developer-guide/programmatic-integration
- https://hermes-agent.nousresearch.com/docs/user-guide/docker

## Executive Decision

Hermes should be integrated as the agent runtime and owner-notification worker, not as the source of truth.

AgentResult backend remains responsible for:

- tenant data;
- tasks;
- approvals;
- publication state;
- audit events;
- Telegram control callbacks;
- integration credentials;
- result signals.

Hermes is responsible for:

- reading prepared tasks;
- researching;
- drafting;
- summarizing;
- proposing actions;
- creating reusable skills for AgentResult workflows;
- running scheduled owner briefs;
- sending owner summaries through the controlled Telegram path.

Hermes must not directly publish, send emails, change live site content, approve risky claims, or mark business actions complete without backend approval state.

## What Hermes Is

Hermes Agent is a long-running AI agent runtime from Nous Research. It combines:

- CLI/TUI interface;
- messaging gateway;
- API server;
- tool registry;
- terminal/file/browser tools;
- MCP tool integration;
- persistent memory;
- reusable skills;
- cron jobs;
- subagent delegation;
- multiple model providers;
- Docker and remote terminal backends.

The important architectural point: Hermes is not only an LLM wrapper. It is an operating runtime with memory, skills, tool execution, messaging, and scheduling.

## Current AgentResult State

AgentResult OS already has the correct control foundation:

- `tasks` as the backend work queue;
- `task_events` as handoff/audit trail;
- `approvals` as human decision state;
- `content_items` and `publishing_calendar_items` as material state;
- `GET /telegram/owner-brief`;
- `POST /telegram/owner-brief/send`;
- `POST /telegram/actions`;
- `POST /telegram/webhook`;
- `HERMES_BASE_URL`;
- `HERMES_API_KEY`;
- `HERMES_TELEGRAM_BOT_TOKEN`;
- `HERMES_TELEGRAM_OWNER_CHAT_ID`;
- `TELEGRAM_BOT_TOKEN`;
- `TELEGRAM_WEBHOOK_SECRET`;
- `TELEGRAM_APPROVAL_CHAT_ID`.

The current `apps/backend/src/modules/hermes/index.ts` is only a placeholder. The real integration should happen through a backend-owned adapter, not through dashboard logic.

## Target Architecture

```text
Dashboard / Telegram
        |
        v
AgentResult Backend  <----------------------------+
        |                                         |
        | creates tasks / approvals / state        |
        v                                         |
Postgres / local storage                          |
        |                                         |
        | task pull / result writeback             |
        v                                         |
Hermes Agent Runtime                              |
        |                                         |
        | tools, skills, research, drafts          |
        v                                         |
External tools / web / files / model providers ---+
```

Backend owns the contract. Hermes works through that contract.

## Integration Mode

Use Hermes as a separate service first.

Recommended initial path:

1. Run Hermes in Docker or on the same VPS as a sidecar process.
2. Enable Hermes API server only on a private network or behind internal auth.
3. Add a backend adapter that can create Hermes runs from queued `tasks`.
4. Add a result callback/writeback endpoint in AgentResult backend.
5. Keep Telegram owner decisions in AgentResult backend, not inside Hermes state.

For an owner-facing conversational bot, Hermes may own the Telegram bot gateway. In that mode, AgentResult backend must not use the same bot token as its own webhook receiver. Hermes owns the conversation; backend owns recorded business actions. See `docs/hermes-telegram-bot.md`.

## Programmatic Protocol Choice

Hermes exposes multiple integration surfaces:

- ACP: good for IDEs.
- TUI gateway JSON-RPC: best for full interactive host control.
- API server over HTTP/SSE: best for backend-to-agent automation.
- Python in-process import: best for embedded local experiments, not production first.

For AgentResult OS, use the Hermes API server or a thin worker process first.

Reason:

- Fastify backend is TypeScript.
- HTTP fits current deployment and observability.
- AgentResult needs durable task/result contracts, not full TUI control.
- Approval remains in backend.

TUI gateway JSON-RPC can be added later if we need live steering, session branching, or streamed tool events in the dashboard.

## Backend Contract

Add these backend-owned concepts before deep Hermes work:

### Task Envelope

```json
{
  "taskId": "uuid",
  "tenantId": "uuid",
  "role": "content_writer",
  "taskType": "draft_material",
  "targetType": "content_item",
  "targetId": "uuid",
  "context": {
    "company": {},
    "approvalRules": {},
    "forbiddenClaims": [],
    "materials": []
  },
  "constraints": {
    "approvalFirst": true,
    "noExternalSend": true,
    "noLivePublish": true
  },
  "expectedOutput": {
    "kind": "draft_and_risk_flags",
    "schemaVersion": 1
  }
}
```

### Result Envelope

```json
{
  "taskId": "uuid",
  "status": "completed",
  "artifacts": [
    {
      "type": "draft",
      "targetType": "content_item",
      "targetId": "uuid",
      "payload": {}
    }
  ],
  "proposedActions": [
    {
      "type": "approval_request",
      "scope": "social_post",
      "summary": "Material requires owner approval before release."
    }
  ],
  "riskFlags": [
    "public claim",
    "channel publishing"
  ]
}
```

Hermes may propose actions. Backend decides which actions become approval requests, tasks, content updates, or handoffs.

## Owner Control Loop

The target loop remains:

```text
Hermes prepares -> backend records -> owner approves -> backend releases or hands off -> result is tracked
```

Telegram is a control surface:

- brief;
- decision;
- change request;
- handoff confirmation;
- result signal.

Telegram is not a publication channel for AgentResult OS.

## Skills Strategy

Hermes skills should encode repeatable AgentResult workflows, not customer secrets.

Initial skills:

- `agentresult-owner-brief`
- `agentresult-content-brief`
- `agentresult-risk-check`
- `agentresult-manual-handoff`
- `agentresult-results-summary`
- `agentresult-receivables-followup`

Each skill should include:

- input contract;
- output schema;
- forbidden actions;
- approval rules;
- language standard;
- examples.

Do not store live customer credentials, private financial data, or raw lead lists in skills.

## Memory Strategy

Hermes memory is useful for project conventions and operator preferences, but it should not replace AgentResult storage.

Allowed memory:

- AgentResult architecture conventions;
- preferred owner-facing language;
- local environment notes;
- workflow lessons;
- stable product principles.

Not allowed in Hermes memory:

- access tokens;
- customer secrets;
- private lead data;
- receivables details;
- legally sensitive commitments;
- credentials for Telegram, CRM, CMS, bank, email.

## Cron Strategy

Use Hermes cron for scheduled analysis and notification triggers only.

Good cron jobs:

- morning owner brief;
- daily approval reminder;
- weekly result summary;
- stalled handoff check;
- content queue audit.

Bad cron jobs:

- publish automatically;
- send emails automatically;
- approve content;
- mark receivables recovered;
- update live website content.

Cron output should call backend endpoints or produce a proposed action. Backend must write final state.

## Tool Strategy

Enable tools conservatively by environment.

Local development:

- web/search;
- file read/write inside repo;
- terminal with approval;
- browser checks;
- memory;
- skills.

Production:

- no unrestricted shell against production host;
- no direct database shell by default;
- no customer credential file access;
- MCP tools only through allowlisted servers;
- terminal backend should be Docker or remote sandbox;
- all state changes through AgentResult API.

## Security Boundaries

Required boundaries:

- private network between backend and Hermes;
- API key between backend and Hermes;
- allowlisted backend endpoints for Hermes;
- per-tenant task context;
- no raw database credentials inside Hermes prompt;
- structured outputs validated by backend;
- audit event for every Hermes handoff and result writeback;
- approval-first state transitions for public or money-sensitive actions.

## Deployment Shape

### Local

```text
dashboard: 127.0.0.1:4173
backend:   127.0.0.1:3000
Hermes:    127.0.0.1:8642 or Docker service hermes:8642
```

### VPS / Production

```text
Caddy / ingress
  -> dashboard static
  -> backend API

Private Docker network
  -> Postgres
  -> Hermes gateway/API
```

Hermes data should live in a persistent volume, separate from Postgres. Backups must include both Postgres and Hermes profile data, but Postgres remains the business source of truth.

## Implementation Plan

### Phase 1: Contract

- Add `POST /hermes/tasks/:id/dispatch`. Done.
- Add `POST /hermes/tasks/:id/result`. Done.
- Store Hermes run id in `task_events`. Done.
- Validate result envelopes with zod. Done.

Current Phase 1 behavior:

- `dispatch` prepares the Hermes task envelope and stores a `task_runs` row with `dispatch_prepared`;
- `result` accepts structured Hermes output, updates the task result, and records `hermes_result_received`;
- proposed actions remain proposed until backend approval rules turn them into actual approvals, handoffs, releases, or result records.

### Phase 2: Worker

- Add a small backend worker or separate service that:
  - reads queued tasks;
  - builds task envelope;
  - sends to Hermes API server;
  - records `hermes_run_started`;
  - listens/polls for result;
  - writes result back through backend rules.

### Phase 3: Skills

- Create AgentResult Hermes skills for:
  - content brief;
  - risk check;
  - owner brief;
  - result summary.

### Phase 4: Telegram

- Connect Hermes to the Telegram bot gateway. In progress.
- Keep owner-facing conversation in Hermes.
- Keep business actions in AgentResult backend.
- Do not point the same Telegram bot token at both Hermes and backend webhooks.
- Use `POST /telegram/actions` for recorded owner decisions.
- Keep owner decision state in Postgres.

### Phase 5: Production Hardening

- Add service health checks.
- Add retry/backoff for Hermes calls.
- Add run timeout and cancellation.
- Add per-tenant rate limits.
- Add audit view for Hermes task results.
- Add QA test suite for approval-first boundaries.

## Non-Goals

Do not build:

- a second dashboard inside Hermes;
- a Telegram bot that changes business state outside AgentResult backend;
- direct Hermes writes to publishing state;
- direct Hermes writes to CRM/email/CMS;
- prompt-only business state without backend persistence.

## Senior Engineering Assessment

Hermes is a good fit for AgentResult OS if treated as the execution brain, not the operating ledger.

The correct architecture is:

```text
Backend = state, rules, approvals, audit
Hermes = reasoning, drafting, scheduled work, skills
Telegram = owner decisions
Dashboard = setup, fallback, demo, source of truth
```

The wrong architecture is:

```text
Hermes owns Telegram, memory, tasks, publishing, and state
```

That would be fast to demo and fragile in production.

The disciplined path is slower by one integration layer, but it preserves the product promise: control, decisions, release, result.
