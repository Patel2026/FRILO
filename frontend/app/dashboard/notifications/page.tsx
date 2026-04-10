"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertTriangle, Bell, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { notificationsService, NotificationItem, NotificationListResponse } from '@/services/notifications.service';

function formatDate(value: string | null): string {
  if (!value) {
    return 'À l’instant';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'À l’instant';
  }

  return date.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
    <div className="p-4 md:p-8 w-full">
      <div className="mb-8 md:mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Tableau de bord</p>
        <h1 className="text-3xl font-black text-black tracking-tight">Notifications</h1>
        <p className="text-sm text-gray-500 mt-3">
          Suivez les évolutions de vos commandes et paiements en temps réel.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-black">
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Toutes les notifications sont lues'}
          </p>
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={markingAll || unreadCount === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-black hover:border-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Tout marquer lu
          </button>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="px-6 py-4 space-y-2">
                <div className="h-4 w-52 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-80 bg-gray-100 rounded animate-pulse" />
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
                setReloadKey((value) => value + 1);
              }}
              className="sq-btn sq-btn-black text-sm py-3 px-6"
            >
              Réessayer
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-5">Aucune notification récente.</p>
            <Link href="/dashboard/orders" className="sq-btn sq-btn-black text-sm py-3 px-6">
              Voir mes commandes
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((item) => {
              const href = item.action_url || '/dashboard/orders';
              return (
                <div key={item.id} className={cn(
                  'px-6 py-4',
                  !item.is_read && 'bg-slate-50/60'
                )}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-2 h-2 rounded-full',
                          item.is_read ? 'bg-gray-300' : 'bg-black'
                        )} />
                        <p className="text-sm font-semibold text-black">{item.title}</p>
                      </div>
                      {item.message && (
                        <p className="text-sm text-gray-500 mt-1">{item.message}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{formatDate(item.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!item.is_read && (
                        <button
                          type="button"
                          onClick={() => {
                            void handleMarkAsRead(item);
                          }}
                          disabled={processingIds[item.id]}
                          className="inline-flex items-center rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-black hover:border-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Marquer lu
                        </button>
                      )}
                      <Link
                        href={href}
                        className="inline-flex items-center rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-black hover:border-black transition-colors"
                      >
                        {item.action_label || 'Voir'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
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
                className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-black hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setPage((value) => Math.min(meta.last_page, value + 1));
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
    </div>
  );
}
