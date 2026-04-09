# MASTER SECURITY — FRILO
## Référentiel de Sécurité Unifié

Version : 1.0
Statut : OBLIGATOIRE

---

## PRINCIPES NON NÉGOCIABLES

```
1. Security by Design       — la sécurité est dans le code, pas au-dessus
2. Moindre privilège        — chaque acteur ne voit que ses propres données
3. Défense en profondeur    — plusieurs couches (middleware, policy, service, validation)
4. Entrée hostile par défaut — toute donnée externe est suspecte
5. Traçabilité              — toute action sensible est loggée
6. Séparation stricte       — client / admin ne se mélangent jamais
7. Token révocable          — un logout révoque le token côté serveur
```

---

## 1. AUTHENTIFICATION

### Laravel Sanctum (token)
- Mode : token Bearer (pas de session cookie pour l'API)
- Token stocké en `localStorage` côté Next.js
- Token envoyé en header `Authorization: Bearer {token}`
- Token révoqué à la déconnexion (`POST /api/logout`)
- Pas de token dans les URL (query params)

### Mots de passe
- Hashés avec `bcrypt` (default Laravel)
- Jamais stockés en clair
- Jamais loggés
- Minimum 8 caractères (validation FormRequest)

---

## 2. AUTORISATION (RBAC)

### Rôles
- `client` : accès uniquement à ses propres commandes
- `admin` : accès backoffice admin Laravel custom (`/admin`)

### Règles
- Tout endpoint API authentifié vérifie `auth:sanctum`
- `GET /api/orders` retourne uniquement `where('user_id', auth()->id())`
- `GET /api/orders/{id}` vérifie `OrderPolicy@view` → `order->user_id === auth()->id()`
- Backoffice admin : middleware `auth` + `admin` et vérification `role = 'admin'`

### Interdits
- Pas de bypass Policy "pour aller plus vite"
- Pas de condition `if ($user->id === 1)` hardcodée
- Pas d'exposition de données cross-user dans les listes

---

## 3. VALIDATION DES ENTRÉES

- Toutes les routes mutantes (POST, PUT) utilisent un `FormRequest` dédié
- Validation stricte des types, longueurs, formats
- `template_id` : doit exister ET être actif
- `colors` : array de strings, taille limitée
- `price` ne vient jamais du client — calculé côté serveur depuis le template

### Champs sensibles jamais acceptés du client
- `user_id` (toujours depuis `auth()->id()`)
- `status` (valeur initiale toujours `pending`)
- `price` (toujours snapshot depuis template)

---

## 4. PROTECTION XSS / INJECTION

- Eloquent ORM protège contre l'injection SQL
- Blade (si utilisé) échappe automatiquement `{{ }}`
- Côté Next.js : pas de `dangerouslySetInnerHTML` sans sanitisation
- Fichiers uploadés (thumbnails) : vérification MIME type + extension

---

## 5. CORS

Configuration Laravel CORS :
```php
// config/cors.php
'allowed_origins' => [
    'http://localhost:3000',        // dev
    'https://frilo.com',            // prod
],
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
'allowed_headers' => ['Content-Type', 'Authorization', 'Accept'],
'supports_credentials' => false,
```

---

## 6. RATE LIMITING

- `throttle:api` sur les routes publiques (liste templates/secteurs)
- `throttle:60,1` sur login/register (60 req/min par IP)
- Rate limiting spécifique recommandé sur `POST /api/login` pour prévenir le brute force

---

## 7. SECRETS ET VARIABLES D'ENVIRONNEMENT

- Toutes les clés sensibles dans `.env` (jamais dans le code source)
- `.env` dans `.gitignore` (vérifié)
- Variables Next.js publiques : préfixe `NEXT_PUBLIC_` uniquement pour les non-sensibles
- Token Next.js jamais dans le code source

### Variables sensibles côté Laravel
```
APP_KEY
DB_PASSWORD
MAIL_PASSWORD
SANCTUM_STATEFUL_DOMAINS
```

---

## 8. SÉCURITÉ DES FICHIERS (Thumbnails)

- Upload des thumbnails via backoffice admin uniquement (pas côté client public)
- Stockage dans `storage/app/public/templates/`
- Validation : MIME types autorisés (image/jpeg, image/png, image/webp)
- Taille max recommandée : 2MB
- Lien public via `Storage::url()`

---

## 9. HEADERS HTTP

Recommandés en production :
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

---

## 10. LOGS ET AUDIT

- Laravel logs activés (channel `daily`)
- Journaliser les événements sensibles :
  - Tentatives de connexion échouées
  - Création de commande
  - Changement de statut commande
  - Tentatives d'accès non autorisé (403)
- Ne jamais logger :
  - Mots de passe
  - Tokens Bearer
  - Données de paiement

---

## 11. INTERDITS ABSOLUS (pour tout agent ou développeur)

- Jamais de token dans les logs
- Jamais de password dans les logs
- Jamais de bypass `auth:sanctum` pour "tester rapidement"
- Jamais de données cross-user dans une réponse API
- Jamais de clé `.env` dans le code source commité
- Jamais de `Order::update(['status' => ...])` direct sans passer par `OrderService`
- Jamais d'exposition de `user_id` ou `order_id` dans un contexte public sans protection
