"use client"

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useAuthState } from '@/hooks/useAuthState';

const navLinks = [
  { name: 'Secteurs',             href: '/secteurs' },
  { name: 'Modèles',              href: '/templates' },
  { name: 'Comment ça marche',    href: '/#how-it-works' },
  { name: 'FAQ',                  href: '/faq' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, hasToken, loading: authLoading } = useAuthState();

  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Dark mode: only on homepage hero before scroll
  const dark = isHome && !isScrolled;

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const showDashboard = isAuthenticated || (authLoading && hasToken);
  const accountLink = showDashboard
    ? { label: 'Dashboard', href: '/dashboard' }
    : { label: 'Connexion', href: '/login' };

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      dark
        ? 'bg-transparent py-5'
        : 'bg-white/98 backdrop-blur-sm border-b border-gray-100 py-4'
    )}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className={cn("text-xl font-black tracking-tight select-none transition-colors",
            dark ? "text-white" : "text-black"
          )}
        >
          FRILO
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map(link => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                dark
                  ? "text-gray-300 hover:text-white"
                  : isActive(link.href)
                    ? "text-black"
                    : "text-gray-500 hover:text-black"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          {!authLoading && (
            <Link
              href={accountLink.href}
              className={cn(
                "text-sm font-medium transition-colors",
                dark ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-black"
              )}
            >
              {accountLink.label}
            </Link>
          )}
          <Link
            href="/templates"
            className={cn(
              "text-sm font-bold px-5 py-2.5 rounded-full transition-all",
              dark
                ? "bg-white text-black hover:bg-gray-100"
                : "bg-black text-white hover:bg-gray-900"
            )}
          >
            Commencer →
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className={cn("md:hidden p-2 transition-colors", dark ? "text-white" : "text-black")}
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Fermer le menu principal' : 'Ouvrir le menu principal'}
          aria-expanded={mobileOpen}
          aria-controls="main-mobile-nav"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={cn(
        "md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 overflow-hidden transition-all duration-200",
        mobileOpen ? "max-h-screen shadow-lg" : "max-h-0"
      )} id="main-mobile-nav">
        <div className="max-w-6xl mx-auto px-6 py-2">
          {navLinks.map(link => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block py-4 text-sm font-medium border-b border-gray-50 last:border-0 transition-colors",
                isActive(link.href) ? "text-black" : "text-gray-600 hover:text-black"
              )}
            >
              {link.name}
            </Link>
          ))}
          <div className="py-4 flex flex-col gap-3">
            {!authLoading && (
              <Link
                href={accountLink.href}
                onClick={() => setMobileOpen(false)}
                className="text-center py-3 text-sm font-medium text-gray-500 hover:text-black transition-colors"
              >
                {accountLink.label}
              </Link>
            )}
            <Link
              href="/templates"
              onClick={() => setMobileOpen(false)}
              className="bg-black text-white text-center py-3.5 rounded-full font-bold text-sm hover:bg-gray-900 transition-colors"
            >
              Commencer →
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
