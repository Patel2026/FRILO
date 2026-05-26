---
name: contact-notification-change
description: Change FRILO contact requests or notification flows without leaking sensitive data or bypassing throttling.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: contact-notification-change

## Description
Modify contact API/admin flow or Laravel notifications.

## Trigger Condition
Use for contact controllers/requests/models, notification classes, notification UI, or admin notifications.

## Inputs Required
- Notification/contact scenario.
- Recipient roles.

## Steps
1. Load contact-notifications, security, and role-boundary rules.
2. Inspect controller/request/service/notification/view/test.
3. Preserve validation, throttling, and recipient scoping.
4. Implement change.
5. Verify payload safety and tests.

## Verification Steps
- [ ] Contact route remains throttled.
- [ ] Notification recipients are scoped.
- [ ] Sensitive data is excluded.
- [ ] User-facing copy is actionable.

## Output Format
Flow changed, recipients, payload fields, verification.

## Failure Handling
Pause if notification content includes payment, secrets, or broad client data.

## Skill Dependencies
May invoke `security-rbac-reviewer` and `surface-quality-reviewer`.

## Feedback Loop
Max iterations : 2
Exit condition : Security review SAFE and tests/checks pass.
Escalate when : Recipient scope or sensitive payload changes.
