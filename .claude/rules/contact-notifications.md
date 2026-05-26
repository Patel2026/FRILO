# Contact Notifications Rules

## Constraints
- Public contact submissions are throttled and validated.
- Contact requests can reference order numbers without exposing order data publicly.
- Notifications must contain only data needed by the recipient.
- Client notifications must not reveal admin-only data.
- Admin manual notifications require auditability.

## Anti-patterns
- NEVER include tokens, secrets, or full raw payment payloads in notifications. Instead: include references and safe summaries.
- NEVER let public contact bypass throttling. Instead: keep `throttle:contact`.

## Verification Checklist
- [ ] Contact API validation and throttling remain active.
- [ ] Notification recipients are scoped correctly.
- [ ] Sensitive data is not included in mail/database notifications.
- [ ] Admin notification actions are logged or auditable.
