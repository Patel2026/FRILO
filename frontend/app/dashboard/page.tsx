"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Clock, CheckCircle, ArrowRight, Plus, AlertTriangle } from 'lucide-react';
import { businessService, Order } from '@/services/business.service';
import { authService, AuthUser } from '@/services/auth.service';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending:    { label: 'En attente',    dot: 'bg-amber-400' },
  processing: { label: 'En cours',      dot: 'bg-blue-400' },
  completed:  { label: 'Livré',         dot: 'bg-emerald-400' },
  cancelled:  { label: 'Annulé',        dot: 'bg-red-400' },
};

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      authService.getUser(),
      businessService.getOrders(1, 5),
    ]).then(([u, ordersRes]) => {
      if (!isMounted) return;
      setUser(u);
      setOrders(ordersRes.data);
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

  const total = orders.length;
  const inProgress = orders.filter(o => o.status === 'processing').length;
  const delivered = orders.filter(o => o.status === 'completed').length;

  return (
    <div className="p-8 max-w-4xl">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Tableau de bord</p>
        <h1 className="text-3xl font-black text-black tracking-tight">
          {loading ? 'Bonjour.' : `Bonjour${user ? `, ${user.name.split(' ')[0]}` : ''}.`}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Commandes', value: total, icon: ShoppingBag },
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
          <div className="px-6 py-16 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-6">Aucune commande pour le moment.</p>
            <Link href="/templates" className="sq-btn sq-btn-black text-sm py-3 px-6">
              Voir les modèles
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map(order => {
              const cfg = statusConfig[order.status] || { label: order.status, dot: 'bg-gray-400' };
              const name = order.instruction?.enterprise_name || order.instructions?.[0]?.enterprise_name || 'Projet sans nom';
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-black">{name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      #{String(order.id).padStart(4, '0')} · {order.template?.name} · {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-black">{order.price.toLocaleString('fr-FR')} FCFA</span>
                    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-gray-50 text-gray-600")}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                      {cfg.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-6 flex items-center gap-4">
        <Link href="/templates" className="sq-btn sq-btn-black text-sm py-3 px-6">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle commande
        </Link>
        <Link href="/contact" className="sq-btn sq-btn-outline-black text-sm py-3 px-6">
          Contacter le support
        </Link>
      </div>
    </div>
  );
}
