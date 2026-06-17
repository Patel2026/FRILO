# Backend App Architecture

## Purpose

Describe the Laravel backend as it exists so future agents load the right context before changing API, admin, workflow, payment, or data behavior.

## Current Implementation

FRILO backend lives in `backend/` and runs Laravel 12 on PHP 8.2. Public and client API routes are in `backend/routes/api.php`; admin session routes are in `backend/routes/web.php`.

Primary layers:
- Controllers: `backend/app/Http/Controllers/Api` and `backend/app/Http/Controllers/Admin`
- FormRequests: `backend/app/Http/Requests/Api` and `backend/app/Http/Requests/Admin`
- Policies: `backend/app/Policies`
- Services: `backend/app/Services`
- Models: `backend/app/Models`
- Enums: `backend/app/Enums`

The required backend flow is Controller -> FormRequest -> Policy -> Service -> Model. Controllers stay thin and delegate business logic to Services.

## Dependencies And Integration Points

- Next.js consumes API routes via `frontend/services/*.service.ts` and `frontend/services/api.ts`.
- Sanctum tokens protect client API routes with `auth:sanctum`.
- Admin uses session auth plus custom admin role middleware under `/admin`.
- FedaPay-related behavior is implemented through payment services, webhooks, and payment transaction models.
- Notifications are Laravel notifications for clients/admins.

## Known Risks

- Order status can regress if any code directly updates `orders.status` outside `OrderService::updateStatus()`.
- Admin and API controllers can drift if policies are bypassed or role checks are inlined.
- Payment, order, and production fields are tightly coupled; partial changes require regression tests.
- Root docs have historical references to Filament/Laravel 11; repository reality is Laravel 12/custom admin.

## Change Impact

Changes to Services affect API, admin, tests, and notifications. Route or response shape changes affect frontend service contracts. Order and payment changes are high impact by default.

## Environment Behavior

Local Docker serves backend on container port `8080`, host `8081`. CI runs `composer qa` with SQLite in-memory tests. Production uses MySQL and must keep `APP_DEBUG=false`.
