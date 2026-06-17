# Runtime Environments Architecture

## Purpose

Document how FRILO runs locally, in CI, and in production-facing configuration.

## Current Implementation

Local Docker Compose services:
- `mysql`: MySQL 8, host port `3307`.
- `backend`: Laravel served on container `8080`, host `8081`.
- `frontend`: Next.js on host `3000`.
- `nginx`: production-oriented configuration in `docker/nginx`.

CI:
- GitHub Actions workflow `.github/workflows/qa.yml`.
- Backend job installs Composer dependencies, prepares Laravel env, and runs `composer qa`.
- Frontend job installs npm dependencies and runs `npm run qa`.

## Dependencies And Integration Points

- Backend env: `backend/.env`, `APP_URL`, `FRONTEND_APP_URL`, DB settings, CORS, Sanctum domains.
- Frontend env: `API_INTERNAL_URL`, `NEXT_PUBLIC_API_URL`.
- Tests: backend SQLite in-memory; frontend Playwright against a running app when E2E is invoked.

## Known Risks

- CI backend uses SQLite while production uses MySQL.
- Running migrations or destructive commands against production requires explicit approval.
- Next.js env values can leak if sensitive values use `NEXT_PUBLIC_`.

## Change Impact

Runtime changes can affect local developer experience, CI, deployment, CORS, auth, and API reachability.

## Environment Behavior

Dev prioritizes Docker repeatability. CI prioritizes deterministic QA. Production must be guarded by manual approval and rollback steps.
