"use client"

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Clock, CheckCircle, ArrowRight, AlertTriangle, Sparkles, LifeBuoy, CreditCard, PackageCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
  icon: LucideIcon;
};

function getNextStep(order: Order | null): NextStep {
  if (!order) {
    return {
      title: 'Démarrer votre première commande',
      description: 'Choisissez un modèle adapté à votre activité pour lancer votre présence en ligne.',
      ctaLabel: 'Comparer les modèles',
      ctaHref: '/templates/compare',
      icon: Sparkles,
    };
  }

  if (order.payment_status !== 'paid') {
    return {
      title: 'Finaliser le paiement',
      description: 'Votre commande est prête. Confirmez le paiement pour que l’équipe démarre la production.',
      ctaLabel: 'Payer maintenant',
      ctaHref: `/dashboard/orders/${order.id}`,
      icon: CreditCard,
    };
  }

  if (order.status === 'pending') {
    return {
      title: 'Commande en attente de traitement',
      description: 'Votre paiement est validé. Notre équipe confirme la prise en charge sous 2h ouvrées.',
      ctaLabel: 'Suivre la commande',
      ctaHref: `/dashboard/orders/${order.id}`,
      icon: Clock,
    };
  }

  if (order.status === 'processing') {
    return {
      title: 'Commande en production',
      description: 'Votre site est en cours de finalisation. Vous pouvez suivre l’évolution en temps réel.',
      ctaLabel: 'Voir l’avancement',
      ctaHref: `/dashboard/orders/${order.id}`,
      icon: PackageCheck,
    };
  }

  return {
    title: 'Commande livrée',
    description: 'Votre dernière commande est terminée. Vous pouvez en lancer une nouvelle quand vous voulez.',
    ctaLabel: 'Nouvelle commande',
    ctaHref: '/templates',
    icon: CheckCircle,
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

    Promise.all([
      authService.getUser(),
      businessService.getOrders(1, 5),
      businessService.getOrderSummary(),
      businessService.getTemplates(),
    ]).then(([u, ordersRes, summaryRes, templatesRes]) => {
      if (!isMounted) return;
      setUser(u);
      setOrders(ordersRes.data);
      setSummary(summaryRes);

      const preferredSectorId = u?.sector_id ?? null;
      const sectorTemplates = preferredSectorId
        ? templatesRes.filter((template) => template.sector_id === preferredSectorId)
        : [];
      const suggestedTemplates = sectorTemplates.length > 0 ? sectorTemplates : templatesRes;

      setFeaturedTemplates(suggestedTemplates.slice(0, 3));
    }).catch(() => {
      if (!isMounted) return;
      setError('Impossible de charger votre tableau de bord pour le moment.');
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
  const NextStepIcon = nextStep.icon;
  const backlogHint = pending > 0
    ? `${pending} commande${pending > 1 ? 's' : ''} en attente de traitement`
    : 'Aucune commande en attente actuellement';

  return (
    <div className="p-4 md:p-8 max-w-6xl">

      {/* Header */}
      <div className="mb-8 md:mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Tableau de bord</p>
        <h1 className="text-3xl font-black text-black tracking-tight">
          {loading ? 'Bonjour.' : `Bonjour, ${firstName}.`}
        </h1>
        <p className="text-sm text-gray-500 mt-3">
          Suivez vos commandes, lancez vos prochaines actions et contactez rapidement l’équipe FRILO.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Commandes', value: total, icon: ShoppingBag },
          { label: 'En attente', value: pending, icon: Clock },
          { label: 'En cours', value: inProgress, icon: Clock },
          { label: 'Livrées', value: delivered, icon: CheckCircle },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
              <Icon className="w-4 h-4 text-gray-300" />
            </div>
            <p className="text-4xl font-black text-black tracking-tight">
              {loading ? '—' : value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Progression globale</p>
          <p className="text-sm font-semibold text-black">{completionRate}% livré</p>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-black transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-3">{backlogHint}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <p className="text-sm font-bold text-black">Commandes récentes</p>
            <Link
              href="/dashboard/orders"
              className="text-xs font-semibold text-gray-400 hover:text-black transition-colors flex items-center gap-1"
            >
              Tout voir <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-6 py-5 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-6 py-16 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-5">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setReloadKey(v => v + 1);
                }}
                className="sq-btn sq-btn-black text-sm py-3 px-6"
              >
                Réessayer
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-10">
              <div className="text-center pb-8 border-b border-gray-100">
                <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-5">Aucune commande pour le moment.</p>
                <Link href="/templates" className="sq-btn sq-btn-black text-sm py-3 px-6">
                  Voir les modèles
                </Link>
              </div>

              {featuredTemplates.length > 0 && (
                <div className="pt-7">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                    {user?.sector?.name ? `Suggestions pour ${user.sector.name}` : 'Suggestions de modèles'}
                  </p>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {featuredTemplates.map(template => (
                      <Link
                        key={template.id}
                        href={`/templates/${template.id}`}
                        className="rounded-xl border border-gray-100 p-4 hover:border-black/20 hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-sm font-semibold text-black">{template.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {template.sector?.name || 'Secteur'} · {template.price.toLocaleString('fr-FR')} FCFA
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map(order => {
                const cfg = statusConfig[order.status] || { label: order.status, dot: 'bg-gray-400', classes: 'bg-gray-50 text-gray-600' };
                const payment = paymentConfig[order.payment_status] || { label: order.payment_status, classes: 'bg-gray-50 text-gray-600' };
                const name = order.instruction?.enterprise_name || order.instructions?.[0]?.enterprise_name || 'Projet sans nom';

                return (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-black">{name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
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
                    <span className="text-sm font-black text-black">{order.price.toLocaleString('fr-FR')} FCFA</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <NextStepIcon className="w-4 h-4 text-gray-400" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Prochaine étape</p>
            </div>
            <h2 className="text-lg font-black text-black tracking-tight">{nextStep.title}</h2>
            <p className="text-sm text-gray-500 mt-2">{nextStep.description}</p>
            <Link href={nextStep.ctaHref} className="sq-btn sq-btn-black text-sm py-2.5 px-4 mt-5 inline-flex">
              {nextStep.ctaLabel}
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Actions rapides</p>
            <div className="space-y-2">
              {total > 0 ? (
                <Link href="/templates" className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors">
                  <span>Lancer une nouvelle commande</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              ) : (
                <Link href="/templates/compare" className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors">
                  <span>Comparer les modèles</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              )}
              <Link href="/dashboard/orders" className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors">
                <span>Voir toutes mes commandes</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link href="/dashboard/profile" className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 text-sm text-black hover:bg-gray-50 transition-colors">
                <span>Mettre à jour mon profil</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-black text-white p-6">
            <div className="flex items-center gap-2 mb-3">
              <LifeBuoy className="w-4 h-4 text-white/70" />
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">Support</p>
            </div>
            <p className="text-sm text-white/80">
              Besoin d’aide sur une commande en cours ? Notre équipe support vous répond rapidement.
            </p>
            <Link href="/contact" className="inline-flex mt-5 rounded-xl bg-white text-black text-sm font-semibold px-4 py-2.5 hover:bg-gray-100 transition-colors">
              Contacter le support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
