"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, type LucideIcon, Utensils, Hammer, Heart, Scale, Users, Home } from 'lucide-react';
import {
  PublicEmptyState,
  PublicPageShell,
} from '@/components/public/PublicPageShell';
import { PUBLIC_PAGE_TEXT } from '@/components/public/publicPageCopy';
import { businessService, Sector } from '@/services/business.service';
import { cn } from '@/lib/utils';

const IconMap: Record<string, LucideIcon> = { Utensils, Hammer, Heart, Scale, Users, Home };

const SECTOR_IMAGES: Record<string, string> = {
  restaurants: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
  btp: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80',
  sante: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1400&q=80',
  avocats: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1400&q=80',
  coaching: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80',
  immobilier: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80',
  accompagnement: '/image/client-satisfait-frilo.jpg',
};

const SECTOR_PROMISES: Record<string, string[]> = {
  restaurants: ['Menu lisible', 'Photos qui donnent envie', 'Contact ou réservation visible'],
  btp: ['Réalisations visibles', 'Demande de devis', 'Zones d’intervention claires'],
  sante: ['Prise de rendez-vous', 'Présentation rassurante', 'Services et tarifs lisibles'],
  avocats: ['Expertises structurées', 'Cabinet présenté clairement', 'Contact sécurisé'],
  coaching: ['Offres compréhensibles', 'Preuves et témoignages', 'Réservation ou demande de rendez-vous'],
  immobilier: ['Biens mis en avant', 'Galeries propres', 'Demande de visite facile'],
  accompagnement: ['Orientation personnalisée', 'Modèle le plus proche', 'Adaptation FRILO'],
};

const SECTOR_DISPLAY_ORDER = ['restaurants', 'btp', 'sante', 'avocats', 'coaching', 'immobilier', 'accompagnement'];

function getSectorImage(sector: Sector): string {
  return SECTOR_IMAGES[sector.slug] || '/image/client-satisfait-frilo.jpg';
}

function getSectorPromises(sector: Sector): string[] {
  return SECTOR_PROMISES[sector.slug] || ['Présentation claire', 'Photos et contenus adaptés', 'Contact visible'];
}

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

  const orderedSectors = [...sectors].sort((sectorA, sectorB) => {
    const indexA = SECTOR_DISPLAY_ORDER.indexOf(sectorA.slug);
    const indexB = SECTOR_DISPLAY_ORDER.indexOf(sectorB.slug);
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });

  return (
    <PublicPageShell className="bg-white">
      <section className="px-5 pt-28 md:px-8 md:pt-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.68fr)] lg:items-end">
            <div className="pb-2">
              <h1 className="max-w-5xl text-balance text-5xl font-black leading-[0.98] text-black md:text-[4rem] lg:text-[4.75rem]">
                Choisissez l’activité qui ressemble à la vôtre.
              </h1>
              <p className="mt-6 max-w-3xl text-pretty text-base leading-7 text-gray-700 md:text-lg md:leading-8">
                Restaurant, BTP, santé, immobilier, cabinet ou accompagnement : partez d’un univers proche, puis FRILO adapte les pages, les textes et les preuves à votre entreprise.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#secteurs"
                  className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[#2563eb]"
                >
                  Voir les activités
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <Link
                  href="/contact?subject=Choix%20du%20secteur"
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-black text-black transition-colors hover:border-black"
                >
                  Demander une orientation
                </Link>
              </div>
            </div>

            <div className="relative min-h-[420px] overflow-hidden bg-gray-100">
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(/image/client-satisfait-frilo.jpg)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-sm font-black text-white/75">FRILO adapte le rendu final</p>
                <p className="mt-2 max-w-lg text-balance text-3xl font-black leading-tight">
                  Votre secteur donne la structure. Vos contenus donnent la crédibilité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="secteurs" className="px-5 py-14 md:px-8 md:py-16">
        <div className="mx-auto max-w-[1440px]">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[420px] animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : error ? (
            <div className="border-y border-amber-300 bg-amber-50 px-6 py-10 text-center">
              <p className="text-sm text-amber-800">{error}</p>
            </div>
          ) : orderedSectors.length === 0 ? (
            <PublicEmptyState
              title="Aucun secteur actif disponible pour le moment."
              description="Vous pouvez quand même nous décrire votre activité pour recevoir une orientation."
              action={{ label: 'Demander une orientation', href: '/contact?subject=Choix%20du%20secteur' }}
            />
          ) : (
            <div className="grid gap-8">
              {orderedSectors.map((sector, index) => {
                const Icon = IconMap[sector.icon] || Home;
                const image = getSectorImage(sector);
                const promises = getSectorPromises(sector);
                const isReversed = index % 2 === 1;

                return (
                  <article
                    key={sector.id}
                    className={cn(
                      'grid overflow-hidden border border-gray-200 bg-white lg:grid-cols-2',
                      isReversed && 'lg:[&>*:first-child]:order-2'
                    )}
                  >
                    <Link
                      href={`/secteurs/${sector.slug}`}
                      className="group relative block min-h-[320px] overflow-hidden bg-gray-100 md:min-h-[460px]"
                    >
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                        style={{ backgroundImage: `url(${image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4 text-white">
                        <p className="max-w-[70%] text-sm font-black text-white/85">{sector.name}</p>
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-black">
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                    </Link>

                    <div className="flex min-h-[360px] flex-col justify-between p-6 md:p-8 lg:p-10">
                      <div>
                        <p className="text-sm font-black text-[#2563eb]">Base métier</p>
                        <h2 className="mt-3 max-w-xl text-balance text-4xl font-black leading-[0.98] text-black md:text-5xl">
                          {sector.name}
                        </h2>
                        <p className="mt-5 max-w-xl text-base leading-7 text-gray-700">
                          {sector.description}
                        </p>
                      </div>

                      <div className="mt-8">
                        <div className="grid gap-0 border-y border-gray-200">
                          {promises.map((promise) => (
                            <div key={promise} className="flex items-center justify-between gap-4 border-b border-gray-200 py-4 last:border-b-0">
                              <span className="text-sm font-black text-black">{promise}</span>
                              <Check className="h-4 w-4 text-[#2563eb]" />
                            </div>
                          ))}
                        </div>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                          <Link
                            href={`/secteurs/${sector.slug}`}
                            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#2563eb]"
                          >
                            Voir ce secteur
                          </Link>
                          <Link
                            href="/templates"
                            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-black text-black transition-colors hover:border-black"
                          >
                            Voir les modèles
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="px-5 pb-10 md:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 border-y border-black py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black leading-tight text-black">{PUBLIC_PAGE_TEXT.sectors.helperTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              {PUBLIC_PAGE_TEXT.sectors.helperDescription}
            </p>
          </div>
          <Link
            href="/contact?subject=Choix%20du%20secteur"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[#2563eb]"
          >
            Demander une orientation
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
