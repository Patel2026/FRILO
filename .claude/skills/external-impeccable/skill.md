---
name: external-impeccable
description: Wrapper invoking Impeccable for FRILO UI audit, polish, critique, or hardening.
allowed-tools: Read
---

# External Skill: Impeccable

## Source

Installed via: `npx skills add pbakaus/impeccable`
Location: `.agents/skills/impeccable`
Commands: `/impeccable audit`, `/impeccable polish`, `/impeccable critique`, `/impeccable harden`, `/impeccable teach`

## When to Invoke

Use after meaningful UI changes in public pages, order tunnel, client dashboard, or admin screens.

## How to Invoke

Run the relevant `/impeccable` command on the changed surface. Provide role, URL/path, target viewport, changed files, and FRILO design constraints.

## Expected Output

Audit/polish report with PASS or NEEDS CHANGES, including layout, hierarchy, accessibility, responsiveness, and copy/data truthfulness concerns.

## Integration Points

Used in workflows: `ui-change`, `release-readiness`.
Replaces or extends internal skill: extends `ui-change`.
