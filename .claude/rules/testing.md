# Testing Rules

## Constraints
- Backend minimum verification: `composer qa` or targeted `php artisan test` from `backend/`.
- Frontend minimum verification: `npm run qa` from `frontend/`.
- Use Playwright for critical user journey or responsive UI changes.
- Payment, RBAC, and order workflow changes require focused tests.
- Document unrun tests and why.

## Anti-patterns
- NEVER skip tests for order, auth, payment, or schema changes because these are production-critical. Instead: run targeted tests at minimum.
- NEVER rely only on manual browser checks for API contracts. Instead: add/update feature tests and TypeScript checks.

## Verification Checklist
- [ ] Relevant backend feature/unit tests pass.
- [ ] Relevant frontend lint/type/build checks pass.
- [ ] E2E is run or explicitly deferred for UI journey changes.
- [ ] CI expectations remain aligned with `.github/workflows/qa.yml`.
