# FRILO AI-Native Decisions

Durable decisions only. Do not store transient task notes here.

## 2026-06-17 - Repository Reality Overrides Historical Prompt Drift

Decision  : Treat FRILO as Laravel 12 / PHP 8.2 / Next.js 16 / React 19 / Tailwind CSS 4 / custom Blade admin.
Rationale : Composer, package files, routes, and current `AGENTS.md` confirm this stack; older prompt text referenced Laravel 11, PHP 8.3, and Filament.
Impact    : Future agents must not introduce Filament or Laravel 11 assumptions without explicit human approval.

## 2026-06-17 - .claude Is Team-Shareable, .agents Remains Local

Decision  : Version `.claude/` and keep `.agents/` ignored.
Rationale : `.claude/` contains project-specific orchestration and should travel with the repo; installed tool payloads can be large/local and are represented through wrappers.
Impact    : External skill wrappers document invocation but do not duplicate installed skill content.

## 2026-06-17 - External Skills Selected

Decision  : Use Karpathy Guidelines, Superpowers, Impeccable, OWASP Security, and Varlock for FRILO.
Rationale : FRILO is fullstack, UI-present, security-sensitive, payment-aware, and governance-heavy.
Impact    : Workflows must invoke these skills at the right gates and record pending setup status where applicable.

## 2026-06-17 - Anthropic Frontend Design Pending

Decision  : Do not reference `anthropics/frontend-design` as installed.
Rationale : `npx skills add anthropics/frontend-design` and the SSH retry `npx skills add git@github.com:anthropics/frontend-design.git` both failed with GitHub authentication; `npx skills search frontend-design` did not return an official Anthropic public match.
Impact    : UI workflows use Impeccable as the installed design skill until this is resolved.

## 2026-06-17 - Impeccable Project Context Initialized

Decision  : Create versioned `PRODUCT.md` and `DESIGN.md` for FRILO and keep `.impeccable/live/config.json` local.
Rationale : `PRODUCT.md` and `DESIGN.md` are reusable team context for UI/design agents; live mode config is local AI tooling and remains ignored.
Impact    : Future UI work should load `PRODUCT.md` and `DESIGN.md` before using Impeccable commands.
