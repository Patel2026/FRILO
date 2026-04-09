# E2E CRITICAL PATH — FRILO V1
## Parcours métier automatisé (Playwright)

Version : 1.1  
Statut : ACTIF  
Owner : QA Lead

---

## 1. Objectif

Automatiser le scénario critique V1 de bout en bout :

`visiteur -> commande -> traitement admin -> suivi client`

Implémentation actuelle :
- Test Playwright : `frontend/tests/e2e/critical-path.spec.ts`
- Tests Playwright UX client : `frontend/tests/e2e/client-experience.spec.ts`
- Configuration : `frontend/playwright.config.ts`

---

## 2. Pré-requis d’exécution

- Stack démarrée :
  - Frontend : `http://localhost:3000`
  - Backend/admin : `http://localhost:8080`
- Base migrée + seedée (comptes démo disponibles)
- Navigateur Playwright Chromium installé

---

## 3. Commandes

Depuis `frontend/` :

```bash
npm run e2e
```

Mode visible :

```bash
npm run e2e:headed
```

---

## 4. Couverture actuelle

Le test critique couvre :

1. Visiteur ouvre le catalogue templates.
2. Visiteur ouvre un template et démarre la commande.
3. Inscription client dans le tunnel.
4. Saisie des détails projet.
5. Validation paiement simulé et création de commande.
6. Vérification commande côté dashboard client (`En attente`).
7. Connexion admin `/admin` et passage en `processing` (`En cours`).
8. Vérification côté dashboard client du statut mis à jour (`En cours`).

Le lot UX client couvre aussi :

1. Redirection `/login` et `/register` quand session active.
2. Espace public avec CTA `Dashboard` (pas de `Connexion`/`Inscription` quand authentifié).
3. Bypass étape auth du tunnel pour client déjà connecté.
4. Soumission formulaire contact réel (`POST /api/contact`).
5. Accès client au détail commande `/dashboard/orders/{id}`.

---

## 5. Variables d’environnement optionnelles

- `E2E_FRONTEND_URL` (défaut : `http://localhost:3000`)
- `E2E_BACKEND_URL` (défaut : `http://localhost:8080`)

---

## 6. Gaps restants

- Ajouter un scénario `processing -> completed`.
- Ajouter une variante d’échec auth et template inactif.
- Intégrer l’exécution E2E en préprod avant Gate C.
