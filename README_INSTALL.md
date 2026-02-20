# FRILO Backend Installation Instructions

The automated backend installation was interrupted due to slow network/missing PHP Zip extension.

## 1. Complete Laravel Installation
Open a terminal in `frilo/backend` and run:

```bash
composer install
```
*Note: This may take time if the PHP Zip extension is missing.*

## 2. Generate Application Key
After installation completes:

```bash
php artisan key:generate
```

## 3. Install Additional Packages
Run the following commands to install required packages:

```bash
composer require laravel/sanctum filament/filament
php artisan filament:install --panels
```

## 4. Run Migrations
Ensure your database is configured in `.env`, then run:

```bash
php artisan migrate
```
