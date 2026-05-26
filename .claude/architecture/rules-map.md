# Rules Map Architecture

## Purpose
Map the existing `rules/` corpus so Claude loads the right governance files only when the task requires them.

## Current Implementation
- `rules/INDEX.md` is the entry point.
- Strategy and ADRs live in `rules/STRATEGY_FOUNDATION/`.
- Technical architecture and contracts live in `rules/PRODUCT_SPEC/`.
- Business execution lives in `rules/BUSINESS_EXECUTION/`.
- Security lives in `rules/SECURITY_ACCESS/`.
- Order workflow lives in `rules/WORKFLOW_ENGINE/`.
- Admin design lives in `rules/BACKOFFICE_DESIGN/`.
- Operations and release runbooks live in `rules/OPERATIONS_GOVERNANCE/`.
- QA references live in `rules/QUALITY_ASSURANCE/`.

## Dependencies And Integration Points
- `.claude/CLAUDE.md` uses this file for context routing.
- `.claude/rules/documentation-governance.md` defines update behavior.

## Known Risks
- Loading all `rules/` files creates context noise.
- Some older references mention Filament/admin while ADR-012 confirms custom Laravel admin.

## Change Impact
Any new governance domain should update this map and `.claude/CLAUDE.md`.

## Environment-Specific Behavior
None.
