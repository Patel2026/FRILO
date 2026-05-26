# Design System Strategy: The Human Legal Practice

## 1. Overview & Creative North Star
**Creative North Star: "The Resilient Sanctuary"**

Legal processes are often intimidating, rigid, and cold. This design system seeks to dismantle the "adversarial" aesthetic of traditional law. We are moving away from the "Marble Pillar" look toward a "Digital Sanctuary"—an experience that feels grounded, breathable, and profoundly human. 

By leveraging intentional asymmetry, organic roundedness, and a rejection of harsh structural lines, we create an interface that feels like a conversation rather than a contract. We prioritize **Tonal Layering** over borders and **Airy Composition** over density, ensuring the user feels supported and calm.

---

## 2. Colors & Surface Philosophy
The palette is a sophisticated blend of grounded neutrals (`#fbf9f4`) and nature-inspired accents. 

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections or containers. Structural integrity is achieved through background color shifts. 
- Use `surface` for the global background.
- Use `surface-container-low` for secondary content blocks.
- Use `surface-container-highest` for high-impact callouts.
*Boundary definition must be felt through tone, not seen through lines.*

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine, heavy-weight paper. 
- **The Base:** `surface` (#fbf9f4).
- **The Inset:** Use `surface-container` to "carve out" areas for form inputs or data tables.
- **The Lift:** Place `surface-container-lowest` (#ffffff) cards on top of `surface-container-low` sections to create a natural, "floating" feel.

### The "Glass & Gradient" Rule
To elevate the "Modern" requirement, avoid flat blocks of color for high-importance elements.
- **CTAs:** Use a subtle linear gradient from `primary` (#496455) to `primary-container` (#87a593) at a 135-degree angle. This adds "soul" and depth.
- **Overlays:** Use `surface` with 70% opacity and a `24px` backdrop-blur to create a "Frosted Glass" effect for navigation bars and floating modals.

---

## 3. Typography: Editorial Authority
We utilize **Plus Jakarta Sans** for its geometric clarity and friendly, open apertures. It provides the "Rounded" feel requested without losing professional gravitas.

- **Display (Large/Medium):** Reserved for high-level empathetic messaging (e.g., "We are here to help."). Use `on-surface` with `-0.02em` letter spacing to feel tight and editorial.
- **Headlines:** Use `primary` (#496455) for headlines to establish a calm, authoritative anchor.
- **Body:** Use `on-surface-variant` (#424845) for long-form text. The slight reduction in contrast from pure black reduces eye strain and feels more approachable.
- **Labels:** Always uppercase with `+0.05em` tracking when used for "overlines" to provide a sense of organized precision.

---

## 4. Elevation & Depth
In this system, depth is a function of light and shadow, not lines.

### The Layering Principle
Hierarchy is established by stacking tiers. A `surface-container-lowest` card sitting on a `surface-container` background creates an "Elevation 1" feel without a single drop shadow.

### Ambient Shadows
Where physical "lift" is required (e.g., a primary CTA button or a floating action card), use:
- **Shadow Color:** A tinted version of `on-surface` (e.g., `#1b1c19` at 6% opacity).
- **Properties:** `0px 20px 40px` blur. Avoid "dirty" grey shadows; the shadow must feel like it is cast by soft, diffused light.

### The "Ghost Border" Fallback
If accessibility requirements (WCAG) demand a border, use the **Ghost Border**: `outline-variant` (#c2c8c4) at **15% opacity**. It should be barely perceptible.

---

## 5. Components

### Buttons
- **Primary:** Gradient (`primary` to `primary-container`), `full` roundedness (9999px). High-contrast `on-primary` text.
- **Secondary:** `secondary-container` (#b5e3fe) background with `on-secondary-container` text. No border.
- **Tertiary:** Text-only with an icon. On hover, apply a `surface-container-high` background with a `sm` (0.5rem) corner radius.

### Cards & Content Blocks
- **The Rule:** No dividers. Use `1.5rem` to `3rem` of vertical whitespace to separate thoughts.
- **Shape:** Use `lg` (2rem) or `xl` (3rem) corner radius to reinforce the "friendly/human" feel.
- **Interaction:** On hover, a card should transition from `surface-container-low` to `surface-container-lowest` and gain an **Ambient Shadow**.

### Input Fields
- **Styling:** Soft-filled. Use `surface-container-high` as the background.
- **Focus State:** A soft 4px "glow" using `secondary` (#35647b) at 20% opacity. 
- **Corners:** `md` (1.5rem) to match the approachable aesthetic.

### Chips & Tags
- **Selection Chips:** Use `secondary-fixed` (#c1e8ff) to signify "active." 
- **Shape:** Always `full` roundedness.

---

## 6. Do’s and Don’ts

### Do
- **Do** use intentional asymmetry. Align a headline to the left but offset the body text to the right to create a sophisticated, editorial "white space" flow.
- **Do** use the `secondary` (Sky Blue) palette for supportive elements like "Success" messages or "Help" tooltips to keep the vibe airy.
- **Do** use large, high-quality photography of people in soft, natural light—avoid "handshaking in suits" stock photos.

### Don't
- **Don’t** use `#000000` (Pure Black). It is too harsh for this sanctuary-themed system. Use `on-surface` (#1b1c19).
- **Don’t** use square corners. Even a `0.5rem` radius is a minimum; this system lives in the `1rem` to `3rem` range.
- **Don’t** use "divider lines" to separate list items. Use a slight color shift or increased padding to let the content breathe.
- **Don't** cram information. If a page feels "full," increase the `surface` padding. This system relies on "The Luxury of Space."