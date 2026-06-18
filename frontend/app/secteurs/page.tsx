"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, type LucideIcon, Utensils, Hammer, Heart, Scale, Users, Home } from 'lucide-react';
import {
  PublicEmptyState,
  PublicFinalCta,
  PublicHero,
  PublicPageShell,
} from '@/components/public/PublicPageShell';
import { PUBLIC_CARD_TITLE_CLASS, PUBLIC_PAGE_TEXT } from '@/components/public/publicPageCopy';
import { businessService, Sector } from '@/services/business.service';
import { cn } from '@/lib/utils';

const IconMap: Record<string, LucideIcon> = { Utensils, Hammer, Heart, Scale, Users, Home };

export default function SectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    businessService.getSectors()
      .then((data) => {
        setSectors(data);
        setError(null);
      })
      .catch(() => {
        setSectors([]);
        setError("Impossible de charger les secteurs pour le moment.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicPageShell>
      <PublicHero
        eyebrow="Secteurs"
        title="Trouvez le point de départ le plus proche de votre activité."
        description="Restaurant, cabinet, commerce, service ou accompagnement : choisissez une base métier, puis FRILO adapte le reste à vos contenus."
        primaryAction={{ label: 'Voir les secteurs', href: '#secteurs' }}
        secondaryAction={{ label: 'Demander de l’aide', href: '/contact?subject=Choix%20du%20secteur' }}
        aside={(
          <div className="border-y border-black bg-white p-5">
            <p className="text-lg font-black leading-tight">Pas sûr du secteur ?</p>
            <p className="mt-3 text-sm leading-6 text-black/62">
              Choisissez le plus proche. L’équipe FRILO ajuste les textes, les pages et les preuves à votre activité réelle.
            </p>
          </div>
        )}
      />

      <div id="secteurs" className="px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">Métiers disponibles</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-black md:text-4xl">
                Trouvez le modèle qui parle déjà à vos clients.
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-black/62 md:max-w-md">
              Chaque secteur sert de base claire : services, preuves, contact et présentation sont ensuite adaptés à votre entreprise.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 animate-pulse bg-white" />
              ))}
            </div>
          ) : error ? (
            <div className="border-y border-amber-300 bg-amber-50 px-6 py-10 text-center">
              <p className="text-sm text-amber-800">{error}</p>
            </div>
          ) : sectors.length === 0 ? (
            <PublicEmptyState
              title="Aucun secteur actif disponible pour le moment."
              description="Vous pouvez quand même nous décrire votre activité pour recevoir une orientation."
              action={{ label: 'Demander une orientation', href: '/contact?subject=Choix%20du%20secteur' }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-0 border-t border-black">
              {sectors.map((sector, index) => {
                const Icon = IconMap[sector.icon] || Home;
                return (
                  <Link
                    key={sector.id}
                    href={`/secteurs/${sector.slug}`}
                    className="group grid min-h-40 gap-5 border-b border-black bg-white p-5 transition-colors hover:bg-black hover:text-white md:grid-cols-[4rem_1fr_auto] md:items-center"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white transition-colors group-hover:bg-[#e60000]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-black/35 group-hover:text-white/35">
                        Métier {index + 1}
                      </p>
                      <h2 className={cn('mt-2 text-2xl font-black text-black transition-colors group-hover:text-white', PUBLIC_CARD_TITLE_CLASS)}>
                        {sector.name}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-black/62 transition-colors group-hover:text-white/66">
                        {sector.description}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-black">
                      Voir les modèles <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <PublicFinalCta
        title={PUBLIC_PAGE_TEXT.sectors.helperTitle}
        description={PUBLIC_PAGE_TEXT.sectors.helperDescription}
        href="/contact?subject=Choix%20du%20secteur"
        label="Demander une orientation"
      />
    </PublicPageShell>
  );
}
