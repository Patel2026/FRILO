# BACKOFFICE FRILO — CRUDs ET FONCTIONNALITÉS
## Spécification des opérations du backoffice Laravel custom

Version : 1.0
Statut : VALIDÉ

---

## 1. Resource : Commandes (Orders)

### Liste
- Colonnes : ID, Client (email), Template, Secteur, Prix, Statut (badge coloré), Date
- Filtre : statut, période
- Tri par date décroissante par défaut
- Pagination

### Voir (Read)
- Informations commande : template, prix, date, statut
- Informations client : nom, email
- Instructions : nom entreprise, description, couleurs, instructions spécifiques

### Modifier (Update — statut uniquement)
- Seul le statut peut être modifié
- Transitions autorisées (voir WORKFLOW_COMMANDE) :
  - `pending → processing`
  - `pending → cancelled`
  - `processing → completed`
  - `processing → cancelled`
- Le prix, le client, le template sont non éditables après création
- Toute modification de statut passe par `OrderService::updateStatus()`

### Pas de création manuelle dans le backoffice
Les commandes sont créées par les clients via l'API. L'admin ne crée pas de commande.

### Pas de suppression physique
Désactivation logique uniquement si nécessaire.

---

## 2. Resource : Templates

### Liste
- Colonnes : ID, Nom, Secteur, Prix (FCFA), Actif, Date
- Filtre : secteur, is_active
- Tri : nom ou date

### Créer
Champs obligatoires :
- `name` (string)
- `sector_id` (select → liste secteurs actifs)
- `price` (integer, FCFA)
- `is_active` (toggle, défaut: true)

Champs optionnels :
- `slug` (auto-généré si vide)
- `description`
- `features` (repeater ou tags)
- `thumbnail` (upload image)
- `preview_url` (URL externe)

### Modifier
Tous les champs éditables.
⚠️ Modifier le prix d'un template N'affecte pas les commandes existantes (prix snapshotté).

### Désactiver
Toggle `is_active = false` — n'apparaît plus dans le catalogue public.
Soft delete si suppression physique demandée.

---

## 3. Resource : Secteurs

### Liste
- Colonnes : ID, Nom, Slug, Actif, Nb templates
- Filtre : is_active

### Créer
Champs :
- `name` (obligatoire)
- `slug` (auto si vide)
- `description`
- `icon` (string — nom icône Lucide)
- `gradient` (string CSS optionnel)
- `is_active` (toggle)

### Modifier
Tous les champs éditables.

### Désactiver
Toggle `is_active = false` — le secteur et ses templates sont masqués du catalogue.

---

## 4. Resource : Clients (Users)

### Liste
- Colonnes : ID, Nom, Email, Role, Date inscription, Nb commandes
- Filtre : role

### Voir
- Informations profil
- Liste des commandes associées

### Pas de création dans le backoffice
Les clients s'inscrivent via l'API (`/api/register`).

### Pas de modification de mot de passe dans le backoffice
Reset via email.

---

## 5. Widget Tableau de Bord Admin

KPIs affichés :
- Nombre de commandes par statut (pending / processing / completed / cancelled)
- Chiffre d'affaires (somme prix orders completed)
- Commandes du mois en cours
- Dernières commandes (table récente)

---

## 6. Règles de Sécurité Backoffice

- Seuls les utilisateurs avec `role = 'admin'` accèdent au backoffice `/admin`
- Les données client (email, instructions) sont visibles uniquement dans le contexte de la commande
- Aucune donnée de paiement réel ne doit être stockée ou affichée (V1 : paiement simulé)
- Les actions de changement de statut sont tracées (logs Laravel structurés)
