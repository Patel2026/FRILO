# Workflow: Production Release

## Trigger
Start for deploy preparation, production configuration, release notes, smoke tests, or rollback.

## Pre-conditions
Release scope, environment, and rollback owner are known.

## Environment
prod

## Steps

### Step 1: Release Context
- Action       : Load deployment rules, runtime architecture, runbooks, and changed files.
- Skill used   : internal/qa-verification
- Agent used   : security-rbac-reviewer
- HITL required: yes
- Output       : Release checklist.

### Step 2: Preflight Verification
- Action       : Run backend/frontend QA and confirm env guards.
- Skill used   : internal/qa-verification
- Agent used   : payment-webhook-reviewer if payment touched
- HITL required: yes if checks fail or are skipped
- Output       : Preflight status.

### Step 3: Human Approval
- Action       : Ask for explicit deploy/rollback approval.
- Skill used   : external/handoff
- Agent used   : none
- HITL required: yes
- Output       : Approval or stop.

### Step 4: Post-Deploy Smoke
- Action       : Verify homepage, catalogue, auth, order, payment, dashboard, admin, logs.
- Skill used   : internal/qa-verification
- Agent used   : relevant reviewers
- HITL required: yes if smoke fails
- Output       : Smoke result.

## Verification Gates
Production deploy and rollback require explicit human approval.

## Rollback Strategy
Follow `rules/OPERATIONS_GOVERNANCE/RUNBOOK_RELEASE_ROLLBACK_V1_FRILO.md` and payment settings runbook if payment config changed.

## Post-conditions
Release is verified or rollback is initiated with human approval.

## Output
Release status, smoke results, rollback readiness, known risks.
