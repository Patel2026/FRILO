"use client"

import { useEffect, useState } from 'react';
import { TemplateCard } from '@/components/business/TemplateCard';
import { businessService, Template, Sector } from '@/services/business.service';
import { parseFeatures } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function TemplatesPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const sectorsData = await businessService.getSectors();
        setSectors(sectorsData);
        const templatesData = await businessService.getTemplates();
        setTemplates(templatesData);
      } catch {
        setSectors([]);
        setTemplates([]);
        setError("Impossible de charger le catalogue de modèles.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = activeSlug
    ? templates.filter(t => t.sector?.slug === activeSlug)
    : templates;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <div className="pt-32 pb-16 sq-container text-center">
        <p className="sq-label mb-4">Catalogue</p>
        <h1 className="sq-display text-black mb-6">Nos modèles.</h1>
        <p className="text-gray-500 text-lg max-w-lg mx-auto">
          Choisissez le design qui correspond à votre activité.
          Nous l'adaptons à votre identité en 48h.
        </p>
      </div>

      {/* ── Filter tabs — Squarespace style ── */}
      <div className="border-y border-gray-100 sticky top-16 bg-white z-30">
        <div className="sq-container">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide -mb-px">
            <button
              onClick={() => setActiveSlug(null)}
              className={cn(
                "text-sm font-medium px-5 py-4 whitespace-nowrap border-b-2 transition-colors",
                activeSlug === null
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-black"
              )}
            >
              Tous
            </button>
            {sectors.map(s => (
              <button
                key={s.slug}
                onClick={() => setActiveSlug(s.slug)}
                className={cn(
                  "text-sm font-medium px-5 py-4 whitespace-nowrap border-b-2 transition-colors",
                  activeSlug === s.slug
                    ? "border-black text-black"
                    : "border-transparent text-gray-400 hover:text-black"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid — 4 cols like Squarespace ── */}
      <div className="sq-section">
        <div className="sq-container">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/2] bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
              <p className="text-sm text-amber-800">{error}</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filtered.map(t => (
                <TemplateCard
                  key={t.id}
                  id={String(t.id)}
                  name={t.name}
                  sectorName={t.sector?.name}
                  price={typeof t.price === 'string' ? parseInt(t.price) : t.price}
                  features={parseFeatures(t.features)}
                  image={t.full_thumbnail_url}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-gray-400 text-sm">Aucun modèle dans ce secteur pour l'instant.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="border-t border-gray-100 py-20 text-center">
        <p className="text-gray-500 text-sm mb-4">Vous ne trouvez pas ce que vous cherchez ?</p>
        <a href="/contact" className="sq-btn sq-btn-black inline-flex">
          Parler à un expert
        </a>
      </div>
    </div>
  );
}
