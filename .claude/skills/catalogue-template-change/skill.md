---
name: catalogue-template-change
description: Change FRILO sectors or templates while preserving catalogue visibility, orderability, and price snapshot rules.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: catalogue-template-change

## Description
Modify sectors/templates, seeders, admin catalogue behavior, or public catalogue API safely.

## Trigger Condition
Use for `Sector`, `Template`, catalogue controllers, seeders, admin template/sector views, or frontend catalogue pages.

## Inputs Required
- Entity: sector or template.
- Surface: public API, admin, seeder, frontend.

## Steps
1. Load catalogue architecture and rules.
2. Inspect model, controller, service/admin, seeder, frontend consumer.
3. Protect active/inactive visibility and orderability.
4. Implement focused change.
5. Verify catalogue API and UI contracts.

## Verification Steps
- [ ] Inactive records are hidden from public catalogue.
- [ ] Historical orders still render.
- [ ] Price snapshot invariant remains intact.
- [ ] Frontend types still match.

## Output Format
Change summary, affected catalogue surfaces, verification, risks.

## Failure Handling
Pause if changing price semantics, orderability, or deletion behavior.

## Skill Dependencies
May invoke `api-contract-change`, `frontend-surface`, and `catalogue-template-reviewer`.

## Feedback Loop
Max iterations : 2
Exit condition : Catalogue reviewer SAFE and relevant tests/checks pass.
Escalate when : Template deletion, pricing semantics, or public API shape changes.
