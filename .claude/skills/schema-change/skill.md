---
name: schema-change
description: Plan and implement FRILO database schema changes with migration, model, service, and test alignment.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: schema-change

## Description
Change database schema while respecting MySQL production, SQLite tests, soft deletes, snapshots, and historical data.

## Trigger Condition
Use for migrations, model relations/casts/fillable, seeders, or schema-dependent services.

## Inputs Required
- Schema goal.
- Data migration or backward compatibility needs.

## Steps
1. Load data model architecture, data model rules, deployment rules, and memory decisions.
2. Inspect migrations, models, factories, seeders, tests, and impacted services.
3. Produce migration plan and identify destructive risk.
4. Stop for HITL if destructive or production-impacting.
5. Implement migration/model/test changes.
6. Run targeted backend tests.

## Verification Steps
- [ ] Migration is reversible or explicitly justified.
- [ ] MySQL and SQLite behavior considered.
- [ ] Model casts/fillable/relations updated.
- [ ] Seeders and factories still work.
- [ ] Tests cover new schema behavior.

## Output Format
Migration plan, files changed, verification, rollback notes.

## Failure Handling
- If data loss is possible, pause before editing.
- If SQLite hides MySQL behavior, document and add safeguards.

## Skill Dependencies
May invoke `backend-feature` and `security-rbac-reviewer`.

## Feedback Loop
Max iterations : 2
Exit condition : Migration and tests pass with rollback documented.
Escalate when : Destructive migration, production data migration, or contract change is involved.
