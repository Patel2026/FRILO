# Public Pages Square-Inspired Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework FRILO public commercial pages, excluding the homepage, around a Square-inspired information flow while preserving FRILO identity and avoiding the latest visual regressions.

**Architecture:** Build a small public-page UI kit for reusable non-home sections, then apply it page by page. Data stays in existing services/hooks; no direct `fetch()` in React components. The homepage file `frontend/app/page.tsx` is out of scope and must remain untouched.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, lucide-react, existing FRILO frontend services/hooks.

---

## File Structure

- Create: `frontend/components/public/PublicPageShell.tsx`
  - Public page layout primitives for non-home marketing pages.
  - Exports `PublicPageShell`, `PublicHero`, `PublicBenefitStrip`, `PublicSplitSection`, `PublicFinalCta`, `PublicEmptyState`.
- Create: `frontend/components/public/publicPageCopy.ts`
  - Shared copy helpers and anti-overflow utility constants for public pages.
- Modify: `frontend/app/templates/page.tsx`
  - Refactor catalogue information flow and filters.
- Modify: `frontend/app/templates/[id]/page.tsx`
  - Refactor template detail flow, preview emphasis, included/target separation.
- Modify: `frontend/app/secteurs/page.tsx`
  - Refactor sectors index into utility-first business entry page.
- Modify: `frontend/app/secteurs/[slug]/page.tsx`
  - Refactor sector detail page to guide toward relevant templates.
- Modify: `frontend/app/faq/page.tsx`
  - Simplify FAQ page structure and CTA.
- Modify: `frontend/app/contact/page.tsx`
  - Refine contact page and form presentation.
- Modify: `frontend/app/expertises/page.tsx`
  - Replace generic service-card grid with business-need sections.
- Do not modify: `frontend/app/page.tsx`
  - Homepage is finished and locked.

---

### Task 1: Add Public Page UI Primitives

**Files:**
- Create: `frontend/components/public/PublicPageShell.tsx`
- Create: `frontend/components/public/publicPageCopy.ts`
- Test: `docker exec frilo-frontend npm run typecheck`

- [ ] **Step 1: Create shared copy constants**

Create `frontend/components/public/publicPageCopy.ts`:

```ts
export const PUBLIC_PAGE_TEXT = {
  templates: {
    heroTitle: "Choisissez un modèle prêt à porter votre activité.",
    heroDescription:
      "Parcourez des bases visuelles claires, comparez les options utiles, puis laissez FRILO adapter le contenu à votre entreprise.",
  },
  sectors: {
    helperTitle: "Votre métier exact n’apparaît pas ?",
    helperDescription:
      "Choisissez le secteur le plus proche. FRILO adapte ensuite les textes, les photos et les contacts à votre réalité.",
  },
  templateDetail: {
    reassuranceTitle: "FRILO transforme ce modèle en site prêt à partager.",
    reassuranceDescription:
      "Vous fournissez vos informations essentielles. Nous adaptons les pages, les contenus, les liens, les contacts et le rendu mobile.",
  },
} as const;

export const PUBLIC_CARD_TITLE_CLASS =
  "text-balance break-words leading-tight tracking-[-0.02em]";
```

- [ ] **Step 2: Create public page primitives**

Create `frontend/components/public/PublicPageShell.tsx`:

```tsx
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type PublicPageShellProps = {
  children: ReactNode;
  className?: string;
};

type PublicHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  aside?: ReactNode;
  className?: string;
};

type PublicBenefitStripProps = {
  items: Array<{
    title: string;
    description: string;
  }>;
  className?: string;
};

type PublicSplitSectionProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  reverse?: boolean;
  className?: string;
};

type PublicFinalCtaProps = {
  title: string;
  description?: string;
  href: string;
  label: string;
  className?: string;
};

type PublicEmptyStateProps = {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
};

export function PublicPageShell({ children, className }: PublicPageShellProps) {
  return (
    <main className={cn('min-h-screen bg-[#f7f4ec] text-black', className)}>
      {children}
    </main>
  );
}

export function PublicHero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  aside,
  className,
}: PublicHeroProps) {
  return (
    <section className={cn('px-5 pb-10 pt-28 md:px-8 md:pb-14 md:pt-32', className)}>
      <div className="mx-auto grid max-w-[1360px] gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          {eyebrow && (
            <p className="mb-5 max-w-max rounded-full bg-black px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">
              {eyebrow}
            </p>
          )}
          <h1 className="max-w-5xl text-balance text-[clamp(2.8rem,6vw,5.75rem)] font-black leading-[0.95] tracking-[-0.035em]">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-black/68 md:text-lg md:leading-8">
            {description}
          </p>
          {(primaryAction || secondaryAction) && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryAction && (
                <Link
                  href={primaryAction.href}
                  className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[#e60000]"
                >
                  {primaryAction.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              )}
              {secondaryAction && (
                <Link
                  href={secondaryAction.href}
                  className="inline-flex items-center justify-center rounded-full border border-black px-6 py-3 text-sm font-black text-black transition-colors hover:bg-white"
                >
                  {secondaryAction.label}
                </Link>
              )}
            </div>
          )}
        </div>
        {aside && <div className="min-w-0">{aside}</div>}
      </div>
    </section>
  );
}

export function PublicBenefitStrip({ items, className }: PublicBenefitStripProps) {
  return (
    <section className={cn('px-5 md:px-8', className)}>
      <div className="mx-auto grid max-w-[1360px] border-y border-black md:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="border-b border-black py-5 md:border-b-0 md:border-r md:px-6 md:last:border-r-0">
            <h2 className="text-balance text-lg font-black leading-tight">{item.title}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-black/62">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PublicSplitSection({
  eyebrow,
  title,
  description,
  children,
  reverse = false,
  className,
}: PublicSplitSectionProps) {
  return (
    <section className={cn('px-5 py-12 md:px-8 md:py-16', className)}>
      <div
        className={cn(
          'mx-auto grid max-w-[1360px] gap-8 lg:grid-cols-2 lg:items-center',
          reverse && 'lg:[&>*:first-child]:order-2'
        )}
      >
        <div>
          {eyebrow && <p className="mb-4 text-sm font-black text-[#e60000]">{eyebrow}</p>}
          <h2 className="max-w-3xl text-balance text-4xl font-black leading-[0.98] tracking-[-0.03em] md:text-5xl">
            {title}
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-black/62">{description}</p>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

export function PublicFinalCta({ title, description, href, label, className }: PublicFinalCtaProps) {
  return (
    <section className={cn('px-5 pb-16 md:px-8 md:pb-20', className)}>
      <div className="mx-auto flex max-w-[1360px] flex-col gap-6 bg-black p-7 text-white md:flex-row md:items-center md:justify-between md:p-9">
        <div>
          <h2 className="max-w-3xl text-balance text-3xl font-black leading-tight md:text-4xl">{title}</h2>
          {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">{description}</p>}
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-black transition-colors hover:bg-[#e60000] hover:text-white"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}

export function PublicEmptyState({ title, description, action }: PublicEmptyStateProps) {
  return (
    <div className="border-y border-black bg-white px-6 py-12 text-center">
      <h2 className="text-balance text-2xl font-black leading-tight">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-black/62">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-black text-white"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Run typecheck**

Run: `docker exec frilo-frontend npm run typecheck`

Expected: exit 0.

- [ ] **Step 4: Commit task 1**

```bash
git add frontend/components/public/PublicPageShell.tsx frontend/components/public/publicPageCopy.ts
git commit -m "feat(public): add shared page sections"
```

---

### Task 2: Refactor `/templates` Catalogue Page

**Files:**
- Modify: `frontend/app/templates/page.tsx`
- Use: `frontend/components/public/PublicPageShell.tsx`
- Use: `frontend/components/public/publicPageCopy.ts`
- Test: `docker exec frilo-frontend npm run typecheck`

- [ ] **Step 1: Update imports**

In `frontend/app/templates/page.tsx`, add:

```tsx
import {
  PublicBenefitStrip,
  PublicEmptyState,
  PublicFinalCta,
  PublicHero,
  PublicPageShell,
  PublicSplitSection,
} from '@/components/public/PublicPageShell';
import { PUBLIC_PAGE_TEXT } from '@/components/public/publicPageCopy';
```

- [ ] **Step 2: Replace root and hero**

Replace the root wrapper and current black hero with:

```tsx
<PublicPageShell className="pb-28 lg:pb-0">
  <PublicHero
    eyebrow="Modèles FRILO"
    title={PUBLIC_PAGE_TEXT.templates.heroTitle}
    description={PUBLIC_PAGE_TEXT.templates.heroDescription}
    primaryAction={{ label: 'Voir les modèles', href: '#catalogue' }}
    secondaryAction={{ label: 'Besoin d’aide ?', href: '/contact?subject=Choix%20du%20mod%C3%A8le' }}
    aside={(
      <div className="grid gap-3 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.16)]">
        <p className="text-sm font-black text-black">Choisissez comme un client regarde votre entreprise.</p>
        <div className="grid gap-3 text-sm leading-6 text-black/62">
          <p>1. L’image doit rassurer vite.</p>
          <p>2. Le contenu doit parler de votre activité.</p>
          <p>3. FRILO remplace les exemples par vos informations.</p>
        </div>
      </div>
    )}
  />

  <PublicBenefitStrip
    items={[
      { title: 'Aperçu concret', description: 'Vous voyez la base visuelle avant de commander.' },
      { title: 'Prix visible', description: 'Le prix du modèle et les options restent lisibles.' },
      { title: 'Adaptation FRILO', description: 'Le modèle devient un site à votre nom, avec vos contenus.' },
    ]}
  />
```

Keep all existing state, filtering, persistence, favorites and comparison logic.

- [ ] **Step 3: Calm the filter section**

Add `id="catalogue"` on the catalogue content wrapper.

Change the filters wrapper to:

```tsx
<div className="grid grid-cols-1 gap-3 border-y border-black bg-white p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_220px_auto_auto]">
```

Change filter controls to use `rounded-full` instead of `rounded-2xl` and avoid nested card styling.

- [ ] **Step 4: Replace empty state**

Replace the no-results block with:

```tsx
<PublicEmptyState
  title="Aucun modèle ne correspond à ces filtres."
  description="Retirez un filtre ou décrivez votre activité à FRILO pour recevoir une recommandation de modèle."
  action={{ label: 'Demander une recommandation', href: '/contact?subject=Recommandation%20de%20mod%C3%A8le' }}
/>
```

- [ ] **Step 5: Replace final CTA**

Replace the final black rounded CTA with:

```tsx
<PublicFinalCta
  title="Vous hésitez entre plusieurs modèles ?"
  description="Dites-nous votre activité, votre budget et le type de clients que vous voulez rassurer."
  href="/contact?subject=Choix%20du%20mod%C3%A8le"
  label="Demander un avis"
/>
```

- [ ] **Step 6: Run checks**

Run: `docker exec frilo-frontend npm run typecheck`

Expected: exit 0.

- [ ] **Step 7: Browser verify `/templates`**

Open `http://localhost:3000/templates`.

Verify:
- no horizontal overflow;
- filters remain usable;
- template card titles are readable;
- comparison bar still appears when selecting templates;
- homepage route `/` was not modified.

- [ ] **Step 8: Commit task 2**

```bash
git add frontend/app/templates/page.tsx
git commit -m "feat(public): refactor templates catalogue flow"
```

---

### Task 3: Refactor `/templates/[id]` Template Detail Page

**Files:**
- Modify: `frontend/app/templates/[id]/page.tsx`
- Use: `frontend/components/public/PublicPageShell.tsx`
- Use: `frontend/components/public/publicPageCopy.ts`
- Test: `docker exec frilo-frontend npm run typecheck`

- [ ] **Step 1: Update imports**

Add:

```tsx
import {
  PublicBenefitStrip,
  PublicFinalCta,
  PublicPageShell,
  PublicSplitSection,
} from '@/components/public/PublicPageShell';
import { PUBLIC_PAGE_TEXT } from '@/components/public/publicPageCopy';
```

- [ ] **Step 2: Preserve behavior**

Do not remove:
- favorite logic;
- compare logic;
- review submission logic;
- preview device controls;
- gallery fallback;
- analytics `trackFunnelEvent`.

- [ ] **Step 3: Replace root wrapper**

Change the page root to:

```tsx
<PublicPageShell className="pb-24 lg:pb-0">
```

Keep the fixed topbar, but reduce visual heaviness:

```tsx
<div className="fixed left-0 right-0 top-0 z-50 border-b border-black/10 bg-[#f7f4ec]/95 backdrop-blur">
```

- [ ] **Step 4: Create product hero**

Use a top hero section with:
- template sector;
- template name;
- price;
- order CTA;
- favorite/compare controls.

The hero must put the preview or thumbnail beside the copy, not below every time.

- [ ] **Step 5: Keep "Pense pour" and "Inclus" separate**

Render `targetAudience` and `includedItems` in separate sections:

```tsx
<PublicBenefitStrip
  items={[
    {
      title: 'Pensé pour',
      description: visibleFeatures.length > 0 ? visibleFeatures.join(' · ') : 'Les profils clients adaptés apparaîtront ici.',
    },
    {
      title: 'Inclus',
      description: includedPreview.length > 0 ? includedPreview.join(' · ') : 'Les éléments inclus apparaîtront ici.',
    },
    {
      title: 'Adapté par FRILO',
      description: 'Vos textes, photos, contacts et liens remplacent les exemples du modèle.',
    },
  ]}
/>
```

- [ ] **Step 6: Rebalance preview section**

Make device controls compact and icon-based. Keep labels via `aria-label`.

Ensure the preview container has stable dimensions:

```tsx
className="mx-auto h-[min(70vh,760px)] w-full max-w-6xl overflow-hidden border border-black bg-white"
```

For tablet/mobile modes, center the frame and avoid text overlap.

- [ ] **Step 7: Add reassurance split section**

Add:

```tsx
<PublicSplitSection
  title={PUBLIC_PAGE_TEXT.templateDetail.reassuranceTitle}
  description={PUBLIC_PAGE_TEXT.templateDetail.reassuranceDescription}
>
  <div className="grid gap-3 bg-white p-5">
    {['Pages adaptées', 'Version mobile vérifiée', 'Contacts visibles', 'Lien livré'].map((item) => (
      <div key={item} className="border-b border-black/10 pb-3 text-sm font-black last:border-b-0 last:pb-0">
        {item}
      </div>
    ))}
  </div>
</PublicSplitSection>
```

- [ ] **Step 8: Replace final CTA**

Use:

```tsx
<PublicFinalCta
  title={`Prêt à partir de ${template.name} ?`}
  description="Passez commande, ajoutez vos informations, puis FRILO prépare votre site."
  href={`/commande?template_id=${template.id}`}
  label="Commander ce modèle"
/>
```

- [ ] **Step 9: Run checks**

Run: `docker exec frilo-frontend npm run typecheck`

Expected: exit 0.

- [ ] **Step 10: Browser verify template detail**

Open an existing detail page such as `http://localhost:3000/templates/1`.

Verify:
- price is not repeated awkwardly;
- "Pensé pour" and "Inclus" do not mix;
- preview controls are visible and compact;
- title does not overflow on mobile;
- CTA remains accessible.

- [ ] **Step 11: Commit task 3**

```bash
git add frontend/app/templates/[id]/page.tsx
git commit -m "feat(public): refactor template detail flow"
```

---

### Task 4: Refactor Sector Pages

**Files:**
- Modify: `frontend/app/secteurs/page.tsx`
- Modify: `frontend/app/secteurs/[slug]/page.tsx`
- Use: `frontend/components/public/PublicPageShell.tsx`
- Test: `docker exec frilo-frontend npm run typecheck`

- [ ] **Step 1: Update imports in both files**

Add relevant public components:

```tsx
import {
  PublicBenefitStrip,
  PublicEmptyState,
  PublicFinalCta,
  PublicHero,
  PublicPageShell,
  PublicSplitSection,
} from '@/components/public/PublicPageShell';
import { PUBLIC_PAGE_TEXT, PUBLIC_CARD_TITLE_CLASS } from '@/components/public/publicPageCopy';
```

- [ ] **Step 2: Refactor `/secteurs` root and hero**

Use:

```tsx
<PublicPageShell>
  <PublicHero
    eyebrow="Secteurs"
    title="Trouvez le point de départ le plus proche de votre activité."
    description="Restaurant, cabinet, commerce, service ou accompagnement : choisissez une base métier, puis FRILO adapte le reste à vos contenus."
    primaryAction={{ label: 'Voir les secteurs', href: '#secteurs' }}
    secondaryAction={{ label: 'Demander de l’aide', href: '/contact?subject=Choix%20du%20secteur' }}
  />
```

- [ ] **Step 3: Replace sector cards with sober business entries**

Use a list/grid where each sector is a stable block:

```tsx
<Link
  key={sector.id}
  href={`/secteurs/${sector.slug}`}
  className="group grid min-h-40 gap-5 border-y border-black bg-white p-5 transition-colors hover:bg-black hover:text-white md:grid-cols-[4rem_1fr_auto] md:items-center"
>
  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white group-hover:bg-[#e60000]">
    <Icon className="h-5 w-5" />
  </div>
  <div>
    <h2 className={cn('text-2xl font-black group-hover:text-white', PUBLIC_CARD_TITLE_CLASS)}>
      {sector.name}
    </h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-black/62 group-hover:text-white/66">
      {sector.description}
    </p>
  </div>
  <span className="text-sm font-black">Voir les modèles</span>
</Link>
```

- [ ] **Step 4: Add helper CTA to `/secteurs`**

Use:

```tsx
<PublicFinalCta
  title={PUBLIC_PAGE_TEXT.sectors.helperTitle}
  description={PUBLIC_PAGE_TEXT.sectors.helperDescription}
  href="/contact?subject=Choix%20du%20secteur"
  label="Demander une orientation"
/>
```

- [ ] **Step 5: Refactor `/secteurs/[slug]` flow**

The sector detail page must include:
- hero with sector name and description;
- benefit strip: `Services visibles`, `Preuves rassurantes`, `Contact facile`;
- templates grid using existing template image helpers;
- final CTA to contact if no template fits.

- [ ] **Step 6: Run checks**

Run: `docker exec frilo-frontend npm run typecheck`

Expected: exit 0.

- [ ] **Step 7: Browser verify sectors**

Open:
- `http://localhost:3000/secteurs`
- one sector detail page from visible links.

Verify:
- long sector names wrap cleanly;
- no card text is cut;
- helper CTA is visible;
- no horizontal overflow.

- [ ] **Step 8: Commit task 4**

```bash
git add frontend/app/secteurs/page.tsx frontend/app/secteurs/[slug]/page.tsx
git commit -m "feat(public): refactor sector discovery pages"
```

---

### Task 5: Refactor FAQ, Contact, Expertises

**Files:**
- Modify: `frontend/app/faq/page.tsx`
- Modify: `frontend/app/contact/page.tsx`
- Modify: `frontend/app/expertises/page.tsx`
- Use: `frontend/components/public/PublicPageShell.tsx`
- Test: `docker exec frilo-frontend npm run typecheck`

- [ ] **Step 1: Refactor FAQ hero**

Replace the black hero and side card with:

```tsx
<PublicPageShell>
  <PublicHero
    eyebrow="Questions"
    title="Les réponses utiles avant de commander."
    description="Prix, livraison, contenu, propriété du site et accompagnement : les points importants doivent être faciles à comprendre."
    primaryAction={{ label: 'Voir les réponses', href: '#faq' }}
    secondaryAction={{ label: 'Nous écrire', href: '/contact?subject=Question%20avant%20commande' }}
  />
```

Add `id="faq"` to the FAQ section.

- [ ] **Step 2: Simplify FAQ accordion cards**

Use border-y rows instead of rounded cards:

```tsx
<div className="border-y border-black bg-white">
  {faqs.map((faq, index) => (
    <div key={faq.id} className="border-b border-black/10 last:border-b-0">
      ...
    </div>
  ))}
</div>
```

Keep existing open/close behavior.

- [ ] **Step 3: Refactor Contact hero and form wrapper**

Use `PublicHero` with concise copy.

Keep contact submission logic unchanged.

Use form sections:
- `Vos informations`
- `Contexte`
- `Message`

Keep fields and validation unchanged.

- [ ] **Step 4: Refactor Expertises page**

Replace gradient hero and service cards with:

```tsx
<PublicPageShell>
  <PublicHero
    eyebrow="Expertises"
    title="Des services pour faire travailler votre site après sa mise en ligne."
    description="FRILO peut aussi vous aider à attirer, rassurer et convertir vos clients avec des actions digitales ciblées."
    primaryAction={{ label: 'Parler à un expert', href: '/contact?subject=Expertises%20FRILO' }}
  />
```

Group services by business need:
- `Attirer des visiteurs`
- `Clarifier votre image`
- `Faire vivre votre site`

Do not use gradient text. Do not use multicolor cards.

- [ ] **Step 5: Run checks**

Run: `docker exec frilo-frontend npm run typecheck`

Expected: exit 0.

- [ ] **Step 6: Browser verify reassurance pages**

Open:
- `http://localhost:3000/faq`
- `http://localhost:3000/contact`
- `http://localhost:3000/expertises`

Verify:
- accordions still work;
- contact form can be filled visually without overlap;
- expertises page no longer has gradient text;
- mobile layout does not cut labels or buttons.

- [ ] **Step 7: Commit task 5**

```bash
git add frontend/app/faq/page.tsx frontend/app/contact/page.tsx frontend/app/expertises/page.tsx
git commit -m "feat(public): refactor support pages flow"
```

---

### Task 6: Full QA And Visual Regression Pass

**Files:**
- Read-only: `frontend/app/page.tsx`
- Verify all modified public pages.

- [ ] **Step 1: Confirm homepage file is untouched**

Run:

```bash
git diff --name-only origin/develop...HEAD | grep 'frontend/app/page.tsx' || true
```

Expected: no output.

- [ ] **Step 2: Run frontend QA**

Run:

```bash
docker exec frilo-frontend npm run qa
```

Expected: exit 0. Existing `<img>` warnings are acceptable if no new errors appear.

- [ ] **Step 3: Browser verify desktop pages**

Open each route at desktop width:

- `http://localhost:3000/templates`
- `http://localhost:3000/templates/1`
- `http://localhost:3000/secteurs`
- a visible sector detail URL
- `http://localhost:3000/faq`
- `http://localhost:3000/contact`
- `http://localhost:3000/expertises`

For each page, verify:
- no horizontal scroll;
- first viewport communicates the page purpose;
- CTA visible;
- no text overflow;
- images or preview areas are correctly framed.

- [ ] **Step 4: Browser verify mobile pages**

Set viewport near mobile width and re-check:

- `/templates`
- `/templates/1`
- `/secteurs`
- `/faq`
- `/contact`

Verify:
- buttons fit their containers;
- titles wrap naturally;
- sticky/fixed controls do not cover essential content;
- filter controls remain usable.

- [ ] **Step 5: Final git diff review**

Run:

```bash
git diff --check
git status --short --branch
```

Expected:
- `git diff --check` has no output;
- only intended files are modified, or branch is clean after commits.

- [ ] **Step 6: Push**

Run:

```bash
git push origin develop
```

Expected: push succeeds.
