# Workflow: Template Preview Integration

## Trigger
Adding or changing local/external template previews.

## Pre-conditions
Template folder or external URL is known.

## Environment
all

## Steps

### Step 1: Preview Audit
- Action       : Inspect `/template`, preload script, manifest expectations, admin mapping.
- Skill used   : internal/template-preview-integration
- Agent used   : template-preview-reviewer
- HITL required: yes if folder deliverability is ambiguous
- Output       : Preview plan.

### Step 2: Integrate
- Action       : Update preview mapping, seeder, admin, or frontend.
- Skill used   : internal/template-preview-integration
- Agent used   : none
- HITL required: no
- Output       : Preview patch.

### Step 3: Visual/Functional Check
- Action       : Verify preview URL/pages and run UI audit if public surface changes.
- Skill used   : internal/qa-verification and external/impeccable
- Agent used   : template-preview-reviewer
- HITL required: no
- Output       : Preview verification.

## Verification Gates
Do not expose non-deliverable folders or fake preview links.

## Rollback Strategy
Remove preview mapping and restore prior template preview config.

## Post-conditions
Preview loads inside FRILO and maps to real deliverable files.

## Output
Preview mapping, verification, gaps.
