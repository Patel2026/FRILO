# Déploiement des miniatures et démos externes

Cette procédure concerne le serveur `/var/www/FRILO` utilisant déjà la base
`f9548d1` (ou un descendant). La version livrée est sur `origin/develop`.
Définir `release_ref` avec le SHA exact annoncé dans le message de livraison,
ou utiliser `scripts/deploy-template-media.sh SHA` qui exécute ces étapes.
La procédure conserve les configurations locales, les certificats et le réseau
Smoothiz du proxy. Une courte interruption FRILO est nécessaire ; la
recréation finale du proxy provoque aussi une brève interruption HTTPS.
Ne pas exécuter ces commandes sur un autre projet ou avec un autre Compose.

Exécuter les blocs dans **le même shell Bash**, en root, et arrêter au premier
échec. Si la vérification de version ou la fusion Git échoue, ne pas continuer.
Aucun `reset --hard`, aucun `down`, aucune suppression de volume.

## 1. Vérification et sauvegarde

```bash
cd /var/www/FRILO
set -euo pipefail
: "${release_ref:?Définir release_ref avec le SHA exact de la livraison}"
umask 077

dc() { docker compose -f /var/www/FRILO/docker-compose.prod.yml "$@"; }
# Refuse une mise à jour depuis une version plus ancienne non vérifiée.
git merge-base --is-ancestor f9548d1 HEAD
# Refuse les modifications applicatives ou indexées non examinées.
git diff --cached --quiet
git diff --quiet -- . ':!docker-compose.prod.yml' ':!docker/nginx/**'

deploy_backup="/root/frilo-backups/template-media-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$deploy_backup/config" "$deploy_backup/uploads"
git rev-parse HEAD > "$deploy_backup/revision.txt"
cp -a docker-compose.prod.yml "$deploy_backup/config/"
cp -a docker/nginx "$deploy_backup/config/nginx"
cp -a backend/.env "$deploy_backup/config/backend.env"
[ ! -f .env ] || cp -a .env "$deploy_backup/config/root.env"
[ ! -f .env.prod ] || cp -a .env.prod "$deploy_backup/config/root.env.prod"
[ ! -d .deploy/nginx ] || cp -a .deploy/nginx "$deploy_backup/config/admin-access"
tar -C / -czf "$deploy_backup/letsencrypt.tar.gz" etc/letsencrypt

dc exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" exec mysqldump --no-tablespaces --single-transaction --quick --lock-tables=false -u"$MYSQL_USER" "$MYSQL_DATABASE"' > "$deploy_backup/database.sql"
test -s "$deploy_backup/database.sql"
docker inspect frilo-nginx --format '{{range $name, $network := .NetworkSettings.Networks}}{{$name}}{{println}}{{end}}' > "$deploy_backup/nginx-networks.txt"
printf 'Sauvegarde : %s\n' "$deploy_backup"
```

Les fichiers sauvegardés contiennent des secrets : ne pas afficher leur contenu
ni les commiter. Le certificat original reste dans `/etc/letsencrypt`.

## 2. Récupérer le code en conservant les réglages du serveur

```bash
# Authentification Git habituelle du serveur ; conserver sa clé SSH configurée.
git fetch origin develop
git cat-file -e "${release_ref}^{commit}"
git merge-base --is-ancestor "$release_ref" origin/develop
git merge-base --is-ancestor HEAD "$release_ref"

saved_config=0
if ! git diff --quiet -- docker-compose.prod.yml docker/nginx; then
    git stash push -m "frilo-config-before-template-media" -- docker-compose.prod.yml docker/nginx
    saved_config=1
fi

git merge --ff-only "$release_ref"
if [ "$saved_config" = 1 ]; then
    git stash pop
fi
# En cas de conflit : STOP. Les configurations sont dans le stash et la sauvegarde.

# Empêcher les seeders de réécrire FAQ/options pendant cette mise à jour.
python3 - <<'PYCONFIG'
from pathlib import Path
p = Path('docker-compose.prod.yml')
s = p.read_text()
if 'RUN_MIGRATIONS: "true"' in s:
    assert s.count('RUN_MIGRATIONS: "true"') == 1
    s = s.replace('RUN_MIGRATIONS: "true"', 'RUN_MIGRATIONS: "false"')
else:
    assert 'RUN_MIGRATIONS: "false"' in s, 'Vérifier RUN_MIGRATIONS manuellement'
p.write_text(s)
PYCONFIG

dc config --quiet
# Vérifier que les réseaux actuellement attachés au proxy restent déclarés.
dc config --format json > "$deploy_backup/compose-after.json"
python3 - "$deploy_backup" <<'PYNETWORK'
import json, sys
from pathlib import Path
backup = Path(sys.argv[1])
config = json.loads((backup / 'compose-after.json').read_text())
networks = config['services']['nginx']['networks']
names = {config['networks'][key].get('name', key) for key in networks}
previous = set((backup / 'nginx-networks.txt').read_text().split())
assert previous <= names, 'STOP : réseau proxy manquant dans Compose'
PYNETWORK

dc build backend frontend nginx
```

Si le serveur utilise un fichier d'environnement ou des overrides Compose
supplémentaires, les conserver dans la fonction `dc` avant d'exécuter cette
procédure. Ne pas remplacer la configuration de production par celle du poste
local. Les modifications `.env`, certificats et mots de passe ne sont pas
nécessaires à cette livraison.

## 3. Migrer les fichiers et redémarrer

```bash
# Geler les téléversements ; ne pas arrêter le proxy partagé avec Smoothiz.
dc stop backend
docker cp frilo-backend:/var/www/html/storage/app/public/. "$deploy_backup/uploads/"
# Si la copie échoue : dc start backend, puis diagnostiquer ; ne pas continuer.

# Préparer le nouveau conteneur et son volume sans démarrer l'application.
dc up --no-start --no-deps backend
docker cp "$deploy_backup/uploads/." frilo-backend:/var/www/html/storage/app/public/
# Ne pas poursuivre si la restauration échoue.

dc run --rm --no-deps backend php artisan migrate --force
dc up -d --no-deps backend frontend

# Tester avec les certificats et réseaux du serveur avant de remplacer le proxy.
dc run --rm --no-deps nginx nginx -t
dc up -d --no-deps --force-recreate nginx
dc exec -T nginx nginx -t
dc ps
curl --fail --silent --show-error --output /dev/null https://frilo.pro/api/sectors
curl --fail --silent --show-error --output /dev/null https://smoothiiz.com
```

Contrôler ensuite une ancienne miniature et une nouvelle miniature téléversée,
les deux modes de démo, le login admin et le catalogue. La nouvelle migration
ajoute uniquement `templates.preview_mode` ; elle ne supprime aucune donnée.

## Retour arrière

Ne pas supprimer le volume `public_uploads`. Garder le stockage partagé même
si le code applicatif revient à sa version précédente. Le code précédent peut
ignorer la nouvelle colonne ; ne pas restaurer la base ni annuler la migration
sans diagnostic, car cela pourrait perdre les commandes reçues entre-temps.
Les sauvegardes des configurations, certificats, fichiers, base et SHA précédent
restent disponibles dans `deploy_backup`. Une erreur Git ou de validation Nginx
avant la recréation du proxy n'a pas remplacé le proxy en cours d'exécution.

## Utilisation admin

Dans Templates, choisir les liens externes, saisir l'URL de démonstration
(de préférence celle du créateur, accessible depuis ThemeForest), joindre une
miniature JPG/PNG/WebP de 2 Mo maximum et choisir l'ouverture intégrée ou nouvel
onglet. Aucun scraping ou import automatique du thème. Les images sont servies
directement au navigateur, sans redimensionnement automatique Next.js.
