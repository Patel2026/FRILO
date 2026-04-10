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
- Pipeline CI minimale ajoutée (`.github/workflows/qa.yml`) pour exécuter `composer qa` + `npm run qa` sur `push`/`pull_request`.

### Phase 2 — Stabilisation API métier V1
- **Statut**: `IN PROGRESS (majoritairement couvert)`
- Déjà aligné:
  - Throttling auth dédié.
  - Endpoint public `POST /api/contact` avec validation stricte + rate limit (`throttle:contact`), incluant référence commande optionnelle.
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
  - Backoffice de suivi des demandes contact (`/admin/contact-requests`) avec statut minimal (`new/in_progress/done`) + référence commande filtrable.
- Reste à finaliser:
  - Revue complète CRUD admin sur champs sensibles + test de non-régression backoffice.

### Phase 4 — Frontend V1 contract-first
- **Statut**: `IN PROGRESS (stabilisé)`
- Déjà aligné:
  - Typage renforcé (`Order`, `OrderInstruction`, pagination, `AuthUser`).
  - Correction format FCFA + adaptation dashboard au contrat paginé.
  - KPI dashboard fiabilisés via endpoint dédié `GET /api/orders/summary` (plus de calcul sur les 5 dernières commandes uniquement).
  - Gestion session/auth centralisée sur erreurs API `401/403` (interceptor frontend + redirection claire depuis zones protégées).
  - Profil client self-service activé (`/dashboard/profile`) avec édition `name/email`, validation et persistance API.
  - Endpoint API `PUT /api/user` ajouté (validation + unicité email + tests backend).
  - Catalogue templates orienté conversion renforcé (`/templates`) avec recherche, tri, filtre budget, filtres persistants et état vide guidé.
  - Détail template rendu plus persuasif (`/templates/[id]`) avec engagements V1, révisions incluses, FAQ rapide et CTA mobile sticky.
  - Baseline accessibilité UX appliquée (focus clavier visibles, ARIA principaux sur contrôles critiques, réduction des animations si préférence utilisateur).
  - Favoris et comparaison templates activés en local (`/templates` + `/templates/compare`) avec sélection rapide depuis les cartes et le détail template.
  - Instrumentation funnel frontend activée (`view_template`, `open_preview`, `start_order`, `submit_order`) avec stockage local et compatibilité `dataLayer`.
  - Démos immersives enrichies par secteur (`/demo/[slug]/[[...page]]`) avec contenus différenciés (home/services/pricing/contact) pour meilleure immersion commerciale.
  - Route détail commande client `/dashboard/orders/[id]`.
  - États `empty` vs `error` sur dashboard et liste commandes.
  - Sidebar dashboard responsive mobile (ouvrir/fermer).
  - Auth UX public renforcée (redirection `/login`/`/register` si connecté, CTA dashboard cohérent).
  - Pages légales V1 publiées sans placeholders bloquants (`/mentions-legales`, `/cgu`) avec marquage de validation juridique finale.
  - Formulaire `/contact` branché à l’API avec états loading/success/error.
  - Tunnel commande renforcé côté réassurance (lien support contextuel + reprise brouillon local).
  - Notification email client envoyée sur changement de statut commande (pending/processing/completed/cancelled).
  - Route dashboard profil non cassée.
  - Fallbacks mocks supprimés des pages catalogue critiques (`/`, `/secteurs`, `/secteurs/[slug]`, `/templates`) avec états `error/empty`.
  - Scénario E2E dédié preview immersive (`tests/e2e/immersive-preview.spec.ts`) ajouté et validé en exécution locale.
  - Scénario E2E détail template enrichi (preuves + FAQ + CTA mobile) ajouté et validé.
  - Scénarios E2E P2 ajoutés et validés (favoris/comparaison + instrumentation funnel).
- Roadmap de fermeture frontend priorisée publiée (`FRONTEND_V1_REMAINING_ROADMAP_2026-04-10.md`).
- Matrice Lot A parcours client publiée (`LOT_A_PARCOURS_CLIENT_MATRIX_2026-04-10.md`).
- Revue UX finale des états vides/erreur sur toutes pages métier : à clôturer.

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
  - E2E métier critique automatisé (Playwright) et exécuté localement.
  - Tests backend endpoint contact (`ContactApiTest`) ajoutés.
  - Scénarios E2E expérience client (`client-experience.spec.ts`) ajoutés.
  - Scénario E2E critique étendu jusqu’au statut final `completed` (`processing -> completed`) et vérification côté client (`Livré`).
  - Variantes E2E ajoutées: échec auth dans le tunnel + template inactif non visible/inaccessible côté public.
  - Runbook release/rollback publié (`RUNBOOK_RELEASE_ROLLBACK_V1_FRILO.md`).
- Reste à finaliser:
  - Recette fonctionnelle signée (PV).
  - Validation préprod du runbook release/rollback.

## Release Gates (V1)
- **Gate A (technique)**: `PASS`  
  Build/lint/typecheck/tests exécutables et verts localement (validation du 09/04/2026).
- **Gate B (recette fonctionnelle)**: `PENDING`  
  À couvrir par campagne de recette métier complète.
- **Gate C (préprod + smoke prod)**: `PENDING`  
  À exécuter avant go-live.

## Plan d’action immédiat (2 prochaines semaines)

1. **Semaine N+1**
- Finaliser contrat API V1 documenté (payloads + erreurs + compat UI).
- Revue backoffice sur permissions/champs sensibles.
- Ajouter tests backend ciblés transitions + policies admin.
- Frontend Lot A (P0) selon `FRONTEND_V1_REMAINING_ROADMAP_2026-04-10.md` :
  - fiabilisation métriques dashboard (`DONE`),
  - gestion session expirée centralisée (`DONE`),
  - finalisation pages légales (`DONE`),
  - E2E preview immersive (`DONE`).

2. **Semaine N+2**
- Étendre E2E (notamment `processing -> completed` et cas d’échec) (`DONE`).
- Exécuter recette fonctionnelle complète et fermer P0/P1.
- Préparer release candidate (migrations, variables, rollback, smoke tests).
- Frontend Lot B (P1) :
  - profil self-service minimal (`DONE`),
  - catalogue templates orienté conversion (`DONE`),
  - détail template plus persuasif (`DONE`),
  - accessibilité UX de base (`DONE`).
- Frontend Lot C (P2) :
  - favoris/comparaison templates (`DONE`),
  - instrumentation produit funnel (`DONE`),
  - variantes immersives enrichies (`DONE`).

## Risques ouverts et mitigation
- **Version PHP locale 8.5**: warnings de dépréciation outils tiers.
  - Mitigation: figer runtime prod/preprod sur version supportée (8.3/8.4) et documenter.
- **Warnings frontend non bloquants**: dette qualité légère.
  - Mitigation: lot “cleanup lint warnings” avant RC.
- **Périmètre V1 vs extensions futures**:
  - Mitigation: garder FRILO Suite explicitement hors scope release V1.
