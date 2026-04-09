# DATA MODEL — FRILO
## Modèle Logique de Données

Version : 1.0
Statut : VALIDÉ

---

## 1. Principes Structurants

- SGBD : MySQL 8
- Charset : `utf8mb4`, collation `utf8mb4_unicode_ci`
- Clés primaires : `id BIGINT UNSIGNED` auto-increment
- Tables en `snake_case` pluriel (conventions Laravel)
- Timestamps : `created_at`, `updated_at` sur toutes les tables
- `deleted_at` (soft delete) sur les entités critiques
- Clés étrangères avec contrainte d'intégrité

---

## 2. Tables

### 2.1 `users`

```sql
id            BIGINT UNSIGNED PK
name          VARCHAR(255)
email         VARCHAR(255) UNIQUE
password      VARCHAR(255)           -- bcrypt
role          ENUM('client','admin') DEFAULT 'client'
email_verified_at TIMESTAMP NULL
remember_token VARCHAR(100) NULL
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

---

### 2.2 `sectors`

```sql
id            BIGINT UNSIGNED PK
name          VARCHAR(255)
slug          VARCHAR(255) UNIQUE
description   TEXT NULL
icon          VARCHAR(100) NULL      -- nom icône (ex: "Utensils")
gradient      VARCHAR(255) NULL      -- classes CSS (optionnel)
is_active     BOOLEAN DEFAULT true
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

---

### 2.3 `templates`

```sql
id            BIGINT UNSIGNED PK
sector_id     BIGINT UNSIGNED FK → sectors.id
name          VARCHAR(255)
slug          VARCHAR(255) UNIQUE
description   TEXT NULL
price         BIGINT UNSIGNED        -- en FCFA, entier
features      JSON NULL              -- array de strings
thumbnail     VARCHAR(255) NULL      -- chemin relatif stockage
preview_url   VARCHAR(255) NULL      -- URL démo externe
is_active     BOOLEAN DEFAULT true
created_at    TIMESTAMP
updated_at    TIMESTAMP
deleted_at    TIMESTAMP NULL         -- soft delete
```

Index :
- `INDEX (sector_id, is_active)` — filtrage catalogue

---

### 2.4 `orders`

```sql
id            BIGINT UNSIGNED PK
user_id       BIGINT UNSIGNED FK → users.id
template_id   BIGINT UNSIGNED FK → templates.id
status        ENUM('pending','processing','completed','cancelled') DEFAULT 'pending'
price         BIGINT UNSIGNED        -- snapshot prix au moment de la commande
created_at    TIMESTAMP
updated_at    TIMESTAMP
deleted_at    TIMESTAMP NULL         -- soft delete (jamais supprimé physiquement)
```

Index :
- `INDEX (user_id, status)` — dashboard client
- `INDEX (status, created_at)` — liste admin

---

### 2.5 `order_instructions`

```sql
id                    BIGINT UNSIGNED PK
order_id              BIGINT UNSIGNED FK → orders.id UNIQUE
enterprise_name       VARCHAR(255) NULL
activity_description  TEXT NULL
colors                JSON NULL              -- array de strings (couleurs souhaitées)
specific_instructions TEXT NULL
created_at            TIMESTAMP
updated_at            TIMESTAMP
```

Contrainte : une instruction par commande (`UNIQUE order_id`)

---

### 2.6 `personal_access_tokens` (Sanctum)

Générée automatiquement par Laravel Sanctum.

---

## 3. Relations Eloquent

```
User         hasMany   Order
Order        belongsTo User
Order        belongsTo Template
Order        hasOne    OrderInstruction
Template     belongsTo Sector
Template     hasMany   Order
Sector       hasMany   Template
```

---

## 4. Ordre de Migration Recommandé

1. `users`
2. `sectors`
3. `templates`
4. `orders`
5. `order_instructions`
6. `personal_access_tokens` (Sanctum — géré automatiquement)

---

## 5. Données Critiques

Sont critiques (ne jamais supprimer physiquement) :
- `orders` — historique commandes
- `order_instructions` — contenu saisi par le client
- `users` — clients

Entités moins critiques (peut être désactivé, pas supprimé) :
- `templates` (is_active = false)
- `sectors` (is_active = false)

---

## 6. Seeders de Référence

Secteurs à créer : Restaurants, BTP & Artisanat, Santé & Bien-être, Avocats & Juridique, Coaching & Consulting, Immobilier.

Templates : au moins 1 template actif par secteur, avec prix, description et features.

Utilisateurs de démo :
- `admin@frilo.com` / `password` — role: admin
- `client@frilo.com` / `password` — role: client
