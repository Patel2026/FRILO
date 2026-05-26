---
name: frontend-surface
description: Implement or refine a FRILO Next.js UI surface through services, typed contracts, and design quality gates.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: frontend-surface

## Description
Change public, order tunnel, dashboard, or shared UI while preserving service-mediated API access and FRILO design context.

## Trigger Condition
Use when a task touches `frontend/app`, `frontend/components`, `frontend/services`, or UI copy/states.

## Inputs Required
- Target route or component.
- Data dependencies and user role.
- Expected UX outcome.

## Steps
1. Load `PRODUCT.md`, `DESIGN.md`, `.claude/rules/web-ui-ux.md`, and frontend architecture.
2. Inspect current page/component/service path.
3. Keep API calls in services and types in service modules.
4. Implement UI states: loading, error, empty, success.
5. Run `/impeccable audit` or `/impeccable polish` for substantial UI changes.
6. Run frontend verification.

## Verification Steps
- [ ] No direct component `fetch()` or duplicate Axios instance.
- [ ] Mobile and desktop text/layout remain stable.
- [ ] Prices display as FCFA.
- [ ] Auth/payment/order states are truthful.
- [ ] Frontend QA or targeted checks pass.

## Output Format
UI changes, service contract changes, Impeccable result, verification result.

## Failure Handling
- If API contract is unclear, invoke `api-contract-change`.
- If Impeccable returns NEEDS CHANGES, iterate once before escalating.
- If visual verification cannot run, document residual risk.

## Skill Dependencies
Uses external/impeccable via `impeccable-wrapper`. May invoke `surface-quality-reviewer`.

## Feedback Loop
Max iterations : 3
Exit condition : UI meets task, contracts compile, and design audit is PASS or accepted WARN.
Escalate when : A journey, payment state, or role boundary changes.
