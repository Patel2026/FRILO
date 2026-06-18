# Public Home Square-Inspired Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the FRILO home page into a Square-inspired, image-led public landing page without breaking dynamic content or order routes.

**Architecture:** Keep the existing `frontend/app/page.tsx` data flow and CMS anchors. Replace the page composition and section styling in place so the change is scoped to the home route. Add small local helper components inside the same file only when they reduce duplication for public sections.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, existing FRILO services/hooks.

---

### Task 1: Home Section Composition

**Files:**
- Modify: `frontend/app/page.tsx`

- [x] Replace the current dark-card hero with a full-bleed image hero using `/image/client-satisfait-frilo.jpg`, white text, and existing `hero` CMS CTAs.
- [x] Add a horizontal sector/business rail under the hero using loaded sectors and fallback business labels when data is not yet loaded.
- [x] Convert models into a gallery section with large image tiles, fewer borders, and clear CTA links.
- [x] Preserve all existing `renderBlocksFor(...)` calls after their matching section.

### Task 2: Supporting Sections

**Files:**
- Modify: `frontend/app/page.tsx`

- [x] Restyle benefits, process, pricing, testimonials, sectors, FAQ, and closing CTA with white base, black typography, simple borders, and larger image-led/rail-like layouts.
- [x] Keep loading, empty, and catalog error states.
- [x] Keep all existing links and dynamic labels.

### Task 3: Motion And QA

**Files:**
- Modify: `frontend/app/page.tsx`
- Optionally modify: `frontend/app/globals.css` only if a reusable reduced-motion-safe utility is needed.

- [x] Add subtle CSS-only transitions: image hover scale, CTA hover, accordion open/close, no content hidden by animation.
- [x] Verify desktop and mobile in the integrated browser.
- [x] Run `docker exec frilo-frontend npm run qa`.
- [ ] Commit the finished home redesign.
