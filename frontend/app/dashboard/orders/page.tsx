"use client"

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ClientButton,
  ClientPage,
  ClientPageHeader,
  ClientPanel,
  ClientPanelHeader,
  CompactRow,
  StatusBand,
  StatusPill,
} from '@/components/dashboard/client-ui';
import { businessService, Order, OrderListFilters, PaginatedResponse } from '@/services/business.service';

type StatusTone = NonNullable<Parameters<typeof StatusPill>[0]['tone']>;

const statusConfig: Record<Order['status'], { label: string; tone: StatusTone }> = {
  pending: { label: 'En attente', tone: 'warning' },
  processing: { label: 'En cours', tone: 'info' },
  completed: { label: 'Livré', tone: 'success' },
  cancelled: { label: 'Annulé', tone: 'danger' },
};

const paymentConfig: Record<Order['payment_status'], { label: string; tone: StatusTone }> = {
  awaiting_payment: { label: 'Paiement en attente', tone: 'warning' },
  paid: { label: 'Payée', tone: 'success' },
  failed: { label: 'Paiement échoué', tone: 'danger' },
  cancelled: { label: 'Paiement annulé', tone: 'neutral' },
  refunded: { label: 'Remboursée', tone: 'info' },
  expired: { label: 'Paiement expiré', tone: 'neutral' },
};

type OrderFilterKey = 'all' | 'to_pay' | 'production' | 'delivered' | 'cancelled';

const filterOptions: Array<{ key: OrderFilterKey; label: string; filters: OrderListFilters }> = [
  { key: 'all', label: 'Toutes', filters: {} },
  { key: 'to_pay', label: 'À payer', filters: { payment_status: 'awaiting_payment' } },
  { key: 'production', label: 'En production', filters: { status: 'processing' } },
  { key: 'delivered', label: 'Livrées', filters: { status: 'completed' } },
  { key: 'cancelled', label: 'Annulées', filters: { status: 'cancelled' } },
];

function getOrderName(order: Order): string {
  return order.instruction?.enterprise_name
    || order.instructions?.[0]?.enterprise_name
    || order.template?.name
    || 'Projet sans nom';
}

function formatOrderId(order: Order): string {
  return `Commande #${String(order.id).padStart(4, '0')}`;
}

function formatDate(value?: string | null): string {
  if (!value) return 'Date indisponible';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date indisponible';

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatPrice(value: number): string {
  return `${value.toLocaleString('fr-FR')} FCFA`;
}

function getOrderDescription(order: Order): string {
  return [
    formatDate(order.created_at),
    formatOrderId(order),
    order.template?.name,
    order.template?.sector?.name,
  ].filter(Boolean).join(' · ');
}

function LoadingRows() {
  return (
    <div>
      {[...Array(4)].map((_, index) => (
        <CompactRow
          key={index}
          title="Chargement"
          description="Synchronisation du dossier client"
          meta={
            <span className="flex flex-wrap items-center gap-2">
              <span className="h-6 w-24 animate-pulse rounded-full bg-neutral-100" />
              <span className="h-6 w-32 animate-pulse rounded-full bg-neutral-100" />
            </span>
          }
          action={<span className="h-4 w-20 animate-pulse rounded bg-neutral-100" />}
          className="pointer-events-none text-transparent"
        />
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const [result, setResult] = useState<PaginatedResponse<Order> | null>(null);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<OrderFilterKey>('all');
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);
  const selectedFilter = filterOptions.find(option => option.key === activeFilter) ?? filterOptions[0];

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    let isActive = true;
    requestIdRef.current = requestId;
    setLoading(true);
    setError(null);

    businessService.getOrders(page, 10, selectedFilter.filters)
      .then((response) => {
        if (!isActive || requestIdRef.current !== requestId) return;
        setResult(response);
        setError(null);
      })
      .catch(() => {
        if (!isActive || requestIdRef.current !== requestId) return;
        setResult(null);
        setError('Impossible de charger vos commandes pour le moment.');
      })
      .finally(() => {
        if (!isActive || requestIdRef.current !== requestId) return;
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [page, reloadKey, selectedFilter]);

  const orders = result?.data ?? [];
  const meta = result?.meta;
  const totalOrders = meta?.total ?? orders.length;

  return (
    <ClientPage>
      <ClientPageHeader
        title="Mes commandes"
        description="Retrouvez le statut, le paiement et le prochain point d’attention de chaque dossier."
        meta="Espace client"
        action={<ClientButton href="/templates">Nouvelle commande</ClientButton>}
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => {
            const isActive = option.key === activeFilter;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  setPage(1);
                  setActiveFilter(option.key);
                }}
                className={[
                  'h-9 rounded-md border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70',
                  isActive
                    ? 'border-black bg-black text-white'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 hover:text-black',
                ].join(' ')}
                aria-pressed={isActive}
                disabled={loading && isActive}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <StatusPill tone={loading ? 'info' : 'neutral'}>
          {loading ? 'Chargement' : `${totalOrders} commande${totalOrders > 1 ? 's' : ''}`}
        </StatusPill>
      </div>

      {loading ? (
        <ClientPanel>
          <ClientPanelHeader
            title="Chargement des commandes"
            description="Nous récupérons les dossiers correspondant au filtre sélectionné."
            action={<StatusPill tone="info">Chargement</StatusPill>}
          />
          <LoadingRows />
        </ClientPanel>
      ) : error ? (
        <ClientPanel>
          <div className="px-4 py-5 md:px-5">
            <StatusBand
              title="Impossible de charger les commandes"
              description={error}
              tone="danger"
              status={<StatusPill tone="danger">Erreur</StatusPill>}
              action={
                <ClientButton
                  onClick={() => {
                    setError(null);
                    setReloadKey(value => value + 1);
                  }}
                >
                  Réessayer
                </ClientButton>
              }
            />
          </div>
        </ClientPanel>
      ) : orders.length === 0 ? (
        <ClientPanel>
          <ClientPanelHeader
            title={activeFilter === 'all' ? 'Aucune commande pour le moment' : 'Aucune commande dans ce filtre'}
            description={
              activeFilter === 'all'
                ? 'Choisissez un modèle, transmettez vos informations, puis suivez la production depuis cet espace.'
                : 'Essayez un autre filtre ou revenez à toutes vos commandes.'
            }
            action={
              activeFilter === 'all' ? (
                <ClientButton href="/templates">Commander un modèle</ClientButton>
              ) : (
                <ClientButton
                  variant="secondary"
                  onClick={() => {
                    setPage(1);
                    setActiveFilter('all');
                  }}
                >
                  Voir toutes les commandes
                </ClientButton>
              )
            }
          />
        </ClientPanel>
      ) : (
        <ClientPanel>
          <ClientPanelHeader
            title="Commandes"
            description="Dossiers FRILO classés selon le filtre actif."
            action={<StatusPill tone="neutral">{totalOrders} commande{totalOrders > 1 ? 's' : ''}</StatusPill>}
          />
          <div>
            {orders.map(order => {
              const status = statusConfig[order.status] ?? { label: order.status, tone: 'neutral' as StatusTone };
              const payment = paymentConfig[order.payment_status] ?? { label: order.payment_status, tone: 'neutral' as StatusTone };

              return (
                <CompactRow
                  key={order.id}
                  title={getOrderName(order)}
                  description={getOrderDescription(order)}
                  meta={
                    <span className="flex flex-wrap items-center gap-2">
                      <StatusPill tone={status.tone}>{status.label}</StatusPill>
                      <StatusPill tone={payment.tone}>{payment.label}</StatusPill>
                    </span>
                  }
                  href={`/dashboard/orders/${order.id}`}
                  action={<span className="text-sm font-black text-black">{formatPrice(order.price)}</span>}
                />
              );
            })}
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex flex-col gap-3 border-t border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
              <p className="text-xs font-medium text-neutral-500">
                Page {meta.current_page} sur {meta.last_page} · {meta.total} commande{meta.total > 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(value => Math.max(1, value - 1))}
                  disabled={loading || meta.current_page === 1}
                  aria-label="Page précédente"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(value => Math.min(meta.last_page, value + 1))}
                  disabled={loading || meta.current_page === meta.last_page}
                  aria-label="Page suivante"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </ClientPanel>
      )}
    </ClientPage>
  );
}
