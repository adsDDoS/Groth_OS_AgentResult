# Paid Pilot Week-1 Live Run

Access: `operator-only`

Use this as the live operating log for the first paid Telegram-first private pilot. The goal is to run the real week-1 loop through Telegram owner-control and dashboard cockpit, while capturing the friction that only appears under client pressure.

This document does not replace the product state. Product actions happen in Telegram owner-control and the dashboard. This log records facts, quotes, blockers, workarounds, and product follow-ups.

## Pilot Identity

- Client: first paid pilot, B2B multi-agent lead attraction system.
- Tenant: `10000000-0000-4000-8000-000000000001`.
- Owner Telegram: live `/onboarding` completed through owner-control.
- Operator: AgentResult operator.
- Approval owner: owner.
- QA/release owner: owner.
- Result owner: AgentResult owner-control + owner dashboard confirmation.
- Main channel: Telegram first; MAX and vc.ru are secondary/manual channels after week-1 control is working.
- First format: Telegram post, low-English wording.
- Start date: 2026-06-23 intake captured; live `/onboarding` completed.
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
| Client accepts production-control pilot scope. | captured | Owner wants a production system, not only button messages. |
| Intake captured: ICP, channel, roles, cadence, forbidden claims, result source. | captured | See Day-0 Intake Payload below. |
| Owner Telegram access confirmed. | done | Live owner-control messages delivered to Telegram; `/onboarding` prompt `messageId: 298`, answer messages `299-305`. |
| Pilot tenant selected and protected from demo reset. | ready | Pilot tenant `10000000-0000-4000-8000-000000000001`; do not reset without explicit operator action. |
| `/pilot` responds in Telegram owner-control. | ready | Production smoke passed with Telegram `messageId: 231`. |
| `/onboarding` starts and shows `Шаг 1/7`. | done | Telegram owner-control returned setup prompts and completed with `Настройка зафиксирована` + `AgentResult взял задачу`. |
| Advisor answers "что сейчас главное?" without mutation. | ready | Day-0 preflight passed. |
| Dashboard cockpit opens the same tenant state. | ready | Production dashboard/smoke baseline green. |
| First material topic is chosen. | captured | Topic below; generate with minimum English words. |

## Day-0 Intake Payload

Fill this with real client answers before or during the Telegram owner-control setup. These seven lines map directly to the `/onboarding` flow.

| Telegram Step | Prompt Meaning | Real Client Answer | Product Evidence |
| --- | --- | --- | --- |
| Step 1/7 - offer | What the client sells and what result their customer should see. | B2B multi-agent system for attracting leads. | User supplied on 2026-06-23. |
| Step 2/7 - client | ICP segment, decision-maker role, main pain. | B2B IT companies and construction materials suppliers. | User supplied on 2026-06-23. |
| Step 3/7 - channel | First release channel: Telegram, site, email, VC/Habr, or manual handoff. | Telegram first; MAX and vc.ru are important next/manual channels. | User supplied on 2026-06-23; scoped to Telegram-first week 1. |
| Step 4/7 - release owner | Who receives the approved material and confirms release. | Owner. | User supplied on 2026-06-23. |
| Step 5/7 - first signal source | Where result is checked: replies, form, channel, manual owner mark, or other source. | Hermes agent sends publication links to Telegram direct messages for owner check; dashboard should show a clear `done` / completed state. | User supplied on 2026-06-23; watch as product friction if links/status are unclear. |
| Step 6/7 - approval rules | What must wait for owner decision before release. | Owner approves the post text before release; keep wording production-ready, clear, and low-English. | User supplied on 2026-06-23; normalized into approval rule. |
| Step 7/7 - first material | First topic or task for AgentResult to prepare. | Telegram post about a B2B multi-agent lead attraction system, written with minimum English words and no guaranteed lead/sales promises. | User supplied on 2026-06-23; normalized to product boundary. |

Day-0 onboarding completed on 2026-06-23. Telegram returned `Настройка зафиксирована` and `AgentResult взял задачу`; backend created Hermes task `837c48d7-c88b-41ed-95ef-59d9acaa37de`.

## Telegram Onboarding Script

Paste these messages one by one into Telegram owner-control after `/onboarding`.

```text
B2B мультиагентная система привлечения лидов. Клиент должен увидеть, как система помогает регулярно находить и вести целевые B2B-диалоги без обещаний гарантированных продаж.
```

```text
B2B IT-компании и поставщики строительных материалов. ЛПР: владелец или руководитель продаж. Главная боль: нужно стабильнее получать и обрабатывать целевые обращения.
```

```text
Первый канал — Telegram. MAX и vc.ru важны как следующие или ручные каналы после проверки первого контура.
```

```text
Владелец получает согласованный материал, выпускает или передаёт в выпуск и подтверждает, что материал вышел.
```

```text
Hermes agent должен присылать ссылки на публикации в личку Telegram для проверки владельцем. В dashboard должен быть понятный статус выполнено.
```

```text
Перед выпуском владелец согласует текст поста, спорные обещания, формулировки про результат и любые слишком сильные утверждения. Минимум англицизмов.
```

```text
Подготовить первый Telegram-пост о B2B мультиагентной системе привлечения лидов: простым языком, минимум англицизмов, без обещаний гарантированных лидов или продаж.
```

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
| Onboarding | Telegram `/onboarding` / dashboard Start Pilot | Intake completed. | Live Telegram onboarding completed; messages delivered in owner DM. | "Hermes agent в телеграм должен присылать ссылки для проверки в личку, также должно быть в дашборде где-то грамотно выполнено." | Backend `/telegram/commands/send` delivery was not configured, so operator used backend command + direct Telegram send workaround. |
| First material | Telegram advisor + dashboard board | One material brief ready for owner decision. | Hermes task failed with `fetch failed`; fallback draft created through backend material command: content `2e8ef890-560c-4a09-864f-88a18e699e13`, approval `baf9bd17-d1e7-4d3e-8d2b-88d8369e9d3d`, Telegram notification `messageId: 306`. |  | AgentResult generation/runtime needs production fix; owner approval loop can continue from fallback draft. |
| Approval | Telegram buttons / dashboard decisions | Owner approves or requests changes. |  |  |  |
| QA | Dashboard board / Telegram status | QA passed or changes requested. |  |  |  |
| Handoff | Telegram/dashboard action | Team receives release-ready material. |  |  |  |
| URL confirmation | Telegram/dashboard publication result | URL/source confirmed. |  |  |  |
| Day-7 review | Telegram `/day7 ...` / dashboard Results | Next content step chosen. |  |  |  |

## Friction Register

Use one row per real friction point. Capture small issues; the first pilot is for learning where the product still makes the operator think too much.

| ID | Stage | Severity | Signal | Root Cause Guess | Workaround Used | Product Follow-Up |
| --- | --- | --- | --- | --- | --- | --- |
| F-001 | Onboarding | P2 | Owner expects Telegram direct links and a clear dashboard `done` state. | Result confirmation UX may still be too backend-shaped for a real owner. | Treat URL confirmation as a required live check in week 1. | Verify that Telegram owner-control sends/checks links clearly and dashboard Results/Publication Desk shows completed state without raw terms. |
| F-002 | Onboarding | P1 | Production health/smoke used stateful `/telegram/intent` and accidentally wrote probe text into active onboarding. | Smoke probe was implemented as advisor-like text instead of read-only command. | Cancelled onboarding state, switched probes to `/telegram/commands` with `published_status`. | Keep production smokes away from stateful intent paths unless the scenario owns a disposable tenant. |
| F-003 | First material | P1 | Hermes onboarding first-material task failed with `fetch failed`. | Hermes runtime/API connectivity or dispatch config failed in production owner-control path. | Created controlled fallback material through backend so approval loop can continue. | Fix Hermes dispatch runtime and add production smoke for onboarding first-material generation. |
| F-004 | Onboarding | P2 | Channel answer contained Telegram, MAX, and vc.ru; backend normalized it to `vc`. | `normalizeChannel()` checked `vc` before Telegram. | Local fix changes priority to Telegram first and regression covers Telegram + MAX + vc.ru answer. | Deploy updated owner-control before the next live onboarding. |
| F-005 | Telegram UX | P2 | Owner sees too many `Согласовать` buttons across unrelated messages. | Reused owner-control shortcuts optimized demos/smokes, not live owner chat. | Button noise reduced: onboarding has no buttons; ready list has only `Материал`; decision buttons appear only inside material view. | Continue using buttons only when they apply to the object currently shown. |
| F-006 | Handoff |  |  |  |  |  |
| F-007 | URL confirmation |  |  |  |  |  |
| F-008 | Day-7 review |  |  |  |  |  |

Severity:

- `P0`: blocks the paid pilot or risks wrong tenant/state exposure.
- `P1`: blocks the week-1 loop without operator workaround.
- `P2`: slows operator/owner but loop can continue.
- `P3`: polish or wording issue.

## Daily Operator Notes

### Day 0 - Intake And Launch

- What was collected: offer, ICP, first channel, release owner, result source, approval rule, first material topic.
- What was missing: live owner Telegram `/onboarding` confirmation and actual first material approval.
- Which surface was used: Codex/live-run log for intake capture; Telegram owner-control still pending.
- Owner confidence: wants a production-like system with Telegram links and dashboard `done` state, not only button messages.
- Product friction: MAX/vc.ru requested, but week 1 should stay Telegram-first manual publication until URL confirmation works cleanly.

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
