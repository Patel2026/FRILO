# AGENT CONTRACT — FRILO
## Contrat Opératoire des Agents IA

Version : 1.0
Statut : OBLIGATOIRE

---

## 1. PORTÉE

Ce document s'applique à tout agent IA (Claude Code ou autre) intervenant sur ce dépôt.

Il fixe :
- la hiérarchie des références
- les invariants techniques et métier
- les limites d'action d'un agent
- les cas nécessitant validation humaine

---

## 2. HIÉRARCHIE DES RÉFÉRENCES

En cas de doute, appliquer dans l'ordre :

1. Instruction explicite du commanditaire
2. Contraintes de sécurité → `rules/SECURITY_ACCESS/MASTER_SECURITY_FRILO.md`
3. `rules/STRATEGY_FOUNDATION/01_PROJECT_CHARTER_FRILO.md`
4. `rules/BUSINESS_EXECUTION/*` (gouvernance d'exécution business validée)
5. `rules/PRODUCT_SPEC/02_ARCHITECTURE_BASELINE_FRILO.md`
6. `rules/PRODUCT_SPEC/05_DOMAIN_MODEL_FRILO.md`
7. `rules/OPERATIONS_GOVERNANCE/CHANGE_POLICY_FRILO.md`
8. `rules/PRODUCT_SPEC/04_DEFINITION_OF_DONE_FRILO.md`
9. `rules/PRODUCT_SPEC/03_ACCEPTANCE_CRITERIA_FRILO.md`
10. `rules/OPERATIONS_GOVERNANCE/REPO_DELIVERY_PROTOCOL_FRILO.md`
11. Backlog validé
12. `rules/STRATEGY_FOUNDATION/DECISIONS_FRILO.md`

**Règle de conflit** : si deux références se contredisent, l'agent documente le conflit et escalade. Il n'applique pas de compromis non validé.

---

## 3. INVARIANTS TECHNIQUES NON NÉGOCIABLES

- Framework backend : Laravel 11, PHP 8.3+
- Base de données : MySQL 8
- Frontend client : Next.js 15, TypeScript
- Style : Tailwind CSS
- Auth : Laravel Sanctum (token Bearer)
- Admin backoffice : `/admin` (Laravel custom en V1)
- Devise : FCFA
- Branche protégée : `main`

---

## 4. INVARIANTS MÉTIER (CRITIQUE)

- Une commande `completed` est immuable — aucun champ modifiable.
- Une commande `cancelled` est immuable — aucun champ modifiable.
- Le prix d'une commande est snapshotté à la création — jamais modifiable.
- Toute transition de statut passe par `OrderService` — jamais par `Order::update()` direct.
- Un template inactif ne peut pas être commandé.
- Un client ne voit que ses propres commandes.
- Les `OrderInstruction` sont créées avec leur `Order` dans une transaction.

---

## 5. RÈGLES DE COMPORTEMENT D'UN AGENT

### Doit toujours
- Lire le contexte existant avant d'agir
- Identifier le domaine métier touché (Catalogue, Commande, Auth, Admin)
- Préférer les changements les plus petits, explicites et réversibles
- Respecter le principe **additive first** (ajouter avant de modifier)
- Documenter ses hypothèses

### Ne doit jamais
- Modifier le répertoire `vendor/`
- Exposer des secrets, tokens, passwords dans le code ou les logs
- Contourner `auth:sanctum`, `OrderPolicy` ou `OrderService`
- Placer de la logique métier dans un Controller
- Modifier `Order::status` directement via `update()`
- Créer une règle métier non demandée
- Modifier silencieusement le comportement de l'API publique

---

## 6. ANTI-DÉRIVE AGENT

**Interdit :**
- Introduire une règle implicite non documentée
- "Réparer" un flux de commande en contournant `OrderService`
- Simplifier un contrôle RBAC en hardcodant des exceptions
- Ajouter une fonctionnalité non demandée dans le ticket

**Obligatoire :**
- Toute évolution de logique métier = explicitement justifiée et tracée
- Tout changement de RBAC, security, workflow = validation humaine d'abord

---

## 7. CLASSIFICATION DES ACTIONS PAR RISQUE

### LOW
- Documentation, typos, commentaires
- Refactoring mineur sans impact métier
- Ajout de composant UI non sensible

### MEDIUM
- Nouveau service ou controller non critique
- Tests
- Vues dashboard sans impact workflow

### HIGH (validation humaine avant implémentation)
- Authentification, tokens, sécurité
- Workflow commande (transitions, statuts)
- RBAC, Policies, middlewares
- Migrations de schéma
- Exposition de nouvelles données via l'API
- Intégration paiement

---

## 8. ZONES SENSIBLES — VALIDATION HUMAINE OBLIGATOIRE

Validation humaine requise si l'agent touche :
- `auth:sanctum`, tokens, passwords
- `OrderPolicy`, middlewares
- `OrderService::updateStatus()`
- Migrations structurantes (`orders`, `users`)
- Routes API exposées publiquement
- Intégration paiement (Stripe/Mobile Money)
- Variables d'environnement sensibles
- Configuration CORS

---

## 9. RÈGLES TECHNIQUES MINIMALES

Tout code produit doit respecter :
- Controllers fins — logique dans Services
- `FormRequest` pour validation
- `Policy` pour autorisation
- PSR-12 côté PHP, ESLint côté TypeScript
- Pas de `any` TypeScript non justifié
- Pas de token ou secret dans le code source
- Eager loading sur les relations utilisées (`with()`)
- Pagination sur les listes API

---

## 10. RÈGLES DOCUMENTAIRES

Quand un agent modifie le fond du projet :
- Nouvelle décision d'architecture → `rules/STRATEGY_FOUNDATION/DECISIONS_FRILO.md`
- Changement sécurité → aligner `MASTER_SECURITY_FRILO.md`
- Changement périmètre → aligner `01_PROJECT_CHARTER_FRILO.md`
- Changement workflow commande → aligner `WORKFLOW_COMMANDE_FRILO.md`
- Changement schéma DB → aligner `DATA_MODEL_FRILO.md`
- Changement business (pricing, SLA, phases, GTM, expansion) → aligner `rules/BUSINESS_EXECUTION/*`

---

## 11. LIVRAISON — CHECKLIST AGENT

À la fin d'une intervention, l'agent doit pouvoir expliquer :
- Ce qui a été changé et pourquoi
- Quels fichiers ont été touchés
- Quel domaine métier est impacté
- Quels tests ont été vérifiés
- Quelles limites ou actions restantes subsistent

---

## 12. ESCALADE IMMÉDIATE

Escalade obligatoire si l'agent rencontre :
- Contradiction entre deux documents de gouvernance
- Risque de fuite de données client
- Besoin de suppression irréversible de données
- Doute sur une règle de transition de commande
- Doute sur l'exposition d'une donnée via l'API publique

---

*Tout agent intervenant sur ce dépôt est réputé accepter ce contrat.*
*En cas de doute : suspendre, documenter, escalader.*
