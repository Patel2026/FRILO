# Data Model Rules

## Constraints
- Use MySQL 8 as production target and SQLite in-memory as test target.
- Keep `$fillable` explicit on Eloquent models; do not use `$guarded = []`.
- Preserve soft deletes for orders and templates.
- Preserve one `OrderInstruction` per order.
- Preserve order price snapshots and historical template display via `withTrashed()`.

## Anti-patterns
- NEVER write migrations that destroy production data without explicit HITL approval. Instead: add reversible migrations and migration tests where practical.
- NEVER rely on SQLite-only behavior because production is MySQL. Instead: consider MySQL constraints and enum/string behavior.
- NEVER remove historical relations needed by orders. Instead: soft-delete catalogue records when history matters.

## Verification Checklist
- [ ] Migration rollback is defined.
- [ ] Foreign keys and unique constraints protect core relations.
- [ ] Model casts align with enum and date usage.
- [ ] Tests cover affected model/service behavior.
- [ ] Seeders remain valid after schema changes.
