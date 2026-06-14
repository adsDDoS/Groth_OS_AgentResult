# Visual Dashboard Blueprint v1

This blueprint turns the product direction in `docs/product-direction.md` into
the first visual implementation plan for the AgentResult dashboard.

The goal is not to decorate the existing app. The goal is to make the dashboard
feel like a serious operating cockpit for a content factory: dense, calm,
predictable, and action-oriented.

## Product Standard

The dashboard must look and behave like business software, not like an AI demo.

Reference level:

- Bitrix24 and amoCRM for operational familiarity and owner control.
- Salesforce and HubSpot for object detail, pipeline discipline, and audit.
- Linear for density, quiet hierarchy, and fast lists.
- Airtable for table clarity and entity scanning.
- Stripe and Vercel dashboards for restrained polish.

Do not copy their branding or layout literally. Copy the standard: clear
navigation, dense data, stable controls, visible state, and obvious next action.

## Information Architecture

Target sidebar:

1. Command Center
2. Content Pipeline
3. Publication Desk
4. Results Desk
5. Knowledge Base
6. Audit
7. Settings

Route mapping from current app:

- `#/overview` becomes `Command Center`.
- `#/content-pipeline` stays `Content Pipeline`.
- `#/publications` becomes `Publication Desk`.
- `#/analytics` becomes `Results Desk`.
- `#/offer-brain` and useful parts of `#/growth-plan` move into `Knowledge Base`.
- owner/action audit gets its own `Audit` surface.
- `#/settings` stays `Settings`.

Legacy routes may stay as redirects during migration, but the visible product
navigation should use the target names.

## Global Shell

Use a stable app shell:

- left sidebar, fixed width on desktop;
- top bar with workspace name, environment/demo marker, refresh/sync state, and
  compact global actions;
- main content area with page header, tabs/filters, dense work surface, and
  optional right-side drawer;
- no hero sections;
- no floating marketing cards;
- no nested cards.

Top bar should show system state, not feature explanation:

- workspace/company;
- backend status: online/demo/local;
- last sync time;
- current language switch;
- primary action for the current page only when useful.

## Command Center

Purpose: answer "what needs attention now?"

Command Center is the first screen. It should not be a general analytics page.

Primary layout:

- left: action queue table;
- center/right: selected action detail drawer or panel;
- bottom or secondary band: production counters and recent activity.

Action queue rows should combine:

- priority;
- object type;
- title;
- owner role;
- due/release date;
- blocking reason;
- primary action.

Queue groups:

- Needs owner decision: pending approvals.
- Needs manager QA: approved material waiting for QA.
- Ready for release: scheduled or QA-ready publication items.
- Needs live confirmation: handed-off items.
- Needs next content step: publication results without final next-step decision.

Primary actions:

- approve;
- request changes;
- mark QA passed;
- hand off;
- confirm result;
- choose reuse/expand/update/leave.

Do not show explanatory copy such as how the dashboard works. The queue itself
is the explanation.

## Content Pipeline

Purpose: answer "what is already in work?"

Use a compact pipeline/table hybrid:

- tabs or segmented filter by status;
- table list for scanning;
- optional board view later, but table first.

Required columns:

- material;
- type/format;
- channel;
- status;
- owner;
- approval state;
- QA state;
- linked publication;
- updated time;
- next action.

Status order:

```text
idea -> draft -> review -> approved -> qa_ready -> scheduled -> handed_off -> published
```

The UI can display friendly labels, but it must not invent statuses outside the
backend domain contract.

## Publication Desk

Purpose: answer "what is ready to release?"

Publication Desk should replace the current mixed publications page with a
focused release workspace.

Primary tabs:

- Release Queue
- Calendar
- Waiting Live Check
- Published

Release Queue table columns:

- publication;
- channel;
- format;
- scheduled time;
- content status;
- approval;
- QA evidence;
- release owner;
- handoff state;
- next action.

Waiting Live Check table columns:

- publication;
- channel;
- handed off at;
- release owner;
- expected URL/source;
- days waiting;
- primary action: confirm result.

Calendar view:

- useful for schedule only;
- should not become the main decision surface;
- must not show already approved calendar items as owner decisions.

Rules:

- stale approved `publishing_calendar_item` approvals must not appear as new
  topic decisions;
- handoff is not published;
- published requires URL/source confirmation where possible;
- all release actions call backend commands.

## Results Desk

Purpose: answer "what went live, what happened, and what should be reused next?"

Results Desk is the center of the content factory feedback loop. It should not
be a generic analytics screen.

Primary layout:

- publication results table;
- selected result detail drawer;
- compact reaction summary;
- next-step action group.

Publication results table columns:

- publication;
- URL;
- channel;
- format;
- confirmed at;
- confirmed by;
- primary reactions;
- next step;
- follow-up object;
- source publication/calendar item.

Supported next-step actions:

- reuse: create the next material from the strongest angle;
- expand: create an article outline or larger content asset;
- update: create a task to update the published material;
- leave: mark as complete without new production work.

Do not use lead, CRM, demand, or money language unless a real integration source
exists. For this contour, results are production signals: URL, reactions,
comments, reposts, saves, and reuse decisions.

## Knowledge Base

Purpose: answer "what must the system know before producing work?"

Move long company/product/voice/rules material out of the daily surfaces.

Recommended sections:

- Company and positioning;
- Products and offers;
- Audience and pains;
- Proof assets;
- Author voice;
- Forbidden claims;
- Channels and release rules;
- Competitors and reference material.

Knowledge Base can be denser and more form-like than Command Center. It is a
setup and reference surface, not a daily action queue.

## Audit

Purpose: answer "who did what and why?"

Audit should expose backend owner/action events without forcing users to inspect
raw data.

Required filters:

- actor;
- action type;
- object type;
- date;
- source surface: dashboard, Telegram, backend command, demo seed.

Audit rows:

- timestamp;
- actor;
- action;
- object;
- previous state;
- next state;
- note/source.

Audit is not the main workflow, but it must be visible enough to support trust.

## Detail Drawer Pattern

Use a right-side drawer for object details across the dashboard.

Drawer structure:

1. Header: title, object type, status chip, close button.
2. Primary action: one clear next step.
3. Preview/body: material text, result URL, or calendar summary.
4. Metadata: owner, channel, dates, source links.
5. Related objects: approval, content item, calendar item, publication result.
6. Audit timeline: recent decisions and backend actions.
7. Secondary actions: compact and separated from the primary action.

The drawer should be stable across entities. Users should learn one interaction
model and reuse it everywhere.

Mobile behavior:

- drawer becomes full-screen sheet;
- primary action remains visible near the top;
- tables collapse into dense list rows with the same fields.

## Table Density Rules

Default to dense tables for operational surfaces.

Rules:

- row height: compact, stable, no layout jumping;
- max two text lines in primary title cell;
- status chips are short and color-coded;
- dates are relative only when paired with exact tooltip or detail value;
- primary action is always in the same row position;
- secondary actions go into a menu or drawer;
- table filters should not push the table below the fold;
- avoid card grids for work queues.

Recommended table controls:

- search;
- status filter;
- channel filter;
- owner filter;
- date range;
- saved view later, not required for v1.

## Visual Language

Mood:

- serious;
- quiet;
- crisp;
- production-focused;
- not decorative.

Use:

- restrained neutral base;
- one primary action color;
- semantic colors for state only;
- 8px radius or less for cards/panels;
- clear borders and dividers;
- compact icon buttons with tooltips.

Avoid:

- purple/blue AI gradients;
- beige/brown content-studio palette;
- oversized cards;
- decorative orbs/blobs;
- marketing hero composition;
- text-heavy onboarding blocks inside working screens.

## Existing Blocks To Remove Or Compress

Before visual implementation, audit current dashboard blocks and apply this
decision list.

Remove from daily surfaces:

- tutorial-style explanations of how the product works;
- modal guide content that repeats the obvious flow;
- feature-description cards;
- generic analytics narratives;
- empty money/leads metrics in the content factory contour;
- duplicated derived/demo data that can hide backend state.

Compress:

- Growth Plan into Knowledge Base and future planning views;
- Offer Brain into Knowledge Base;
- Settings explanatory panels into compact forms and status rows;
- publication helper text into table labels, chips, and drawer metadata;
- result flow diagrams into the Results Desk table and drawer timeline.

Keep but redesign:

- owner command center;
- content pipeline;
- publication release queue;
- publication result confirmation form;
- publication results table;
- audit/action history;
- backend/demo status marker;
- language switch.

## Migration Slices

Implement visually in this order:

1. App shell and navigation rename.
2. Command Center dense action queue.
3. Shared table, status chip, and drawer components/patterns.
4. Publication Desk release queue and live-check views.
5. Results Desk publication result table and next-step drawer.
6. Knowledge Base consolidation.
7. Audit surface.
8. Final visual polish and responsive QA.

Each slice must keep the existing backend command flow intact.

## Acceptance Criteria

Visual Dashboard v1 is ready when:

- first screen is Command Center;
- sidebar matches the target information architecture;
- daily screens have no tutorial copy;
- publication flow actions still call backend commands;
- Results Desk uses real `publication_result` data when backend is online;
- each work surface uses dense tables/lists instead of decorative card grids;
- detail drawer works for at least content item, calendar item, and publication
  result;
- old Growth Plan/Offer Brain content is moved or compressed into Knowledge
  Base;
- audit is accessible as a product surface;
- RU/ENG switching still works;
- desktop and mobile layouts have no overlapping text or unstable controls;
- `npm run dashboard:smoke` passes;
- public Vercel smoke passes before production handoff.
