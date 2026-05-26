# Workflow: Business Governance Update

## Trigger
Business execution, roadmap, pricing, SLA, GTM, support, expansion, or backlog governance changes.

## Pre-conditions
Source business intent and owner are known.

## Environment
all

## Steps

### Step 1: Governance Context
- Action       : Load business governance docs and ADRs.
- Skill used   : internal/business-governance-change
- Agent used   : business-governance-reviewer
- HITL required: yes if technical invariants may change
- Output       : Conflict/impact analysis.

### Step 2: Update Docs Or Issues
- Action       : Update governance docs or create local markdown tasks.
- Skill used   : internal/business-governance-change or external/to-issues
- Agent used   : documentation-consistency-reviewer
- HITL required: no after direction confirmed
- Output       : Updated docs/tasks.

### Step 3: Verify Coherence
- Action       : Check BP2026/rules/ADR coherence.
- Skill used   : internal/rules-doc-sync
- Agent used   : business-governance-reviewer
- HITL required: yes if conflicts remain
- Output       : Coherence report.

## Verification Gates
Technical conflicts require human decision.

## Rollback Strategy
Revert doc changes or mark local issue as superseded.

## Post-conditions
Business docs remain actionable and aligned with technical governance.

## Output
Governance summary, conflicts, follow-ups.
