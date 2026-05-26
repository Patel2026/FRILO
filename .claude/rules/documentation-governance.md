# Documentation Governance Rules

## Constraints
- Existing canonical ADRs remain in `rules/STRATEGY_FOUNDATION/DECISIONS_FRILO.md`.
- `.claude/memory/decisions.md` stores AI-operating decisions only.
- Update `rules/INDEX.md` when adding new governance docs under `rules/`.
- Do not duplicate long `rules/` content inside `.claude/`; route to it.

## Anti-patterns
- NEVER resolve a governance conflict silently. Instead: document the conflict and ask for HITL.
- NEVER let `.claude/` become a stale copy of `rules/`. Instead: keep short operational summaries and links.

## Verification Checklist
- [ ] New decisions are stored in the correct decision log.
- [ ] Rule references point to source docs.
- [ ] `.claude/CLAUDE.md` remains under 150 lines.
- [ ] No duplicated external skill content exists.
