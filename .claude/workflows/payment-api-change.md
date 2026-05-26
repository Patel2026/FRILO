# Workflow: Payment API Change

## Trigger
Start when FedaPay initiation, webhook, payment status, settings, callbacks, or payment UI changes.

## Pre-conditions
Provider behavior and environment impact are understood.

## Environment
all

## Steps

### Step 1: Payment Context
- Action       : Load payment architecture, security, runtime, and order workflow rules.
- Skill used   : internal/payment-change
- Agent used   : payment-webhook-reviewer
- HITL required: yes if provider contract or production settings change
- Output       : Risk map.

### Step 2: Implement
- Action       : Change service/client/controller/UI in the correct boundary.
- Skill used   : internal/payment-change and internal/api-contract-change
- Agent used   : none
- HITL required: no after approved scope
- Output       : Payment patch.

### Step 3: Verify
- Action       : Test initiation, webhook, refresh, unpaid gating, and frontend state.
- Skill used   : internal/qa-verification
- Agent used   : payment-webhook-reviewer
- HITL required: no unless checks cannot run
- Output       : Payment verification report.

## Verification Gates
Webhook signature and unpaid-order blocking must pass before completion.

## Rollback Strategy
Revert code changes and restore previous payment settings; for production use payment key rollback runbook.

## Post-conditions
Payment state remains auditable and order workflow remains gated.

## Output
Provider impact, changed files, test results, reviewer status.
