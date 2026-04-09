# BACKLOG PRODUIT — FRILO

Version : 1.1
Statut : V1/V2/V3 — Planifié et en exécution

---

# STRUCTURATION PAR HORIZONS

## Horizon H1 — Build V1 (2026)

Objectif : livrer un socle produit stable (catalogue + commande + dashboard + admin) avec conformité sécurité/workflow.

### Critères d'entrée
- architecture de référence validée
- backlog technique priorisé
- équipe delivery opérationnelle

### Critères de sortie
- objectifs V1 critiques validés
- SLA livraison opérationnel
- base clients active et process stable

---

## Horizon H2 — Scale Ops (2026 fin -> 2027)

Objectif : industrialiser l'acquisition et les opérations, sécuriser la marge, préparer expansion.

### Critères d'entrée
- H1 clôturé
- métriques de base pilotées mensuellement

### Critères de sortie
- performance commerciale stable
- readiness expansion validée
- modules FRILO Suite phase 2 prêts

---

## Horizon H3 — Suite & Expansion (2027 -> 2028+)

Objectif : lancer FRILO Suite et dupliquer le modèle dans d'autres pays cibles.

### Critères d'entrée
- gates Phase 2 validés
- gouvernance multi-pays prête

### Critères de sortie
- traction régionale confirmée
- part de revenus récurrents en croissance soutenue
- modèle opérationnel duplicable

---

# EPIC 1 — CATALOGUE

## FEATURE 1.1 — Secteurs

### US-1.1.1 — Lister les secteurs actifs
Acteur : Visiteur
Priorité : CRITIQUE

Critères :
- Given visiteur anonyme
- When GET /api/sectors
- Then liste des secteurs is_active = true retournée

Tâches :
- [ ] Migration `sectors`
- [ ] Model `Sector`
- [ ] `SectorController::index()`
- [ ] Seeder (6 secteurs de base)
- [ ] Route GET /api/sectors
- [ ] Test feature

---

## FEATURE 1.2 — Templates

### US-1.2.1 — Lister les templates (avec filtre secteur)
Acteur : Visiteur
Priorité : CRITIQUE

Critères :
- Given visiteur anonyme
- When GET /api/templates?sector_slug=restaurants
- Then liste des templates actifs du secteur

Tâches :
- [ ] Migration `templates`
- [ ] Model `Template`
- [ ] `TemplateService`
- [ ] `TemplateController::index()` + `show()`
- [ ] Seeder (2-3 templates par secteur)
- [ ] Routes
- [ ] Tests feature

### US-1.2.2 — Resource Filament Templates
Acteur : Admin
Priorité : HIGH

Critères :
- Given admin connecté
- When accède à /admin/templates
- Then CRUD complet disponible

Tâches :
- [ ] `TemplateResource` Filament
- [ ] Upload thumbnail
- [ ] Toggle is_active

---

# EPIC 2 — AUTHENTIFICATION CLIENT

## FEATURE 2.1 — Inscription

### US-2.1.1 — Créer un compte client
Acteur : Visiteur
Priorité : CRITIQUE

Critères :
- Given visiteur avec email non existant
- When POST /api/register avec données valides
- Then compte créé + token retourné

Tâches :
- [ ] `RegisterRequest` (validation)
- [ ] `AuthController::register()`
- [ ] Retour token Sanctum
- [ ] Tests

---

## FEATURE 2.2 — Connexion

### US-2.2.1 — Se connecter
Acteur : Client
Priorité : CRITIQUE

Tâches :
- [ ] `LoginRequest`
- [ ] `AuthController::login()`
- [ ] `AuthController::logout()`
- [ ] `AuthController::user()`
- [ ] Tests

---

# EPIC 3 — TUNNEL DE COMMANDE

## FEATURE 3.1 — Création de commande

### US-3.1.1 — Passer une commande
Acteur : Client authentifié
Priorité : CRITIQUE

Critères :
- Given client connecté avec template actif
- When POST /api/orders avec détails valides
- Then Order créée (status=pending) + OrderInstruction créée dans transaction

Tâches :
- [ ] Migration `orders`
- [ ] Migration `order_instructions`
- [ ] Model `Order` + `OrderInstruction`
- [ ] `OrderService::createOrder()`
- [ ] `CreateOrderRequest` (validation)
- [ ] `OrderController::store()`
- [ ] Snapshot prix depuis template
- [ ] Event `OrderCreated`
- [ ] Email confirmation client
- [ ] Tests unitaires `OrderService`
- [ ] Tests feature endpoint

---

## FEATURE 3.2 — Listing des commandes client

### US-3.2.1 — Voir mes commandes
Acteur : Client authentifié
Priorité : HIGH

Critères :
- Given client connecté
- When GET /api/orders
- Then uniquement ses propres commandes (OrderPolicy)

Tâches :
- [ ] `OrderPolicy`
- [ ] `OrderController::index()` filtré par user_id
- [ ] Eager loading template + sector + instructions
- [ ] Tests policy cross-user

---

# EPIC 4 — BACKOFFICE ADMIN

## FEATURE 4.1 — Gestion des commandes

### US-4.1.1 — Voir et gérer les commandes
Acteur : Admin
Priorité : HIGH

Tâches :
- [ ] `OrderResource` Filament
- [ ] Filtres statut + date
- [ ] Action changement statut via `OrderService`
- [ ] Affichage instructions client

### US-4.1.2 — Workflow statuts
Acteur : Admin
Priorité : CRITIQUE

Critères :
- Given commande pending
- When admin passe à processing
- Then statut mis à jour via OrderService + notification client

Tâches :
- [ ] `OrderService::updateStatus()` + `canTransition()`
- [ ] Event `OrderStatusChanged`
- [ ] Email notification client
- [ ] Tests transitions

---

## FEATURE 4.2 — Dashboard admin

### US-4.2.1 — KPIs
Acteur : Admin
Priorité : MEDIUM

Tâches :
- [ ] Widget Filament : nb commandes par statut
- [ ] Widget : CA commandes completed
- [ ] Widget : dernières commandes

---

# EPIC 5 — PAIEMENT (V2)

## FEATURE 5.1 — Intégration paiement réel

### US-5.1.1 — Stripe / Mobile Money
Priorité : V2

Tâches :
- [ ] Choisir prestataire (Stripe ou CinetPay/Wave)
- [ ] Intégrer webhook de confirmation
- [ ] Créer commande uniquement après paiement confirmé
- [ ] Stocker référence transaction (jamais les données de carte)

---

# EPIC 6 — PAGES PUBLIQUES

## FEATURE 6.1 — Pages statiques
Priorité : MEDIUM

- [ ] Page `/contact` avec formulaire
- [ ] Page `/faq` avec accordéon
- [ ] Page `/expertises`
- [ ] Footer avec liens légaux

---

# EPIC 7 — ACQUISITION & CANAUX (NON-TECH)

## FEATURE 7.1 — Exécution Go-to-Market An 1
Acteur : Growth Team
Priorité : CRITIQUE

Tâches :
- [ ] Déployer plan T1/T2/T3/T4 (canaux digitaux + terrain)
- [ ] Mettre en place scorecard CAC par canal
- [ ] Industrialiser la collecte de témoignages clients
- [ ] Activer et mesurer le programme de parrainage

## FEATURE 7.2 — SEO local & preuve sociale
Acteur : Growth Team
Priorité : HIGH

Tâches :
- [ ] Plan éditorial SEO local
- [ ] Pages cas clients standardisées
- [ ] Suivi mensuel des positions SEO cibles

---

# EPIC 8 — SOP DELIVERY & SUPPORT (NON-TECH)

## FEATURE 8.1 — SOP livraison 48h
Acteur : Ops Team
Priorité : CRITIQUE

Tâches :
- [ ] Formaliser SOP bout-en-bout (commande -> livraison)
- [ ] Mettre en place RACI opérationnel
- [ ] Définir et monitorer incidents SLA
- [ ] Standardiser checklist QA pré-livraison

## FEATURE 8.2 — Support client
Acteur : Customer Success
Priorité : HIGH

Tâches :
- [ ] Politique de réponse WhatsApp/email
- [ ] Classification P1/P2/P3 des tickets
- [ ] Tableau de suivi temps de réponse et résolution

---

# EPIC 9 — FINANCE & PILOTAGE (NON-TECH)

## FEATURE 9.1 — Scorecard finance mensuelle
Acteur : Finance Lead
Priorité : CRITIQUE

Tâches :
- [ ] Suivre CA total + CA récurrent
- [ ] Suivre marge brute, EBITDA, runway
- [ ] Suivre seuil de rentabilité mensuel
- [ ] Revue mensuelle et plan correctif si dérive

## FEATURE 9.2 — Gouvernance financement amorçage
Acteur : CEO + Finance Lead
Priorité : HIGH

Tâches :
- [ ] Suivre allocation des 10M FCFA
- [ ] Mesurer impact par poste budgétaire
- [ ] Traçabilité des décisions d'investissement

---

# EPIC 10 — EXPANSION MULTI-PAYS (NON-TECH)

## FEATURE 10.1 — Readiness expansion Phase 2
Acteur : CEO + Expansion Lead
Priorité : HIGH

Tâches :
- [ ] Définir checklists pays (Togo, CI, Sénégal)
- [ ] Valider les gates G1/G2 avant duplication
- [ ] Cartographier partenariats locaux prioritaires

## FEATURE 10.2 — Pilot pays
Acteur : Expansion Lead
Priorité : MEDIUM

Tâches :
- [ ] Lancer pilote contrôlé sur 1 pays cible
- [ ] Mesurer SLA, CAC et marge du pilote
- [ ] Décider passage à l'échelle ou rollback

---

# EPIC 11 — FRILO SUITE (PROGRESSIF)

## FEATURE 11.1 — FRILO Compta (Phase 2)
Acteur : Product Team
Priorité : V2

Tâches :
- [ ] Spécifier interface fonctionnelle Compta
- [ ] Définir pricing et onboarding
- [ ] Piloter une cohorte test

## FEATURE 11.2 — FRILO Fiscal (Phase 2)
Acteur : Product Team
Priorité : V2

Tâches :
- [ ] Spécifier calendrier fiscal et rappels
- [ ] Définir logique de notification WhatsApp/email
- [ ] Piloter un MVP sur cohorte restreinte

## FEATURE 11.3 — FRILO Ressources (Phase 3)
Acteur : Product Team
Priorité : V3

Tâches :
- [ ] Spécifier domaines RH/fournisseurs/stocks/contrats
- [ ] Définir bundle complet FRILO Suite
- [ ] Préparer rollout régional après validation Phase 2
