# BACKOFFICE ROUTES & PERMISSIONS — FRILO
## Cartographie des routes, middlewares et policies

Version : 1.1
Statut : VALIDÉ

---

## 1. Routes API Laravel (`routes/api.php`)

### Publiques (sans authentification)

| Méthode | Route | Controller | Action |
|---------|-------|-----------|--------|
| GET | `/api/sectors` | SectorController | index |
| GET | `/api/templates` | TemplateController | index |
| GET | `/api/templates/{id}` | TemplateController | show |
| POST | `/api/register` | AuthController | register |
| POST | `/api/login` | AuthController | login |
| POST | `/api/contact` | ContactController | store |

### Authentifiées (middleware `auth:sanctum`)

| Méthode | Route | Controller | Action | Policy |
|---------|-------|-----------|--------|--------|
| POST | `/api/logout` | AuthController | logout | — |
| GET | `/api/user` | AuthController | user | — |
| PUT | `/api/user` | AuthController | updateProfile | — |
| POST | `/api/orders` | OrderController | store | — |
| GET | `/api/orders` | OrderController | index | OrderPolicy@viewAny |
| GET | `/api/orders/summary` | OrderController | summary | OrderPolicy@viewAny |
| GET | `/api/orders/{id}` | OrderController | show | OrderPolicy@view |

---

## 2. Routes Admin (Laravel custom — `routes/web.php`)

Le backoffice admin Laravel custom est servi sous `/admin` (routes web protégées).

Middleware backoffice : `auth` + `super_admin` (rôle `super_admin` requis).

### Routes admin métiers

| Méthode | Route | Controller | Action |
|---------|-------|-----------|--------|
| GET | `/admin/dashboard` | DashboardController | index |
| GET | `/admin/orders` | Admin\OrderController | index |
| GET | `/admin/orders/{order}` | Admin\OrderController | show |
| PATCH | `/admin/orders/{order}/status` | Admin\OrderController | updateStatus |
| GET | `/admin/templates` | Admin\TemplateController | index |
| GET | `/admin/sectors` | Admin\SectorController | index |
| GET | `/admin/clients` | Admin\ClientController | index |
| GET | `/admin/contact-requests` | Admin\ContactRequestController | index |
| PATCH | `/admin/contact-requests/{contactRequest}/status` | Admin\ContactRequestController | updateStatus |
| GET | `/admin/settings` | Admin\SettingsController | index |
| PATCH | `/admin/settings/{section}` | Admin\SettingsController | updateSection |
| POST | `/admin/settings/payment/test` | Admin\SettingsController | testPayment |
| POST | `/admin/settings/publish` | Admin\SettingsController | publish |
| GET | `/admin/settings/history` | Admin\SettingsController | history |
| POST | `/admin/settings/history/{revision}/restore-draft` | Admin\SettingsController | restoreDraft |

---

## 3. Policies Laravel

### OrderPolicy

| Action | Règle |
|--------|-------|
| `viewAny` | Utilisateur authentifié peut lister ses propres commandes |
| `view` | L'utilisateur est le propriétaire de la commande (`order->user_id === auth()->id()`) |
| `create` | Tout utilisateur authentifié peut créer une commande |
| `update` | Super admin uniquement (via backoffice admin) |
| `delete` | Interdit (soft delete seulement, super admin uniquement) |

---

## 4. Middlewares

| Middleware | Route | Rôle |
|-----------|-------|------|
| `auth:sanctum` | routes API authentifiées | Vérification token Bearer |
| CORS | toutes routes API | Restriction domaines autorisés |
| `throttle:api` | routes API publiques | Rate limiting |
| `throttle:contact` | `POST /api/contact` | Limitation anti-spam formulaire contact |
| `auth` + `super_admin` | `/admin/*` | Vérification session backoffice + rôle super_admin |

---

## 5. Règles de Sécurité Routes

- Toutes les routes API mutantes (POST, PUT, DELETE) requièrent `auth:sanctum`
- Le listing `GET /api/orders` filtre automatiquement par `user_id` de l'utilisateur authentifié
- Aucune route ne retourne des données d'autres utilisateurs
- Les routes backoffice `/admin` ne sont accessibles qu'aux super-admin (`role = 'super_admin'`)
- Les routes `/admin/settings/*` sont versionnées côté domaine (`draft` / `published` / `archived`) et journalisées
- Les secrets paiement (FedaPay) ne sont jamais renvoyés en clair via l'UI/API admin
- CORS configuré pour autoriser uniquement `http://localhost:3000` en dev et le domaine de production

---

## 6. Réponses d'Erreur Standard

| Situation | Code HTTP | Message |
|-----------|-----------|---------|
| Token manquant ou invalide | 401 | Unauthenticated |
| Accès interdit (Policy) | 403 | Forbidden |
| Ressource introuvable | 404 | Not Found |
| Validation échouée | 422 | The given data was invalid + errors |
| Template inactif commandé | 422 | Ce modèle n'est plus disponible |
| Transition statut invalide | 409 | Transition non autorisée |
