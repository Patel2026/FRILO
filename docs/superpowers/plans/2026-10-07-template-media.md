# Plan — médias templates

Status : implémenté et vérifié localement ; déploiement non effectué.

| Étape | Fichiers | Test préalable | Action / vérification |
| --- | --- | --- | --- |
| 1 | tests Admin/TemplateAdminTest, frontend/tests/unit | URL disque public, mode, URL de démo | Exécuter les tests en échec |
| 2 | Template, TemplateService, Requests, migration, API | création/modification et validation | Persister le mode ; sécuriser URL et remplacement image ; PHPUnit |
| 3 | formulaire Blade, templatePreview, écrans démo, images catalogue | tests URL + navigateur | Expliquer les modes, lien direct, miniatures sans optimisation serveur ; QA frontend |
| 4 | Docker Compose, Nginx, documentation | vérifier partage du stockage | Volume public persistant, lecture Nginx, procédure de conservation |
| 5 | tests et diff | suites complètes | QA backend/frontend, revue accès et UX, preuve des limites |

Dépendances : 1 → 2 → 3 ; 4 indépendant ; 2/3/4 → 5.
G4/G5/G6 financiers non applicables : aucun changement commande/paiement.
Revue : stockage, validation des URL, compatibilité des templates existants.
Retour arrière : revenir au code précédent sans supprimer les fichiers du
volume ; colonne additive compatible avec l'ancien code. Ne jamais supprimer
le volume pour revenir en arrière. Migration inverse uniquement après rollback.

## Preuves de vérification

- `docker compose exec backend composer qa` : 214 tests, 859 assertions, succès.
- Pint explicite sur les six fichiers PHP modifiés/ajoutés : succès.
- `docker compose exec frontend npm run qa` : 4 tests unitaires, lint sans
  erreur (4 avertissements image préexistants), typage et build réussis.
- Playwright `template-media.spec.ts` : 6 tests réussis, dont ouverture réelle
  dans un nouvel onglet sur viewport mobile.
- Téléversement réel WebP dans le disque public Docker : URL Laravel et Nginx
  partagé renvoient HTTP 200 et les mêmes octets (SHA-256 identique).
- Revue indépendante : échec de stockage corrigé ; aucun point important restant.
- Les tests navigateur utilisent des démos contrôlées : la disponibilité et
  l'autorisation d'intégration d'un fournisseur externe restent propres à son site.

Déploiement : suivre `docs/template-media-deployment.md` pour préserver les
images déjà présentes avant la recréation des conteneurs.
