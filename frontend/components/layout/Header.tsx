"use client"

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuthState } from '@/hooks/useAuthState';
import { cn } from '@/lib/utils';
import { BrandLogo } from './BrandLogo';

const navLinks = [
  { name: 'Secteurs', href: '/secteurs' },
  { name: 'Modèles', href: '/templates' },
  { name: 'Comment ça marche', href: '/comment-ca-marche' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];

const supportLinks = [
  { name: 'Mentions légales', href: '/mentions-legales' },
  { name: 'CGU / CGV', href: '/cgu' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverDarkZone, setIsOverDarkZone] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, hasToken, loading: authLoading } = useAuthState();
  const isHome = pathname === '/';

  useEffect(() => {
    let animationFrameId = 0;

    const updateHeaderState = () => {
      setIsScrolled(window.scrollY > 40);

      if (window.location.pathname !== '/') {
        setIsOverDarkZone(false);
        return;
      }

      const darkZones = Array.from(document.querySelectorAll<HTMLElement>('[data-header-theme="dark"]'));
      const headerLogoY = 48;
      const overlapsDarkZone = darkZones.some((zone) => {
        const rect = zone.getBoundingClientRect();

        return rect.top <= headerLogoY && rect.bottom >= headerLogoY;
      });

      setIsOverDarkZone(overlapsDarkZone);
    };

    const scheduleHeaderUpdate = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(updateHeaderState);
    };

    updateHeaderState();
    scheduleHeaderUpdate();
    window.setTimeout(updateHeaderState, 120);

    const observer = new MutationObserver(scheduleHeaderUpdate);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('scroll', updateHeaderState, { passive: true });
    window.addEventListener('resize', scheduleHeaderUpdate);
    window.addEventListener('load', updateHeaderState);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('scroll', updateHeaderState);
      window.removeEventListener('resize', scheduleHeaderUpdate);
      window.removeEventListener('load', updateHeaderState);
    };
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const dark = isHome && isOverDarkZone && !isScrolled;
  const showDashboard = isAuthenticated || (authLoading && hasToken);
  const accountLink = showDashboard
    ? { label: 'Dashboard', href: '/dashboard' }
    : { label: 'Connexion', href: '/login' };

  const mobileAccountLinks = showDashboard
    ? [accountLink]
    : authLoading
      ? []
      : [
          accountLink,
          { label: "S'inscrire", href: '/register' },
        ];

  const isActive = (href: string) => {
    if (href.startsWith('/#')) {
      return false;
    }

    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-[90] transition-all duration-300',
          mobileOpen
            ? 'bg-black border-b border-white/10 py-4'
            : dark
              ? 'bg-transparent py-5'
              : 'bg-white/98 backdrop-blur-sm border-b border-gray-100 py-4'
        )}
      >
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-8">
          <Link
            href="/"
            className={cn(
              'inline-flex w-[104px] select-none items-center transition-opacity hover:opacity-80',
              mobileOpen || dark ? 'text-white' : 'text-black'
            )}
            aria-label="Accueil FRILO"
          >
            <BrandLogo variant={mobileOpen || dark ? 'light' : 'dark'} priority />
          </Link>

          <nav className="hidden justify-center justify-self-center lg:flex">
            <div
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-1',
                dark
                  ? 'bg-white/10 border border-white/15'
                  : 'bg-gray-50 border border-gray-100'
              )}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                    isActive(link.href)
                      ? dark
                        ? 'bg-white text-black'
                        : 'bg-white text-black shadow-sm'
                      : dark
                        ? 'text-gray-200 hover:text-white'
                        : 'text-gray-500 hover:text-black'
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </nav>

          <div className="hidden items-center gap-3 justify-end justify-self-end lg:flex">
            <Link
              href={accountLink.href}
              className={cn(
                'inline-flex min-w-28 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                authLoading && !hasToken && 'opacity-70',
                dark
                  ? 'border-white/30 text-white hover:bg-white/10'
                  : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
              )}
            >
              {accountLink.label}
            </Link>
            <Link
              href="/templates"
              className={cn(
                'text-sm font-bold px-5 py-2.5 rounded-full transition-all',
                dark
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-black text-white hover:bg-gray-900'
              )}
            >
              Choisir un modèle →
            </Link>
          </div>

          <button
            className={cn(
              'inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors lg:hidden',
              mobileOpen || dark
                ? 'border-white/15 text-white hover:bg-white/10'
                : 'border-gray-200 text-black hover:bg-gray-50'
            )}
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? 'Fermer le menu principal' : 'Ouvrir le menu principal'}
            aria-expanded={mobileOpen}
            aria-controls="main-mobile-nav"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <div
        id="main-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-hidden={!mobileOpen}
        className={cn(
          'fixed inset-0 z-[80] h-screen h-[100dvh] max-h-screen max-h-[100dvh] overflow-hidden bg-black text-white transition-all duration-300 lg:hidden',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-24">
          <div className="grid shrink-0 gap-8 py-2">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-gray-500">
                Produit
              </p>
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block rounded-2xl px-4 py-3 text-lg font-semibold transition-colors',
                      isActive(link.href)
                        ? 'bg-white text-black'
                        : 'text-gray-200 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-gray-500">
                Support
              </p>
              <div className="space-y-1">
                {supportLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block rounded-2xl px-4 py-3 text-base font-medium transition-colors',
                      isActive(link.href)
                        ? 'bg-white text-black'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {mobileAccountLinks.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-gray-500">
                  Compte
                </p>
                <div className="space-y-1">
                  {mobileAccountLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'block rounded-2xl px-4 py-3 text-base font-medium transition-colors',
                        isActive(link.href)
                          ? 'bg-white text-black'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto shrink-0 border-t border-white/10 pt-6">
            <div className="space-y-4">
              <Link
                href="/templates"
                onClick={() => setMobileOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3.5 text-sm font-bold text-black transition-colors hover:bg-gray-100"
              >
                Choisir un modèle →
              </Link>
              <p className="text-center text-xs text-gray-500">
                © {new Date().getFullYear()} FRILO. Conçu pour les entrepreneurs d&apos;Afrique de l&apos;Ouest.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
