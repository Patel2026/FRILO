# Quality Recette Rules

## Constraints
- Use the recette checklist for acceptance beyond automated tests.
- Cover auth, catalogue, order tunnel, dashboard, security, workflow, admin, performance, responsive UI, legal/contact, and business-plan coherence.
- Run Playwright for critical client journeys when UI or journey behavior changes.
- Document any unchecked recette item.

## Anti-patterns
- NEVER call a feature complete only because unit tests pass. Instead: check relevant recette items.
- NEVER ignore manual recette gaps for payment/admin/security paths. Instead: document and schedule them.

## Verification Checklist
- [ ] Relevant recette sections are identified.
- [ ] Automated tests map to changed behavior.
- [ ] Manual checks are documented when automation is absent.
- [ ] Definition of Done remains satisfied.
