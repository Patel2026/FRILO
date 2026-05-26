# Workflow: Database Schema Change

## Trigger
Start when migrations, model fields, constraints, casts, seeders, or persisted domain state changes.

## Pre-conditions
Desired schema behavior and data impact are known.

## Environment
all

## Steps

### Step 1: Impact Analysis
- Action       : Inspect migrations, models, services, factories, seeders, tests.
- Skill used   : internal/schema-change
- Agent used   : api-contract-reviewer if API fields change
- HITL required: yes if destructive or production data affected
- Output       : Migration plan.

### Step 2: Implement Migration
- Action       : Add migration/model/test changes.
- Skill used   : internal/schema-change
- Agent used   : none
- HITL required: no after approved plan
- Output       : Schema patch.

### Step 3: Verify
- Action       : Run backend tests and seed/factory checks.
- Skill used   : internal/qa-verification
- Agent used   : security-rbac-reviewer if role data changes
- HITL required: no unless tests cannot run
- Output       : Verification report.

## Verification Gates
HITL approval is mandatory before destructive migrations.

## Rollback Strategy
Use migration `down()` path or explicit rollback runbook; do not proceed without rollback notes.

## Post-conditions
Schema, models, tests, and contracts are aligned.

## Output
Migration plan, changed files, rollback strategy, test results.
