# AgentResult Growth Control Pilot Demo

Цель показа: за 5-7 минут показать собственнику рабочий контур:

```text
готово -> решение -> передано -> вышло -> сигнал
```

Показывать как owner-control продукт, не как backend-admin. Язык: решение, передача, выпуск, сигнал, заявки, задачи, контроль.

## Demo Reset

Demo reset работает только с отдельным demo tenant:

```text
10000000-0000-4000-8000-000000000001
```

Он не трогает основной pilot tenant:

```text
00000000-0000-0000-0000-000000000001
```

Локально или в Docker image после build:

```bash
AI_GROWTH_OS_STORAGE=postgres \
DATABASE_URL=postgres://... \
npm run build

AI_GROWTH_OS_STORAGE=postgres \
DATABASE_URL=postgres://... \
npm run demo:reset-pilot
```

На VPS через backend image:

```bash
docker run --rm \
  --network agentresult-os-net \
  --env-file /opt/agentresult-os/app/.env \
  agentresult-os-backend:<sha> \
  node apps/backend/dist/db/reset-pilot-demo.js
```

## Dashboard Link

Use the same tenant as the seed:

```text
http://127.0.0.1:4173/?demo=reset&tenant=10000000-0000-4000-8000-000000000001#/overview
```

If the backend is not on local `:3000`, pass it explicitly:

```text
http://127.0.0.1:4173/?demo=reset&api=http://127.0.0.1:3000&tenant=10000000-0000-4000-8000-000000000001#/overview
```

## Telegram Demo

For API smoke, pass the same tenant header:

```bash
curl -s http://127.0.0.1:3000/telegram/intent \
  -H 'content-type: application/json' \
  -H 'x-tenant-id: 10000000-0000-4000-8000-000000000001' \
  -d '{"text":"что готово"}'
```

For live bot demo, configure the backend owner-control tenant before the demo:

```bash
AI_GROWTH_OS_TELEGRAM_OWNER_CONTROL_TENANT_ID=10000000-0000-4000-8000-000000000001
```

Do not point the live bot at the main pilot tenant during a resettable client demo.

## 5-7 Minute Script

1. Open `Сегодня`.
   Say: “Это ежедневный пульт. Собственник видит, что требует решения и что уже вышло.”

2. Open `Публикации`.
   Show the strip:
   - `Ждёт решения`
   - `Передано вручную`
   - `Вышло`

3. In Telegram/API say:

```text
что готово
```

Expected: one material waits for decision.

4. Say:

```text
покажи первый
```

Expected: the post text appears. No commands are required.

5. Say:

```text
согласую
```

Expected: decision is fixed.

6. Say:

```text
передал в выпуск
```

Expected: status becomes manual handoff. The material is not counted as live yet.

7. Say:

```text
вышло
```

Expected: publication is confirmed.

8. Open `Результаты` or say:

```text
что по результату
```

Expected: owner sees published work, recorded leads, and next tasks.

## Demo Guardrails

- Do not use `/demo_reset` in the live owner chat unless it is pointed at the demo tenant.
- Do not reset the main pilot tenant.
- Do not show `Деньги: 0` in Growth Control.
- Do not say Hermes to the client; owner-facing name is AgentResult.
- Do not promise autopublishing or guaranteed growth.
