# Client Dashboard Shopify-FRILO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the FRILO client dashboard as a Shopify-inspired but FRILO-native console that adapts to the client's actual order, site and enabled modules.

**Architecture:** Keep the existing Next.js client routes and service layer. Add small dashboard presentation components, then refactor the dashboard shell and key pages to share the same compact bands, lists, toolbars and timelines. No backend API changes are required.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, lucide-react, existing Laravel API services.

---

## File Structure

- Create `frontend/components/dashboard/client-ui.tsx`: shared presentation components for shell pages: page frame, toolbar, panel, status band, compact list rows, timeline and badges.
- Modify `frontend/app/dashboard/layout.tsx`: Shopify-like FRILO shell with dark topbar, contextual search field, visible primary action and mobile drawer.
- Modify `frontend/components/dashboard/Sidebar.tsx`: less card-heavy sidebar with account/site context and compact navigation.
- Modify `frontend/app/dashboard/page.tsx`: context-aware client overview for no order, order in progress, delivered site and enabled modules.
- Modify `frontend/app/dashboard/mon-site/page.tsx`: site-first page with delivery, domain, URL, renewal and option information.
- Modify `frontend/app/dashboard/contacts/page.tsx`: compact list/table style, persistent add action, unified form panel.
- Modify `frontend/app/dashboard/caisse/page.tsx`: compact finance view with summary band and movement list, no card grid.
- Modify `frontend/app/dashboard/echeances/page.tsx`: clarify FRILO/system reminders vs personal reminders.
- Modify `frontend/app/dashboard/orders/page.tsx`: align list, filters and actions with the shared dashboard UI.

---

## Task 1: Shared Client Dashboard UI Components

**Files:**
- Create: `frontend/components/dashboard/client-ui.tsx`

- [ ] **Step 1: Create shared presentational components**

Create `frontend/components/dashboard/client-ui.tsx` with:

```tsx
import Link from 'next/link';
import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClientPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('w-full max-w-[1240px] px-4 py-5 md:px-7 md:py-7', className)}>
      {children}
    </div>
  );
}

export function ClientPageHeader({
  title,
  description,
  action,
  meta,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  meta?: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 border-b border-neutral-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {meta && <p className="mb-2 text-xs font-bold text-neutral-500">{meta}</p>}
        <h1 className="text-2xl font-black tracking-tight text-neutral-950 md:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

export function ClientButton({
  href,
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled,
}: {
  href?: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const classes = cn(
    'inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60',
    variant === 'primary' && 'bg-[#e11d2e] text-white hover:bg-[#bd1221]',
    variant === 'secondary' && 'border border-neutral-300 bg-white text-neutral-950 hover:border-neutral-950',
    variant === 'ghost' && 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
  );

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

export function ClientPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('overflow-hidden rounded-xl border border-neutral-200 bg-white', className)}>
      {children}
    </section>
  );
}

export function ClientPanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-neutral-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-black text-neutral-950">{title}</h2>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold',
        tone === 'neutral' && 'bg-neutral-100 text-neutral-700',
        tone === 'success' && 'bg-emerald-50 text-emerald-700',
        tone === 'warning' && 'bg-amber-50 text-amber-700',
        tone === 'danger' && 'bg-red-50 text-red-700',
        tone === 'info' && 'bg-sky-50 text-sky-700'
      )}
    >
      {children}
    </span>
  );
}

export function StatusBand({
  title,
  description,
  status,
  action,
  secondaryAction,
}: {
  title: string;
  description: string;
  status?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
}) {
  return (
    <ClientPanel>
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="border-b border-neutral-100 p-5 lg:border-b-0 lg:border-r">
          {status && <div className="mb-3">{status}</div>}
          <h2 className="text-2xl font-black tracking-tight text-neutral-950">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">{description}</p>
          {(action || secondaryAction) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {action}
              {secondaryAction}
            </div>
          )}
        </div>
        <div className="bg-neutral-50 p-5">{secondaryAction ? null : action}</div>
      </div>
    </ClientPanel>
  );
}

export function Timeline({
  items,
}: {
  items: Array<{ title: string; description: string; meta?: string; tone?: 'done' | 'current' | 'waiting' }>;
}) {
  return (
    <div className="divide-y divide-neutral-100">
      {items.map((item) => (
        <div key={`${item.title}-${item.meta ?? ''}`} className="grid grid-cols-[24px_minmax(0,1fr)_auto] gap-3 px-5 py-4">
          <span
            className={cn(
              'mt-0.5 h-4 w-4 rounded-full',
              item.tone === 'current' ? 'bg-[#e11d2e]' : item.tone === 'done' ? 'bg-neutral-950' : 'bg-neutral-200'
            )}
          />
          <div className="min-w-0">
            <p className="text-sm font-black text-neutral-950">{item.title}</p>
            <p className="mt-1 text-sm text-neutral-500">{item.description}</p>
          </div>
          {item.meta && <p className="text-xs font-bold text-neutral-500">{item.meta}</p>}
        </div>
      ))}
    </div>
  );
}

export function CompactRow({
  title,
  description,
  meta,
  href,
  action,
}: {
  title: string;
  description?: string;
  meta?: ReactNode;
  href?: string;
  action?: ReactNode;
}) {
  const content = (
    <div className="grid gap-3 px-5 py-4 transition-colors hover:bg-neutral-50 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-neutral-950">{title}</p>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>
      <div className="flex items-center justify-between gap-3 md:justify-end">
        {meta}
        {action}
        {href && <ArrowRight className="h-4 w-4 text-neutral-300" />}
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
```

- [ ] **Step 2: Run frontend typecheck**

Run:

```bash
docker compose exec frontend npm run typecheck
```

Expected: typecheck passes.

- [ ] **Step 3: Commit shared components**

Run:

```bash
git add frontend/components/dashboard/client-ui.tsx
git commit -m "feat(client): add dashboard UI primitives"
```

---

## Task 2: Dashboard Shell and Sidebar

**Files:**
- Modify: `frontend/app/dashboard/layout.tsx`
- Modify: `frontend/components/dashboard/Sidebar.tsx`

- [ ] **Step 1: Refactor layout topbar**

In `frontend/app/dashboard/layout.tsx`, keep the auth guard and mobile drawer state, then update the returned shell to:

```tsx
return (
  <div className="flex min-h-screen bg-[#f5f5f6] text-neutral-950">
    <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    {mobileNavOpen && (
      <button
        type="button"
        aria-label="Fermer le menu"
        onClick={() => setMobileNavOpen(false)}
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
      />
    )}
    <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
      <div className="sticky top-0 z-30 border-b border-neutral-900 bg-neutral-950 text-white">
        <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg border border-white/15 p-2 text-white/70 hover:text-white md:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden h-9 w-[min(440px,42vw)] items-center rounded-lg bg-white/10 px-3 text-sm font-semibold text-white/55 md:flex">
              Rechercher commande, client, mouvement...
            </div>
            <Link href="/" className="text-sm font-black text-white md:hidden">
              FRILO
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/mon-site"
              className="hidden h-9 items-center rounded-lg border border-white/15 px-3 text-sm font-black text-white hover:bg-white/10 sm:inline-flex"
            >
              Voir mon site
            </Link>
            <Link
              href="/templates"
              className="inline-flex h-9 items-center rounded-lg bg-[#e11d2e] px-3 text-sm font-black text-white hover:bg-[#bd1221]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle demande
            </Link>
            <NotificationsBell />
          </div>
        </div>
      </div>
      {children}
    </main>
  </div>
);
```

- [ ] **Step 2: Simplify sidebar styling**

In `frontend/components/dashboard/Sidebar.tsx`:
- keep `navItems`, unread count and urgent count logic;
- remove the promotional card;
- change the aside classes to `bg-[#f0f0f1]`, compact links, and no large card block;
- add a context block:

```tsx
<div className="border-y border-neutral-200 px-3 py-4">
  <p className="text-xs font-bold text-neutral-500">Espace actif</p>
  <p className="mt-1 truncate text-sm font-black text-neutral-950">Suivi FRILO</p>
  <p className="mt-1 text-xs font-semibold text-[#e11d2e]">Site, commandes et outils</p>
</div>
```

- [ ] **Step 3: Verify shell render**

Run:

```bash
docker compose exec frontend npm run typecheck
```

Expected: typecheck passes.

- [ ] **Step 4: Commit shell**

Run:

```bash
git add frontend/app/dashboard/layout.tsx frontend/components/dashboard/Sidebar.tsx
git commit -m "feat(client): refresh dashboard shell"
```

---

## Task 3: Context-Aware Dashboard Overview

**Files:**
- Modify: `frontend/app/dashboard/page.tsx`

- [ ] **Step 1: Add context helpers**

In `frontend/app/dashboard/page.tsx`, derive:

```tsx
const allOrders = orders;
const latestOrder = allOrders[0] ?? null;
const deliveredOrder = allOrders.find((order) => order.status === 'completed') ?? null;
const activeOrder = allOrders.find((order) => order.status === 'processing' || order.status === 'pending') ?? latestOrder;
const primaryOrder = deliveredOrder ?? activeOrder ?? latestOrder;
const projectName = primaryOrder?.instruction?.enterprise_name || primaryOrder?.instructions?.[0]?.enterprise_name || primaryOrder?.template?.name || 'Votre projet FRILO';
const hasSite = Boolean(deliveredOrder?.site_url || deliveredOrder?.domain || deliveredOrder);
```

- [ ] **Step 2: Replace the overview JSX with FRILO V2 structure**

Use the shared components:

```tsx
<ClientPage>
  <ClientPageHeader
    title={loading ? 'Bonjour.' : `Bonjour, ${firstName}.`}
    description="Votre espace est organise autour de votre site, vos commandes et les outils actifs chez FRILO."
    action={<ClientButton href="/templates">Nouvelle demande</ClientButton>}
  />

  <StatusBand
    title={primaryOrder ? projectName : 'Lancer votre premier projet FRILO'}
    description={primaryOrder ? nextStep.description : 'Choisissez un modele pour demarrer, puis suivez la production depuis cet espace.'}
    status={<StatusPill tone={hasSite ? 'success' : primaryOrder ? 'warning' : 'neutral'}>{hasSite ? 'Site livre' : primaryOrder ? statusConfig[primaryOrder.status]?.label ?? primaryOrder.status : 'Demarrage'}</StatusPill>}
    action={<ClientButton href={hasSite ? '/dashboard/mon-site' : nextStep.ctaHref}>{hasSite ? 'Ouvrir mon espace site' : nextStep.ctaLabel}</ClientButton>}
    secondaryAction={<ClientButton href="/dashboard/orders" variant="secondary">Voir mes commandes</ClientButton>}
  />

  <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
    <ClientPanel>
      <ClientPanelHeader title="Suivi du dossier" description="Les etapes importantes de votre projet FRILO." />
      <Timeline items={timelineItems} />
    </ClientPanel>
    <ClientPanel>
      <ClientPanelHeader title="Outils disponibles" description="Selon votre usage et vos options actives." />
      <div className="divide-y divide-neutral-100">
        {moduleRows.map((row) => <CompactRow key={row.title} {...row} />)}
      </div>
    </ClientPanel>
  </div>

  <ClientPanel className="mt-5">
    <ClientPanelHeader title="Activite recente" description="Commandes, caisse, clients et rappels utiles." />
    <div className="divide-y divide-neutral-100">
      {activityRows.map((row) => <CompactRow key={row.title} {...row} />)}
    </div>
  </ClientPanel>
</ClientPage>
```

Define `timelineItems`, `moduleRows`, and `activityRows` from existing `summary`, `orders`, `featuredTemplates` data. Use deterministic fallback rows for empty states.

- [ ] **Step 3: Run typecheck**

Run:

```bash
docker compose exec frontend npm run typecheck
```

Expected: typecheck passes.

- [ ] **Step 4: Visual check `/dashboard`**

Open `/dashboard` in the integrated browser at desktop and mobile widths. Expected:
- no card-heavy grid;
- main band is visible first;
- modules are lists;
- primary action is visible;
- no horizontal scroll.

- [ ] **Step 5: Commit overview**

Run:

```bash
git add frontend/app/dashboard/page.tsx
git commit -m "feat(client): add contextual dashboard overview"
```

---

## Task 4: Mon Site Page

**Files:**
- Modify: `frontend/app/dashboard/mon-site/page.tsx`

- [ ] **Step 1: Replace page frame**

Use `ClientPage`, `ClientPageHeader`, `StatusBand`, `ClientPanel`, `ClientPanelHeader`, `CompactRow`, `StatusPill`, `ClientButton`.

The empty state must show:

```tsx
<ClientPage>
  <ClientPageHeader title="Mon site" description="Votre site FRILO apparait ici des qu'il est livre." />
  <StatusBand
    title="Votre site est en preparation"
    description="Suivez la commande en cours. Les informations de domaine, hebergement et URL seront affichees apres livraison."
    status={<StatusPill tone="warning">En preparation</StatusPill>}
    action={<ClientButton href="/dashboard/orders">Voir ma commande</ClientButton>}
    secondaryAction={<ClientButton href="/templates" variant="secondary">Explorer les modeles</ClientButton>}
  />
</ClientPage>
```

- [ ] **Step 2: Render delivered sites as bands and rows**

For each delivered site, show:
- status pill `Livre`;
- template and sector;
- URL, domain, preview URL, hosting expiry;
- actions to open site and view order.

- [ ] **Step 3: Run typecheck and commit**

Run:

```bash
docker compose exec frontend npm run typecheck
git add frontend/app/dashboard/mon-site/page.tsx
git commit -m "feat(client): align site page with contextual console"
```

---

## Task 5: Contacts Page

**Files:**
- Modify: `frontend/app/dashboard/contacts/page.tsx`

- [ ] **Step 1: Refactor header and form container**

Use:
- `ClientPage`
- `ClientPageHeader`
- `ClientButton`
- `ClientPanel`
- `ClientPanelHeader`
- `CompactRow`

The add button remains visible in the header and empty state. The form uses one `ClientPanel`, not a nested card.

- [ ] **Step 2: Replace contact list**

Render contacts inside:

```tsx
<ClientPanel>
  <ClientPanelHeader title="Contacts enregistrés" description={`${total} client${total > 1 ? 's' : ''} dans votre fichier.`} />
  <div className="divide-y divide-neutral-100">
    {contacts.map((contact) => (
      <CompactRow
        key={contact.id}
        title={contact.name}
        description={[contact.company, contact.phone, contact.email].filter(Boolean).join(' · ') || 'Aucune coordonnee ajoutee'}
        action={
          <div className="flex gap-2">
            <ClientButton variant="ghost" onClick={() => openEdit(contact)}>Modifier</ClientButton>
            <ClientButton variant="ghost" onClick={() => handleDelete(contact.id)}>Supprimer</ClientButton>
          </div>
        }
      />
    ))}
  </div>
</ClientPanel>
```

- [ ] **Step 3: Run typecheck and commit**

Run:

```bash
docker compose exec frontend npm run typecheck
git add frontend/app/dashboard/contacts/page.tsx
git commit -m "feat(client): streamline contacts page"
```

---

## Task 6: Caisse Page

**Files:**
- Modify: `frontend/app/dashboard/caisse/page.tsx`

- [ ] **Step 1: Refactor header and summary band**

Use shared components and replace the three-card summary grid with a single panel:

```tsx
<ClientPanel>
  <div className="grid divide-y divide-neutral-100 md:grid-cols-3 md:divide-x md:divide-y-0">
    <div className="p-5">
      <p className="text-sm font-bold text-neutral-500">Entrées</p>
      <p className="mt-2 text-2xl font-black text-emerald-700">{fmt(summary.income)}</p>
    </div>
    <div className="p-5">
      <p className="text-sm font-bold text-neutral-500">Dépenses</p>
      <p className="mt-2 text-2xl font-black text-[#e11d2e]">{fmt(summary.expenses)}</p>
    </div>
    <div className="p-5">
      <p className="text-sm font-bold text-neutral-500">Solde</p>
      <p className="mt-2 text-2xl font-black text-neutral-950">{fmt(summary.balance)}</p>
    </div>
  </div>
</ClientPanel>
```

- [ ] **Step 2: Replace movement list**

Render movements as `CompactRow` rows. Keep edit/delete actions visible.

- [ ] **Step 3: Preserve form behavior**

Keep `openCreate`, `openEdit`, `handleSubmit`, `handleDelete` unchanged. Only restyle the form with `ClientPanel` and `ClientButton`.

- [ ] **Step 4: Run typecheck and commit**

Run:

```bash
docker compose exec frontend npm run typecheck
git add frontend/app/dashboard/caisse/page.tsx
git commit -m "feat(client): streamline cash page"
```

---

## Task 7: Echeances Page

**Files:**
- Modify: `frontend/app/dashboard/echeances/page.tsx`

- [ ] **Step 1: Refactor page copy and layout**

Use `ClientPageHeader` description:

```tsx
"Suivez vos rappels FRILO et vos échéances personnelles: renouvellement, paiement, obligations et relances."
```

- [ ] **Step 2: Render deadlines in compact rows**

System deadlines must show `FRILO` badge. Personal deadlines keep edit/delete actions.

- [ ] **Step 3: Run typecheck and commit**

Run:

```bash
docker compose exec frontend npm run typecheck
git add frontend/app/dashboard/echeances/page.tsx
git commit -m "feat(client): clarify deadlines page"
```

---

## Task 8: Orders Page Alignment

**Files:**
- Modify: `frontend/app/dashboard/orders/page.tsx`

- [ ] **Step 1: Replace page header and list panel**

Use shared `ClientPage`, `ClientPageHeader`, `ClientPanel`, `ClientPanelHeader`, `CompactRow`, `StatusPill`, `ClientButton`.

- [ ] **Step 2: Keep filters but make them compact**

Keep the existing `filterOptions`, `activeFilter`, and API filtering. Restyle filter buttons as compact square-rounded buttons, not pills if they cause horizontal scroll on mobile.

- [ ] **Step 3: Run typecheck and commit**

Run:

```bash
docker compose exec frontend npm run typecheck
git add frontend/app/dashboard/orders/page.tsx
git commit -m "feat(client): align orders page with client console"
```

---

## Task 9: Full QA and Browser Review

**Files:**
- No new files expected unless fixing issues found during QA.

- [ ] **Step 1: Run frontend QA**

Run:

```bash
docker compose exec frontend npm run qa
```

Expected: lint, typecheck and build pass. Existing `<img>` warnings may remain if unchanged.

- [ ] **Step 2: Browser review**

Use the integrated browser and verify:
- `/dashboard`
- `/dashboard/caisse`
- `/dashboard/contacts`
- `/dashboard/echeances`
- `/dashboard/mon-site`
- `/dashboard/orders`

Expected:
- no horizontal scroll on mobile;
- add/save/cancel buttons visible;
- forms remain usable;
- overview is contextual, not a generic analytics grid;
- cards are reduced in favor of bands/lists.

- [ ] **Step 3: Commit QA fixes**

If fixes are needed:

```bash
git add frontend/app/dashboard frontend/components/dashboard
git commit -m "fix(client): polish dashboard console responsive states"
```

If no fixes are needed, do not create an empty commit.

---

## Self-Review

- Spec coverage: shell, contextual overview, site page, contacts, caisse, echeances, orders, responsive and browser QA are covered.
- No backend/API changes are planned; this matches the spec's hors scope.
- No direct component `fetch()` calls are introduced.
- The plan avoids a generic analytics grid and reduces card usage in favor of bands/lists.
- Type names and services match the current codebase: `Order`, `OrderSummary`, `businessService`, `contactsService`, `cashService`, `deadlinesService`.
