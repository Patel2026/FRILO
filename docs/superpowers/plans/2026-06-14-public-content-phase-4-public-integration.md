# Public Content Phase 4 Complete Public Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect every remaining public page and page family to the editorial API while preserving dedicated business data and resilient fallbacks.

**Architecture:** Migrate one route family at a time. Each route loads its typed editorial page record, maps protected renderer IDs to known components, inserts free blocks at registered anchors, and keeps business collections in existing services. Hardcoded editorial copy is removed only after API, fallback, QA, and browser coverage pass for that route family.

**Tech Stack:** Next.js 16, React 19, TypeScript, Laravel public-content API.

---

### Task 1: Register and seed every remaining public page

**Files:**
- Modify: `backend/config/public-content.php`
- Modify: `backend/database/seeders/PublicContentSeeder.php`
- Test: `backend/tests/Unit/PublicContentRegistryTest.php`

- [ ] Register page keys and protected sections for expertises, contact, FAQ, sectors, sector detail, templates, template detail, comparison, preview shell, order, CGU, and legal notices.
- [ ] Seed current public copy exactly as initial content.
- [ ] Verify repeated seeding preserves administrator changes and creates only missing records.
- [ ] Commit with `feat(content): register remaining public pages`.

### Task 2: Migrate institutional pages

**Files:**
- Modify: `frontend/app/expertises/page.tsx`
- Modify: `frontend/app/contact/page.tsx`
- Modify: `frontend/app/faq/page.tsx`
- Modify: `frontend/app/cgu/page.tsx`
- Modify: `frontend/app/mentions-legales/page.tsx`
- Create: `frontend/content/institutional.fallback.ts`
- Create: `frontend/components/content/institutional/*`
- Test: `frontend/tests/e2e/public-content-institutional.spec.ts`

- [ ] Load protected content and free blocks through public-content services.
- [ ] Keep FAQ records and contact submission in their existing services.
- [ ] Generate essential SEO metadata from managed page content with fallback.
- [ ] Verify every page under API success and API failure.
- [ ] Commit with `feat(content): manage institutional public pages`.

### Task 3: Migrate catalogue and sector route families

**Files:**
- Modify: `frontend/app/secteurs/page.tsx`
- Modify: `frontend/app/secteurs/[slug]/page.tsx`
- Modify: `frontend/app/templates/page.tsx`
- Modify: `frontend/app/templates/compare/page.tsx`
- Create: `frontend/content/catalog.fallback.ts`
- Create: `frontend/components/content/catalog/*`
- Test: `frontend/tests/e2e/public-content-catalog.spec.ts`

- [ ] Keep `Sector` and `Template` records in `businessService`.
- [ ] Move only introductions, helper copy, empty states, and calls to action to protected sections.
- [ ] Preserve category filters, search, comparison, favorites, pricing, and active-record rules.
- [ ] Verify mobile and desktop catalogue behavior.
- [ ] Commit with `feat(content): manage catalogue editorial content`.

### Task 4: Migrate template detail and preview shell

**Files:**
- Modify: `frontend/app/templates/[id]/page.tsx`
- Modify: `frontend/app/templates/[id]/preview/page.tsx`
- Create: `frontend/content/template-detail.fallback.ts`
- Create: `frontend/components/content/template/*`
- Test: `frontend/tests/e2e/public-content-template.spec.ts`

- [ ] Keep template data, previews, reviews, eligibility, favorites, and comparison in their existing modules.
- [ ] Manage supporting headings, explanations, trust copy, and CTA labels editorially.
- [ ] Preserve preview iframe safety and command links.
- [ ] Commit with `feat(content): manage template presentation copy`.

### Task 5: Migrate the public order workflow

**Files:**
- Modify: `frontend/app/commande/page.tsx`
- Create: `frontend/content/order.fallback.ts`
- Create: `frontend/components/content/order/*`
- Test: `frontend/tests/e2e/public-content-order.spec.ts`

- [ ] Keep workflow state, validation, authentication, options, order creation, and payment logic unchanged.
- [ ] Move only headings, helper copy, support copy, included-service labels, and confirmation copy into protected sections.
- [ ] Prevent editorial content from changing prices, status transitions, or payment behavior.
- [ ] Verify the three-moment order journey and fallback mode.
- [ ] Commit with `feat(content): manage public order copy`.

### Task 6: Add complete SEO metadata integration

**Files:**
- Create: `frontend/lib/publicMetadata.ts`
- Modify: public route layouts/pages that export metadata
- Test: `frontend/tests/e2e/public-content-seo.spec.ts`

- [ ] Generate title, description, Open Graph image, and robots index/noindex from managed page SEO.
- [ ] Use stable defaults when API or SEO fields are missing.
- [ ] Ensure dynamic route metadata combines managed page-family SEO with the current sector/template name.
- [ ] Commit with `feat(content): connect managed public SEO`.

### Task 7: Remove migrated duplicated copy and complete regression verification

**Files:**
- Modify: fallback/content/page files touched in Tasks 2-5
- Modify: `frontend/tests/e2e/critical-path.spec.ts`
- Modify: `frontend/tests/e2e/client-experience.spec.ts`
- Modify: `frontend/tests/e2e/public-content*.spec.ts`

- [ ] Confirm each migrated page has seeded content, local fallback, and browser coverage before removing inline duplicate copy.
- [ ] Verify admin edit appears immediately on each route family.
- [ ] Verify revision restore returns the previous public output.
- [ ] Verify API failure leaves every public route usable.
- [ ] Run:

```bash
docker compose exec backend composer qa
docker compose exec frontend npm run qa
docker compose exec frontend npm run e2e
```

- [ ] Test desktop and mobile in the integrated browser.
- [ ] Commit with `feat(content): complete public content integration`.

