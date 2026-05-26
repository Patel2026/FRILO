# Catalogue And Template Preview Architecture

## Purpose
Describe catalogue entities and local template preview integration.

## Current Implementation
- Catalogue entities are `Sector` and `Template`.
- Public APIs expose active sectors/templates.
- Local previews are sourced from `/template`.
- Frontend preload copies deliverable template folders to `frontend/public/template-previews/`.
- Preview URLs use `/template-previews/<template-folder>/`.
- `manifest.json` tracks exposed local preview folders.

## Dependencies And Integration Points
- `TemplateSeeder` and `TemplatePreviewSeeder` create demo catalogue data.
- `frontend/scripts/preload-template-previews.mjs` runs before dev/build/start.
- Admin template form supports local or external preview configuration.

## Known Risks
- Fake localhost previews must not be stored as production data.
- Non-deliverable `maquette*` folders must not be exposed.
- Commercial template names can differ from folder names, but mapping must be explicit.

## Change Impact
Catalogue changes affect public conversion, order creation, and admin operations.

## Environment-Specific Behavior
Local preview preloading runs in frontend runtime/build environments.
