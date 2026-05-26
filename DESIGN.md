---
name: FRILO
description: Trustworthy template commerce and delivery platform for Benin and West Africa.
colors:
  frilo-black: "#050505"
  frilo-red: "#F40000"
  frilo-white: "#FAFAFA"
  ink: "#0A0A0A"
  muted: "#6B6B6B"
  surface: "#FAFAFA"
  surface-muted: "#F4F4F5"
  dark-surface: "#050505"
  status-pending-bg: "#FEF3C7"
  status-pending-text: "#92400E"
  status-processing-bg: "#DBEAFE"
  status-processing-text: "#1E40AF"
  status-completed-bg: "#DCFCE7"
  status-completed-text: "#166534"
  status-cancelled-bg: "#FEE2E2"
  status-cancelled-text: "#991B1B"
typography:
  display:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "clamp(3.5rem, 8vw, 7.5rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 5rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  title:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "\"Helvetica Neue\", Helvetica, Arial, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.18em"
rounded:
  focus: "8px"
  button-pill: "9999px"
spacing:
  button-y: "1rem"
  button-x: "2rem"
  section-y: "clamp(5rem, 10vw, 10rem)"
  container-x: "clamp(1.5rem, 5vw, 5rem)"
components:
  button-primary:
    backgroundColor: "{colors.frilo-red}"
    textColor: "{colors.frilo-white}"
    rounded: "{rounded.button-pill}"
    padding: "{spacing.button-y} {spacing.button-x}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button-pill}"
    padding: "{spacing.button-y} {spacing.button-x}"
---

# Design System: FRILO

## 1. Overview

**Creative North Star: "The Credible Counter"**

FRILO should feel like a clear, well-run service counter for digital business presence: direct pricing, visible progress, calm confirmation, and no decorative noise between the user and the task. The brand expression is sharp, high-contrast, and disciplined: black and white carry the identity, red marks decisive actions and proof points.

The visual system rejects generic imported SaaS gloss, heavy institutional styling, decorative cultural shortcuts, off-brand warm palettes, blue-purple gradients, and funnels that ask for trust without showing state. Premium here means precise, legible, confident, and dependable, not distant or expensive for its own sake.

**Key Characteristics:**
- Strict black/white identity with red as the only brand accent.
- Restrained product UI with confident red primary actions.
- Clear status language for orders and payments.
- Mobile-first paths for browsing, ordering, and tracking.
- Familiar components that disappear into the task without weakening the brand.

## 2. Colors

The palette is strict: black and white define the brand, red is the only expressive accent. Do not introduce decorative blue, purple, gold, beige, brown, green, or gradient palettes on public brand surfaces.

### Primary
- **FRILO Black** (`#050505`): Main brand field, public hero backgrounds, high-emphasis text, header treatments, and premium surfaces.
- **FRILO White** (`#FAFAFA`): Main light surface, text on dark surfaces, cards, and clean contrast blocks.

### Secondary
- **FRILO Red** (`#F40000`): Primary CTAs, brand accent square, key proof markers, selected high-emphasis states, and urgent visual emphasis. Use it deliberately and sparingly so it keeps authority.

### Neutral
- **Ink** (`#0A0A0A`): Primary text on light surfaces.
- **Muted Gray** (`#6B6B6B`): Secondary copy, hints, placeholders, and support text.
- **Clean Surface** (`#FAFAFA`): Main public and product background.
- **Muted Surface** (`#F4F4F5`): Section breaks, dashboard backgrounds, empty states, and low-emphasis containers.
- **Dark Surface** (`#050505`): Brand dark treatment for high-contrast sections and public hero moments.

### Status
- **Pending** (`#FEF3C7` / `#92400E`): Awaiting action or payment.
- **Processing** (`#DBEAFE` / `#1E40AF`): Work has started.
- **Completed** (`#DCFCE7` / `#166534`): Delivered or paid-complete state.
- **Cancelled** (`#FEE2E2` / `#991B1B`): Cancelled or failed final state.

### Named Rules
**The State Is Evidence Rule.** Never rely on color alone for order or payment state. Pair color with clear labels and next actions.

**The Brand Color Lock Rule.** Public FRILO surfaces must stay within black, white, neutral gray, and FRILO Red. Any new decorative hue requires explicit human approval.

## 3. Typography

**Display Font:** "Helvetica Neue", Helvetica, Arial, sans-serif  
**Body Font:** "Helvetica Neue", Helvetica, Arial, sans-serif  
**Label/Mono Font:** Same family, uppercase labels where already used.

**Character:** The type system is direct, commercial, and task-oriented. Public pages may use large confident headings; dashboard, admin, and form surfaces should use denser fixed scales and avoid hero-sized type.

### Hierarchy
- **Display** (900, `clamp(3.5rem, 8vw, 7.5rem)`, `0.92`): Public homepage or major marketing moments only.
- **Headline** (900, `clamp(2.5rem, 5vw, 5rem)`, `0.95`): Public section headings and high-level catalogue moments.
- **Title** (700, `1.25rem`, `1.2`): Cards, panels, form sections, dashboard blocks.
- **Body** (400, `1.0625rem`, `1.65`): Explanatory copy, kept around 65 to 75 characters when prose is long.
- **Label** (700, `0.6875rem`, `0.18em`, uppercase): Section labels and compact metadata.

### Named Rules
**The Product Density Rule.** Use fluid oversized type only where design is selling the offer. Use stable, compact type inside dashboards, admin views, tables, and forms.

## 4. Elevation

FRILO is mostly flat at rest and uses tonal layering first. Shadows are a response to interaction or hierarchy, especially on catalogue cards and hoverable surfaces. Avoid deep floating panels that make the product feel like a generic SaaS mockup.

### Shadow Vocabulary
- **Card Hover Lift** (`0 12px 40px rgba(0,0,0,0.08)`): Hover feedback on catalogue-style cards only.

### Named Rules
**The Flat Until Useful Rule.** A surface earns elevation only when it improves scanning, feedback, or hierarchy.

## 5. Components

### Buttons
- **Shape:** Pill buttons for public CTAs (`9999px`).
- **Primary:** FRILO Red with white text for the main action.
- **Hover / Focus:** Short transitions around 150 to 200 ms, visible focus ring, no layout animation.
- **Secondary / Ghost:** White, black, outline, or neutral styles for secondary actions. Do not use blue-purple gradients.

### Chips
- **Style:** Status chips use semantic background/text pairs.
- **State:** Pair every chip with text, not just color.

### Cards / Containers
- **Corner Style:** Use restrained radii for product surfaces, with card treatment only where grouping helps comparison or repeated items.
- **Background:** White or muted surface.
- **Shadow Strategy:** Flat by default, hover lift for catalogue cards.
- **Border:** Use full borders or tonal backgrounds. Do not use colored side-stripe borders.
- **Internal Padding:** Match local component density, not one universal padding value.

### Inputs / Fields
- **Style:** Simple bordered or tonal fields with clear labels.
- **Focus:** Visible focus ring consistent with the global focus style.
- **Error / Disabled:** Error text under fields, disabled states visually clear and not color-only.

### Navigation
- **Public Header:** Logo, catalogue links, contact/FAQ, and a clear command path. Authenticated users should see Dashboard rather than login/register links.
- **Dashboard Sidebar:** Mobile-openable, compact, and role-specific.
- **Admin Navigation:** Operational and dense, not brand-heavy.

### Order Tunnel
The order tunnel is the signature product flow. It must show progress, preserve draft recovery, bypass auth for valid sessions, create the order before payment, and show backend-confirmed payment/order state.

## 6. Do's and Don'ts

### Do:
- **Do** show price, order state, payment state, and next action wherever trust is being requested.
- **Do** keep primary red actions rare enough to remain meaningful.
- **Do** use black and white as the dominant brand expression on public pages.
- **Do** design mobile ordering as a first-class path.
- **Do** use status text with semantic color pairs.
- **Do** keep admin and dashboard surfaces denser and more predictable than public marketing pages.

### Don't:
- **Don't** make FRILO feel like a generic imported SaaS template with vague claims, purple-blue gradients everywhere, and artificial dashboards.
- **Don't** introduce off-brand color moods such as gold, beige, brown, purple, or blue for public brand direction.
- **Don't** use decorative African cliches, forced pan-African color symbolism, or local motifs as a shortcut for relevance.
- **Don't** hide price, payment, or delivery state behind long funnels.
- **Don't** use gradient text, glassmorphism by default, side-stripe card borders, or repeated identical icon-card grids.
- **Don't** use public hero-scale typography inside compact dashboard, admin, or form contexts.
