# Admin UI FRILO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current Velzon-looking admin into a FRILO operational console using a black/white/red visual system, without changing business logic, routes, RBAC, or order workflow behavior.

**Architecture:** Keep the existing Laravel Blade/Bootstrap admin. Add a central FRILO layer in `backend/resources/scss/custom.scss`, then make limited Blade adjustments for the global shell and dashboard composition. Use existing Bootstrap and Remix icon primitives. Compile assets with the backend Vite build and verify through the in-app browser.

**Tech Stack:** Laravel 11/12 style backend, Blade admin, Bootstrap 5, SCSS, Vite, Docker/local browser verification.

---

## File Structure

### Modify

- `backend/resources/scss/custom.scss`
  - Add FRILO admin tokens and component overrides.

- `backend/resources/views/layouts/master.blade.php`
  - Add an admin shell class/body hook if needed.

- `backend/resources/views/layouts/sidebar.blade.php`
  - Adjust logo/nav semantics and classes only; keep RBAC logic intact.

- `backend/resources/views/layouts/topbar.blade.php`
  - Rework visual hierarchy and action styling only.

- `backend/resources/views/admin/dashboard.blade.php`
  - Recompose dashboard sections into a denser operational view.

### Generated

- `backend/public/build/css/custom.min.css`
  - Produced by `npm run build` from `custom.scss`.

---

## Task 1: FRILO Theme Layer

**Files:**
- Modify: `backend/resources/scss/custom.scss`
- Generated: `backend/public/build/css/custom.min.css`

- [ ] **Step 1: Add design tokens**

Define central CSS variables for the admin:

- `--frilo-admin-black`
- `--frilo-admin-ink`
- `--frilo-admin-muted`
- `--frilo-admin-border`
- `--frilo-admin-surface`
- `--frilo-admin-red`
- `--frilo-admin-red-dark`

Keep semantic status colors available for warning, success, info, and danger states.

- [ ] **Step 2: Override global shell**

Style the admin body/page background, content spacing, typography weight, focus states, and links.

- [ ] **Step 3: Override shared components**

Add FRILO styling for:

- Cards
- Tables
- Buttons
- Badges
- Forms
- Dropdowns
- Empty states
- Mobile table/card behavior where existing classes allow it

- [ ] **Step 4: Build assets**

Run:

```bash
cd backend && npm run build
```

Expected: Vite build succeeds and regenerates `public/build`.

---

## Task 2: Admin Shell

**Files:**
- Modify: `backend/resources/views/layouts/master.blade.php`
- Modify: `backend/resources/views/layouts/sidebar.blade.php`
- Modify: `backend/resources/views/layouts/topbar.blade.php`

- [ ] **Step 1: Add shell hook**

If useful, add a stable class or data attribute to the admin HTML/body/wrapper so the FRILO overrides remain scoped.

- [ ] **Step 2: Refine sidebar**

Keep all authorization logic and route checks as-is. Improve:

- Brand block
- Active item visibility
- Menu section labels
- Notification/count badges
- Hover states
- Mobile overlay compatibility

- [ ] **Step 3: Refine topbar**

Improve:

- Product/admin context
- Primary external site action
- Notification button
- User dropdown
- Mobile spacing

Do not add new behavior.

---

## Task 3: Dashboard Recomposition

**Files:**
- Modify: `backend/resources/views/admin/dashboard.blade.php`

- [ ] **Step 1: Rework page header**

Create a concise operational header with:

- Title
- Short context line
- Primary links to orders and public site if appropriate

- [ ] **Step 2: Rebuild KPI area**

Group the existing stats into a denser status overview:

- En attente
- En production
- Livrees
- Chiffre d'affaires
- Clients
- Templates actifs

Keep the current variables and routes.

- [ ] **Step 3: Prioritize SLA alerts**

Make SLA confirmation and delivery alerts more visible and easier to act on.

- [ ] **Step 4: Improve tables**

Restyle the SLA overdue table and latest orders table:

- Clear table headers
- Compact rows
- Consistent badges
- Icon actions with accessible labels
- Mobile-friendly containment

---

## Task 4: Browser Verification

**Files:**
- No source change unless verification reveals issues.

- [ ] **Step 1: Open admin dashboard**

Use the integrated browser at:

```text
http://localhost:8081/admin/dashboard
```

Expected:

- No 500/404.
- Assets load.
- Sidebar/topbar/dashboard reflect FRILO black/white/red direction.

- [ ] **Step 2: Verify responsive behavior**

Check at desktop and mobile widths:

- No overlapping text.
- Sidebar/topbar remain usable.
- Tables do not break layout.
- Buttons and badges fit their containers.

- [ ] **Step 3: Spot-check key pages**

Open:

- `/admin/orders`
- `/admin/templates`
- `/admin/order-options`
- `/admin/clients`

Expected: existing pages inherit the shared FRILO component layer and remain usable.

---

## Task 5: Final Checks

- [ ] **Step 1: Run backend tests**

Run:

```bash
cd backend && php artisan test
```

Expected: tests pass.

- [ ] **Step 2: Check Git diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: only planned SCSS/Blade/build/doc files changed.

- [ ] **Step 3: Commit implementation**

Commit the UI implementation separately from the spec commit.

Suggested message:

```text
feat(admin): restyle backoffice with FRILO operational UI
```
