---
name: rules-doc-sync
description: Synchronize .claude guidance with FRILO rules docs without duplicating canonical governance content.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: rules-doc-sync

## Description
Keep `.claude/` routing aligned with `rules/` and ADRs.

## Trigger Condition
Use when adding/changing governance docs, ADRs, `.claude/` rules, or documentation index files.

## Inputs Required
- Changed governance files.
- Intended source of truth.

## Steps
1. Load rules map and documentation governance rules.
2. Inspect source `rules/` docs and `.claude/` references.
3. Update routing/indexes, not duplicated content.
4. Invoke documentation consistency reviewer.
5. Verify `.claude/CLAUDE.md` stays under 150 lines.

## Verification Steps
- [ ] Source of truth is clear.
- [ ] No long duplicated rule content.
- [ ] Context loading paths remain accurate.
- [ ] Conflicts are documented.

## Output Format
Docs changed, references updated, conflicts, reviewer status.

## Failure Handling
Pause on governance conflicts or uncertain source-of-truth ownership.

## Skill Dependencies
Invoke `documentation-consistency-reviewer`.

## Feedback Loop
Max iterations : 2
Exit condition : Reviewer SAFE and indexes validate.
Escalate when : ADR/rule conflict exists.
