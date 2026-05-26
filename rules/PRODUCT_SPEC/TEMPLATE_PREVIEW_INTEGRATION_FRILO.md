# TEMPLATE_PREVIEW_INTEGRATION_FRILO

## Objectif
- Intégrer les templates déposés dans `/template` comme vraies démos navigables dans FRILO.
- Supprimer la dépendance aux previews factices et aux liens externes visibles par le client.

## Source de vérité
- Le dossier `/template` devient la source de vérité des maquettes HTML/CSS/JS livrables.
- Chaque sous-dossier de premier niveau correspond à un package de preview autonome.
- Les sous-dossiers `maquette*` et fichiers techniques non livrables ne sont pas exposés.

## Contrat de preview
- Deux sources de preview sont supportées :
- `external` : une URL externe `https://...` + des pages de preview manuelles
- `local` : un template HTML local precharge depuis le dossier `template/`
- Pour les templates locaux, le format cible est :
- `preview_url = /template-previews/<dossier-template>/`
- `preview_pages = [{ label, path }]` avec des chemins relatifs comme `index.html`, `about.html`, `services.html`

## Rendu client
- Les aperçus immersifs utilisent un `iframe` pointant vers `/template-previews/...`.
- Le client navigue dans les pages du template depuis FRILO sans sortir de la plateforme.
- Aucun lien brut n’a besoin d’être affiché dans l’interface publique.

## Prechargement frontend
- Les fichiers du dossier `template/` sont precharges automatiquement vers `frontend/public/template-previews/`.
- Le prechargement s'exécute avant `dev`, `build` et `start`.
- Les dossiers `maquette*`, les fichiers caches et les artefacts non livrables sont exclus.
- Un `manifest.json` est genere pour tracer les templates locaux exposes.

## Backoffice
- Le backoffice templates expose maintenant deux options explicites :
- `Liens d'acces externes ou manuels`
- `Template HTML local precharge depuis le dossier template/`
- En mode local, l'admin selectionne un dossier precharge et FRILO renseigne automatiquement :
- `preview_url`
- `preview_pages`
- En mode externe, l'admin conserve la saisie manuelle de `preview_url`, `preview_pages` et `preview_gallery`

## Règle d’intégration d’un nouveau template
1. Déposer un nouveau dossier autonome dans `/template`.
2. Vérifier que les pages HTML utilisent des assets relatifs.
3. Relancer le frontend ou le build pour precharger le dossier.
4. Creer ou mettre a jour le template metier en base.
5. Choisir en admin :
6. soit `template local precharge`
7. soit `liens externes`
8. Ajouter la correspondance dans le seeder de preview si le template doit etre disponible en demo par defaut.

## Règles de qualité
- Pas de preview factice `localhost` générique en base.
- Pas de galerie placeholder si le template n’a pas encore de capture valide.
- Pas de mélange entre dossier réel et structure de preview inventée.
- Le nom commercial du template en catalogue peut différer du nom du dossier, mais la correspondance doit être explicite dans le seeder.
