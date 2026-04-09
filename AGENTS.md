# AGENTS.md — FRILO

Stack : Laravel 11 / PHP 8.3+ / MySQL 8 / Next.js 15 / TypeScript / Tailwind CSS / Sanctum / Filament  
Rôle : Développeur Senior — Exécution autonome, zéro régression, qualité production

---

## 1. COMPORTEMENT GÉNÉRAL

- Code niveau expert : propre, typé, sécurisé, maintenable
- Pas de raccourcis, pas de dette technique cachée
- Réponse directe, sans bruit
- Signalement des incertitudes avec `[?]`

---

## 2. ARCHITECTURE

### Backend (Laravel)

Flux obligatoire :
```
Controller → FormRequest → Policy → Service → Model
```

Règles :
- Aucune logique métier en Controller
- Toute logique métier passe par Service
- Toute autorisation passe par Policy
- `authorize()` en première ligne de chaque méthode controller

### Frontend (Next.js)

Flux obligatoire :
```
Page/Composant → Service (api.ts) → API Laravel
```

Règles :
- Aucun appel `fetch()` direct dans les composants
- Toute la logique API dans `services/*.service.ts`
- Pas de logique métier dans les composants

---

## 3. WORKFLOW COMMANDE (CRITIQUE)

Cycle :
```
pending → processing → completed
    ↓
 cancelled
```

Règles :
- Toute transition passe par `OrderService::updateStatus()`
- `Order::update(['status' => ...])` direct interdit
- `completed` et `cancelled` sont des états terminaux immuables
- Prix snapshotté à la création — jamais modifié après

Interdictions :
- update direct du status
- bypass du `canTransition()`

---

## 4. RBAC

Rôles :
- `admin` → backoffice Filament (`/admin`)
- `client` → espace client Next.js (`/dashboard`)

Règles :
- Authentification via token Bearer Sanctum (`auth:sanctum`)
- Toutes les autorisations via `OrderPolicy`
- Un client ne voit que ses propres commandes (`user_id = auth()->id()`)
- Aucun contrôle d'accès inline dans les controllers
- `user_id`, `price`, `status` jamais acceptés depuis le client dans les FormRequests

---

## 5. MODULES FRILO

Catalogue :
- Sector
- Template

Commande :
- Order (statuts + transitions)
- OrderInstruction (détails client)

Authentification :
- User (client / admin)
- Token Sanctum

Administration :
- Filament Resources (Order, Template, Sector, User)

---

## 6. DATA INTEGRITY

- Prix = snapshot depuis template au moment de la commande
- Template inactif → non commandable (valider dans `OrderService`)
- Une `OrderInstruction` par commande (unique constraint)
- Pas de suppression physique des commandes (soft delete)

---

## 7. EDGE CASES

- Commande sans template (templateId absent ou inactif)
- Double soumission tunnel commande
- Token expiré / révoqué pendant la session
- Transition de statut invalide (ex: completed → processing)
- Client qui essaie d'accéder aux commandes d'un autre

---

## 8. TESTING

Commande minimale avant commit :
```bash
php artisan test
```

Tests prioritaires :
- Workflow transitions Order (valides + refusées)
- OrderPolicy (cross-user, non authentifié)
- OrderService::createOrder (snapshot prix, template inactif)
- Authentification (register, login, logout)

---

## 9. INTERDICTIONS

- `Order::update(['status' => ...])` direct
- Accepter `user_id` ou `price` depuis le corps d'une requête client
- Accéder aux commandes d'un autre utilisateur
- Exposer des données admin dans l'API publique
- Logique métier dans Controller ou composant React
- Secrets ou tokens dans le code source

---

## 10. ENVIRONMENT

```env
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mysql
```

Frontend :
```env
NEXT_PUBLIC_API_URL=https://api.frilo.com
```

---

## STATUT

FRILO — Backend à construire. Frontend Next.js en place. Règles gouvernance dans `rules/`.
