# Runtime Environments Architecture

## Purpose
FRILO runs across local non-Docker, Docker, testing, CI, and production-like environments.

## Current Implementation
- Docker Compose services: MySQL, backend, frontend.
- Docker backend: `http://localhost:8080`.
- Docker frontend: `http://localhost:3000`.
- Docker MySQL host port: `3307`.
- Non-Docker backend default: `http://localhost:8000`.
- CI runs backend and frontend jobs in `.github/workflows/qa.yml`.

## Dependencies And Integration Points
- Backend `.env.example` sets MySQL and FedaPay sandbox defaults.
- Frontend `.env.example` sets `NEXT_PUBLIC_API_URL=http://localhost:8000/api`.
- PHPUnit overrides DB to SQLite in-memory.

## Known Risks
- Local and Docker API URLs differ.
- CI does not run Playwright e2e by default.
- Production payment secrets must never be committed or logged.

## Change Impact
- Env changes can break auth, CORS, payment callbacks, and frontend API calls.
- Docker/CI changes require smoke verification.

## Environment-Specific Behavior
- Dev: verbose logs and local URLs.
- Test: SQLite in-memory, array mail, sync queue.
- Production: MySQL 8, restricted CORS, real FedaPay config, `APP_DEBUG=false`.
