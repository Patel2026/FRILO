# Security Rules

## Constraints
- Keep secrets and tokens out of source code, logs, `.scratch/`, and generated docs.
- Validate all client input through FormRequests.
- Use Sanctum Bearer token auth for client API routes.
- Restrict CORS and Sanctum stateful domains per environment.
- Rate-limit auth, contact, payment, and webhook-sensitive routes.
- Log identifiers and state changes, not raw credentials or payment secrets.

## Anti-patterns
- NEVER add secrets to env examples or docs because they can be committed. Instead: use placeholder values.
- NEVER disable middleware for convenience on protected routes. Instead: write tests with authenticated users.
- NEVER trust request body identity fields. Instead: use `$request->user()`.

## Verification Checklist
- [ ] No new secrets appear in tracked files.
- [ ] Sensitive endpoints are protected by auth/rate-limit middleware.
- [ ] FormRequests reject privileged fields.
- [ ] Logs avoid tokens, passwords, payment secrets, and private payloads.
- [ ] Security-sensitive changes include tests.
