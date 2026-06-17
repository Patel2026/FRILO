# Workflow: Bugfix

## Trigger

Start when a defect, regression, failing test, or production-like unexpected behavior is reported.

## Pre-conditions

Bug report, reproduction path, or failing evidence is available.

## Environment

all

## Steps

### Step 1: Reproduce
- Action       : Reproduce with test, command, or documented manual path.
- Skill used   : external/superpowers systematic-debugging
- Agent used   : none
- HITL required: no
- Output       : Reproduction evidence or blocker.

### Step 2: Isolate
- Action       : Identify layer and smallest responsible code path.
- Skill used   : external/superpowers systematic-debugging
- Agent used   : none
- HITL required: yes if the fix crosses high-risk domains
- Output       : Root cause hypothesis.

### Step 3: Fix
- Action       : Add or adjust a focused test when feasible, then implement minimal fix.
- Skill used   : relevant internal skill
- Agent used   : relevant domain reviewer
- HITL required: yes for auth, RBAC, payment, schema, public API, or order workflow behavior changes
- Output       : Fix and reviewer result.

### Step 4: Verify
- Action       : Run the failing test and relevant regression checks.
- Skill used   : external/superpowers verification-before-completion
- Agent used   : qa-regression-reviewer
- HITL required: no unless blocked
- Output       : Verification evidence.

## Verification Gates

Root cause identified before fix. Failing path verified after fix.

## Rollback Strategy

Revert only the fix files if verification fails and no smaller correction is available.

## Post-conditions

Bug is fixed or blocked with clear evidence and next action.

## Output

Root cause, fix summary, changed files, tests run, remaining risk.
