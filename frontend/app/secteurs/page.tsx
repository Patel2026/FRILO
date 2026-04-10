"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, type LucideIcon, Utensils, Hammer, Heart, Scale, Users, Home } from 'lucide-react';
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
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="sq-section bg-black text-white">
        <div className="sq-container text-center">
          <p className="sq-label text-gray-500 mb-5">Secteurs</p>
          <h1 className="sq-display text-white mb-6">
            Votre métier,<br />votre modèle.
          </h1>
          <p className="text-gray-400 text-xl max-w-lg mx-auto">
            Chaque secteur dispose de designs spécialement conçus pour ses besoins.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="pt-12 pb-20 md:pt-14 md:pb-24">
        <div className="sq-container">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white h-48 animate-pulse" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
              {sectors.map(sector => {
                const Icon = IconMap[sector.icon] || Home;
                return (
                  <Link
                    key={sector.id}
                    href={`/secteurs/${sector.slug}`}
                    className="group bg-white p-10 flex flex-col gap-6 hover:bg-black transition-colors duration-300 card-hover"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br flex-shrink-0",
                      sector.gradient || 'from-blue-500 to-purple-600'
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-grow">
                      <h2 className="sq-subheading text-black group-hover:text-white transition-colors mb-2">
                        {sector.name}
                      </h2>
                      <p className="text-gray-500 group-hover:text-gray-300 text-sm leading-relaxed transition-colors">
                        {sector.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-black group-hover:text-white transition-colors">
                      Voir les modèles <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
