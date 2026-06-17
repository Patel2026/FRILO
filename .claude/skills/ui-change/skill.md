---
name: ui-change
description: Use for public website, client dashboard, admin interface, component, layout, or UX changes in FRILO.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: ui-change

## Description

Make UI changes while preserving FRILO data truthfulness, role boundaries, and service-based data flow.

## Trigger Condition

Invoke for edits in `frontend/app`, `frontend/components`, `frontend/services` when UI-facing, or backend Blade admin views/resources.

## Inputs Required

- Surface: public, client dashboard, admin, or shared component.
- User role and workflow.
- Data source or endpoint.

## Steps

1. Load `.claude/rules/frontend-data-flow.md`.
2. Load `rules/UI_UX_GUIDELINES/CHARTE_GRAPHIQUE_FRILO.md` if visual style is relevant.
3. Read affected components/pages/services.
4. Ensure UI data comes from services or approved server public helpers.
5. Implement the smallest UI change that satisfies the request.
6. Invoke `surface-quality-reviewer`.
7. Invoke external Impeccable for meaningful visual changes.
8. Run frontend QA or focused lint/typecheck/build.

## Verification Steps

- [ ] Loading, error, empty, and success states are preserved.
- [ ] Role-specific data is not leaked.
- [ ] No duplicated Axios instance or direct client fetch was added.
- [ ] Visual change is responsive and text fits containers.

## Output Format

Return changed surfaces, role impact, screenshots/tests if available, and Impeccable status if used.

## Failure Handling

If visual requirements are unclear, ask before styling. If API data is missing, use `api-contract-change` rather than inventing client-only behavior.

## Skill Dependencies

External: Impeccable. After: `surface-quality-reviewer`, `qa-regression-reviewer`.

## Feedback Loop

Max iterations : 3
Exit condition : UI reviewer SAFE/WARN with accepted risk and frontend verification passes.
Escalate when : UX change alters order, payment, auth, or admin workflows.
