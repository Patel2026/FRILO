# Frontend App Architecture

## Purpose

Describe the Next.js client surface and its contract with the Laravel API.

## Current Implementation

FRILO frontend lives in `frontend/` and uses Next.js 16, React 19, TypeScript, Tailwind CSS 4, Axios, and Playwright.

Main surfaces:
- Public: `frontend/app/page.tsx`, `templates`, `expertises`, `faq`, legal pages, demo previews.
- Order tunnel: `frontend/app/commande`.
- Client dashboard: `frontend/app/dashboard`.
- API services: `frontend/services`.
- Shared runtime helpers: `frontend/lib`.
- UI components: `frontend/components`.

All client API calls go through `frontend/services/api.ts`, which creates the Axios instance and injects the Bearer token from local storage in the browser.

## Dependencies And Integration Points

- Laravel API base URL comes from `API_INTERNAL_URL`, `NEXT_PUBLIC_API_URL`, or local fallback.
- `next.config.ts` rewrites `/api/frilo/:path*` to the backend API.
- Public server helpers may use server-side `fetch` only for cacheable public reads.
- Playwright tests live under `frontend/tests/e2e`.

## Known Risks

- Direct `fetch()` in components breaks the service-boundary rule.
- Dashboard pages must handle revoked/expired tokens and forbidden responses.
- UI may display stale or misleading order/payment states if API contracts change without frontend updates.
- Public pages rely on content and pricing data that may be unavailable at runtime.

## Change Impact

UI changes can affect SEO/public trust, conversion, order creation, and dashboard clarity. API service changes must be checked against backend controllers and tests.

## Environment Behavior

Local frontend runs on `localhost:3000`. CI runs `npm run qa`, which includes lint, typecheck, and build. E2E defaults to `http://localhost:3000`.
