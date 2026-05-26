# CLAUDE.md — FRILO
**Stack : Laravel 11 / PHP 8.3+ / MySQL 8 / Next.js 15 / TypeScript / Tailwind CSS / Sanctum / Filament**  
**Rôle : Développeur Senior — Exécution autonome, qualité production, zéro régression.**

---

## 1. COMPORTEMENT GÉNÉRAL

- Code d'expert senior : propre, typé, sécurisé, maintenable. Pas de raccourcis.
- Réponse directe. Pas d'intro, pas d'outro, pas de récapitulatif.
- Code seul par défaut. `[EXPLAIN]` active les explications.
- Information incertaine → signaler avec `[?]` sans développer.
- Ne jamais reformuler le prompt.
- Ne jamais proposer une implémentation qui contourne `OrderService` pour une transition de statut.
- Ne jamais traiter la gestion de commande comme un simple CRUD si une règle métier est concernée.

### Quand proposer des options

Proposer des options uniquement si :
- choix d'architecture non trivial
- impact sur sécurité, performance ou workflow commande
- modification d'un contrat de service ou d'une Policy
- arbitrage tech (ex: sync vs event, Filament vs custom)

Format obligatoire :
```text
OPTION A : [approche] — avantage / risque
OPTION B : [approche] — avantage / risque
→ Recommandation : [A ou B] parce que [raison courte]
Confirmer ?
```

---

## 2. CONTEXT RULES

- Lire uniquement les fichiers explicitement mentionnés. Pas de scan global sauf `[SCAN]`.
- Si un fichier manquant est indispensable : demander ce seul fichier, une question précise.
- Ne jamais inférer le contenu d'un fichier non fourni.
- Si un fichier entre en conflit avec la gouvernance FRILO (`rules/`), signaler le conflit avant de coder.

### Chemins prioritaires backend (si référencés)
```text
app/Models/
app/Services/
app/Policies/
app/Enums/
app/Http/Controllers/Api/
app/Http/Requests/
app/Filament/Resources/
database/migrations/
routes/api.php
config/auth.php
config/cors.php
```

### Chemins prioritaires frontend (si référencés)
```text
frontend/app/
frontend/components/
frontend/services/
frontend/lib/
```

### Toujours ignorer
```text
vendor/
node_modules/
storage/logs/
bootstrap/cache/
.git/
frontend/.next/
.env*
```

---

## 3. ARCHITECTURE

### Backend (Laravel)

Flux imposé :
```text
Controller → FormRequest → Policy → Service → Model
```

| Couche | Responsabilité | Interdit |
|--------|---------------|---------|
| **Controller** | Authentifier, valider via FormRequest, appeler service, retourner réponse | logique métier, requêtes DB directes, `Order::update(['status' => ...])` direct |
| **FormRequest** | Validation complète des entrées | `user_id`, `price`, `status` jamais acceptés depuis le client |
| **Policy** | Autorisation complète | logique métier, vérifications inline en controller |
| **Service** | Logique métier, transactions, transitions, events | rendu HTML, logique UI |
| **Model** | Relations, scopes, casts, accessors | logique métier complexe, transitions workflow |

### Règles absolues backend
- `$request->user()` ou `auth()->id()` pour l'identité — jamais depuis le corps de la requête.
- Toute transition de statut commande passe par `OrderService::updateStatus()`.
- Toute opération multi-étapes → `DB::transaction()` (ex: créer Order + OrderInstruction).
- `$fillable` obligatoire sur tous les modèles. `$guarded = []` interdit.
- Aucun calcul de prix dans le Controller — toujours récupéré depuis le template.

### Frontend (Next.js)

Flux imposé :
```text
Page/Composant → Service (*.service.ts) → api.ts (Axios) → API Laravel
```

| Couche | Responsabilité | Interdit |
|--------|---------------|---------|
| **Page** | Rendu, layout, routing | appels API directs, `fetch()` direct |
| **Composant** | Affichage, interaction UI | logique métier, état global complexe |
| **Service** | Appels API, transformation de données | logique d'affichage |
| **api.ts** | Instance Axios + intercepteur token | multiple instances Axios |

### Règles absolues frontend
- Tous les appels réseau passent par `api.ts`.
- Token Bearer injecté automatiquement via l'intercepteur `api.ts`.
- Gérer systématiquement les trois états : `loading`, `error`, `empty`.
- Prix toujours affichés en FCFA avec `.toLocaleString() + ' FCFA'`.
- Pas de `any` TypeScript non justifié.

---

## 4. WORKFLOW COMMANDE (CRITIQUE)

### Tunnel client (Next.js — 5 étapes)

```text
[1. Récapitulatif] → [2. Connexion/Compte] → [3. Détails projet] → [4. Paiement] → [5. Confirmation]
```

- Étape 2 : skip automatique si token valide
- Étape 4 : déclenche `POST /api/orders`
- Étape 5 : affiche `#ORD-{id paddé}`

### Cycle de vie commande (backend)

```text
pending → processing → completed
    ↓
 cancelled
```

### Règles

- Création → toujours `status = 'pending'`, jamais depuis le client
- Prix → snapshot depuis `template->price` au moment de la création, jamais modifiable
- `processing` → déclenche notification email client
- `completed` → état terminal, aucune modification possible
- `cancelled` → état terminal, aucune modification possible
- `completed → {autre}` → refusé (HTTP 409)
- `cancelled → {autre}` → refusé (HTTP 409)

### Obligations

Toute transition :
- passe par `OrderService::updateStatus()`
- valide la légitimité via `canTransition()`
- émet un event `OrderStatusChanged`
- notifie le client si applicable

### Interdictions

- `Order::update(['status' => ...])` direct
- Bypass de `canTransition()`
- Modification d'une commande `completed` ou `cancelled`
- Template inactif accepté dans une commande

---

## 5. RBAC FRILO

### Rôles
```text
admin   — backoffice Filament (/admin)
client  — espace client Next.js (/dashboard)
```

### Règles
- Authentification via token Bearer Sanctum (`auth:sanctum` middleware).
- `GET /api/orders` → filtre obligatoire `where('user_id', auth()->id())`.
- `OrderPolicy@view` → `order->user_id === auth()->id()`.
- Filament → accessible uniquement si `role = 'admin'`.
- Aucun contrôle d'accès inline dans les controllers.
- Aucun `if ($user->role === 'admin')` hardcodé hors Policy.

### Champs jamais acceptés depuis le client
```text
user_id   → toujours depuis auth()->id()
price     → toujours depuis template->price
status    → toujours 'pending' à la création
role      → jamais modifiable depuis l'API publique
```

---

## 6. MODULES FRILO

```text
Catalogue
- Sector (name, slug, icon, gradient, is_active)
- Template (name, slug, price/FCFA, features/JSON, thumbnail, is_active, sector_id)

Commande
- Order (user_id, template_id, status/enum, price/snapshot)
- OrderInstruction (order_id, enterprise_name, activity_description, colors/JSON, specific_instructions)

Authentification
- User (name, email, password/bcrypt, role)
- PersonalAccessToken (Sanctum)

Administration (Filament)
- OrderResource
- TemplateResource
- SectorResource
- UserResource (lecture seule)
```

### Interdiction
- Ne jamais réintroduire de modules hors périmètre V1 (paiement réel, chat, auth sociale, IA générative) sans demande explicite.

---

## 7. CODING RULES

### PHP / Laravel
- PSR-12.
- Type hints complets : paramètres, retours, propriétés.
- Enums PHP pour les statuts (`OrderStatus::Pending`, etc.).
- `$fillable` obligatoire. `$guarded = []` interdit.
- Scopes Eloquent > requêtes brutes.
- Eager loading obligatoire quand relation utilisée (`with()`).
- Secrets via `config()` uniquement, jamais `env()` directement dans le code.
- Nommage du code en anglais.
- Commentaires en français si nécessaire.
- `dd()`, `dump()`, `ray()`, `var_dump()` interdits en commit.

### TypeScript / Next.js
- TypeScript strict. Pas de `any` non justifié.
- Composants serveur par défaut ; `"use client"` uniquement si nécessaire.
- Pas de `dangerouslySetInnerHTML` sans sanitisation.
- `console.log()` interdit en commit.
- Imports absolus (`@/components/...`).

### Sécurité
- Validation MIME + taille des uploads (thumbnails admin).
- CORS restreint aux origines autorisées (`config/cors.php`).
- Rate limiting sur les routes sensibles (`throttle`).
- Token révoqué à chaque `logout`.
- Aucune donnée sensible (token, password) dans les logs.

### Filament
- Resources configurées avec les bons champs éditables / non éditables.
- Prix d'une commande existante non modifiable dans Filament.
- Changement de statut via `OrderService`, pas via Filament `record->save()` direct.

### Qualité
- Pas de duplication.
- Extraire méthode ou service dès qu'un bloc apparaît deux fois.
- Docblocks uniquement sur demande `[DOC]` ou méthode publique complexe.
- Fichier long → produire uniquement la section concernée + `// ... existing code ...`.

---

## 8. DÉVELOPPEMENT D'UNE FEATURE

### Avant de coder

Valider systématiquement :
```text
□ périmètre exact de la feature
□ modèles impliqués (backend et/ou frontend)
□ rôle concerné (client / admin)
□ règle workflow concernée (si Order touchée)
□ fichiers existants à modifier
□ nouveaux fichiers à créer
□ risques de régression
□ edge cases
```

### Plan obligatoire si > 1 fichier

```text
PLAN :
1. [Fichier] — [action précise]
2. [Fichier] — [action précise]
3. [Fichier] — [action précise]
Impact estimé : [faible / moyen / élevé]
Confirmer ?
```

### Ordre d'implémentation backend

```text
Migration → Model → Enum → FormRequest → Policy → Service → Controller → Route → Tests
```

### Ordre d'implémentation frontend

```text
Service (*.service.ts) → Composant → Page → Types TypeScript
```

### Checklist de finalisation

```text
□ flux nominal fonctionnel
□ edge cases couverts
□ tests passants (php artisan test)
□ pas de régression introduite
□ OrderPolicy vérifiée si commandes touchées
□ transition statut via OrderService uniquement
□ cross-user protection vérifiée
□ pas de secret hardcodé
□ pas de debug statement (dd(), console.log())
□ migration propre (up + down)
□ eager loading si relations utilisées
□ ESLint sans erreurs (npm run lint)
```

---

## 9. PROTOCOLE DE DEBUG

### Étape 1 — Reproduction
```text
- Reproduire en test ou Tinker
- Identifier les conditions exactes
- Déterminer si systématique ou intermittent
```

### Étape 2 — Isolation
```text
- Identifier la couche fautive (Controller / Service / Model / Frontend)
- Lire les logs Laravel (storage/logs/)
- Vérifier le SQL généré (telescope ou query log)
- Vérifier les events / listeners si action asynchrone
- Vérifier Policy / middleware si 401/403
```

### Étape 3 — Cause racine
```text
- Ne pas corriger le symptôme
- Distinguer : bug de données, logique, config, auth, transition workflow
- Vérifier si le bug est ancien (git log / git blame)
```

### Étape 4 — Correction
```text
- Corriger dans la bonne couche
- Écrire un test qui reproduit le bug avant correction
- Appliquer la correction minimale
- Ne pas mélanger bugfix et refactor
```

### Étape 5 — Vérification
```text
- Relancer php artisan test
- Vérifier le flux nominal + edge cases liés
- Commit : fix(scope): description courte
```

---

## 10. ANALYSE D'IMPACT ET RÉGRESSIONS

Avant toute modification, évaluer l'impact sur :

```text
□ autres méthodes du même Service
□ controllers appelants
□ events / listeners / notifications liés
□ OrderPolicy si permissions changent
□ routes et middlewares
□ tests existants
□ composants Next.js consommant l'endpoint modifié
□ Filament Resources si modèle modifié
```

### Niveaux d'impact
- `FAIBLE` : modification locale sans changement de signature
- `MOYEN` : changement de signature ou relation
- `ÉLEVÉ` : workflow commande, RBAC, migration, API publique, sécurité

### Règles absolues
- Ne jamais modifier une migration existante → créer une nouvelle migration.
- Ne jamais changer une signature publique de Service sans vérifier tous les appelants.
- Tout changement sur routes API → vérifier tests Feature liés.
- Tout changement sur le workflow commande → impact élevé par défaut.

---

## 11. EDGE CASES ET ÉTATS LIMITES

### Données
```text
□ templateId absent ou invalide dans /commande
□ template devenu inactif entre sélection et soumission
□ champs OrderInstruction nulls ou vides
□ colors array vide ou null
□ prix template modifié après commande (snapshot doit tenir)
```

### Authentification
```text
□ token expiré / révoqué pendant la session dashboard
□ localStorage vide côté Next.js
□ accès /dashboard sans token
□ client accédant à /admin
```

### Workflow
```text
□ double soumission tunnel commande (double Order créée)
□ transition invalide (completed → processing)
□ commande cancelled tentée de réactiver
□ admin changeant statut commande d'un autre admin en parallèle
```

### API
```text
□ CORS origin non autorisée
□ API Laravel down pendant navigation Next.js
□ Filament inaccessible (role client)
□ Upload thumbnail trop grand / mauvais type
```

---

## 12. TESTING

Commande minimale avant commit :
```bash
php artisan test
```

### Règles
- Un test Feature par endpoint sensible.
- Un test Unit par méthode de service avec logique conditionnelle.
- `RefreshDatabase` pour les tests d'intégration.
- Factories obligatoires pour les modèles testés.
- Reproduire un bug en test avant correction.

### Tests prioritaires
```text
□ OrderService::createOrder (nominal, template inactif, snapshot prix)
□ OrderService::updateStatus (transitions valides et invalides)
□ OrderPolicy (client voit ses commandes, pas celles des autres)
□ POST /api/orders (authentifié, non authentifié, template inactif)
□ GET /api/orders (isolation par user_id)
□ POST /api/login et /api/register
□ Filament : accès admin vs client refusé
```

---

## 13. VARIABLES D'ENVIRONNEMENT CLÉS

### Backend (`.env`)
```env
APP_NAME="FRILO"
APP_LOCALE=fr
APP_FALLBACK_LOCALE=en

APP_ENV=production
APP_DEBUG=false

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=frilo

SANCTUM_STATEFUL_DOMAINS=localhost:3000,frilo.com

MAIL_MAILER=smtp
MAIL_FROM_ADDRESS="contact@frilo.com"
MAIL_FROM_NAME="FRILO"
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 14. COMMANDES UTILES

### Backend
```bash
php artisan serve
php artisan migrate
php artisan db:seed
php artisan storage:link
php artisan test
php artisan optimize:clear
php artisan route:list --path=api
```

### Frontend
```bash
cd frontend
npm run dev
npm run build
npm run lint
```

---

## 15. CONVENTIONS GIT

- Commits : `type(scope): description`
- Types : `feat | fix | refactor | test | docs | chore`
- Scopes backend : `orders | templates | sectors | auth | filament | api | db`
- Scopes frontend : `frontend | dashboard | commande | catalogue | ui`
- Branches : `feature/`, `bugfix/`, `refactor/`, `hotfix/`
- Pas de commit direct sur `main`
- Bugfix et refactor dans des commits séparés

---

## 16. INTERDICTIONS ABSOLUES

- `Order::update(['status' => ...])` direct depuis Controller ou Filament
- Accepter `user_id`, `price` ou `status` depuis le corps d'une requête client
- Exposer les commandes d'un utilisateur à un autre utilisateur
- Bypass `auth:sanctum` ou `OrderPolicy`
- Logique métier dans Controller, FormRequest ou composant React
- Modification d'une commande `completed` ou `cancelled`
- Token ou secret dans le code source commité
- `$guarded = []` sur un modèle
- `dd()`, `dump()`, `console.log()` en commit

---

*CLAUDE.md — FRILO — version alignée production, workflow commande, RBAC et qualité*

## Agent skills

### Issue tracker

FRILO uses local markdown issues under `.scratch/<feature-or-ticket>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

FRILO uses the default Matt Pocock triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

FRILO is a single-context repo; domain docs are routed through `.claude/CLAUDE.md`, `rules/INDEX.md`, and `rules/STRATEGY_FOUNDATION/DECISIONS_FRILO.md`. See `docs/agents/domain.md`.
