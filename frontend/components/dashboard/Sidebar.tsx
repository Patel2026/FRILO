"use client"

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, User, LogOut, Globe, X, ArrowRight, Bell, MonitorSmartphone, Users, Wallet, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/services/auth.service';
import { notificationsService, NOTIFICATIONS_UPDATED_EVENT } from '@/services/notifications.service';
import { deadlinesService } from '@/services/deadlines.service';

const navItems = [
  { href: '/dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard, match: 'exact' },
  { href: '/dashboard/orders', label: 'Mes commandes', icon: ShoppingBag, match: 'prefix' },
  { href: '/dashboard/mon-site', label: 'Mon Site', icon: MonitorSmartphone, match: 'prefix' },
  { href: '/dashboard/contacts', label: 'Mes Clients', icon: Users, match: 'prefix' },
  { href: '/dashboard/caisse', label: 'Ma Caisse', icon: Wallet, match: 'prefix' },
  { href: '/templates', label: 'Explorer les modèles', icon: Globe, match: 'prefix' },
  { href: '/dashboard/profile', label: 'Mon profil', icon: User, match: 'prefix' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    notificationsService.getUnreadCount().then((count) => {
      if (isMounted) setUnreadCount(count);
    }).catch(() => {});

    deadlinesService.list()
      .then((list) => {
        if (isMounted) setUrgentCount(
          list.filter((d) => d.days_remaining >= 0 && d.days_remaining <= 7).length
        );
      })
      .catch(() => {});

    const handleUpdate = () => {
      notificationsService.getUnreadCount().then((count) => {
        if (isMounted) setUnreadCount(count);
      }).catch(() => {});
    };

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const handleClose = () => {
    onClose?.();
  };

  const handleLogout = async () => {
    await authService.logout();
    handleClose();
    router.push('/login');
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 flex min-h-screen w-72 flex-shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-[oklch(96.8%_0.004_95)] transition-transform duration-200",
      mobileOpen ? "translate-x-0" : "-translate-x-full",
      "md:static md:w-[232px] md:translate-x-0"
    )}>

      {/* Logo */}
      <div className="relative border-b border-neutral-200 px-6 py-6">
        <Link href="/" className="text-xl font-black tracking-tight text-neutral-950">
          FRILO
        </Link>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">Espace client</p>
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 p-1 text-neutral-500 transition-colors hover:text-neutral-950 md:hidden"
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">Navigation</p>
        <div className="space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, match }) => {
          const active = match === 'exact' ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={handleClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-neutral-950 text-[oklch(99%_0.004_95)]"
                  : "text-neutral-500 hover:bg-[oklch(99%_0.004_95)] hover:text-neutral-950"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
        {(() => {
          const active = pathname.startsWith('/dashboard/notifications');
          return (
            <Link
              href="/dashboard/notifications"
              onClick={handleClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-neutral-950 text-[oklch(99%_0.004_95)]"
                  : "text-neutral-500 hover:bg-[oklch(99%_0.004_95)] hover:text-neutral-950"
              )}
            >
              <Bell className="w-4 h-4 flex-shrink-0" />
              Notifications
              {unreadCount > 0 && (
                <span className={cn(
                  "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black",
                  active ? "bg-[oklch(99%_0.004_95)] text-neutral-950" : "bg-[oklch(55%_0.23_29)] text-[oklch(99%_0.004_95)]"
                )}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })()}
        {(() => {
          const active = pathname.startsWith('/dashboard/echeances');
          return (
            <Link
              href="/dashboard/echeances"
              onClick={handleClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-neutral-950 text-[oklch(99%_0.004_95)]"
                  : "text-neutral-500 hover:bg-[oklch(99%_0.004_95)] hover:text-neutral-950"
              )}
            >
              <Calendar className="w-4 h-4 flex-shrink-0" />
              Mes Échéances
              {urgentCount > 0 && (
                <span className={cn(
                  "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black",
                  active ? "bg-[oklch(99%_0.004_95)] text-neutral-950" : "bg-[oklch(55%_0.23_29)] text-[oklch(99%_0.004_95)]"
                )}>
                  {urgentCount > 99 ? '99+' : urgentCount}
                </span>
              )}
            </Link>
          );
        })()}
        </div>
      </nav>

      <div className="px-3">
        <Link
          href="/templates"
          onClick={handleClose}
          className="block rounded-2xl border border-neutral-200 bg-[oklch(99%_0.004_95)] p-4 text-neutral-950 transition-colors hover:border-neutral-300"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[oklch(55%_0.23_29)]">Action utile</p>
          <p className="mt-2 text-sm font-black leading-5">Lancer un nouveau site</p>
          <p className="mt-2 text-xs leading-5 text-neutral-500">Choisissez un modèle, FRILO prépare la suite.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-neutral-950">
            Voir les modèles <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>

      {/* Bottom actions */}
      <div className="mt-auto border-t border-neutral-200 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-500 transition-colors hover:bg-[oklch(99%_0.004_95)] hover:text-neutral-950"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
