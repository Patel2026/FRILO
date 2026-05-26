# Data Model Architecture

## Purpose
The database stores FRILO users, catalogue data, orders, instructions, payments, reviews, settings, notifications, audits, and backups.

## Current Implementation
- Target database: MySQL 8.
- Test database: SQLite in-memory.
- Main models: `User`, `Sector`, `Template`, `Order`, `OrderInstruction`, `PaymentTransaction`, `TemplateReview`, `ContactRequest`.
- `Order` and `Template` use soft deletes.
- `Order` casts `status` to `OrderStatus` and `payment_status` to `PaymentStatus`.
- `OrderInstruction` is one-to-one with `Order`.

## Dependencies And Integration Points
- `OrderService::createOrder()` snapshots `Template.price` into `Order.price`.
- FedaPay transactions are stored in `payment_transactions`.
- Public catalogue depends on active sectors/templates.

## Known Risks
- SQLite tests can miss MySQL-specific behavior.
- Changing enum values breaks persisted status and frontend union types.
- Removing soft-deleted templates can break historical order display.

## Change Impact
- Migrations require tests and HITL before destructive or production-affecting operations.
- Model fillable/cast changes can affect API serialization and service behavior.

## Environment-Specific Behavior
- Production uses MySQL.
- PHPUnit uses `DB_CONNECTION=sqlite` and `DB_DATABASE=:memory:`.
