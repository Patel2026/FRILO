# RUNBOOK RELEASE & ROLLBACK — FRILO V1
## Procédure opérationnelle de mise en production

Version : 1.0  
Statut : ACTIF  
Owner : Backend Lead + Ops Lead

---

## 1. Objectif

Garantir un déploiement V1 répétable, vérifiable et réversible.

---

## 2. Entrées obligatoires (Go/No-Go)

- Gate A : `PASS` (QA backend + frontend verts)
- Gate B : recette fonctionnelle signée (PV)
- Changements approuvés en PR
- Fenêtre de déploiement validée
- Plan rollback validé et testé sur préprod

---

## 3. Checklist pré-déploiement

1. Vérifier sauvegarde DB récente.
2. Vérifier variables d’environnement prod (`APP_KEY`, DB, MAIL, CORS, SANCTUM).
3. Vérifier artefacts build frontend.
4. Vérifier migration(s) à exécuter et impact attendu.
5. Vérifier disponibilité de l’équipe pendant le déploiement (dev + ops + QA).

---

## 4. Procédure release

1. Basculer sur la version/tag validé.
2. Backend :
   - `composer install --no-dev --optimize-autoloader`
   - `php artisan migrate --force`
   - `php artisan config:cache`
   - `php artisan route:cache`
3. Frontend :
   - `npm ci`
   - `npm run build`
   - redémarrer le process applicatif
4. Vérifier disponibilité API + frontend + admin.

---

## 5. Smoke tests post-déploiement (obligatoires)

1. `GET /api/sectors` retourne 200.
2. Login client OK (`/api/login`).
3. Création commande test OK (`/api/orders`).
4. Dashboard client affiche la commande.
5. Admin `/admin` accessible et changement statut possible.
6. Logs applicatifs sans erreur bloquante.

---

## 6. Critères de rollback immédiat

- Incident P0 sécurité.
- Régression critique sur tunnel commande.
- API indisponible > 5 minutes.
- Impossible de traiter les commandes dans le backoffice.

---

## 7. Procédure rollback

1. Revenir au tag/version précédente.
2. Redéployer backend/frontend version N-1.
3. Si migration destructive détectée : restaurer snapshot DB.
4. Purger/recharger cache applicatif.
5. Rejouer smoke tests de validation rollback.
6. Ouvrir incident + postmortem + action corrective.

---

## 8. Traçabilité et communication

- Journal de déploiement horodaté (début/fin, version, owner).
- Décision Go/No-Go documentée.
- Incident/rollback communiqué aux stakeholders.
- Mise à jour du statut dans `V1_PRODUCTION_EXECUTION_STATUS_2026-04-09.md`.
