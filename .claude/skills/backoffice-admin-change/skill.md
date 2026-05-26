---
name: backoffice-admin-change
description: Change FRILO custom Laravel admin behavior while preserving super_admin access, auditability, and service boundaries.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: backoffice-admin-change

## Description
Modify `/admin` routes, controllers, views, settings, orders, payments, clients, or admin resources.

## Trigger Condition
Use for files under `backend/app/Http/Controllers/Admin`, `backend/resources/views/admin`, or admin routes.

## Inputs Required
- Admin module.
- Action type: list, show, update, publish, restore, export, backup.

## Steps
1. Load backoffice architecture/rules and relevant source rules.
2. Inspect route, controller, request, policy/middleware, service, view, tests.
3. Keep `super_admin` access and service boundaries.
4. Implement focused admin change.
5. Verify access, audit, and workflow impacts.

## Verification Steps
- [ ] `/admin` access remains `super_admin` only.
- [ ] Order status changes use `OrderService`.
- [ ] Sensitive data is masked.
- [ ] Admin action is audited where required.

## Output Format
Admin module changed, security impact, verification, reviewer status.

## Failure Handling
Pause if introducing new admin capability that changes business workflow or sensitive settings.

## Skill Dependencies
Invoke `backoffice-admin-reviewer`; may invoke `security-rbac-reviewer`.

## Feedback Loop
Max iterations : 2
Exit condition : Admin reviewer SAFE and relevant tests/checks pass.
Escalate when : Auth, payment settings, backups, or order workflow changes.
