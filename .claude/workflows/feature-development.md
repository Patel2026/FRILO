# Workflow: Feature Development

## Trigger

Start when a requested feature touches more than one file, changes behavior, or crosses backend/frontend/admin boundaries.

## Pre-conditions

Scope, affected role, impacted domain, expected outcome, and verification path are known.

## Environment

all

## Steps

### Step 1: Discovery
- Action       : Load `.claude/CLAUDE.md`, relevant architecture, and relevant rule files.
- Skill used   : external/superpowers
- Agent used   : none
- HITL required: yes if scope is unclear or high-risk
- Output       : Assumptions, scope, affected files, risk level.

### Step 2: Plan
- Action       : List every file to create, modify, or delete.
- Skill used   : external/superpowers
- Agent used   : none
- HITL required: yes for multi-file work
- Output       : Approved implementation plan.

### Step 3: Domain Execution
- Action       : Use `order-change`, `api-contract-change`, `ui-change`, or `security-change` based on domain.
- Skill used   : internal/domain skill
- Agent used   : domain reviewer
- HITL required: yes for auth, RBAC, payment, schema, public API, or order workflow behavior changes
- Output       : Implemented change with reviewer result.

### Step 4: QA
- Action       : Run focused tests and required QA commands.
- Skill used   : external/superpowers
- Agent used   : qa-regression-reviewer
- HITL required: no unless verification is blocked
- Output       : Verification evidence.

## Verification Gates

Plan approval before Step 3. Domain reviewer SAFE/WARN before Step 4. QA evidence before completion.

## Rollback Strategy

Revert only files changed by this workflow. For migrations, create a corrective migration; do not edit applied migrations.

## Post-conditions

Implementation matches approved scope, tests are run or blockers documented, and residual risks are stated.

## Output

Changed files, behavior summary, tests, reviewers, HITL approvals, residual risk.
