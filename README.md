# AI Growth OS

AI Growth OS is a GitHub template for building an approval-first B2B growth operating system.

It helps a B2B company maintain an Offer Brain, build a Demand Map, create evidence-led SEO/GEO assets, repurpose content for distribution channels, manage proof assets and lead magnets, and publish only after human approval.

This is not a bulk SEO spam generator. The system is designed for useful, proof-aware, structured B2B content operations.

## What Is Included

- TypeScript Fastify backend.
- Postgres source-of-truth schema.
- Approval-gated publishing workflow.
- Agent task runtime abstraction with Hermes-compatible workspace.
- OpenRouter-first model configuration.
- Manual-first content pack export.
- Docker Compose with Postgres, backend, optional Hermes placeholder, and Caddy.
- Templates for company onboarding, SEO briefs, landing pages, social posts, case studies, lead magnets, region pages, comparison pages, and llms.txt.
- Documentation for architecture, API, database, workflows, deployment, GitHub template publishing, and customer onboarding.

## Quick Start

Local AgentResult launch mode:

```bash
npm run local:agentresult
```

Clean demo mode for sales walkthroughs:

```bash
npm run local:agentresult:demo
```

Open:

```text
http://127.0.0.1:4173
```

This starts both services:

- Backend API: `http://127.0.0.1:3000`
- Dashboard: `http://127.0.0.1:4173`

This command uses explicit local storage mode, so it serves a local AgentResult workspace even if Postgres is available on your machine. The workspace includes Offer Brain, demand map, content, approvals, publishing calendar, agents and results counters. Local data is persisted in `apps/backend/.runtime/agentresult.local-data.json`; demo mode backs up that file and starts from the clean AgentResult scenario.

You can still run the two services separately:

```bash
npm run backend:bundle
npm run backend:local
```

In another terminal:

```bash
npm run dashboard
```

Full Postgres mode:

```bash
cp .env.example .env
npm install
npm run db:migrate -w apps/backend
npm run dev
```

Health check:

```bash
curl http://localhost:3000/health
```

Dashboard:

```bash
npm run dashboard
```

Open:

```text
http://localhost:4173
```

The dashboard uses `http://localhost:3000` as the backend API. If the backend is offline, it runs in demo/manual mode and stores company setup drafts in the browser.

Docker:

```bash
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d --build
```

## Default Tenant

For local development, requests default to:

```text
00000000-0000-0000-0000-000000000001
```

You can pass a tenant explicitly:

```bash
curl http://localhost:3000/me -H "x-tenant-id: 00000000-0000-0000-0000-000000000001"
```

## Manual-First Mode

AI Growth OS works even without Telegram, VK, VC.ru, Habr, email, or website publishing APIs.

Generate a manual content pack:

```bash
bash scripts/export-content-pack.sh 2026-05-week-1
```

This creates:

```text
exports/2026-05-week-1/
  seo-pages/
  telegram-posts/
  vc-articles/
  email-newsletter/
  lead-magnet/
  publishing-calendar.csv
```

## Core Rule

Agents can create research, briefs, drafts, recommendations, schema suggestions, answer blocks, and manual export packs.

They cannot publish, update live website content, send newsletters, post to social channels, or approve risky claims. Those actions require backend-tracked human approval.

## Documentation

- [AgentResult OS Knowledge](knowledge.md)
- [Codex Agent Instructions](AGENTS.md)
- [GrothOS Pilot Packet Index](docs/pilot-packet-index.md) - safe entrypoint for pilot docs, access labels, and client-call routing.
- [Product](docs/product.md)
- [Commercial Product Roadmap](docs/commercial-product-roadmap.md)
- [Architecture](docs/architecture.md)
- [API](docs/api.md)
- [Database](docs/database.md)
- [Agent Workflows](docs/agent-workflows.md)
- [Dev Agent System](docs/dev-agent-system.md)
- [Approval Flow](docs/approval-flow.md)
- [Production Readiness Checklist](docs/production-readiness-checklist.md)
- [Pre-Production Milestone](docs/pre-production-milestone.md)
- [SEO/GEO Playbook](docs/seo-geo-playbook.md)
- [Content Policy](docs/content-policy.md)
- [Deployment](docs/deployment.md)
- [GitHub Template](docs/github-template.md)
- [Customer Onboarding](docs/customer-onboarding.md)

## Publishing As A GitHub Template

See [docs/github-template.md](docs/github-template.md).
