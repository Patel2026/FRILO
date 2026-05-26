"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, type LucideIcon, Utensils, Hammer, Heart, Scale, Users, Home } from 'lucide-react';
import { businessService, Sector } from '@/services/business.service';

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
    <div className="min-h-screen bg-white">

      <div className="bg-black px-5 pb-14 pt-32 text-white md:pb-16 md:pt-36">
        <div className="mx-auto grid max-w-7xl gap-10 sm:px-6 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:px-8">
          <div>
            <p className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Secteurs</p>
            <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-tight md:text-5xl lg:text-6xl">
              Choisissez le point de départ de votre site.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
              Commencez par le métier le plus proche du vôtre. FRILO adapte ensuite le modèle à votre activité, vos contenus et votre façon de vendre.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Pas sûr du secteur ?</p>
            <p className="mt-3 text-xl font-black leading-tight">
              Choisissez le plus proche, on ajuste le reste pendant la commande.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-12 md:py-16">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Métiers disponibles</p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-4xl">
                Trouvez le modèle qui parle déjà à vos clients.
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-slate-500 md:max-w-md">
              Chaque secteur sert de base claire : services, preuves, contact et présentation sont ensuite adaptés à votre entreprise.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-[1.35rem] bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
              <p className="text-sm text-amber-800">{error}</p>
            </div>
          ) : sectors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center">
              <p className="text-sm text-gray-500">Aucun secteur actif disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sectors.map((sector, index) => {
                const Icon = IconMap[sector.icon] || Home;
                return (
                  <Link
                    key={sector.id}
                    href={`/secteurs/${sector.slug}`}
                    className="group flex min-h-64 flex-col rounded-[1.35rem] border border-slate-100 bg-slate-50 p-6 transition-colors duration-300 hover:border-slate-950 hover:bg-slate-950"
                  >
                    <div className="mb-8 flex items-center justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white transition-colors group-hover:bg-[oklch(57%_0.24_29)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black text-slate-300 transition-colors group-hover:text-white/35">
                        0{index + 1}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col">
                      <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-950 transition-colors group-hover:text-white">
                        {sector.name}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-slate-500 transition-colors group-hover:text-white/62">
                        {sector.description}
                      </p>
                      <div className="mt-auto flex items-center gap-2 pt-8 text-sm font-black text-slate-950 transition-colors group-hover:text-white">
                        Voir les modèles <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
