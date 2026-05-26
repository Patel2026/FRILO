# Code Style Rules

## Constraints
- Follow existing Laravel service/controller/request/policy patterns.
- Keep controllers thin and put business rules in services.
- Use FormRequests for validation and Policies for authorization.
- Use TypeScript interfaces/types for API data.
- Keep frontend business API logic inside `frontend/services/*.service.ts`.
- Prefer small, targeted edits over broad refactors.

## Anti-patterns
- NEVER add `any` in TypeScript without a narrow justification. Instead: model the API contract.
- NEVER leave `dd()`, `dump()`, or `console.log()` in committed code. Instead: use structured logging where appropriate.
- NEVER mix unrelated cleanup into feature changes. Instead: create a separate task.

## Verification Checklist
- [ ] PHP code is compatible with Pint/PSR conventions.
- [ ] TypeScript compiles without broad `any` leakage.
- [ ] Business rules stay out of controllers and React components.
- [ ] New helpers match existing local patterns.
