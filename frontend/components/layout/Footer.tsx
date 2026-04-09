"use client"

import Link from 'next/link';
import { useAuthState } from '@/hooks/useAuthState';

const columns = [
  {
    label: 'Produit',
    links: [
      { name: 'Secteurs',          href: '/secteurs' },
      { name: 'Modèles',           href: '/templates' },
      { name: 'Comment ça marche', href: '/#how-it-works' },
      { name: 'Tarifs',            href: '/#pricing' },
    ],
  },
  {
    label: 'Support',
    links: [
      { name: 'FAQ',              href: '/faq' },
      { name: 'Contact',          href: '/contact' },
      { name: 'Mentions légales', href: '/mentions-legales' },
      { name: 'CGU / CGV',        href: '/cgu' },
    ],
  },
  {
    label: 'Compte',
    links: [],
  },
];

export function Footer() {
  const { isAuthenticated, loading } = useAuthState();

  const accountLinks = loading
    ? []
    : isAuthenticated
      ? [{ name: 'Dashboard', href: '/dashboard' }]
      : [
          { name: 'Connexion', href: '/login' },
          { name: "S'inscrire", href: '/register' },
        ];

  return (
    <footer className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/10">

          {/* Brand */}
          <div className="space-y-5">
            <Link href="/" className="text-xl font-black text-white tracking-tight">
              FRILO
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Votre site vitrine professionnel, livré clé en main en 48h. Dès 50 000 FCFA, paiement unique.
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-white/10 text-gray-300 px-3 py-1.5 rounded-full">48h garantis</span>
              <span className="text-xs bg-white/10 text-gray-300 px-3 py-1.5 rounded-full">Support inclus</span>
            </div>
          </div>

          {/* Link columns */}
          {columns.map(col => (
            <div key={col.label}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-5">
                {col.label}
              </p>
              <ul className="space-y-3">
                {(col.label === 'Compte' ? accountLinks : col.links).map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} FRILO. Tous droits réservés.
          </p>
          <p className="text-gray-700 text-xs">
            Fait pour les entrepreneurs d'Afrique de l'Ouest
          </p>
        </div>
      </div>
    </footer>
  );
}
