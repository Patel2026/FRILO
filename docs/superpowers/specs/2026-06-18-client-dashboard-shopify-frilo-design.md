# Refonte Espace Client FRILO - Design

Date: 2026-06-18
Statut: design valide par l'utilisateur

## Objectif

Transformer l'espace client FRILO en une console de pilotage inspiree de l'efficacite Shopify, sans copier son interface. L'espace doit rester FRILO: noir, blanc, rouge, sobre, operationnel, avec moins de cards et plus de bandes, listes, tableaux compacts et actions visibles.

La page d'accueil client ne doit pas etre generique. Elle doit s'adapter a ce que le client a reellement pris chez FRILO: commande en cours, site livre, options actives, renouvellement, outils disponibles ou modules non inclus.

## Direction retenue

La direction validee est la V2 "Espace client FRILO personnalise".

Principes:
- Une sidebar stable avec le contexte du client: nom du site ou etat de demarrage.
- Une topbar sombre avec recherche globale, acces au site client et action principale.
- Un accueil construit autour du dossier principal: site actif, commande en cours ou premiere commande a lancer.
- Moins de cards: utiliser des panneaux larges, des bandes de statut, des timelines et des listes compactes.
- Les modules s'affichent selon le contexte client: clients, caisse, echeances, options, renouvellement.
- Le rouge FRILO sert aux actions principales, alertes et echeances critiques.
- Les accents verts/bleus restent limites aux statuts ou donnees positives, jamais comme identite visuelle dominante.

## Etats clients a couvrir

### Client sans commande

L'accueil affiche:
- une bande de demarrage;
- le CTA vers les modeles;
- les etapes du parcours FRILO;
- aucun module metier inutile.

### Client avec commande en cours

L'accueil affiche:
- le nom du projet ou de l'entreprise;
- le statut de commande;
- la prochaine action attendue;
- une timeline de production;
- les documents ou informations manquantes si disponibles.

### Client avec site livre

L'accueil affiche:
- le site principal;
- le lien pour ouvrir le site;
- la demande de modification;
- les echeances de renouvellement;
- les outils actifs selon l'offre.

### Client avec modules utilitaires

Les modules `Mes Clients`, `Ma Caisse` et `Mes Echeances` restent accessibles, mais leur mise en avant depend du contexte:
- module actif si le client l'utilise ou si l'option est incluse;
- module disponible si FRILO veut le proposer comme extension;
- module absent de l'accueil si non pertinent.

## Architecture frontend

Respecter le flux existant:

```text
Page/Composant -> Service api.ts -> API Laravel
```

Ne pas ajouter d'appel `fetch()` direct dans les composants.

Composants cibles:
- `frontend/app/dashboard/layout.tsx`
- `frontend/components/dashboard/Sidebar.tsx`
- `frontend/components/dashboard/NotificationsBell.tsx`
- `frontend/app/dashboard/page.tsx`
- `frontend/app/dashboard/contacts/page.tsx`
- `frontend/app/dashboard/caisse/page.tsx`
- `frontend/app/dashboard/echeances/page.tsx`
- `frontend/app/dashboard/mon-site/page.tsx`
- `frontend/app/dashboard/orders/page.tsx`
- `frontend/app/dashboard/orders/[id]/page.tsx`

Creer des composants partages si cela reduit la duplication:
- `DashboardShellHeader`
- `DashboardPanel`
- `DashboardToolbar`
- `DashboardList`
- `DashboardStatusBand`
- `DashboardTimeline`
- `DashboardModuleList`

Ces composants doivent rester simples et orientes presentation. La logique metier reste dans les services et les pages.

## Design system client

### Layout

- Fond global gris neutre tres clair.
- Sidebar fixe desktop, drawer mobile.
- Contenu principal limite en largeur sur tres grand ecran, mais dense.
- Topbar sombre pour donner un repere produit fort.
- Pas de grille de cards uniforme sur toute la page.
- Tables et listes responsives sans scroll horizontal force.

### Typographie

- Titres courts et directs.
- Labels lisibles, pas d'abus de texte uppercase espace.
- Hierarchie compacte: l'interface doit ressembler a un outil de travail, pas a une landing page.

### Couleurs

- Identite dominante: blanc, noir, gris neutre, rouge FRILO.
- Rouge: CTA principal, alerte, retard, renouvellement urgent.
- Vert: statut positif ou paiement OK.
- Bleu: donnees secondaires si necessaire, tres limite.

### Interactions

- Actions principales toujours visibles.
- Boutons d'ajout visibles apres la creation du premier element.
- Etats vides avec CTA clair.
- Loading avec skeletons ou placeholders locaux, pas uniquement un spinner plein ecran.

## Pages a harmoniser

### Vue d'ensemble

Structure cible:
- header de bienvenue contextuel;
- bande principale du site ou de la commande;
- timeline du dossier;
- liste des outils actifs/disponibles;
- activite recente;
- actions rapides.

### Mon Site

Afficher:
- etat du site;
- URL publique;
- pack ou template associe;
- options actives;
- demandes/modifications;
- echeances de renouvellement.

### Mes Clients

Transformer la liste en vue compacte:
- total contacts;
- action `Ajouter un client`;
- recherche ou filtre simple si deja disponible;
- liste/table responsive avec actions visibles;
- formulaire coherent avec le nouveau style.

### Ma Caisse

Transformer la caisse en outil de suivi:
- periode courante;
- entrees, depenses, solde sous forme de bande resume;
- liste des mouvements sans card lourde;
- action `Ajouter un mouvement` toujours visible;
- formulaire coherent avec le nouveau style.

### Mes Echeances

Clarifier le role:
- rappels FRILO systeme: renouvellement, livraison, paiement, production;
- rappels personnels: declarations, obligations, relances;
- priorite par urgence;
- actions visibles pour les echeances personnelles.

## Responsive

Desktop:
- sidebar visible;
- topbar sombre;
- panneaux sur deux colonnes seulement quand la largeur le justifie.

Tablette:
- sidebar reduite ou drawer;
- contenu en une colonne ou deux colonnes legeres;
- actions dans toolbars compactes.

Mobile:
- drawer de navigation;
- topbar compacte;
- listes empilees;
- boutons pleine largeur seulement dans les formulaires;
- aucun chevauchement de texte;
- pas de scroll horizontal.

## Verification

Avant de considerer la refonte terminee:
- lancer `docker compose exec frontend npm run qa`;
- verifier au navigateur integre:
  - `/dashboard`;
  - `/dashboard/caisse`;
  - `/dashboard/contacts`;
  - `/dashboard/echeances`;
  - `/dashboard/mon-site`;
  - `/dashboard/orders`;
- tester desktop, tablette et mobile;
- confirmer que les actions d'ajout, d'annulation et d'enregistrement restent visibles;
- confirmer que l'espace client affiche bien un contenu adapte au contexte du client.

## Hors scope

- Pas de refonte backend.
- Pas de nouvelle API obligatoire.
- Pas de dependance graphique lourde.
- Pas de copie directe de Shopify.
- Pas de transformation de l'espace client en dashboard analytics generique.
