# Workflow: Recette Validation

## Trigger
Before release, major feature handoff, or user-requested recette/QA pass.

## Pre-conditions
Feature/change scope is known.

## Environment
all

## Steps

### Step 1: Recette Mapping
- Action       : Load QA recette architecture/rules and source checklist.
- Skill used   : internal/recette-validation
- Agent used   : qa-recette-reviewer
- HITL required: no
- Output       : Relevant checklist sections.

### Step 2: Run Checks
- Action       : Run automated checks and list manual checks.
- Skill used   : internal/qa-verification
- Agent used   : qa-recette-reviewer
- HITL required: yes if critical checks cannot run for release
- Output       : Check matrix.

### Step 3: Handoff
- Action       : Produce PASS/WARN/UNSAFE readiness result.
- Skill used   : external/handoff
- Agent used   : qa-recette-reviewer
- HITL required: yes for production release.
- Output       : Recette report.

## Verification Gates
Auth, order, payment, admin, and dashboard critical checks cannot be silently skipped.

## Rollback Strategy
For failed release checks, stop release and create local markdown issues.

## Post-conditions
Readiness is explicit and traceable to FRILO checklist.

## Output
Recette matrix, commands, manual gaps, release risk.
