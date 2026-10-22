# Fiabilisation des commandes et paiements — 22 octobre 2026

## Corrections

- `POST /api/orders` exige `idempotency_key` (UUID). Même utilisateur + même clé + mêmes données : commande existante, prix d'origine, aucune nouvelle notification. Clé réutilisée avec des données différentes : HTTP 409. L'index unique et le verrou utilisateur protègent les accès concurrents. L'état actif des modèles/options est vérifié dans le service pour les nouvelles commandes, après recherche d'une soumission existante.
- Le navigateur conserve la clé avant l'envoi dans le stockage local, par utilisateur et empreinte du formulaire. Web Locks sérialise les onglets ; un verrou immédiat protège le bouton. Une réponse perdue, un rechargement ou un retour arrière après paiement réutilisent la commande. L'action explicite « Créer une nouvelle commande » libère cette identité ; une confirmation ne la supprime pas automatiquement.
- Une réservation de paiement est enregistrée sous verrou avant tout appel externe. Les demandes répétées retrouvent le lien existant ou obtiennent HTTP 409 pendant l'initialisation. L'identifiant prestataire est conservé avant la génération du lien.
- Un échec avant création de transaction permet une reprise. Un échec de génération du lien permet de récupérer le lien de la même transaction, y compris après actualisation du statut. Un résultat incertain lors de la création de transaction ou d'un envoi direct bloque la création automatique d'une seconde transaction.
- Les notifications sont appliquées sous verrou : `approved` ne peut plus revenir à `pending`, `declined` ou `canceled`. Un remboursement reste possible et ne peut plus être annulé par une ancienne approbation. Les différentes tentatives d'une commande sont prises en compte pour empêcher une ancienne tentative échouée d'écraser un paiement confirmé.
- Les erreurs prestataire retournent un message public générique (503), avec seulement le type d'exception et l'identifiant de commande dans le journal applicatif de cet endpoint.

## Preuves locales

Les tests de régression ont d'abord reproduit les doublons, la régression de statut et la fuite du message technique. Les cas supplémentaires de reprise après erreur client, erreur de token et désactivation du template ont également été observés en échec avant correction.

- QA backend : `docker compose exec -T backend composer qa`  : 240 tests, 1 023 assertions réussis.
- QA frontend : `docker compose exec -T frontend npm run qa` : 7 tests unitaires, lint sans erreur (24 avertissements non bloquants), typage et build de production réussis.
- API HTTP locale avec vraie base MySQL 8 jetable, quatre workers PHP et prestataire HTTP fictif. Huit créations simultanées : une commande. Huit initiations simultanées, prestataire retardé de deux secondes : une transaction locale et une distante ; les demandes pendant la réservation reçoivent 409, celles après son achèvement retrouvent le même paiement.
- Chrome sur le build de production : paiement approuvé, refus, annulation, inscription pendant le tunnel, double clic, rechargement et retour au formulaire après confirmation, perte volontaire de la réponse de création suivie d'un rechargement, erreur 500 prestataire puis nouvelle tentative. Tous réussis, aucune erreur JavaScript.
- Réponse de création perdue : trois POST de commande ont retourné le même identifiant ; aucun doublon. Après confirmation puis retour arrière : même commande et même paiement.
- Erreur 500 à la création distante : réponse publique 503 ; nouvelle tentative 409 et même commande, sans nouvelle transaction distante.

Les traces temporaires sont `/tmp/frilo-payment-fixed-*.log`, `/tmp/frilo-payment-concurrency.log`, `/tmp/frilo-payment-backend-qa-final.log` et `/tmp/frilo-payment-frontend-qa-final.log`. Le simulateur et les scénarios locaux sont dans `/tmp/frilo-payment-qa/`. Les tests automatisés pérennes sont `PaymentReliabilityTest.php` et `frontend/tests/unit/order-submission.test.mjs`.

Aucun paiement réel, aucun appel au sandbox FedaPay réel, aucune écriture sur frilo.pro. Ces essais valident le comportement applicatif face au contrat simulé ; ils ne certifient pas la configuration ni la livraison des notifications du prestataire en production.

## Exploitation d'une tentative incertaine

Une création distante peut avoir réussi malgré un timeout ou un HTTP 500. Si son identifiant n'a pas été reçu, la tentative demeure `initiating` et ne se libère pas automatiquement avec le temps. Le support doit rapprocher la référence `FRILO-ORD-xxxxx`, le montant, le client et l'heure dans le tableau de bord FedaPay avant toute intervention. Ne pas supprimer cette réservation ou forcer une nouvelle tentative sans vérification chez le prestataire. Une interruption brutale avant enregistrement du lien peut également nécessiter cette vérification. La réconciliation automatique par référence distante n'est pas ajoutée ici.

Les doublons déjà existants et les anciennes commandes dont le statut a été altéré ne sont pas modifiés automatiquement : leur correction nécessite un rapprochement avec le prestataire.

## Mise à jour et retour arrière

Utiliser `scripts/deploy-payment-20261022.sh COMMIT_SHA_COMPLET`, et non le script de dépendances qui refuse les migrations. Le nouveau script sauvegarde la base et les configurations effectives, conserve les réseaux/montages (notamment Smoothiz), vérifie les deux sites, construit les images puis exécute **uniquement** la migration additive `2026_10_22_120000_add_order_idempotency.php`. Il conserve `RUN_MIGRATIONS=false`, ne lance aucun seed et ne supprime aucun volume. Certificats, authentification Nginx et fichiers de configuration en ligne sont conservés.

Les deux colonnes sont nullables : les anciennes commandes restent valides. En cas d'échec de bascule, retour aux images sauvegardées sans suppression des colonnes ni restauration destructive de la base. La migration est conçue pour permettre cet ancien code. Le script a été relu et validé syntaxiquement ; aucun déploiement de production n'a été exécuté pendant ces tests.

Un onglet resté ouvert avec l'ancien frontend doit être rechargé pour envoyer la nouvelle clé obligatoire. Après publication, contrôler un parcours en mode test autorisé avant tout essai de paiement réel.
