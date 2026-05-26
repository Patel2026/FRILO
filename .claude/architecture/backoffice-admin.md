# Backoffice Admin Architecture

## Purpose
Describe the Laravel custom admin used by FRILO V1.

## Current Implementation
- Admin routes live under `/admin` in `backend/routes/web.php`.
- Access requires Laravel session auth and `super_admin` middleware.
- Controllers live under `backend/app/Http/Controllers/Admin/`.
- Views live under `backend/resources/views/admin/`.
- Admin manages orders, payments, templates, sectors, clients, contact requests, settings, notifications, audit logs, backups, FAQ, and reviews.

## Dependencies And Integration Points
- Order status updates must call `OrderService::updateStatus()`.
- Payment settings use `PlatformSettingsService`.
- Admin actions should be audited where existing patterns do so.

## Known Risks
- Do not reintroduce Filament assumptions for V1.
- Admin settings can affect runtime payment behavior.
- Secrets must be masked in UI and encrypted/storage-safe.

## Change Impact
Admin changes can affect operations, security, payment, and customer data visibility.

## Environment-Specific Behavior
Admin is served by Laravel backend URL, `8080` in Docker and `8000` in local non-Docker.
