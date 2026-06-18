"use client";

import Link from 'next/link';
import { type MouseEventHandler, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type ClientButtonVariant = 'primary' | 'secondary' | 'ghost';
type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
type TimelineTone = 'done' | 'current' | 'waiting';

const buttonClasses: Record<ClientButtonVariant, string> = {
  primary: 'bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500',
  secondary: 'border border-neutral-200 bg-white text-black hover:border-neutral-300 hover:bg-neutral-50 disabled:text-neutral-400',
  ghost: 'text-neutral-700 hover:bg-neutral-100 hover:text-black disabled:text-neutral-400',
};

const statusClasses: Record<StatusTone, { pill: string; dot: string; band: string }> = {
  neutral: {
    pill: 'bg-neutral-100 text-neutral-700',
    dot: 'bg-neutral-400',
    band: 'border-neutral-200 bg-neutral-50 text-neutral-800',
  },
  success: {
    pill: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    band: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  },
  warning: {
    pill: 'bg-amber-50 text-amber-800',
    dot: 'bg-amber-500',
    band: 'border-amber-200 bg-amber-50 text-amber-950',
  },
  danger: {
    pill: 'bg-red-50 text-red-700',
    dot: 'bg-red-500',
    band: 'border-red-200 bg-red-50 text-red-900',
  },
  info: {
    pill: 'bg-blue-50 text-blue-700',
    dot: 'bg-blue-500',
    band: 'border-blue-200 bg-blue-50 text-blue-900',
  },
};

const timelineClasses: Record<TimelineTone, { dot: string; line: string; title: string }> = {
  done: {
    dot: 'border-black bg-black',
    line: 'bg-neutral-300',
    title: 'text-black',
  },
  current: {
    dot: 'border-black bg-white ring-4 ring-neutral-100',
    line: 'bg-neutral-200',
    title: 'text-black',
  },
  waiting: {
    dot: 'border-neutral-300 bg-white',
    line: 'bg-neutral-200',
    title: 'text-neutral-500',
  },
};

export function ClientPage({ children, className }: { children: ReactNode; className?: string }) {
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
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  meta?: string;
  className?: string;
}) {
  return (
    <header className={cn('mb-6 flex flex-col gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        {meta && <p className="mb-1 text-xs font-semibold text-neutral-500">{meta}</p>}
        <h1 className="text-2xl font-black leading-tight text-black md:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  );
}

export function ClientButton({
  children,
  href,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  className,
}: {
  children: ReactNode;
  href?: string;
  variant?: ClientButtonVariant;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}) {
  const classes = cn(
    'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-80',
    buttonClasses[variant],
    className,
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    );
  }

  if (href && disabled) {
    return (
      <span className={cn(classes, 'pointer-events-none opacity-60')} aria-disabled="true">
        {children}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    );
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
    <section className={cn('overflow-hidden rounded-lg border border-neutral-200 bg-white', className)}>
      {children}
    </section>
  );
}

export function ClientPanelHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-3 border-b border-neutral-200 px-4 py-4 md:flex-row md:items-start md:justify-between md:px-5', className)}>
      <div className="min-w-0">
        <h2 className="text-base font-bold leading-6 text-black">{title}</h2>
        {description && <p className="mt-1 text-sm leading-5 text-neutral-600">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function StatusPill({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', statusClasses[tone].pill, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', statusClasses[tone].dot)} aria-hidden="true" />
      {children}
    </span>
  );
}

export function StatusBand({
  title,
  description,
  status,
  tone = 'neutral',
  action,
  secondaryAction,
  className,
}: {
  title: string;
  description?: string;
  status?: ReactNode;
  tone?: StatusTone;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border px-4 py-3', statusClasses[tone].band, className)}>
      <div className="min-w-0">
        {status && <div className="mb-2 flex flex-wrap items-center gap-2">{status}</div>}
        <p className="text-sm font-bold">{title}</p>
        {description && <p className="mt-1 text-sm leading-5 opacity-80">{description}</p>}
        {(action || secondaryAction) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {action}
            {secondaryAction}
          </div>
        )}
      </div>
    </div>
  );
}

export function Timeline({
  items,
  className,
}: {
  items: Array<{
    title: string;
    description?: string;
    meta?: string;
    tone?: TimelineTone;
  }>;
  className?: string;
}) {
  return (
    <ol className={cn('space-y-0', className)}>
      {items.map((item, index) => {
        const tone = item.tone ?? 'waiting';
        const isLast = index === items.length - 1;

        return (
          <li
            key={`${item.title}-${index}`}
            className="relative flex gap-3 pb-5 last:pb-0"
            aria-current={tone === 'current' ? 'step' : undefined}
          >
            {!isLast && (
              <span className={cn('absolute left-[7px] top-5 h-[calc(100%-1.25rem)] w-px', timelineClasses[tone].line)} aria-hidden="true" />
            )}
            <span className={cn('mt-1 h-4 w-4 shrink-0 rounded-full border-2', timelineClasses[tone].dot)} aria-hidden="true" />
            <span className="min-w-0">
              <span className={cn('block text-sm font-bold leading-5', timelineClasses[tone].title)}>{item.title}</span>
              {item.description && <span className="mt-1 block text-sm leading-5 text-neutral-600">{item.description}</span>}
              {item.meta && <span className="mt-1 block text-xs font-medium text-neutral-500">{item.meta}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function CompactRow({
  title,
  description,
  meta,
  href,
  action,
  className,
}: {
  title: string;
  description?: string;
  meta?: ReactNode;
  href?: string;
  action?: ReactNode;
  className?: string;
}) {
  const textContent = (
    <span className="min-w-0">
      <span className="block truncate text-sm font-bold text-black">{title}</span>
      {description && <span className="mt-1 block text-sm leading-5 text-neutral-600">{description}</span>}
      {meta && <span className="mt-1 block text-xs font-medium text-neutral-500">{meta}</span>}
    </span>
  );

  const trailingContent = (
    <span className="flex shrink-0 items-center gap-2">
      {action}
      {href && <ArrowRight className="h-4 w-4 text-neutral-400" aria-hidden="true" />}
    </span>
  );

  const rowClasses = cn(
    'flex w-full items-center justify-between gap-4 border-b border-neutral-100 px-4 py-3 text-left last:border-b-0 md:px-5',
    className,
  );

  if (href) {
    return (
      <div className={rowClasses}>
        <Link href={href} className="min-w-0 flex-1 transition-colors hover:text-neutral-700">
          {textContent}
        </Link>
        {trailingContent}
      </div>
    );
  }

  return (
    <div className={rowClasses}>
      {textContent}
      {trailingContent}
    </div>
  );
}
