# Workflow: Platform Settings Change

## Trigger
Settings revision, payment config, publish, restore, runtime fallback, or settings UI changes.

## Pre-conditions
Settings section and runtime impact are known.

## Environment
all

## Steps

### Step 1: Settings Context
- Action       : Load platform settings, payment, security, and deployment rules.
- Skill used   : internal/platform-settings-change
- Agent used   : platform-settings-reviewer
- HITL required: yes for production/payment runtime changes
- Output       : Settings impact map.

### Step 2: Implement
- Action       : Update service/controller/request/view/tests.
- Skill used   : internal/platform-settings-change
- Agent used   : none
- HITL required: no after approved impact
- Output       : Settings patch.

### Step 3: Verify Lifecycle
- Action       : Verify draft/publish/restore/test payment behavior.
- Skill used   : internal/qa-verification
- Agent used   : platform-settings-reviewer
- HITL required: no unless checks fail
- Output       : Lifecycle verification.

## Verification Gates
Payment settings must validate before publish.

## Rollback Strategy
Restore previous draft/published revision or use payment settings rollback runbook.

## Post-conditions
Runtime settings remain valid, auditable, and reversible.

## Output
Settings summary, tests, rollback notes.
