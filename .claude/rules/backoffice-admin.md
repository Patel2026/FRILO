# Backoffice Admin Rules

## Constraints
- `/admin` is Laravel custom V1 and requires `super_admin`.
- Admin cannot manually create orders.
- Admin can update only order status, through `OrderService::updateStatus()`.
- Template, sector, FAQ, review, client, payment, contact, settings, audit, and backup actions follow existing controller/service patterns.
- Sensitive settings and payment secrets must be masked and audited.

## Anti-patterns
- NEVER add Filament resources for V1 without ADR approval. Instead: extend the custom admin.
- NEVER expose secrets in admin forms, views, logs, or raw API output. Instead: mask and store securely.

## Verification Checklist
- [ ] Client users cannot access `/admin`.
- [ ] Admin order status changes use `OrderService`.
- [ ] Settings/payment actions are audited.
- [ ] Admin lists are paginated or bounded.
