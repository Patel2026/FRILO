# DECISIONS — FRILO
## Registre des Décisions d'Architecture (ADR)

**Ce fichier est le registre canonique unique des décisions d'architecture du projet FRILO.**
Toute décision structurante doit être ajoutée ici. Aucun autre fichier ne doit dupliquer ce registre.

---

## ADR-001 — Framework backend : Laravel

**Statut** : VALIDÉ
**Date** : 2026-04
**Décision** : Laravel 11 (PHP 8.3+) est le framework backend.
**Raison** : Ecosystème robuste, Filament pour admin, Sanctum pour auth, large communauté.
**Conséquences** : Toute logique backend est en Laravel. Pas d'autre framework PHP.

---

## ADR-002 — Framework frontend : Next.js

**Statut** : VALIDÉ
**Date** : 2026-04
**Décision** : Next.js 15 (TypeScript) est le framework frontend client.
**Raison** : SSR/SSG pour SEO, App Router, composants React, Tailwind.
**Conséquences** : Pas de Vue, Svelte ou autre framework. Tailwind CSS pour le style.

---

## ADR-003 — Authentification : Laravel Sanctum (token)

**Statut** : VALIDÉ
**Date** : 2026-04
**Décision** : Auth via token Bearer (Sanctum), stocké en localStorage côté client.
**Raison** : Architecture découplée Next.js ↔ Laravel API.
**Conséquences** : Pas de session cookie pour l'API. Token géré manuellement par `authService`.

---

## ADR-004 — Backoffice admin : Filament

**Statut** : VALIDÉ
**Date** : 2026-04
**Décision** : Filament est utilisé comme backoffice admin FRILO.
**Raison** : Génération automatique CRUD, interface moderne, intégration Laravel native.
**Conséquences** : L'admin n'est pas dans Next.js. Les opérateurs FRILO accèdent à `/admin`.

---

## ADR-005 — Base de données : MySQL 8

**Statut** : VALIDÉ
**Date** : 2026-04
**Décision** : MySQL 8 est la base de données cible.
**Raison** : Standard, compatible Laravel Eloquent, hébergement facile.
**Conséquences** : Pas de PostgreSQL ou SQLite en production.

---

## ADR-006 — Devise : FCFA

**Statut** : VALIDÉ
**Date** : 2026-04
**Décision** : Les prix sont exprimés en FCFA.
**Raison** : Marché cible Afrique francophone.
**Conséquences** : Affichage `.toLocaleString()` + "FCFA" partout côté client.

---

## ADR-007 — Paiement : simulé en V1

**Statut** : VALIDÉ
**Date** : 2026-04
**Décision** : Le paiement est simulé en V1 (bouton "Simuler le paiement validé").
**Raison** : Intégration Stripe/Mobile Money non finalisée.
**Conséquences** : La commande est créée sans transaction réelle. À remplacer en V2.

---

## ADR-008 — Logique métier : Services Laravel

**Statut** : VALIDÉ
**Date** : 2026-04
**Décision** : Toute logique métier passe par des Services dédiés, jamais dans les Controllers.
**Raison** : Testabilité, séparation des responsabilités, cohérence architecture.
**Conséquences** : Controllers fins. Toute règle métier dans `OrderService`, `TemplateService`, etc.

---

## ADR-009 — Séparation stricte public / admin

**Statut** : VALIDÉ
**Date** : 2026-04
**Décision** : L'espace public (Next.js) et le backoffice (Filament `/admin`) sont deux applications distinctes.
**Raison** : Sécurité, séparation des concerns, déploiement indépendant.
**Conséquences** : Aucun composant admin ne doit être exposé côté public. L'API REST est la seule interface entre les deux.

---

## ADR-010 — Priorité des invariants techniques en cas de conflit avec le Business Plan

**Statut** : VALIDÉ  
**Date** : 2026-04
**Décision** : En cas de divergence entre Business Plan et documentation technique, les invariants techniques validés dans `rules/` restent la source de vérité d'implémentation.
**Raison** : Préserver la cohérence du socle produit et éviter des bascules d'architecture non maîtrisées.
**Conséquences** : Le Business Plan est traduit en gouvernance d'exécution via le bloc `BUSINESS_EXECUTION`, sans modifier les invariants techniques sans ADR explicite.

---

## ADR-011 — Ajout d'un bloc de gouvernance business/exécution

**Statut** : VALIDÉ  
**Date** : 2026-04
**Décision** : Création d'un bloc documentaire `rules/BUSINESS_EXECUTION` avec owners, versioning, roadmap trimestrielle et operating rhythm.
**Raison** : Fermer l'écart entre stratégie business et exécution opérationnelle.
**Conséquences** : Les décisions liées au go-to-market, SOP, finance, expansion et FRILO Suite sont pilotées dans ce bloc et revues mensuellement.

---

## ADR-012 — Backoffice V1 : admin Laravel custom (Filament reporté)

**Statut** : VALIDÉ  
**Date** : 2026-04
**Décision** : Pour la livraison V1 production, le backoffice reste implémenté en admin Laravel custom sous `/admin`.
**Raison** : Le code admin custom est déjà avancé et opérationnel; migrer vers Filament dans ce cycle augmente le risque et retarde le go-live.
**Conséquences** : L'alignement documentaire V1 doit considérer l'admin custom comme référence d'exécution. Une éventuelle migration Filament devient un chantier post-V1 sous ADR dédié.

---

*Toute nouvelle décision d'architecture doit être ajoutée ici, jamais ailleurs.*
