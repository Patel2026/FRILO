# Public Content Phase 2 Media Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a centralized, searchable, reusable media library with usage tracking and deletion protection.

**Architecture:** Store media metadata separately from content. Content records reference media IDs, while `MediaAssetService` owns upload validation, metadata extraction, public URL resolution, usage discovery, and deletion. The content API resolves safe public URLs without exposing storage paths.

**Tech Stack:** Laravel Storage, MySQL 8, Blade admin, Next.js 16.

---

### Task 1: Add media persistence and usage references

**Files:**
- Create: `backend/database/migrations/2026_06_14_000003_create_media_assets_table.php`
- Create: `backend/app/Models/MediaAsset.php`
- Create: `backend/app/Models/MediaUsage.php`
- Create: `backend/database/factories/MediaAssetFactory.php`
- Test: `backend/tests/Feature/Admin/MediaLibraryTest.php`

- [ ] Create `media_assets` with storage metadata, dimensions, alternative text, and uploader; add nullable `seo_image_media_id` to `public_pages`.
- [ ] Create polymorphic `media_usages` with a unique constraint on asset, owner, and field key.
- [ ] Test relationships, casts, and duplicate-usage prevention.
- [ ] Run `docker compose exec backend php artisan test tests/Feature/Admin/MediaLibraryTest.php`.
- [ ] Commit with `feat(media): add media library persistence`.

### Task 2: Implement upload, usage synchronization, and deletion rules

**Files:**
- Create: `backend/app/Services/MediaAssetService.php`
- Create: `backend/app/Http/Requests/Admin/StoreMediaAssetRequest.php`
- Create: `backend/app/Http/Requests/Admin/UpdateMediaAssetRequest.php`
- Test: `backend/tests/Feature/Admin/MediaLibraryTest.php`

- [ ] Test accepted JPEG/PNG/WebP/document uploads and rejected MIME, extension, oversized, and malformed image uploads.
- [ ] Implement `store()`, `updateMetadata()`, `syncUsages()`, `delete()`, and `publicUrl()`.
- [ ] Require non-empty alternative text for editorial images.
- [ ] Block deletion when `media_usages` exist.
- [ ] Ensure file and database writes are transactionally compensated on failure.
- [ ] Commit with `feat(media): add safe media asset service`.

### Task 3: Build super-admin media management

**Files:**
- Create: `backend/app/Policies/MediaAssetPolicy.php`
- Modify: `backend/app/Providers/AuthServiceProvider.php`
- Create: `backend/app/Http/Controllers/Admin/MediaAssetController.php`
- Create: `backend/resources/views/admin/media/index.blade.php`
- Create: `backend/resources/views/admin/media/edit.blade.php`
- Modify: `backend/resources/views/layouts/sidebar.blade.php`
- Modify: `backend/routes/web.php`
- Test: `backend/tests/Feature/Admin/MediaLibraryTest.php`

- [ ] Test that clients receive 403 and super administrators can upload, search, edit metadata, view usages, and delete unused assets.
- [ ] Build compact list/grid switching, search, preview, metadata edit, usage list, and protected deletion.
- [ ] Add `Contenu du site → Médiathèque`.
- [ ] Commit with `feat(media): add media library admin`.

### Task 4: Connect media references to editorial content

**Files:**
- Modify: `backend/app/Content/PublicContentRegistry.php`
- Modify: `backend/app/Services/PublicContentService.php`
- Modify: `backend/app/Services/MediaAssetService.php`
- Modify: `backend/app/Http/Requests/Admin/UpdatePublicSectionRequest.php`
- Modify: `backend/app/Http/Requests/Admin/StoreContentBlockRequest.php`
- Modify: `backend/app/Http/Requests/Admin/UpdateContentBlockRequest.php`
- Modify: `backend/resources/views/admin/content/sections/_form.blade.php`
- Modify: `backend/resources/views/admin/content/blocks/_form.blade.php`
- Test: `backend/tests/Feature/Api/PublicContentApiTest.php`

- [ ] Validate referenced media IDs and required alt text.
- [ ] Synchronize media usages after every content mutation and restoration.
- [ ] Resolve public media objects as `{id, url, alt_text, width, height, mime_type}`.
- [ ] Verify internal storage paths never appear in public API responses.
- [ ] Commit with `feat(media): connect media library to public content`.

### Task 5: Verify media browser journeys

**Files:**
- Modify: `frontend/tests/e2e/public-content.spec.ts`

- [ ] Upload an image in admin, select it in a homepage section, and verify it publicly.
- [ ] Reuse the image in a free block and confirm two usages display.
- [ ] Confirm deletion is blocked while used.
- [ ] Remove usages, delete the media, and confirm public fallback has no broken image.
- [ ] Run backend/frontend QA and verify desktop/mobile output.
