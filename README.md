# FRILO - Startup Guide

## Prerequisites
- Node.js & npm
- PHP & Composer
- MySQL Database (`frilo`)

## 1. Start Backend (API & Admin)
Open a terminal in `frilo/backend`:

```bash
cd backend
php artisan serve
```
*The API will be available at `http://localhost:8000`*
*The Admin Panel is at `http://localhost:8000/admin`*

## 2. Start Frontend (Client)
Open a **new** terminal in `frilo/frontend`:

```bash
cd frontend
npm run dev
```
*The Frontend will be available at `http://localhost:3000`*

## Default Credentials
- **Admin**: `admin@frilo.com` / `password`
- **Client**: `client@frilo.com` / `password`
