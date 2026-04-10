"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, X } from 'lucide-react';
import { businessService, Template } from '@/services/business.service';
import { parseFeatures } from '@/lib/utils';
import { hasLivePreview } from '@/lib/templatePreview';
import { trackFunnelEvent } from '@/lib/analytics';
import { useTemplateCollections } from '@/hooks/useTemplateCollections';

function parseIdsFromQueryParam(value: string | null): number[] {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isInteger(item) && item > 0)
    )
  );
}

function getTemplatePrice(template: Template): number {
  return typeof template.price === 'string' ? parseInt(template.price, 10) : template.price;
}

function TemplatesCompareContent() {
  const searchParams = useSearchParams();
  const queryIds = useMemo(() => parseIdsFromQueryParam(searchParams.get('ids')), [searchParams]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    compareIds,
    replaceCompare,
    clearCompare,
    toggleCompare,
  } = useTemplateCollections();

  useEffect(() => {
    if (queryIds.length > 0) {
      replaceCompare(queryIds);
    }
  }, [queryIds, replaceCompare]);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const templatesData = await businessService.getTemplates();
        setTemplates(templatesData);
      } catch {
        setTemplates([]);
        setError('Impossible de charger les modèles à comparer.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const comparedTemplates = useMemo(() => {
    return compareIds
      .map((id) => templates.find((template) => template.id === id))
      .filter((template): template is Template => Boolean(template));
  }, [compareIds, templates]);

  const allFeatureRows = useMemo(() => {
    const allFeatures = comparedTemplates.flatMap((template) => parseFeatures(template.features));
    return Array.from(new Set(allFeatures));
  }, [comparedTemplates]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="text-sm text-gray-500">{error}</p>
        <Link href="/templates" className="sq-btn sq-btn-black">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  if (comparedTemplates.length < 2) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <p className="sq-label text-gray-400 mb-4">Comparaison</p>
          <h1 className="text-4xl font-black tracking-tight text-black mb-4">Sélection insuffisante</h1>
          <p className="text-gray-500 mb-8">
            Sélectionnez au moins 2 modèles dans le catalogue pour voir une comparaison claire.
          </p>
          <Link href="/templates" className="sq-btn sq-btn-black">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-14">
        <Link href="/templates" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6">
          <ArrowLeft className="w-4 h-4" />
          Retour aux modèles
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <p className="sq-label text-gray-400 mb-2">Comparaison intelligente</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black">
              Comparez vos modèles.
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              {comparedTemplates.length} modèles sélectionnés pour décider plus vite.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={clearCompare} className="sq-btn sq-btn-outline-black text-sm py-2.5 px-4">
              Vider la comparaison
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="min-w-[900px] w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100">Critère</th>
                {comparedTemplates.map((template) => (
                  <th key={template.id} className="px-4 py-4 text-left border-b border-gray-100 align-top">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-black">{template.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{template.sector?.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCompare(template.id)}
                        className="text-gray-400 hover:text-black"
                        aria-label={`Retirer ${template.name} de la comparaison`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-4 text-sm font-semibold text-black border-b border-gray-100">Prix</td>
                {comparedTemplates.map((template) => (
                  <td key={`price-${template.id}`} className="px-4 py-4 text-sm text-gray-700 border-b border-gray-100">
                    {getTemplatePrice(template).toLocaleString('fr-FR')} FCFA
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-4 text-sm font-semibold text-black border-b border-gray-100">Démo immersive</td>
                {comparedTemplates.map((template) => (
                  <td key={`preview-${template.id}`} className="px-4 py-4 text-sm text-gray-700 border-b border-gray-100">
                    {hasLivePreview(template.preview_url) ? 'Oui' : 'Non'}
                  </td>
                ))}
              </tr>

              {allFeatureRows.map((feature) => (
                <tr key={feature}>
                  <td className="px-4 py-4 text-sm font-semibold text-black border-b border-gray-100">{feature}</td>
                  {comparedTemplates.map((template) => {
                    const hasFeature = parseFeatures(template.features).includes(feature);
                    return (
                      <td key={`${template.id}-${feature}`} className="px-4 py-4 border-b border-gray-100">
                        {hasFeature ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
                            <Check className="w-4 h-4" /> Inclus
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr>
                <td className="px-4 py-4 text-sm font-semibold text-black">Action</td>
                {comparedTemplates.map((template) => (
                  <td key={`action-${template.id}`} className="px-4 py-4">
                    <Link
                      href={`/commande?templateId=${template.id}`}
                      className="sq-btn sq-btn-black text-sm py-2.5 px-4"
                      onClick={() =>
                        trackFunnelEvent('start_order', {
                          template_id: template.id,
                          template_name: template.name,
                          source: 'compare_page',
                        })
                      }
                    >
                      Commander
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TemplatesCompareContent />
    </Suspense>
  );
}
