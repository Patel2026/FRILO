# Backend App Architecture

## Purpose
Laravel provides the FRILO API, payment integration, notifications, and custom admin backoffice.

## Current Implementation
- Framework: Laravel 12 on PHP platform 8.2.
- API routes live in `backend/routes/api.php`.
- Admin routes live in `backend/routes/web.php` under `/admin`.
- Core layers are Controllers, FormRequests, Policies, Services, Models.
- Business services include `OrderService`, `OrderPaymentService`, `PlatformSettingsService`, and notification services.
- Admin V1 is custom Blade/controllers, not Filament.

## Dependencies And Integration Points
- Frontend consumes API through `frontend/services/*.service.ts`.
- Sanctum Bearer tokens secure client API routes.
- Web session auth plus `super_admin` middleware secures `/admin`.
- FedaPay integration is isolated behind `OrderPaymentService` and `FedapayClient`.

## Known Risks
- Documentation can mention Filament or `admin`; current code uses custom admin and `super_admin`.
- Controllers contain response shaping; preserve API compatibility when refactoring.
- Payment state and order status are coupled by business rules.

## Change Impact
- Controller changes can break Next.js services.
- Service changes can alter order/payment invariants.
- Admin status changes must continue using `OrderService::updateStatus()`.

## Environment-Specific Behavior
- Local non-Docker defaults to `http://localhost:8000`.
- Docker exposes backend on `http://localhost:8080`.
- Tests use SQLite in-memory from `backend/phpunit.xml`.
