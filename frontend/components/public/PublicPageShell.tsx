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
          <h1 className="max-w-5xl text-balance text-[clamp(2.8rem,6vw,5.75rem)] font-black leading-[0.95]">
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
          <div
            key={item.title}
            className="border-b border-black py-5 md:border-b-0 md:border-r md:px-6 md:last:border-r-0"
          >
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
          <h2 className="max-w-3xl text-balance text-4xl font-black leading-[0.98] md:text-5xl">
            {title}
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-black/62">
            {description}
          </p>
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
          <h2 className="max-w-3xl text-balance text-3xl font-black leading-tight md:text-4xl">
            {title}
          </h2>
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
