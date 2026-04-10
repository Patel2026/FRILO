# CHECKLIST RECETTE — FRILO
## Recette fonctionnelle et technique

Version : 1.1
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
- [ ] Utilisateur déjà connecté sur `/login` ou `/register` → redirection automatique vers `/dashboard`
- [ ] Espace public (header/footer) avec session active → afficher `Dashboard` et ne pas afficher `Connexion`/`Inscription`

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
- [ ] Client déjà connecté : bypass étape 2 (auth) et passage direct à l'étape 3
- [ ] Étape 3 : détails projet stockés correctement
- [ ] Étape 4 : création commande `POST /api/orders` → 201
- [ ] Commande créée avec status = "pending"
- [ ] OrderInstruction créée avec les bonnes données
- [ ] Prix snapshotté depuis le template
- [ ] Étape 5 : numéro de commande affiché
- [ ] En cas d'échec étape paiement : message actionnable + reprise possible

---

## 4. DASHBOARD CLIENT

- [ ] `/dashboard` sans token → redirect vers `/login`
- [ ] `/dashboard` avec token → commandes du client affichées
- [ ] Client A ne voit pas les commandes de client B
- [ ] Badge statut avec la bonne couleur
- [ ] Commandes vides → message "Vous n'avez pas encore de commande"
- [ ] Erreur API dashboard/orders : état d'erreur distinct avec action de retry
- [ ] `/dashboard/orders/{id}` affiche le détail commande + instructions du client connecté

---

## 5. SÉCURITÉ

- [ ] `POST /api/orders` sans token → 401
- [ ] `GET /api/orders` sans token → 401
- [ ] Client ne peut pas accéder à `/admin`
- [ ] Ancien rôle `admin` migré en `super_admin`
- [ ] `price` accepté dans le body de POST /api/orders est ignoré (prix depuis template)
- [ ] `user_id` dans le body est ignoré (user depuis auth token)
- [ ] `status` dans le body est ignoré (toujours `pending` à la création)
- [ ] Template inactif → 422 si commandé
- [ ] `POST /api/contact` : throttling anti-spam actif (429 après dépassement limite)

---

## 6. WORKFLOW STATUTS (Admin)

- [ ] `pending → processing` : OK via OrderService
- [ ] `processing → completed` : OK via OrderService
- [ ] `pending → cancelled` : OK via OrderService
- [ ] `completed → processing` : REFUSÉ (409)
- [ ] `completed` : aucun champ modifiable
- [ ] `Order::update(['status' => ...])` direct : ne pas utiliser (test via code review)

---

## 7. BACKOFFICE ADMIN CUSTOM

- [ ] `admin@frilo.com` (rôle `super_admin`) peut accéder à `/admin`
- [ ] `client@frilo.com` ne peut pas accéder à `/admin`
- [ ] Liste des commandes avec filtres par statut
- [ ] Détail commande affiche les instructions client
- [ ] CRUD templates fonctionnel
- [ ] CRUD secteurs fonctionnel
- [ ] Liste clients accessible en lecture
- [ ] Liste demandes contact accessible côté admin (`/admin/contact-requests`)
- [ ] Mise à jour du statut de traitement d'une demande contact côté admin
- [ ] Rubrique `/admin/settings` accessible au `super_admin` uniquement
- [ ] Édition section settings (`PATCH /admin/settings/{section}`) fonctionnelle
- [ ] Test paiement (`POST /admin/settings/payment/test`) fonctionnel
- [ ] Publication (`POST /admin/settings/publish`) crée une version active + nouveau brouillon
- [ ] Historique (`GET /admin/settings/history`) visible et restauration brouillon possible
- [ ] Secrets paiement jamais visibles en clair dans UI/API/DB brute

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
- [ ] Sidebar dashboard utilisable sur mobile (menu ouvrir/fermer)
- [ ] Prix affichés en FCFA avec séparateur de milliers
- [ ] Badge statuts avec bonnes couleurs

---

## 10. PAGES LÉGALES & CONTACT

- [ ] `/mentions-legales` accessible depuis le footer
- [ ] `/cgu` accessible depuis le footer et le formulaire d'inscription
- [ ] Formulaire `/contact` connecté à l'API (`POST /api/contact`) avec états loading/success/error

---

## 11. TESTS AUTOMATISÉS

- [ ] `php artisan test` → tous les tests passent
- [ ] `npm run e2e` → scénario critique Playwright vert
- [ ] Couverture : OrderService (createOrder, updateStatus, canTransition)
- [ ] Couverture : OrderPolicy (view, viewAny)
- [ ] Couverture : AuthController (register, login, logout)
- [ ] Couverture : endpoints publics (sectors, templates)
- [ ] Couverture : endpoint public contact (`ContactApiTest`)
- [ ] Couverture E2E : UX client public/dashboard (`client-experience.spec.ts`)

---

## 12. CONFORMITÉ BUSINESS PLAN 2026

- [ ] Test de couverture : chaque section majeure du Business Plan a au moins un document `rules/` de référence
- [ ] Test de cohérence : prix, délais, phases, statuts et hypothèses sont cohérents entre charter, backlog, workflow et contrats business
- [ ] Test d'exécutabilité : chaque trimestre de roadmap contient owner, KPI, dépendances et critères de sortie
- [ ] Test de gouvernance : tout conflit Business Plan vs règles techniques est résolu par décision explicite (ADR ou document de gouvernance)
