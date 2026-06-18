"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  notificationsService,
  NOTIFICATIONS_UPDATED_EVENT,
  NotificationItem,
} from '@/services/notifications.service';

function formatNotificationDate(value: string | null): string {
  if (!value) {
    return 'À l’instant';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'À l’instant';
  }

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [markingAll, setMarkingAll] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const refreshUnreadCount = async () => {
    try {
      const count = await notificationsService.getUnreadCount({ suppressAuthRedirect: true });
      setUnreadCount(count);
    } catch {
      // silent fail in topbar widget
    }
  };

  const loadRecentNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await notificationsService.getNotifications(1, 6, { suppressAuthRedirect: true });
      setItems(response.data);
      setUnreadCount(response.unread_count);
    } catch {
      setError('Impossible de charger les notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUnreadCount();

    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;

      void refreshUnreadCount();
      if (open) {
        void loadRecentNotifications();
      }
    }, 12000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState !== 'visible') return;

      void refreshUnreadCount();
      if (open) {
        void loadRecentNotifications();
      }
    };

    const handleUpdated = () => {
      void refreshUnreadCount();
      if (open) {
        void loadRecentNotifications();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdated);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdated);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    void loadRecentNotifications();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (item.is_read) return;

    try {
      const response = await notificationsService.markAsRead(item.id);
      setItems((prev) => prev.map((candidate) => (
        candidate.id === item.id ? response.notification : candidate
      )));
      setUnreadCount(response.unread_count);
    } catch {
      // silent fail to keep UX fluid
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    try {
      const response = await notificationsService.markAllAsRead();
      setItems((prev) => prev.map((item) => ({
        ...item,
        is_read: true,
        read_at: item.read_at ?? new Date().toISOString(),
      })));
      setUnreadCount(response.unread_count);
    } catch {
      // silent fail
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-[oklch(99%_0.004_95)] text-neutral-600 transition-colors hover:border-neutral-950 hover:text-neutral-950"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[oklch(55%_0.23_29)] px-1.5 py-0.5 text-[10px] font-semibold text-[oklch(99%_0.004_95)]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-neutral-200 bg-[oklch(99%_0.004_95)] shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
            <p className="text-sm font-bold text-neutral-950">Notifications</p>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={markingAll || unreadCount === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tout marquer lu
            </button>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-neutral-500">Chargement...</div>
          ) : error ? (
            <div className="px-4 py-8 text-center">
              <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-neutral-500">
              Aucune notification récente.
            </div>
          ) : (
            <div className="max-h-[420px] divide-y divide-neutral-100 overflow-y-auto">
              {items.map((item) => {
                const href = item.action_url || '/dashboard/notifications';
                return (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={() => {
                      void handleMarkAsRead(item);
                      setOpen(false);
                    }}
                    className={cn(
                      'block px-4 py-3 transition-colors hover:bg-neutral-50',
                      !item.is_read && 'bg-[oklch(97%_0.006_95)]'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        'mt-1.5 h-2 w-2 rounded-full flex-shrink-0',
                        item.is_read ? 'bg-neutral-300' : 'bg-[oklch(55%_0.23_29)]'
                      )} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-950">{item.title}</p>
                        {item.message && (
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{item.message}</p>
                        )}
                        <p className="mt-1.5 text-[11px] text-neutral-400">{formatNotificationDate(item.created_at)}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="border-t border-neutral-100 px-4 py-3">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-950 hover:text-neutral-950"
            >
              Voir toutes les notifications
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
