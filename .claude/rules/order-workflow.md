# Order Workflow Rules

## Constraints

- Every status transition must pass through `OrderService::updateStatus()`.
- Terminal statuses `completed` and `cancelled` are immutable.
- `orders.price` is snapshotted at creation from template and selected options.
- Processing or completion requires confirmed payment when the service enforces it.
- Order creation must create instructions and option snapshots inside a database transaction.

## Anti-patterns

- NEVER call `Order::update(['status' => ...])` outside `OrderService`; use `OrderService::updateStatus()`.
- NEVER accept `status`, `price`, or `user_id` from a public client request; derive them server-side.
- NEVER make `completed` or `cancelled` editable for convenience; add explicit review if a business exception is requested.

## Verification Checklist

- [ ] `backend/app/Services/OrderService.php` remains the only status transition path.
- [ ] Invalid transitions return conflict or validation errors.
- [ ] Price snapshot tests still cover template and option price changes.
- [ ] Cross-user order access is still denied.
- [ ] Admin production changes do not bypass order/payment gates.
