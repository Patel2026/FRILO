---
name: payment-change
description: Safely change FRILO FedaPay initiation, webhook, payment status, or payment UI behavior.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: payment-change

## Description
Modify payment behavior while preserving webhook integrity, provider mapping, auditability, and order payment gating.

## Trigger Condition
Use when touching `OrderPaymentService`, `FedapayClient`, payment controllers, payment models, settings, or payment UI.

## Inputs Required
- Payment behavior to change.
- Provider states/endpoints affected.

## Steps
1. Load payment architecture, payment rules, security rules, runtime environment rules.
2. Inspect current service, controller, routes, config, tests, and frontend payment methods.
3. Identify whether env, provider contract, or callback behavior changes.
4. Implement in service/client boundary.
5. Add tests for success, failure, webhook, and unpaid gating.
6. Invoke `payment-webhook-reviewer`.

## Verification Steps
- [ ] Signature checks remain enforced.
- [ ] Paid status comes from backend/provider mapping.
- [ ] Secrets are not logged.
- [ ] FedaPay env/settings remain configurable.
- [ ] Payment tests pass.

## Output Format
Provider contract impact, changed files, tests, reviewer status.

## Failure Handling
- If provider behavior is uncertain, mark `[?]` and stop for confirmation.
- If production payment settings change, require HITL.

## Skill Dependencies
May require `api-contract-change`, `frontend-surface`, and `qa-verification`.

## Feedback Loop
Max iterations : 2
Exit condition : Payment reviewer SAFE and payment/order tests pass.
Escalate when : Webhook, callback URL, credentials, provider mapping, or production runtime changes.
