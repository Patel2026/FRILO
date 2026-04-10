# FRONTEND V1 — ROADMAP RESTANTE (10/04/2026)
## Priorisation P0 / P1 / P2 exécutable

Version : 1.0  
Statut : VALIDÉ (travail immédiat)  
Owner : Frontend Lead + QA Lead + Product Owner

---

## 1. Objectif

Fermer les écarts restants de l'expérience client FRILO côté frontend pour atteindre une V1 production cohérente, stable et exploitable, sans élargir le scope V2/V3.

---

## 2. Règles de scope (rappel)

- `IN SCOPE V1` : qualité UX, robustesse parcours client, cohérence contract-first API/UI, fiabilité opérationnelle.
- `OUT OF SCOPE V1` :
  - paiement transactionnel réel (simulation conservée),
  - reset password technique complet (mode support conservé),
  - extension FRILO Suite.

---

## 3. Priorités d'exécution

## P0 — Critique release (à fermer avant Gate B)

### P0.1 Dashboard : métriques fiables et non ambiguës
- Statut : `DONE` (10/04/2026)
- Problème : les compteurs dashboard sont calculés sur un sous-ensemble (5 commandes).
- Action : basculer sur métriques dédiées backend ou récupération paginée exhaustive pour calcul fiable.
- Critère de sortie :
  - les compteurs `Commandes / En cours / Livrées` reflètent la réalité totale du compte.

### P0.2 Robustesse session/auth côté client
- Statut : `DONE` (10/04/2026)
- Problème : pas de stratégie globale homogène sur erreurs 401/403.
- Action : ajouter gestion centralisée (interceptor API + politique de retry/logout + redirection claire).
- Critère de sortie :
  - tout endpoint protégé gère session expirée sans état incohérent UI.

### P0.3 Cohérence légale V1 publiable
- Statut : `DONE` (10/04/2026)
- Problème : placeholders juridiques visibles en production.
- Action : finaliser contenu légal validé (ou marquage explicite environnement non-prod).
- Critère de sortie :
  - aucune mention `[À COMPLÉTER]` sur pages légales de la release.

### P0.4 Couverture E2E des nouveautés immersives
- Statut : `DONE` (10/04/2026)
- Problème : pas de scénario automatisé dédié à `/templates/[id]/preview` et navigation `/demo/...`.
- Action : ajouter scénarios Playwright desktop/mobile pour preview immersive.
- Critère de sortie :
  - scénario E2E preview immersive vert en CI.

---

## P1 — Renforcement expérience client (immédiat post-P0)

### P1.1 Profil client éditable (self-service minimum)
- Statut : `DONE` (10/04/2026)
- Ajouter édition `name` + `email` avec validations et feedback UX.
- Conserver mot de passe oublié en mode support (scope V1 respecté).
- Critère : client peut modifier ses infos sans intervention manuelle.

### P1.2 Catalogue templates orienté conversion
- Statut : `DONE` (10/04/2026)
- Ajouter recherche, tri (prix/secteur), filtres persistants et états vides mieux guidés.
- Critère : utilisateur trouve un template cible en moins de 3 interactions.

### P1.3 Détail template plus persuasif
- Statut : `DONE` (10/04/2026)
- Ajouter blocs de preuve (livrable inclus, délai, révisions, FAQ courte, CTA sticky).
- Critère : page détail exploitable comme page de décision.

### P1.4 Accessibilité UX de base
- Statut : `DONE` (10/04/2026)
- Revue contrastes, focus states clavier, labels/form controls, aria essentiels.
- Critère : audit manuel AA de base sans blocant critique.

---

## P2 — Optimisations non bloquantes V1

### P2.1 Favoris / comparaison templates
- Statut : `DONE` (10/04/2026)
- Sauvegarde locale de templates favoris + vue comparaison simple.

### P2.2 Instrumentation produit
- Statut : `DONE` (10/04/2026)
- Événements analytics funnel (`view_template`, `open_preview`, `start_order`, `submit_order`).

### P2.3 Variantes immersives enrichies
- Statut : `DONE` (10/04/2026)
- Présets par secteur plus riches (contenu, blocs, médias) pour démos commerciales.

---

## 4. Cadence recommandée (3 lots)

1. **Lot A (Semaine N+1)** — fermer P0.1 à P0.4.
2. **Lot B (Semaine N+2 à N+3)** — fermer P1.1 à P1.4.
3. **Lot C (Semaine N+4+)** — traiter P2 selon capacité et feedback terrain.

---

## 5. Gates de validation

- **Gate Front-P0** :
  - `npm run qa` vert,
  - E2E critique + immersion verts,
  - zéro blocant UX P0 ouvert.
- **Gate Front-P1** :
  - parcours client bout-en-bout validé sur desktop/mobile,
  - profil self-service actif,
  - catalogue filtrable et utilisable en production.

---

## 6. Dépendances backend/doc

- Endpoint métriques dashboard (ou contrat équivalent) si option backend retenue.
- Validation juridique finale des pages légales.
- Mise à jour des documents `rules/QUALITY_ASSURANCE/*` après clôture de chaque lot.

---

## 7. KPI de pilotage frontend

- Taux de succès E2E parcours client : `>= 98%`.
- Taux d'échec API visible côté client (4xx/5xx non gérés) : `< 1%`.
- Temps moyen pour atteindre une page template cible (test utilisateur interne) : `<= 60s`.
- Nombre de tickets P0 frontend ouverts : `0` avant release candidate.
