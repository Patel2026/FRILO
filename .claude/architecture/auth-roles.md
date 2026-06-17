# Auth And Roles Architecture

## Purpose

Capture FRILO authentication modes, role surfaces, and access boundaries.

## Current Implementation

Client API auth uses Laravel Sanctum Bearer tokens. Frontend stores the token in local storage and injects it through `frontend/services/api.ts`.

Admin auth uses Laravel session auth under a non-obvious entry path and routes the actual backoffice under `/admin`. Admin access is guarded by `auth`, `super_admin`, and role-specific middleware.

Observed role surfaces:
- Public visitor: anonymous catalog/content/contact access.
- Client: authenticated dashboard and own API resources.
- Admin: custom Blade backoffice with operational roles such as ops, finance, content, and super admin.

## Dependencies And Integration Points

- `backend/routes/api.php` protects client routes with `auth:sanctum` and `active_user`.
- `backend/routes/web.php` protects admin routes with session middleware and role middleware.
- Policies in `backend/app/Policies` enforce ownership and admin capabilities.
- `rules/SECURITY_ACCESS/MASTER_SECURITY_FRILO.md` is the security source of truth.

## Known Risks

- Inline role checks outside policies/middleware create drift.
- Cross-user order access is the primary data leakage risk.
- Admin routes expose operational and financial information and must stay role-scoped.
- Secrets in platform settings are encrypted and must never be rendered in clear text.

## Change Impact

Auth/RBAC changes are high impact and require human approval before implementation.

## Environment Behavior

Local uses Docker environment values. Production must keep CORS restricted and secrets outside source code.
