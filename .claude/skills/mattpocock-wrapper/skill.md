---
name: mattpocock-wrapper
description: Wrapper invoking Matt Pocock engineering skills for FRILO diagnosis, TDD, architecture, triage, and handoff.
allowed-tools: Read
---

# External Skill: Matt Pocock Skills

## Source
Installed via: `npx skills add mattpocock/skills`
Commands: `/diagnose`, `/tdd`, `/improve-codebase-architecture`, `/triage`, `/to-issues`, `/to-prd`, `/handoff`, `/zoom-out`

## When to Invoke
Invoke for unclear bugs, test-first work, architecture review, local markdown issue generation, PRD/spec creation, and handoffs.

## How to Invoke
Run the relevant slash command in Claude Code.
Provide: task scope, relevant `.claude/` context path, local markdown issue convention, and affected files.

## Expected Output
Structured diagnosis, TDD loop, architecture report, issue files, PRD, or handoff notes.

## Integration Points
Used in workflows: `bug-fix`, `new-feature-end-to-end`, `production-release`.
Extends internal skills: `backend-feature`, `schema-change`, `qa-verification`.
