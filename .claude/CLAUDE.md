# FRILO Claude Operating System

## Project Purpose
FRILO sells ready-to-customize website templates to entrepreneurs and small businesses in Benin and West Africa. The platform combines a public catalogue, client order/payment journey, dashboard tracking, and custom Laravel admin operations.

## Stack
Backend: Laravel 12, PHP 8.2 platform, MySQL 8, Sanctum, custom Blade admin. Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Axios, Playwright.

## Core Principles
- Preserve order invariants: price snapshot, service-only transitions, immutable terminal states, paid-before-processing.
- Preserve role boundaries: clients see only their own data; `/admin` is session-authenticated `super_admin`.
- Keep API access layered: React page/component -> service -> shared Axios -> Laravel API.
- Treat FedaPay as production-sensitive: signed webhooks, env secrets, auditable state mapping.
- Load context by task, not by scanning all `rules/`.

## HITL Summary
Pause before destructive migrations, deploys, payment credential/callback changes, role/auth model changes, order lifecycle changes, API breaking changes, or deviations from `memory/decisions.md`.

## Context Loading Paths
- New feature end-to-end: this file -> workflow/new-feature -> relevant architecture -> relevant rules -> memory if decisions may change.
- Bug fix: this file -> workflow/bug-fix -> changed files -> relevant rule/architecture -> `/diagnose` if root cause is unclear.
- Database/schema change: this file -> workflow/database-schema-change -> architecture/data-model -> rules/data-model + deployment -> memory.
- External service/API change: this file -> architecture/payments-fedapay or api-contract -> rules/payment-workflow + api-contract + security.
- Data import/pipeline change: no true pipeline; inspect template preview support and data-model rules before adding one.
- Role-scoped surface change: architecture/auth-roles -> rules/role-boundaries + security -> security-rbac-reviewer.
- UI/UX change: `PRODUCT.md` -> `DESIGN.md` -> architecture/frontend-app -> rules/web-ui-ux -> Impeccable wrapper.
- Security-sensitive change: architecture/auth-roles/payments/runtime -> rules/security + deployment -> memory decisions.
- Catalogue/template change: architecture/catalogue-template-preview -> rules/catalogue-templates or template-preview -> matching workflow.
- Backoffice/settings change: architecture/backoffice-admin or platform-settings-notifications -> rules/backoffice-admin or platform-settings.
- Business/docs/recette change: architecture/rules-map -> matching governance/QA rule -> source `rules/` doc.

## External Skills
| Skill | Installed path | Trigger | Post-setup |
|-------|----------------|---------|------------|
| Impeccable | `.agents/skills/impeccable` | UI audit, polish, copy, responsiveness, accessibility | done: `PRODUCT.md`, `DESIGN.md` |
| Matt Pocock skills | `.agents/skills/*` | TDD, diagnosis, architecture review, triage, handoff | done: `docs/agents/*.md` |

## Skill Index
- Core: `backend-feature`, `frontend-surface`, `api-contract-change`, `schema-change`, `qa-verification`.
- Critical domains: `order-workflow-change`, `payment-change`, `platform-settings-change`, `backoffice-admin-change`.
- Product domains: `catalogue-template-change`, `template-preview-integration`, `contact-notification-change`.
- Governance: `business-governance-change`, `rules-doc-sync`, `recette-validation`.
- External wrappers: `impeccable-wrapper`, `mattpocock-wrapper`.

## Workflow Index
- Core: `new-feature-end-to-end`, `bug-fix`, `database-schema-change`, `production-release`.
- Critical: `payment-api-change`, `role-scoped-change`, `platform-settings-change`, `backoffice-admin-change`.
- Product/UI: `ui-ux-change`, `catalogue-template-change`, `template-preview-integration`, `contact-notification-change`.
- Governance/QA: `business-governance-update`, `rules-doc-sync`, `recette-validation`.

## Agent Roster
- Foundational: `workflow-invariant-reviewer`, `security-rbac-reviewer`, `api-contract-reviewer`.
- Critical domain: `payment-webhook-reviewer`, `platform-settings-reviewer`, `backoffice-admin-reviewer`.
- Product surface: `surface-quality-reviewer`, `catalogue-template-reviewer`, `template-preview-reviewer`.
- Governance/QA: `business-governance-reviewer`, `documentation-consistency-reviewer`, `qa-recette-reviewer`.

## Architecture References
- Core: `backend-app.md`, `frontend-app.md`, `data-model.md`, `auth-roles.md`, `runtime-environments.md`, `external-skills.md`, `rules-map.md`.
- Domains: `payments-fedapay.md`, `backoffice-admin.md`, `catalogue-template-preview.md`, `platform-settings-notifications.md`, `business-governance.md`, `qa-recette.md`.

## Rule References
- Core: `code-style.md`, `testing.md`, `deployment.md`, `documentation-governance.md`.
- Critical: `security.md`, `role-boundaries.md`, `api-contract.md`, `data-model.md`, `order-workflow.md`, `payment-workflow.md`.
- Product/admin: `web-ui-ux.md`, `catalogue-templates.md`, `template-preview.md`, `backoffice-admin.md`, `platform-settings.md`, `contact-notifications.md`.
- Governance/QA: `business-governance.md`, `quality-recette.md`.

## Memory
Durable AI-operating decisions live in `memory/decisions.md`. Existing project ADRs remain canonical in `rules/STRATEGY_FOUNDATION/DECISIONS_FRILO.md`.
