"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, Bell, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { notificationsService, NotificationItem, NotificationListResponse } from '@/services/notifications.service';

function formatDate(value: string | null): string {
  if (!value) return 'À l’instant';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'À l’instant';

  return date.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function notificationTone(type: string) {
  if (type.includes('payment')) return 'Paiement';
  if (type.includes('order')) return 'Commande';
  if (type.includes('review')) return 'Avis';
  return 'Information';
}

export default function NotificationsPage() {
  const [result, setResult] = useState<NotificationListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    notificationsService.getNotifications(page, 20)
      .then((response) => {
        if (!isMounted) return;
        setResult(response);
      })
      .catch(() => {
        if (!isMounted) return;
        setResult(null);
        setError('Impossible de charger vos notifications pour le moment.');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, reloadKey]);

  useEffect(() => {
    const refresh = async () => {
      if (document.visibilityState !== 'visible') return;

      try {
        const response = await notificationsService.getNotifications(page, 20);
        setResult(response);
      } catch {
        // Silent background refresh failure.
      }
    };

    const interval = window.setInterval(() => {
      void refresh();
    }, 15000);

    const handleVisibilityOrFocus = () => {
      void refresh();
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [page]);

  const notifications = result?.data ?? [];
  const meta = result?.meta;
  const unreadCount = result?.unread_count ?? 0;
  const total = meta?.total ?? notifications.length;

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (item.is_read || processingIds[item.id]) return;

    setProcessingIds((prev) => ({ ...prev, [item.id]: true }));
    try {
      const response = await notificationsService.markAsRead(item.id);
      setResult((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          unread_count: response.unread_count,
          data: prev.data.map((notification) => (
            notification.id === item.id ? response.notification : notification
          )),
        };
      });
    } finally {
      setProcessingIds((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    try {
      const response = await notificationsService.markAllAsRead();
      const readAt = new Date().toISOString();

      setResult((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          unread_count: response.unread_count,
          data: prev.data.map((notification) => ({
            ...notification,
            is_read: true,
            read_at: notification.read_at ?? readAt,
          })),
        };
      });
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="w-full max-w-[1180px] px-4 py-5 md:px-7 md:py-7">
      <div className="mb-5 flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-400">Espace client</p>
          <h1 className="text-3xl font-black tracking-tight text-neutral-950">Notifications</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Les mises à jour utiles sur vos commandes, paiements et échanges FRILO.
          </p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={markingAll || unreadCount === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-[oklch(99%_0.004_95)] px-5 py-3 text-sm font-black text-neutral-600 transition-colors hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
        >
          <CheckCheck className="h-4 w-4" />
          Tout marquer lu
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          {loading ? 'Chargement' : `${total} notification${total > 1 ? 's' : ''}`}
        </p>
        <p className={cn(
          "text-sm font-semibold",
          unreadCount > 0 ? "text-neutral-950" : "text-neutral-400"
        )}>
          {unreadCount > 0
            ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
            : 'Tout est lu'}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-[oklch(99%_0.004_95)]">
        {loading ? (
          <div className="divide-y divide-neutral-100 px-5">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="py-5">
                <div className="h-4 w-56 animate-pulse rounded bg-neutral-100" />
                <div className="mt-3 h-3 w-80 max-w-full animate-pulse rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="px-5 py-12">
            <AlertTriangle className="mb-3 h-10 w-10 text-amber-400" />
            <p className="mb-6 max-w-xl text-sm text-neutral-500">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setLoading(true);
                setReloadKey((value) => value + 1);
              }}
              className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-black text-[oklch(99%_0.004_95)]"
            >
              Réessayer
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-5 py-12">
            <Bell className="mb-4 h-10 w-10 text-neutral-300" />
            <p className="text-xl font-black text-neutral-950">Aucune notification récente.</p>
            <p className="mt-2 max-w-xl text-sm text-neutral-500">
              Les prochaines mises à jour de commande et de paiement apparaîtront ici.
            </p>
            <Link href="/dashboard/orders" className="mt-6 inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-black text-[oklch(99%_0.004_95)]">
              Voir mes commandes
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {notifications.map((item) => {
              const href = item.action_url || '/dashboard/orders';

              return (
                <article
                  key={item.id}
                  className={cn(
                    "grid gap-4 px-5 py-5 transition-colors md:grid-cols-[minmax(0,1fr)_auto] md:items-center",
                    !item.is_read && "bg-[oklch(97%_0.006_95)]"
                  )}
                >
                  <div className="min-w-0 md:pr-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        item.is_read ? "bg-neutral-300" : "bg-[oklch(55%_0.23_29)]"
                      )} />
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-widest text-neutral-500">
                        {notificationTone(item.type)}
                      </span>
                      <p className="text-xs font-semibold text-neutral-400">{formatDate(item.created_at)}</p>
                    </div>
                    <h2 className="mt-3 text-base font-black text-neutral-950">{item.title}</h2>
                    {item.message && (
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">{item.message}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    {!item.is_read && (
                      <button
                        type="button"
                        onClick={() => {
                          void handleMarkAsRead(item);
                        }}
                        disabled={processingIds[item.id]}
                        className="inline-flex items-center rounded-full border border-neutral-200 px-4 py-2 text-xs font-black text-neutral-600 transition-colors hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Marquer lu
                      </button>
                    )}
                    <Link
                      href={href}
                      className="inline-flex items-center gap-1 rounded-full bg-neutral-950 px-4 py-2 text-xs font-black text-[oklch(99%_0.004_95)]"
                    >
                      {item.action_label || 'Voir'}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-4">
            <p className="text-xs text-neutral-400">
              Page {meta.current_page} sur {meta.last_page} · {meta.total} notification{meta.total > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setPage((value) => Math.max(1, value - 1));
                }}
                disabled={meta.current_page === 1}
                className="rounded-lg border border-neutral-200 p-2 text-neutral-400 transition-colors hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setPage((value) => Math.min(meta.last_page, value + 1));
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
    </div>
  );
}
