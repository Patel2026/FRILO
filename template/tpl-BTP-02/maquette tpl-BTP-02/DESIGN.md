# Design System Document: Architectural Precision

## 1. Overview & Creative North Star: "The Digital Foreman"
This design system moves away from the "dirty" associations of construction and leans into the precision of modern architecture and high-end engineering. Our Creative North Star is **"The Digital Foreman"**—an identity that is authoritative, impeccably organized, and structurally sound.

To achieve a bespoke, editorial feel, we break the "template" look through:
*   **Intentional Asymmetry:** Off-setting header content and utilizing generous, "unbalanced" whitespace to guide the eye.
*   **Tonal Depth:** Replacing 1px borders with layered surfaces to create a sense of physical space.
*   **High-Contrast Scale:** Pairing massive, industrial `display` type with tight, technical `label` type to mimic blueprint annotations.

## 2. Colors & Surface Philosophy
The palette is rooted in deep, obsidian charcoals and slate tones, punctuated by a high-vis "Safety Orange" (`primary`) and a technical "Architectural Blue" (`tertiary`).

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning or containment. Boundaries must be defined solely through background color shifts. For example, a card (`surface-container-low`) should sit on a background (`surface`) without a stroke. Separation is achieved through the contrast between `#131b2e` and `#0b1326`.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to define importance:
*   **Base Layer:** `surface` (#0b1326) – The "ground" of the application.
*   **Structural Sections:** `surface-container-low` (#131b2e) – Large layout blocks.
*   **Interactive Cards:** `surface-container-high` (#222a3d) – Content that demands focus.
*   **Floating Modals:** `surface-container-highest` (#2d3449) – Temporary overlays.

### The "Glass & Gradient" Rule
To avoid a flat, "standard" dashboard look, use **Glassmorphism** for navigation rails and top bars. 
*   **Implementation:** Apply `surface-container` with 80% opacity and a `backdrop-blur` of 20px. 
*   **Signature Textures:** Use a subtle linear gradient on main CTAs (from `primary` #ffb693 to `primary-container` #ff6b00) to give buttons a "milled" or "anodized" metallic feel.

## 3. Typography: Industrial Authority
The type system utilizes three distinct personalities to establish a clear hierarchy.

*   **The Blueprint (Space Grotesk):** Used for `display` and `headline` levels. Its geometric, wide apertures feel engineered and modern. Use `display-lg` (3.5rem) sparingly for high-impact data points.
*   **The Technical Manual (Manrope):** Used for `title` and `body`. A highly legible sans-serif that balances the industrial nature of the headlines with human-centric readability.
*   **The Annotation (Inter):** Used for `labels`. Tight, precise, and utilitarian. These should often be in `uppercase` with a +5% letter-spacing to mimic technical drawings.

## 4. Elevation & Depth: Tonal Layering
We eschew traditional "Drop Shadows" in favor of light-source-driven elevation.

*   **The Layering Principle:** Stack `surface-container-lowest` cards on a `surface-container-low` section. This creates a "soft lift" that feels architectural rather than digital.
*   **Ambient Shadows:** For floating elements, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(6, 14, 32, 0.4)`. The shadow color is derived from `surface-container-lowest` to ensure it feels like a natural occlusion of light.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline-variant` (#5a4136) at 15% opacity. Never use 100% opaque borders.

## 5. Components

### Buttons
*   **Primary:** A gradient from `primary` to `primary-container`. `rounded-md` (0.375rem). High-vis, bold, and authoritative.
*   **Secondary:** `surface-container-high` background with `on-surface` text. No border.
*   **Tertiary:** No background. `tertiary` (#89ceff) text with a subtle underline on hover.

### Input Fields
*   **Styling:** Use `surface-container-low` as the background. 
*   **States:** On focus, transition the background to `surface-container-highest` and add a 1px "Ghost Border" using `primary`. 
*   **Error:** Use `error` (#ffb4ab) only for the helper text and a subtle 2px left-accent bar, not a full-box border.

### Progress Indicators (The "Steel Beam")
*   For construction project tracking, use a custom progress bar component. 
*   **Track:** `surface-container-highest`.
*   **Indicator:** A striped "hazard" gradient using `primary` and `on-primary-container`.

### Cards & Lists
*   **Constraint:** Forbid the use of divider lines. 
*   **Spacing:** Use the 24px/32px spacing scale to separate list items. 
*   **Interaction:** On hover, a list item should shift from `surface` to `surface-container-low`.

## 6. Do's and Don'ts

### Do:
*   **Do** use extreme whitespace (e.g., 64px or 80px) between major architectural sections.
*   **Do** use `tertiary` (#89ceff) for technical data, like square footage or GPS coordinates.
*   **Do** apply `rounded-xl` (0.75rem) only to large parent containers, using `rounded-sm` for smaller inner elements to maintain a "nested" look.

### Don't:
*   **Don't** use pure black (#000000). The darkest point is `surface-container-lowest` (#060e20).
*   **Don't** use standard icons. Use "Duotone" icons with the secondary color at 30% opacity to maintain the high-end dashboard feel.
*   **Don't** center-align text. This system is built on a rigid left-aligned modular grid to reflect the "grid" of a construction site.