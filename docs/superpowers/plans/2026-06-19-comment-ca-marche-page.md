# Comment Ca Marche Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated `/comment-ca-marche` public page that explains what FRILO does in a simple, editorial, non-technical way inspired by the structure of `https://fr.squarespace.com/professionnels`.

**Architecture:** Add one focused Next.js public route with local content constants, using the existing `PublicPageShell`, shared `Header`, and shared `Footer`. Update navigation links so “Comment ça marche” points to the new route, while keeping the home page section intact for existing anchors.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, lucide-react, existing FRILO public layout components.

---

## Reference Summary

The Squarespace reference is not a technical process page. It is a conviction page:

- A direct hero with one strong promise.
- Long, visual sections that explain outcomes rather than internal mechanics.
- Short benefit titles, restrained copy, strong imagery, and simple CTAs.
- A FAQ-like close that reassures users without making the page feel like documentation.

FRILO adaptation:

- Avoid technical wording like “workflow”, “module”, “backend”, “API”, or “production pipeline”.
- Explain what the customer feels and receives: clarity, adaptation, confidence, delivery, support.
- Preserve FRILO’s truth: the site is prepared by a human team from a selected base, not generated magically.
- Keep page background white, with black sections used deliberately for contrast.

## File Structure

- Create: `frontend/app/comment-ca-marche/page.tsx`
  - Owns the page content, section layout, and lightweight local UI helpers for this route.
  - Uses static content arrays for sections, benefits, and FAQs.
  - Does not call APIs.
- Modify: `frontend/components/layout/Header.tsx`
  - Change `Comment ça marche` href from `/#how-it-works` to `/comment-ca-marche`.
  - Update active link logic so the new route is highlighted.
- Modify: `frontend/components/layout/Footer.tsx`
  - Change `Comment ça marche` href from `/#how-it-works` to `/comment-ca-marche`.
  - Keep `Tarifs` absent from the footer.
- Optional verification only: `frontend/app/page.tsx`
  - Do not redesign the home page.
  - Keep the existing `#how-it-works` section for home-page CTA anchors unless the user later asks to remove it.

## Page Content Direction

Hero headline:

```txt
Votre site peut être clair, même si vous partez de zéro.
```

Hero description:

```txt
FRILO part d’un modèle proche de votre activité, récupère vos informations, adapte le rendu et vous livre un site prêt à partager.
```

Primary CTA:

```txt
Choisir un modèle
```

Secondary CTA:

```txt
Demander une orientation
```

Core promise sections:

1. `Vous choisissez une base proche de votre activité.`
2. `FRILO transforme vos informations en page claire.`
3. `Vous gardez le style et les options sous contrôle.`
4. `Le site est vérifié puis livré prêt à partager.`

Closing reassurance:

```txt
Vous n’avez pas besoin d’avoir tout prêt avant de commencer.
```

## Task 1: Add the Route Skeleton

**Files:**
- Create: `frontend/app/comment-ca-marche/page.tsx`

- [ ] **Step 1: Create the new page with a minimal exported component**

Use this initial skeleton:

```tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

export default function CommentCaMarchePage() {
  return (
    <PublicPageShell className="bg-white">
      <section className="bg-white px-5 pb-14 pt-28 md:px-8 md:pb-20 md:pt-32">
        <div className="mx-auto max-w-[1360px]">
          <div className="grid gap-10 border-b border-black pb-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="text-sm font-black text-[#2563eb]">Comment ça marche</p>
              <h1 className="mt-5 max-w-5xl text-balance text-5xl font-black leading-[0.98] tracking-[-0.025em] text-black md:text-6xl lg:text-[5rem]">
                Votre site peut être clair, même si vous partez de zéro.
              </h1>
            </div>
            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-pretty text-lg leading-8 text-slate-700">
                FRILO part d’un modèle proche de votre activité, récupère vos informations, adapte le rendu et vous livre un site prêt à partager.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/templates"
                  className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[#2563eb]"
                >
                  Choisir un modèle
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/contact?subject=Orientation%20FRILO"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-black text-black transition-colors hover:border-black"
                >
                  Demander une orientation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
docker compose exec frontend npm run typecheck
```

Expected: type generation succeeds and `tsc --noEmit` exits with code 0.

## Task 2: Build the Editorial Content Sections

**Files:**
- Modify: `frontend/app/comment-ca-marche/page.tsx`

- [ ] **Step 1: Add local content arrays above the component**

Add these constants above `export default function CommentCaMarchePage()`:

```tsx
const STORY_SECTIONS = [
  {
    title: 'Vous choisissez une base proche de votre activité.',
    description: 'Restaurant, BTP, santé, immobilier ou service : vous partez d’un univers déjà structuré, puis FRILO l’adapte à votre réalité.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'FRILO transforme vos informations en page claire.',
    description: 'Vos textes, photos, services, horaires et contacts remplacent les exemples. Le rendu doit parler à vos clients, pas à des techniciens.',
    image: '/image/client-satisfait-frilo.jpg',
  },
  {
    title: 'Vous gardez le style et les options sous contrôle.',
    description: 'Avant de commander, vous voyez le modèle, la direction visuelle, les options utiles et le total. Rien n’est caché au moment de payer.',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80',
  },
];

const OUTCOMES = [
  'Une activité comprise rapidement',
  'Des contacts visibles',
  'Un rendu vérifié sur mobile',
  'Un lien prêt à partager',
];

const REASSURANCE_ITEMS = [
  {
    title: 'Pas besoin d’avoir tous les contenus.',
    description: 'Vous pouvez commencer avec l’essentiel. FRILO vous aide ensuite à compléter ce qui manque.',
  },
  {
    title: 'Pas besoin de savoir concevoir un site.',
    description: 'Vous choisissez une base. Notre équipe s’occupe de rendre vos informations lisibles et crédibles.',
  },
  {
    title: 'Pas besoin de deviner le prix.',
    description: 'Le total reste visible avant validation, avec les options choisies et ce qui est déjà inclus.',
  },
];
```

- [ ] **Step 2: Add a visual story section after the hero**

Insert this section after the hero section:

```tsx
<section className="bg-white px-5 pb-14 md:px-8 md:pb-20">
  <div className="mx-auto grid max-w-[1360px] gap-8">
    {STORY_SECTIONS.map((item, index) => (
      <article
        key={item.title}
        className="grid overflow-hidden border border-slate-200 bg-white lg:grid-cols-2"
      >
        <div className={index % 2 === 1 ? 'lg:order-2' : undefined}>
          <div
            className="min-h-[360px] bg-cover bg-center md:min-h-[520px]"
            style={{ backgroundImage: `url(${item.image})` }}
            aria-hidden="true"
          />
        </div>
        <div className="flex min-h-[360px] flex-col justify-center p-7 md:p-10 lg:p-12">
          <p className="text-sm font-black text-[#2563eb]">
            {String(index + 1).padStart(2, '0')}
          </p>
          <h2 className="mt-5 max-w-2xl text-balance text-4xl font-black leading-[1.02] tracking-[-0.02em] text-black md:text-5xl">
            {item.title}
          </h2>
          <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-slate-700 md:text-lg md:leading-8">
            {item.description}
          </p>
        </div>
      </article>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Add a black outcome band**

Insert this section after the story section:

```tsx
<section className="bg-black px-5 py-14 text-white md:px-8 md:py-20">
  <div className="mx-auto max-w-[1360px]">
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
      <div>
        <h2 className="max-w-3xl text-balance text-4xl font-black leading-[1.02] tracking-[-0.02em] md:text-5xl">
          Le résultat doit être simple à comprendre.
        </h2>
        <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-white/65">
          Un visiteur doit savoir ce que vous faites, pourquoi vous contacter et comment passer à l’action.
        </p>
      </div>
      <div className="grid border-y border-white/25 md:grid-cols-2">
        {OUTCOMES.map((item) => (
          <div key={item} className="border-b border-white/20 py-6 md:border-r md:px-6 md:last:border-r-0">
            <p className="text-xl font-black leading-tight text-white">{item}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
docker compose exec frontend npm run typecheck
```

Expected: type generation succeeds and `tsc --noEmit` exits with code 0.

## Task 3: Add the Reassurance and CTA Sections

**Files:**
- Modify: `frontend/app/comment-ca-marche/page.tsx`

- [ ] **Step 1: Add a reassurance section after the black outcome band**

```tsx
<section className="bg-white px-5 py-14 md:px-8 md:py-20">
  <div className="mx-auto max-w-[1360px]">
    <div className="grid gap-8 border-y border-black py-10 lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <h2 className="max-w-2xl text-balance text-4xl font-black leading-[1.02] tracking-[-0.02em] md:text-5xl">
          Vous n’avez pas besoin d’avoir tout prêt avant de commencer.
        </h2>
      </div>
      <div className="grid gap-0 border-t border-slate-200 lg:border-t-0">
        {REASSURANCE_ITEMS.map((item) => (
          <div key={item.title} className="border-b border-slate-200 py-6 last:border-b-0">
            <h3 className="text-xl font-black leading-tight text-black">{item.title}</h3>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-700">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add the final CTA**

```tsx
<section className="bg-white px-5 pb-16 md:px-8 md:pb-20">
  <div className="mx-auto flex max-w-[1360px] flex-col gap-7 bg-black p-7 text-white md:flex-row md:items-center md:justify-between md:p-10">
    <div>
      <h2 className="max-w-3xl text-balance text-3xl font-black leading-tight md:text-4xl">
        Prêt à partir d’une base claire ?
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-white/65">
        Choisissez un modèle ou décrivez votre activité. FRILO vous aide à avancer sans compliquer les choses.
      </p>
    </div>
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href="/templates"
        className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-black transition-colors hover:bg-[#2563eb] hover:text-white"
      >
        Voir les modèles
      </Link>
      <Link
        href="/contact?subject=Orientation%20FRILO"
        className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-white hover:text-black"
      >
        Demander une orientation
      </Link>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
docker compose exec frontend npm run typecheck
```

Expected: type generation succeeds and `tsc --noEmit` exits with code 0.

## Task 4: Update Navigation Links

**Files:**
- Modify: `frontend/components/layout/Header.tsx`
- Modify: `frontend/components/layout/Footer.tsx`

- [ ] **Step 1: Update the header link**

In `frontend/components/layout/Header.tsx`, change:

```tsx
{ name: 'Comment ça marche', href: '/#how-it-works' },
```

to:

```tsx
{ name: 'Comment ça marche', href: '/comment-ca-marche' },
```

- [ ] **Step 2: Update the footer link**

In `frontend/components/layout/Footer.tsx`, change:

```tsx
{ name: 'Comment ça marche', href: '/#how-it-works' },
```

to:

```tsx
{ name: 'Comment ça marche', href: '/comment-ca-marche' },
```

- [ ] **Step 3: Verify the footer does not contain Tarifs**

Run:

```bash
rg -n "Tarifs|/#pricing" frontend/components/layout/Footer.tsx
```

Expected: no output.

- [ ] **Step 4: Run typecheck**

Run:

```bash
docker compose exec frontend npm run typecheck
```

Expected: type generation succeeds and `tsc --noEmit` exits with code 0.

## Task 5: Browser QA

**Files:**
- Verify only.

- [ ] **Step 1: Open desktop page**

Open:

```txt
http://localhost:3000/comment-ca-marche
```

Expected:

- Page background is white.
- Hero is readable and not too technical.
- Titles do not overflow.
- Sections use images and large editorial layouts.
- No section looks like a technical checklist.
- Header “Comment ça marche” is active.

- [ ] **Step 2: Check responsive widths**

Verify at:

```txt
Desktop: 1440 x 900
Tablet: 813 x 776
Mobile: 390 x 844
```

Expected:

- No horizontal overflow.
- CTA buttons wrap cleanly.
- Hero title remains readable.
- Images keep stable aspect and do not create blank gray placeholders.
- Footer columns remain aligned.

- [ ] **Step 3: Check navigation from header and footer**

Actions:

1. Click header “Comment ça marche”.
2. Click footer “Comment ça marche”.

Expected: both navigate to `/comment-ca-marche`.

## Task 6: Final Verification and Commit

**Files:**
- Verify all touched frontend files.

- [ ] **Step 1: Run frontend QA**

Run:

```bash
docker compose exec frontend npm run qa
```

Expected: lint, typecheck, and build steps complete successfully. Existing image warnings are acceptable only if already present and unrelated.

- [ ] **Step 2: Review git diff**

Run:

```bash
git diff -- frontend/app/comment-ca-marche/page.tsx frontend/components/layout/Header.tsx frontend/components/layout/Footer.tsx
```

Expected:

- New route only.
- Header/footer links updated.
- No unrelated page redesign.
- Footer still has no `Tarifs`.

- [ ] **Step 3: Commit**

Run:

```bash
git add frontend/app/comment-ca-marche/page.tsx frontend/components/layout/Header.tsx frontend/components/layout/Footer.tsx docs/superpowers/plans/2026-06-19-comment-ca-marche-page.md
git commit -m "feat(public): add how it works page"
```

Expected: commit created successfully.

## Self-Review

- Spec coverage: The plan creates a dedicated `/comment-ca-marche` page, uses an editorial non-technical structure, updates header/footer navigation, removes reliance on the home anchor for navigation, and keeps `Tarifs` absent from the footer.
- Placeholder scan: No `TBD`, `TODO`, or vague implementation-only notes remain.
- Type consistency: All referenced files and route paths match the existing Next.js app structure.
- Scope check: This is one frontend public-page task. It does not require backend changes or admin content management in this iteration.
