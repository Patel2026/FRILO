# CHECKLIST RECETTE — FRILO
## Recette fonctionnelle et technique

Version : 1.0
Statut : RÉFÉRENCE

---

## 1. AUTHENTIFICATION

- [ ] Inscription avec email valide → token retourné
- [ ] Inscription avec email déjà utilisé → 422 avec message
- [ ] Inscription avec password < 8 chars → 422
- [ ] Connexion avec bons identifiants → token retourné
- [ ] Connexion avec mauvais identifiants → 401/422
- [ ] Déconnexion → token révoqué, localStorage vidé
- [ ] `GET /api/user` sans token → 401
- [ ] `GET /api/user` avec token valide → données utilisateur

---

## 2. CATALOGUE

- [ ] `GET /api/sectors` → liste secteurs is_active=true uniquement
- [ ] `GET /api/templates` → liste templates actifs avec secteur eager loaded
- [ ] `GET /api/templates?sector_slug=restaurants` → filtre correct
- [ ] `GET /api/templates/1` → détail template avec secteur
- [ ] `GET /api/templates/99999` → 404
- [ ] Homepage charge les secteurs depuis l'API (pas les mocks)
- [ ] Page `/secteurs/{slug}` affiche les bons templates
- [ ] Template inactif absent du catalogue public

---

## 3. TUNNEL DE COMMANDE

- [ ] `/commande` sans templateId → message "Aucun modèle sélectionné"
- [ ] `/commande?templateId=1` → récapitulatif template affiché
- [ ] Étape 2 : formulaire login fonctionnel dans le tunnel
- [ ] Étape 2 : formulaire register fonctionnel dans le tunnel
- [ ] Étape 3 : détails projet stockés correctement
- [ ] Étape 4 : création commande `POST /api/orders` → 201
- [ ] Commande créée avec status = "pending"
- [ ] OrderInstruction créée avec les bonnes données
- [ ] Prix snapshotté depuis le template
- [ ] Étape 5 : numéro de commande affiché

---

## 4. DASHBOARD CLIENT

- [ ] `/dashboard` sans token → redirect vers `/login`
- [ ] `/dashboard` avec token → commandes du client affichées
- [ ] Client A ne voit pas les commandes de client B
- [ ] Badge statut avec la bonne couleur
- [ ] Commandes vides → message "Vous n'avez pas encore de commande"

---

## 5. SÉCURITÉ

- [ ] `POST /api/orders` sans token → 401
- [ ] `GET /api/orders` sans token → 401
- [ ] Client ne peut pas accéder à `/admin`
- [ ] `price` accepté dans le body de POST /api/orders est ignoré (prix depuis template)
- [ ] `user_id` dans le body est ignoré (user depuis auth token)
- [ ] `status` dans le body est ignoré (toujours `pending` à la création)
- [ ] Template inactif → 422 si commandé

---

## 6. WORKFLOW STATUTS (Admin)

- [ ] `pending → processing` : OK via OrderService
- [ ] `processing → completed` : OK via OrderService
- [ ] `pending → cancelled` : OK via OrderService
- [ ] `completed → processing` : REFUSÉ (409)
- [ ] `completed` : aucun champ modifiable
- [ ] `Order::update(['status' => ...])` direct : ne pas utiliser (test via code review)

---

## 7. BACKOFFICE FILAMENT

- [ ] `admin@frilo.com` peut accéder à `/admin`
- [ ] `client@frilo.com` ne peut pas accéder à `/admin`
- [ ] Liste des commandes avec filtres par statut
- [ ] Détail commande affiche les instructions client
- [ ] CRUD templates fonctionnel
- [ ] CRUD secteurs fonctionnel
- [ ] Liste clients accessible en lecture

---

## 8. PERFORMANCE

- [ ] `GET /api/templates` avec 50 templates : < 500ms
- [ ] Homepage : pas de requête N+1 (eager loading secteurs)
- [ ] Liste commandes paginée (vérifier si volume important)

---

## 9. RESPONSIVE / UI

- [ ] Homepage correcte sur mobile (375px)
- [ ] Tunnel de commande utilisable sur mobile
- [ ] Dashboard lisible sur mobile
- [ ] Prix affichés en FCFA avec séparateur de milliers
- [ ] Badge statuts avec bonnes couleurs

---

## 10. TESTS AUTOMATISÉS

- [ ] `php artisan test` → tous les tests passent
- [ ] Couverture : OrderService (createOrder, updateStatus, canTransition)
- [ ] Couverture : OrderPolicy (view, viewAny)
- [ ] Couverture : AuthController (register, login, logout)
- [ ] Couverture : endpoints publics (sectors, templates)

---

## 11. CONFORMITÉ BUSINESS PLAN 2026

- [ ] Test de couverture : chaque section majeure du Business Plan a au moins un document `rules/` de référence
- [ ] Test de cohérence : prix, délais, phases, statuts et hypothèses sont cohérents entre charter, backlog, workflow et contrats business
- [ ] Test d'exécutabilité : chaque trimestre de roadmap contient owner, KPI, dépendances et critères de sortie
- [ ] Test de gouvernance : tout conflit Business Plan vs règles techniques est résolu par décision explicite (ADR ou document de gouvernance)
