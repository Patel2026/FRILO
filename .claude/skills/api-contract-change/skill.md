---
name: api-contract-change
description: Change or verify the Laravel-to-Next.js API contract without breaking typed frontend services.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: api-contract-change

## Description
Manage request/response changes across Laravel routes/controllers/services and Next.js service types.

## Trigger Condition
Use for endpoint changes, response shape changes, enum changes, auth behavior, pagination, or frontend service updates.

## Inputs Required
- Endpoint or service method affected.
- Consumer pages/components.

## Steps
1. Load API contract rules plus backend and frontend architecture.
2. Inspect Laravel route/controller/request/resource-like transform and frontend service/types.
3. Determine compatibility and migration path.
4. Implement backend and frontend updates together when needed.
5. Add/update feature tests and TypeScript checks.
6. Invoke `api-contract-reviewer`.

## Verification Steps
- [ ] Auth middleware remains correct.
- [ ] Frontend interfaces match response.
- [ ] Backward compatibility is deliberate.
- [ ] Typecheck or targeted build passes.

## Output Format
Contract diff, consumers updated, verification, reviewer status.

## Failure Handling
- If a breaking change is unavoidable, stop for HITL.
- If frontend and backend disagree, fix both before finalizing.

## Skill Dependencies
Used by backend and frontend skills; followed by `qa-verification`.

## Feedback Loop
Max iterations : 3
Exit condition : Reviewer SAFE and backend/frontend checks pass.
Escalate when : Public API, auth, enum, pagination, or payment response contracts break.
