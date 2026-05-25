# Architecture

AI Growth OS is organized around a backend-controlled, approval-first architecture.

## Components

- Backend: Fastify API for tenants, Offer Brain, Demand Map, content, tasks, approvals, publishing, analytics, and integrations.
- Postgres: source of truth for all company context, content lifecycle, tasks, approvals, publishing records, and analytics.
- Agent runtime: Hermes-compatible workspace or any AI runner that can read tasks and write results through the backend.
- Manual exports: filesystem content packs for customers without publishing APIs.
- Docker Compose: local and VPS deployment with Postgres, backend, optional agent runtime, and Caddy.

## Control Model

Agents do not own publishing. Agents produce intermediate artifacts:
- research
- briefs
- drafts
- answer blocks
- schema suggestions
- lead magnet drafts
- recommendations

Backend owns:
- permissions
- approval state
- audit records
- publishing jobs
- integration calls
- exported content packs

## Data Flow

1. Customer fills Offer Brain.
2. Growth Orchestrator generates Demand Map tasks.
3. SEO/GEO agents generate briefs.
4. Content agents generate drafts from briefs and proof.
5. Publishing QA checks risk flags.
6. Human approves or rejects.
7. Backend schedules, exports, or publishes.
8. Analytics imports create improvement tasks.

## AgentResult Compatibility

The template keeps infrastructure conventional:
- TypeScript backend.
- Postgres.
- Docker Compose.
- OpenRouter provider.
- Hermes-compatible workspace and policy files.
- API-first task handoff.

This makes it straightforward to run beside AgentResult infrastructure while remaining a standalone product.
