"use client"

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, Clock3, CreditCard, PackageCheck } from 'lucide-react';
import { businessService, Order, OrderSummary, Template } from '@/services/business.service';
import { authService, AuthUser } from '@/services/auth.service';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: { label: 'En attente', dot: 'bg-amber-400', classes: 'bg-amber-50 text-amber-700' },
  processing: { label: 'En cours', dot: 'bg-blue-400', classes: 'bg-blue-50 text-blue-700' },
  completed: { label: 'Livré', dot: 'bg-emerald-400', classes: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Annulé', dot: 'bg-red-400', classes: 'bg-red-50 text-red-700' },
};

const paymentConfig = {
  awaiting_payment: { label: 'Paiement en attente', classes: 'bg-amber-50 text-amber-700' },
  paid: { label: 'Payée', classes: 'bg-emerald-50 text-emerald-700' },
  failed: { label: 'Paiement échoué', classes: 'bg-red-50 text-red-700' },
  cancelled: { label: 'Paiement annulé', classes: 'bg-gray-100 text-gray-700' },
  refunded: { label: 'Remboursée', classes: 'bg-sky-50 text-sky-700' },
  expired: { label: 'Paiement expiré', classes: 'bg-slate-100 text-slate-700' },
};

type NextStep = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

function getNextStep(order: Order | null): NextStep {
  if (!order) {
    return {
      title: 'Démarrer votre première commande',
      description: 'Choisissez un modèle adapté à votre activité pour lancer votre présence en ligne.',
      ctaLabel: 'Comparer les modèles',
      ctaHref: '/templates/compare',
    };
  }

  if (order.payment_status !== 'paid') {
    return {
      title: 'Finaliser le paiement',
      description: 'Votre commande est prête. Confirmez le paiement pour que l’équipe démarre la production.',
      ctaLabel: 'Payer maintenant',
      ctaHref: `/dashboard/orders/${order.id}`,
    };
  }

  if (order.status === 'pending') {
    return {
      title: 'Commande en attente de traitement',
      description: 'Votre paiement est validé. Notre équipe confirme la prise en charge sous 2h ouvrées.',
      ctaLabel: 'Suivre la commande',
      ctaHref: `/dashboard/orders/${order.id}`,
    };
  }

  if (order.status === 'processing') {
    return {
      title: 'Commande en production',
      description: 'Votre site est en cours de finalisation. Vous pouvez suivre l’évolution en temps réel.',
      ctaLabel: 'Voir l’avancement',
      ctaHref: `/dashboard/orders/${order.id}`,
    };
  }

  return {
    title: 'Commande livrée',
    description: 'Votre dernière commande est terminée. Vous pouvez en lancer une nouvelle quand vous voulez.',
    ctaLabel: 'Nouvelle commande',
    ctaHref: '/templates',
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<Template[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      authService.getUser(),
      businessService.getOrders(1, 3),
      businessService.getOrderSummary(),
      businessService.getTemplates(),
    ]).then(([userResult, ordersResult, summaryResult, templatesResult]) => {
      if (!isMounted) return;
      const hasCriticalFailure = userResult.status === 'rejected' || ordersResult.status === 'rejected';

      if (hasCriticalFailure) {
        setError('Impossible de charger votre tableau de bord pour le moment.');
        return;
      }

      const u = userResult.value;
      const ordersRes = ordersResult.value;
      const summaryRes = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
      const templatesRes = templatesResult.status === 'fulfilled' ? templatesResult.value : [];

      setUser(u);
      setOrders(ordersRes.data);
      setSummary(summaryRes);

      const preferredSectorId = u?.sector_id ?? null;
      const sectorTemplates = preferredSectorId
        ? templatesRes.filter((template) => template.sector_id === preferredSectorId)
        : [];
      const suggestedTemplates = sectorTemplates.length > 0 ? sectorTemplates : templatesRes;

      setFeaturedTemplates(suggestedTemplates.slice(0, 3));
    }).finally(() => {
      if (!isMounted) return;
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const total = summary?.total ?? 0;
  const pending = summary?.pending ?? 0;
  const inProgress = summary?.processing ?? 0;
  const delivered = summary?.completed ?? 0;
  const completionRate = total > 0 ? Math.round((delivered / total) * 100) : 0;
  const firstName = user?.name.split(' ')[0] ?? 'Client';
  const latestOrder = orders[0] ?? null;
  const nextStep = useMemo(() => getNextStep(latestOrder), [latestOrder]);
  const backlogHint = pending > 0
    ? `${pending} commande${pending > 1 ? 's' : ''} en attente de traitement`
    : 'Aucune commande en attente actuellement';
  const quickLinks = total > 0
    ? [
        { label: 'Nouvelle commande', href: '/templates' },
        { label: 'Toutes mes commandes', href: '/dashboard/orders' },
        { label: 'Profil', href: '/dashboard/profile' },
        { label: 'Support', href: '/contact' },
      ]
    : [
        { label: 'Comparer les modèles', href: '/templates/compare' },
        { label: 'Voir les modèles', href: '/templates' },
        { label: 'Profil', href: '/dashboard/profile' },
        { label: 'Support', href: '/contact' },
      ];

  return (
    <div className="w-full max-w-[1180px] px-4 py-5 md:px-7 md:py-7">
      <section className="border-b border-neutral-200 pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400">Espace client</p>
            <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-neutral-950 md:text-4xl">
              {loading ? 'Bonjour.' : `Bonjour, ${firstName}.`}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-500">
              {nextStep.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={nextStep.ctaHref}
              className="inline-flex items-center justify-center rounded-full bg-[oklch(55%_0.23_29)] px-5 py-3 text-sm font-black text-[oklch(99%_0.004_95)] transition-colors hover:bg-[oklch(48%_0.22_29)]"
            >
              {nextStep.ctaLabel}
            </Link>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-3 text-sm font-black text-neutral-700 transition-colors hover:border-neutral-950 hover:text-neutral-950"
            >
              Voir les commandes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 border-b border-neutral-200 py-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="rounded-2xl border border-neutral-200 bg-[oklch(99%_0.004_95)] p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-neutral-950 text-[oklch(99%_0.004_95)]">
              {latestOrder?.payment_status !== 'paid' ? <CreditCard className="h-5 w-5" /> : <PackageCheck className="h-5 w-5" />}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400">Prochaine étape</p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-neutral-950">{nextStep.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">{nextStep.description}</p>
              {latestOrder && (
                <p className="mt-3 text-xs font-semibold text-neutral-400">
                  Commande #{String(latestOrder.id).padStart(4, '0')}
                  {latestOrder.template?.name && ` · ${latestOrder.template.name}`}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-neutral-200 bg-[oklch(99%_0.004_95)]">
          {[
            { label: 'Commandes', value: total },
            { label: 'À traiter', value: pending },
            { label: 'En production', value: inProgress },
            { label: 'Livrées', value: delivered },
          ].map(({ label, value }, index) => (
            <div
              key={label}
              className={cn(
                "p-4",
                index % 2 === 0 && "border-r border-neutral-100",
                index < 2 && "border-b border-neutral-100"
              )}
            >
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-400">{label}</p>
              <p className="mt-2 text-2xl font-black tracking-tight text-neutral-950">{loading ? '...' : value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 border-b border-neutral-200 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {quickLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-950">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Clock3 className="h-4 w-4 text-neutral-400" />
          <p className="text-xs font-semibold text-neutral-500">{backlogHint}</p>
          <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-neutral-200 sm:block">
            <div
              className="h-full rounded-full bg-neutral-950"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Commandes récentes</p>
            <p className="mt-1 text-sm text-neutral-500">Les derniers dossiers visibles côté client.</p>
          </div>
          <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm font-black text-neutral-950">
            Tout voir <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-[oklch(99%_0.004_95)]">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4">
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-neutral-100 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-neutral-100 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-20 bg-neutral-100 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-6 py-8 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-sm text-neutral-500 mb-5">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setReloadKey(v => v + 1);
                }}
                className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-black text-[oklch(99%_0.004_95)]"
              >
                Réessayer
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="px-5 py-6">
              <div className="border-b border-neutral-100 pb-6">
                <p className="text-lg font-black text-neutral-950">Aucune commande pour le moment.</p>
                <p className="mt-2 max-w-xl text-sm text-neutral-500">Choisissez un modèle, FRILO l’adapte ensuite à votre activité.</p>
                <Link href="/templates" className="mt-4 inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-black text-[oklch(99%_0.004_95)]">
                  Voir les modèles
                </Link>
              </div>

              {featuredTemplates.length > 0 && (
                <div className="pt-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-400">
                    {user?.sector?.name ? `Suggestions pour ${user.sector.name}` : 'Suggestions de modèles'}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {featuredTemplates.map(template => (
                      <Link
                        key={template.id}
                        href={`/templates/${template.id}`}
                        className="rounded-xl border border-neutral-100 p-4 hover:border-neutral-950/20 hover:bg-neutral-50 transition-colors"
                      >
                        <p className="text-sm font-semibold text-neutral-950">{template.name}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {template.sector?.name || 'Secteur'} · {template.price.toLocaleString('fr-FR')} FCFA
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {orders.map(order => {
                const cfg = statusConfig[order.status] || { label: order.status, dot: 'bg-gray-400', classes: 'bg-gray-50 text-gray-600' };
                const payment = paymentConfig[order.payment_status] || { label: order.payment_status, classes: 'bg-gray-50 text-gray-600' };
                const name = order.instruction?.enterprise_name || order.instructions?.[0]?.enterprise_name || 'Projet sans nom';

                return (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="grid gap-3 px-5 py-4 transition-colors hover:bg-neutral-50 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-neutral-950">{name}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        #{String(order.id).padStart(4, '0')}
                        {order.template?.name && ` · ${order.template.name}`}
                        {order.created_at && ` · ${new Date(order.created_at).toLocaleDateString('fr-FR')}`}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full", cfg.classes)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                          {cfg.label}
                        </span>
                        <span className={cn("inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full", payment.classes)}>
                          {payment.label}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-neutral-950">{order.price.toLocaleString('fr-FR')} FCFA</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
