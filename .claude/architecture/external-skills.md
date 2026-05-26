# External Skills Architecture

## Installed Skills
| Skill | Version | Install command | Installed path | Post-setup done |
|-------|---------|-----------------|----------------|-----------------|
| Impeccable | 2026-05-25 install | `npx skills add pbakaus/impeccable` | `.agents/skills/impeccable` | manual setup yes; `npx impeccable teach` returned `Warning: cannot access teach` |
| Matt Pocock skills | 2026-05-25 install | `npx skills add mattpocock/skills` | `.agents/skills/*` | yes |

## Integration Map
| External skill command | Invoked from workflow/skill | Trigger condition |
|------------------------|----------------------------|-------------------|
| `/impeccable audit` | `workflows/ui-ux-change.md` | After UI changes |
| `/impeccable polish` | `skills/frontend-surface/skill.md` | Before shipping UI |
| `/impeccable clarify` | `workflows/ui-ux-change.md` | Copy, labels, errors |
| `/tdd` | `workflows/new-feature-end-to-end.md` | Risky backend or contract work |
| `/diagnose` | `workflows/bug-fix.md` | Unknown root cause |
| `/improve-codebase-architecture` | `skills/mattpocock-wrapper/skill.md` | Architecture review |
| `/handoff` | `workflows/production-release.md` | Human handoff or review |

## Setup Outputs
- `PRODUCT.md` captures FRILO product register and design strategy.
- `DESIGN.md` captures current FRILO UI system.
- `.impeccable/design.json` captures Impeccable design extensions outside the DESIGN.md frontmatter schema.
- `docs/agents/issue-tracker.md` configures local Markdown issues.
- `docs/agents/triage-labels.md` keeps default triage labels.
- `docs/agents/domain.md` configures single-context domain loading.

## Update Protocol
Run `npx skills add pbakaus/impeccable` or `npx skills add mattpocock/skills` again only after human approval. Do not overwrite `PRODUCT.md`, `DESIGN.md`, or `docs/agents/*.md` without review.

## Known Limitations
Impeccable `teach` and Matt setup are prompt-driven in this environment; their setup was completed by writing the expected context files directly. The requested command `npx impeccable teach` was run on 2026-05-25 and returned `Warning: cannot access teach`; the user later invoked `$impeccable teach`, which refreshed `PRODUCT.md`, `DESIGN.md`, and `.impeccable/design.json` through the installed skill workflow. External skill content is not copied into `.claude/`.
