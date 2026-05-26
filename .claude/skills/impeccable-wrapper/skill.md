---
name: impeccable-wrapper
description: Wrapper invoking Impeccable commands for FRILO UI quality using PRODUCT.md and DESIGN.md.
allowed-tools: Read
---

# External Skill: Impeccable

## Source
Installed via: `npx skills add pbakaus/impeccable`
Commands: `/impeccable audit`, `/impeccable polish`, `/impeccable clarify`, `/impeccable adapt`, `/impeccable document`

## When to Invoke
Invoke for public site, order tunnel, dashboard, UI copy, responsive layout, accessibility, or component quality work.

## How to Invoke
Run `/impeccable <command> <target>` in Claude Code.
Provide: target route/component, changed files, user role, relevant API states, `PRODUCT.md`, and `DESIGN.md`.

## Expected Output
Audit or design guidance with PASS/NEEDS CHANGES, concrete issues, and refinement steps.

## Integration Points
Used in workflows: `ui-ux-change`, `new-feature-end-to-end`.
Extends internal skill: `frontend-surface`.
