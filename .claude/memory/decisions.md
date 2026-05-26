# Decisions

## 2026-05-25 — External Skills Selected
Decision  : Install Impeccable and Matt Pocock skills for FRILO.
Rationale : FRILO is a fullstack Laravel/Next.js product with a real UI surface, payment workflow, tests, and architecture constraints.
Impact    : UI workflows reference Impeccable; engineering workflows reference Matt Pocock skills. External skill content is referenced, not duplicated.

## 2026-05-25 — Local Markdown Issue Tracker
Decision  : Matt Pocock skills use local markdown under `.scratch/<feature-or-ticket>/`.
Rationale : The user selected local markdown instead of GitHub Issues for FRILO task tracking.
Impact    : `to-issues`, `triage`, and handoff outputs must write local files unless the user explicitly requests GitHub.

## 2026-05-25 — Product Register For UI Work
Decision  : FRILO uses Impeccable register `product`.
Rationale : The platform has a commercial public surface, but the core design job is making ordering, payment, dashboard, and admin workflows trustworthy and efficient.
Impact    : UI changes optimize clarity, trust, and task completion before brand spectacle.

## 2026-05-25 — Custom Admin Is Current V1 Truth
Decision  : Treat Laravel custom Blade admin under `/admin` as the current admin implementation.
Rationale : Existing ADR-012 supersedes the earlier Filament decision for V1.
Impact    : Do not introduce Filament assumptions without a new human-approved ADR.

## 2026-05-25 — Cover Rules Corpus By Domain
Decision  : `.claude/` covers the full existing `rules/` corpus by domain-specific architecture, rules, skills, workflows, and agents.
Rationale : FRILO already has extensive governance docs; future Claude sessions need contextual routing rather than broad full-corpus loading.
Impact    : Add new `.claude/` routing when a new `rules/` domain appears, but do not duplicate long canonical rule content.
