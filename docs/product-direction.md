# AgentResult Product Direction

This document is the durable product course for AgentResult OS / GrothOS work.
Use it before product, UX, dashboard, Telegram, backend workflow, or agent task
changes.

For the first visual implementation pass, use
`docs/visual-dashboard-blueprint-v1.md`.

## North Star

AgentResult is not a generic AI dashboard and not a tutorial product. It is an
operating system for controlled B2B content production and growth operations.

The product must always answer four operator questions:

- What needs a decision now?
- What is already in work?
- What is ready to release?
- What went live, what happened, and what should be reused next?

If a screen, block, metric, or action does not help answer one of these
questions, compress it, move it into details, or remove it.

## Product Shape

Build AgentResult as a working cockpit, not as a landing page or explanatory
demo.

Core work surfaces:

- Command Center: today's owner and manager decisions.
- Content Pipeline: material production from idea to approved and QA-ready.
- Publication Desk: release queue, handoff, live check, and publication status.
- Results Desk: publication URL, channel, format, primary reactions, and next
  content step.
- Knowledge Base: offer, products, proof, author voice, forbidden claims, and
  channel rules.
- Control Layer: audit trail, approvals, risk flags, and state history.

Each domain object has one natural home:

- `approval` lives in the decision queue.
- `content_item` lives in the content pipeline.
- `publishing_calendar_item` lives in the publication desk.
- `publication_result` lives in the results desk.
- owner/action history lives in audit/control.

Do not smear the same object across many screens with different meanings.

## UX Standard

The product should feel closer to Bitrix24, amoCRM, Salesforce, HubSpot, Linear,
Airtable, Stripe, and Vercel dashboards than to an AI SaaS landing page.

Use:

- dense but readable tables and lists;
- clear status chips;
- one primary next action per row or detail view;
- filters, tabs, queues, and detail drawers;
- concise owner-facing labels;
- visible audit and state history where decisions matter.

Avoid:

- long explanatory copy inside the app;
- feature descriptions posing as UI;
- oversized hero sections;
- decorative cards that do not carry work;
- AI hype, empty analytics, and vanity metrics;
- duplicated demo fallbacks that hide backend truth.

The interface should explain itself through structure, not through paragraphs.

## Operating Loop

The canonical loop is:

```text
AgentResult prepares -> owner approves -> team releases or hands off -> result is confirmed -> next content step is chosen
```

Dashboard, Telegram, and backend must support the same loop:

- Telegram is the daily owner control surface.
- Dashboard is the operational cockpit and fallback surface.
- Backend is the source of truth for state, commands, audit, and transition
  guards.
- Agents prepare work; they do not silently approve, publish, or rewrite
  production state outside backend commands.

## Dashboard Direction

The first screen should be a working Command Center, not a welcome page.

The concrete Visual Dashboard v1 implementation blueprint is
`docs/visual-dashboard-blueprint-v1.md`.

Recommended main navigation:

- Command Center
- Content Pipeline
- Publication Desk
- Results Desk
- Knowledge Base
- Audit
- Settings

Recommended detail pattern:

- list/table/queue on the left;
- right-side detail drawer for preview, metadata, approvals, and audit;
- primary action pinned in the detail area;
- secondary actions grouped and quiet.

Russian owner screens must be short and practical. No tutorial phrases such as
`Как работать`, `Роль дашборда`, or repeated explanations of obvious buttons.

## Results Direction

AgentResult measures the production contour of content before it measures sales.

The Results Desk should track:

- publication URL;
- channel;
- format;
- confirmation time and confirmer;
- primary reactions;
- reuse/expand/update/leave decision;
- created follow-up material or update task;
- source approval and calendar item.

Do not use lead, CRM, demand, or money language in this layer unless a real
analytics, CRM, request, deal, invoice, or payment source exists.

## Decision Rule

When choosing between a pretty dashboard and a more useful operating cockpit,
choose the cockpit.

When choosing between explaining a feature and making the next action obvious,
make the action obvious.

When choosing between UI-side convenience and backend-owned domain truth, choose
backend-owned domain truth.
