# Workflow: UI Change

## Trigger

Start for public website, order tunnel, dashboard, admin, component, layout, or UX copy changes.

## Pre-conditions

Surface, target role, intended behavior, and data source are known.

## Environment

all

## Steps

### Step 1: UI Context
- Action       : Load frontend architecture, data flow rules, and UI guidelines when visual design changes.
- Skill used   : ui-change
- Agent used   : surface-quality-reviewer
- HITL required: yes if workflow, API contract, or role behavior changes
- Output       : UI scope and data dependencies.

### Step 2: Implementation
- Action       : Update service/component/page or Blade view with smallest viable change.
- Skill used   : ui-change
- Agent used   : none
- HITL required: no unless scope changes
- Output       : UI implementation.

### Step 3: Design Review
- Action       : Run Impeccable audit/polish for meaningful visual changes.
- Skill used   : external/impeccable
- Agent used   : surface-quality-reviewer
- HITL required: no unless review flags major product ambiguity
- Output       : UI review result.

### Step 4: Verification
- Action       : Run frontend QA or focused lint/typecheck/build and E2E if journey changed.
- Skill used   : external/superpowers verification-before-completion
- Agent used   : qa-regression-reviewer
- HITL required: no unless verification is blocked
- Output       : Verification evidence.

## Verification Gates

Surface reviewer before completion. Impeccable for significant visual changes. QA evidence before final response.

## Rollback Strategy

Revert changed UI/service files. Preserve unrelated style or generated assets.

## Post-conditions

UI matches requested behavior, data is truthful, role boundaries are preserved, and responsive states are verified.

## Output

Surface summary, changed files, reviewer status, tests/screenshots if available.
