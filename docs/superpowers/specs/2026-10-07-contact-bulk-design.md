# Demandes de contact : suppression multiple récupérable

Statut : conception approuvée dans la conversation le 7 octobre 2026. Périmètre confirmé : demandes de contact uniquement.

Les super administrateurs et administrateurs opérations peuvent sélectionner des lignes, ou les 20 lignes de la page courante, puis confirmer leur transfert à la corbeille. Un compteur et un bouton inactif sans sélection rendent la portée explicite. Les filtres et la pagination restent disponibles ; la sélection ne traverse pas les pages.

La corbeille permet de sélectionner et restaurer les demandes. Aucune suppression définitive n’est exposée. Le statut et la date de traitement sont conservés. Les autres rôles sont refusés par Policy et middleware. Les requêtes valident 1 à 100 identifiants distincts. Un identifiant manquant ou dans le mauvais état annule toute l’opération ; transaction et verrouillage protègent le lot.

Flux : Controller → FormRequest / Policy → Service → Model. Ajout de deleted_at et SoftDeletes. Les méthodes existantes de liste et de statut suivent les mêmes règles d’architecture. Formulaires de statut séparés du formulaire collectif, CSRF, messages d’erreur, confirmation avec nombre sélectionné.

Validation : tests de suppression ciblée, restauration, lot invalide, rôles, invité, statut et pagination ; QA Laravel et frontend. Les autres corrections demandées restent hors de cette tranche.
