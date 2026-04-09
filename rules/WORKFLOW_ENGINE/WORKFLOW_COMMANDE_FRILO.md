# WORKFLOW COMMANDE — FRILO
## Spécification du Cycle de Vie d'une Commande

Version : 1.1
Statut : VALIDÉ

---

## 1. Vue d'Ensemble

Le tunnel de commande FRILO est un wizard 5 étapes côté client (Next.js), qui aboutit à la création d'une `Order` avec statut `pending` côté backend (Laravel).

Après création, la commande suit un workflow de production géré par l'admin via Filament.

---

## 2. Tunnel de Commande (Frontend — 5 étapes)

```
[Étape 1 : Récapitulatif]
       ↓
[Étape 2 : Connexion / Compte]
       ↓
[Étape 3 : Détails du projet]
       ↓
[Étape 4 : Paiement]
       ↓
[Étape 5 : Confirmation]
```

### Étape 1 — Récapitulatif
- Affiche le template sélectionné (nom, description, prix FCFA)
- Template chargé depuis `GET /api/templates/{id}`
- Bloqué si aucun `templateId` dans les query params

### Étape 2 — Connexion / Compte
- Si déjà connecté (token valide) → skip automatique
- Formulaires de login ET register (tabs ou accordéon)
- `authService.login()` ou `authService.register()`
- Succès → avance à l'étape 3

### Étape 3 — Détails du projet
- Champs : nom de l'entreprise, description de l'activité, couleurs souhaitées, instructions spécifiques
- Validation côté client (zod ou validation HTML)
- Données stockées dans `formData` local (state React)
- Succès → avance à l'étape 4

### Étape 4 — Paiement
- Affiche le récapitulatif du prix
- En V1 : bouton "Simuler le paiement validé"
- En V2 : intégration Stripe / Mobile Money (Orange Money, MTN, Wave)
- Déclenche `businessService.createOrder(payload)` → `POST /api/orders`
- Succès → avance à l'étape 5

### Étape 5 — Confirmation
- Affiche la référence commande (`#ORD-{id paddé}`)
- Message de confirmation
- Lien retour accueil

### SLA opérationnels associés au tunnel
- `confirmed_at` (confirmation FRILO) : < 2 heures
- `assigned_at` (technicien assigné) : < 2 heures
- `preview_sent_at` (prévisualisation client) : < 24 heures
- fenêtre de retours client : 24 heures
- `delivered_at` (mise en ligne définitive) : ≤ 48 heures après `ordered_at`

Les horodatages SLA sont définis dans `06_BUSINESS_INTERFACE_CONTRACTS_FRILO.md` et pilotés via `OPERATIONS_SOP_DELIVERY_SUPPORT_FRILO.md`.

---

## 3. Workflow de Production (Backend — Statuts)

```
                ┌────────────────────────────────┐
                │         COMMANDE CRÉÉE          │
                └────────────┬───────────────────┘
                             ↓
                        [pending]
                       /         \
                      ↓           ↓
               [processing]   [cancelled]
                    ↓
               [completed]
```

### Transitions Autorisées

| De | Vers | Acteur | Déclencheur |
|----|------|--------|-------------|
| `pending` | `processing` | Admin | Démarrage production dans Filament |
| `pending` | `cancelled` | Admin | Annulation avant traitement |
| `processing` | `completed` | Admin | Livraison confirmée |
| `processing` | `cancelled` | Admin | Annulation exceptionnelle |

### Transitions Interdites

| De | Vers | Raison |
|----|------|--------|
| `completed` | tout | Commande terminée, immuable |
| `cancelled` | tout | Commande annulée, immuable |
| `processing` | `pending` | Pas de retour arrière |
| tout | tout | Via `Order::update()` direct — INTERDIT |

---

## 4. Règles Métier Strictes

- **Toute transition passe par `OrderService`**, jamais par `Order::update()` direct.
- **Une commande `completed` est immuable** — aucun champ modifiable.
- **Une commande `cancelled` est immuable** — aucun champ modifiable.
- **Le prix est figé à la création** — le snapshot ne change jamais, même si le template est modifié ensuite.
- **Les `OrderInstruction` sont créées en même temps que la commande** dans une transaction DB.
- **Un template inactif ne peut pas être commandé** — validation côté `OrderService`.

---

## 5. Notifications

| Événement | Destinataire | Canal |
|-----------|-------------|-------|
| `OrderCreated` | Client | Email de confirmation |
| `OrderStatusChanged` → `processing` | Client | Email "Votre site est en production" |
| `OrderStatusChanged` → `completed` | Client | Email "Votre site est prêt" |
| `OrderCreated` | Admin FRILO | Notification interne (optionnel) |

---

## 6. Implémentation Backend — OrderService

```php
// Méthodes requises dans OrderService

createOrder(array $data, User $user): Order
  → valider template actif
  → créer Order + OrderInstruction dans DB::transaction()
  → émettre OrderCreated event

updateStatus(Order $order, string $newStatus, User $admin): Order
  → valider transition autorisée
  → mettre à jour Order via service (pas update() direct)
  → émettre OrderStatusChanged event
  → notifier le client

canTransition(Order $order, string $newStatus): bool
  → retourner vrai/faux selon la matrice de transitions
```

---

## 7. Payload de Création de Commande

```json
{
  "template_id": 1,
  "enterprise_name": "Chez Marcel",
  "activity_description": "Restaurant gastronomique au cœur de Paris",
  "colors": ["#2563EB", "#7E22CE"],
  "specific_instructions": "Mettre en avant le menu du soir."
}
```

Validations Laravel (FormRequest) :
- `template_id` : required, exists:templates,id, is_active=true
- `enterprise_name` : nullable, string, max:255
- `activity_description` : nullable, string
- `colors` : nullable, array
- `specific_instructions` : nullable, string
