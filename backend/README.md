# FRILO Backend (Laravel API + Admin Custom)

## Démarrage Docker (depuis la racine du repo)

```bash
cp backend/.env.docker.example backend/.env
docker compose up -d --build
docker compose exec backend php artisan migrate --seed --force
```

## Prérequis

- PHP 8.2+
- Composer
- MySQL

## Installation

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

## Comptes de démonstration

- Admin: `admin@frilo.com` / `password`
- Client: `client@frilo.com` / `password`

## Scripts qualité

```bash
composer lint
composer test
composer qa
```
