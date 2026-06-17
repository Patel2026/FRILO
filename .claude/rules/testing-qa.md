# Testing QA Rules

## Constraints

- Backend minimum gate: `composer qa` from `backend/`.
- Frontend minimum gate: `npm run qa` from `frontend/`.
- Order, auth, payment, RBAC, and API-contract changes require focused tests.
- Bug fixes should reproduce the failure before implementation when feasible.
- E2E tests are required for critical client journeys when UI behavior changes.

## Anti-patterns

- NEVER claim complete without naming verification run or why it could not run.
- NEVER rely only on manual inspection for workflow/security changes.
- NEVER mix unrelated refactors into a bugfix test cycle.

## Verification Checklist

- [ ] Relevant unit/feature/e2e tests are added or updated.
- [ ] Backend QA passes or failure is documented.
- [ ] Frontend QA passes or failure is documented.
- [ ] Edge cases from FRILO governance are checked.
- [ ] Residual risk is stated before handoff.
