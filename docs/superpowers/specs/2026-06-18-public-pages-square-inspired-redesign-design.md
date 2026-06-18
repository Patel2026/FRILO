# Refonte Des Pages Publiques FRILO Inspiree De Square

Date : 2026-06-18  
Statut : design valide par l'utilisateur  
Reference : https://squareup.com/us/en/banking/credit-card  

## Objectif

Refondre les pages publiques commerciales de FRILO en s'inspirant de l'organisation de l'information de Square : promesse claire, benefices courts, sections visuelles utiles, details pratiques, reassurance, puis appel a l'action.

La page d'accueil est consideree comme terminee. Elle ne doit pas etre modifiee dans cette phase.

## Perimetre

Pages a refondre :

- `/templates`
- `/templates/[id]`
- `/secteurs`
- `/secteurs/[slug]`
- `/faq`
- `/contact`
- `/expertises`

Pages hors perimetre :

- `/`
- `/dashboard/*`
- `/commande`
- `/login`
- `/register`
- `/mentions-legales`
- `/cgu`

Toute modification de `frontend/app/page.tsx` est interdite dans cette phase, sauf correction explicitement demandee plus tard par l'utilisateur.

## Direction Validee

Direction choisie : hybride FRILO + Square.

L'inspiration Square porte d'abord sur l'organisation de l'information : promesse, benefices, preuve visuelle, details pratiques, FAQ, CTA. Elle ne signifie pas copier la marque Square, sa palette, ses composants ou ses textes.

Principes :

- Reprendre la clarte et la progression de Square, sans copier son interface.
- Conserver l'identite FRILO : noir, blanc, rouge, sobriete, action claire.
- Utiliser des fonds tres clairs et controles uniquement quand ils servent la lecture.
- Reduire les cards decoratives et privilegier les bandes, blocs utiles, listes et sections image/texte.
- Utiliser les images pour expliquer, rassurer ou montrer un rendu reel.

## Architecture D'information Commune

Chaque page refondue doit suivre une logique proche de cette sequence :

1. Hero utile : promesse concrete, description courte, CTA principal.
2. Benefices courts : 3 ou 4 arguments maximum, faciles a scanner.
3. Section visuelle : image, apercu template, capture ou composition utile.
4. Details pratiques : fonctionnement, prix, contenu inclus, filtres, etapes ou conditions selon la page.
5. Reassurance : aide au choix, FAQ, preuve, contact ou clarifications.
6. CTA final simple : une action principale, pas plusieurs injonctions concurrentes.

Cette sequence peut etre adaptee selon la page, mais l'ordre doit rester comprehensible et commercial.

## Priorite D'implementation

Phase 1 :

- `/templates`
- `/templates/[id]`

But : transformer le catalogue et la fiche template en experience d'achat claire, visuelle et rassurante.

Phase 2 :

- `/secteurs`
- `/secteurs/[slug]`

But : aider le visiteur a se reconnaitre par activite, puis a choisir un modele adapte.

Phase 3 :

- `/faq`
- `/contact`
- `/expertises`

But : harmoniser les pages de reassurance, contact et services autour du meme systeme.

## Regles Anti-regression

Ces regles viennent des dernieres annotations visuelles de l'utilisateur et doivent etre appliquees a toutes les pages refondues :

- Aucun texte ne doit deborder de son conteneur.
- Aucun titre important ne doit etre coupe, tronque ou hyphene de maniere maladroite.
- Les cards ne doivent pas dominer la page ; elles sont reservees aux elements repetes qui en ont besoin.
- Les sections inutiles ou trop explicatives doivent etre supprimees.
- Ne pas repeter une information deja visible a cote, notamment les prix.
- Les images ne doivent pas contenir de texte incruste decoratif.
- Les images doivent couvrir correctement leur zone sans deborder visuellement.
- Les grandes sections doivent etre equilibrees sur desktop, tablette et mobile.
- Les CTA doivent etre visibles, courts et lies a l'action principale.
- Les placeholders doivent etre interactifs ou utiles ; pas de texte vide du type "bientot disponible" s'il n'apporte rien.
- Les labels en petites capitales ne doivent pas etre repetes partout comme une mecanique automatique.
- La page d'accueil reste verrouillee.

## Page `/templates`

Role : aider un visiteur a trouver rapidement une base de site credible.

Structure cible :

- Hero clair avec promesse : choisir une image professionnelle pour son activite.
- Bande de benefices courts : apercu concret, prix visible, commande simple, adaptation FRILO.
- Zone de filtres plus calme : recherche, secteur, budget, tri, favoris et comparaison.
- Catalogue avec cartes templates plus sobres : image dominante, nom, secteur, prix, action.
- Bloc d'aide au choix : si le visiteur ne sait pas quel modele choisir, FRILO peut recommander.

Points d'attention :

- Les filtres ne doivent pas ressembler a un panneau lourd.
- La comparaison doit rester accessible sans envahir l'ecran.
- Les cards templates doivent respecter des hauteurs stables et titres lisibles.

## Page `/templates/[id]`

Role : convaincre le visiteur qu'un modele est le bon choix et lui donner confiance avant commande.

Structure cible :

- Topbar de retour et actions conservee, mais plus calme.
- Hero produit avec nom du modele, secteur, prix, CTA commander, favoris/comparer.
- Preview principale multi-device mise en avant.
- Sections "Pense pour" et "Inclus" bien separees.
- Galerie ou live preview claire, avec controles desktop/tablette/mobile lisibles.
- Bloc reassurance : ce que FRILO adapte, ce que le client fournit, ce qui est livre.
- Avis si disponibles, sinon placeholder utile.

Points d'attention :

- Les controles de preview ne doivent pas prendre plus d'importance que le modele.
- Les contenus inclus ne doivent jamais se retrouver dans "Pense pour".
- Sur mobile, les actions importantes doivent rester accessibles sans cacher le contenu.

## Pages `/secteurs` Et `/secteurs/[slug]`

Role : faire entrer le visiteur par son activite.

Structure cible `/secteurs` :

- Hero simple : choisir son activite ou la plus proche.
- Liste de secteurs sous forme de bandes ou de cartes sobres, pas de grille trop decorative.
- Chaque secteur doit montrer le benefice concret et mener vers ses modeles.
- Aide explicite pour le cas ou aucun secteur ne correspond parfaitement.

Structure cible `/secteurs/[slug]` :

- Hero sectoriel avec promesse orientee metier.
- Templates du secteur, avec image et prix visibles.
- Section "ce que ce secteur doit montrer" : services, preuves, contacts, demandes.
- CTA vers catalogue complet ou accompagnement.

Points d'attention :

- Les titres longs de secteurs doivent rester lisibles.
- L'utilisateur doit comprendre qu'il peut choisir un secteur proche meme si son metier exact n'existe pas.

## Page `/faq`

Role : rassurer avant commande.

Structure cible :

- Hero court, sans grande card laterale inutile.
- FAQ en accordions lisibles.
- Regroupement possible par themes si le volume augmente : prix, livraison, contenu, propriete, suivi.
- CTA final vers contact ou catalogue selon le contexte.

Points d'attention :

- Pas de repetition entre intro et CTA.
- La FAQ doit etre dense mais respirable.

## Page `/contact`

Role : recevoir une demande claire.

Structure cible :

- Hero direct : dire son besoin, recevoir une prochaine etape.
- Canaux de contact visibles mais discrets.
- Formulaire plus structure : identite, contexte, message.
- Texte d'aide court pour expliquer quoi remplir.
- Etat succes clair apres envoi.

Points d'attention :

- Le formulaire doit etre lisible sur mobile.
- Les champs optionnels doivent rester secondaires.
- Les erreurs doivent etre visibles sans casser la mise en page.

## Page `/expertises`

Role : presenter les services additionnels sans parasiter l'offre principale.

Structure cible :

- Hero qui clarifie que ces expertises completent le site FRILO.
- Sections par besoin business plutot que grille de services generiques.
- Mise en avant de 3 a 4 expertises prioritaires, puis liste secondaire si necessaire.
- CTA vers contact avec sujet pre-rempli.

Points d'attention :

- Eviter les gradients texte et les cards multicolores.
- Corriger les textes approximatifs existants.
- Garder le lien avec l'offre principale : le site d'abord, les services en soutien.

## Donnees Et Architecture Frontend

Contraintes existantes :

- Aucun `fetch()` direct dans les composants.
- Les donnees API restent dans les services/hooks.
- Les pages publiques peuvent reutiliser les donnees templates, secteurs, prix, FAQ et contact existantes.
- Aucune logique metier ne doit etre ajoutee dans les composants.

Approche :

- Creer si utile des composants UI publics reutilisables pour les sections hors home.
- Garder les composants proches du besoin : hero public, bloc benefices, section image/texte, CTA final, etat vide.
- Ne pas refactorer l'ensemble du frontend hors besoin de la refonte.

## Tests Et Verification

Verification minimale avant commit d'implementation :

- `docker exec frilo-frontend npm run qa`
- Verification navigateur des pages modifiees en desktop et mobile.
- Controle que `/` n'a pas ete modifiee.

Verification visuelle obligatoire :

- `/templates`
- `/templates/[id]`
- `/secteurs`
- `/secteurs/[slug]`
- `/faq`
- `/contact`
- `/expertises`

Points a verifier :

- Pas de texte coupe.
- Pas de debordement horizontal.
- Images chargees et correctement cadrees.
- CTA visibles.
- Etats chargement, vide et erreur acceptables.
- Mobile utilisable sans chevauchement.

## Non-objectifs

- Ne pas redeployer.
- Ne pas modifier le dashboard client.
- Ne pas modifier l'espace admin.
- Ne pas modifier le tunnel de commande.
- Ne pas toucher a la page d'accueil.
- Ne pas ajouter de nouveau systeme CMS dans cette phase.

## Decision

Le design est valide par l'utilisateur avec deux conditions :

1. S'inspirer de l'organisation de l'information de Square.
2. Integrer les remarques recentes pour eviter les memes erreurs dans la nouvelle mise en place.

Cette spec sert de base avant le plan d'implementation.
