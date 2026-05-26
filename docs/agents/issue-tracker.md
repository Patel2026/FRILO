# Issue Tracker

## Mode
Local markdown.

## Location
Issues, task breakdowns, and triage outputs live under:

```text
.scratch/<feature-or-ticket>/
```

## File Conventions
- Use `issue.md` for a single work item.
- Use `prd.md` for product requirements.
- Use `triage.md` for triage notes and status.
- Use `handoff.md` when passing work between humans and agents.

## Required Fields
- Status
- Summary
- Context
- Acceptance criteria
- Verification plan
- Links to relevant code, rules, or ADRs

## Agent Rules
- Do not create GitHub Issues for FRILO unless the user explicitly asks.
- Do not store secrets, payment credentials, or customer private data in `.scratch/`.
- Link to existing rules under `rules/` instead of copying long governance text.
