"use client"

import Link from 'next/link';
import { useAuthState } from '@/hooks/useAuthState';
import { usePublicPricing } from '@/hooks/usePublicPricing';
import { formatPublicPrice } from '@/lib/publicPricing';

const columns = [
  {
    label: 'Produit',
    links: [
      { name: 'Secteurs', href: '/secteurs' },
      { name: 'Modèles', href: '/templates' },
      { name: 'Comment ça marche', href: '/#how-it-works' },
      { name: 'Tarifs', href: '/#pricing' },
    ],
  },
  {
    label: 'Support',
    links: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Contact', href: '/contact' },
      { name: 'Mentions légales', href: '/mentions-legales' },
      { name: 'CGU / CGV', href: '/cgu' },
    ],
  },
  {
    label: 'Compte',
    links: [],
  },
];

export function Footer() {
  const { isAuthenticated, hasToken, loading } = useAuthState();
  const { pricing } = usePublicPricing();

  const showDashboard = isAuthenticated || (loading && hasToken);
  const accountLinks = showDashboard
    ? [{ name: 'Dashboard', href: '/dashboard' }]
    : [
        { name: 'Connexion', href: '/login' },
        { name: "S'inscrire", href: '/register' },
      ];

  const mainColumns = columns.filter((column) => column.label !== 'Compte');

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-[1320px] px-6 lg:px-8">
        <div className="py-8 md:hidden">
          <div className="border-b border-white/10 pb-8">
            <div className="max-w-sm space-y-4">
              <Link href="/" className="text-xl font-black tracking-tight text-white">
                FRILO
              </Link>
              <p className="text-sm leading-7 text-gray-300">
                Votre site vitrine professionnel, livré clé en main en 48h. Dès {formatPublicPrice(pricing.starting_price, pricing.currency_label)}, paiement unique.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-8 py-8">
            {mainColumns.map((column) => (
              <div key={column.label}>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[oklch(57%_0.24_29)]">
                  {column.label}
                </p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-300 transition-colors hover:text-white"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {accountLinks.length > 0 && (
              <div className="col-span-2 border-t border-white/10 pt-6">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[oklch(57%_0.24_29)]">
                  Compte
                </p>
                <div className="flex flex-wrap gap-2">
                  {accountLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-6 text-center">
            <div className="space-y-2">
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} FRILO. Tous droits réservés.
              </p>
              <p className="text-xs font-semibold text-gray-300">
                Fait pour les entrepreneurs d&apos;Afrique de l&apos;Ouest
              </p>
            </div>
          </div>
        </div>

        <div className="hidden py-8 md:block">
          <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-10 md:grid-cols-4">
            <div className="space-y-5">
              <Link href="/" className="text-xl font-black tracking-tight text-white">
                FRILO
              </Link>
              <p className="text-sm leading-relaxed text-gray-300">
                Votre site vitrine professionnel, livré clé en main en 48h. Dès {formatPublicPrice(pricing.starting_price, pricing.currency_label)}, paiement unique.
              </p>
            </div>

            {[...mainColumns, { label: 'Compte', links: accountLinks }].map((column) => (
              <div key={column.label}>
                <p className="mb-5 text-xs font-bold uppercase tracking-widest text-[oklch(57%_0.24_29)]">
                  {column.label}
                </p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-300 transition-colors hover:text-white"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-3 pt-8 sm:flex-row">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} FRILO. Tous droits réservés.
            </p>
            <p className="text-xs font-semibold text-gray-300">
              Fait pour les entrepreneurs d&apos;Afrique de l&apos;Ouest
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
