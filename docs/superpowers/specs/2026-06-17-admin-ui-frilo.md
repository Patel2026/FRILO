# Refonte UI admin FRILO

## Objectif

Transformer l'administration FRILO actuelle en console operationnelle sobre, lisible et coherente avec l'identite souhaitee : noir, blanc, rouge, avec des couleurs semantiques reservees aux statuts.

L'objectif n'est pas de reconstruire le backoffice. La refonte doit s'appuyer sur le theme Blade/Bootstrap existant et poser une couche FRILO robuste, maintenable et progressive.

## Direction validee

- Interface dense, professionnelle, pensee pour le suivi quotidien des commandes.
- Identite visuelle stricte : noir, blanc, gris neutres, rouge FRILO pour l'accent et les actions principales.
- Suppression de l'effet "dashboard SaaS generique" : moins de bleu, moins de cartes decoratives, plus de hierarchie operationnelle.
- Navigation admin claire, avec sidebar sombre, etat actif visible et libelles faciles a scanner.
- Dashboard oriente decisions : commandes a traiter, retards SLA, revenus, derniers evenements, actions rapides.
- Tables compactes, lisibles, avec statuts et actions visibles.
- Responsive conserve : les vues doivent rester utilisables sur mobile/tablette.

## Scope premiere tranche

1. Couche theme FRILO
   - Variables CSS dans `backend/resources/scss/custom.scss`.
   - Override central des composants communs : body, sidebar, topbar, boutons, badges, cards, tables, formulaires.
   - Rouge FRILO comme accent d'action, noir/blanc comme structure.

2. Layout admin
   - Ajustement de `layouts/master.blade.php` si necessaire pour exposer une classe de shell admin.
   - Refonte visuelle de `layouts/sidebar.blade.php` sans changer les autorisations existantes.
   - Refonte visuelle de `layouts/topbar.blade.php` pour une barre sobre et utile.

3. Dashboard
   - Recomposition de `admin/dashboard.blade.php`.
   - Regrouper les KPI en blocs plus operationnels.
   - Mettre les alertes SLA et dernieres commandes au centre de la lecture.
   - Reduire les elements purement decoratifs.

4. Pages prioritaires
   - Appliquer la couche commune aux pages commandes, templates, options et clients via composants Bootstrap existants.
   - Ne pas refaire toute l'architecture des pages dans cette tranche.

## Contraintes

- Ne pas toucher aux regles metier.
- Ne pas modifier les routes, policies, services ou transitions de commande.
- Ne pas introduire d'appels API ou de logique metier cote vue.
- Garder le fonctionnement RBAC existant de la sidebar.
- Compiler les assets apres modification.
- Verifier dans le navigateur integre sur desktop et mobile.

## Definition de termine

- Dashboard admin visiblement aligne avec la direction FRILO.
- Sidebar/topbar coherentes avec noir/blanc/rouge.
- Boutons, tables, badges et cards n'ont plus l'apparence bleue generique du theme.
- Les pages admin existantes restent accessibles.
- Build assets OK.
- Verification navigateur OK sur `http://localhost:8081/admin/dashboard`.
