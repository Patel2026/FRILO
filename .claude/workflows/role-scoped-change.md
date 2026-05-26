# Workflow: Role Scoped Change

## Trigger
Start when a change affects clients, `super_admin`, dashboard visibility, admin routes, policies, or middleware.

## Pre-conditions
Affected role and surface are identified.

## Environment
all

## Steps

### Step 1: Boundary Load
- Action       : Load auth roles architecture, role boundary rules, security rules, and relevant policies.
- Skill used   : internal/backend-feature
- Agent used   : security-rbac-reviewer
- HITL required: yes if role model or auth mode changes
- Output       : Boundary checklist.

### Step 2: Implement
- Action       : Update policy, middleware, controller, service, or UI state.
- Skill used   : internal/backend-feature or internal/frontend-surface
- Agent used   : none
- HITL required: no after boundary is clear
- Output       : Scoped change.

### Step 3: Verify Access
- Action       : Test own-user, cross-user, unauthenticated, inactive, and admin paths as relevant.
- Skill used   : internal/qa-verification
- Agent used   : security-rbac-reviewer
- HITL required: no
- Output       : Access verification.

## Verification Gates
Cross-user access must be explicitly tested for order/dashboard changes.

## Rollback Strategy
Revert changed policy/middleware/UI guard files and rerun access tests.

## Post-conditions
Each role sees only permitted surfaces and data.

## Output
Boundary decision, tests, reviewer status.
