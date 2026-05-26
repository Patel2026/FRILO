# Auth And Roles Architecture

## Purpose
FRILO separates public visitors, authenticated clients, and `super_admin` backoffice operators.

## Current Implementation
- Public/client API auth uses Sanctum Bearer tokens.
- Client tokens are stored in browser `localStorage`.
- Protected API routes use `auth:sanctum` and `active_user`.
- Admin routes use Laravel session auth and `super_admin` middleware.
- `User::isClient()` checks `role === 'client'`.
- `User::isSuperAdmin()` checks `role === 'super_admin'`.

## Dependencies And Integration Points
- `OrderPolicy` prevents clients from viewing other users' orders.
- Next.js dashboard depends on token availability and `/api/user`.
- Admin route access depends on web auth and middleware.

## Known Risks
- Older docs mention `admin`; current role is `super_admin`.
- Inline role checks outside policies/middleware can leak access rules.
- Token expiry/revocation must clear client session cleanly.

## Change Impact
- Role changes require updates to policies, middleware, seeders, tests, and frontend assumptions.
- Auth response shape changes affect `auth.service.ts` and dashboard guards.

## Environment-Specific Behavior
- Sanctum/CORS domains differ between Docker, local, and production.
