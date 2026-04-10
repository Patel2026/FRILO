# BACKOFFICE FRILO — MENUS PAR RÔLE
## Navigation et accès par profil

Version : 1.1
Statut : VALIDÉ

---

## 1. Rôles du système

| Rôle | Espace | Description |
|------|--------|-------------|
| `super_admin` | `/admin` (Laravel custom) | Opérateur FRILO — accès total backoffice |
| `client` | `/dashboard` (Next.js) | Client — accès à ses commandes uniquement |
| Visiteur | Public (Next.js) | Anonyme — catalogue + tunnel commande |

---

## 2. Navigation Admin (Laravel custom — `/admin`)

### Menu principal

| Section | Description | Actions |
|---------|-------------|---------|
| **Tableau de bord** | KPIs : nb commandes, statuts, revenus | Vue uniquement |
| **Commandes** | Liste toutes commandes | Voir, changer statut |
| **Templates** | Catalogue de templates | CRUD complet |
| **Secteurs** | Secteurs d'activité | CRUD complet |
| **Clients** | Liste utilisateurs clients | Voir, désactiver |
| **Paramètres** | Configuration métier de la plateforme | Éditer brouillon, tester paiement, publier version |

### Détail par section

#### Commandes
- Filtres : statut, date, secteur
- Tri : date décroissante par défaut
- Actions : `pending → processing`, `processing → completed`, `→ cancelled`
- Vue détail : infos client, template, instructions de personnalisation

#### Templates
- CRUD complet (créer, lire, modifier, désactiver)
- Champs : nom, secteur, description, prix (FCFA), features (tags), thumbnail, preview_url, is_active
- Désactivation (soft) — pas de suppression physique

#### Secteurs
- CRUD complet
- Champs : nom, slug, description, icône, is_active

#### Clients
- Lecture seule (nom, email, date inscription, nb commandes)
- Action : désactiver un compte (pas de suppression)

#### Paramètres
- Sections : Général, Branding, Paiement, Workflow/SLA, Notifications, Légal
- Cycle opératoire : `Brouillon -> Tester -> Publier`
- Historique versionné : restauration d'une version en brouillon
- Secrets paiement masqués, remplacement explicite requis

---

## 3. Navigation Client (Next.js — `/dashboard`)

| Page | Description |
|------|-------------|
| **Tableau de bord** | Liste ses commandes avec statuts |
| **Détail commande** | Infos template + instructions + statut actuel |

Le client ne peut pas :
- voir les commandes d'autres clients
- modifier une commande après soumission
- accéder au backoffice `/admin`

---

## 4. Navigation Visiteur (Public)

| Page | Accessible |
|------|-----------|
| `/` | Oui |
| `/secteurs` | Oui |
| `/secteurs/{slug}` | Oui |
| `/templates` | Oui |
| `/templates/{id}` | Oui |
| `/commande` | Oui (auth requise à l'étape 2) |
| `/contact` | Oui |
| `/faq` | Oui |
| `/expertises` | Oui |
| `/login` | Oui |
| `/register` | Oui |
| `/dashboard` | NON — redirect vers `/login` |

---

## 5. Règles d'Accès

- `auth:sanctum` middleware sur toutes les routes API mutantes
- `OrderPolicy` : un client ne peut lire que ses propres commandes
- Backoffice : vérification `role = 'super_admin'` (middlewares `auth` + `super_admin`)
- Aucun rôle client ne peut accéder à `/admin`
