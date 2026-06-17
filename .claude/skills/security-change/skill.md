---
name: security-change
description: Use for authentication, authorization, secrets, payment, webhooks, validation, CORS, or sensitive data handling changes.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: security-change

## Description

Apply FRILO security, RBAC, and secret-handling gates before sensitive changes.

## Trigger Condition

Invoke for auth, Sanctum, Policies, middleware, admin roles, FedaPay, webhooks, `.env`, secrets, validation, CORS, or public/private data exposure.

## Inputs Required

- Sensitive area.
- Intended behavior change.
- Environments affected.

## Steps

1. Load `.claude/rules/security-rbac.md`.
2. Load `rules/SECURITY_ACCESS/MASTER_SECURITY_FRILO.md`.
3. Use Varlock before reading or modifying secrets.
4. Use OWASP Security for design/review.
5. Pause for HITL approval if behavior changes.
6. Implement with policies, middleware, FormRequests, Services, and tests.
7. Invoke `security-rbac-reviewer`.

## Verification Steps

- [ ] No secret or credential is exposed.
- [ ] Authorization is server-side and deny-by-default.
- [ ] Logs avoid tokens/passwords/payment secrets.
- [ ] Tests cover unauthorized, forbidden, and cross-user cases.

## Output Format

Return security area, controls changed, tests run, OWASP/Varlock usage, and residual risk.

## Failure Handling

If a secret is visible in code/logs/context, stop and request rotation guidance. If auth behavior is ambiguous, escalate.

## Skill Dependencies

External: OWASP Security, Varlock. After: `security-rbac-reviewer`, `qa-regression-reviewer`.

## Feedback Loop

Max iterations : 2
Exit condition : security reviewer SAFE and relevant security tests pass.
Escalate when : auth, payment, secret, RBAC, or production behavior changes.
