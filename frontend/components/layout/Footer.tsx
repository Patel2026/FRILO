"use client"

import Link from 'next/link';
import { useAuthState } from '@/hooks/useAuthState';
import { BrandLogo } from './BrandLogo';

const columns = [
  {
    label: 'Produit',
    links: [
      { name: 'Modèles de site', href: '/templates' },
      { name: 'Secteurs d’activité', href: '/secteurs' },
      { name: 'Comment ça marche', href: '/comment-ca-marche' },
      { name: 'Commander un site', href: '/templates' },
      { name: 'Demander une orientation', href: '/contact?subject=Orientation%20FRILO' },
    ],
  },
  {
    label: 'Solutions',
    links: [
      { name: 'Restaurants et traiteurs', href: '/secteurs/restaurants' },
      { name: 'BTP et artisanat', href: '/secteurs/btp' },
      { name: 'Santé et bien-être', href: '/secteurs/sante' },
      { name: 'Immobilier', href: '/secteurs/immobilier' },
      { name: 'Coaching et consulting', href: '/secteurs/coaching' },
      { name: 'Accompagnement FRILO', href: '/templates' },
    ],
  },
  {
    label: 'Support',
    links: [
      { name: 'Centre d’aide', href: '/faq' },
      { name: 'Contact', href: '/contact' },
      { name: 'Suivi depuis l’espace client', href: '/dashboard' },
    ],
  },
  {
    label: 'Compte',
    links: [],
  },
];

export function Footer() {
  const { isAuthenticated, hasToken, loading } = useAuthState();

  const showDashboard = isAuthenticated || (loading && hasToken);
  const accountLinks = showDashboard
    ? [{ name: 'Dashboard', href: '/dashboard' }]
    : [
        { name: 'Connexion', href: '/login' },
        { name: "S'inscrire", href: '/register' },
      ];

  const mainColumns = columns.filter((column) => column.label !== 'Compte');
  const footerColumns = [...mainColumns, { label: 'Compte', links: accountLinks }];
  const legalLinks = [
    { name: 'Mentions légales', href: '/mentions-legales' },
    { name: 'CGU / CGV', href: '/cgu' },
    { name: 'Confidentialité', href: '/mentions-legales' },
    { name: 'Cookies', href: '/mentions-legales' },
  ];

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-[1360px] px-8 pb-10 pt-12 md:px-12 md:pb-10 md:pt-16 xl:px-16">
        <div className="grid gap-12 border-b border-white/15 pb-12 md:grid-cols-2 lg:grid-cols-[minmax(260px,1.05fr)_repeat(4,minmax(150px,0.86fr))] lg:gap-12 xl:gap-16">
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex w-[118px] transition-opacity hover:opacity-80" aria-label="Accueil FRILO">
              <BrandLogo variant="light" />
            </Link>
            <p className="mt-8 max-w-[390px] text-3xl font-black leading-tight tracking-tight text-white md:text-4xl lg:text-[2.1rem]">
              Un site clair ouvre de nouvelles possibilités.
            </p>
            <p className="mt-6 max-w-[360px] text-base leading-7 text-white/60">
              FRILO aide les entrepreneurs à partir d’un modèle, ajouter leurs informations et recevoir un site vitrine prêt à partager.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.label} className="min-w-0">
              <p className="mb-5 text-sm font-black text-white">
                {column.label}
              </p>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-base leading-6 text-white/45 transition-colors hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-8 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/45">
            {legalLinks.map((link) => (
              <Link key={link.name} href={link.href} className="transition-colors hover:text-white">
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3 text-sm text-white/55 sm:flex-row sm:items-center sm:gap-8">
            <p>Français</p>
            <p>FCFA</p>
            <p className="font-semibold text-white">© {new Date().getFullYear()} FRILO</p>
          </div>
        </div>

        <div className="mt-6 border-t border-white/15 pt-6 text-center text-sm leading-6">
          <p className="font-semibold text-white/65">
            Fait pour les entrepreneurs d&apos;Afrique de l&apos;Ouest
          </p>
        </div>
      </div>
    </footer>
  );
}
