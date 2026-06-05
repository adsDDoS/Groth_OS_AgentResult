# AgentResult OS Knowledge

This file is the working memory for AgentResult OS. Read it before making product, UX, backend, agent, demo, copy, or documentation changes.

## Product Identity

AgentResult OS is an owner-facing operating system for B2B companies in the Russian market.

It is not an internal engineering admin panel. It is not a generic AI dashboard. It is not a content toy. It is the control layer where a business owner sees what requires a decision, what the system prepared, what is blocking movement, and what business signal appeared after work went outside.

The current product focus is `AgentResult Growth Control`.

AgentResult Growth Control is an AI-system for the owner of a B2B company that turns ideas, materials, tasks, and decisions into regular release and tracked result. It does not promise that AI will grow the business by itself. It solves a narrower and more valuable problem:

```text
AI and the team prepare work,
but materials do not get approved,
tasks hang,
release is irregular,
and the owner does not see what is actually moving.
```

The main product idea:

```text
AgentResult Growth Control is the daily Telegram growth control surface where the owner sees what is ready, what requires a decision, what has been handed off, what went live, and what signal appeared.
```

The canonical loop:

```text
AI prepares -> owner approves -> team releases or hands off -> result is tracked
```

This loop is more important than dashboard breadth, AI autonomy, or extra metrics. Every product decision should strengthen this loop.

The product language is:

- money
- leads
- tasks
- decisions
- control
- result
- publication
- handoff
- CRM discipline
- receivables

Owner-facing names and messages must use `AgentResult`, not `Hermes`. Hermes is an internal runtime/integration term. In Telegram, dashboard labels, approval summaries, and owner-visible status copy, say `AgentResult готовит`, `AgentResult взял задачу`, or `черновик AgentResult`, never `Hermes готовит`.

Money is a valid AgentResult metric only where there is a real monetary source: deal, invoice, receivable, payment promise, CRM event, or qualified request with value. In the content/growth contour, do not show empty money metrics such as `Деньги: 0`.

Avoid product language that sounds like:

- raw backend terminology
- internal pipeline jargon
- AI hype
- tutorial copy for beginners
- long explanations of obvious UI
- "magic automation"
- daily dashboard addiction

## Core Offer

AgentResult builds B2B AI-agent systems for sales, promotion, CRM automation, receivables, and operating processes.

The main implementation format:

- agent system
- backend
- Telegram WebApp
- integrations
- approval-first control loop

Primary products:

- AgentResult Growth Control
- AgentResult Sales OS
- AgentResult Collect / DebtorPilot
- AI Growth OS prototype / legacy naming

Current site:

- https://agentresult-crm.vercel.app/

Future domains:

- agentresult.ru
- app.agentresult.ru
- api.agentresult.ru
- agentresult.online

## Target Customers

Primary users are owners of B2B companies. They should not need to understand backend structure, agent internals, or implementation details to use the product.

Target segments:

- B2B company owners
- agencies
- integrators
- SaaS teams
- service providers
- companies with long sales cycles
- companies with overdue receivables
- companies with weak CRM discipline
- companies with chaotic promotion

## Customer Pains

AgentResult exists because owners face practical operational problems:

- leads get lost
- managers do not maintain CRM
- follow-ups do not happen consistently
- the owner does not see what is happening
- content is chaotic
- the site does not create demand
- receivables hang without systematic follow-up
- the owner manually controls tasks
- the business wants AI but does not know how to implement it safely

## Proof

Use proof that exists or can be shown honestly:

- working AgentResult WebApp prototype
- backend -> Hermes -> Postgres -> Telegram/WebApp architecture
- AI Growth OS prototype
- build-in-public story: AgentResult builds AgentResult on AgentResult

Do not overclaim. If something is only a prototype, call it a prototype. If something works locally, say it works locally.

## Forbidden Claims

Never promise:

- guaranteed revenue growth
- guaranteed receivables recovery
- replacement of the whole sales department
- AI will do everything without errors
- legally significant actions without approval
- automatic publication or email sends without approval
- results without data, implementation, and discipline

## Product Principle

Approval-first is the default.

Agents can research, prepare, draft, classify, recommend, assemble packs, and create tasks.

Agents cannot publish, send, update live website content, approve risky claims, move money-sensitive actions, or act as the owner without explicit approval.

The safest automation is not "AI does everything." The safest automation is a clear control loop:

```text
Hermes prepares -> owner approves -> system publishes or hands off -> result is tracked
```

For Growth Control, the practical status chain is:

```text
prepared -> review -> approved -> handed_off -> published -> signal/task
```

Do not collapse `handed_off` into `published`. A material handed to a channel owner, editor, contractor, or team member is not live until the owner or responsible person confirms publication.

Do not start with full autonomy. Start with control:

- Hermes prepares.
- Backend stores state and opens decisions.
- Owner decides in Telegram or dashboard.
- Team releases or receives the handoff.
- Backend records the result.

## Hermes Integration Principle

Hermes Agent should be treated as the agent runtime and owner-notification worker, not as the system of record.

Backend owns business state, approvals, publishing status, audit, Telegram callbacks, credentials, and result signals. Hermes may research, draft, summarize, schedule reminders, create skills, and propose actions through backend contracts.

Hermes must not directly publish, send emails, update live site content, approve risky claims, mark handoffs as published, or move money-sensitive workflow state outside explicit backend approval rules.

Current Hermes task dispatch contract:

- backend creates the task and remains the system of record;
- `POST /hermes/tasks/:id/dispatch` builds the backend-owned envelope;
- when `HERMES_API_KEY` is configured, backend calls Hermes API Server through `POST /v1/chat/completions`;
- Hermes must return strict JSON with status, artifacts, proposed actions, risk flags, and summary;
- backend validates the result and applies only accepted artifacts;
- a `draft` artifact becomes a `content_item` in `review` and opens owner approval;
- `dryRun: true` prepares the envelope without calling Hermes;
- production Docker should use the internal service URL `http://agentresult-os-hermes:8642` or an equivalent private network URL, not Telegram as the task transport.

Hermes may be connected directly to a Telegram bot as the owner-facing conversational agent only if the gateway responsibility is deliberately switched back to Hermes. In that mode Hermes owns the conversation, but AgentResult backend still owns business actions and state changes. Do not point the same Telegram bot token at both Hermes gateway and backend polling/webhook at the same time.

Current Telegram gateway decision: use backend owner-control polling middleware as the active owner-chat mode. In this Telegram owner-control contour, Hermes is not the chat gateway and should be invoked only by explicit backend workflows for generating or revising materials. It should not own ordinary owner messages in Telegram.

Backend owner-control polling middleware exists behind `AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_POLLING=1`. It reads Telegram updates, checks `TELEGRAM_ALLOWED_USERS` / `HERMES_TELEGRAM_ALLOWED_USERS`, sends ordinary owner text to backend `POST /telegram/intent` logic directly, and sends back only owner-facing text. Keep it disabled while Hermes polling owns the same bot token. To switch to true backend-owned owner control, disable Hermes Telegram polling for that token first, then enable the backend middleware.

Hermes Telegram access should use the native Hermes allowlist variables: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALLOWED_USERS`, and optionally `TELEGRAM_HOME_CHANNEL`. In AgentResult env, keep the secret under `HERMES_TELEGRAM_BOT_TOKEN` and map it to `TELEGRAM_BOT_TOKEN` only inside the Hermes service. `TELEGRAM_ALLOWED_USERS` expects numeric Telegram user IDs, not usernames.

Hermes Telegram must not expose terminal commands, tool logs, raw skill names, stack traces, approval internals, or backend probing to the owner. The owner-facing chat should show only business output: decisions, tasks, material text, release status, result, and concise failure states. If a tool/terminal approval is technically required by Hermes, treat it as an implementation detail to remove from the customer experience.

Hermes gateway display config should keep owner chat quiet: `tool_progress: none`, `tool_preview_length: 0`, `tool_progress_command: false`, `long_running_notifications: false`, `busy_ack_detail: false`, `background_process_notifications: none`, and `interim_assistant_messages: false`. Prompt rules alone are not enough to suppress tool progress messages in Telegram.

Direct Telegram channel publication is not enabled in the current owner-control contour. If the owner asks to publish directly, add the bot as a channel admin, inspect Telegram API access, find channel IDs, or send to a channel, the Telegram gateway must not use terminal/env probing, Telegram send tools, or channel APIs. The correct response is concise: direct channel publishing is not connected in this contour; the material can be saved, approved, handed off for manual release, and then the result can be confirmed.

Future Telegram onboarding should be driven by `/onboarding`: step-by-step setup through the bot, with concise explanation of capabilities, required business context, approval rules, channels, access, and first result loop.

Telegram owner-control must feel like a short business control surface, not a command-line bot. The main status answer should be split into compact blocks:

```text
Ждёт выхода
Ждёт решения
Готовится
```

If a handed-off material and a new approval exist at the same time, keep the priority clear:

```text
Сначала подтвердить выход.
Также готов новый материал.
```

Slash commands may stay as fallback, but natural phrases must work for owner questions such as `что готово`, `покажи новое`, `что ждёт решения`, and `что вышло`. Do not let question-like phrases accidentally execute a state-changing action.

Current Telegram onboarding flow:

- starts with `/onboarding` or natural setup intent;
- asks for offer, client, release channel, approval rules, and first material;
- stores active state in backend, not in the model prompt;
- while onboarding is active, ordinary owner replies fill the current setup step and must not be treated as approval/handoff/result commands;
- writes collected context into the company profile;
- creates a Hermes `content_writer` task for the first material;
- starts a backend background job for Hermes dispatch;
- immediately tells the owner that the task is in work;
- shows active draft preparation in `/brief` / "что дальше" as `AgentResult готовит черновик`;
- receives a `draft` artifact through backend when Hermes finishes;
- saves the Hermes draft as a content item in `review`;
- opens an approval for that material;
- sends the owner a separate Telegram message that the draft is ready for decision;
- returns the owner to the normal Growth Control loop: show material, approve, request changes, hand off, confirm live.

Owner may cancel onboarding with `стоп`, `отмена`, or `остановить настройку`; this stops the setup flow and does not delete AgentResult OS data.

Preferred Telegram command contract:

- `/brief`: show decisions, handoffs, releases, leads, next action; show money only when there is a real monetary signal or a sales/receivables context.
- `/post`: show the material text waiting for approval.
- `/osapprove`: record approval through backend owner-control mode.
- `/changes`: request changes through backend.
- `/handoff`: mark the approved material as manually handed off for release.
- `/published`: confirm that a handed-off material is live.
- `/reset`: restart the Telegram owner-control dialogue without deleting AgentResult OS data.
- `/demo_reset`: reset local demo state explicitly; do not use it for normal owner dialogue.
- `/onboarding`: start setup flow through Telegram.

Backend owner-control middleware should call `POST /telegram/commands` logic for these compatibility commands and return only the backend response text to the owner.

In the content/SEO Telegram contour, do not show `Деньги: 0`. Money is a valid AgentResult OS metric for sales, receivables, and real business signals, but it should not appear as an empty placeholder in a content release loop where there is no measured monetary source.

Owners should not need to remember slash commands. For ordinary owner language such as "что дальше", "покажи пост", "согласую", "нужны правки", "передал в выпуск", "вышло", "что по результату", or "опубликуй напрямую", backend owner-control middleware should call `POST /telegram/intent` logic with the raw owner text and return only owner-facing backend text. The backend intent router maps common phrases to safe commands/actions and keeps risky requests inside the approval-first loop.

Owner-facing Telegram copy should not list slash commands as the primary next step. Commands may remain available internally and as compatibility shortcuts, but the visible language should be natural: "посмотреть материал", "согласовать", "нужны правки", "передал в выпуск", "вышло", "что по результату".

When Telegram asks the owner to confirm publication, phrase it as an owner action, not bot usage. Prefer `Если материал уже опубликован, подтвердите выход.` over `Когда материал вышел, напишите: вышло.`

Telegram brief and "что дальше" should show one compact priority counter, not a full metric strip. If a material is handed off, show `Ждёт подтверждения: N`; if a decision is pending, show `Требует решения: N`; if AgentResult is preparing a draft, show `В подготовке: N`; if nothing is urgent, show `Срочных действий нет`.

The Telegram intent router should understand daily owner-work questions such as "что делать каждый день", "как с тобой работать", "что сейчас важно", "следующий шаг", and "режим взаимодействия". Answer with a concise professional operating rhythm: decisions, materials, handoff, publication confirmation, and result signal.

Approval safety rule: do not treat approval words inside a longer question as approval. Standalone `ок` / `окей` counts as approval, and explicit decision phrases such as `согласую`, `одобряю`, `можно выпускать`, `да, согласую` count as approval. A phrase like `окей, что нам нужно делать каждый день?` must not approve anything.

Questions must not approve materials. A phrase like `можно выпускать?` should be treated as a question or unknown intent, not as approval. The owner must make an explicit decision: `согласую`, `одобряю`, `да, согласую`, or `можно выпускать` without a question.

Hermes Telegram slash commands must also be registered in Hermes `quick_commands`; prompt instructions alone do not make `/brief` or `/post` available in the Telegram gateway. Current VPS runtime maps `/brief`, `/post`, `/changes`, `/onboarding`, `/osbrief`, `/ospost`, and `/osapprove` to a small helper that calls backend `POST /telegram/commands` and prints only `data.text`. Use and show `/osapprove` as the safe approval command because `/approve` can be reserved by Hermes for tool approval flows. Backend may still accept `/approve` internally for non-Hermes callers, but owner-facing Telegram copy should prefer `/osapprove`.

When Hermes drafts a new material in Telegram, it must save the approved draft to backend through `POST /telegram/materials` before asking for release. The endpoint creates a content item, stores the text, opens an approval, and returns owner-facing text with `/post`, `/osapprove`, and `/changes`. Hermes must not offer direct publication or channel delivery for a newly drafted material that is not yet recorded in backend.

When the owner asks for a new material in Telegram, use the backend task loop, not a standalone chat draft. Natural phrases such as `подготовь пост про ...`, `поставь тему в работу ...`, or `/prepare ...` should create a `content_writer` task with `expectedArtifact: draft`, start Hermes dispatch through backend, show the material as `В подготовке`, then save the returned draft as a review content item and open approval.

When `POST /telegram/commands` returns `buttons`, use those backend-provided buttons for Telegram inline controls or command shortcuts. Do not invent button labels or action payloads in Hermes.

`POST /telegram/commands/send` is the backend-owned delivery path for the same command contract. It sends the command text with Telegram inline buttons when backend Telegram delivery is intentionally configured. Use it for controlled backend delivery or dry-runs; do not run backend webhook ownership and Hermes polling against the same bot token unless the gateway responsibility is explicitly switched.

Canonical implementation note:

- detailed spec: `docs/hermes-agent-integration.md`
- preferred loop: backend task -> Hermes run -> structured result -> backend validation -> owner decision -> release/handoff/result

## Growth Control Architecture

AgentResult Growth Control consists of six practical contours.

1. Hermes Agent

Hermes prepares work but does not make final owner decisions. It may propose topics, prepare briefs, draft posts/articles/emails/landing pages/commercial offers, adapt materials for channels, research competitors, summarize sources, help with edits, and suggest the next step. It must not publish, send, promise results, or change critical statuses without backend approval rules.

2. Backend State Agent

Backend is the system of record. It stores company context, tasks, materials, approvals, publishing calendar, manual handoffs, confirmed releases, result signals, audit, and approval-first rules. Backend synchronizes Telegram and dashboard. Without backend state, Hermes becomes only a message stream.

3. Telegram Owner-Control

Telegram is the daily owner control surface. It should show decisions, ready materials, handoffs, publication confirmations, result signals, and next owner actions. It should understand natural owner phrases such as "что сегодня", "покажи материал", "согласую", "нужны правки", "передал в выпуск", "вышло", and "что дальше". Slash commands may exist for compatibility, but they should not be the primary UX.

4. Dashboard

Dashboard is the setup, source-of-truth, demo/private-beta, control, and fallback surface. It should not become the daily place where the owner must work. Its job is to make the system trustworthy, configurable, and inspectable.

5. Release Control

Release Control manages the path from approved material to external release. It separates "approved", "handed off", and "published". It supports manual handoff for Telegram, site/CMS, email, VC/Habr, or a responsible person. It requires confirmation before counting a material as live.

6. Results Loop

Results Loop records what happened after work went outside: published materials, manual handoffs waiting for confirmation, leads, replies, comments, incoming requests, CRM events, tasks created from signals, and the next owner-level action. It must not show fake metrics or empty money counters where no measured source exists.

## Dashboard Role

The dashboard is not the main daily workplace forever. Long-term, Telegram Owner-Control should be the daily surface where the owner makes decisions and checks status.

The dashboard should act as:

- setup surface
- source of truth
- approval/control surface
- result view
- demo/sales surface
- fallback when Telegram is not connected

The owner should not feel forced to live inside the dashboard every day.

If a dashboard section exists only to explain the product, remove or compress it. If a section does not help the owner decide, approve, configure, hand off, or see results, it is suspect.

Dashboard should support Growth Control, not compete with Telegram. It should answer:

- what requires a decision;
- what is ready to go outside;
- what has been handed off;
- what went live;
- what signal appeared;
- what must the owner do next.

Avoid making dashboard the place where the owner must work every day.

## Production Demo Surface

The Vercel dashboard can be used as a static product demo before the production backend is connected.

In that mode:

- do not call or show `localhost` as the service address
- do not imply that the production workspace is connected
- use "демо-контур", "готово к просмотру", "следующий шаг" instead of backend/admin language
- keep the owner loop visible: decision -> handoff/release -> result
- keep service details inside collapsed implementation details

Local development may still default to `http://localhost:3000`.

## Current UX Information Architecture

Keep the RU/ENG switch.

Current main navigation:

- Today / Сегодня
- Strategy / Стратегия
- Company / Компания
- Materials / Материалы
- Publications / Публикации
- Results / Результаты
- Settings / Настройки

Settings tabs:

- Launch readiness / Готовность запуска
- Rules / Правила
- Access / Доступы

The main interface should not drift back into backend-admin language.

## Current Baseline

Dashboard is now the demo/private-beta baseline, not an open-ended UI exploration track.

Current baseline:

- production dashboard: `https://dashboard-orpin-mu-26.vercel.app`
- asset version: `agentresult-working-os-87`
- latest CI gate: `Dashboard smoke #14` passed on commit `1e6a7ee`
- baseline doc: `docs/demo-private-beta-baseline.md`

The dashboard is stable enough to use as a sales/demo and private-beta control surface. Continue fixing clear bugs, broken flows, overflow, confusing copy, or approval-first regressions, but avoid further polishing without a concrete product risk.

Automated dashboard smoke now covers the owner loop plus responsive gates:

- routes: Today / Strategy / Company / Materials / Publications / Results / Settings;
- viewports: 390 / 768 / 1440;
- RU/ENG switch visibility;
- route title presence;
- horizontal overflow.

## Ideal Owner Flow

The product should be understandable through this chain:

```text
1. Today shows what requires the owner's decision.
2. Owner approves or requests changes.
3. Approved material moves to Publications.
4. Publication is published directly or handed off manually.
5. Results show business signals: leads, tasks, published materials, receivables, improvement tasks.
6. Hermes later moves this loop into Telegram so the owner does not need to check the dashboard constantly.
```

Current demo-flow on Today:

```text
Hermes prepared -> Owner approved -> Went outside -> Result appeared
```

This flow is more important than adding more sections.

Strategy should be a decision surface, not a planning workspace. It should show one priority, one main action, and a short queue of next moves. Avoid showing competing CTAs such as separate "task", "material", "speed", "proof" controls unless the owner clearly needs to choose between them.

Company should not feel like a long onboarding questionnaire. Show the minimum launch context first: offer, buyer, pains, proof, forbidden claims, and approval rules. Put competitors, channels, domains, tone, and extra details below or behind a compact advanced block.

## UX Standards

Every screen must answer at least one of these:

- What needs my decision?
- What did the system do?
- What blocks growth or money?
- What is ready to go outside?
- What result appeared?
- What is the next owner-level action?

Prefer:

- short labels
- laconic, professional language
- one clear next action
- compact cards
- business outcome language
- action loops
- visible statuses
- confidence through restraint

Avoid:

- wall-of-text sections
- "how to use this dashboard" hero blocks
- "role of dashboard" explanations
- repeating the same CTA several times
- visible implementation jargon on owner screens
- raw backend words outside technical settings
- fake metrics
- verbose, childish, or tutorial-style copy
- empty-looking SaaS boilerplate
- childish instruction tone

Bad copy examples:

- "Как работать с AgentResult"
- "Роль дашборда"
- "Не живите здесь"
- "Сводка Hermes" if it reads like internal mechanics
- "Backend API" on main owner screens
- "workflow" in Russian owner-facing copy when "процесс", "контур", "путь", or "план" is clearer

Better copy examples:

- "Инструкция"
- "Требует решения"
- "Сделала система"
- "Блокирует"
- "Готово наружу"
- "Опубликовано"
- "Заявки"
- "Следующий шаг собственника"
- "Согласовать"
- "Передать"
- "Отметить выпуск"

## Functional Standard

Do not treat the dashboard as pure visual work.

When adding or changing UI, connect it to real state when feasible:

- tasks from backend
- approvals from backend
- content items from backend
- publishing calendar from backend
- analytics overview from backend
- local mode persistence for demo/fallback

Use localStorage only as fallback or for local-only workspace state. Avoid adding new localStorage-only product-critical actions if a backend path already exists or can reasonably be added.

## Local Development

Project path:

```text
/Applications/Работа/Учеба/Codex/ai-growth-os
```

Run local AgentResult mode:

```bash
npm run local:agentresult
```

Run clean sales/demo mode:

```bash
npm run local:agentresult:demo
```

Dashboard:

```text
http://127.0.0.1:4173
```

Backend:

```text
http://127.0.0.1:3000
```

Clean browser state for demo:

```text
http://127.0.0.1:4173/?demo=reset#/overview
```

Persisted local backend file:

```text
apps/backend/.runtime/agentresult.local-data.json
```

## Key Files

Dashboard:

- apps/dashboard/index.html
- apps/dashboard/app.js
- apps/dashboard/styles.css

Backend:

- apps/backend/src/db/memory.ts
- apps/backend/src/routes.ts
- apps/backend/src/modules/content/routes.ts
- apps/backend/src/modules/publishing/routes.ts
- apps/backend/src/modules/common/repository.ts
- apps/backend/src/db/migrations

Local run:

- scripts/local-agentresult.mjs
- package.json

Docs:

- README.md
- knowledge.md

## Current Backend Capabilities

Local mode supports:

- company profile
- demand map
- content items
- approvals
- publishing calendar
- tasks
- analytics overview
- activity/workspace state
- calendar status PATCH through `/publishing/items/:id/status`

Important local script:

```bash
npm run local:agentresult:demo
```

This resets the local demo scenario and backs up previous runtime data.

## Current Demo State

The clean demo should start with:

- one pending approval
- one already published material/result
- one scheduled material
- three visible leads
- two tasks
- one improvement task

The pending approval must not be linked to the already published item. Otherwise the story becomes incoherent after approval.

Expected sales story:

```text
Today: owner sees a pending Telegram post.
Owner approves.
Publications: material is now ready to publish or hand off.
Results: owner sees published materials and leads.
Hermes later moves this decision loop into Telegram.
```

## Hermes Direction

Hermes should eventually become the primary owner interaction layer.

Target Hermes behavior:

- sends owner a concise Telegram summary
- asks for approval on posts, emails, CRM-sensitive actions, and receivables follow-ups
- sends ready-to-publish materials
- writes approved events into CRM or other systems
- reports results back to owner
- keeps dashboard as source of truth and setup/control surface

Do not use Hermes as an excuse to make the dashboard sloppy. The dashboard still needs to be coherent, because it is the demo surface, setup layer, and trust anchor.

First backend contract for Hermes / Telegram control:

```text
GET /telegram/owner-brief
```

This endpoint prepares the owner-control state for Hermes and the future Telegram control surface. It does not send Telegram messages, publish materials, or bypass approval. It returns decisions, manual handoffs waiting for confirmation, confirmed outputs, result counters, and the next owner action.

## Product Decision Rules

When choosing what to build next, prefer changes that:

- shorten path to visible result
- reduce owner cognitive load
- make demo more sellable
- connect UI to backend state
- make approval loop clearer
- remove unnecessary text
- replace internal terms with business terms
- preserve RU/ENG

Deprioritize changes that:

- add another dashboard section
- add another explanatory block
- create local-only actions without persistence
- make the product feel like an admin panel
- make the owner manage agents manually
- optimize for engineering completeness over sales clarity

## Verification Rules

After dashboard JS changes, always run:

```bash
node --check apps/dashboard/app.js
```

When changing local script:

```bash
node --check scripts/local-agentresult.mjs
```

When feasible:

```bash
npm run lint
npm run build
```

For UI work, verify in browser:

```text
http://127.0.0.1:4173/?demo=reset#/overview
```

Check:

- no console errors
- RU/ENG switch still works
- no old tutorial/admin phrases returned
- first screen is understandable in under 10 seconds
- demo-flow still works
- metrics are coherent with the shown state

## Known Risk Areas

Watch for:

- dashboard text overload
- duplicated CTAs
- English strings leaking in RU mode
- backend seed state conflicting with UI story
- localStorage masking backend bugs
- old AI Growth OS template language returning to AgentResult shell
- settings/tools becoming the product instead of support surface
- "daily dashboard" behavior replacing Telegram/Hermes owner loop

## Next Logical Product Step

The next high-value step is to reduce density below the first Today screen.

Current issue:

```text
Demo-flow is clear, but below it Today still has too many parallel panels:
Требует решения / Блокирует / Сделала система / result strip.
```

Recommended direction:

```text
Keep one main owner-loop.
Compress secondary panels into a small "details if needed" area.
Make Today feel like a command surface, not an operations report.
```

After that, build the Telegram/Hermes owner approval simulation:

```text
Hermes message -> owner approves -> backend updates approval -> publication status changes -> Results update.
```

## Non-Negotiables

- Do not rewrite the dashboard from scratch.
- Do not break RU/ENG.
- Do not bring back backend-admin language.
- Do not add text just because the product needs explanation.
- Do not promise magic.
- Do not bypass approval-first.
- Do not let demo data contradict the story.
- Always propose the next logical step after making changes.
