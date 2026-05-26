# Payment Workflow Rules

## Constraints
- Initiate client payments only through `OrderPaymentService::initiatePayment()`.
- Verify every FedaPay webhook signature before processing payload data.
- Map provider transaction status to `PaymentStatus` in one service-owned path.
- Keep order processing/completion blocked until backend-confirmed paid status.
- Store enough provider metadata for audit without logging or exposing secrets.

## Anti-patterns
- NEVER trust a frontend redirect as payment confirmation because checkout return can be forged or interrupted. Instead: rely on webhook or backend refresh.
- NEVER mark an order paid directly from a controller because provider mapping and notifications must stay centralized. Instead: use `OrderPaymentService`.
- NEVER weaken webhook signature checks for local convenience. Instead: use explicit sandbox configuration.

## Verification Checklist
- [ ] Webhook signature failure is tested.
- [ ] Provider statuses map to expected `PaymentStatus` values.
- [ ] Unpaid orders cannot be moved to `processing` or `completed`.
- [ ] Frontend displays payment state from backend response only.
- [ ] FedaPay secrets are read from env/settings and never committed.
