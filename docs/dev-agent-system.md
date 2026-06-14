# Dev Agent System

Dev Agent System is the internal engineering operating model for building AgentResult OS with Codex-assisted agents.

It exists to make production changes repeatable:

```text
investigate -> implement -> verify -> deploy -> document
```

The system is lead-controlled. Specialist agents can research, implement, test, or document a narrow scope, but the Lead Product Engineer owns the final decision, integration, deployment gate, and next weighted goal.

## Files

- [Roles](dev-agent-system/roles.md)
- [Contracts](dev-agent-system/contracts.md)
- [Production Fix Playbook](dev-agent-system/workflows/production-fix.md)

## Operating Rules

- Read `knowledge.md` and `AGENTS.md` before product or code changes.
- Keep owner-facing product language aligned with AgentResult, not raw backend or agent internals.
- Use parallel investigation only when scopes are independent.
- Every agent report must include evidence, risks, and verification status.
- No sub-agent owns production deploy alone.
- No state-changing action is accepted without a clear verification path.
- A task is not complete until the Lead verifies the acceptance criteria.

## Default Agent Loop

1. Lead Product Engineer writes the task brief.
2. Repo Archaeologist maps the source of truth and risk surface.
3. Domain/Backend and Frontend/Product agents work only inside their assigned boundaries.
4. QA/Smoke agent validates behavior and regression risk.
5. DevOps/Deploy agent checks environment, deploy path, rollback, and production aliases.
6. Docs/Runbook agent captures the durable operating note.
7. Lead integrates the evidence, decides whether to ship, and proposes the next weighted goal.

## Minimum Acceptance Gate

A production change must have:

- source-of-truth repo identified;
- affected files listed;
- acceptance criteria written before implementation;
- focused verification run;
- deploy or rollback path known;
- final state checked in Git;
- next weighted goal proposed.

