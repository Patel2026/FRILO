# FRILO Claude Operating System

FRILO is a fullstack platform for selling, ordering, paying for, and delivering website templates/services. The system has a public catalog, a Sanctum-token client dashboard, and a Laravel custom admin backoffice.

Primary stack: Laravel 12 / PHP 8.2 / MySQL 8 / Next.js 16 / React 19 / TypeScript / Tailwind CSS 4 / Sanctum / custom Blade admin.

## Operating Principles

- Load context by task type; do not read all governance files at session start.
- Preserve the order workflow invariants: status transitions through `OrderService`, terminal states immutable, price snapshot never changed.
- Preserve role boundaries: public, client, and admin surfaces never leak data across scopes.
- Keep controllers and React components thin; business logic belongs in Laravel Services and frontend service modules.
- Declare assumptions, HITL gates, and verification before changing high-risk areas.

## HITL Gates

Human approval is required before changing auth, RBAC, payments, public API contracts, production config, order status transitions, migrations, destructive data actions, or any documented decision in `memory/decisions.md`.

## Context Loading Paths

- New feature: this file -> `rules/OPERATIONS_GOVERNANCE/AGENT_CONTRACT_FRILO.md` -> relevant `.claude/workflows/feature-development.md` -> domain architecture/rules.
- Bug fix: this file -> `.claude/workflows/bugfix.md` -> failing test/log -> touched domain rules.
- Database/schema change: this file -> `.claude/workflows/schema-change.md` -> `.claude/architecture/data-model.md` -> `rules/PRODUCT_SPEC/DATA_MODEL_FRILO.md`.
- Auth/RBAC/security: this file -> `.claude/workflows/auth-security-change.md` -> `.claude/rules/security-rbac.md` -> `rules/SECURITY_ACCESS/MASTER_SECURITY_FRILO.md`.
- Order workflow: this file -> `.claude/rules/order-workflow.md` -> `.claude/architecture/backend-app.md` -> `rules/WORKFLOW_ENGINE/WORKFLOW_COMMANDE_FRILO.md`.
- UI/UX change: this file -> `.claude/workflows/ui-change.md` -> `.claude/rules/frontend-data-flow.md` -> `rules/UI_UX_GUIDELINES/CHARTE_GRAPHIQUE_FRILO.md`.
- Release readiness: this file -> `.claude/workflows/release-readiness.md` -> `rules/OPERATIONS_GOVERNANCE/RUNBOOK_RELEASE_ROLLBACK_V1_FRILO.md`.

## External Skills

- Karpathy guidelines: project `CLAUDE.md`; active on every task; installed 2026-06-17.
- Superpowers: environment/plugin; use brainstorming, TDD, debugging, planning, verification before substantial work.
- Impeccable: `.agents/skills/impeccable`; use for UI audit, polish, critique, harden. `PRODUCT.md`, `DESIGN.md`, and live config initialized on 2026-06-17.
- OWASP Security: `.claude/skills/owasp-security`; use for auth, RBAC, payment, input handling, public API, or security review.
- Varlock: personal `~/.claude/skills/varlock`; use before handling `.env`, secrets, API keys, credentials, or sensitive config.
- Anthropic frontend-design: not installed; HTTPS and SSH installs failed with GitHub authentication on 2026-06-17, and skills search returned no official public match.

## Skill Index

- `order-change`: any change touching orders, payments, production status, delivery, or instructions.
- `api-contract-change`: any Laravel endpoint or frontend service contract change.
- `ui-change`: any public, dashboard, or admin interface change.
- `security-change`: any auth, RBAC, validation, secret, CORS, webhook, or payment-sensitive change.
- `external-impeccable`: wrapper for Impeccable UI review.
- `external-owasp-security`: wrapper for OWASP review.
- `external-varlock`: wrapper for secret handling.
- `external-superpowers`: wrapper for Superpowers workflows.

## Workflow Index

- `feature-development`: multi-file product or technical feature.
- `bugfix`: reproducible defect or regression.
- `schema-change`: migrations, model relationships, indexes, constraints.
- `auth-security-change`: auth, RBAC, payments, webhooks, sensitive config.
- `ui-change`: public/client/admin UI work.
- `release-readiness`: pre-merge or pre-release verification.

## Agent Roster

- `order-workflow-reviewer`: status transitions, payment gates, price snapshot, immutability.
- `security-rbac-reviewer`: auth, Sanctum, role scope, secrets, access control.
- `api-contract-reviewer`: Laravel API and Next.js services alignment.
- `surface-quality-reviewer`: UI truthfulness, role-specific journeys, copy/data integrity.
- `qa-regression-reviewer`: test coverage, QA commands, residual risk.

## References

- Root governance: `CLAUDE.md`, `AGENTS.md`, `rules/INDEX.md`.
- Durable decisions: `.claude/memory/decisions.md`.
- Architecture map: `.claude/architecture/`.
- Operational rules: `.claude/rules/`.
