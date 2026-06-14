# FRILO Public Order Workshop Design

## Goal

Replace the current six-screen order tunnel with a calmer three-moment workshop that keeps the total visible, reduces repeated explanations, and lets clients verify everything before payment.

## Research Basis

- Baymard: checkout complexity is driven more by the number of visible fields and decisions than by the raw number of steps.
- GOV.UK: small and medium transactions benefit from one clear check-answers page before confirmation.
- Nielsen Norman Group: wizards help occasional users when each screen stays focused, but excessive clicks and hidden context make them tedious.

## Visible Journey

### 1. Personnaliser

One workspace combines the information FRILO needs now and the available paid options.

- Left/main area:
  - Compact reminder of the selected template.
  - Business name.
  - Short activity description.
  - Optional style/colors.
  - Optional notes.
  - Selectable option rows with name, plain-language description, persona hint, and additional price.
- Right/sticky summary on desktop:
  - Template name.
  - Base price.
  - Selected options.
  - Live total.
  - Primary action: `Vérifier ma commande`.
- Mobile:
  - Main form remains single-column.
  - A sticky bottom bar shows the current total and primary action.

Authentication is not presented as a numbered step. If the user is not authenticated, clicking `Vérifier ma commande` reveals the existing login/register interface inline before continuing. The entered project and selected options remain visible and saved.

### 2. Vérifier

A check-answers screen shows the complete order as bordered summary rows.

- Model.
- Business information.
- Selected options.
- Included FRILO services.
- Base price, options total, final total.
- Each editable section has a clear `Modifier` action that returns to the relevant part of Personaliser.
- Primary action: `Continuer vers le paiement`.

The order is not created merely by opening this screen. Creation remains tied to the payment action, preserving current backend behavior.

### 3. Payer

A compact payment screen focuses only on the confirmed amount and FedaPay.

- Final backend-authoritative total.
- Short explanation of what happens after payment.
- Payment trust information.
- Primary action: `Payer maintenant`.
- Existing payment error and retry behavior remains.

After a successful payment, the confirmation state replaces the payment content. Confirmation is not shown as a fourth numbered step.

## Visual Direction

- Product UI, not a marketing hero.
- Flat black, white, neutral gray, and FRILO red.
- Fixed, compact typography inside the workflow.
- Restrained 8px-or-less radii for bounded product surfaces.
- No nested cards.
- Main structure uses full-height workspace bands, bordered rows, and a sticky summary.
- Red is reserved for the primary action and decisive selection/status accents.
- Selected option rows use strong contrast and a clear check state.

## Interaction Rules

- Draft recovery continues to preserve project details and selected active options.
- Total updates immediately when options change.
- Option loading errors block progression and offer retry.
- The summary always uses active option data.
- Authentication never clears the draft.
- `Modifier` actions preserve every previously entered value.
- Payment submission shows immediate loading feedback and prevents duplicate clicks.

## Responsive Behavior

- Desktop: main workspace plus sticky 320-360px order summary.
- Tablet: main workspace plus compact summary band above the primary action.
- Mobile: one column, bordered sections, sticky bottom total/action bar.
- No horizontal overflow at supported breakpoints.
- Option descriptions wrap naturally and prices remain visible.

## Technical Scope

Primary frontend changes:

- Refactor `frontend/app/commande/page.tsx` from six numbered steps to three visible moments.
- Reuse `AuthForms` and `ProjectDetailsForm`, adapting their placement rather than changing backend contracts.
- Preserve `businessService.createOrder()` and payment service behavior.
- Extract focused local components if the page becomes difficult to maintain:
  - `OrderWorkshopSummary`
  - `OrderOptionsSelector`
  - `OrderReview`

No backend schema or pricing logic changes are required.

## Acceptance Criteria

- The header shows only `Personnaliser`, `Vérifier`, and `Payer`.
- An authenticated client reaches review without a connection screen.
- An unauthenticated client authenticates inline without losing entered data.
- Project details and options appear together during Personaliser.
- The total remains visible on desktop and mobile.
- Review shows all key facts with working edit actions.
- Payment shows the same final total as review.
- Existing draft, inactive-option, retry, and payment-error safeguards continue to work.
- Frontend QA passes and the full flow is verified in the integrated browser on desktop and mobile.

