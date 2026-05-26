# Workflow: Catalogue Template Change

## Trigger
Sector, template, catalogue API, seeder, or catalogue UI changes.

## Pre-conditions
Affected catalogue entity and surface are known.

## Environment
all

## Steps

### Step 1: Catalogue Context
- Action       : Load catalogue architecture/rules and source product specs.
- Skill used   : internal/catalogue-template-change
- Agent used   : catalogue-template-reviewer
- HITL required: yes if pricing/orderability/deletion semantics change
- Output       : Risk map.

### Step 2: Implement
- Action       : Update model/controller/admin/seeder/frontend as scoped.
- Skill used   : internal/catalogue-template-change
- Agent used   : none
- HITL required: no
- Output       : Patch.

### Step 3: Verify
- Action       : Run targeted backend/frontend checks.
- Skill used   : internal/qa-verification
- Agent used   : catalogue-template-reviewer
- HITL required: no
- Output       : Verification result.

## Verification Gates
Inactive template visibility and orderability must be verified.

## Rollback Strategy
Revert catalogue patch and restore previous seeder/admin mapping.

## Post-conditions
Catalogue remains consistent and order-safe.

## Output
Catalogue change summary and checks.
