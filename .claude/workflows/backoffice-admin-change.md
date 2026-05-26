# Workflow: Backoffice Admin Change

## Trigger
Changes under `/admin` routes, controllers, views, settings, backups, payments, clients, reviews, FAQ, sectors, templates, or orders.

## Pre-conditions
Admin module and action are scoped.

## Environment
all

## Steps

### Step 1: Admin Boundary
- Action       : Load admin architecture/rules and security rules.
- Skill used   : internal/backoffice-admin-change
- Agent used   : backoffice-admin-reviewer
- HITL required: yes for payment settings, backups, role changes, order workflow
- Output       : Boundary checklist.

### Step 2: Implement
- Action       : Modify route/controller/request/service/view/tests.
- Skill used   : internal/backoffice-admin-change
- Agent used   : none
- HITL required: no after scope approval
- Output       : Admin patch.

### Step 3: Verify Admin
- Action       : Check access, audit, service boundaries, and relevant tests.
- Skill used   : internal/qa-verification
- Agent used   : security-rbac-reviewer and backoffice-admin-reviewer
- HITL required: no
- Output       : Verification report.

## Verification Gates
Admin auth and sensitive data masking must pass.

## Rollback Strategy
Revert admin patch and restore previous settings/action behavior.

## Post-conditions
Admin feature remains custom Laravel, secure, and auditable.

## Output
Admin change summary and verification.
