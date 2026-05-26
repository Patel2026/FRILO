---
name: backend-feature
description: Implement a FRILO Laravel backend feature without violating service, policy, request, or model boundaries.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: backend-feature

## Description
Build or change Laravel API/admin behavior using FRILO's Controller -> FormRequest -> Policy -> Service -> Model flow.

## Trigger Condition
Use when a task touches `backend/app`, `backend/routes`, `backend/database`, or backend tests.

## Inputs Required
- Feature scope: endpoint, admin route, model, or service behavior.
- Affected domain: orders, payments, catalogue, auth, settings, reviews, notifications, or admin.

## Steps
1. Load `.claude/CLAUDE.md`, relevant architecture, and relevant rules.
2. Inspect current controller, request, policy, service, model, route, and tests.
3. Identify invariants and HITL gates before editing.
4. Implement the smallest backend change in the correct layer.
5. Add or update focused tests.
6. Run targeted backend verification.

## Verification Steps
- [ ] Authorization remains in Policy/middleware.
- [ ] Validation remains in FormRequest.
- [ ] Business logic remains in Service.
- [ ] API response shape is compatible with frontend services.
- [ ] Relevant backend tests pass or are documented if not run.

## Output Format
Changed files, verification command results, risks, and follow-up needs.

## Failure Handling
- If architecture docs conflict with code, pause for human review.
- If tests fail, diagnose before broadening scope.
- If a migration or production behavior change is needed, stop for HITL.

## Skill Dependencies
Run `qa-verification` after implementation. Invoke `api-contract-reviewer`, `security-rbac-reviewer`, or `workflow-invariant-reviewer` when relevant.

## Feedback Loop
Max iterations : 3
Exit condition : Tests pass and reviewers return SAFE or documented WARN.
Escalate when : Invariants, role boundaries, payment state, or schema behavior would change.
