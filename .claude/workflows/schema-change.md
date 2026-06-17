# Workflow: Schema Change

## Trigger

Start for migrations, model relationship changes, constraints, indexes, factories, or data shape changes.

## Pre-conditions

Desired schema behavior and affected environments are known.

## Environment

dev / staging / prod

## Steps

### Step 1: Impact Analysis
- Action       : Load data architecture and canonical data model rules.
- Skill used   : external/superpowers
- Agent used   : api-contract-reviewer if API payloads change
- HITL required: yes
- Output       : Migration impact and rollback concept.

### Step 2: Migration Plan
- Action       : Define additive migration, model updates, factories, tests, and data backfill needs.
- Skill used   : external/superpowers writing-plans
- Agent used   : qa-regression-reviewer
- HITL required: yes
- Output       : Approved file plan.

### Step 3: Implementation
- Action       : Create new migration and aligned model/test updates.
- Skill used   : relevant internal skill
- Agent used   : relevant domain reviewer
- HITL required: no after plan approval unless scope changes
- Output       : Schema implementation.

### Step 4: Verification
- Action       : Run backend tests and inspect migration reversibility.
- Skill used   : external/superpowers verification-before-completion
- Agent used   : qa-regression-reviewer
- HITL required: yes before production migration/deploy
- Output       : QA and deployment guard.

## Verification Gates

Approval before migration creation. QA before merge. Manual approval before production migration.

## Rollback Strategy

Use migration `down()` for dev/test. In production, use a corrective migration or documented rollback runbook.

## Post-conditions

Schema, model, factories, tests, and docs are aligned.

## Output

Migration summary, affected models/contracts, tests, production guard.
