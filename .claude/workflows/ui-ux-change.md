# Workflow: UI UX Change

## Trigger
Start when changing public pages, order tunnel, dashboard, forms, layout, copy, responsiveness, or visual system.

## Pre-conditions
Target route/component and user outcome are known.

## Environment
all

## Steps

### Step 1: Design Context
- Action       : Load `PRODUCT.md`, `DESIGN.md`, frontend architecture, and UI rules.
- Skill used   : internal/frontend-surface
- Agent used   : none
- HITL required: no
- Output       : UI context and success criteria.

### Step 2: Implement UI
- Action       : Update components/pages/services without direct fetch.
- Skill used   : internal/frontend-surface
- Agent used   : none
- HITL required: yes if user journey or API contract changes
- Output       : UI patch.

### Step 3: Design Audit
- Action       : Run `/impeccable audit`, `/impeccable clarify`, or `/impeccable polish`.
- Skill used   : external/impeccable
- Agent used   : surface-quality-reviewer
- HITL required: no
- Output       : PASS or NEEDS CHANGES.

### Step 4: Verify UI
- Action       : Run frontend QA and Playwright when journey/responsive risk is material.
- Skill used   : internal/qa-verification
- Agent used   : surface-quality-reviewer
- HITL required: no unless browser checks cannot run
- Output       : UI verification.

## Verification Gates
Do not finish substantial UI work without design audit or documented reason.

## Rollback Strategy
Revert UI patch, preserve service contract changes only if separately verified.

## Post-conditions
UI is responsive, truthful, accessible, and aligned with FRILO design context.

## Output
UI summary, audit result, verification result.
