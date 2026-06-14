# AgentResult Product Course

Read this before starting a new AgentResult / GrothOS chat or task.

## Mission

AgentResult is a serious operating cockpit for controlled B2B content production and growth operations.

It is not a generic AI dashboard, landing page, tutorial product, engineering admin panel, or text generator toy.

The product exists to make the production loop visible and controllable:

```text
AgentResult prepares -> owner approves -> team releases -> publication is confirmed -> next content step is chosen
```

## Product Standard

The target quality bar is a mature business system: Bitrix24, amoCRM, Salesforce, HubSpot, Linear, Airtable, Stripe, and Vercel dashboards.

The product should feel dense, calm, practical, and operational. It should not explain itself with long text. It should make the next action obvious through structure.

Use tables, queues, status chips, detail drawers, filters, audit history, and one primary action per work item.

Avoid hero sections, tutorial copy, decorative cards, AI hype, vanity analytics, and duplicated demo logic that hides backend truth.

## Core Surfaces

- Command Center: what needs a decision now.
- Content Pipeline: what is being produced, reviewed, and QA-checked.
- Publication Desk: what is ready to release, handed off, live, or blocked.
- Results Desk: publication URL, channel, format, reactions, and next content step.
- Knowledge Base: offer, products, proof, author voice, forbidden claims, and channel rules.
- Control Layer: audit trail, approvals, risk flags, and state history.

## Domain Homes

- `approval` lives in the decision queue.
- `content_item` lives in the content pipeline.
- `publishing_calendar_item` lives in the publication desk.
- `publication_result` lives in the results desk.
- owner/action history lives in audit/control.

Do not spread the same domain object across multiple screens with different meanings.

## Content Farm Scope

AgentResult currently measures the production contour of content:

- created;
- approved;
- QA-passed;
- handed off;
- published;
- confirmed by URL;
- reacted to;
- reused, expanded, updated, or left.

Do not add lead, CRM, demand, or money language to content publication results unless there is a real connected source: analytics, CRM request, deal, invoice, payment, or qualified request.

## Backend Rule

Backend domain commands and transition guards are the source of truth.

The dashboard can render and assist, but it should not own domain integrity. If a state transition matters, it belongs in backend contract/service logic and should be verified by smoke checks.

## Agent Workflow

Every meaningful task should move through:

```text
investigate -> implement -> verify -> document -> propose next weighted goal
```

The next weighted goal is mandatory at the end of product/engineering work. It should name the highest-leverage next step and explain briefly why it matters now.

## Current Direction

The immediate product direction is to finish all possible functional foundations first, then raise the dashboard visual quality:

1. Make domain contracts durable and backend-owned.
2. Complete publication/result workflows across dashboard and Telegram.
3. Keep demo/local behavior coherent without contradicting production truth.
4. Turn the dashboard into a polished operational cockpit.
5. Deploy through Git-backed production pipeline and verify with smoke.

When in doubt, choose the useful operating cockpit over a pretty explanatory demo.
