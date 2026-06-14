# Dev Agent Contracts

## Task Brief

Use this shape before assigning work:

```md
# Task Brief

## Objective
One concrete outcome.

## User Value
Why this matters to the owner or product.

## Scope
Files, routes, entities, or deploy surfaces in scope.

## Out Of Scope
What must not be changed.

## Acceptance Criteria
- Observable result 1.
- Observable result 2.
- Verification evidence required.

## Risks
- Product risk.
- Technical risk.
- Operational risk.

## Assigned Agents
- Role: narrow task.
```

## Agent Report

Every specialist returns this shape:

```md
# Agent Report

## Role
Agent role name.

## Scope Completed
What was inspected or changed.

## Evidence
- File or command evidence.
- Runtime or browser evidence.

## Findings
- Finding or decision.

## Risks Remaining
- Known gap or none.

## Verification
- Command: result.
- Browser/manual check: result.

## Recommendation
Proceed, revise, rollback, or block.
```

## Acceptance Checklist

Use this before commit or deploy:

```md
# Acceptance Checklist

- [ ] Source repo and branch confirmed.
- [ ] Worktree status reviewed.
- [ ] AGENTS.md and knowledge.md considered.
- [ ] Product state machine impact understood.
- [ ] UI route impact understood.
- [ ] Tests or smoke checks run.
- [ ] Browser verification run when UI changed.
- [ ] Deploy target and rollback path known.
- [ ] Docs/runbook updated when process changed.
- [ ] Next weighted goal written.
```

## Lead Decision Record

Use this at the end of a production-impacting task:

```md
# Lead Decision Record

## Decision
Ship, hold, rollback, or split.

## Evidence
Short list of decisive proof.

## Tradeoff
What risk remains and why it is acceptable.

## Follow-Up
The next weighted goal.
```

