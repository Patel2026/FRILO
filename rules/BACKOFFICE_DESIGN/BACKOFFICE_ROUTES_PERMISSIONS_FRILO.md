# BACKOFFICE ROUTES & PERMISSIONS — FRILO
## Cartographie des routes, middlewares et policies

Version : 1.0
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

### Authentifiées (middleware `auth:sanctum`)

| Méthode | Route | Controller | Action | Policy |
|---------|-------|-----------|--------|--------|
| POST | `/api/logout` | AuthController | logout | — |
| GET | `/api/user` | AuthController | user | — |
| POST | `/api/orders` | OrderController | store | — |
| GET | `/api/orders` | OrderController | index | OrderPolicy@viewAny |
| GET | `/api/orders/{id}` | OrderController | show | OrderPolicy@view |

---

## 2. Routes Admin (Filament — `routes/web.php`)

Filament gère ses propres routes sous `/admin`.

Middleware Filament : vérification `role = 'admin'` via `FilamentGate` ou surcharge du panel.

---

## 3. Policies Laravel

### OrderPolicy

| Action | Règle |
|--------|-------|
| `viewAny` | Utilisateur authentifié peut lister ses propres commandes |
| `view` | L'utilisateur est le propriétaire de la commande (`order->user_id === auth()->id()`) |
| `create` | Tout utilisateur authentifié peut créer une commande |
| `update` | Admin uniquement (via Filament) |
| `delete` | Interdit (soft delete seulement, admin uniquement) |

---

## 4. Middlewares

| Middleware | Route | Rôle |
|-----------|-------|------|
| `auth:sanctum` | routes API authentifiées | Vérification token Bearer |
| CORS | toutes routes API | Restriction domaines autorisés |
| `throttle:api` | routes API publiques | Rate limiting |
| Filament auth | `/admin/*` | Vérification role admin |

---

## 5. Règles de Sécurité Routes

- Toutes les routes API mutantes (POST, PUT, DELETE) requièrent `auth:sanctum`
- Le listing `GET /api/orders` filtre automatiquement par `user_id` de l'utilisateur authentifié
- Aucune route ne retourne des données d'autres utilisateurs
- Les routes Filament ne sont accessibles qu'aux admin (role = 'admin')
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
