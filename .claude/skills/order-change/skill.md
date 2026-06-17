---
name: order-change
description: Use for any change touching FRILO orders, status transitions, payment gates, production fields, delivery, or order instructions.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: order-change

## Description

Protect FRILO order lifecycle and production invariants while making order-related changes.

## Trigger Condition

Invoke when a task touches `Order`, `OrderInstruction`, `OrderService`, payment status, order admin screens, order API endpoints, or dashboard order views.

## Inputs Required

- Task summary: requested behavior or bug.
- Files in scope: suspected backend/frontend files.
- Risk level: low, medium, or high.

## Steps

1. Load `.claude/rules/order-workflow.md`.
2. Load `rules/WORKFLOW_ENGINE/WORKFLOW_COMMANDE_FRILO.md`.
3. Read relevant models, service, policy, controller, request, and tests.
4. If status transitions, payment gates, immutability, or price snapshots change, pause for HITL approval.
5. Implement through the established layer flow.
6. Invoke `order-workflow-reviewer`.
7. Run focused tests, then wider QA if the blast radius is high.

## Verification Steps

- [ ] No direct status update outside `OrderService::updateStatus()`.
- [ ] Terminal states remain immutable.
- [ ] Price/user/status are not accepted from client payloads.
- [ ] Tests cover nominal and refused transitions.

## Output Format

Return changed files, invariant checks, tests run, and residual risks.

## Failure Handling

If a transition rule is unclear, stop and ask. If tests cannot run, state the blocking reason and highest-risk unverified behavior.

## Skill Dependencies

Before: external/superpowers for planning or TDD on substantial changes. After: `order-workflow-reviewer`, `qa-regression-reviewer`.

## Feedback Loop

Max iterations : 2
Exit condition : reviewer status SAFE and relevant tests pass or are explicitly blocked.
Escalate when : workflow, payment gate, or immutable state behavior would change.
