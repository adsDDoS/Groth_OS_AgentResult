# GrothOS First ICP Pilot Execution Example

Access: `operator-only`

Использовать как первый заполненный пример после client-demo call. Это не клиентский договор и не обещание результата; это стартовый execution packet для пилота на 7 дней.

## Chosen ICP Segment

Founder-led B2B service or expert team that sells complex work through trust content:

- AI automation studio;
- B2B consulting/service agency;
- niche SaaS implementation partner;
- expert-led operational advisory.

Why this segment first:

- У них есть экспертное знание, но оно застревает в голосовых, заметках и чатах.
- Founder/owner может быстро согласовать topic boundary.
- Первый канал обычно уже понятен: Telegram, vc.ru, Habr, site blog, newsletter.
- Week 1 можно измерить без CRM: topic approved, draft produced, QA passed, URL published, primary reactions captured, next content step selected.
- Они не обязаны верить в "лиды от статьи"; им достаточно увидеть controlled production loop.

## Qualification Decision

Decision: `go to pilot`.

Assumed qualified client:

- Publishes 2-4 text materials per month or wants weekly cadence now.
- Has one owner who can approve topics within 24 hours.
- Has one operator/editor/manager who can handle QA and release.
- Accepts that week 1 measures production control, not sales attribution.
- Can choose one channel and one format for the first week.

Do not run this pilot if the client starts with:

- "Сколько лидов даст пост?"
- "Нам нужно без согласований, пусть AI сам публикует."
- "Давайте сначала подключим CRM, аналитику, сайт, рекламу и Telegram."

## Filled Pilot Onboarding Intake

### 1. Каналы

- Основной канал первой недели: Telegram founder channel.
- Второй канал, если нужен: none for week 1.
- Кто имеет доступ к публикации: QA/release owner posts manually from Telegram account.
- Что остаётся ручной передачей: final text handoff and actual channel publishing.

### 2. Роли

- Approval owner: founder / managing partner.
- QA/release owner: content operator or chief of staff.
- Result owner: same QA/release owner confirms URL and reactions.
- Escalation owner: founder for risky claims, client names, numbers, competitor mentions.

### 3. Weekly Cadence

- День выбора тем: Day 1, before 12:00.
- День черновика: Day 2, before 18:00.
- День QA: Day 3, before 16:00.
- День выпуска: Day 4, before 12:00.
- День проверки результата: Day 5, first check after 24 hours.
- Максимальное время ожидания решения собственника: 24 hours.

### 4. Формат Материалов

- Первый формат: Telegram post.
- Объём: 1,800-2,800 characters.
- Тон: practical founder voice; no hype; concrete operational lesson.
- Кто утверждает voice fit: founder.
- Пример хорошего материала: short post with one operational pain, one example, one practical conclusion.
- Пример плохого материала: generic AI-generated thread with buzzwords, promises, and no concrete case.

### 5. Forbidden Claims

- Что нельзя обещать: guaranteed leads, guaranteed revenue, guaranteed cost reduction.
- Какие темы не трогать: confidential client operations, private financials, unapproved client cases.
- Каких клиентов/конкурентов не упоминать: named clients, competitors, or partner brands without approval.
- Какие цифры нельзя использовать без доказательств: revenue, ROI, conversion, cost saving, time saving, team size, client count.
- Какие формулировки всегда требуют owner approval: "мы гарантируем", "увеличили выручку", "заменяем отдел", "автоматически продаёт".

### 6. Result Source

- Где появится URL публикации: Telegram post URL.
- Кто отправляет URL в GrothOS: result owner.
- Какие первичные реакции фиксируем: comments, reposts, saves, reactions, owner mark.
- Когда проверяем первый результат: 24 hours after publication.
- Что считается useful next content step: `expand` if the topic gets comments/saves; `reuse` if it is a strong evergreen angle; `update` only if factual correction is needed; `leave` if no signal.

## Concrete Week-1 Board

| День | Фокус | Владелец | Действие | Выход | Gate |
| --- | --- | --- | --- | --- | --- |
| Day 0 | Setup | Operator + founder | Fill intake, confirm Telegram as only channel, assign owner/operator/result roles. | Pilot context ready. | One channel, one format, three owners assigned. |
| Day 1 | Topics | Founder | Choose 3 candidate topics and approve one boundary: "How content production gets lost between idea and publication." | Approved topic boundary. | No revenue/lead promise; no client names. |
| Day 2 | Draft | Operator/editor | Prepare Telegram post draft in founder voice, 1,800-2,800 chars. | Draft ready for QA. | Practical lesson, one example, no forbidden claims. |
| Day 3 | QA | QA/release owner | Check facts, voice, risky claims, channel format, owner boundary. | QA passed or changes requested. | 5/5 QA checklist or explicit changes. |
| Day 4 | Release | QA/release owner | Hand off final text and publish manually in Telegram. | Release handoff and/or live post. | Handoff is not result; URL still required. |
| Day 5 | Confirmation | Result owner | Add Telegram URL, format, comments, reposts, saves, reactions. | Publication result recorded. | URL attached or blocker documented. |
| Day 7 | Review | Founder + operator | Decide next content step and week-2 scope. | `expand / reuse / update / leave` + week-2 decision. | No new channel unless loop is clean. |

## First Material Brief

Title:

```text
Как не терять выпуск контента между идеей и публикацией
```

Angle:

```text
Большинство команд проигрывают не потому, что не могут написать текст, а потому что тема, черновик, QA, выпуск и результат живут в разных чатах.
```

Required structure:

1. Open with the operational pain.
2. Show the broken flow: idea -> chat -> draft -> silence -> missed publication -> no result.
3. Show the controlled flow: topic boundary -> draft -> QA -> release -> URL -> next step.
4. End with a practical conclusion, not a sales CTA.

Forbidden in this material:

- "AI writes everything by itself";
- "guaranteed leads";
- fake metrics;
- named clients without approval.

## Day-7 Review Starter

Use `docs/pilot-day-7-review-template.md`.

Pre-fill the first review with:

- What went out: Telegram post on content production control.
- Where published: Telegram URL.
- Primary reactions: comments, reposts, saves, reactions after 24 hours.
- Blockers to inspect: owner response time, QA rework, manual publishing delay, URL confirmation delay.
- Default next content step: `expand` into a larger article if comments/saves appear; otherwise `reuse` the strongest paragraph as a second post.

## Operator Rule

If the client wants to add a second channel before Day 7, say:

```text
Давайте сначала докажем один чистый loop: тема, текст, QA, выпуск, URL и следующий шаг. После Day 7 решим, расширять канал или повторить тот же контур.
```

## Ready-To-Run Checklist

- [ ] Founder accepts production-control metric.
- [ ] Telegram selected as the only week-1 channel.
- [ ] Approval owner named.
- [ ] QA/release owner named.
- [ ] Result owner named.
- [ ] Forbidden claims reviewed.
- [ ] First topic boundary approved.
- [ ] Day 7 review time scheduled.
