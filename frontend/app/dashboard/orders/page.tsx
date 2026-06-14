"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { businessService, Order, OrderListFilters, PaginatedResponse } from '@/services/business.service';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: { label: 'En attente', classes: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400' },
  processing: { label: 'En cours', classes: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
  completed: { label: 'Livré', classes: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400' },
  cancelled: { label: 'Annulé', classes: 'bg-red-50 text-red-700', dot: 'bg-red-400' },
};

const paymentConfig = {
  awaiting_payment: { label: 'Paiement en attente', classes: 'bg-amber-50 text-amber-700' },
  paid: { label: 'Payée', classes: 'bg-emerald-50 text-emerald-700' },
  failed: { label: 'Paiement échoué', classes: 'bg-red-50 text-red-700' },
  cancelled: { label: 'Paiement annulé', classes: 'bg-gray-100 text-gray-700' },
  refunded: { label: 'Remboursée', classes: 'bg-sky-50 text-sky-700' },
  expired: { label: 'Paiement expiré', classes: 'bg-slate-100 text-slate-700' },
};

type OrderFilterKey = 'all' | 'to_pay' | 'production' | 'delivered' | 'cancelled';

const filterOptions: Array<{ key: OrderFilterKey; label: string; filters: OrderListFilters }> = [
  { key: 'all', label: 'Toutes', filters: {} },
  { key: 'to_pay', label: 'À payer', filters: { payment_status: 'awaiting_payment' } },
  { key: 'production', label: 'En production', filters: { status: 'processing' } },
  { key: 'delivered', label: 'Livrées', filters: { status: 'completed' } },
  { key: 'cancelled', label: 'Annulées', filters: { status: 'cancelled' } },
];

export default function OrdersPage() {
  const [result, setResult] = useState<PaginatedResponse<Order> | null>(null);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<OrderFilterKey>('all');
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const selectedFilter = filterOptions.find(option => option.key === activeFilter) ?? filterOptions[0];

  useEffect(() => {
    let isMounted = true;

    businessService.getOrders(page, 10, selectedFilter.filters)
      .then((response) => {
        if (!isMounted) return;
        setResult(response);
      })
      .catch(() => {
        if (!isMounted) return;
        setResult(null);
        setError('Impossible de charger vos commandes pour le moment.');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, reloadKey, selectedFilter]);

  const orders = result?.data ?? [];
  const meta = result?.meta;
  const totalOrders = meta?.total ?? orders.length;

  return (
    <div className="w-full max-w-[1180px] px-4 py-5 md:px-7 md:py-7">
      <div className="mb-5 flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-400">Espace client</p>
          <h1 className="text-3xl font-black tracking-tight text-neutral-950">Mes commandes</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Retrouvez le statut, le paiement et le prochain point d’attention de chaque dossier.
          </p>
        </div>
        <Link href="/templates" className="inline-flex w-full items-center justify-center rounded-full bg-[oklch(55%_0.23_29)] px-5 py-3 text-sm font-black text-[oklch(99%_0.004_95)] transition-colors hover:bg-[oklch(48%_0.22_29)] sm:w-auto">
          Nouvelle commande
        </Link>
      </div>

      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          {loading ? 'Chargement' : `${totalOrders} commande${totalOrders > 1 ? 's' : ''}`}
        </p>
        <Link href="/dashboard" className="text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-950">
          Vue d'ensemble
        </Link>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {filterOptions.map(option => {
          const isActive = option.key === activeFilter;

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                setError(null);
                setLoading(true);
                setPage(1);
                setActiveFilter(option.key);
              }}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-black transition-colors",
                isActive
                  ? "border-neutral-950 bg-neutral-950 text-[oklch(99%_0.004_95)]"
                  : "border-neutral-200 bg-[oklch(99%_0.004_95)] text-neutral-500 hover:border-neutral-950 hover:text-neutral-950"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-[oklch(99%_0.004_95)]">
        {loading ? (
          <div className="divide-y divide-neutral-100">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-5">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-neutral-100" />
                  <div className="h-3 w-32 animate-pulse rounded bg-neutral-100" />
                </div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-400" />
            <p className="mb-6 text-sm text-neutral-500">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setLoading(true);
                setReloadKey(v => v + 1);
              }}
              className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-black text-[oklch(99%_0.004_95)] transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="px-5 py-12">
            <p className="text-xl font-black text-neutral-950">
              {activeFilter === 'all' ? 'Aucune commande pour le moment.' : 'Aucune commande dans ce filtre.'}
            </p>
            <p className="mt-2 max-w-xl text-sm text-neutral-500">
              {activeFilter === 'all'
                ? 'Choisissez un modèle, transmettez vos informations, puis suivez la production depuis cet espace.'
                : 'Essayez un autre filtre ou revenez à toutes vos commandes.'}
            </p>
            {activeFilter === 'all' ? (
              <Link href="/templates" className="mt-6 inline-flex items-center justify-center rounded-full bg-[oklch(55%_0.23_29)] px-6 py-3 text-sm font-black text-[oklch(99%_0.004_95)] transition-colors hover:bg-[oklch(48%_0.22_29)]">
                Commander un modèle
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setPage(1);
                  setActiveFilter('all');
                }}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-black text-[oklch(99%_0.004_95)]"
              >
                Voir toutes les commandes
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {orders.map(order => {
              const cfg = statusConfig[order.status] || { label: order.status, classes: 'bg-gray-50 text-gray-600', dot: 'bg-gray-400' };
              const payment = paymentConfig[order.payment_status] || { label: order.payment_status, classes: 'bg-gray-50 text-gray-600' };
              const name = order.instruction?.enterprise_name || order.instructions?.[0]?.enterprise_name || 'Projet sans nom';

              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="grid gap-4 px-5 py-5 transition-colors hover:bg-neutral-50 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-base font-black text-neutral-950">{name}</p>
                      <p className="text-xs font-semibold text-neutral-400">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-neutral-400">
                      #{String(order.id).padStart(4, '0')}
                      {order.template?.name && ` · ${order.template.name}`}
                      {order.template?.sector?.name && ` · ${order.template.sector.name}`}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", cfg.classes)}>
                        <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", cfg.dot)} />
                        {cfg.label}
                      </span>
                      <span className={cn("inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold", payment.classes)}>
                        {payment.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <p className="text-sm font-black text-neutral-950">{order.price.toLocaleString('fr-FR')} FCFA</p>
                    <ArrowRight className="h-4 w-4 text-neutral-300" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-4">
            <p className="text-xs text-neutral-400">
              Page {meta.current_page} sur {meta.last_page} · {meta.total} commande{meta.total > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setPage(p => Math.max(1, p - 1));
                }}
                disabled={meta.current_page === 1}
                className="rounded-lg border border-neutral-200 p-2 text-neutral-400 transition-colors hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setPage(p => Math.min(meta.last_page, p + 1));
                }}
                disabled={meta.current_page === meta.last_page}
                className="rounded-lg border border-neutral-200 p-2 text-neutral-400 transition-colors hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {!loading && !error && orders.length > 0 && (
        <p className="mt-4 text-sm text-neutral-500">
          Besoin d'un autre site ? <Link href="/templates" className="font-black text-neutral-950 underline underline-offset-4">Choisir un modèle</Link>.
        </p>
      )}
    </div>
  );
}
