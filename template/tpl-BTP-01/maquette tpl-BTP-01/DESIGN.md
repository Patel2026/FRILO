```markdown
# Design System Document: Industrial Precision & Tonal Depth

## 1. Overview & Creative North Star
**The Creative North Star: "Architectural Brutalism"**
Construction is not about decoration; it is about structure, gravity, and the raw beauty of engineering. This design system moves away from "generic corporate blue" by embracing a high-end, editorial aesthetic that mirrors a blueprint. We reject the "web-template" look in favor of **Architectural Brutalism**: a style defined by heavy-duty weights, 90-degree precision, and sophisticated tonal layering. 

The system achieves a "custom" feel by leaning into the beauty of the void—using massive amounts of white space and rigid, unrounded geometry to convey an unshakable sense of reliability and strength.

---

## 2. Colors & Surface Logic
The palette is rooted in the "Deep Dark Blue" of an engineering firm, punctuated by the "Vibrant Orange" of site safety. 

### The "No-Line" Rule
To maintain a high-end editorial feel, **1px solid borders are prohibited for sectioning.** Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit directly against a `surface` background. This forces the designer to use color and space to define structure, rather than relying on outdated "boxed" containers.

### Surface Hierarchy & Nesting
Treat the UI as a physical site plan. We use a "Tonal Stacking" method:
- **Base Layer:** `surface` (#f9f9ff) for the primary background.
- **Mid Layer:** `surface-container-low` (#f1f3ff) for secondary content areas.
- **Top Layer:** `surface-container-highest` (#d7e2ff) for high-priority interactive cards.

### Signature Textures & Gradients
Flat color can feel "default." To add "soul," use subtle **linear gradients** for Hero sections and primary CTAs. Transition from `primary` (#051125) to `primary_container` (#1B263B) at a 135-degree angle. This mimics the sheen of cold-rolled steel and provides a depth that flat hex codes cannot achieve.

---

## 3. Typography: The Blueprint Voice
We use a dual-typeface approach to balance industrial power with modern readability.

*   **Display & Headlines:** **Work Sans** (Variable). Use the Bold or Black weights. It is wide, authoritative, and feels "stamped" onto the page.
*   **Body & Labels:** **Public Sans**. A clean, neutral typeface derived from US government standards. It conveys "official" reliability and remains legible at the smallest label sizes.

**Hierarchy Strategy:**
- **Display-LG (3.5rem):** Used for project titles or impact statistics. Always set with tight letter-spacing (-0.02em).
- **Body-MD (0.875rem):** The workhorse for technical descriptions. Increase line-height to 1.6 for an editorial feel.
- **Label-SM (0.6875rem):** Used for technical metadata (e.g., "SQUARE FOOTAGE" or "SITE LOCATION"), always in **ALL CAPS** with +0.1em letter spacing to mimic architectural drawings.

---

## 4. Elevation & Depth
This system rejects traditional "drop shadows." We convey hierarchy through **Tonal Layering** and **Ghost Borders.**

### The Layering Principle
Depth is achieved by "stacking" surface tiers. Place a `surface_container_lowest` (#ffffff) card on a `surface_container_low` (#f1f3ff) background. This creates a "soft lift" that feels architectural rather than digital.

### Ambient Shadows
When an element must float (e.g., a modal), use an "Industrial Shadow":
- **Y-Offset:** 12px
- **Blur:** 40px
- **Color:** `on_surface` (#101b30) at **4% opacity**.
This mimics the diffused light of a large warehouse rather than a harsh desk lamp.

### The "Ghost Border" Fallback
If a border is required for accessibility, it must be a **Ghost Border**: Use the `outline_variant` (#c5c6cd) at **20% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Heavy-Duty Buttons
Buttons must feel like solid blocks. 
- **Radius:** 0px (Absolute Sharpness).
- **Primary:** `primary` (#051125) background with `on_primary` (#ffffff) text.
- **Secondary:** `secondary_container` (#fd8b00) background. Use this for "Action Required" items (e.g., "Request Quote").
- **Visual State:** On hover, the button should shift 4px up and 4px right, with a "shadow block" of `primary_fixed` appearing behind it to simulate physical weight.

### Industrial Cards & Lists
**Forbid the use of divider lines.** 
- Separate list items by alternating between `surface` and `surface_container_low`. 
- For project cards, use a "Bleed Image" layout where the photo takes up the top 60% of the card, sitting flush against the 0px edges.

### Technical Input Fields
- **Style:** Underline only. Use `outline` (#75777d) for the bottom border (2px thickness). 
- **Focus State:** The border color shifts to `secondary` (#904d00) and thickens to 3px. This "Orange Alert" focus state ensures the user knows exactly where they are.

### Additional Component: The "Site Progress" Chip
A custom chip for project status. 
- **Active:** `secondary_fixed` background with `on_secondary_fixed` text.
- **Completed:** `primary_container` background with `on_primary_container` text.

---

## 6. Do's and Don'ts

### Do:
- **DO** use 0px border-radius globally. Reliability is found in straight lines and 90-degree angles.
- **DO** use generous white space. A high-end experience feels "expensive" because it doesn't try to cram information into every pixel.
- **DO** use "Industrial Orange" (#FF8C00) sparingly. It is a tool for attention, not a background color.

### Don't:
- **DON'T** use 1px solid borders to separate sections. Use tonal shifts (`surface` vs `surface-container-low`).
- **DON'T** use soft, rounded icons. Icons must be stroke-based, 2px weight, with sharp corners.
- **DON'T** use generic "drop shadows." If it doesn't look like ambient light in a physical space, remove it.
- **DON'T** use transitions longer than 150ms. Industrial interfaces should feel "snappy" and "mechanical," not "floaty."```