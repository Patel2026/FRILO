# Plan actions catalogue

Statut : validé localement, non déployé. Conception : ../specs/2026-10-07-catalog-bulk-design.md.

1. CatalogBulkTest : routes absentes constatées avant implémentation.
2. BulkCatalogRequest, CatalogSelectionController, CatalogSelectionService, policies : validation, autorisations, lots transactionnels.
3. FaqItem et migration : suppression récupérable ; index FAQ/templates et partials Blade : sélection, compteur, confirmation, restauration ; secteurs : activation/désactivation.
4. Tests d’intégrité commandes/images et visibilité, revue indépendante, Pint ciblé et QA Docker.

Dépendances : 1 → 2 → 3 → 4. Aucun déploiement distant automatique. Rollback : garder la colonne deleted_at ; revenir au code précédent réexpose les FAQ supprimées. G4/G5/G6 Aramel non applicables à cette tranche FRILO.

## Preuves de validation

- 7 tests catalogue, dont régression concurrente FAQ reproduite avant correction.
- QA Laravel : 228 tests, 959 assertions réussis.
- Pint explicite : 13 fichiers conformes ; diff --check sans erreur.
- QA frontend : tests unitaires, lint (4 avertissements img préexistants), typage et compilation réussis.
- Navigateur local : listes templates/FAQ/secteurs, boutons désactivés à vide, sélection totale et partielle, compteur et état intermédiaire de la case globale vérifiés.
- Revue indépendante : risque de mise à jour concurrente FAQ corrigé et relu, aucun point bloquant restant.
- Fixtures QA catalogue conservées uniquement en local : deux secteurs, deux templates, deux FAQ. Aucun élément de production modifié.
