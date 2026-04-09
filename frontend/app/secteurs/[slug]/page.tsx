"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TemplateCard } from '@/components/business/TemplateCard';
import { businessService, Template, Sector } from '@/services/business.service';
import { parseFeatures } from '@/lib/utils';

export default function SectorPage() {
  const { slug } = useParams() as { slug: string };
  const [sector, setSector] = useState<Sector | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      try {
        setError(null);
        const sectors = await businessService.getSectors();
        const found = sectors.find(s => s.slug === slug) || null;
        setSector(found);
        if (found) {
          const data = await businessService.getTemplates(slug);
          setTemplates(data);
        } else {
          setTemplates([]);
        }
      } catch {
        setSector(null);
        setTemplates([]);
        setError("Impossible de charger ce secteur pour le moment.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sector) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{error || 'Secteur introuvable.'}</p>
        <Link href="/secteurs" className="sq-btn sq-btn-black">Voir tous les secteurs</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="sq-section bg-black text-white">
        <div className="sq-container">
          <Link href="/secteurs" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-sm transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Tous les secteurs
          </Link>
          <h1 className="sq-display text-white mb-4">{sector.name}.</h1>
          <p className="text-gray-400 text-xl max-w-lg">{sector.description}</p>
        </div>
      </div>

      {/* Templates grid */}
      <div className="sq-section">
        <div className="sq-container">
          <p className="sq-label mb-8">
            {templates.length} modèle{templates.length > 1 ? 's' : ''} disponible{templates.length > 1 ? 's' : ''}
          </p>

          {templates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(t => (
                <TemplateCard
                  key={t.id}
                  id={String(t.id)}
                  name={t.name}
                  price={typeof t.price === 'string' ? parseInt(t.price) : t.price}
                  features={parseFeatures(t.features)}
                  image={t.full_thumbnail_url}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-gray-200 rounded-2xl">
              <p className="text-gray-400 text-sm">Aucun modèle disponible pour ce secteur.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
