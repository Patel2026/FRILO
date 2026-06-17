---
name: api-contract-change
description: Use when changing Laravel API endpoints, response payloads, request validation, or Next.js services that consume the API.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: api-contract-change

## Description

Keep Laravel API contracts and Next.js service consumers aligned.

## Trigger Condition

Invoke for changes under `backend/routes/api.php`, API controllers, API FormRequests, serializers/transformers, `frontend/services`, or API-consuming frontend pages.

## Inputs Required

- Endpoint or service name.
- Current consumer files.
- Expected success and error behavior.

## Steps

1. Load `.claude/rules/api-contract.md`.
2. Read the backend route, controller, request, policy, service, and tests.
3. Read matching frontend service and consuming pages/components.
4. Identify whether the API contract changes or only implementation changes.
5. If contract changes, pause for HITL approval.
6. Implement backend and frontend updates together.
7. Invoke `api-contract-reviewer`.
8. Run focused backend tests and frontend typecheck/build as needed.

## Verification Steps

- [ ] Endpoint shape and frontend types agree.
- [ ] Auth, validation, and error codes are tested.
- [ ] No direct component-level network calls were added.

## Output Format

Return endpoint changes, consumer changes, tests run, and compatibility notes.

## Failure Handling

If consumers are ambiguous, search for endpoint/service usage before editing. If an old field must be removed, require approval.

## Skill Dependencies

After: `api-contract-reviewer`, `qa-regression-reviewer`.

## Feedback Loop

Max iterations : 2
Exit condition : reviewer status SAFE and API/frontend checks pass.
Escalate when : public contract or authenticated data exposure changes.
