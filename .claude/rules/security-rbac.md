# Security RBAC Rules

## Constraints

- Client API routes require `auth:sanctum` unless explicitly public.
- Clients can only access resources scoped to their own `auth()->id()`.
- Admin routes use session auth plus admin middleware and role-specific scopes.
- Authorization belongs in Policies or middleware, not ad hoc controller branches.
- Secrets, tokens, passwords, and payment keys must never be logged or committed.

## Anti-patterns

- NEVER hardcode `if ($user->id === 1)` or inline privileged exceptions.
- NEVER expose admin data through public/client API payloads.
- NEVER place sensitive values behind `NEXT_PUBLIC_`.
- NEVER display encrypted platform setting secrets in clear text.

## Verification Checklist

- [ ] Policy or middleware covers every protected route.
- [ ] Public API payloads contain no admin-only fields.
- [ ] Logs omit credentials, tokens, and payment secrets.
- [ ] CORS and Sanctum domains remain environment-specific.
- [ ] OWASP Security and Varlock are used for sensitive changes.
