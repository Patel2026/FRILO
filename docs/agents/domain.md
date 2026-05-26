# Domain Docs

## Layout
Single-context repository.

## Primary Context Sources
- `CLAUDE.md`
- `.claude/CLAUDE.md`
- `rules/INDEX.md`
- `rules/STRATEGY_FOUNDATION/DECISIONS_FRILO.md`

## Domain Reading Order
1. Load the task-specific `.claude/CLAUDE.md` path.
2. Load only the relevant `.claude/rules/*.md` and `.claude/architecture/*.md`.
3. Use `rules/INDEX.md` to locate deeper governance only when the task needs it.
4. Load `rules/STRATEGY_FOUNDATION/DECISIONS_FRILO.md` before changing architecture, auth, payment, admin, or workflow decisions.

## ADR Location
The canonical existing ADR log is:

```text
rules/STRATEGY_FOUNDATION/DECISIONS_FRILO.md
```

`.claude/memory/decisions.md` stores AI-operating decisions and pointers, not a duplicate ADR registry.

## Agent Rules
- Do not scan all `rules/` files at session start.
- Do not treat outdated Filament references as current truth without checking ADR-012.
- Prefer current code and validated ADRs over older roadmap text when they conflict.
