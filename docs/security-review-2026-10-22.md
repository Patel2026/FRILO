# Revue sécurité FRILO — 22 octobre 2026

## Périmètre et limites

Vérification des bulletins disponibles le 22 octobre, en priorité ceux de la semaine du 19 octobre, contre les fichiers verrouillés et les environnements locaux. Les bulletins plus anciens encore applicables sont inclus séparément. Aucun exploit ni scan offensif n'a été lancé contre la production. La présence d'une version vulnérable ne prouve pas une compromission.

Le propriétaire a confirmé PHP 8.2.34 dans `frilo-backend` en production pendant cette revue : les deux failles PHP sont donc applicables à la version du serveur. Les versions Node.js, Next.js et Nginx en production restent à relever. Ce rapport ne certifie pas l'absence de toute vulnérabilité : OS hôte, MySQL, toutes les bibliothèques natives et services externes ne sont pas couverts par les audits npm/Composer.

## Alertes de la semaine

| Composant | Preuve locale avant correction | Correctif préparé | Analyse |
| --- | --- | --- | --- |
| PHP | Conteneur 8.2.34, images flottantes 8.2-fpm-alpine | 8.2.35-fpm-alpine dans les deux Dockerfiles | CVE-2026-109618 et CVE-2026-109619, annoncées le 21 octobre : RCE dans le moteur PHP, PHP-FPM concerné ; correction urgente. |
| Node.js | Conteneur frontend 22.23.3 | 22.23.4-alpine dans tous les Dockerfiles frontend | Bulletin du 21 octobre : corrections DNS, TLS, Brotli et dépendances ; la version locale précède le correctif. Exploitabilité de chaque chemin non démontrée. |

Sources primaires : [PHP](https://www.php.net/), [Node.js](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).

## Alertes antérieures encore présentes

- Next.js 16.1.6 → 16.4.2, React/React DOM 19.2.3 → 19.3.1, Axios → 1.20.0, eslint-config-next aligné sur Next.js. Dépendances transitives corrigées sans `audit fix --force`.
- Le [bulletin Next.js du 14 octobre](https://nextjs.org/blog/nextjs-security-update-october-14-2026) décrit notamment Cache Components, SVG sur Linux glibc et Server Actions. FRILO utilise App Router mais aucune directive `use server`/`use cache` ni `cacheComponents` n'a été trouvée ; les images de production sont Alpine/musl. Ces conditions spécifiques ne sont donc pas établies dans la configuration actuelle. D'autres alertes concernent Next.js, ses réécritures et ses dépendances : la mise à jour reste nécessaire.
- Laravel 12.56.0 → 12.70.1, Guzzle 7.10.0 → 7.16.0, PSR-7 2.9.0 → 2.13.2, CommonMark 2.8.2 → 2.10.4, Flysystem 3.33.0 → 3.36.0, composants Symfony corrigés en conservant la compatibilité PHP 8.2. Les alertes Composer concernent 12 paquets, dont plusieurs chemins dépendent de la configuration (debug, mail, parsing Markdown/YAML).
- Dockerfiles Nginx : 1.27-alpine → 1.30.6-alpine, d'après les [avis officiels Nginx](https://nginx.org/en/security_advisories.html). Les conditions varient selon les modules et directives ; configuration réelle du proxy de production à contrôler. Aucun changement de configuration nginx, de réseau, de certificat ou de volume.

## Alertes résiduelles à ne pas masquer

- L'audit frontend complet conserve cinq entrées de sévérité élevée autour de `braces` et de sa chaîne de dépendances ESLint. L'audit de production est vide. npm propose une rétrogradation vers eslint-config-next 14 pour contourner cette chaîne : elle n'est pas appliquée, car incohérente avec Next.js 16. Ne pas traiter de motifs glob provenant de sources non fiables dans l'outillage.
- L'image frontend retire désormais les dépendances de développement après compilation (`npm prune --omit=dev`). La configuration Next est convertie à comportement identique en `.mjs` pour ne pas nécessiter TypeScript au démarrage.
- Baseline lint frontend : les nouvelles règles React Compiler signalent 19 erreurs préexistantes. `set-state-in-effect` passe en avertissement uniquement dans les fichiers concernés, et `static-components` uniquement dans la page de retour paiement. Les autres fichiers gardent les erreurs. Ces exceptions permettent aussi de nouveaux avertissements dans les fichiers listés : ce n'est pas un gel du nombre d'occurrences ni une résolution de cette dette.
- Le verrou npm du thème Blade historique contient 62 entrées affectées (2 critiques, 18 élevées, 41 modérées, 1 faible ; les entrées incluent des dépendances indirectes, ce ne sont pas 62 exploits indépendants). Notamment Swiper, Moment, Quill, CKEditor et ECharts. Aucune référence à ces bibliothèques n'a été trouvée dans les vues `admin` ni `frilo-admin.js` ; les fichiers historiques restent présents dans `public/build`. Cela ne suffit pas à déclarer tout le thème sûr. Leur migration et la régénération des assets constituent un travail distinct, non réalisé par cette mise à jour des runtimes. Ne pas croire qu'un changement de verrou remplacerait les fichiers JS déjà copiés dans `public/build`.

## Validation finale après redémarrage Docker — 22 octobre

- Backend après installation du verrou corrigé : `docker compose exec -T backend composer qa` : 228 tests, 959 assertions, succès.
- Nouvelle image backend construite ; exécution vérifiée : PHP 8.2.35 et Laravel 12.70.1.
- Audit frontend de production : zéro alerte après correction.
- Audit Composer final : aucune alerte, aucun paquet abandonné.
- Docker Desktop redémarré avec autorisation utilisateur après blocage du moteur. Les échecs initiaux liés à Docker et au sandbox macOS sont supersédés par les vérifications Docker ci-dessous.
- QA frontend complète dans Docker : quatre tests unitaires, lint (0 erreur, 24 avertissements documentés), TypeScript et build Turbopack passent, code 0.
- Image frontend de production construite après pruning ; démarrage isolé avec `--network none` réussi ; accueil et catalogue HTTP 200 ; Next 16.4.2, React 19.3.1, Axios 1.20.0. TypeScript et ESLint absents : aucun téléchargement requis au démarrage. Cela vérifie les pages de repli, pas le contenu connecté du serveur.
- Images backend et Nginx construites. Chargement des classes applicatives sous `www-data` vérifié en PHP 8.2.35. Permissions des sources normalisées dans l'image backend et des fichiers publics dans l'image Nginx.
- Nginx 1.30.6 : configuration du dépôt testée avec `nginx -t` sur le réseau local FRILO. La configuration SSL/Smoothiz propre au serveur sera testée par le script avant remplacement du proxy.
- `bash -n scripts/deploy-security-20261022.sh` et cinq tests hors ligne de préservation de configuration passent ; revue indépendante sans blocage après ajout du refus des IP statiques/options réseau particulières.

## Mise en production

Les corrections locales ne mettent pas à jour le serveur. Relever d'abord les versions réelles avec `docker exec frilo-backend php -v`, `docker exec frilo-frontend node --version` et `docker exec frilo-nginx nginx -v` ; vérifier également Next.js via `docker exec frilo-frontend node -p 'require("next/package.json").version'`.

Utiliser `scripts/deploy-security-20261022.sh COMMIT_SHA_COMPLET` en root depuis `/var/www/FRILO`. Nécessite Python 3, Docker Compose avec sortie JSON et Git. Ne pas utiliser `deploy-admin-bulk.sh` pour cette release : il refuse à juste titre les changements Docker/frontend.

Le script sauvegarde la base et les configurations locales dans `/root/frilo-backups/security-DATE`, étiquette les images actives pour retour arrière, puis construit les images corrigées avant toute coupure. La configuration Compose rendue contient des valeurs sensibles : répertoire et fichiers privés, à ne pas publier. Les montages réels et ports doivent correspondre au Compose serveur ; les réseaux réels (dont Smoothiz) sont conservés. IP statiques et options réseau particulières déclenchent un arrêt avant modification.

Le nouveau Nginx est testé avec les montages et le réseau du proxy encore actif. Aucun besoin de migrations ni de seeds : `RUN_MIGRATIONS=false` pour la publication et le retour arrière. Le remplacement du proxy peut provoquer une brève coupure des deux domaines. Contrôles HTTPS avec validation des certificats, puis affichage des versions. En cas d'échec après remplacement, tentative automatique de restauration des images précédentes ; le script reste en échec et demande de vérifier les deux sites. Les fichiers Git restent sur le nouveau commit : ne pas reconstruire aveuglément après retour arrière.

Si une restauration manuelle est nécessaire, utiliser la configuration privée `rollback.json` affichée dans le répertoire de sauvegarde, avec `docker compose --project-directory /var/www/FRILO -f /root/frilo-backups/security-DATE/rollback.json up -d --no-deps --no-build --pull never backend frontend nginx`. Cela ne restaure pas la base, aucune migration n'étant lancée. Conserver les images de secours jusqu'à validation de la publication. Ne pas utiliser `down -v`, ne pas écraser les configurations serveur ni supprimer les volumes/certificats.
