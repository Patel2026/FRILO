#!/usr/bin/env bash
# Payment reliability release: one additive migration, no seed, volume removal or SSL edit.
set -euo pipefail
[[ $(id -u) = 0 ]] || { echo 'Exécuter en root.' >&2; exit 1; }
command -v python3 >/dev/null
release_ref="${1:?Usage: bash deploy-payment-20261022.sh COMMIT_SHA}"
[[ "$release_ref" =~ ^[0-9a-f]{40}$ ]] || { echo 'SHA complet requis.' >&2; exit 1; }
cd /var/www/FRILO
umask 022
git diff --cached --quiet
git diff --quiet -- . ':!docker-compose.prod.yml' ':!docker/nginx/*.conf'
git fetch origin develop
git merge-base --is-ancestor HEAD "$release_ref"
git merge-base --is-ancestor "$release_ref" origin/develop
git diff --quiet HEAD "$release_ref" -- docker-compose.prod.yml 'docker/nginx/*.conf'
expected_migration=backend/database/migrations/2026_10_22_120000_add_order_idempotency.php
while IFS= read -r migration; do
    [[ -z "$migration" || "$migration" = "$expected_migration" ]] || { echo 'Migration non prévue : arrêt.' >&2; exit 1; }
done < <(git diff --name-only HEAD "$release_ref" -- backend/database/migrations)
[[ $(git cat-file -t "$release_ref:$expected_migration") = blob ]]
docker exec frilo-nginx nginx -t
for url in https://frilo.pro/api/templates https://smoothiiz.com; do
    curl --fail --silent --show-error --max-time 30 --output /dev/null "$url"
done

stamp=$(date +%Y%m%d-%H%M%S)
backup_dir="/root/frilo-backups/payment-$stamp"
umask 077
mkdir -p "$backup_dir"
git rev-parse HEAD > "$backup_dir/revision.txt"
cp -a docker-compose.prod.yml "$backup_dir/compose.yml"
cp -a docker/nginx "$backup_dir/nginx"
docker inspect frilo-backend frilo-frontend frilo-nginx > "$backup_dir/containers.json"
docker compose -f docker-compose.prod.yml config --format json > "$backup_dir/compose-effective.json"
docker compose -f docker-compose.prod.yml exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" exec mysqldump --no-tablespaces --single-transaction --quick --lock-tables=false -u"$MYSQL_USER" "$MYSQL_DATABASE"' > "$backup_dir/database.sql"
test -s "$backup_dir/database.sql"

# Private rendered configuration contains environment values: never print or commit it.
# Preserve live networks, including an externally attached Smoothiz network.
# Refuse mount/port drift instead of silently dropping a live production mount.
python3 - "$backup_dir" "$stamp" <<'PY'
import copy, json, pathlib, sys
root, stamp = pathlib.Path(sys.argv[1]), sys.argv[2]
config = json.loads((root / 'compose-effective.json').read_text())
containers = json.loads((root / 'containers.json').read_text())
projects = {c['Config']['Labels']['com.docker.compose.project'] for c in containers}
if len(projects) != 1 or config.get('name') not in projects:
    raise SystemExit('Projet Compose incohérent avec les conteneurs actifs.')
for c in containers:
    name = c['Config']['Labels']['com.docker.compose.service']
    svc = config['services'][name]
    expected = {}
    for mount in svc.get('volumes', []):
        source = mount.get('source')
        if mount['type'] == 'volume':
            source = config['volumes'][source]['name']
        expected[mount['target']] = (mount['type'], source, not mount.get('read_only', False))
    actual = {m['Destination']: (m['Type'], m['Name'] if m['Type'] == 'volume' else m['Source'], m['RW']) for m in c['Mounts']}
    if expected != actual:
        raise SystemExit('Montages divergents pour ' + name + ' : arrêt avant modification.')
    def host_ip(value):
        return '*' if value in ('', '0.0.0.0', '::', None) else value
    live_ports = {(key, str(p['HostPort']), host_ip(p.get('HostIp'))) for key, values in (c['HostConfig'].get('PortBindings') or {}).items() for p in values or []}
    declared_ports = {(str(p['target']) + '/' + p.get('protocol', 'tcp'), str(p['published']), host_ip(p.get('host_ip'))) for p in svc.get('ports', [])}
    if live_ports != declared_ports:
        raise SystemExit('Ports divergents pour ' + name + ' : arrêt avant modification.')
    for options in (svc.get('networks') or {}).values():
        if options and set(options) - {'aliases'}:
            raise SystemExit('Options réseau spécifiques pour ' + name + ' : contrôle manuel requis.')
    svc['networks'] = {}
    for index, (network, state) in enumerate(c['NetworkSettings']['Networks'].items()):
        if state.get('IPAMConfig') or state.get('DriverOpts') or state.get('GwPriority'):
            raise SystemExit('Attachement réseau spécifique pour ' + name + ' : contrôle manuel requis.')
        key = name + '_preserved_' + str(index)
        config.setdefault('networks', {})[key] = {'external': True, 'name': network}
        svc['networks'][key] = {'aliases': state.get('Aliases') or [name]}
    svc['image'] = 'frilo-release-' + name + ':payment-' + stamp
config['services']['backend'].setdefault('environment', {})['RUN_MIGRATIONS'] = 'false'
rollback = copy.deepcopy(config)
for name in ('backend', 'frontend', 'nginx'):
    rollback['services'][name]['image'] = 'frilo-release-' + name + ':rollback-' + stamp
(root / 'release.json').write_text(json.dumps(config))
(root / 'rollback.json').write_text(json.dumps(rollback))
PY
for service in backend frontend nginx; do
    image_id=$(docker inspect "frilo-$service" --format '{{.Image}}')
    docker image tag "$image_id" "frilo-release-$service:rollback-$stamp"
done
printf 'Sauvegarde privée : %s\n' "$backup_dir"
umask 022
git merge --ff-only "$release_ref"
dc() { docker compose --project-directory /var/www/FRILO -f "$backup_dir/release.json" "$@"; }
# Build before stopping anything; each service has a distinct candidate image tag.
dc build --pull backend frontend nginx
docker run --rm --user www-data "frilo-release-backend:payment-$stamp" php -r 'require "/var/www/html/vendor/autoload.php"; if (PHP_VERSION_ID < 80235 || !class_exists("App\\Models\\Template")) { exit(1); } echo "PHP ", PHP_VERSION, " : OK\n";'
docker run --rm --entrypoint node "frilo-release-frontend:payment-$stamp" -e 'for (const name of ["next", "react", "axios"]) console.log(name, require(name + "/package.json").version); for (const name of ["eslint", "typescript"]) { try { require.resolve(name); process.exitCode = 1; } catch (e) { if (e.code !== "MODULE_NOT_FOUND") throw e; } }'
docker run --rm --volumes-from frilo-nginx --network container:frilo-nginx "frilo-release-nginx:payment-$stamp" nginx -t

cutover=0
recover() {
    result=$?
    trap - EXIT
    if [[ "$result" != 0 && "$cutover" = 1 ]]; then
        echo 'Échec du contrôle : restauration des images précédentes.' >&2
        if docker compose --project-directory /var/www/FRILO -f "$backup_dir/rollback.json" up -d --no-deps --no-build --pull never backend frontend nginx; then
            docker exec frilo-nginx nginx -t || true
            for url in https://frilo.pro/api/templates https://smoothiiz.com; do
                curl --fail --silent --show-error --max-time 20 --retry 6 --retry-delay 3 --retry-all-errors --output /dev/null "$url" || true
            done
            echo "Images précédentes restaurées ; vérifier les deux sites. Le checkout Git reste sur $release_ref." >&2
        else
            echo "Retour arrière incomplet. Configuration de secours : $backup_dir/rollback.json" >&2
        fi
    fi
    exit "$result"
}
trap recover EXIT
# Nullable columns and index only; previous images remain compatible on rollback.
# Execute exactly this reviewed migration; never seed or migrate unrelated changes.
dc run --rm --no-deps backend php artisan migrate --force --path=database/migrations/2026_10_22_120000_add_order_idempotency.php
cutover=1
dc up -d --no-deps --no-build --pull never backend frontend
dc up -d --no-deps --no-build --pull never nginx
docker exec frilo-nginx nginx -t
for url in https://frilo.pro/api/templates https://frilo.pro/ https://smoothiiz.com; do
    curl --fail --silent --show-error --max-time 20 --retry 10 --retry-delay 3 --retry-all-errors --output /dev/null --write-out "$url : HTTP %{http_code}\n" "$url"
done
docker exec frilo-backend php -v
docker exec frilo-frontend node --version
docker exec frilo-frontend node -p 'require("next/package.json").version'
docker exec frilo-nginx nginx -v
cutover=0
printf 'Publication terminée. Sauvegarde et retour arrière : %s\n' "$backup_dir"
