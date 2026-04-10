# FRILO - Startup Guide

## Option A (Recommended) — Start with Docker

### Prerequisites
- Docker Desktop (or Docker Engine + Docker Compose)

### 1. Prepare env files

```bash
cp backend/.env.docker.example backend/.env
cp frontend/.env.docker.example frontend/.env.local
```

Add your FedaPay credentials in `backend/.env`:

```env
FEDAPAY_ENVIRONMENT=sandbox
FEDAPAY_SECRET_KEY=sk_sandbox_xxx
FEDAPAY_BASE_URL=https://sandbox-api.fedapay.com/v1
FEDAPAY_CURRENCY=XOF
FEDAPAY_CALLBACK_URL=http://localhost:3000/commande/paiement/retour
FEDAPAY_WEBHOOK_SECRET=wh_sandbox_xxx
```

### 2. Build and start containers

```bash
docker compose up -d --build
```

### 3. Run database migrations + seeders

```bash
docker compose exec backend php artisan migrate --seed --force
```

### 4. Access apps
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`
- Admin panel: `http://localhost:8080/admin`
- MySQL (from host): `127.0.0.1:3307` (`frilo` / `frilo`)

### 5. Configure FedaPay webhook
- URL: `http://localhost:8080/api/payments/fedapay/webhook` (use your public URL in production)
- Header/signature: `X-FEDAPAY-SIGNATURE`
- Events minimum: `transaction.approved`, `transaction.declined`, `transaction.canceled`, `transaction.updated`

### Useful Docker commands

```bash
# Stop all containers
docker compose down

# Rebuild from scratch
docker compose down -v
docker compose up -d --build

# Backend logs
docker compose logs -f backend

# Frontend logs
docker compose logs -f frontend
```

## Option B — Start without Docker

### Prerequisites
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
npm run e2e
```

## Default Credentials
- **Admin**: `admin@frilo.com` / `password`
- **Client**: `client@frilo.com` / `password`
