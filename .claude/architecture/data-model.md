# Data Model Architecture

## Purpose

Summarize FRILO data model boundaries and the high-risk entities that must not be changed casually.

## Current Implementation

Migrations live in `backend/database/migrations`. Core models include `User`, `Sector`, `Template`, `Order`, `OrderInstruction`, `OrderOption`, `OrderOptionSelection`, `PaymentTransaction`, `PublicPage`, `PublicSection`, `ContentBlock`, `ClientContact`, `CashEntry`, and `Deadline`.

Critical invariants:
- `orders.price` is a creation-time snapshot.
- `orders.status` follows the enum transition matrix.
- `order_instructions` are created with an order.
- Active templates and active options are required for ordering.
- Critical entities use database constraints, casts, and factories in tests.

## Dependencies And Integration Points

- `OrderService` creates orders, instructions, and option snapshots in a transaction.
- Policies enforce row ownership and admin permissions.
- Admin controllers mutate operational order fields.
- Public content models drive website content pages and sections.

## Known Risks

- SQLite in-memory tests may miss MySQL-specific behavior.
- Existing migrations should not be edited; create additive migrations.
- Price/status/user-controlled fields must not be accepted from public client requests.

## Change Impact

Schema changes affect models, factories, seeders, API serialization, admin views, frontend services, and tests. Any migration is HITL-gated.

## Environment Behavior

Local/prod use MySQL 8. Tests use SQLite in-memory with foreign keys enabled.
