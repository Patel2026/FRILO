# Deployment Rules

## Constraints
- Require human approval before production deploys, destructive migrations, payment-key changes, or rollback execution.
- Use `rules/OPERATIONS_GOVERNANCE/RUNBOOK_RELEASE_ROLLBACK_V1_FRILO.md` for releases.
- Use `rules/OPERATIONS_GOVERNANCE/RUNBOOK_SETTINGS_PAYMENT_KEYS_ROLLBACK_FRILO.md` for payment key/settings changes.
- Keep `APP_DEBUG=false` in production.
- Keep production CORS, Sanctum, FedaPay, DB, and mail settings environment-specific.

## Anti-patterns
- NEVER deploy with unverified payment callback/webhook settings. Instead: run release smoke checks and verify FedaPay dashboard config.
- NEVER run destructive database operations without a rollback plan and approval. Instead: produce a migration plan first.
- NEVER hardcode production URLs or secrets into source. Instead: use env/config.

## Verification Checklist
- [ ] Human approval is recorded for production-impacting steps.
- [ ] Rollback strategy is known before deploy.
- [ ] Smoke tests cover homepage, catalogue, auth, order, payment, dashboard, and admin.
- [ ] Secrets are not exposed in logs or files.
