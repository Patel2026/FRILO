"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, User, LogOut, Globe, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/services/auth.service';

const navItems = [
  { href: '/dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard, match: 'exact' },
  { href: '/dashboard/orders', label: 'Mes commandes', icon: ShoppingBag, match: 'prefix' },
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
      "fixed inset-y-0 left-0 z-50 w-72 bg-black min-h-screen flex flex-col flex-shrink-0 overflow-y-auto transition-transform duration-200",
      mobileOpen ? "translate-x-0" : "-translate-x-full",
      "md:static md:w-64 md:translate-x-0"
    )}>

      {/* Logo */}
      <div className="px-8 py-8 border-b border-white/10 relative">
        <Link href="/" className="text-xl font-black text-white tracking-tight">
          FRILO
        </Link>
        <p className="text-gray-600 text-xs mt-1 uppercase tracking-widest">Espace client</p>
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-6 right-6 p-1 text-gray-400 hover:text-white transition-colors md:hidden"
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6">
        <p className="px-4 mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">Navigation</p>
        <div className="space-y-1">
        {navItems.map(({ href, label, icon: Icon, match }) => {
          const active = match === 'exact' ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={handleClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-white text-black"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="px-4 py-6 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
