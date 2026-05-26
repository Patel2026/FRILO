# Platform Settings Rules

## Constraints
- Edit settings through draft revisions and publish atomically.
- Keep exactly one active published runtime revision.
- Store payment secrets encrypted or via environment fallback.
- Validate payment configuration before publish.
- Preserve revision history; do not destructively delete settings history.

## Anti-patterns
- NEVER publish untested payment settings because checkout/webhook flow can break. Instead: use the payment test action and rollback runbook.
- NEVER display secret values in clear text. Instead: show masked placeholders.

## Verification Checklist
- [ ] Draft/published lifecycle remains intact.
- [ ] Payment test works before publish.
- [ ] Restore-draft keeps audit trail.
- [ ] Runtime fallback to `.env` remains documented.
