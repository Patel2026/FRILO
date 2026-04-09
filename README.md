# FRILO - Startup Guide

## Prerequisites
- Node.js & npm
- PHP & Composer
- MySQL Database (`frilo`)

## 1. Start Backend (API & Admin)
Open a terminal in `frilo/backend`:

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
*The API will be available at `http://localhost:8000`*
*The Admin Panel is at `http://localhost:8000/admin`*

## 2. Start Frontend (Client)
Open a **new** terminal in `frilo/frontend`:

```bash
cd frontend
npm install
npm run dev
```
*The Frontend will be available at `http://localhost:3000`*

## Quality Checks

```bash
cd backend
composer qa

cd ../frontend
npm run qa
```

## Default Credentials
- **Admin**: `admin@frilo.com` / `password`
- **Client**: `client@frilo.com` / `password`
