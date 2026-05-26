# Payments FedaPay Architecture

## Purpose
FedaPay provides real checkout/payment state for FRILO orders.

## Current Implementation
- Payment creation and refresh live in `OrderPaymentService`.
- External API calls live in `FedapayClient`.
- Webhooks are received by `FedapayWebhookController`.
- Signed webhook verification uses `X-FEDAPAY-SIGNATURE`.
- `PaymentTransaction` stores provider status, checkout URL, transaction id, raw payload, and completion timestamps.
- `Order.payment_status` is mapped from provider status.

## Dependencies And Integration Points
- Order status may move to `processing` or `completed` only after `payment_status = paid`.
- Platform runtime payment configuration can override env defaults.
- Frontend order tunnel redirects to FedaPay checkout URL.

## Known Risks
- Webhook replay/signature handling is production-sensitive.
- Provider status mapping can accidentally mark unpaid orders as paid.
- Raw payload logging/storage must not expose secrets.

## Change Impact
- Payment changes require feature tests for initiation, webhook, refresh, and blocked status transitions.
- Callback URL changes affect frontend routing and FedaPay dashboard settings.

## Environment-Specific Behavior
- Sandbox and production credentials differ.
- `FEDAPAY_ENABLED`, base URL, callback URL, webhook secret, and currency are env/config driven.
