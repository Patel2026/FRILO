# QA Recette Architecture

## Purpose
Describe functional acceptance and critical path validation for FRILO.

## Current Implementation
- Functional checklist: `rules/QUALITY_ASSURANCE/CHECKLIST_RECETTE_FRILO.md`.
- E2E critical path: `rules/QUALITY_ASSURANCE/E2E_CRITICAL_PATH_FRILO.md`.
- Definition of Done: `rules/PRODUCT_SPEC/04_DEFINITION_OF_DONE_FRILO.md`.
- Backend tests live in `backend/tests`.
- Frontend E2E tests live in `frontend/tests/e2e`.

## Dependencies And Integration Points
- CI runs backend `composer qa` and frontend `npm run qa`.
- Playwright E2E is available but not in current GitHub Actions workflow.

## Known Risks
- Manual recette checklist can drift from automated tests.
- Payment/webhook production behavior needs sandbox or controlled smoke validation.

## Change Impact
Feature completion should update tests or recette notes when acceptance criteria change.

## Environment-Specific Behavior
Testing uses SQLite backend and local frontend/browser behavior.
