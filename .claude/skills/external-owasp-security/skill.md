---
name: external-owasp-security
description: Wrapper invoking OWASP Security for FRILO auth, RBAC, payment, input, and public API security review.
allowed-tools: Read
---

# External Skill: OWASP Security

## Source

Installed via: curl to `.claude/skills/owasp-security/SKILL.md`
Commands: invoke `owasp-security` skill on the target scope.

## When to Invoke

Use for auth, authorization, policies, middleware, payment/webhooks, validation, CORS, secrets, file upload, rich content, public API, or admin route changes.

## How to Invoke

Run OWASP Security against the changed files and include the FRILO role boundary: public visitor, client, admin.

## Expected Output

Security review with findings, severity, affected files, exploitability, and required fixes or CLEAR status.

## Integration Points

Used in workflows: `auth-security-change`, `feature-development`, `release-readiness`.
Replaces or extends internal skill: extends `security-change`.
