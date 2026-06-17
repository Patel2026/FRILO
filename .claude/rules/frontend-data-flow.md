# Frontend Data Flow Rules

## Constraints

- Components and pages call `services/*.service.ts`, not raw network APIs.
- `frontend/services/api.ts` is the single Axios instance and token injector.
- UI must handle loading, error, empty, and forbidden/session-expired states.
- Client dashboard data must come from authenticated endpoints only.
- Server-side `fetch()` is allowed only in documented public cacheable helpers under `frontend/lib/*.server.ts`.

## Anti-patterns

- NEVER add direct `fetch()` in client components.
- NEVER duplicate Axios clients.
- NEVER trust local storage as authorization; server responses define access.
- NEVER display prices without FCFA formatting.

## Verification Checklist

- [ ] No new component-level network calls.
- [ ] Service methods map cleanly to Laravel endpoints.
- [ ] Token expiry behavior remains intact.
- [ ] UI states are covered for loading, error, empty, and success.
- [ ] TypeScript avoids unjustified `any`.
