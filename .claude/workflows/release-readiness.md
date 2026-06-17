# Workflow: Release Readiness

## Trigger

Start before merge, release, deploy, or when asked to verify production readiness.

## Pre-conditions

Change scope and target environment are known.

## Environment

dev / staging / prod

## Steps

### Step 1: Scope Review
- Action       : Review changed files and classify risk domains.
- Skill used   : external/superpowers verification-before-completion
- Agent used   : qa-regression-reviewer
- HITL required: yes for production deploy
- Output       : Risk map.

### Step 2: Domain Reviewers
- Action       : Invoke relevant agents for order, security, API, UI, and QA.
- Skill used   : relevant internal skills
- Agent used   : all relevant reviewers
- HITL required: yes for WARN/UNSAFE in high-risk domain
- Output       : Reviewer matrix.

### Step 3: External Gates
- Action       : Run OWASP for security-sensitive diff, Impeccable for UI diff, Varlock for config/secrets.
- Skill used   : external/owasp-security, external/impeccable, external/varlock
- Agent used   : security-rbac-reviewer, surface-quality-reviewer
- HITL required: yes for critical findings
- Output       : External gate status.

### Step 4: QA Commands
- Action       : Run `composer qa` and `npm run qa` where applicable.
- Skill used   : external/superpowers verification-before-completion
- Agent used   : qa-regression-reviewer
- HITL required: yes if production release and QA is blocked
- Output       : QA evidence.

## Verification Gates

No high-risk UNSAFE reviewer status. QA pass or explicit accepted blocker. Human approval before production deploy.

## Rollback Strategy

Use release rollback runbook. For schema/config changes, document exact rollback or corrective migration.

## Post-conditions

Release has known risk status, verification evidence, and rollback plan.

## Output

Release readiness report with PASS / NEEDS FIXES / BLOCKED.
