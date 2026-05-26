---
name: template-preview-integration
description: Integrate local template previews from /template into FRILO catalogue/admin without exposing non-deliverable artifacts.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: template-preview-integration

## Description
Add or modify local/external template preview integration.

## Trigger Condition
Use for `/template`, preload scripts, `template-previews`, preview seeders, admin preview fields, or immersive preview UI.

## Inputs Required
- Template folder or external preview source.
- Target template record or seeder.

## Steps
1. Load template preview architecture/rules and source `rules/PRODUCT_SPEC/TEMPLATE_PREVIEW_INTEGRATION_FRILO.md`.
2. Inspect folder structure and preload script behavior.
3. Exclude non-deliverable files/folders.
4. Update mapping, seeder, admin, or frontend as needed.
5. Verify manifest/preview URL behavior.

## Verification Steps
- [ ] Preview URL uses `/template-previews/<folder>/` for local previews.
- [ ] `maquette*` and caches are excluded.
- [ ] Preview pages exist.
- [ ] Public UI does not show raw technical links.

## Output Format
Preview mapping, files changed, verification, unresolved assets.

## Failure Handling
Stop if the template folder is incomplete or assets are not relative.

## Skill Dependencies
Invoke `template-preview-reviewer` and optionally `surface-quality-reviewer`.

## Feedback Loop
Max iterations : 2
Exit condition : Preview reviewer SAFE and preview loads or documented blocker.
Escalate when : Folder contents are ambiguous or admin contract changes.
