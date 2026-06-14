# Public Content Management Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver complete administration of FRILO public content through four independently deployable phases.

**Architecture:** Build a typed editorial layer beside existing business modules. Protected sections use registered schemas and known React renderers; free blocks use sanitized structured content and three controlled layouts. Existing catalogue, FAQ, reviews, sectors, pricing, and order data remain owned by their current modules.

**Tech Stack:** Laravel 12, PHP 8.2, MySQL 8, Blade admin, Sanctum, Next.js 16, React 19, TypeScript, Tailwind CSS 4, Docker Compose.

---

## Delivery Order

1. Execute [Phase 1: Editorial Foundation](2026-06-14-public-content-phase-1-editorial-foundation.md).
2. Execute [Phase 2: Central Media Library](2026-06-14-public-content-phase-2-media-library.md).
3. Execute [Phase 3: Business Administration and Globals](2026-06-14-public-content-phase-3-business-globals.md).
4. Execute [Phase 4: Complete Public Integration](2026-06-14-public-content-phase-4-public-integration.md).

## Phase Gates

Before beginning the next phase:

- [ ] `docker compose exec backend composer qa` passes.
- [ ] `docker compose exec frontend npm run qa` passes.
- [ ] The phase-specific browser journey passes in the integrated browser.
- [ ] Existing order, payment, catalogue, and authentication behavior remains unchanged.
- [ ] New migrations, seeders, and public API contracts are documented.

## Shared Rules

- Controllers authorize immediately after loading the required entity.
- Controllers contain no content-processing logic.
- Every write flows through a FormRequest, Policy, Service, and Model.
- Frontend components never call `fetch()` directly.
- Public content failures use local fallback content.
- Every content mutation creates a restorable revision and audit event.
- No raw HTML, JavaScript, arbitrary CSS, or unrestricted embeds are stored.
- Existing business data is referenced, never copied into editorial JSON.

