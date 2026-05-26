---
name: order-workflow-change
description: Safely change FRILO order creation, status transition, or order display behavior.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: order-workflow-change

## Description
Modify order behavior while preserving lifecycle, terminal states, ownership, price snapshot, and payment gating.

## Trigger Condition
Use for changes touching `Order`, `OrderService`, `OrderPolicy`, order controllers, order requests, or order UI.

## Inputs Required
- Requested workflow change.
- Affected statuses or API responses.

## Steps
1. Load order workflow rule, backend architecture, data model architecture, and existing ADRs if behavior changes.
2. Inspect `OrderStatus`, `OrderService`, `OrderPolicy`, order migrations, tests, and frontend order types.
3. Prove the change does not bypass `canTransitionTo()` or payment gating.
4. Implement service-centered change.
5. Add tests for allowed and rejected paths.
6. Invoke `workflow-invariant-reviewer`.

## Verification Steps
- [ ] Direct status updates outside service are not introduced.
- [ ] Terminal states remain immutable.
- [ ] Price snapshot remains untouched.
- [ ] Cross-user access remains blocked.
- [ ] Backend tests cover transitions.

## Output Format
Transition impact, tests, reviewer status, residual risks.

## Failure Handling
- If lifecycle changes are required, stop for HITL and ADR update.
- If tests reveal existing invariant drift, fix or escalate before adding new behavior.

## Skill Dependencies
Requires `backend-feature`; followed by `qa-verification`.

## Feedback Loop
Max iterations : 2
Exit condition : Reviewer returns SAFE and transition tests pass.
Escalate when : New statuses, terminal behavior, payment gating, or API contract changes.
