# FRILO Recovery Lots Design

Date: 2026-06-17
Status: Draft for user review

## Context

The user provided `Frilo 1.docx` with remaining product corrections and confirmed two decisions:

- Work approach: split the work into four independently verifiable lots.
- Template pricing rule: the command price uses `promo_price` when present, otherwise `normal_price`.

Current code already contains order options, client dashboard business modules, admin operational workflow, and private admin entry. Missing or partial areas are template pricing fields, clearer base-offer communication, fallback "no suitable template" ordering, registration simplification, dashboard client UX fixes, and template detail data separation.

## Goals

1. Complete admin template pricing and content structure.
2. Make the public order offer clear before payment.
3. Keep the order tunnel compatible with a client who cannot find a suitable template.
4. Remove unnecessary friction from registration.
5. Fix client dashboard creation flows for contacts and cash entries.

## Non-goals

- No global client dashboard redesign in this pass.
- No new payment provider behavior.
- No direct status update bypassing `OrderService`.
- No broad visual rebrand beyond the requested pages and forms.

## Lot 1 - Admin Templates And Pricing Foundation

### Product Behavior

Templates gain:

- `normal_price`: regular template price.
- `promo_price`: optional promotional price.
- `price`: retained as the effective order price for compatibility, synchronized as `promo_price ?? normal_price`.
- `target_audience`: list/text used for the public "Pense pour" section.
- `included_features`: list/text used for the public "Inclus" section.

Existing `features` remains temporarily for backward compatibility and migration fallback, but new public rendering should prefer `target_audience` and `included_features`.

### Backend Architecture

Refactor admin template writes to:

```text
Admin TemplateController -> Store/UpdateTemplateRequest -> TemplatePolicy -> TemplateService -> Template
```

`TemplateService` owns:

- slug generation/update policy
- parsing multiline fields
- preview configuration resolution
- thumbnail replacement/deletion
- effective `price` synchronization

### Data Migration

Create a new migration adding nullable/new fields to `templates`:

- `normal_price` unsigned integer nullable initially, backfilled from `price`
- `promo_price` unsigned integer nullable
- `target_audience` JSON nullable
- `included_features` JSON nullable

Backfill:

- `normal_price = price`
- `included_features = features` where available
- `target_audience = []`

### Admin UI

Template form shows:

- Prix normal
- Prix promo
- Prix effectif preview/help text: "Le prix commande utilise le prix promo s'il est renseigne, sinon le prix normal."
- Pense pour
- Inclus dans l'offre
- Thumbnail guidance
- Existing preview source controls, with clearer help text.

Template index shows normal/promo/effective price compactly.

### Tests

- Admin can create/update template with normal price only.
- Admin can create/update template with promo price.
- Effective `price` is promo if present, otherwise normal.
- Thumbnail replacement still works.
- Public template detail uses `target_audience` for "Pense pour" and `included_features` for "Inclus".

## Lot 2 - Public Offer And Fallback Order Path

### Product Behavior

The public pages and order tunnel must clearly list the base offer:

- Site professionnel jusqu'a 5 pages
- Nom de domaine 1 an
- Hebergement 1 an
- Design responsive mobile-first
- Formulaire de contact
- Chat WhatsApp integre
- SSL securise
- Indexation Google
- Livraison sous 48h

Options remain paid add-ons:

- Page supplementaire: 5K
- Creation logo: 10K
- Redaction de contenu: 20K
- Blog de 10 articles: 30K
- Site multilingue FR/EN: 20K
- Reservation ou demande de devis en ligne: 15K
- SEO avance: 20K

The homepage section that currently over-emphasizes paid options should instead list base-offer inclusions. Paid options belong in the order tunnel and/or a secondary pricing explanation.

### Fallback Template

Add an "Accompagnement FRILO" ordering path for users who do not find a suitable template.

Preferred implementation:

- A real active `Template` seeded in the database with a known slug, e.g. `accompagnement-frilo`.
- Marked through a stable flag or slug convention rather than a frontend-only fake object.
- The existing order tunnel receives `templateId` and continues using `OrderService::createOrder()`.

### File Upload In Order Tunnel

Reintroduce an attachment field in project details.

Implementation choice for the plan phase:

- If backend already has no upload model for order instructions, add a small `order_instruction_files` table or JSON attachment metadata only after deciding storage requirements.
- Do not accept raw file data inside generic JSON order payload.

This part is high-risk enough to plan carefully before coding.

### Tests

- Fallback template exists and is orderable.
- Inactive fallback template is not orderable.
- Public order tunnel shows base inclusions.
- Paid options still affect final backend-calculated price.

## Lot 3 - Registration Simplification

### Product Behavior

Remove "Domaine d'activite" from public registration.

### Backend Behavior

`sector_id` becomes nullable for public registration.

Rules:

- Do not accept or require sector during register.
- If existing `users.sector_id` is nullable, no migration is needed.
- If it is non-nullable, add a migration to make it nullable.

### Frontend Behavior

Remove sector loading and select field from `frontend/app/register/page.tsx`.

### Tests

- Register succeeds without `sector_id`.
- Register still rejects invalid email/password.
- Existing user profile/dashboard behavior remains intact.

## Lot 4 - Client Dashboard UX Fixes

### Contacts

Problems:

- Save/cancel buttons can be present but not visible enough in the first-create flow.
- After creating the first contact, there should be an obvious action to add another.

Design:

- Make form action row sticky or visually separated on mobile when needed.
- After create success, keep a visible "+ Ajouter un client" action in the header and empty/success state.
- Use clearer button copy: "Enregistrer le client".

### Cash

Same UX fixes:

- Make action row visible on mobile.
- Add obvious "+ Ajouter un mouvement" after first creation.
- Use clearer button copy: "Enregistrer le mouvement".

### Deadlines

Clarify role:

`Mes Echeances` helps clients remember important business dates: taxes, renewals, payment dates, administrative reminders, and custom follow-ups. FRILO can add system deadlines; clients can add personal ones.

Add short explanatory copy at the top of the page and possibly rename empty-state copy.

### Tests

- Frontend build/typecheck.
- E2E or component-level smoke for visible actions if current test setup supports it.
- API tests already cover ownership; keep them passing.

## Implementation Order

1. Lot 1: Admin templates and pricing foundation.
2. Lot 2: Public offer and fallback order path.
3. Lot 3: Registration simplification.
4. Lot 4: Client dashboard UX fixes.

This order keeps the data model stable before public/tunnel changes depend on it.

## Verification Gates

Every lot:

- Run focused backend tests first.
- Run `composer qa` after backend-impacting lots.
- Run `npm run qa` after frontend-impacting lots.

High-risk gates:

- Migration approval before schema edits.
- HITL if file upload requires a new persistence model.
- `OrderService` invariant review before any order creation behavior changes.

## Open Questions

1. File attachments in order tunnel: should files be stored as uploaded files linked to `OrderInstruction`, or should this first pass only add a "documents/context links" text field?
2. Promo price lifecycle: should `promo_price` be manually set per template only, or later tied to a global promotion window?
3. Should the fallback "Accompagnement FRILO" template be visible in the catalog, or only exposed through a CTA when no template matches?

## Recommended First Implementation Plan

Start with Lot 1 only. It is the foundation for correct public display and order pricing, and it has clear backend/admin/test boundaries.
