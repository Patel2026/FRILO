#!/usr/bin/env bash
# Backend-only deployment; keep production Compose, proxy, certificates and volumes.
set -euo pipefail
[[ $(id -u) = 0 ]] || { echo 'Exécuter en root.' >&2; exit 1; }
release_ref="${1:?Usage: bash deploy-admin-bulk.sh COMMIT_SHA}"
cd /var/www/FRILO
umask 022
dc() { docker compose -f /var/www/FRILO/docker-compose.prod.yml "$@"; }

git diff --cached --quiet
git diff --quiet -- . ':!docker-compose.prod.yml' ':!docker/nginx/**'
git fetch origin develop
git cat-file -e "${release_ref}^{commit}"
git merge-base --is-ancestor HEAD "$release_ref"
git merge-base --is-ancestor "$release_ref" origin/develop
# This procedure only supports releases that do not modify production configuration.
git diff --quiet HEAD "$release_ref" -- docker-compose.prod.yml docker/nginx docker/backend frontend

docker exec frilo-nginx nginx -t
backup_dir="/root/frilo-backups/admin-bulk-$(date +%Y%m%d-%H%M%S)"
(
    umask 077
    mkdir -p "$backup_dir"
    git rev-parse HEAD > "$backup_dir/revision.txt"
    cp -a docker-compose.prod.yml "$backup_dir/compose.yml"
    cp -a docker/nginx "$backup_dir/nginx"
    dc exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" exec mysqldump --no-tablespaces --single-transaction --quick --lock-tables=false -u"$MYSQL_USER" "$MYSQL_DATABASE"' > "$backup_dir/database.sql"
    test -s "$backup_dir/database.sql"
    docker inspect frilo-backend --format '{{.Image}}' > "$backup_dir/backend-image.txt"
)
printf 'Sauvegarde : %s\n' "$backup_dir"
git merge --ff-only "$release_ref"

# Repair source permissions inherited from earlier checkouts with umask 077.
# No secrets or uploaded files are included in these paths.
chmod -R a+rX backend/app backend/resources backend/routes backend/config backend/database

dc build backend
# Explicit migration only: never run seeders during a production update.
dc run --rm --no-deps -e RUN_MIGRATIONS=false backend php artisan migrate --force
# Override startup flag without changing the server's Compose file.
cat > "$backup_dir/no-seed.yml" <<'YAML'
services:
  backend:
    environment:
      RUN_MIGRATIONS: "false"
YAML
docker compose -f /var/www/FRILO/docker-compose.prod.yml -f "$backup_dir/no-seed.yml" up -d --no-deps backend
# Resolve the recreated backend's address; retain the running shared proxy.
docker exec frilo-nginx nginx -t
docker exec frilo-nginx nginx -s reload

docker exec --user www-data frilo-backend php -r 'require "/var/www/html/vendor/autoload.php"; foreach (["App\\Models\\Template", "App\\Models\\ContactRequest", "App\\Models\\FaqItem", "App\\Http\\Controllers\\Admin\\CatalogSelectionController"] as $class) { if (!class_exists($class)) { exit(1); } } echo "Lecture du code PHP : OK\n";'
curl --fail --silent --show-error --retry 6 --retry-delay 2 --retry-all-errors --output /dev/null --write-out 'FRILO : HTTP %{http_code}\n' https://frilo.pro/api/templates
curl --fail --silent --show-error --output /dev/null --write-out 'Smoothiz : HTTP %{http_code}\n' https://smoothiiz.com
printf 'Mise à jour terminée. Sauvegarde : %s\n' "$backup_dir"
