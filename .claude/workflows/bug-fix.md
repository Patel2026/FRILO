# Workflow: Bug Fix

## Trigger
Start when a defect, failing test, broken user journey, or production issue is reported.

## Pre-conditions
Bug report or reproduction hint exists.

## Environment
all

## Steps

### Step 1: Reproduce Or Bound
- Action       : Inspect relevant files and attempt targeted reproduction.
- Skill used   : external/diagnose
- Agent used   : none
- HITL required: no
- Output       : Reproduction, hypothesis, or bounded unknown.

### Step 2: Risk Classification
- Action       : Classify as order, payment, auth, API, UI, schema, or deploy risk.
- Skill used   : internal/qa-verification
- Agent used   : matching reviewer
- HITL required: yes for production/payment/schema/auth-impacting bugs
- Output       : Fix path and verification plan.

### Step 3: Fix
- Action       : Apply smallest change in correct layer.
- Skill used   : internal/backend-feature or internal/frontend-surface
- Agent used   : none
- HITL required: no
- Output       : Patch and focused tests.

### Step 4: Regression Check
- Action       : Run targeted test and reviewer checks.
- Skill used   : internal/qa-verification
- Agent used   : relevant reviewer
- HITL required: no unless checks cannot run
- Output       : PASS or remaining failure.

## Verification Gates
Do not edit before a plausible root cause is identified. Do not finish while targeted reproduction still fails.

## Rollback Strategy
Undo the focused patch if it causes broader failures; keep reproduction notes for next pass.

## Post-conditions
Bug is fixed or escalated with reproduction and blocker.

## Output
Root cause, fix summary, test result, residual risk.
