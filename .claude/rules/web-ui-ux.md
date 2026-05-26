# Web UI UX Rules

## Constraints
- Route all API calls through frontend services and `api.ts`.
- Show loading, error, and empty states for data-driven UI.
- Format prices with locale separators and `FCFA`.
- Keep order/payment statuses truthful and sourced from backend state.
- Preserve mobile-first responsive behavior for public pages, order tunnel, and dashboard.
- Use `PRODUCT.md` and `DESIGN.md` before UI design/audit work.

## Anti-patterns
- NEVER imply an order is confirmed, paid, processing, or delivered before backend response confirms it. Instead: render pending/intermediate states clearly.
- NEVER hide the next action in the order tunnel. Instead: keep progress and recovery visible.
- NEVER use decorative local-context cliches. Instead: express West African relevance through payment clarity, language, trust, and practical support.

## Verification Checklist
- [ ] Changed UI handles loading/error/empty states.
- [ ] Mobile and desktop layouts do not overlap or truncate key text.
- [ ] Auth expiry and forbidden states remain understandable.
- [ ] Main CTAs and status badges meet WCAG AA contrast.
- [ ] UI changes run through Impeccable audit/polish when substantial.
