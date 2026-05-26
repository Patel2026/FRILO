# Frontend App Architecture

## Purpose
Next.js provides the public site, order tunnel, authentication pages, and client dashboard.

## Current Implementation
- Framework: Next.js 16, React 19, TypeScript, Tailwind CSS 4.
- App Router lives under `frontend/app/`.
- Shared components live under `frontend/components/`.
- API services live under `frontend/services/`.
- `frontend/services/api.ts` owns the Axios instance, Bearer token injection, 401 handling, and 403 event dispatch.

## Dependencies And Integration Points
- Public catalogue calls `GET /sectors`, `GET /templates`, reviews, FAQ, and pricing endpoints.
- Client dashboard calls authenticated order and notification endpoints.
- Order tunnel calls `createOrder`, `initiateOrderPayment`, and payment status APIs through `business.service.ts`.

## Known Risks
- Direct `fetch()` in components bypasses auth/error conventions.
- UI copy and status displays must not imply payment/order completion before backend confirmation.
- LocalStorage token handling requires careful session-expiry UX.

## Change Impact
- API type changes must be mirrored in `frontend/services/*.service.ts`.
- UI changes can affect Playwright critical-path coverage.
- Template preview changes affect catalogue conversion and perceived trust.

## Environment-Specific Behavior
- `NEXT_PUBLIC_API_URL` controls API base URL.
- Docker sets `http://localhost:8080/api`.
- Non-Docker `.env.example` sets `http://localhost:8000/api`.
