# Order Workflow Rules

## Constraints
- Create orders only through `OrderService::createOrder()` using the authenticated user.
- Snapshot `Template.price` into `Order.price` at creation and never accept price from the client.
- Start every order as `pending` and every payment as awaiting payment unless a service explicitly maps provider state.
- Change order status only through `OrderService::updateStatus()`.
- Treat `completed` and `cancelled` as terminal states.
- Block `processing` and `completed` while `payment_status` is not `paid`.

## Anti-patterns
- NEVER update order status directly from a controller, admin controller, seeder, or test helper because it bypasses transition rules. Instead: call `OrderService::updateStatus()`.
- NEVER accept `user_id`, `price`, or `status` in public order FormRequests because these are derived from auth, template, and workflow state. Instead: derive them in the service.
- NEVER make inactive templates orderable because catalogue visibility is not enough. Instead: validate active template in the FormRequest and service.

## Verification Checklist
- [ ] `OrderService::updateStatus()` remains the only status transition entry point.
- [ ] Invalid transitions return or throw conflict behavior covered by tests.
- [ ] Completed/cancelled orders cannot move again.
- [ ] Price snapshot tests cover template price changes after order creation.
- [ ] Client payload cannot set `user_id`, `price`, or `status`.
