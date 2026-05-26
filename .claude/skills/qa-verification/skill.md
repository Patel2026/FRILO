---
name: qa-verification
description: Run or plan the correct FRILO backend, frontend, e2e, and reviewer checks for a completed change.
allowed-tools: Read, Bash, Glob, Grep
---

# Skill: qa-verification

## Description
Select and execute the smallest sufficient verification set for FRILO changes.

## Trigger Condition
Use after implementation or before handoff.

## Inputs Required
- Changed files.
- Risk area: backend, frontend, order, payment, auth, schema, UI, deploy.

## Steps
1. Load testing rules and relevant workflow.
2. Map changed files to required checks.
3. Run targeted tests first, broader QA when risk requires it.
4. Record commands, pass/fail status, and unrun checks.

## Verification Steps
- [ ] Backend changes have backend tests.
- [ ] Frontend changes have lint/type/build or targeted equivalent.
- [ ] UI journey changes consider Playwright.
- [ ] Production changes include smoke checklist.

## Output Format
Command list, results, failures, unrun checks, residual risk.

## Failure Handling
- If command fails due environment, capture exact failure and choose next useful check.
- If failure is related to the change, fix before handoff.

## Skill Dependencies
Runs after implementation skills and before final report.

## Feedback Loop
Max iterations : 2
Exit condition : Required checks pass or remaining risk is explicitly accepted.
Escalate when : Production-critical checks cannot run.
