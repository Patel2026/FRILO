# Workflow: Auth Security Change

## Trigger

Start for auth, RBAC, policies, middleware, payments, webhooks, CORS, validation, secrets, or sensitive config.

## Pre-conditions

Sensitive area, roles affected, and environment impact are known.

## Environment

all

## Steps

### Step 1: Security Context
- Action       : Load `.claude/rules/security-rbac.md` and `rules/SECURITY_ACCESS/MASTER_SECURITY_FRILO.md`.
- Skill used   : security-change
- Agent used   : security-rbac-reviewer
- HITL required: yes
- Output       : Threat/risk scope.

### Step 2: External Security Review
- Action       : Invoke OWASP Security and Varlock when secrets/config are involved.
- Skill used   : external/owasp-security, external/varlock
- Agent used   : security-rbac-reviewer
- HITL required: yes if findings are critical or behavior changes
- Output       : Security controls required.

### Step 3: Implementation
- Action       : Implement through FormRequests, Policies, middleware, Services, and tests.
- Skill used   : security-change
- Agent used   : security-rbac-reviewer
- HITL required: no after approval unless scope changes
- Output       : Secure implementation.

### Step 4: Verification
- Action       : Run focused security tests and QA.
- Skill used   : external/superpowers verification-before-completion
- Agent used   : qa-regression-reviewer
- HITL required: yes before production config/deploy
- Output       : Security verification.

## Verification Gates

Human approval before implementation. Security reviewer SAFE before completion.

## Rollback Strategy

Revert code/config changes. Rotate any exposed or possibly exposed secret.

## Post-conditions

No secrets exposed, role boundaries intact, tests cover denial paths.

## Output

Security change summary, controls, tests, findings, residual risk.
