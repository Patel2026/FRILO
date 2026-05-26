# Role Boundaries Rules

## Constraints
- Public visitors may read catalogue, FAQ, reviews, pricing, and contact endpoints only.
- Clients authenticate through Sanctum Bearer tokens and only see their own orders.
- Backoffice users authenticate by Laravel session and require `super_admin`.
- Use Policies and middleware for access decisions; keep inline role checks out of controllers where a Policy exists.
- Treat ADR-012 as current truth: V1 admin is Laravel custom Blade under `/admin`.

## Anti-patterns
- NEVER expose unscoped orders from API routes because clients must not see each other's data. Instead: use `forUser($request->user()->id)` and `OrderPolicy`.
- NEVER assume role `admin` is current because the model uses `super_admin`. Instead: check `User::isSuperAdmin()` and existing seeders.
- NEVER expose admin-only data through public API serializers. Instead: create explicit admin routes/views.

## Verification Checklist
- [ ] Authenticated order list is filtered by current user.
- [ ] `OrderPolicy@view` blocks cross-user access.
- [ ] `/admin` routes require session auth and `super_admin`.
- [ ] API clients cannot update their role or active state.
- [ ] Tests cover inactive user blocking where relevant.
