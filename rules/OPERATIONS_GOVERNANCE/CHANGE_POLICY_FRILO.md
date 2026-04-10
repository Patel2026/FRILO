# CHANGE POLICY — FRILO
## Politique de Modification du Code et du Domaine

Version : 1.1
Statut : OBLIGATOIRE

---

## Principe Fondamental

> **ADDITIVE FIRST par défaut.**
>
> Ajouter du code est autorisé.
> Modifier ou supprimer l'existant nécessite justification et validation.
>
> Aucune modification du workflow commande ne peut être faite "rapidement" ou "temporairement".

---

## 1. RÈGLES DE BASE

### Actions autorisées sans approbation spéciale

| Action | Exemple |
|--------|---------|
| Créer un nouveau fichier | `app/Services/NotificationService.php` |
| Ajouter une méthode non critique | méthode utilitaire privée dans un Service |
| Ajouter une migration additive | nouvelle colonne nullable |
| Ajouter un test | test unitaire ou feature |
| Ajouter une vue ou composant | nouveau composant React non critique |
| Ajouter une route non critique | nouvelle route catalogue |

### Actions nécessitant revue

| Action | Niveau |
|--------|--------|
| Modifier une méthode existante | Review standard |
| Renommer fichier/classe publique | Review + justification |
| Supprimer du code | Review + justification |
| Modifier une migration versionnée | Interdit, sauf procédure exceptionnelle |
| Modifier une Policy ou middleware | Review + validation technique |
| Modifier la structure DB | Review + validation technique |
| Modifier le workflow commande | Validation technique + métier |
| Modifier `OrderService` | Validation technique obligatoire |

### Actions interdites

| Action | Alternative |
|--------|-------------|
| `Order::update(['status' => ...])` direct | Utiliser `OrderService::updateStatus()` |
| Supprimer une commande physiquement | Soft delete uniquement |
| Push direct sur `main` | Toujours via PR |
| Supprimer des tests sans justification | Corriger ou remplacer |
| Modifier une migration déjà exécutée | Créer une migration corrective |
| Ajouter `user_id` dans un FormRequest | Toujours depuis `auth()->id()` |
| Accepter `price` depuis le client | Toujours calculé depuis le template |
| Logique métier dans Controller | Déplacer dans Service |

---

## 2. ENTITÉS CRITIQUES

Toute modification de ces entités exige validation :
- `Order` (et transitions de statut)
- `OrderInstruction` (données client)
- `User` (authentification)
- `Template` (prix, is_active)

---

## 3. RÈGLES WORKFLOW

> **Aucun changement de statut commande ne peut se faire via `Order::update()` direct.**

Obligatoire :
- passer par `OrderService::updateStatus()`
- valider la transition via `canTransition()`
- journaliser l'événement (`OrderStatusChanged`)
- notifier le client si applicable

Interdit :
- SQL direct de changement de statut
- modification silencieuse d'une commande `completed`

---

## 4. RÈGLES RBAC

Obligatoire :
- toute action client protégée par `auth:sanctum`
- toute lecture de commande filtrée par `user_id = auth()->id()`
- toute action backoffice protégée par vérification `role = 'super_admin'`

Interdit :
- conditionner l'accès uniquement côté frontend (contrôle UI)
- bypass des Policies pour "simplifier"

---

## 5. RÈGLES BASE DE DONNÉES

Interdit :
- modifier une migration déjà exécutée sur environnement partagé
- supprimer physiquement une commande
- changer un type de colonne sensible sans migration

Obligatoire :
- toute modification DB via nouvelle migration
- rollback documenté
- soft delete sur `orders`

---

## 6. RÈGLES FRONTEND (Next.js)

Interdit :
- appel `fetch()` direct dans les composants (utiliser les services)
- logique métier dans les composants (utiliser les services)
- données client en dur dans le code

Obligatoire :
- tous les appels API via `api.ts` (instance Axios)
- gestion des états loading / error / empty dans chaque vue
- prix toujours en FCFA avec `.toLocaleString()`

---

## 7. PROCESSUS DE MODIFICATION

1. Lire le code existant
2. Identifier le domaine touché (Catalogue, Commande, Auth, Admin)
3. Vérifier l'impact sur : workflow, RBAC, sécurité, API
4. Obtenir approbation si nécessaire
5. Implémenter en commits atomiques
6. Mettre à jour tests et documentation si besoin
7. Soumettre via PR avec description claire

---

## 8. CHECKLIST AVANT MODIFICATION

- [ ] J'ai identifié le domaine métier impacté
- [ ] Je ne contourne aucun Service métier
- [ ] Je ne contourne aucune Policy
- [ ] Je ne modifie pas `Order::status` en direct
- [ ] Je ne crée pas de nouveau champ qui accepte `user_id` ou `price` du client
- [ ] J'ai prévu les tests nécessaires
- [ ] Ma modification reste dans le scope du ticket

---

## 9. HOTFIXES

Autorisé uniquement si :
- Bug critique production
- Impact métier ou sécurité confirmé
- Pas de workaround viable

Règles :
- Fix minimal, pas de refactoring opportuniste
- Tests ciblés obligatoires
- Si le hotfix touche le workflow commande ou RBAC → validation technique avant merge
