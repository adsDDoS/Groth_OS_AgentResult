# Commercial Product Roadmap

This roadmap turns AI Growth OS from a local AgentResult alpha into a commercial B2B Growth OS product.

## Current Product Stage

AI Growth OS is currently a working single-company alpha:

- Owner-facing dashboard and workflow IA are in place.
- AgentResult local workspace can run without Postgres.
- Company, growth plan, publications, approvals, tools, and results are visible in one product surface.
- Local fallback data is available for development and customer demos.

It is not yet a production SaaS. The remaining work is mainly durability, onboarding, integrations, trust, and deployment.

## Phase 1: Local AgentResult Product

Goal: make the product useful for AgentResult's own growth work before selling it externally.

Must be true:

- One command starts backend and dashboard.
- Local data survives restarts.
- AgentResult company profile, products, ICP, proof, objections, tools, and content queue are filled with real data.
- Owner can review, approve, reject, and schedule materials from the dashboard.
- Manual export can produce a weekly growth pack.

Commercial value:

- The system becomes its own first case study.
- Product decisions are based on daily use, not hypothetical workflows.

## Phase 2: Founder-Led Private Beta

Goal: support 2-5 companies manually with high trust and low automation risk.

Must be true:

- Onboarding creates a company workspace from a structured intake.
- Every public action has human approval.
- Tools screen captures what the client already uses and what can be connected next.
- Proof Engine distinguishes internal proof, client-approved proof, and public proof.
- Support operator can fix data and unblock workflows without touching code.

Commercial value:

- Sell as a managed Growth OS implementation, not yet as self-serve SaaS.

## Phase 3: Reliable Multi-Company Product

Goal: make the system safe for multiple paying customers.

Must be true:

- Postgres is the primary data store in production.
- Auth, roles, tenant isolation, audit logs, and backup/restore are reliable.
- Each integration has clear permissions: read only, prepare, request approval, publish after approval.
- Failed jobs are visible and recoverable.
- Billing and plan limits are enforceable.

Commercial value:

- Product can be sold repeatedly without bespoke engineering for every customer.

## Phase 4: Integration-Led Growth OS

Goal: connect the product to real customer workflows.

Initial integration order:

1. Website / CMS or static export.
2. Telegram.
3. Email.
4. Analytics import.
5. CRM.
6. Webhooks.

Must be true:

- Integrations are opt-in and permission-scoped.
- Publishing is approval-first by default.
- Manual export remains available when an API is unavailable.
- Client can see who owns access and what the system is allowed to do.

Commercial value:

- The product becomes a practical operating layer, not just a planning dashboard.

## Phase 5: Scale And Trust

Goal: make the product credible for larger B2B teams.

Must be true:

- Test coverage protects approvals, publishing, tenant isolation, and integration permissions.
- Deployment is documented and repeatable.
- Monitoring shows API health, queue health, failed jobs, and stale workflows.
- Security posture is documented for buyers.
- Product analytics show activation, content throughput, approvals, and results loop usage.

Commercial value:

- The system becomes sellable beyond founder-led implementations.

## Near-Term Priorities

The next product work should stay narrow:

1. Stabilize local AgentResult launch.
2. Make local AgentResult data durable.
3. Fill the workspace with real AgentResult offer and tools data.
4. Make the Company and Tools screens editable end-to-end.
5. Make approvals and manual content pack export reliable.
6. Add one real channel connection.
