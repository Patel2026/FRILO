# Home After Models Square Finish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the public home page after the "Choisissez votre activité" section with a Square-inspired narrative flow.

**Architecture:** Keep the existing `frontend/app/page.tsx` client-side data flow and CMS section anchors. Replace only the presentation of benefits, process, sectors, pricing, testimonials, and FAQ with larger editorial/product blocks that reuse existing content and services.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, existing FRILO public content hooks and business service.

---

### Task 1: Add Shared Visual Helpers

**Files:**
- Modify: `frontend/app/page.tsx`

- [x] Add small presentational helpers for Square-like metric strips and featured sector cards.
- [x] Keep helpers local to the home page and free of API calls.

### Task 2: Recompose Sections After Models

**Files:**
- Modify: `frontend/app/page.tsx`

- [x] Convert benefits into a large white split section with image proof, concrete benefit rows, and a compact "what clients see" panel.
- [x] Convert process into a horizontal step system with a black FRILO work panel.
- [x] Move sectors before pricing and make them an editorial grid, not a long list.
- [x] Make pricing the final decision block before FAQ.
- [x] Keep testimonials as proof, but visually compact so it supports the page instead of interrupting it.
- [x] Keep all existing `renderBlocksFor(...)` calls after matching CMS sections.

### Task 3: Verify And Ship

**Files:**
- Modify: `frontend/app/page.tsx`

- [x] Run `docker exec frilo-frontend npm run qa`.
- [x] Run `docker exec frilo-backend composer qa`.
- [x] Verify `http://localhost:3000/` content is served with all key home sections present. Automated integrated-browser control was unavailable in this resumed context, and local Playwright could not launch a browser under the macOS sandbox.
- [x] Commit and push to `develop`.
