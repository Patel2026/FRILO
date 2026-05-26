# Workflow: Contact Notification Change

## Trigger
Contact request, admin contact processing, notifications, mail copy, or notification UI changes.

## Pre-conditions
Recipient and payload scope are known.

## Environment
all

## Steps

### Step 1: Notification Scope
- Action       : Load contact-notification, security, and role rules.
- Skill used   : internal/contact-notification-change
- Agent used   : security-rbac-reviewer
- HITL required: yes if recipient scope or sensitive payload changes
- Output       : Payload/recipient map.

### Step 2: Implement
- Action       : Update request/controller/notification/view/tests.
- Skill used   : internal/contact-notification-change
- Agent used   : none
- HITL required: no
- Output       : Notification patch.

### Step 3: Verify
- Action       : Check validation, throttling, recipients, and copy.
- Skill used   : internal/qa-verification
- Agent used   : surface-quality-reviewer if user-facing copy changed
- HITL required: no
- Output       : Verification result.

## Verification Gates
No sensitive data leaks in notification payloads.

## Rollback Strategy
Revert notification/contact patch and restore previous recipient behavior.

## Post-conditions
Notifications are scoped, useful, and safe.

## Output
Flow summary and checks.
