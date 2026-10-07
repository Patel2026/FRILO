# Déploiement des actions multiples d’administration

Publication backend uniquement : contacts et FAQ avec corbeille ; templates supprimés logiquement ; secteurs activables/désactivables par lot.

Utiliser `scripts/deploy-admin-bulk.sh` avec le SHA complet communiqué pour la publication. Depuis `/var/www/FRILO`, récupérer `develop`, extraire le script depuis le commit ciblé dans `/root`, puis exécuter le script avec ce même SHA. Ne pas exécuter un script provenant d’une autre version.

Le script refuse une divergence Git, les modifications applicatives locales et une release qui changerait Compose, le proxy, Docker ou le frontend. Les changements locaux Compose/nginx restent en place. Il sauvegarde la base et les configurations proxy, corrige les permissions de lecture des répertoires source PHP, construit uniquement le backend, exécute les migrations sans seed et recrée seulement le backend. Le proxy est rechargé gracieusement pour résoudre son adresse. Aucun volume ni certificat n’est supprimé. Une courte indisponibilité FRILO est possible pendant le remplacement du backend.

La correction des permissions est appliquée par cette procédure ; la normalisation générale dans le Dockerfile reste un travail séparé. Les modifications du bandeau cookies et la configuration de Healthy body ne sont pas incluses.

Après succès : contrôler les listes Contacts/Templates/FAQ, leur corbeille et restauration sur une donnée de test, puis activation/désactivation des secteurs. Ne pas confirmer une suppression sur des données métier avant d’avoir vérifié la sélection. Les clients et paiements ne sont pas concernés.

En cas d’erreur : arrêter, conserver la sortie et le chemin de sauvegarde affiché. Ne pas utiliser `docker compose down -v`, ne pas lancer les seeders ni rollback automatique des migrations. Revenir à un ancien code FAQ sans SoftDeletes réexpose les questions en corbeille : le retour arrière nécessite de décider de leur visibilité. La sauvegarde SQL est réservée à une restauration contrôlée ; l’import écraserait les évolutions postérieures.
