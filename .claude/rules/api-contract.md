# API Contract Rules

## Constraints

- Laravel response shapes consumed by Next.js services are public contracts.
- Backend API changes must be paired with frontend service/type updates.
- Lists must remain paginated where established.
- Errors must stay intentional: validation errors, 401, 403, 404, 409, and 422 should be preserved where documented.
- Backward-compatible fields may be retained during frontend migration.

## Anti-patterns

- NEVER change endpoint payload shape silently.
- NEVER consume API directly from React components when a service exists.
- NEVER return cross-role data from a shared endpoint.
- NEVER make frontend pages infer missing backend invariants.

## Verification Checklist

- [ ] Changed endpoints have matching frontend service updates.
- [ ] Feature tests cover success and failure responses.
- [ ] TypeScript types or schemas reflect backend payloads.
- [ ] Authenticated endpoints still handle 401/403 paths.
- [ ] API docs/rules are updated when contracts change.
