# Paid Pilot Week-1 Live Run

Access: `operator-only`

Use this as the live operating log for the first paid Telegram-first private pilot. The goal is to run the real week-1 loop through Telegram owner-control and dashboard cockpit, while capturing the friction that only appears under client pressure.

This document does not replace the product state. Product actions happen in Telegram owner-control and the dashboard. This log records facts, quotes, blockers, workarounds, and product follow-ups.

## Pilot Identity

- Client:
- Tenant:
- Owner Telegram:
- Operator:
- Approval owner:
- QA/release owner:
- Result owner:
- Main channel:
- First format:
- Start date:
- Day-7 review date:

## Operating Boundary

- Telegram owner-control is the daily UI.
- Dashboard cockpit is the operator fallback and inspection surface.
- Publication is manual-first: team releases, backend records confirmation.
- Handoff is not a publication result.
- URL/source confirmation is required before result review.
- State changes happen through product commands/buttons, not raw API.
- Demo tenant may be reset; pilot tenant must not be reset without explicit operator action.
- Do not promise leads, sales, revenue attribution, or guaranteed commercial result.

## Launch Checklist

| Gate | Status | Evidence |
| --- | --- | --- |
| Client accepts production-control pilot scope. |  |  |
| Intake captured: ICP, channel, roles, cadence, forbidden claims, result source. |  |  |
| Owner Telegram access confirmed. |  |  |
| Pilot tenant selected and protected from demo reset. |  |  |
| `/pilot` responds in Telegram owner-control. |  |  |
| `/onboarding` starts and shows `Шаг 1/7`. |  |  |
| Advisor answers "что сейчас главное?" without mutation. |  |  |
| Dashboard cockpit opens the same tenant state. |  |  |
| First material topic is chosen. |  |  |

## Day-0 Intake Payload

Fill this with real client answers before or during the Telegram owner-control setup. These seven lines map directly to the `/onboarding` flow.

| Telegram Step | Prompt Meaning | Real Client Answer | Product Evidence |
| --- | --- | --- | --- |
| Step 1/7 - offer | What the client sells and what result their customer should see. |  |  |
| Step 2/7 - client | ICP segment, decision-maker role, main pain. |  |  |
| Step 3/7 - channel | First release channel: Telegram, site, email, VC/Habr, or manual handoff. |  |  |
| Step 4/7 - release owner | Who receives the approved material and confirms release. |  |  |
| Step 5/7 - first signal source | Where result is checked: replies, form, channel, manual owner mark, or other source. |  |  |
| Step 6/7 - approval rules | What must wait for owner decision before release. |  |  |
| Step 7/7 - first material | First topic or task for AgentResult to prepare. |  |  |

Day-0 is not complete until Telegram returns `Настройка зафиксирована` and `AgentResult взял задачу`.

## Product Route

1. Start with Telegram `/onboarding` or dashboard Start Pilot.
2. Inspect intake before launch.
3. Start week-1 pilot workspace.
4. Ask advisor in Telegram: `что сейчас главное?`
5. Approve the first material/topic through product controls.
6. Move QA/release handoff through Telegram or dashboard.
7. Confirm publication only after URL/source exists.
8. Close Day-7 review with one next content step: `expand`, `reuse`, `update`, or `leave`.

## Week-1 Fact Log

| Stage | Product Surface | Expected Fact | Actual Fact | Owner Quote | Friction |
| --- | --- | --- | --- | --- | --- |
| Onboarding | Telegram `/onboarding` / dashboard Start Pilot | Intake completed. |  |  |  |
| First material | Telegram advisor + dashboard board | One material brief ready for owner decision. |  |  |  |
| Approval | Telegram buttons / dashboard decisions | Owner approves or requests changes. |  |  |  |
| QA | Dashboard board / Telegram status | QA passed or changes requested. |  |  |  |
| Handoff | Telegram/dashboard action | Team receives release-ready material. |  |  |  |
| URL confirmation | Telegram/dashboard publication result | URL/source confirmed. |  |  |  |
| Day-7 review | Telegram `/day7 ...` / dashboard Results | Next content step chosen. |  |  |  |

## Friction Register

Use one row per real friction point. Capture small issues; the first pilot is for learning where the product still makes the operator think too much.

| ID | Stage | Severity | Signal | Root Cause Guess | Workaround Used | Product Follow-Up |
| --- | --- | --- | --- | --- | --- | --- |
| F-001 | Onboarding |  |  |  |  |  |
| F-002 | First material |  |  |  |  |  |
| F-003 | Approval |  |  |  |  |  |
| F-004 | Handoff |  |  |  |  |  |
| F-005 | URL confirmation |  |  |  |  |  |
| F-006 | Day-7 review |  |  |  |  |  |

Severity:

- `P0`: blocks the paid pilot or risks wrong tenant/state exposure.
- `P1`: blocks the week-1 loop without operator workaround.
- `P2`: slows operator/owner but loop can continue.
- `P3`: polish or wording issue.

## Daily Operator Notes

### Day 0 - Intake And Launch

- What was collected:
- What was missing:
- Which surface was used:
- Owner confidence:
- Product friction:

### Day 1 - First Material Decision

- Topic/brief:
- Owner decision:
- Advisor question asked:
- Product friction:

### Day 2/3 - Draft And QA

- Draft status:
- QA result:
- Risky claims found:
- Product friction:

### Day 4/5 - Handoff And URL Confirmation

- Handoff owner:
- Publication source:
- URL/source:
- First reactions:
- Product friction:

### Day 7 - Review

- Next content step: `expand / reuse / update / leave`
- Reason:
- Week-2 scope created:
- Owner decision:
- Product friction:

## Close Week-1

Week 1 is closed only when all of these are true:

- first material has a final state: published, handed off with blocker, or stopped with reason;
- URL/source or honest no-URL blocker is recorded;
- next content step is chosen in product state;
- week-2 scope/proposal exists or stop decision is explicit;
- friction register has product follow-ups for the top issues.

## First Product Follow-Up Decision

After Day-7 review, pick exactly one engineering follow-up before expanding scope:

- fix onboarding friction;
- fix first material approval friction;
- fix QA/release handoff friction;
- fix URL confirmation friction;
- fix Day-7 review friction;
- continue if no P0/P1/P2 friction appeared.
