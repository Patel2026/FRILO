"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { businessService, Order, PaginatedResponse } from '@/services/business.service';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending:    { label: 'En attente',    classes: 'bg-amber-50 text-amber-700',    dot: 'bg-amber-400' },
  processing: { label: 'En cours',      classes: 'bg-blue-50 text-blue-700',      dot: 'bg-blue-400' },
  completed:  { label: 'Livré',         classes: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400' },
  cancelled:  { label: 'Annulé',        classes: 'bg-red-50 text-red-700',        dot: 'bg-red-400' },
};

export default function OrdersPage() {
  const [result, setResult] = useState<PaginatedResponse<Order> | null>(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // loading stays true only for the initial fetch; pagination swaps data silently
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    businessService.getOrders(page, 10)
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
  }, [page, reloadKey]);

  const orders = result?.data ?? [];
  const meta = result?.meta;

  return (
    <div className="p-8 max-w-4xl">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Tableau de bord</p>
        <h1 className="text-3xl font-black text-black tracking-tight">Mes commandes</h1>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

        {/* Column headers */}
        <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Projet</p>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Prix</p>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Date</p>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Statut</p>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-5 flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="px-6 py-20 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-6">{error}</p>
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
          <div className="px-6 py-20 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-6">Aucune commande pour le moment.</p>
            <Link href="/templates" className="sq-btn sq-btn-black text-sm py-3 px-6">
              Commander un modèle
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map(order => {
              const cfg = statusConfig[order.status] || { label: order.status, classes: 'bg-gray-50 text-gray-600', dot: 'bg-gray-400' };
              const name = order.instruction?.enterprise_name || order.instructions?.[0]?.enterprise_name || 'Projet sans nom';
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="px-6 py-5 grid md:grid-cols-[1fr_auto_auto_auto] grid-cols-1 gap-4 items-center hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-black">{name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      #{String(order.id).padStart(4, '0')}
                      {order.template?.name && ` · ${order.template.name}`}
                      {order.template?.sector?.name && ` · ${order.template.sector.name}`}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-black md:text-right">
                    {order.price.toLocaleString('fr-FR')} FCFA
                  </p>
                  <p className="text-xs text-gray-400 md:text-right">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="md:flex md:justify-end">
                    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full", cfg.classes)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)} />
                      {cfg.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
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
                className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setPage(p => Math.min(meta.last_page, p + 1));
                }}
                disabled={meta.current_page === meta.last_page}
                className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link href="/templates" className="sq-btn sq-btn-black text-sm py-3 px-6">
          Commander un nouveau modèle
        </Link>
      </div>
    </div>
  );
}
