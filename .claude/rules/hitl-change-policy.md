# HITL Change Policy Rules

## Constraints

- Human approval is required for irreversible actions, migrations, deploys, secrets, auth, RBAC, payments, public API contracts, and order workflow changes.
- Conflicts between `rules/`, `CLAUDE.md`, `AGENTS.md`, and `.claude/memory/decisions.md` must be surfaced before coding.
- More than 10 meaningful implementation steps requires a written plan and approval.
- Any deviation from `.claude/memory/decisions.md` requires approval.

## Anti-patterns

- NEVER treat a high-risk domain change as routine because the code edit is small.
- NEVER silently resolve governance conflicts.
- NEVER run destructive commands without explicit approval.

## Verification Checklist

- [ ] HITL decision is declared at task start.
- [ ] Plan lists files to create/modify/delete before multi-file work.
- [ ] Approval is recorded in the conversation before execution.
- [ ] Decisions are updated when a durable architecture choice changes.
