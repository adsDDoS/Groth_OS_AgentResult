# AgentResult Growth Control Pilot Demo

Current repeatable web demo contract:

```text
docs/customer-demo-contract.md
```

Цель показа: за 5-7 минут показать собственнику рабочий контур:

```text
готово -> решение -> передано -> вышло -> сигнал
```

Позиционирование в одном предложении:

```text
AgentResult Growth Control помогает собственнику держать выпуск и результат под контролем: AgentResult готовит работу, собственник принимает решение, команда выпускает, система фиксирует статус и сигнал.
```

Не показывать как backend-admin, контентный кабинет или AI-игрушку. Язык показа: решение, передача, выпуск, сигнал, заявки, задачи, контроль.

## Before Demo

1. Сбросить только demo tenant.
2. Открыть dashboard на demo tenant.
3. Проверить, что Telegram/API отвечает на `что готово`.
4. Не использовать основной pilot tenant в resettable demo.

Demo tenant:

```text
10000000-0000-4000-8000-000000000001
```

Main pilot tenant:

```text
00000000-0000-0000-0000-000000000001
```

Dashboard:

```text
http://127.0.0.1:4173/?demo=reset&api=http://127.0.0.1:3000&tenant=10000000-0000-4000-8000-000000000001#/overview
```

## 5-7 Minute Flow

### 1. Сегодня

Say:

```text
Это ежедневный пульт собственника. Здесь видно, что требует решения, что уже вышло и где есть следующий шаг.
```

Show:

- pending decision
- published material
- result signal

Do not explain every card. The point is control, not dashboard training.

### 2. Публикации

Say:

```text
Выпуск разделён на три состояния: ждёт решения, передано вручную, вышло. Передано не считается опубликованным, пока выход не подтверждён.
```

Show:

- `Ждёт решения`
- `Передано вручную`
- `Вышло`
- material card

### 3. Telegram Owner-Control

Say:

```text
Собственнику не нужно помнить команды. Он пишет обычными фразами.
```

Send:

```text
что готово
```

Expected:

```text
Ждёт решения: 1
```

Send:

```text
покажи первый
```

Expected: AgentResult shows the material text.

Send:

```text
согласую
```

Expected:

```text
Решение зафиксировано: согласовано.
```

Send:

```text
передал в выпуск
```

Expected:

```text
Передано в выпуск вручную.
```

Say:

```text
Это важное разделение: материал уже ушёл ответственному, но ещё не считается вышедшим.
```

Send:

```text
вышло
```

Expected:

```text
Выход подтверждён. Материал учтён в результатах.
```

### 4. Результаты

Open `Результаты` or send:

```text
что по результату
```

Expected:

- `Вышло: 2` after full lifecycle
- `Заявки: 3`
- next task

Say:

```text
Результат здесь не про обещание роста. Система фиксирует факты: что вышло, какой сигнал появился и что делать дальше.
```

## Close

Use this closing line:

```text
Первый пилот не про полную автономность. Он про устойчивый контур: готово, решение, выпуск, подтверждение результата. После этого уже можно подключать CRM, источники заявок и более сложные сценарии.
```

## Setup Commands

Local or Docker image after build:

```bash
AI_GROWTH_OS_STORAGE=postgres \
DATABASE_URL=postgres://... \
npm run build

AI_GROWTH_OS_STORAGE=postgres \
DATABASE_URL=postgres://... \
npm run demo:reset-pilot
```

VPS through backend image:

```bash
docker run --rm \
  --network agentresult-os-net \
  --env-file /opt/agentresult-os/app/.env \
  agentresult-os-backend:<sha> \
  node apps/backend/dist/db/reset-pilot-demo.js
```

API smoke:

```bash
curl -s http://127.0.0.1:3000/telegram/intent \
  -H 'content-type: application/json' \
  -H 'x-tenant-id: 10000000-0000-4000-8000-000000000001' \
  -d '{"text":"что готово"}'
```

For live bot demo, configure backend owner-control tenant:

```bash
AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_TENANT_ID=10000000-0000-4000-8000-000000000001
```

## Guardrails

- Do not reset the main pilot tenant.
- Do not use `/demo_reset` in live owner chat unless it points at the demo tenant.
- Do not show `Деньги: 0` in Growth Control.
- Do not say Hermes to the client; owner-facing name is AgentResult.
- Do not promise autopublishing, guaranteed growth, or autonomous public actions.
- Do not present dashboard as the daily working surface; Telegram owner-control is the daily surface, dashboard is setup/source of truth/fallback.
