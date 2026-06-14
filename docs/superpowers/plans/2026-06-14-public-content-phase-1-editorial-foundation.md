# Public Content Phase 1 Editorial Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the typed editorial foundation, immediate publication, revision restoration, public API, and a fully managed homepage reference implementation.

**Architecture:** Store known pages, protected sections, free blocks, and revisions in dedicated tables. A registry defines valid protected-section schemas and defaults. `PublicContentService` owns writes, revisions, ordering, sanitation, cache invalidation, and public response assembly. Next.js consumes the API through dedicated server/client services with current homepage content as fallback.

**Tech Stack:** Laravel 12, MySQL 8, Blade, Next.js 16, React 19, TypeScript, Tailwind CSS 4.

---

### Task 1: Create the editorial persistence model

**Files:**
- Create: `backend/database/migrations/2026_06_14_000002_create_public_content_tables.php`
- Create: `backend/app/Models/PublicPage.php`
- Create: `backend/app/Models/PublicSection.php`
- Create: `backend/app/Models/ContentBlock.php`
- Create: `backend/app/Models/ContentRevision.php`
- Create: `backend/database/factories/PublicPageFactory.php`
- Create: `backend/database/factories/PublicSectionFactory.php`
- Create: `backend/database/factories/ContentBlockFactory.php`
- Test: `backend/tests/Feature/Admin/PublicContentAdminTest.php`

- [ ] **Step 1: Write a failing persistence test**

Assert that a page owns ordered sections and blocks, JSON fields cast to arrays, and revisions belong to their actor.

```php
$page = PublicPage::factory()->create(['key' => 'home']);
$section = PublicSection::factory()->for($page)->create(['position' => 10]);
$block = ContentBlock::factory()->for($page)->create(['position' => 20]);

$this->assertTrue($page->sections->contains($section));
$this->assertTrue($page->blocks->contains($block));
$this->assertIsArray($section->content);
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `docker compose exec backend php artisan test tests/Feature/Admin/PublicContentAdminTest.php`

Expected: FAIL because the content tables and models do not exist.

- [ ] **Step 3: Add the schema**

Create:

```text
public_pages:
  key unique, route_pattern, name, seo_title nullable,
  seo_description nullable, is_indexable boolean default true, timestamps

public_sections:
  public_page_id FK cascade, key unique, name, position,
  is_visible boolean, content json, timestamps

content_blocks:
  public_page_id FK cascade, anchor_section_key nullable,
  position, layout enum(full_width,two_columns,media_text),
  content json, settings json nullable, is_visible boolean, timestamps

content_revisions:
  revisionable_type, revisionable_id, event, snapshot json,
  created_by FK nullOnDelete, created_at
```

- [ ] **Step 4: Add typed model relationships and casts**

Use fillable fields, integer/boolean/array casts, ordered relationships, and `morphTo()` for revisions.

- [ ] **Step 5: Run the focused test**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/database/migrations/2026_06_14_000002_create_public_content_tables.php backend/app/Models backend/database/factories backend/tests/Feature/Admin/PublicContentAdminTest.php
git commit -m "feat(content): add editorial persistence models"
```

### Task 2: Register pages and protected-section schemas

**Files:**
- Create: `backend/app/Content/PublicContentRegistry.php`
- Create: `backend/config/public-content.php`
- Create: `backend/database/seeders/PublicContentSeeder.php`
- Modify: `backend/database/seeders/DatabaseSeeder.php`
- Test: `backend/tests/Unit/PublicContentRegistryTest.php`

- [ ] **Step 1: Write failing registry tests**

Test that `home.hero` belongs to `home`, exposes defaults, allows only registered fields, and rejects an unknown section key.

```php
$definition = app(PublicContentRegistry::class)->section('home.hero');

$this->assertSame('home', $definition['page']);
$this->assertArrayHasKey('headline', $definition['defaults']);
$this->expectException(InvalidArgumentException::class);
app(PublicContentRegistry::class)->section('unknown.section');
```

- [ ] **Step 2: Run the registry test and confirm failure**

Run: `docker compose exec backend php artisan test tests/Unit/PublicContentRegistryTest.php`

- [ ] **Step 3: Implement the registry**

Register stable page keys, route patterns, labels, homepage section keys, defaults, hideability, renderer IDs, and Laravel validation rules in `config/public-content.php`. Expose:

```php
public function pages(): array;
public function page(string $key): array;
public function section(string $key): array;
public function sectionsForPage(string $pageKey): array;
public function validateSectionContent(string $key, array $content): array;
```

- [ ] **Step 4: Seed idempotent page and section records**

Use `updateOrCreate()` by stable key. Seed the current homepage copy from `frontend/app/page.tsx` as initial section content.

- [ ] **Step 5: Run registry and seeder tests**

Expected: PASS and repeated seeding creates no duplicates.

- [ ] **Step 6: Commit**

```bash
git add backend/app/Content backend/config/public-content.php backend/database/seeders backend/tests/Unit/PublicContentRegistryTest.php
git commit -m "feat(content): register public pages and sections"
```

### Task 3: Add structured rich-content validation

**Files:**
- Create: `backend/app/Content/RichContentSanitizer.php`
- Create: `backend/app/Rules/ValidRichContent.php`
- Test: `backend/tests/Unit/RichContentSanitizerTest.php`

- [ ] **Step 1: Write failing sanitizer tests**

Accept paragraphs, headings, lists, links using `http`, `https`, `mailto`, and internal paths. Reject raw HTML, scripts, unknown node types, inline styles, and `javascript:` URLs.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `docker compose exec backend php artisan test tests/Unit/RichContentSanitizerTest.php`

- [ ] **Step 3: Implement an allow-list sanitizer**

Expose:

```php
public function sanitize(array $document): array;
```

The returned document contains only:

```text
doc, paragraph, heading(level 2-4), text(bold/italic),
bullet_list, ordered_list, list_item, link, table, table_row, table_cell
```

- [ ] **Step 4: Run the sanitizer test**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/Content/RichContentSanitizer.php backend/app/Rules/ValidRichContent.php backend/tests/Unit/RichContentSanitizerTest.php
git commit -m "feat(content): validate structured rich content"
```

### Task 4: Implement immediate publication, revisions, restoration, and public assembly

**Files:**
- Create: `backend/app/Services/PublicContentService.php`
- Create: `backend/app/Services/ContentRevisionService.php`
- Test: `backend/tests/Feature/Admin/PublicContentServiceTest.php`
- Test: `backend/tests/Feature/Api/PublicContentApiTest.php`

- [ ] **Step 1: Write failing service tests**

Cover:

- Section update creates a snapshot before mutation.
- Block creation sanitizes content.
- Block reorder is transactional.
- Restoration snapshots the current state before applying the historical state.
- Public assembly excludes hidden sections and blocks.
- Cache is invalidated after every mutation.

- [ ] **Step 2: Run the service tests and confirm failure**

Run: `docker compose exec backend php artisan test tests/Feature/Admin/PublicContentServiceTest.php tests/Feature/Api/PublicContentApiTest.php`

- [ ] **Step 3: Implement revision service**

Expose:

```php
public function snapshot(Model $revisionable, string $event, User $actor): ContentRevision;
public function restore(ContentRevision $revision, User $actor): Model;
```

- [ ] **Step 4: Implement public content service**

Expose:

```php
public function updatePage(PublicPage $page, array $data, User $actor): PublicPage;
public function updateSection(PublicSection $section, array $data, User $actor): PublicSection;
public function createBlock(PublicPage $page, array $data, User $actor): ContentBlock;
public function updateBlock(ContentBlock $block, array $data, User $actor): ContentBlock;
public function deleteBlock(ContentBlock $block, User $actor): void;
public function reorderBlocks(PublicPage $page, array $orderedIds, User $actor): void;
public function publicPage(string $pageKey): array;
```

Use DB transactions, registry validation, sanitizer, `AdminAuditLogger`, and cache key `public_content.page.{key}`.

- [ ] **Step 5: Run service tests**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/app/Services/PublicContentService.php backend/app/Services/ContentRevisionService.php backend/tests/Feature/Admin/PublicContentServiceTest.php backend/tests/Feature/Api/PublicContentApiTest.php
git commit -m "feat(content): add publication and revision services"
```

### Task 5: Add policies, requests, admin controllers, and routes

**Files:**
- Create: `backend/app/Policies/PublicPagePolicy.php`
- Create: `backend/app/Policies/PublicSectionPolicy.php`
- Create: `backend/app/Policies/ContentBlockPolicy.php`
- Create: `backend/app/Policies/ContentRevisionPolicy.php`
- Modify: `backend/app/Providers/AuthServiceProvider.php`
- Create: `backend/app/Http/Requests/Admin/UpdatePublicPageRequest.php`
- Create: `backend/app/Http/Requests/Admin/UpdatePublicSectionRequest.php`
- Create: `backend/app/Http/Requests/Admin/StoreContentBlockRequest.php`
- Create: `backend/app/Http/Requests/Admin/UpdateContentBlockRequest.php`
- Create: `backend/app/Http/Requests/Admin/ReorderContentBlocksRequest.php`
- Create: `backend/app/Http/Controllers/Admin/PublicPageController.php`
- Create: `backend/app/Http/Controllers/Admin/PublicSectionController.php`
- Create: `backend/app/Http/Controllers/Admin/ContentBlockController.php`
- Create: `backend/app/Http/Controllers/Admin/ContentRevisionController.php`
- Modify: `backend/routes/web.php`
- Test: `backend/tests/Feature/Admin/PublicContentAdminTest.php`

- [ ] **Step 1: Write failing authorization and validation tests**

Verify clients receive 403, super administrators can edit, unknown section fields are rejected, invalid layouts are rejected, and unsafe rich content returns validation errors.

- [ ] **Step 2: Run the admin test and confirm failure**

- [ ] **Step 3: Implement policies and FormRequests**

Every policy grants management only when:

```php
return $user->role === 'super_admin';
```

Requests validate only permitted fields and delegate protected-section content validation to the registry.

- [ ] **Step 4: Implement thin controllers and routes**

Add:

```text
GET    /admin/content/pages
GET    /admin/content/pages/{publicPage}/edit
PATCH  /admin/content/pages/{publicPage}
PATCH  /admin/content/sections/{publicSection}
POST   /admin/content/pages/{publicPage}/blocks
PATCH  /admin/content/blocks/{contentBlock}
DELETE /admin/content/blocks/{contentBlock}
PATCH  /admin/content/pages/{publicPage}/blocks/order
GET    /admin/content/history
POST   /admin/content/history/{contentRevision}/restore
```

- [ ] **Step 5: Run admin tests**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/app/Policies backend/app/Providers/AuthServiceProvider.php backend/app/Http/Requests/Admin backend/app/Http/Controllers/Admin backend/routes/web.php backend/tests/Feature/Admin/PublicContentAdminTest.php
git commit -m "feat(content): add admin content endpoints"
```

### Task 6: Build the Blade administration experience

**Files:**
- Create: `backend/resources/views/admin/content/pages/index.blade.php`
- Create: `backend/resources/views/admin/content/pages/edit.blade.php`
- Create: `backend/resources/views/admin/content/sections/_form.blade.php`
- Create: `backend/resources/views/admin/content/blocks/_form.blade.php`
- Create: `backend/resources/views/admin/content/history/index.blade.php`
- Modify: `backend/resources/views/layouts/sidebar.blade.php`
- Test: `backend/tests/Feature/Admin/PublicContentAdminTest.php`

- [ ] **Step 1: Add failing response-content assertions**

Assert page list, homepage editor, protected sections, block layout choices, public preview link, and history restore action render for a super administrator.

- [ ] **Step 2: Build the page list and editor**

Use the current Blade admin style. Keep each protected section in a collapsible bounded panel, render registry-defined fields, and show free blocks at registered insertion points.

- [ ] **Step 3: Add structured rich-content JSON input for Phase 1**

Use a textarea-based structured document editor in Phase 1 with clear validation feedback. Do not add a JavaScript WYSIWYG dependency until the safe document contract is proven.

- [ ] **Step 4: Add sidebar navigation**

Add `Contenu du site → Pages` and `Contenu du site → Historique`.

- [ ] **Step 5: Run admin tests**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/resources/views/admin/content backend/resources/views/layouts/sidebar.blade.php backend/tests/Feature/Admin/PublicContentAdminTest.php
git commit -m "feat(content): add public content admin screens"
```

### Task 7: Expose the public content API

**Files:**
- Create: `backend/app/Http/Controllers/Api/PublicContentController.php`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/Api/PublicContentApiTest.php`

- [ ] **Step 1: Add failing API assertions**

Verify `GET /api/public/content/home` returns SEO, visible sections, visible blocks, renderer IDs, and sanitized content. Verify unknown page keys return 404 and hidden content is absent.

- [ ] **Step 2: Implement the controller**

Authorize public viewing through policy, call `PublicContentService::publicPage()`, and return only assembled safe content.

- [ ] **Step 3: Add the route**

```php
Route::get('/public/content/{pageKey}', [PublicContentController::class, 'show']);
```

- [ ] **Step 4: Run API tests**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/Http/Controllers/Api/PublicContentController.php backend/routes/api.php backend/tests/Feature/Api/PublicContentApiTest.php
git commit -m "feat(content): expose public content API"
```

### Task 8: Add frontend content contracts, fallback, and safe renderers

**Files:**
- Create: `frontend/services/public-content.service.ts`
- Create: `frontend/lib/publicContent.ts`
- Create: `frontend/lib/publicContent.server.ts`
- Create: `frontend/hooks/usePublicContent.ts`
- Create: `frontend/components/content/RichContentRenderer.tsx`
- Create: `frontend/components/content/FreeContentBlock.tsx`
- Create: `frontend/components/content/ProtectedSectionRenderer.tsx`
- Create: `frontend/content/home.fallback.ts`
- Test: `frontend/tests/e2e/public-content.spec.ts`

- [ ] **Step 1: Define strict TypeScript contracts**

Define discriminated types for:

```ts
type ContentBlockLayout = 'full_width' | 'two_columns' | 'media_text';
type RichNode = ParagraphNode | HeadingNode | TextNode | ListNode | LinkNode | TableNode;
type ProtectedSection = { key: string; renderer: string; content: Record<string, unknown> };
type PublicContentPage = { key: string; seo: SeoContent; sections: ProtectedSection[]; blocks: ContentBlock[] };
```

- [ ] **Step 2: Implement normalizers and local homepage fallback**

Unknown nodes and renderers must be ignored safely. Network/API failures return `HOME_FALLBACK_CONTENT`.

- [ ] **Step 3: Implement server and client service paths**

`publicContent.server.ts` may use cacheable server `fetch()`. Client requests use the existing Axios `api` instance through `public-content.service.ts`.

- [ ] **Step 4: Implement safe renderers**

Render only known rich nodes and the three layout structures. In Phase 1, `media_text` renders its text region and a neutral media placeholder; Phase 2 replaces that placeholder with a validated media-library reference. Do not use `dangerouslySetInnerHTML`.

- [ ] **Step 5: Add E2E fixture assertions**

Verify fallback rendering and each free-block layout at desktop and mobile widths.

- [ ] **Step 6: Run frontend QA**

Run: `docker compose exec frontend npm run qa`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/services/public-content.service.ts frontend/lib frontend/hooks/usePublicContent.ts frontend/components/content frontend/content/home.fallback.ts frontend/tests/e2e/public-content.spec.ts
git commit -m "feat(content): add frontend public content renderer"
```

### Task 9: Integrate the homepage reference implementation

**Files:**
- Modify: `frontend/app/page.tsx`
- Create: `frontend/components/content/home/HomeHeroSection.tsx`
- Create: `frontend/components/content/home/HomeBenefitsSection.tsx`
- Create: `frontend/components/content/home/HomeProcessSection.tsx`
- Create: `frontend/components/content/home/HomeClosingCtaSection.tsx`
- Test: `frontend/tests/e2e/public-content.spec.ts`

- [ ] **Step 1: Add a failing homepage content journey**

Seed a changed hero headline through the backend, open `/`, and assert the changed headline appears while templates, sectors, FAQ, reviews, pricing, and order options still come from their business services.

- [ ] **Step 2: Extract protected homepage renderers**

Move only editorial rendering out of the large homepage. Keep catalogue and business collection logic in the page/service flow.

- [ ] **Step 3: Load public homepage content with fallback**

Map registered renderer IDs to known components and insert free blocks at their anchor points.

- [ ] **Step 4: Verify responsive rendering**

Check desktop and mobile with the integrated browser. Ensure unknown renderers and API failure do not blank the homepage.

- [ ] **Step 5: Run full QA**

Run:

```bash
docker compose exec backend composer qa
docker compose exec frontend npm run qa
```

- [ ] **Step 6: Commit**

```bash
git add frontend/app/page.tsx frontend/components/content/home frontend/tests/e2e/public-content.spec.ts
git commit -m "feat(content): manage homepage editorial content"
```
