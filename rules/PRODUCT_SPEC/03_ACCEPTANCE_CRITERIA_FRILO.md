# 03 - ACCEPTANCE CRITERIA
## Critères d'Acceptation par Fonctionnalité — FRILO

Version : 1.0
Format : Given / When / Then (BDD)
Statut : VALIDÉ

---

## 0. Référentiel de rôles et règles globales

### Rôles
- **Visiteur** (anonyme)
- **Client** (authentifié, role: client)
- **Admin** (authentifié, role: admin, accès backoffice Laravel custom `/admin`)

### Statuts commande
- `pending`
- `processing`
- `completed`
- `cancelled`

### Règles transversales
- Toute action protégée exige un token Sanctum valide.
- Toute tentative non autorisée retourne HTTP 401 ou 403.
- Toute validation échouée retourne HTTP 422 avec détail des erreurs.
- Un client ne peut accéder qu'à ses propres commandes.
- Le backoffice admin est accessible uniquement via `/admin`.

---

## 1. AUTHENTIFICATION CLIENT

### 1.1 Inscription

```gherkin
FEATURE: Inscription client

  SCENARIO: Inscription réussie
    GIVEN un visiteur avec email non existant
    WHEN il soumet un formulaire d'inscription valide (nom, email, password ≥ 8 chars)
    THEN un compte est créé
    AND un token Sanctum est retourné
    AND le token est stocké en localStorage
    AND la réponse HTTP est 201

  SCENARIO: Email déjà utilisé
    GIVEN un visiteur avec un email déjà enregistré
    WHEN il tente de s'inscrire avec cet email
    THEN la réponse HTTP est 422
    AND le message d'erreur indique que l'email est déjà utilisé

  SCENARIO: Mots de passe non conformes
    GIVEN un visiteur avec un mot de passe < 8 caractères
    WHEN il soumet le formulaire
    THEN la réponse HTTP est 422
    AND le message d'erreur indique la contrainte
```

### 1.2 Connexion

```gherkin
FEATURE: Connexion client

  SCENARIO: Connexion réussie
    GIVEN un client avec email "client@frilo.com" et password valide
    WHEN il soumet le formulaire de connexion
    THEN un token Sanctum est retourné
    AND le token est stocké en localStorage
    AND l'utilisateur est redirigé vers le dashboard

  SCENARIO: Mauvais identifiants
    GIVEN un email ou password invalide
    WHEN il soumet le formulaire
    THEN la réponse HTTP est 401 ou 422
    AND aucun token n'est retourné

  SCENARIO: Déconnexion
    GIVEN un client connecté
    WHEN il se déconnecte
    THEN le token est révoqué côté serveur
    AND le localStorage est vidé du token
```

---

## 2. CATALOGUE

### 2.1 Liste des secteurs

```gherkin
FEATURE: Catalogue secteurs

  SCENARIO: Affichage des secteurs actifs
    GIVEN un visiteur anonyme
    WHEN il accède à /secteurs
    THEN seuls les secteurs is_active = true sont affichés
    AND chaque secteur affiche son nom, description et icône

  SCENARIO: Secteur inactif non visible
    GIVEN un secteur avec is_active = false
    WHEN le visiteur consulte la liste
    THEN ce secteur n'apparaît pas
```

### 2.2 Catalogue templates

```gherkin
FEATURE: Catalogue templates

  SCENARIO: Templates filtrés par secteur
    GIVEN un visiteur sur /secteurs/{slug}
    WHEN la page charge
    THEN seuls les templates du secteur correspondant sont affichés
    AND seuls les templates is_active = true sont affichés

  SCENARIO: Template inexistant
    GIVEN une URL /templates/99999 inexistante
    WHEN le visiteur y accède
    THEN la réponse HTTP est 404
```

---

## 3. TUNNEL DE COMMANDE

### 3.1 Sélection template

```gherkin
FEATURE: Tunnel commande — étape 1

  SCENARIO: Accès avec template valide
    GIVEN un visiteur avec URL /commande?templateId=1
    WHEN il accède à la page commande
    THEN le récapitulatif du template est affiché (nom, prix en FCFA)
    AND le bouton "Suivant" est actif

  SCENARIO: Accès sans template
    GIVEN un visiteur sur /commande sans templateId
    WHEN la page charge
    THEN un message d'erreur "Aucun modèle sélectionné" est affiché
    AND un lien vers /secteurs est proposé
```

### 3.2 Authentification dans le tunnel

```gherkin
FEATURE: Tunnel commande — étape 2 (auth)

  SCENARIO: Client déjà connecté
    GIVEN un client avec token valide
    WHEN il est à l'étape 2
    THEN il est automatiquement passé à l'étape 3

  SCENARIO: Client qui se connecte
    GIVEN un visiteur non connecté
    WHEN il se connecte avec succès à l'étape 2
    THEN il avance à l'étape 3
```

### 3.3 Création de commande

```gherkin
FEATURE: Création de commande

  SCENARIO: Commande créée avec succès
    GIVEN un client connecté avec un template valide et des détails remplis
    WHEN il valide l'étape paiement
    THEN une Order est créée avec status = "pending"
    AND une OrderInstruction est créée avec les détails
    AND le prix est snapshottée depuis le template
    AND la réponse HTTP est 201

  SCENARIO: Commande sans authentification
    GIVEN un visiteur sans token
    WHEN il tente POST /api/orders
    THEN la réponse HTTP est 401
```

---

## 4. DASHBOARD CLIENT

```gherkin
FEATURE: Dashboard client

  SCENARIO: Accès dashboard
    GIVEN un client connecté
    WHEN il accède à /dashboard
    THEN seules ses propres commandes sont affichées
    AND chaque commande affiche le statut, template, prix, date

  SCENARIO: Accès dashboard non authentifié
    GIVEN un visiteur sans token
    WHEN il tente d'accéder à /dashboard
    THEN il est redirigé vers /login

  SCENARIO: Client ne voit pas les commandes d'autres clients
    GIVEN le client A et le client B
    WHEN le client A appelle GET /api/orders
    THEN seules les commandes du client A sont retournées
    AND aucune commande du client B n'est exposée
```

---

## 5. BACKOFFICE ADMIN

```gherkin
FEATURE: Gestion des commandes (Admin)

  SCENARIO: Passage commande en "processing"
    GIVEN une commande status = "pending"
    WHEN l'admin change le statut à "processing"
    THEN le statut est mis à jour via OrderService
    AND le client est notifié (email)

  SCENARIO: Commande "completed"
    GIVEN une commande status = "processing"
    WHEN l'admin passe à "completed"
    THEN le statut est figé
    AND aucune autre transition n'est possible

  SCENARIO: Non-admin accède à /admin
    GIVEN un client avec role = "client"
    WHEN il tente d'accéder à /admin
    THEN l'accès est refusé (403 ou redirection)
```
