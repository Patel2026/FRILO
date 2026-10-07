# Actions multiples du catalogue

Conception : reprise du fonctionnement contacts approuvé. Périmètre : templates, FAQ, secteurs. Le 7 octobre, l’utilisateur a choisi explicitement la désactivation multiple pour les secteurs.

Templates et FAQ : sélection de la page, confirmation, suppression logique et restauration. Les fichiers image et les commandes liés restent conservés. La FAQ reçoit deleted_at ; la suppression individuelle devient également récupérable. Une restauration rétablit la visibilité d’origine. Aucun endpoint de purge.

Secteurs : activation / désactivation multiple uniquement, comme l’action individuelle existante ; aucune suppression physique ni suppression des templates associés.

Autorisations : super_admin et content_admin via Policy et middleware. FormRequest borne la sélection à 100 IDs distincts. Service transactionnel avec verrous, aucun traitement partiel d’un lot invalide. Journal d’audit par élément. Les liens de pagination et les filtres de FAQ conservent la vue corbeille.

Validation : tests des droits, des lots invalides, de la restauration et visibilité publique FAQ, conservation des commandes et miniatures, activation des secteurs. QA complète backend et frontend. Migration additive sans seed avant déploiement. Ne pas retirer deleted_at avant d’avoir traité la corbeille (perte de son état).
