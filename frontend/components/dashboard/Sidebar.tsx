"use client"

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, User, LogOut, Globe, X, ArrowRight } from 'lucide-react';
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
      "fixed inset-y-0 left-0 z-50 flex min-h-screen w-72 flex-shrink-0 flex-col overflow-y-auto bg-black transition-transform duration-200",
      mobileOpen ? "translate-x-0" : "-translate-x-full",
      "md:static md:w-[232px] md:translate-x-0"
    )}>

      {/* Logo */}
      <div className="relative border-b border-white/10 px-6 py-6">
        <Link href="/" className="text-xl font-black tracking-tight text-white">
          FRILO
        </Link>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/32">Espace client</p>
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 p-1 text-gray-400 transition-colors hover:text-white md:hidden"
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/28">Navigation</p>
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
                  ? "bg-white text-black"
                  : "text-white/48 hover:bg-white/6 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
        </div>
      </nav>

      <div className="px-3">
        <Link
          href="/templates"
          onClick={handleClose}
          className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-white transition-colors hover:bg-white/[0.07]"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[oklch(70%_0.19_29)]">Action utile</p>
          <p className="mt-2 text-sm font-black leading-5">Lancer un nouveau site</p>
          <p className="mt-2 text-xs leading-5 text-white/45">Choisissez un modèle, FRILO prépare la suite.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-white">
            Voir les modèles <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>

      {/* Bottom actions */}
      <div className="mt-auto border-t border-white/10 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/45 transition-colors hover:bg-white/6 hover:text-white"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
