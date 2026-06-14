#!/bin/sh
set -eu

cd /var/www/html

if [ ! -f .env ]; then
  if [ -f .env.docker.example ]; then
    cp .env.docker.example .env
  else
    cp .env.example .env
  fi
fi

if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

mkdir -p \
  bootstrap/cache \
  storage/app/public \
  storage/framework/cache \
  storage/framework/sessions \
  storage/framework/testing \
  storage/framework/views \
  storage/logs

chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

if [ -z "${APP_KEY:-}" ] && ! grep -q "^APP_KEY=base64:" .env; then
  php artisan key:generate --force
fi

php artisan storage:link >/dev/null 2>&1 || true
php artisan config:clear >/dev/null 2>&1 || true

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  php artisan migrate --seed --force
fi

exec "$@"
