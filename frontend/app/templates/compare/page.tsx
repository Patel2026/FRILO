"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, X } from 'lucide-react';
import { businessService, Template } from '@/services/business.service';
import { parseFeatures } from '@/lib/utils';
import { hasLivePreview, parsePreviewGallery } from '@/lib/templatePreview';
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

function formatPrice(template: Template): string {
  return `${getTemplatePrice(template).toLocaleString('fr-FR')} FCFA`;
}

function getTemplateImage(template: Template): string {
  return template.full_thumbnail_url || parsePreviewGallery(template.preview_gallery)[0] || '';
}

function CompareLoading() {
  return (
    <div className="min-h-screen bg-[oklch(98.5%_0.004_260)] px-5 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="h-5 w-36 rounded-full bg-slate-200" />
        <div className="mt-8 h-20 max-w-2xl rounded-3xl bg-slate-200" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-72 rounded-[2rem] bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
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

  const lowestPrice = useMemo(() => {
    if (comparedTemplates.length === 0) {
      return null;
    }

    return Math.min(...comparedTemplates.map(getTemplatePrice));
  }, [comparedTemplates]);

  if (loading) {
    return <CompareLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[oklch(98.5%_0.004_260)] px-5 py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[oklch(56%_0.22_29)]">Comparaison</p>
          <h1 className="mt-4 text-4xl font-black leading-none text-slate-950 md:text-5xl">La comparaison n’a pas chargé.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-500">{error}</p>
          <Link href="/templates" className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[oklch(56%_0.22_29)]">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  if (comparedTemplates.length < 2) {
    return (
      <div className="min-h-screen bg-[oklch(98.5%_0.004_260)] px-5 py-28">
        <div className="mx-auto max-w-7xl">
          <Link href="/templates" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" />
            Retour aux modèles
          </Link>

          <div className="mt-16 grid gap-10 lg:grid-cols-[0.86fr_1fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[oklch(56%_0.22_29)]">Comparaison</p>
              <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[0.95] text-slate-950 md:text-6xl">
                Choisissez au moins deux modèles.
              </h1>
            </div>
            <div className="max-w-xl">
              <p className="text-lg leading-8 text-slate-600">
                La comparaison sert à décider vite entre deux directions visuelles. Sélectionnez vos favoris dans le catalogue, puis revenez ici.
              </p>
              <Link href="/templates" className="mt-8 inline-flex rounded-full bg-slate-950 px-7 py-4 text-sm font-black text-white transition-colors hover:bg-[oklch(56%_0.22_29)]">
                Choisir des modèles
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(98.5%_0.004_260)]">
      <div className="mx-auto max-w-[1400px] px-5 pb-20 pt-28 sm:px-6 lg:px-8">
        <Link href="/templates" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />
          Retour aux modèles
        </Link>

        <section className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[oklch(56%_0.22_29)]">Comparaison</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.95] text-slate-950 md:text-6xl">
              Voyez lequel vend le mieux votre image.
            </h1>
          </div>
          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-lg leading-8 text-slate-600">
              Gardez seulement les critères utiles avant de commander : rendu, prix, aperçu disponible et contenu inclus.
            </p>
            <button
              type="button"
              onClick={clearCompare}
              className="mt-6 inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
            >
              Vider la comparaison
            </button>
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
          <div className="grid border-b border-slate-200 lg:grid-cols-[260px_1fr]">
            <div className="hidden bg-slate-950 p-6 text-white lg:block">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Votre sélection</p>
              <p className="mt-4 text-2xl font-black leading-tight">{comparedTemplates.length} modèles comparés</p>
              <p className="mt-4 text-sm leading-6 text-white/55">
                Le meilleur choix est celui que votre client comprend sans explication.
              </p>
            </div>

            <div className="grid divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-3">
              {comparedTemplates.map((template) => {
                const price = getTemplatePrice(template);
                const isLowestPrice = lowestPrice !== null && price === lowestPrice;

                return (
                  <article key={template.id} className="relative min-h-full p-5">
                    <button
                      type="button"
                      onClick={() => toggleCompare(template.id)}
                      className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-colors hover:text-slate-950"
                      aria-label={`Retirer ${template.name} de la comparaison`}
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-100">
                      {getTemplateImage(template) ? (
                        <img
                          src={getTemplateImage(template)}
                          alt={`Aperçu du modèle ${template.name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">Aperçu indisponible</div>
                      )}
                    </div>

                    <div className="mt-5">
                      <p className="text-sm font-bold text-slate-500">{template.sector?.name || 'Secteur'}</p>
                      <h2 className="mt-1 text-2xl font-black leading-tight text-slate-950">{template.name}</h2>
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">{formatPrice(template)}</span>
                        {isLowestPrice && (
                          <span className="rounded-full bg-[oklch(96%_0.03_29)] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[oklch(45%_0.19_29)]">
                            Prix le plus bas
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <Link
                        href={`/templates/${template.id}/preview`}
                        className="inline-flex flex-1 justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-black text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
                      >
                        Voir
                      </Link>
                      <Link
                        href={`/commande?templateId=${template.id}`}
                        className="inline-flex flex-1 justify-center rounded-full bg-[oklch(56%_0.22_29)] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-slate-950"
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
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] border-collapse">
              <caption className="sr-only">Comparaison des modèles FRILO sélectionnés</caption>
              <thead>
                <tr>
                  <th className="w-[260px] border-b border-slate-200 bg-slate-50 px-6 py-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Critère
                  </th>
                  {comparedTemplates.map((template) => (
                    <th key={template.id} className="border-b border-slate-200 bg-slate-50 px-6 py-4 text-left text-sm font-black text-slate-950">
                      {template.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-slate-200 px-6 py-5 text-sm font-black text-slate-950">Prix affiché</td>
                  {comparedTemplates.map((template) => (
                    <td key={`price-${template.id}`} className="border-b border-slate-200 px-6 py-5 text-sm font-bold text-slate-700">
                      {formatPrice(template)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border-b border-slate-200 px-6 py-5 text-sm font-black text-slate-950">Aperçu complet</td>
                  {comparedTemplates.map((template) => (
                    <td key={`preview-${template.id}`} className="border-b border-slate-200 px-6 py-5 text-sm font-bold text-slate-700">
                      {hasLivePreview(template.preview_url) ? 'Disponible' : 'Non disponible'}
                    </td>
                  ))}
                </tr>

                {allFeatureRows.map((feature) => (
                  <tr key={feature}>
                    <td className="border-b border-slate-200 px-6 py-5 text-sm font-black text-slate-950">{feature}</td>
                    {comparedTemplates.map((template) => {
                      const hasFeature = parseFeatures(template.features).includes(feature);
                      return (
                        <td key={`${template.id}-${feature}`} className="border-b border-slate-200 px-6 py-5">
                          {hasFeature ? (
                            <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-800">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                              Inclus
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-slate-400">Non prévu</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-200 md:hidden">
            <div className="px-5 py-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Critères clés</p>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm font-black text-slate-950">Prix affiché</p>
              <div className="mt-3 space-y-2">
                {comparedTemplates.map((template) => (
                  <div key={`mobile-price-${template.id}`} className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-bold text-slate-500">{template.name}</span>
                    <span className="font-black text-slate-950">{formatPrice(template)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm font-black text-slate-950">Aperçu complet</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {comparedTemplates.map((template) => (
                  <span key={`mobile-preview-${template.id}`} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                    {template.name}
                  </span>
                ))}
              </div>
            </div>

            {allFeatureRows.map((feature) => {
              const includedTemplates = comparedTemplates.filter((template) => parseFeatures(template.features).includes(feature));

              return (
                <div key={`mobile-${feature}`} className="px-5 py-5">
                  <p className="text-sm font-black text-slate-950">{feature}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {includedTemplates.length > 0 ? (
                      includedTemplates.map((template) => (
                        <span key={`${template.id}-${feature}`} className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white">
                          <Check className="h-3.5 w-3.5" />
                          {template.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm font-bold text-slate-400">Non prévu</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function TemplatesComparePage() {
  return (
    <Suspense fallback={<CompareLoading />}>
      <TemplatesCompareContent />
    </Suspense>
  );
}
