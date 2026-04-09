# 04 - DEFINITION OF DONE (DoD) — FRILO

## Objectif
Définir les critères obligatoires pour considérer une fonctionnalité comme livrée, testée, sécurisée et conforme au projet FRILO.

## Portée
Toutes les fonctionnalités du système (Frontend Next.js + Backend Laravel + Admin Filament).

---

## 1. CODE QUALITY

### Backend (Laravel)
- PSR-12 respecté
- Types PHP 8.3+ (type hints obligatoires)
- Enums pour les statuts (`pending`, `processing`, `completed`, `cancelled`)
- Aucun `dd()`, `var_dump()`, `dump()` ou code de debug
- Aucun `TODO` / `FIXME` non résolu

### Frontend (Next.js)
- ESLint sans erreurs
- TypeScript strict (pas de `any` non justifié)
- Aucun `console.log()` laissé en production
- Composants purs, logique dans les services

---

## 2. WORKFLOW MÉTIER (CRITIQUE)

Une feature touchant le cycle de vie des commandes est DONE seulement si :

- transitions de statut respectées (`pending → processing → completed`)
- aucune transition illégale possible (`completed → pending` interdit)
- toute transition passe par `OrderService`, jamais par `Order::update()` direct
- statut `completed` verrouillé (aucune modification possible)

---

## 3. RBAC (OBLIGATOIRE)

Chaque action protégée doit :

- vérifier le token Sanctum via middleware `auth:sanctum`
- vérifier la Policy Laravel si applicable (`OrderPolicy`)
- retourner HTTP 401 si non authentifié
- retourner HTTP 403 si non autorisé
- empêcher tout accès cross-client (client A ne voit pas les commandes de client B)

---

## 4. TESTS

Chaque feature backend doit inclure :

- Happy path (cas nominal)
- Cas non authentifié (401)
- Cas non autorisé (403)
- Validation échouée (422)
- Transition de statut invalide si applicable

Commandes :
```bash
php artisan test
```

---

## 5. SÉCURITÉ

- CSRF protection activée
- Validation via FormRequest sur toutes les routes mutantes
- Aucun secret dans le code source (utiliser `.env`)
- CORS configuré (origines autorisées uniquement)
- Upload fichiers sécurisés si applicable (type, taille)

---

## 6. BASE DE DONNÉES

- Migrations `up` et `down` fonctionnelles
- Index présents sur les colonnes filtrées
- Clés étrangères avec contraintes
- Soft delete sur les entités critiques (`orders`)

---

## 7. FRONTEND

- Composant responsive (mobile + desktop)
- États de chargement gérés (`loading`, `error`, `empty`)
- Pas de données hardcodées qui devraient venir de l'API
- Gestion des erreurs réseau (catch + message utilisateur)

---

## 8. BACKOFFICE

- Resource Filament correctement configurée
- Champs sensibles non éditables directement (ex: prix snapshot)
- Permissions Filament cohérentes avec les rôles

---

## 9. VALIDATION FINALE

Une feature est DONE si :

- tous les tests passent (`php artisan test`)
- les critères d'acceptation (03_ACCEPTANCE_CRITERIA) sont validés
- la sécurité est vérifiée
- aucune régression introduite
- le PR est relu et approuvé

---

## RÈGLE ABSOLUE

Si un seul critère n'est pas respecté → NON DONE.
