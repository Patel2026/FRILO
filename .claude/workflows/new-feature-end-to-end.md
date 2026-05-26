# Workflow: New Feature End To End

## Trigger
Start when a feature crosses frontend/backend boundaries or changes user-visible workflow.

## Pre-conditions
Scope is understood, relevant existing code is inspected, and HITL gates are identified.

## Environment
all

## Steps

### Step 1: Context Load
- Action       : Load `.claude/CLAUDE.md`, matching architecture, rules, and memory if decisions may change.
- Skill used   : internal/backend-feature or internal/frontend-surface
- Agent used   : none
- HITL required: no
- Output       : Context list and risk areas.

### Step 2: Specification Check
- Action       : Use `/grill-with-docs` or local rules to challenge ambiguity.
- Skill used   : external/mattpocock
- Agent used   : none
- HITL required: yes if requirements remain ambiguous
- Output       : Confirmed acceptance criteria.

### Step 3: Implementation
- Action       : Implement backend/frontend changes in correct layers.
- Skill used   : internal/backend-feature, internal/frontend-surface, or internal/api-contract-change
- Agent used   : as needed
- HITL required: yes for schema, payment, auth, or workflow contract changes
- Output       : Changed code and tests.

### Step 4: Design Quality Gate
- Action       : Run `/impeccable audit` or `/impeccable polish` on changed UI files.
- Skill used   : external/impeccable
- Agent used   : surface-quality-reviewer
- HITL required: no
- Output       : PASS or NEEDS CHANGES.

### Step 5: Verification
- Action       : Run relevant backend/frontend/e2e checks.
- Skill used   : internal/qa-verification
- Agent used   : workflow-invariant-reviewer, api-contract-reviewer, security-rbac-reviewer as relevant
- HITL required: no unless production-critical checks cannot run
- Output       : Verification report.

## Verification Gates
Step 2 must resolve ambiguity before implementation. Step 5 must pass before handoff.

## Rollback Strategy
Revert only files changed for the feature, preserving user changes. If schema changed, use migration rollback plan after HITL.

## Post-conditions
Feature works, contracts are tested, UI is reviewed, and residual risk is documented.

## Output
Change summary, tests, reviewer statuses, and next actions.
