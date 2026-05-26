# Catalogue Templates Rules

## Constraints
- Public catalogue exposes only active sectors and active templates.
- Template prices are FCFA integers and become immutable snapshots on orders.
- Template deactivation must prevent new orders while preserving historical orders.
- Features and thumbnails must remain consumable by frontend service types.

## Anti-patterns
- NEVER delete catalogue records needed by historical orders because order detail depends on them. Instead: deactivate or soft delete.
- NEVER change template price expecting existing orders to update. Instead: treat orders as snapshotted history.

## Verification Checklist
- [ ] Inactive templates are absent from public catalogue.
- [ ] Inactive templates cannot be ordered.
- [ ] Template API shape still matches frontend `Template`.
- [ ] Historical orders still render template data.
