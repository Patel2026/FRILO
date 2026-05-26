# Workflow: Rules Doc Sync

## Trigger
Changes to `rules/`, `.claude/`, ADRs, PRODUCT/DESIGN, or external skill setup docs.

## Pre-conditions
Changed docs and source-of-truth ownership are known.

## Environment
all

## Steps

### Step 1: Source Audit
- Action       : Load rules map and documentation governance.
- Skill used   : internal/rules-doc-sync
- Agent used   : documentation-consistency-reviewer
- HITL required: yes if source-of-truth conflict exists
- Output       : Source audit.

### Step 2: Sync References
- Action       : Update indexes, pointers, and context loading paths.
- Skill used   : internal/rules-doc-sync
- Agent used   : none
- HITL required: no
- Output       : Synced docs.

### Step 3: Verify Docs
- Action       : Check line limits, duplicate content, and stale references.
- Skill used   : internal/qa-verification
- Agent used   : documentation-consistency-reviewer
- HITL required: no
- Output       : Docs verification.

## Verification Gates
`.claude/CLAUDE.md` must stay under 150 lines.

## Rollback Strategy
Revert doc routing changes only.

## Post-conditions
Docs route to canonical sources without duplication.

## Output
Reference map and consistency status.
