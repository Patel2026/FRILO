# Plan contacts

Statut : implémenté et validé localement, non déployé. Objectif : implémenter le périmètre contacts approuvé.

| Étape | Fichiers | Test / action | Vérification |
|---|---|---|---|
| 1 | tests/Feature/Admin/ContactRequestAdminTest.php | Tests comportementaux avant implémentation | Échec des routes absentes |
| 2 | migration, ContactRequest, ContactRequestPolicy, Requests/Admin/*ContactRequest*, Services/ContactRequestService | SoftDeletes, droits, validation, transaction ; extraction liste/statut | Tests ciblés Laravel |
| 3 | ContactRequestController, routes/web.php, views/admin/contact-requests/index.blade.php | Routes collectives, sélection page, compteur, confirmation, corbeille | Tests HTML et vérification navigateur local |
| 4 | Tous fichiers modifiés | Revue indépendante accès / intégrité / UX | QA backend et frontend |

Dépendances : 1 → 2 → 3 → 4. Aucune dépendance fournisseur, financière ou juridique ; G4/G5/G6 Aramel non applicables à ce dépôt FRILO.

Déploiement : migration additive avant mise en service du code. Pas de purge ni de seed. Rollback : conserver deleted_at et revenir au code précédent uniquement après restauration des contacts supprimés si leur réapparition est souhaitée ; supprimer la colonne perd l’information de corbeille. Aucun déploiement de production effectué dans cette tranche.

## Résultats

- Tests ciblés : 7 tests ; cycle rouge/vert confirmé pour routes absentes et modification de statut périmée.
- QA backend : 221 tests, 902 assertions réussies.
- Pint explicite : 9 fichiers validés (le conteneur ne dispose pas du dépôt Git pour --dirty).
- QA frontend : tests unitaires, lint, typage et build réussis ; 4 avertissements img préexistants.
- Navigateur local : sélection de page, compteur, confirmation, transfert de deux demandes fictives vers la corbeille puis restauration confirmés.
- Revue indépendante : cas concurrent corrigé, aucune réserve bloquante restante.
- Deux demandes fictives QA-CONTACTS et un compte QA Contacts restent dans la base locale pour revue. Aucun enregistrement de production modifié.
