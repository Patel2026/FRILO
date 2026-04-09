# FRILO V1 Production — Statut d’Exécution (09/04/2026)

## Objectif
Livrer la V1 production déployable (admin Laravel custom conservé), avec un parcours complet `visiteur -> commande -> suivi client -> traitement admin`.

## Statut global par phase

### Phase 0 — Cadrage exécutable
- **Statut**: `DONE`
- Périmètre V1 acté (catalogue, auth, commande, dashboard, admin custom, SLA de suivi).
- Décision structurante documentée: admin custom maintenu pour V1.
- Backlog sprinté S1->S6 établi dans `V1_DELIVERY_SPRINT_PLAN_S1_S6_FRILO.md`.

### Phase 1 — Environnement & baseline technique
- **Statut**: `DONE`
- Backend/Frontend installables localement.
- Scripts de QA alignés:
  - Backend: `composer qa` (lint + tests).
  - Frontend: `npm run qa` (lint + typecheck + build).
- Tests backend configurés en SQLite mémoire pour exécution locale reproductible.

### Phase 2 — Stabilisation API métier V1
- **Statut**: `IN PROGRESS (majoritairement couvert)`
- Déjà aligné:
  - Throttling auth dédié.
  - Validation `template actif` sur création commande.
  - Pagination `GET /api/orders`.
  - Contrat de réponse harmonisé (order + instruction).
  - Format d’erreurs API standardisé.
- Reste à finaliser:
  - Contrat final figé dans la doc API + exemples de payloads versionnés.

### Phase 3 — Admin custom prêt production
- **Statut**: `IN PROGRESS`
- Déjà aligné:
  - Statut commande validé via enum/couche service.
  - Contrôles d’accès/autorisations renforcés.
  - Logs opérationnels de changement de statut.
- Reste à finaliser:
  - Revue complète CRUD admin sur champs sensibles + test de non-régression backoffice.

### Phase 4 — Frontend V1 contract-first
- **Statut**: `IN PROGRESS (avancé)`
- Déjà aligné:
  - Typage renforcé (`Order`, `OrderInstruction`, pagination, `AuthUser`).
  - Correction format FCFA + adaptation dashboard au contrat paginé.
  - Route dashboard profil non cassée.
- Reste à finaliser:
  - Nettoyage des warnings ESLint non bloquants.
  - Revue UX complète des états vides/erreur sur toutes pages métier.

### Phase 5 — Sécurité, qualité, observabilité
- **Statut**: `IN PROGRESS`
- Déjà aligné:
  - CORS restreint par variable d’environnement.
  - Throttle auth appliqué.
  - Logs structurés sur auth + commandes + transitions.
- Reste à finaliser:
  - Checklist OWASP V1 signée.
  - Audit final RBAC avec preuves de test.

### Phase 6 — Tests, recette, release
- **Statut**: `IN PROGRESS`
- Déjà aligné:
  - Backend: `composer qa` vert.
  - Frontend: `npm run qa` vert.
- Reste à finaliser:
  - Scénarios E2E métier automatisés.
  - Recette fonctionnelle signée (PV).
  - Runbook de release prod + rollback validé en préprod.

## Release Gates (V1)
- **Gate A (technique)**: `PASS`  
  Build/lint/typecheck/tests exécutables et verts localement.
- **Gate B (recette fonctionnelle)**: `PENDING`  
  À couvrir par campagne de recette métier complète.
- **Gate C (préprod + smoke prod)**: `PENDING`  
  À exécuter avant go-live.

## Plan d’action immédiat (2 prochaines semaines)

1. **Semaine N+1**
- Finaliser contrat API V1 documenté (payloads + erreurs + compat UI).
- Revue backoffice sur permissions/champs sensibles.
- Ajouter tests backend ciblés transitions + policies admin.

2. **Semaine N+2**
- Mettre en place E2E parcours critique (commande + suivi + traitement admin).
- Exécuter recette fonctionnelle complète et fermer P0/P1.
- Préparer release candidate (migrations, variables, rollback, smoke tests).

## Risques ouverts et mitigation
- **Version PHP locale 8.5**: warnings de dépréciation outils tiers.
  - Mitigation: figer runtime prod/preprod sur version supportée (8.3/8.4) et documenter.
- **Warnings frontend non bloquants**: dette qualité légère.
  - Mitigation: lot “cleanup lint warnings” avant RC.
- **Périmètre V1 vs extensions futures**:
  - Mitigation: garder FRILO Suite explicitement hors scope release V1.

