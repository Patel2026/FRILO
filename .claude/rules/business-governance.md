# Business Governance Rules

## Constraints
- Use `rules/BUSINESS_EXECUTION/` for roadmap, GTM, SOP, finance, expansion, and operating rhythm context.
- Preserve technical invariants when business docs conflict, unless a new ADR approves a change.
- Business changes that affect price, SLA, payment, support, or expansion require explicit impact notes.

## Anti-patterns
- NEVER implement roadmap text as code without checking technical rules and ADRs. Instead: translate it into scoped acceptance criteria.
- NEVER change pricing or SLA assumptions silently. Instead: update the relevant business rule and contract docs.

## Verification Checklist
- [ ] Business change references the exact source doc.
- [ ] Technical conflicts are escalated.
- [ ] Impact on product, operations, QA, and release is documented.
