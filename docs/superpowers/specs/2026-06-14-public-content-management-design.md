# FRILO Public Content Management Design

## Goal

Allow FRILO super administrators to manage all public-facing content without changing code, while preserving the platform's responsive design, security, and existing business-data ownership.

## Product Decisions

- Use a hybrid content-management approach.
- Strategic sections remain structurally protected.
- Administrators can add free editorial blocks using controlled layouts.
- The first release covers the entire public space.
- Saving publishes changes immediately.
- Every change creates a restorable revision.
- Rich content supports flexible editorial content but never raw HTML or scripts.
- Free blocks support three layouts:
  - Full width.
  - Two columns.
  - Media with text.
- Public images and documents use a centralized media library.
- Only super administrators can manage content.
- Each public page supports essential SEO fields.

## Boundaries

The content system controls public presentation and editorial copy. It does not duplicate business-owned data.

Existing modules remain the source of truth for:

- `Template`: catalogue models, prices, features, previews, and visibility.
- `Sector`: sector names, descriptions, icons, and visibility.
- `FaqItem`: FAQ questions, answers, ordering, and publication.
- `TemplateReview`: customer reviews and publication.
- `OrderOption`: paid order options, prices, descriptions, persona hints, ordering, and activation.

The content system may configure where and how these collections appear, but it never stores copies of their records.

## Delivery Strategy

The project is delivered as four independently usable phases.

### Phase 1: Editorial Foundation

- Public-page registry.
- Protected sections.
- Free content blocks.
- Essential SEO.
- Immediate publication.
- Revision history and restoration.
- Public content API.
- Homepage integration as the first complete reference implementation.

### Phase 2: Central Media Library

- Image and document upload.
- Search and reuse.
- Required alternative text for editorial images.
- Usage tracking.
- Protection against deleting used assets.

### Phase 3: Missing Business Administration

- Order-option administration.
- Global public elements.
- Navigation.
- Footer.
- Contact details.
- Social links.
- Reusable calls to action.
- Legal information connected to the public pages.

### Phase 4: Complete Public-Space Integration

- Homepage.
- Expertises.
- Contact.
- FAQ.
- Sectors and sector detail.
- Templates, comparison, detail, and preview.
- Order workflow.
- CGU and legal notices.
- Global header and footer.

Each phase must leave the public site operational and must pass backend and frontend QA before the next phase starts.

## Domain Model

### PublicPage

Represents a known FRILO public page or page family.

Core fields:

- `id`
- `key`: stable internal identifier such as `home`, `contact`, or `template_detail`.
- `route_pattern`: documented frontend route or route family.
- `name`: administrator-facing label.
- `seo_title`
- `seo_description`
- `seo_image_media_id`
- `is_indexable`
- timestamps

Page keys and route patterns are created by code or seed data. Administrators edit their content but cannot invent arbitrary application routes in the first release.

### PublicSection

Represents a protected section rendered by a dedicated frontend component.

Core fields:

- `id`
- `public_page_id`
- `key`: stable identifier such as `home.hero`.
- `name`: administrator-facing label.
- `position`
- `is_visible`
- `content`: validated JSON matching the registered section schema.
- timestamps

The section key determines:

- Allowed fields.
- Validation rules.
- Admin form.
- Public frontend component.
- Whether the section can be hidden.

Essential sections cannot be deleted. Sections explicitly marked as hideable may be hidden.

### ContentBlock

Represents a free editorial block inserted at an allowed location on a page.

Core fields:

- `id`
- `public_page_id`
- `anchor_section_key`: protected section after which the block appears.
- `position`
- `layout`: `full_width`, `two_columns`, or `media_text`.
- `content`: structured rich-content JSON.
- `settings`: limited presentation settings approved by the design system.
- `is_visible`
- timestamps

Content blocks cannot contain raw HTML, JavaScript, inline event handlers, arbitrary CSS, or unrestricted embeds.

### MediaAsset

Represents a reusable public image or document.

Core fields:

- `id`
- `disk`
- `path`
- `original_name`
- `mime_type`
- `size`
- `width`
- `height`
- `alt_text`
- `uploaded_by`
- timestamps

Usage is resolved through explicit media references from pages, sections, blocks, templates, and other supported records. An asset with active usages cannot be deleted.

### ContentRevision

Stores the previous state before a content mutation.

Core fields:

- `id`
- `revisionable_type`
- `revisionable_id`
- `event`
- `snapshot`
- `created_by`
- `created_at`

Restoration creates a new revision before applying the historical snapshot. History is immutable.

## Registered Protected Sections

Protected sections are defined through a backend registry, not arbitrary database schemas.

Each registered section defines:

- Stable key.
- Public page key.
- Administrator label.
- Validation schema.
- Default content.
- Hideability.
- Frontend renderer identifier.

Initial protected sections include:

- Homepage hero.
- Homepage model introduction.
- Homepage benefits.
- Homepage process.
- Homepage pricing presentation.
- Homepage testimonials introduction.
- Homepage sectors introduction.
- Homepage FAQ introduction.
- Homepage closing call to action.
- Catalogue introduction.
- Sector-list introduction.
- Template-detail supporting content.
- Order-workflow introduction and supporting messages.
- Contact-page introduction and support information.
- Expertises-page introduction and sections.
- FAQ-page introduction.
- Legal-page introductions.
- Global header and footer content.

## Rich Content

Rich content uses a structured document format accepted by both Laravel and Next.js.

Allowed content:

- Paragraphs.
- Headings within the permitted hierarchy.
- Bold and italic text.
- Ordered and unordered lists.
- Links with validated protocols.
- Images selected from the media library.
- Simple tables.

Disallowed content:

- Raw HTML.
- Scripts.
- Iframes and arbitrary embeds.
- Inline styles.
- Arbitrary classes.
- Unsafe URL protocols.

The backend sanitizes and validates every rich-content payload before storage. The frontend renders only the known structured nodes.

## Administration Experience

The backoffice adds a `Contenu du site` group containing:

- Pages.
- Éléments globaux.
- Médiathèque.
- Options de commande.
- Historique.

### Page List

The page list shows:

- Page name.
- Route or route family.
- Indexation status.
- Last modification.
- Last editor.
- Edit action.
- Public preview link.

### Page Editor

The page editor shows sections in their real public order.

- Protected sections use field-specific forms.
- Free blocks can be added only at registered insertion points.
- Free blocks can be reordered within their insertion point.
- Free blocks can switch between the three supported layouts.
- Saving publishes immediately.
- Saving creates a revision automatically.
- A public preview link opens the current rendered page in a new tab.

### History

The history view shows:

- Date.
- Administrator.
- Affected page or content item.
- Event.
- Compact change summary.
- Restore action.

Restoration is explicit and audited.

## Immediate Publication

There is no draft/publish workflow for editorial content in this project.

When a super administrator saves:

1. The request is authorized.
2. The payload is validated and sanitized.
3. The previous state is written to `ContentRevision`.
4. The new state is saved in a transaction.
5. Relevant public-content cache keys are invalidated.
6. The change becomes visible publicly.

The existing versioned `PlatformSettingsService` remains responsible for operational platform settings. Editorial content does not reuse its draft/publish lifecycle.

## Public API

The API exposes cacheable read-only endpoints.

Primary endpoint:

```text
GET /api/public/content/{pageKey}
```

The response contains:

- Page key and SEO metadata.
- Visible protected sections and their validated content.
- Visible free blocks in rendering order.
- Resolved public media URLs.
- References to business collections where relevant, never duplicated records.

Additional endpoint:

```text
GET /api/public/globals
```

It contains global navigation, footer, support information, social links, and reusable calls to action.

The API never exposes:

- Revision snapshots.
- Hidden content.
- Administration metadata.
- Internal storage paths.
- Unsafe rich-content nodes.

## Frontend Architecture

All public content requests flow through:

```text
Page or component
→ public-content.service.ts or public-content.server.ts
→ Laravel public-content API
```

There are no direct frontend component `fetch()` calls.

Frontend responsibilities:

- Map protected-section renderer identifiers to known React components.
- Render structured rich content with safe known nodes.
- Apply FRILO typography and responsive rules.
- Render the three free-block layouts.
- Fall back to local default content if the editorial API is unavailable.
- Generate page metadata from public SEO content when available.

The fallback content remains during migration and may be reduced only after each page has stable seeded content and tests.

## Media Library

The media library supports:

- JPEG, PNG, WebP, and approved document types.
- File-size and dimension validation.
- Image metadata extraction.
- Search by filename and alternative text.
- Reuse across content records.
- Preview.
- Usage listing.
- Safe deletion only when unused.

Editorial images require alternative text. Decorative-image support may be added later through an explicit decorative flag; empty alternative text is not accepted by default.

## Order Option Administration

`OrderOption` receives a dedicated super-admin CRUD.

Administrators can manage:

- Name.
- Plain-language description.
- Persona hint.
- Price.
- Sort order.
- Active state.

Order creation continues to snapshot selected option names and prices. Existing orders are never recalculated when an option changes.

## Global Public Elements

Global public content includes:

- Navigation labels and enabled links.
- Footer groups and links.
- Support email and phone displayed publicly.
- Social links.
- Reusable calls to action.
- Legal company information.

Global content remains structurally validated. Administrators cannot add arbitrary application routes; links must use approved internal routes or validated external URLs.

## Security and Integrity

- All management routes require authenticated `super_admin` access.
- Every write uses a FormRequest, Policy, Service, and Model flow.
- Controllers contain no content-processing logic.
- Rich content is validated and sanitized server-side.
- Links accept only approved protocols.
- Media uploads validate MIME type, extension, size, and image dimensions.
- Media deletion is blocked while usages exist.
- Essential protected sections cannot be deleted.
- Every mutation and restoration is audited.
- Public endpoints expose only active and sanitized content.

## Error Handling

### Administration

- Validation failures preserve entered values and show field-level messages.
- Media upload failures explain type, size, or processing problems.
- Conflicting reorder operations fail without partial updates.
- Restore failures leave current content unchanged.

### Public Site

- API failure uses local fallback content.
- Unknown protected renderer identifiers are ignored and logged.
- Missing optional media renders without a broken image.
- Invalid content records are excluded from public responses and logged.

## Migration

Migration is incremental.

1. Seed the registry of known public pages and protected sections.
2. Seed current frontend copy as initial protected-section content.
3. Integrate the homepage against the public-content API while retaining its fallback.
4. Add global content and connect header/footer.
5. Integrate remaining pages one by one.
6. Remove duplicated hardcoded copy only after the page is covered by backend and frontend tests.

No migration step may leave a public page empty or require all pages to switch simultaneously.

## Testing Strategy

### Backend

- Policies reject non-super-admin writes.
- FormRequests reject invalid section schemas and unsafe rich content.
- Services create revisions before mutations.
- Restoration applies snapshots and creates a new revision.
- Media deletion is blocked when used.
- Public API excludes hidden and invalid content.
- Public API exposes sanitized SEO and resolved media URLs.
- Order-option CRUD preserves order price snapshots.

### Frontend

- Protected renderers display valid API content.
- Missing API content uses local fallback.
- Unknown renderer identifiers do not break pages.
- Rich-content renderer supports only allowed nodes.
- Free blocks render responsively in all three layouts.
- SEO metadata falls back safely.

### Browser Verification

- A super administrator changes content and sees it immediately on the public page.
- Restoring a revision restores the public output.
- Uploaded media can be reused and cannot be deleted while used.
- Homepage and all three free-block layouts are checked on desktop and mobile.
- Order options created in administration appear in the public order workflow.

## Success Criteria

- Every public page has an administration entry.
- All public editorial copy and media can be managed without code changes.
- Business data remains owned by its dedicated module.
- Saved changes appear immediately.
- Every change can be restored.
- Unsafe rich content cannot execute code or break the page structure.
- Used media cannot be deleted.
- Essential SEO is manageable per page.
- Public pages remain functional when the content API fails.
- Backend and frontend QA pass after every delivery phase.

## Explicitly Deferred

- A separate editor role.
- Granular content permissions.
- Two-person approval workflow.
- Arbitrary custom routes.
- Arbitrary HTML, CSS, JavaScript, or embedded widgets.
- Fully free drag-and-drop layout construction.
- Advanced SEO tooling and structured-data editing.
- Multilingual content management.
