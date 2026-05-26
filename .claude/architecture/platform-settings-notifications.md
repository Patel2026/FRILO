# Platform Settings And Notifications Architecture

## Purpose
Describe settings, notifications, audit logs, and backups managed by the admin system.

## Current Implementation
- Platform settings use draft/published revisions.
- Runtime payment configuration can fall back to `.env`.
- Notifications cover order creation/status/payment, contact requests, reset password, and admin manual notifications.
- Audit logs track sensitive admin operations.
- Backups are managed through admin routes and `DatabaseBackupService`.

## Dependencies And Integration Points
- Payment settings feed FedaPay runtime behavior.
- Admin settings publish/restore actions require auditability.
- Notifications depend on Laravel mail/notification channels.

## Known Risks
- Publishing invalid payment settings can break payments.
- Notification payloads can leak client data if over-broad.
- Backup/restore is operationally sensitive.

## Change Impact
Settings changes can alter runtime behavior without code deploys.

## Environment-Specific Behavior
Mail, queue, payment, and backup behavior vary by env configuration.
