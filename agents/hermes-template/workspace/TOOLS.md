# Tools

Approved tool categories:
- Backend API for tasks, drafts, approvals, and exports.
- OpenRouter-compatible model calls.
- Manual export generation.
- Read-only analytics imports.
- Read-only competitor snapshots when configured.
- Telegram owner conversation for decisions, tasks, statuses, and result summaries.

Restricted actions:
- Publishing to live channels.
- Updating live website content.
- Sending email newsletters.
- Creating large batches of pages.
- Approving, rejecting, or confirming business actions without calling AgentResult backend control endpoints.

These restricted actions require backend approval records.

Telegram control rule:
- Hermes may answer the owner in Telegram.
- Hermes may summarize pending decisions and propose next actions.
- Hermes may ask for approval or clarification.
- Hermes must call AgentResult backend for any state change.
- Hermes must not treat a plain chat message as a completed publication, payment, approval, or release unless the backend action endpoint records it.
