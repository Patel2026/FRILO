---
name: platform-settings-change
description: Change FRILO platform settings, revisions, payment configuration, or runtime settings behavior safely.
allowed-tools: Read, Edit, Write, Bash, Glob, Grep
---

# Skill: platform-settings-change

## Description
Modify settings sections, revision lifecycle, payment config test/publish/restore behavior, or runtime fallback.

## Trigger Condition
Use for `PlatformSettingsService`, settings controllers/requests/views, settings migrations, or payment settings.

## Inputs Required
- Settings section.
- Runtime impact.

## Steps
1. Load platform settings architecture/rules and payment/deployment rules if relevant.
2. Inspect service, controller, request, model, view, and tests.
3. Preserve draft/published lifecycle and audit trail.
4. Implement focused change.
5. Verify publish/restore/runtime behavior.

## Verification Steps
- [ ] Published revision semantics remain intact.
- [ ] Secrets are masked and secure.
- [ ] Payment config validation remains enforced.
- [ ] Runtime fallback remains known.

## Output Format
Settings impact, files changed, tests, rollback notes.

## Failure Handling
Pause before production-impacting settings or payment config changes.

## Skill Dependencies
Invoke `platform-settings-reviewer`; may invoke `payment-webhook-reviewer`.

## Feedback Loop
Max iterations : 2
Exit condition : Reviewer SAFE and settings checks pass.
Escalate when : Payment runtime, secret storage, or publish lifecycle changes.
