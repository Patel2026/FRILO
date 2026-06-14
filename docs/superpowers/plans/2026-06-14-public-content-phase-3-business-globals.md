# Public Content Phase 3 Business Administration and Globals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add missing order-option administration and manage global public navigation, footer, support, social, CTA, and legal presentation.

**Architecture:** Keep `OrderOption` as a business module with its own CRUD and service. Store global editorial structures as validated protected content under a dedicated `globals` page key and expose them through `/api/public/globals`. Header and footer consume globals with local fallbacks.

**Tech Stack:** Laravel 12, Blade admin, Next.js 16, React 19.

---

### Task 1: Complete the OrderOption business administration flow

**Files:**
- Create: `backend/app/Services/OrderOptionService.php`
- Create: `backend/app/Http/Requests/Admin/StoreOrderOptionRequest.php`
- Create: `backend/app/Http/Requests/Admin/UpdateOrderOptionRequest.php`
- Create: `backend/app/Http/Controllers/Admin/OrderOptionController.php`
- Create: `backend/resources/views/admin/order-options/index.blade.php`
- Create: `backend/resources/views/admin/order-options/create.blade.php`
- Create: `backend/resources/views/admin/order-options/edit.blade.php`
- Create: `backend/resources/views/admin/order-options/_form.blade.php`
- Modify: `backend/routes/web.php`
- Modify: `backend/resources/views/layouts/sidebar.blade.php`
- Test: `backend/tests/Feature/Admin/OrderOptionAdminTest.php`

- [ ] Test super-admin CRUD, client rejection, ordering, activation, and price validation.
- [ ] Implement create/update/deactivate through `OrderOptionService` and audit every mutation.
- [ ] Never physically delete an option referenced by an order snapshot; deactivate it.
- [ ] Verify public `/api/order-options` returns only active ordered options.
- [ ] Commit with `feat(order-options): add admin management`.

### Task 2: Register and seed global public content

**Files:**
- Modify: `backend/config/public-content.php`
- Modify: `backend/database/seeders/PublicContentSeeder.php`
- Test: `backend/tests/Unit/PublicContentRegistryTest.php`

- [ ] Register `globals.header`, `globals.footer`, `globals.support`, `globals.social`, `globals.ctas`, and `globals.legal`.
- [ ] Define strict internal-link keys and validated external URL fields.
- [ ] Seed current Header/Footer/support/legal copy as defaults.
- [ ] Commit with `feat(content): register global public content`.

### Task 3: Expose and administer globals

**Files:**
- Create: `backend/app/Http/Controllers/Api/PublicGlobalsController.php`
- Modify: `backend/routes/api.php`
- Modify: `backend/resources/views/admin/content/pages/edit.blade.php`
- Test: `backend/tests/Feature/Api/PublicGlobalsApiTest.php`
- Test: `backend/tests/Feature/Admin/PublicContentAdminTest.php`

- [ ] Test that globals expose only visible validated items and never arbitrary application routes.
- [ ] Add `GET /api/public/globals`.
- [ ] Present global sections under `Contenu du site → Éléments globaux`.
- [ ] Commit with `feat(content): expose global public content`.

### Task 4: Connect Header and Footer with fallbacks

**Files:**
- Create: `frontend/content/globals.fallback.ts`
- Modify: `frontend/services/public-content.service.ts`
- Modify: `frontend/lib/publicContent.server.ts`
- Modify: `frontend/components/layout/Header.tsx`
- Modify: `frontend/components/layout/Footer.tsx`
- Test: `frontend/tests/e2e/public-content.spec.ts`

- [ ] Add typed global contracts and normalizers.
- [ ] Load globals through the content service, retaining current navigation/footer as fallback.
- [ ] Validate internal and external links before rendering.
- [ ] Verify mobile navigation and footer remain usable after content changes.
- [ ] Commit with `feat(content): manage public header and footer`.

### Task 5: Connect legal and support information

**Files:**
- Modify: `frontend/app/contact/page.tsx`
- Modify: `frontend/app/cgu/page.tsx`
- Modify: `frontend/app/mentions-legales/page.tsx`
- Test: `frontend/tests/e2e/public-content.spec.ts`

- [ ] Replace duplicated support and legal company information with validated globals.
- [ ] Keep page body editorial content for Phase 4.
- [ ] Verify a global support update appears in header/footer/contact without duplication.
- [ ] Run full QA and commit with `feat(content): connect global support and legal data`.

