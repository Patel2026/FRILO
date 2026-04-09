# 01 - PROJECT CHARTER
## FRILO — Plateforme de création de sites web professionnels clé en main

Version : 1.1
Statut : VALIDÉ

---

## 1. Vision Produit

FRILO est une plateforme SaaS qui permet aux TPE/PME et indépendants de commander un site web professionnel personnalisé en quelques minutes, livré en 48h par une équipe humaine.

Le positionnement est explicitement :
- zéro IA dans la production
- zéro frais cachés
- support 7j/7

Le système distingue deux espaces :
- un espace public (vitrine + catalogue + tunnel de commande)
- un espace client authentifié (dashboard de suivi des commandes)
- un backoffice admin (gestion des secteurs, templates, commandes)

---

## 2. Objectifs Mesurables (KPIs)

| Objectif | Indicateur | Cible |
|----------|------------|-------|
| Disponibilité | Uptime | ≥ 99,5 % |
| Performance | Temps de chargement | < 3s |
| Performance | LCP mobile | < 2,5s |
| Délai de livraison | Commande → site livré | ≤ 48h |
| Qualité | Couverture tests backend | ≥ 70 % |
| Sécurité | Vulnérabilités critiques | 0 |
| Acquisition | CAC moyen An 1 | ~7 200 FCFA |
| Croissance | Sites vendus An 1 | 360 |
| Rentabilité | Seuil mensuel | 28 sites/mois |

---

## 3. Contraintes Majeures

### 3.1 Sécurité (CRITIQUE)

- Protection OWASP Top 10
- Authentification par token (Laravel Sanctum)
- Validation stricte de toutes les entrées
- Aucune donnée client exposée publiquement
- CORS restreint aux domaines autorisés

### 3.2 Architecture (CRITIQUE)

- Backend : Laravel (PHP)
- Frontend : Next.js (TypeScript)
- Architecture modulaire côté backend (Services, Repositories, Policies)
- Séparation stricte :
  - espace public Next.js (visiteur + client)
  - `/admin` backoffice admin (implémentation Laravel custom en V1)
- Code conforme PSR-12 côté PHP, ESLint côté TS
- Logique métier dans les Services Laravel, jamais dans les Controllers

### 3.3 Performance

- Pages Next.js < 500kb bundle JS
- Images optimisées via next/image
- API paginée sur les listes

---

## 4. Périmètre Fonctionnel

### Modules inclus

- M01 : Catalogue (Secteurs + Templates)
- M02 : Tunnel de commande (Wizard 5 étapes)
- M03 : Authentification client (register/login/logout)
- M04 : Dashboard client (suivi des commandes)
- M05 : Backoffice admin (`/admin`, implémentation custom V1)
- M06 : Gestion des statuts de commande
- M07 : Notifications (email de confirmation)
- M08 : Page Contact + FAQ
- M09 : Gouvernance business/exécution (`rules/BUSINESS_EXECUTION`)

### Hors périmètre (STRICT — V1)

- application mobile native
- paiement réel (Stripe / Mobile Money en cours d'intégration)
- chat en temps réel
- réseau social / auth externe (Google, Facebook)
- IA générative pour la création de contenu
- API publique tierce

---

## 5. Utilisateurs & Rôles

- **Visiteur** : navigation catalogue, consultation templates, pages publiques
- **Client** : commande, suivi dashboard, espace personnel
- **Admin FRILO** : gestion complète via backoffice `/admin`

---

## 6. Workflow Métier Principal

Client choisit template → Connexion/inscription → Saisie détails projet → Paiement → Commande enregistrée → Admin traite → Site livré

Statuts commande :
- `pending` (en attente)
- `processing` (en cours de production)
- `completed` (livré)
- `cancelled` (annulé)

---

## 7. Politique Commerciale & Revenus

### Politique d'offre
- Offre de lancement : 35 000 FCFA (fenêtre limitée de lancement)
- Prix standard : 50 000 FCFA tout inclus
- Renouvellement hébergement : 15 000 FCFA/an (An 2+)

### Revenus récurrents cibles
- Renouvellement hébergement (base clients existants)
- FRILO Suite (Compta/Fiscal/Ressources) en Phase 2/3
- Services complémentaires (maintenance, SEO contenu, options)

---

## 8. SLA Opérationnels Contractuels

- Confirmation de commande client : < 2h
- Assignation technicien : < 2h
- Envoi prévisualisation : < 24h
- Fenêtre de retours client : 24h
- Livraison finale : ≤ 48h après commande

Les SLA sont pilotés dans `OPERATIONS_SOP_DELIVERY_SUPPORT_FRILO.md`.

---

## 9. Conditions de Passage de Phase (2026–2028)

### Passage Phase 1 -> Phase 2
- 360 sites livrés sur An 1
- marge brute annuelle >= 65 %
- SLA livraison respecté sur >= 90 % des commandes
- SOP documentés et transmissibles

### Passage Phase 2 -> Phase 3
- rentabilité opérationnelle Bénin validée
- traction confirmée sur au moins un pays additionnel
- FRILO Suite Phase 2 lancée et stabilisée
- gouvernance multi-pays opérationnelle

---

## 10. Livrables

- plateforme Laravel + Next.js complète
- code source (Git)
- documentation technique (rules/)
- documentation business/exécution (rules/BUSINESS_EXECUTION)
- tests automatisés
- backoffice admin `/admin` opérationnel

---

## 11. Stack Technique

- Backend : Laravel 11, PHP 8.3+, MySQL 8, Laravel Sanctum
- Frontend : Next.js 15, TypeScript, Tailwind CSS, Axios
- Déploiement cible : VPS ou plateforme cloud
- Email : Laravel Mail (SMTP configurable)

---

## 12. Risques

- dépendance à la rapidité humaine de livraison (promesse 48h)
- qualité variable des instructions client (formulaire trop libre)
- intégration paiement (Stripe/Mobile Money) non finalisée en V1
- volume de commandes simultanées en croissance
- adoption initiale inférieure aux projections
- dérive CAC sur les canaux payants
- exécution multi-pays prématurée avant gate de maturité
