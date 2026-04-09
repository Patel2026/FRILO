# 05 - DOMAIN MODEL
## Modèle de Domaine — FRILO

Version : 1.0
Statut : VALIDÉ

---

## 1. Domaines Fonctionnels

| Domaine | Finalité |
|---------|----------|
| Catalogue | Gérer secteurs et templates disponibles |
| Commande | Enregistrer et piloter le cycle de vie d'une commande |
| Authentification | Gérer l'identité et la session des clients |
| Notification | Informer clients et admins des événements clés |
| Administration | Gérer le backoffice Filament (templates, commandes, statuts) |

---

## 2. Entités Métier

### 2.1 Sector (Secteur)

Attributs :
- `id`
- `name` (ex: "Restaurants & Traiteurs")
- `slug` (ex: "restaurants")
- `description`
- `icon` (nom icône Lucide)
- `gradient` (classes CSS optionnelles)
- `is_active`

Règles :
- un secteur est actif ou inactif
- un secteur a plusieurs templates
- le slug est unique et utilisé dans les URLs

---

### 2.2 Template

Attributs :
- `id`
- `name` (ex: "Le Gourmet")
- `slug`
- `description`
- `price` (en FCFA)
- `features` (JSON array)
- `thumbnail` (chemin relatif)
- `full_thumbnail_url` (URL absolue)
- `preview_url` (URL de démo optionnelle)
- `is_active`
- `sector_id` → FK Sector

Règles :
- un template appartient à un secteur
- un template inactif n'est pas visible dans le catalogue public
- le prix est en FCFA, entier, obligatoire
- `features` est un tableau de strings (liste des fonctionnalités incluses)

---

### 2.3 User (Client)

Attributs :
- `id`
- `name`
- `email` (unique)
- `password` (hashé bcrypt)
- `role` (`client` | `admin`)
- `email_verified_at`
- `created_at` / `updated_at`

Règles :
- un utilisateur client peut passer plusieurs commandes
- un utilisateur admin accède au backoffice Filament
- le mot de passe est hashé, jamais stocké en clair
- l'email est unique

---

### 2.4 Order (Commande)

Attributs :
- `id`
- `user_id` → FK User
- `template_id` → FK Template
- `status` (enum : `pending` | `processing` | `completed` | `cancelled`)
- `price` (prix au moment de la commande)
- `created_at` / `updated_at`

Règles :
- une commande est liée à un client et un template
- le prix est figé au moment de la commande (snapshot)
- une commande ne peut pas être supprimée physiquement
- les transitions de statut suivent un flux défini (voir WORKFLOW_COMMANDE)

---

### 2.5 OrderInstruction (Détails de personnalisation)

Attributs :
- `id`
- `order_id` → FK Order
- `enterprise_name` (nom de l'entreprise client)
- `activity_description` (description de l'activité)
- `colors` (JSON array de couleurs souhaitées)
- `specific_instructions` (texte libre)

Règles :
- une commande a exactement une instruction
- les instructions sont saisies par le client lors du tunnel
- les instructions sont visibles par l'admin dans Filament pour la production

---

## 3. Agrégats

| Agrégat | Racine | Contenu |
|---------|--------|---------|
| CatalogueAggregate | Sector | Sector, Template |
| OrderAggregate | Order | Order, OrderInstruction |
| UserAggregate | User | User |

### Règles d'agrégat
- toute modification d'un `Template` passe par `TemplateService`
- toute transition de statut d'une `Order` passe exclusivement par `OrderService`
- une `OrderInstruction` est créée avec sa `Order` parente, jamais seule

---

## 4. États Métier (Order)

```
[pending] → [processing] → [completed]
    ↓
[cancelled]
```

| Statut | Signification | Acteur |
|--------|---------------|--------|
| `pending` | Commande reçue, en attente de traitement | système |
| `processing` | En cours de production par l'équipe FRILO | admin |
| `completed` | Site livré au client | admin |
| `cancelled` | Commande annulée | admin ou client |

### Règles de transition
- `pending` → `processing` : admin démarre la production
- `processing` → `completed` : admin confirme la livraison
- `pending` → `cancelled` : annulation avant traitement
- `processing` → `cancelled` : annulation exceptionnelle
- `completed` → ??? : irréversible, aucune transition possible
- aucune transition n'est faite via `Order::update()` direct

---

## 5. Événements Métier

- `OrderCreated` → déclenche email de confirmation client
- `OrderStatusChanged` → notifie client si `processing` ou `completed`
- `UserRegistered` → email de bienvenue (optionnel)

---

## 6. Invariants

- un template inactif ne peut pas être commandé
- un client ne peut voir que ses propres commandes
- le prix d'une commande ne peut pas être modifié après création
- une commande `completed` est immuable
- les identifiants internes (user_id, order_id) ne sont jamais exposés dans les URLs publiques sans protection
