# API INTEGRATION LAYER — FRILO
## Contrat d'Interface Backend ↔ Frontend

Version : 1.3
Statut : VALIDÉ

---

## 1. Principes

- L'API est le seul point de communication entre Next.js et Laravel.
- Base URL frontend via env : `NEXT_PUBLIC_API_URL`
- Valeur dev locale (sans Docker) : `http://localhost:8000/api`
- Valeur dev Docker : `http://localhost:8080/api`
- Format : JSON (`Content-Type: application/json`, `Accept: application/json`)
- Auth : token Bearer (`Authorization: Bearer {token}`)
- Gestion des erreurs standardisée

---

## 2. Codes HTTP de Référence

| Code | Signification |
|------|---------------|
| 200  | OK |
| 201  | Créé avec succès |
| 204  | Succès sans contenu |
| 401  | Non authentifié |
| 403  | Non autorisé |
| 404  | Ressource introuvable |
| 409  | Conflit d'état (transition invalide) |
| 422  | Erreur de validation (avec détail `errors`) |
| 429  | Limite de requêtes atteinte (rate limit) |
| 500  | Erreur serveur interne |

---

## 3. Endpoints Publics (sans token)

### `GET /api/sectors`

Retourne la liste des secteurs actifs.

```json
[
  {
    "id": 1,
    "name": "Restaurants & Traiteurs",
    "slug": "restaurants",
    "description": "...",
    "icon": "Utensils",
    "gradient": null
  }
]
```

---

### `GET /api/templates?sector_slug={slug}`

Retourne les templates actifs, filtrés optionnellement par secteur.

```json
[
  {
    "id": 1,
    "name": "Le Gourmet",
    "slug": "le-gourmet",
    "description": "...",
    "price": 50000,
    "features": ["Menu digital", "Réservation", "Galerie photos"],
    "thumbnail": "templates/le-gourmet.jpg",
    "full_thumbnail_url": "<API_BASE_URL>/storage/templates/le-gourmet.jpg",
    "preview_url": null,
    "is_active": true,
    "sector_id": 1,
    "sector": { "id": 1, "name": "Restaurants & Traiteurs", "slug": "restaurants" }
  }
]
```

---

### `GET /api/templates/{id}`

Retourne un template par son ID.

Erreur si introuvable ou inactif :
```json
{ "message": "Not Found" }
```
HTTP 404

---

### `POST /api/contact`

Endpoint public pour soumettre une demande de contact.

Corps :
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "phone": "+22990000000",
  "company": "Entreprise Test",
  "subject": "Question avant commande",
  "message": "Bonjour, je souhaite être contacté pour choisir un template."
}
```

Réponse 201 :
```json
{
  "id": 12,
  "status": "new",
  "message": "Votre demande a été enregistrée. Notre équipe vous répond rapidement.",
  "created_at": "2026-04-09T18:25:00Z"
}
```

Erreurs :
- `422` si validation invalide (`errors` détaillés)
- `429` si limite de requêtes atteinte (`throttle:contact`)

---

## 4. Endpoints Authentifiés

### `POST /api/register`

Corps :
```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "motdepasse123",
  "password_confirmation": "motdepasse123"
}
```

Réponse 201 :
```json
{
  "token": "1|xxxxxxxxxxxxxxxx",
  "user": { "id": 1, "name": "Jean Dupont", "email": "jean@example.com", "role": "client" }
}
```

---

### `POST /api/login`

Corps :
```json
{ "email": "jean@example.com", "password": "motdepasse123" }
```

Réponse 200 :
```json
{
  "token": "1|xxxxxxxxxxxxxxxx",
  "user": { "id": 1, "name": "Jean Dupont", "email": "jean@example.com", "role": "client" }
}
```

---

### `POST /api/logout`

Header : `Authorization: Bearer {token}`

Réponse 204 (no content) — token révoqué.

---

### `GET /api/user`

Header : `Authorization: Bearer {token}`

Réponse 200 :
```json
{ "id": 1, "name": "Jean Dupont", "email": "jean@example.com", "role": "client" }
```

---

### `POST /api/orders`

Header : `Authorization: Bearer {token}`

Corps :
```json
{
  "template_id": 1,
  "enterprise_name": "Chez Marcel",
  "activity_description": "Restaurant gastronomique...",
  "colors": ["#2563EB", "#7E22CE"],
  "specific_instructions": "Mettre le logo en header..."
}
```

Réponse 201 :
```json
{
  "id": 42,
  "status": "pending",
  "price": 50000,
  "created_at": "2026-04-09T10:00:00Z",
  "template": {
    "id": 1,
    "name": "Le Gourmet",
    "sector": { "id": 1, "name": "Restaurants & Traiteurs", "slug": "restaurants" }
  },
  "instruction": {
    "enterprise_name": "Chez Marcel",
    "activity_description": "Restaurant gastronomique...",
    "colors": ["#2563EB", "#7E22CE"],
    "specific_instructions": "Mettre le logo en header..."
  }
}
```

---

### `GET /api/orders`

Header : `Authorization: Bearer {token}`

Retourne uniquement les commandes du client authentifié.

```json
{
  "data": [
    {
      "id": 42,
      "status": "processing",
      "price": 50000,
      "created_at": "2026-04-09T10:00:00Z",
      "template": {
        "id": 1,
        "name": "Le Gourmet",
        "sector": { "id": 1, "name": "Restaurants & Traiteurs", "slug": "restaurants" }
      },
      "instruction": {
        "enterprise_name": "Chez Marcel",
        "activity_description": "Restaurant gastronomique...",
        "colors": ["#2563EB", "#7E22CE"],
        "specific_instructions": "Mettre le logo en header..."
      },
      "instructions": [
        { "enterprise_name": "Chez Marcel", "activity_description": "Restaurant gastronomique..." }
      ]
    },
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 10,
    "total": 1
  },
  "links": {
    "first": "<API_BASE_URL>/orders?page=1",
    "last": "<API_BASE_URL>/orders?page=1",
    "prev": null,
    "next": null
  }
}
```
Note : le contrat V1 canonique utilise `instruction`; `instructions` est maintenu pour compatibilité transitoire.

### `GET /api/orders/{id}`

Header : `Authorization: Bearer {token}`

Retourne le même shape métier qu'un item de `GET /api/orders`.
Le contrat V1 canonique expose `instruction` et maintient `instructions` pour compatibilité transitoire frontend.

---

## 5. Format d'Erreur Standard

Toutes les erreurs de validation (422) retournent :

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

---

## 6. Règles d'Implémentation Frontend

- L'instance `api.ts` (Axios) est la seule façon d'appeler le backend.
- Le token est injecté automatiquement via l'intercepteur `api.ts`.
- Toutes les erreurs réseau sont catchées dans les services.
- Aucun appel `fetch()` direct dans les composants — utiliser les services.

---

## 7. Contrats Business Complémentaires

Les contrats d'interface business qui complètent cette couche API (pricing, paiements, SLA opérationnels, FRILO Suite phase 2/3) sont définis dans :

- `rules/PRODUCT_SPEC/06_BUSINESS_INTERFACE_CONTRACTS_FRILO.md`

Règle :
- ce document API reste la référence d'implémentation effective V1
- les contrats business complémentaires sont des cibles documentées tant qu'ils ne sont pas implémentés et testés
