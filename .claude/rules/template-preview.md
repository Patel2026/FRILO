# Template Preview Rules

## Constraints
- Treat `/template` as the source for local deliverable HTML previews.
- Expose only deliverable first-level template folders.
- Exclude `maquette*`, cache files, and non-deliverable artifacts.
- Use `/template-previews/<folder>/` for local preview URLs.
- Keep local and external preview modes explicit in admin.

## Anti-patterns
- NEVER store generic localhost preview URLs in production data. Instead: use local preloaded preview URLs or validated external URLs.
- NEVER invent preview pages not present in the template folder. Instead: derive or declare explicit page mappings.

## Verification Checklist
- [ ] Frontend preload runs before dev/build/start.
- [ ] `manifest.json` reflects exposed folders.
- [ ] Iframe previews stay inside FRILO.
- [ ] Seeder/admin mapping is explicit.
