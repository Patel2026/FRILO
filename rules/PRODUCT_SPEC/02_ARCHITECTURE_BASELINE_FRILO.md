# 02 - ARCHITECTURE BASELINE
## FRILO — Architecture Technique de Référence

Version : 1.0
Statut : VALIDÉ

---

## 1. Vision Architecture

Architecture découplée (API-first), modulaire et sécurisée.

Objectifs :
- séparation stricte des contextes (Public+Client / Admin)
- isolation de la logique métier dans des Services
- extensibilité (nouveaux secteurs, nouveaux templates, paiement réel)
- auditabilité des commandes
- performance maîtrisée

Pattern global :
- Backend : MVC Laravel + Services + Repositories
- Frontend : Next.js App Router, composants React serveur/client

---

## 2. Segmentation Système

### 2.1 Espace Public (Next.js)

- accès anonyme pour la vitrine
- authentification client optionnelle
- lecture catalogue (secteurs, templates)
- tunnel de commande
- pages Contact, FAQ, Expertises

### 2.2 Espace Client (Next.js — authentifié)

- routes protégées sous `/dashboard`
- consultation et suivi des commandes
- token Bearer (Sanctum) requis

### 2.3 Backoffice Admin (`/admin` — Laravel custom en V1)

- authentification obligatoire
- gestion des secteurs, templates, commandes
- mise à jour des statuts de commande
- gestion des instructions client
- Implémentation V1 : contrôleurs + vues Blade custom

---

## 3. Structure Backend Laravel

```
/app
  /Http
    /Controllers
      /Api           ← Controllers API fins (délèguent aux Services)
    /Requests        ← FormRequests validation
    /Middleware      ← Auth, CORS, Rate Limit
  /Models
    User
    Sector
    Template
    Order
    OrderInstruction
  /Services
    OrderService
    TemplateService
    SectorService
    AuthService
    NotificationService
  /Policies
    OrderPolicy
  /Http/Controllers/Admin
    DashboardController
    OrderController
    TemplateController
    SectorController
    ClientController
/routes
  api.php           ← routes API REST (prefix /api)
  web.php           ← backoffice admin custom + auth web
/database
  /migrations
  /seeders
```

---

## 4. Structure Frontend Next.js

```
/app
  layout.tsx                  ← layout global
  page.tsx                    ← Homepage (vitrine)
  /secteurs
    page.tsx                  ← Liste secteurs
    /[slug]/page.tsx          ← Templates par secteur
  /templates
    page.tsx                  ← Catalogue complet
    /[id]/page.tsx            ← Détail template
  /commande/page.tsx          ← Tunnel commande (wizard)
  /dashboard
    layout.tsx                ← Layout dashboard (auth required)
    page.tsx                  ← Tableau de bord commandes
    /orders/page.tsx          ← Détail commandes
  /login/page.tsx
  /register/page.tsx
  /contact/page.tsx
  /faq/page.tsx
  /expertises/page.tsx
/components
  /ui                         ← Button, Section (primitives)
  /business                   ← SectorCard, TemplateCard, AuthForms...
  /dashboard                  ← OrderCard, Sidebar
  /layout                     ← Header, Footer
/services
  api.ts                      ← Instance Axios configurée
  auth.service.ts             ← login, register, logout, getUser
  business.service.ts         ← getSectors, getTemplates, createOrder, getOrders
/lib
  utils.ts                    ← cn(), parseFeatures()
/data
  mocks.ts                    ← données statiques (testimonials, fallbacks)
```

---

## 5. API REST (Laravel → Next.js)

Base URL : `http://localhost:8000/api` (dev)

### Endpoints publics
- `GET /api/sectors`
- `GET /api/templates?sector_slug=xxx`
- `GET /api/templates/{id}`

### Endpoints authentifiés (token Bearer)
- `POST /api/login`
- `POST /api/register`
- `POST /api/logout`
- `GET /api/user`
- `POST /api/orders`
- `GET /api/orders`

---

## 6. Authentification

- Laravel Sanctum — mode token
- Token stocké en `localStorage` côté client
- Envoyé en header `Authorization: Bearer {token}`
- `authService` gère login / register / logout / getUser
- Dashboard Next.js protégé côté client (vérification token)

---

## 7. Base de Données (MySQL 8)

Tables principales :
- `users` — clients + admins
- `sectors` — secteurs d'activité
- `templates` — modèles de sites
- `orders` — commandes
- `order_instructions` — détails de personnalisation liés à une commande

Principes :
- normalisation 3NF minimum
- clés étrangères avec contraintes
- timestamps `created_at` / `updated_at` sur toutes les tables
- `soft_deletes` sur les entités critiques (orders, templates)

---

## 8. Sécurité

Mesures obligatoires :
- CSRF protection (Sanctum)
- validation FormRequest côté Laravel
- XSS escaping dans les vues
- CORS restreint aux origines autorisées
- rate limiting sur les routes API sensibles
- hash passwords bcrypt
- token révocable (logout)

---

## 9. Performance

- Pagination systématique sur les listes API
- Eager loading des relations Eloquent (`with()`)
- Cache possible sur les listes secteurs/templates (données peu volatiles)
- Next.js Image optimization (`next/image`)
- Bundle JS < 500kb par page

---

## 10. Emails / Notifications

- Laravel Mail + SMTP configurable (.env)
- Email de confirmation de commande au client
- Notification interne possible à l'admin

---

## 11. Règles Strictes

INTERDIT :
- logique métier dans Controller
- accès DB direct hors Model/Repository
- token ou secrets dans le code source
- modification directe d'une commande sans passer par OrderService
- données client exposées sans authentification

OBLIGATOIRE :
- Services pour la logique métier
- FormRequest pour validation des entrées
- Policy pour autorisation
- Code PSR-12 côté PHP, ESLint côté TS
