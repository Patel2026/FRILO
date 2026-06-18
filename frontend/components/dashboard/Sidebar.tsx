"use client"

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, User, LogOut, Globe, X, Bell, MonitorSmartphone, Users, Wallet, Calendar } from 'lucide-react';
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
      "fixed inset-y-0 left-0 z-50 flex min-h-screen w-72 flex-shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-[#f0f0f1] transition-transform duration-200",
      mobileOpen ? "translate-x-0" : "-translate-x-full",
      "md:static md:w-[232px] md:translate-x-0"
    )}>

      {/* Logo */}
      <div className="relative border-b border-neutral-200 px-4 py-4">
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

      <div className="border-y border-neutral-200 px-3 py-4">
        <p className="text-xs font-bold text-neutral-500">Espace actif</p>
        <p className="mt-1 truncate text-sm font-black text-neutral-950">Suivi FRILO</p>
        <p className="mt-1 text-xs font-semibold text-[#e11d2e]">Site, commandes et outils</p>
      </div>

      {/* Nav */}
      <nav className="px-2 py-3">
        <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Navigation</p>
        <div className="space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, match }) => {
          const active = match === 'exact' ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={handleClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-neutral-950 text-white"
                  : "text-neutral-600 hover:bg-white hover:text-neutral-950"
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-neutral-950 text-white"
                  : "text-neutral-600 hover:bg-white hover:text-neutral-950"
              )}
            >
              <Bell className="w-4 h-4 flex-shrink-0" />
              Notifications
              {unreadCount > 0 && (
                <span className={cn(
                  "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black",
                  active ? "bg-white text-neutral-950" : "bg-[#e11d2e] text-white"
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-neutral-950 text-white"
                  : "text-neutral-600 hover:bg-white hover:text-neutral-950"
              )}
            >
              <Calendar className="w-4 h-4 flex-shrink-0" />
              Mes Échéances
              {urgentCount > 0 && (
                <span className={cn(
                  "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black",
                  active ? "bg-white text-neutral-950" : "bg-[#e11d2e] text-white"
                )}>
                  {urgentCount > 99 ? '99+' : urgentCount}
                </span>
              )}
            </Link>
          );
        })()}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto border-t border-neutral-200 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-white hover:text-neutral-950"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
