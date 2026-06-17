# External Skills Architecture

## Installed Skills

| Skill | Repo | Scope | Install command | Post-setup done |
|-------|------|-------|-----------------|-----------------|
| Karpathy Guidelines | forrestchang/andrej-karpathy-skills | project root `CLAUDE.md` | curl append | yes |
| Superpowers | obra/superpowers | environment/plugin | plugin/environment available | yes in current Codex environment |
| Impeccable | pbakaus/impeccable | local `.agents/skills/impeccable` | `npx skills add pbakaus/impeccable` | yes — `PRODUCT.md`, `DESIGN.md`, and `.impeccable/live/config.json` generated |
| OWASP Security | agamm/claude-code-owasp | project `.claude/skills/owasp-security` | curl to `.claude/skills/owasp-security/SKILL.md` | yes |
| Varlock | wrsmith108/varlock-claude-skill | personal `~/.claude/skills/varlock` | curl/personal install; existing symlink observed | yes |
| Anthropic frontend-design | anthropics/frontend-design | not installed | `npx skills add anthropics/frontend-design`; `npx skills add git@github.com:anthropics/frontend-design.git` | failed: GitHub authentication; skills search found no official public match |

## Integration Map

| External skill / command | Invoked from | Trigger condition |
|--------------------------|-------------|-------------------|
| Superpowers brainstorming | `workflows/feature-development.md` | Before major feature or behavior design |
| Superpowers systematic debugging | `workflows/bugfix.md` | Before fixing a reproduced bug |
| Superpowers verification-before-completion | all workflows | Before claiming work complete |
| Impeccable audit/polish/harden | `workflows/ui-change.md`, `workflows/release-readiness.md` | UI change or pre-release UI hardening |
| OWASP Security | `workflows/auth-security-change.md` | Auth, RBAC, payment, webhook, input, public API, secrets |
| Varlock | `workflows/auth-security-change.md` | Any `.env`, secret, token, credential, key, or sensitive config work |

## Update Protocol

- Keep `.agents/skills/impeccable` local unless the team chooses to vendor it.
- Do not duplicate external skill content in project wrapper skills.
- Refresh `PRODUCT.md` and `DESIGN.md` through Impeccable init/document when FRILO positioning or visual system changes materially.
- Re-check OWASP and Varlock sources before security-sensitive release hardening.

## Known Limitations

`.agents/` and `.impeccable/` are ignored by Git and are not team-shared. `PRODUCT.md` and `DESIGN.md` are versioned as shared project context. `anthropics/frontend-design` is unavailable from this environment because HTTPS and SSH installs both failed with GitHub authentication.
