---
name: FRILO
description: Professional website ordering platform for small businesses, with human delivery in 48 hours.
colors:
  frilo-blue: "#2563EB"
  frilo-purple: "#7E22CE"
  ink: "#111827"
  body-ink: "#000000"
  muted: "#6B7280"
  surface: "#FFFFFF"
  surface-muted: "#F8FAFC"
  dark-surface: "#0F172A"
  dark-card: "#1E293B"
  pending-bg: "#FEF3C7"
  pending-text: "#92400E"
  processing-bg: "#DBEAFE"
  processing-text: "#1E40AF"
  completed-bg: "#DCFCE7"
  completed-text: "#166534"
  cancelled-bg: "#FEE2E2"
  cancelled-text: "#991B1B"
typography:
  display:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(3.5rem, 8vw, 7.5rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 5rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.25rem, 2vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.18em"
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  pill: "9999px"
spacing:
  button-x: "2rem"
  button-y: "1rem"
  section-y: "clamp(5rem, 10vw, 10rem)"
  container-x: "clamp(1.5rem, 5vw, 5rem)"
components:
  button-primary:
    backgroundColor: "{colors.frilo-blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  button-gradient:
    backgroundColor: "{colors.frilo-blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  button-pill-dark:
    backgroundColor: "{colors.body-ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "{spacing.button-y} {spacing.button-x}"
---

# Design System: FRILO

## 1. Overview

**Creative North Star: "The Clear Delivery Console"**

FRILO's interface should feel like a practical, trustworthy operating console for getting a professional website delivered quickly. The visual system combines direct SaaS clarity with enough blue/purple energy to make the brand memorable, but the product promise always stays more important than decoration.

Public pages should help non-technical business owners understand the offer, compare templates, and move confidently into the order tunnel. Client and admin surfaces should be denser, calmer, and more operational: status, payment, production, and next action must be easy to scan.

**Key Characteristics:**
- White and near-white surfaces with high-contrast text.
- FRILO Blue for action, FRILO Purple for accent and controlled gradients.
- Large confident display type on marketing surfaces; compact hierarchy inside dashboards/admin.
- Human-delivery trust cues: price clarity, timeline clarity, and status truthfulness.

## 2. Colors

The palette is a white operational base with a blue-to-purple brand axis for primary action and recognition.

### Primary
- **FRILO Blue** (#2563EB): Primary CTAs, links, active states, and key action affordances.

### Secondary
- **FRILO Purple** (#7E22CE): Brand accent and gradient endpoint; use sparingly to avoid one-note purple UI.

### Neutral
- **Surface White** (#FFFFFF): Main public and product background.
- **Ink** (#111827 / #000000): Primary text, especially body and high-emphasis headings.
- **Muted Gray** (#6B7280): Secondary text; verify contrast before using on tinted backgrounds.
- **Slate Dark** (#0F172A): Dark-mode or high-contrast operational sections.

### Named Rules

**The Trust First Rule.** Color must clarify action or state. It should not make pricing, payment, or delivery information harder to inspect.

**The Gradient Restraint Rule.** Blue-to-purple gradients are reserved for primary CTA, selected hero moments, or brand emphasis. Do not apply gradients to every section or card.

## 3. Typography

**Display Font:** Helvetica Neue, Helvetica, Arial, sans-serif  
**Body Font:** Helvetica Neue, Helvetica, Arial, sans-serif  
**Label/Mono Font:** Helvetica Neue, Helvetica, Arial, sans-serif

**Character:** The type system is direct and commercial: large, confident public headings and compact operational text inside dashboards and admin screens.

### Hierarchy
- **Display** (900, clamp(3.5rem, 8vw, 7.5rem), 0.92): Public hero and major campaign-level claims only.
- **Headline** (900, clamp(2.5rem, 5vw, 5rem), 0.95): Main section headings on public pages.
- **Title** (700, clamp(1.25rem, 2vw, 1.75rem), 1.2): Cards, dashboard panels, and admin modules.
- **Body** (400, 1.0625rem, 1.65): Long-form explanatory text; cap line length around 65-75ch.
- **Label** (700, 0.6875rem, 0.18em): Short categorical labels only; avoid using uppercase labels above every section.

### Named Rules

**The Surface Scale Rule.** Hero-scale type belongs to heroes. Dashboards, tables, forms, and admin panels use tighter, smaller headings built for scanning.

## 4. Elevation

FRILO uses a hybrid of flat surfaces and state-based elevation. Cards and buttons may lift on hover, but static pages should not become grids of shadowed cards. Use tonal separation first, then shadow when an element is interactive or layered.

### Shadow Vocabulary
- **Button emphasis** (`shadow-md` / `shadow-lg`): Existing CTA emphasis in the shared Button component.
- **Card hover** (`0 12px 40px rgba(0,0,0,0.08)`): Existing hover lift for cards that are clickable.

### Named Rules

**The Interactive Elevation Rule.** Shadows should usually indicate affordance or state. Static content blocks should rely on spacing, typography, borders, or tonal bands.

## 5. Components

### Buttons
- **Shape:** Rounded rectangles for standard product buttons (`rounded-md`), full pills for Squarespace-style public CTAs.
- **Primary:** FRILO Blue or blue-to-purple gradient with white text.
- **Hover / Focus:** Slight opacity/background shift plus visible focus ring.
- **Secondary / Ghost:** Outline or quiet hover states for non-primary actions.

### Chips
- **Style:** Use status or category color sparingly with readable foreground contrast.
- **State:** Selected filters and order statuses must be visually distinct and text-labeled.

### Cards / Containers
- **Corner Style:** Moderate radius; do not over-round operational cards.
- **Background:** White or slate-50 bands.
- **Shadow Strategy:** Flat by default; lift only for clickable cards.
- **Border:** Prefer subtle borders over decorative side-stripes.
- **Internal Padding:** Comfortable public cards, tighter admin/dashboard panels.

### Inputs / Fields
- **Style:** Clear label, bordered field, visible focus ring.
- **Focus:** High-contrast outline or ring.
- **Error / Disabled:** Error message under the field; disabled state must remain legible.

### Navigation
- Public navigation prioritizes Templates, Sectors, Expertises, FAQ, Contact, and order CTA.
- Client dashboard navigation must make orders, profile, notifications, contacts, and deadlines easy to revisit.
- Admin navigation is role-scoped and operational; avoid marketing-style composition there.

## 6. Do's and Don'ts

Do:
- Keep price, status, and delivery information visually inspectable.
- Use FCFA formatting consistently.
- Preserve loading, error, empty, and forbidden states.
- Keep public, client, and admin surfaces visually related but role-distinct.

Don't:
- Do not imply AI-generated site delivery.
- Do not hide primary actions behind decorative layouts.
- Do not use gradient text as a default emphasis style.
- Do not introduce direct API calls in components just to power UI.
- Do not show admin or cross-user data in client-facing screens.
