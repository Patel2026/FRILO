# V1 DELIVERY SPRINT PLAN — S1 à S6
## FRILO (admin custom conservé)

Version : 1.0  
Statut : VALIDÉ  
Owner : PMO + Tech Lead

---

## 1. Objectif

Planifier et exécuter la livraison V1 production en 6 sprints, avec responsabilités explicites backend/frontend/QA.

---

## 2. Owners

- Backend Lead : API, sécurité, admin custom, tests backend
- Frontend Lead : UX, contrat API, typage strict, tests frontend
- QA Lead : recette, non-régression, gates de sortie
- DevOps Owner : scripts, build, déploiement, smoke tests

---

## 3. Sprints

### Sprint S1 — Cadrage et baseline
- Geler le périmètre V1 exécutable
- Valider ADR admin custom V1
- Finaliser backlog ordonné + dépendances
- Bootstrap environnement local (backend + frontend)

### Sprint S2 — API V1 contract-first
- Stabiliser auth + erreurs standard API
- Stabiliser contrat orders (pagination + relation instruction stable)
- Corriger écarts de payload entre backend et frontend
- Ajouter premiers tests feature auth/orders

### Sprint S3 — Admin custom prêt ops
- Finaliser parcours admin commandes/templates/secteurs/clients
- Sécuriser changement de statut via service métier
- Ajouter traçabilité minimale des actions critiques
- Recette interne admin

### Sprint S4 — Frontend fiabilisé
- Typage strict services et parcours critique
- Aligner dashboard/tunnel/templates au contrat backend final
- Corriger affichages métier FCFA/statuts/états vides
- Fermer routes incomplètes du périmètre V1

### Sprint S5 — Sécurité + qualité
- Durcir CORS/throttle/logging
- Vérifier conformité DoD/RBAC/workflow
- Étendre couverture tests backend/frontend
- Préparer checklists de release

### Sprint S6 — Recette et go-live
- Exécuter recette complète (fonctionnelle + technique)
- Corriger bloquants P0/P1
- Produire release candidate et dossier de déploiement
- Déployer + smoke tests + PV de recette signé

---

## 4. Gates de sortie

- Gate A (fin S2) : API stable + tests auth/orders minimum verts
- Gate B (fin S4) : parcours visiteur -> commande -> dashboard OK
- Gate C (fin S6) : zéro blocant P0/P1, release go-live ready
