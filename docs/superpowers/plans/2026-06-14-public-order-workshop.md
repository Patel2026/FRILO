# Public Order Workshop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the six-step public order tunnel with the approved three-moment workshop and verify it in the integrated browser.

**Architecture:** Keep all API calls and pricing behavior in `businessService`. The order page remains the workflow owner, while `ProjectDetailsForm` exposes an external submit target so the sticky summary can validate the form before moving to review. Authentication stays inline and is never a numbered step.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, React Hook Form, Playwright.

---

### Task 1: Make project details externally submit-able

**Files:**
- Modify: `frontend/components/business/ProjectDetailsForm.tsx`

- [ ] Add optional `formId`, `showSubmit`, and `submitLabel` props.
- [ ] Apply the form ID to the native form so the sticky summary action can submit it.
- [ ] Keep the existing submit button as the default for other future usages.
- [ ] Tighten input radii and replace the dark nested card with a flat informational band.

### Task 2: Build the three-moment order workshop

**Files:**
- Modify: `frontend/app/commande/page.tsx`

- [ ] Replace the six-step state with `personalize`, `review`, `payment`, and unnumbered `confirmation`.
- [ ] Render only `Personnaliser`, `Vérifier`, and `Payer` in the progress header.
- [ ] Combine project details and paid options in the personalization workspace.
- [ ] Add a sticky desktop order summary and mobile total/action bar.
- [ ] Reveal `AuthForms` inline only after an unauthenticated user submits valid project details.
- [ ] Add a check-answers review with working `Modifier` actions.
- [ ] Preserve draft recovery, active-option reconciliation, payment retry, auth expiry, and duplicate-submit protection.
- [ ] Render confirmation as the completed payment state.

### Task 3: Align automated journey checks

**Files:**
- Modify only if required: `frontend/tests/e2e/critical-path.spec.ts`
- Modify only if required: `frontend/tests/e2e/client-experience.spec.ts`

- [ ] Update selectors that reference removed steps or obsolete action labels.
- [ ] Preserve coverage for authenticated bypass and authentication errors.

### Task 4: Verify quality and rendered behavior

**Files:**
- No source changes expected.

- [ ] Run `docker compose exec frontend npm run qa` and confirm lint, typecheck, and build pass.
- [ ] Open `http://localhost:3000/commande?templateId=1` in the integrated browser.
- [ ] Confirm the three visible moments, live option total, review edit actions, and payment total on desktop.
- [ ] Confirm the personalization workspace and sticky action remain readable without horizontal overflow on mobile.
- [ ] Do not trigger the final external FedaPay payment during browser verification.
