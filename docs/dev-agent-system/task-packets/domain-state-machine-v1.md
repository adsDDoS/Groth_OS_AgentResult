# Agent Task Packet: Domain State Machine v1

## Objective

Define the canonical state machine for the first AgentResult Growth Control product loop:

```text
approval -> content_item -> publishing_calendar_item -> distribution_signal
```

This packet turns the Dev Agent System from a role document into a working task intake for the next product implementation step.

## User Value

The owner should see one clear next action at every moment:

- approve or request changes;
- let AgentResult and the manager move the material through QA;
- confirm live release;
- inspect the publication result and distribution signal.

The system must not show stale decisions like an already approved topic asking for approval again.

## Source Of Truth

Current backend tables:

- `approvals`
- `content_items`
- `publishing_calendar_items`
- `conversion_events`
- `published_urls`
- `page_metrics`
- `channel_metrics`

Current dashboard demo source:

- `apps/dashboard/app.js`
- `apps/dashboard/modules/publications.js`

Current workflow docs:

- `knowledge.md`
- `docs/dev-agent-system.md`
- `docs/dev-agent-system/workflows/production-fix.md`

## Current Gap

`approval`, `content_item`, and `publishing_calendar_item` exist as first-class tables.

`distribution_signal` is the canonical backend contract, but not yet a first-class table. Result data currently lives across analytics and publishing tables:

- `conversion_events` for compatibility storage until a dedicated migration exists;
- `published_urls` for live material records;
- `page_metrics` and `channel_metrics` for aggregate performance;
- `publishing_calendar_items.metadata` for demo/manual result notes.

Domain State Machine v1 should either:

- keep `distribution_signal` as a view/contract over current tables; or
- introduce a dedicated `distribution_signals` table in a later implementation packet.

This packet does not require a database migration. It defines the contract that the next implementation must follow.

## Entity State Machines

### approval

Purpose: records explicit owner or responsible-person decision.

Known statuses:

- `pending`
- `approved`
- `rejected`
- `changes_requested`

Allowed transitions:

```text
pending -> approved
pending -> rejected
pending -> changes_requested
changes_requested -> pending
```

Terminal states:

- `approved`
- `rejected`

Required metadata on decision:

- `decided_by`
- `decision_note`
- `decided_at`

Invariants:

- `approved` approval must not remain visible as an owner decision.
- `rejected` approval must not move content or calendar forward.
- `changes_requested` must route work back to draft/review, not to release.
- target-specific side effects must be explicit and idempotent.

### content_item

Purpose: represents the prepared material or topic being moved through draft, review, approval, QA, and release readiness.

Canonical statuses for v1:

- `idea`
- `draft`
- `review`
- `changes_requested`
- `approved`
- `qa_ready`
- `scheduled`
- `handed_off`
- `published`
- `archived`
- `rejected`

Allowed transitions:

```text
idea -> draft
draft -> review
review -> approved
review -> changes_requested
changes_requested -> draft
approved -> qa_ready
qa_ready -> scheduled
scheduled -> handed_off
handed_off -> published
approved -> archived
scheduled -> archived
rejected -> archived
```

Invariants:

- content that requires public release must have an approval before `approved`.
- manager QA must be represented before release queue readiness.
- `handed_off` means the material left AgentResult control but is not confirmed live.
- `published` means the owner or responsible person confirmed the live result.

### publishing_calendar_item

Purpose: represents channel release state for an approved or release-ready content item.

Known statuses from backend route:

- `draft`
- `review`
- `scheduled`
- `published`
- `handed_off`
- `archived`
- `rejected`

Canonical v1 statuses:

- `draft`
- `review`
- `scheduled`
- `handed_off`
- `published`
- `archived`
- `rejected`

Allowed transitions:

```text
draft -> review
review -> scheduled
scheduled -> handed_off
handed_off -> published
draft -> rejected
review -> rejected
scheduled -> archived
handed_off -> archived
published -> archived
```

Approval reconciliation invariant:

```text
approved publishing_calendar_item approval
  + calendar item status draft/review
  -> calendar item status scheduled
```

Do not overwrite:

- `handed_off`
- `published`
- `archived`

Required decision metadata in `metadata` when available:

- `decision_note`
- `decided_by`
- `decided_at`

Owner UI invariant:

```text
Temy nedeli column shows only pending approvals or calendar items that genuinely require owner decision.
```

### distribution_signal

Purpose: represents the content-operations signal after a material is live or handed into a publication-confirmation flow.

Canonical v1 statuses:

- `expected`
- `awaiting_confirmation`
- `confirmed`
- `actionable`
- `dismissed`

Allowed transitions:

```text
expected -> awaiting_confirmation
awaiting_confirmation -> confirmed
confirmed -> actionable
confirmed -> dismissed
actionable -> dismissed
```

Current storage mapping:

- `publishing_calendar_items.status = handed_off` means signal is expected but not confirmed.
- `publishing_calendar_items.status = published` means live release is confirmed.
- `published_urls` records public live evidence when URL exists.
- `conversion_events` records `distribution_signal.confirmed` events and still reads legacy `result_signal.confirmed` events until migration.
- aggregate metrics remain in `page_metrics` and `channel_metrics`.

Invariants:

- no result can be counted before `published` or explicit manual confirmation;
- signal source must be content-facing, for example publication URL, channel reaction, comment, repost, save, indexation mark, or manual owner mark;
- a confirmed result should create or update a visible Results next action.

## Cross-Entity Flow

```text
1. AgentResult prepares content_item draft/review.
2. Backend opens approval pending for content_item or publishing_calendar_item.
3. Owner approves.
4. Approval side effect moves content/calendar to the next safe state.
5. Manager QA marks content release-ready.
6. publishing_calendar_item moves to scheduled.
7. Manager hands off or releases channel work.
8. Owner/responsible person confirms live.
9. System records distribution_signal through current analytics/result storage.
10. Results screen shows next content step based on publication evidence and primary reactions.
```

## Agent Assignments

### Repo Archaeologist

Deliverables:

- list actual status values used in backend routes, dashboard demo seed, Telegram owner-control, and docs;
- identify mismatches with this packet;
- report source files and line references.

### Backend Domain Agent

Deliverables:

- propose TypeScript constants or shared types for canonical statuses;
- identify where approval side effects should live;
- decide whether `distribution_signal` should be a new table or derived contract in v1.

### Frontend Product Agent

Deliverables:

- map dashboard columns and next actions to this state machine;
- identify any UI state that can show stale owner decisions;
- preserve RU/ENG and owner-facing language.

### QA Smoke Agent

Deliverables:

- update or confirm smoke coverage for:
  - pending approval count;
  - approved item not shown as pending;
  - QA evidence;
  - release queue;
  - live confirmation;
  - reload persistence.

### DevOps Deploy Agent

Deliverables:

- confirm whether this is docs-only, backend-only, dashboard-only, or full-stack;
- define deploy and rollback path for the eventual implementation.

### Docs Runbook Agent

Deliverables:

- update `docs/database.md`, `docs/approval-flow.md`, or `docs/agent-workflows.md` when the implementation lands;
- keep the state machine linked from `docs/dev-agent-system.md`.

## Acceptance Criteria

- The task packet names the four entities and their canonical statuses.
- The packet documents current storage reality for `distribution_signal`.
- The packet defines side-effect rules for approved calendar approvals.
- The packet assigns concrete work to every Dev Agent System role.
- `npm run agent-system:check` validates that this packet exists.
- `npm run lint` and `npm run build` pass after adding the packet.

## Out Of Scope

- Database migration for `distribution_signals`.
- Backend route changes.
- Dashboard UI changes.
- Vercel deploy.

## Lead Decision Needed After Packet

Choose the implementation path:

```text
Option A: docs/types first
  -> add shared status constants, no DB migration.

Option B: backend reconciliation first
  -> move approval side effects into backend service.

Option C: distribution_signal table first
  -> add migration and Results contract before UI expansion.
```

Recommended next implementation path:

```text
Option A, then Option B.
```

Reason: status constants and state-machine tests reduce product ambiguity before backend side effects are moved out of demo/dashboard logic.
