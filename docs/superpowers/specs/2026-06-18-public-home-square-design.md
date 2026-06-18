# Public Home Square-Inspired Design

**Goal:** Rework only the FRILO public home page with the purity, image-led rhythm, white background, and restrained motion seen on Square, while preserving FRILO's offer, dynamic content hooks, routes, and ordering flow.

## Reference

Square's homepage uses a pure white page base, a full-bleed image-led hero, oversized high-contrast typography, simple pill CTAs, image-heavy product/business sections, and wide whitespace. The page is not card-heavy; sections feel like large editorial/product panels with clear action.

## FRILO Translation

FRILO should not become a Square clone. The design adapts the visual language to FRILO's promise: a human-produced website delivered quickly for local businesses.

- **Background:** `#ffffff` as the dominant page background.
- **Hero:** Full-screen darkened lifestyle image with FRILO headline and two pill CTAs over the image.
- **Sector/proof rail:** Horizontal rail of sectors/business types, inspired by Square's logo/business rail.
- **Models:** Gallery-led template section with larger images and fewer visible cards.
- **Business fit:** White split section explaining that FRILO adapts each model to the client's activity.
- **Process:** Clean two-column operational section preserving "client does / FRILO does" content.
- **Pricing:** White/black pricing block with included items and options, high readability.
- **Final CTA:** Black section with image collage energy and simple CTAs.

## Constraints

- Keep existing CMS/fallback content lookups.
- Keep template, sector, testimonial, FAQ, pricing, and option API flows.
- Do not change backend routes, services, or database.
- Do not remove public content block anchors.
- Do not introduce direct `fetch()` calls in React components.
- Use existing local imagery first; no remote image dependency for the initial pass.
- Keep motion progressive and accessible with `prefers-reduced-motion`.

## Acceptance

- `http://localhost:3000/` renders with a white Square-like page base.
- First viewport has a full image hero, large headline, and clear CTAs.
- Existing dynamic sections still render or show existing fallback/error states.
- No horizontal overflow on desktop or mobile.
- Frontend QA passes.
