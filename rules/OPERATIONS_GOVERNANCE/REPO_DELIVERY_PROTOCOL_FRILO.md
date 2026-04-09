# REPO & DELIVERY PROTOCOL — FRILO
## Protocole Git, Branches, CI/CD et Livraison

Version : 1.0
Statut : OBLIGATOIRE

---

## 1. BRANCHING MODEL

```
main
│
├── feature/xxx
├── bugfix/xxx
├── refactor/xxx
├── docs/xxx
├── test/xxx
└── hotfix/xxx
```

`main` est la branche de référence. Toute autre branche converge vers `main` via PR.

| Branche | Usage | Protection |
|---------|-------|------------|
| `main` | Livraisons validées | Protégée |
| `feature/*` | Nouvelles fonctionnalités | Non protégée |
| `bugfix/*` | Corrections ciblées | Non protégée |
| `refactor/*` | Refactoring encadré | Non protégée |
| `docs/*` | Documentation | Non protégée |
| `test/*` | Tests | Non protégée |
| `hotfix/*` | Correction urgente production | Procédure encadrée |

---

## 2. NOMMAGE

### Branches

Format :
```
<type>/<description-courte>
```

Exemples :
```
feature/order-status-workflow
feature/filament-templates-resource
bugfix/fix-orders-cross-user-leak
refactor/extract-order-service
docs/update-api-contract
hotfix/fix-critical-auth-bypass
```

### Commits

Format (Conventional Commits) :
```
<type>(<scope>): <description>
```

Types autorisés :
- `feat` — nouvelle fonctionnalité
- `fix` — correction de bug
- `docs` — documentation uniquement
- `style` — formatage, ESLint, PSR
- `refactor` — refactoring sans changement de comportement
- `test` — ajout/modification de tests
- `chore` — maintenance, dépendances
- `perf` — amélioration performance
- `ci` — configuration CI/CD

Scopes suggérés :
- `orders` — commandes
- `templates` — templates
- `sectors` — secteurs
- `auth` — authentification
- `filament` — backoffice admin
- `frontend` — Next.js
- `api` — routes API
- `db` — migrations

Exemples :
```
feat(orders): add order status transition via OrderService
fix(auth): return 401 instead of 500 on invalid token
refactor(templates): extract TemplateService from controller
test(orders): add policy test for cross-user order access
docs(api): update API contract with orders endpoint
```

---

## 3. PULL REQUESTS

### Prérequis avant ouverture d'une PR

- [ ] Tests passent (`php artisan test`)
- [ ] ESLint sans erreurs (`npm run lint`)
- [ ] Pas de `dd()`, `console.log()`, debug laissé
- [ ] Pas de secret dans le code
- [ ] Migrations avec `up` et `down`

### Template de PR

```markdown
## Résumé
- [Ce que cette PR fait]

## Domaine métier impacté
- [ ] Catalogue (Secteurs/Templates)
- [ ] Commandes (workflow)
- [ ] Authentification
- [ ] Backoffice Filament
- [ ] Frontend Next.js

## Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests feature ajoutés/mis à jour
- [ ] Critères d'acceptation vérifiés manuellement

## Checklist sécurité
- [ ] Pas de bypass auth:sanctum
- [ ] Pas de données cross-user
- [ ] Pas de secret dans le code
- [ ] OrderService utilisé pour les transitions
```

---

## 4. DÉPLOIEMENT

### Environnements

| Env | Branche | URL |
|-----|---------|-----|
| Local dev | toute | localhost:8000 / localhost:3000 |
| Production | `main` | domaine production |

### Checklist déploiement production

- [ ] `.env` production configuré (APP_KEY, DB, MAIL)
- [ ] Migrations exécutées (`php artisan migrate --force`)
- [ ] Seeders de démo non exécutés en prod (sauf si intentionnel)
- [ ] `npm run build` réussi (Next.js)
- [ ] `php artisan config:cache` et `route:cache` exécutés
- [ ] Storage link créé (`php artisan storage:link`)
- [ ] CORS configuré pour le domaine de prod

---

## 5. RÈGLES GIT

- Push direct sur `main` interdit
- Toujours via PR avec au moins une revue
- Commits atomiques et descriptifs
- `git rebase` ou `git merge main` pour maintenir la branche à jour
- Pas de `--force` sur des branches partagées
- Pas de `--no-verify` (hooks CI)

---

## 6. ORDRE DE DÉVELOPPEMENT RECOMMANDÉ

Pour toute nouvelle fonctionnalité :

1. Migration DB (si applicable)
2. Model Eloquent
3. Service métier
4. FormRequest
5. Policy (si applicable)
6. Controller API (fin)
7. Route API
8. Tests backend
9. Service frontend (`*.service.ts`)
10. Composant React
11. Page Next.js
12. Tests frontend (si applicable)
