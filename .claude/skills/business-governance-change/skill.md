---
name: business-governance-change
description: Update FRILO business governance, roadmap, SOP, pricing, SLA, or expansion docs while preserving technical invariants.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: business-governance-change

## Description
Change business execution docs and translate business intent into safe technical implications.

## Trigger Condition
Use for `rules/BUSINESS_EXECUTION`, backlog, project charter, pricing, SLA, expansion, roadmap, or BP2026 alignment.

## Inputs Required
- Business document or decision.
- Expected operational impact.

## Steps
1. Load business governance architecture/rules and source business docs.
2. Check conflicts against technical rules and ADRs.
3. Update docs or create local issue/spec.
4. Identify downstream code/QA/release implications.
5. Invoke business governance review.

## Verification Steps
- [ ] Source doc and affected docs are named.
- [ ] Conflicts with technical invariants are escalated.
- [ ] Pricing/SLA changes are explicit.
- [ ] Follow-up work is captured.

## Output Format
Business change summary, conflicts, downstream tasks, reviewer status.

## Failure Handling
Pause if business request contradicts security, order workflow, payment, or ADRs.

## Skill Dependencies
Invoke `business-governance-reviewer` and optionally external `/to-issues`.

## Feedback Loop
Max iterations : 2
Exit condition : Governance reviewer SAFE or HITL decision recorded.
Escalate when : Business change alters technical invariants or contracts.
