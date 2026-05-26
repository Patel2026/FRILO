---
name: recette-validation
description: Validate FRILO changes against functional recette, E2E critical paths, and Definition of Done.
allowed-tools: Read, Bash, Glob, Grep
---

# Skill: recette-validation

## Description
Map a completed change to FRILO acceptance, recette, E2E, and DoD checks.

## Trigger Condition
Use before release, after feature completion, or when user asks for recette/QA validation.

## Inputs Required
- Changed files.
- Feature or bug scope.

## Steps
1. Load QA architecture/rules and source checklist.
2. Identify relevant checklist sections.
3. Map automated and manual checks.
4. Run available checks or document why skipped.
5. Invoke QA recette reviewer.

## Verification Steps
- [ ] Relevant checklist sections are named.
- [ ] Automated checks are run where feasible.
- [ ] Manual checks are listed.
- [ ] Remaining risks are explicit.

## Output Format
Recette matrix, commands run, pass/fail, manual gaps.

## Failure Handling
If critical checks cannot run, escalate before production handoff.

## Skill Dependencies
Extends `qa-verification`; invokes `qa-recette-reviewer`.

## Feedback Loop
Max iterations : 2
Exit condition : Recette reviewer SAFE or gaps accepted by human.
Escalate when : Auth, payment, order, admin, or release recette is incomplete.
