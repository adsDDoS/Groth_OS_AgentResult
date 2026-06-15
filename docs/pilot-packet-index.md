# GrothOS Pilot Packet Index

Главный вход в pilot packet. Использовать, когда нужно быстро понять порядок документов без знания имён файлов.

## Access Labels

- `client-facing`: можно показывать или переносить в клиентский документ после заполнения конкретными данными.
- `operator-only`: рабочий документ оператора/продаж; не открывать клиенту на screen-share.
- `internal-only`: инженерный, rehearsal, archive или security-sensitive материал; не показывать клиенту.

## Operating Route

| Step | Access | Use | Document |
| --- | --- | --- | --- |
| 0 | `client-facing` | Send one clean pilot packet after qualification. | [GrothOS Pilot Kit v1](client-facing-pilot-kit-v1.md) |
| 0a | `client-facing` | Send export-ready DOCX/PDF artifacts. | [GrothOS Client-Facing Pilot Kit Exports](client-facing/README.md) |
| 1 | `operator-only` | Decide who is qualified for pilot. | [Pilot Qualification Note](pilot-qualification-note.md) |
| 2 | `client-facing` | Collect channel, roles, cadence, format, claims, result source. | [Pilot Onboarding Intake](pilot-onboarding-intake.md) |
| 3 | `operator-only` | Run first week: setup, topics, draft, QA, release, confirmation, review. | [Pilot Week-1 Execution Board](pilot-week-1-execution-board.md) |
| 4 | `client-facing` | Close week 1 into next content step and week 2 decision. | [Pilot Day 7 Review Template](pilot-day-7-review-template.md) |
| 5 | `operator-only` | Run week 2 without scope creep. | [Pilot Week-2 Expansion Board](pilot-week-2-expansion-board.md) |
| 6 | `operator-only` | Keep the full route and gates in one place. | [Pilot Operating Manual](pilot-operating-manual.md) |
| 7 | `client-facing` | Turn pilot outcome into continue / narrow / repair / stop. | [Pilot Closeout Report Template](pilot-closeout-report-template.md) |
| 8 | `operator-only` | Convert closeout decision into an offer. | [Pilot Pricing / Offer One-Pager](pilot-pricing-offer-one-pager.md) |
| 9 | `operator-only` | Send the correct follow-up message. | [Pilot Sales Follow-Up Templates](pilot-sales-follow-up-templates.md) |

## Execution Examples

| Access | Use | Document |
| --- | --- | --- |
| `operator-only` | First ICP segment, filled intake, and concrete week-1 board for a founder-led B2B content pilot. | [First ICP Pilot Execution Example](pilot-first-icp-execution-example.md) |

## Demo And Call Support

| Access | Use | Document |
| --- | --- | --- |
| `internal-only` | Pre-call checklist with commands, security notes, and smoke gates. | [Pilot Demo Checklist](pilot-demo-checklist.md) |
| `operator-only` | Final 7-minute `?demo=client` opening, route, closing, and follow-up for the first call. | [Client Demo Call Dry Run v3](client-demo-call-dry-run-v3.md) |
| `operator-only` | Current `?demo=client` route, three screens, five phrases, and stop-list for the first client-safe dashboard showing. | [Client Demo Route Script](client-demo-route-script.md) |
| `internal-only` | Latest production rehearsal notes, fixed friction, and remaining first-call risks for `?demo=client`. | [Client Demo Rehearsal](client-demo-rehearsal.md) |
| `operator-only` | Seven-minute client script. | [Pilot Demo Script](pilot-demo-script.md) |
| `operator-only` | Call opening, transitions, closing and follow-up. | [Pilot Call Packet](pilot-call-packet.md) |
| `operator-only` | Operator one-page card for the call. | [Demo Operator Card](demo-operator-card.md) |
| `internal-only` | Pre-call rehearsal result and remaining friction. | [Pilot Readiness Rehearsal](pilot-readiness-rehearsal.md) |

## Internal Archive

These files are historical or engineering context. Do not use them as the current pilot script, and do not open them during a client call.

| Access | Use | Document |
| --- | --- | --- |
| `internal-only` | Historical AgentResult demo-to-pilot flow with older sales/CRM language. | [Demo To Pilot Onboarding](demo-to-pilot-onboarding.md) |
| `internal-only` | Older demo safety contract and reset/API details. | [Customer Demo Contract](customer-demo-contract.md) |
| `internal-only` | Private beta baseline and engineering release context. | [Demo Private Beta Baseline](demo-private-beta-baseline.md) |
| `internal-only` | Earlier pre-call dry run record; superseded by the current rehearsal/checklist route. | [GrothOS Pre-Call Dry Run](pre-call-dry-run.md) |

## Rule

If unsure where to start, use:

```text
docs/pilot-operating-manual.md
```

If preparing a client call, use:

```text
docs/client-demo-route-script.md
```

If screen-sharing documents with a client, use only `client-facing` documents or the live dashboard. Keep `operator-only` and `internal-only` documents off-screen.

If sending a document to a client, send `docs/client-facing-pilot-kit-v1.md` instead of separate internal repo links.

For an attachment, use the files listed in `docs/client-facing/README.md`.
