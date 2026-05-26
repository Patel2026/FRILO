# API Contract Rules

## Constraints
- Frontend components must call Laravel through `frontend/services/*.service.ts`.
- API services must use the shared Axios instance in `frontend/services/api.ts`.
- Preserve authenticated endpoints under `auth:sanctum` and `active_user`.
- Preserve paginated order list shape: `data`, `meta`, `links`.
- Preserve order response fields used by frontend: `status`, `payment_status`, `price`, `template`, `instruction`, `payment`.
- Maintain backward compatibility fields only deliberately and document removal.

## Anti-patterns
- NEVER add direct `fetch()` calls in pages/components because they bypass token and error handling. Instead: add or extend a service method.
- NEVER change enum strings casually because backend casts, DB values, and TypeScript unions depend on them. Instead: update all layers with tests.
- NEVER return admin fields from public/client API responses. Instead: use separate admin views or endpoints.

## Verification Checklist
- [ ] Service TypeScript interfaces match Laravel response shape.
- [ ] 401 clears session and redirects protected dashboard users.
- [ ] 403 dispatches the forbidden event.
- [ ] API feature tests cover changed endpoints.
- [ ] Frontend typecheck passes after contract changes.
