"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Layers2, Search, Star, X } from 'lucide-react';
import {
  PublicEmptyState,
  PublicPageShell,
} from '@/components/public/PublicPageShell';
import { usePublicPricing } from '@/hooks/usePublicPricing';
import { formatPublicPrice } from '@/lib/publicPricing';
import { businessService, Sector, Template } from '@/services/business.service';
import { cn, parseFeatures } from '@/lib/utils';
import { hasLivePreview, parsePreviewGallery } from '@/lib/templatePreview';
import { useTemplateCollections } from '@/hooks/useTemplateCollections';

type TemplateSort = 'featured' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
type TemplatePriceFilter = 'all' | 'budget' | 'premium';

interface PersistedTemplateFilters {
  activeSlug: string | null;
  searchTerm: string;
  sortBy: TemplateSort;
  priceFilter: TemplatePriceFilter;
  showFavoritesOnly: boolean;
}

const FILTERS_STORAGE_KEY = 'frilo.templates.filters.v1';

const DEFAULT_TEMPLATE_IMAGES: Record<string, string> = {
  restaurants: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  btp: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  sante: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
  avocats: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
  coaching: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
  immobilier: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
  accompagnement: '/image/client-satisfait-frilo.jpg',
};

function getTemplatePrice(template: Template): number {
  return typeof template.price === 'string' ? parseInt(template.price, 10) : template.price;
}

function getTemplateImage(template: Template): string {
  return template.full_thumbnail_url || parsePreviewGallery(template.preview_gallery)[0] || '';
}

function getTemplateDisplayImage(template: Template): string {
  const templateImage = getTemplateImage(template);
  if (templateImage) {
    return templateImage;
  }

  return DEFAULT_TEMPLATE_IMAGES[template.sector?.slug ?? ''] || '/image/client-satisfait-frilo.jpg';
}

export default function TemplatesPage() {
  const { pricing } = usePublicPricing();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<TemplateSort>('featured');
  const [priceFilter, setPriceFilter] = useState<TemplatePriceFilter>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [compareNotice, setCompareNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersHydrated, setFiltersHydrated] = useState(false);

  const {
    favoriteIds,
    compareIds,
    isFavorite,
    isCompared,
    toggleFavorite,
    toggleCompare,
    clearCompare,
    maxCompareItems,
  } = useTemplateCollections();

  useEffect(() => {
    if (typeof window === 'undefined') {
      setFiltersHydrated(true);
      return;
    }

    try {
      const rawFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (rawFilters) {
        const parsed = JSON.parse(rawFilters) as Partial<PersistedTemplateFilters>;

        if (parsed.activeSlug === null || typeof parsed.activeSlug === 'string') {
          setActiveSlug(parsed.activeSlug ?? null);
        }
        if (typeof parsed.searchTerm === 'string') {
          setSearchTerm(parsed.searchTerm);
        }
        if (parsed.sortBy && ['featured', 'price_asc', 'price_desc', 'name_asc', 'name_desc'].includes(parsed.sortBy)) {
          setSortBy(parsed.sortBy as TemplateSort);
        }
        if (parsed.priceFilter && ['all', 'budget', 'premium'].includes(parsed.priceFilter)) {
          setPriceFilter(parsed.priceFilter as TemplatePriceFilter);
        }
        if (typeof parsed.showFavoritesOnly === 'boolean') {
          setShowFavoritesOnly(parsed.showFavoritesOnly);
        }
      }
    } catch {
      // Ignore persisted filter parse errors
    } finally {
      setFiltersHydrated(true);
    }
  }, []);

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
        setError('Impossible de charger le catalogue de modèles.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (loading || !activeSlug) {
      return;
    }

    const slugExists = sectors.some((sector) => sector.slug === activeSlug);
    if (!slugExists) {
      setActiveSlug(null);
    }
  }, [activeSlug, loading, sectors]);

  useEffect(() => {
    if (!filtersHydrated || typeof window === 'undefined') {
      return;
    }

    const payload: PersistedTemplateFilters = {
      activeSlug,
      searchTerm,
      sortBy,
      priceFilter,
      showFavoritesOnly,
    };

    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(payload));
  }, [activeSlug, filtersHydrated, priceFilter, searchTerm, showFavoritesOnly, sortBy]);

  useEffect(() => {
    if (!compareNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setCompareNotice(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [compareNotice]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const budgetThreshold = pricing.starting_price;
  const budgetThresholdLabel = formatPublicPrice(budgetThreshold, pricing.currency_label);

  const visibleTemplates = useMemo(() => {
    return templates
      .filter((template) => {
        if (!activeSlug) {
          return true;
        }
        return template.sector?.slug === activeSlug;
      })
      .filter((template) => {
        if (showFavoritesOnly) {
          return favoriteIds.includes(template.id);
        }

        return true;
      })
      .filter((template) => {
        if (priceFilter === 'all') {
          return true;
        }

        const price = getTemplatePrice(template);
        if (priceFilter === 'budget') {
          return price <= budgetThreshold;
        }

        return price > budgetThreshold;
      })
      .filter((template) => {
        if (!normalizedSearch) {
          return true;
        }

        const searchContent = [
          template.name,
          template.description,
          template.sector?.name ?? '',
          ...parseFeatures(template.features),
        ]
          .join(' ')
          .toLowerCase();

        return searchContent.includes(normalizedSearch);
      })
      .sort((templateA, templateB) => {
        if (sortBy === 'price_asc') {
          return getTemplatePrice(templateA) - getTemplatePrice(templateB);
        }
        if (sortBy === 'price_desc') {
          return getTemplatePrice(templateB) - getTemplatePrice(templateA);
        }
        if (sortBy === 'name_asc') {
          return templateA.name.localeCompare(templateB.name, 'fr');
        }
        if (sortBy === 'name_desc') {
          return templateB.name.localeCompare(templateA.name, 'fr');
        }
        return 0;
      });
  }, [activeSlug, budgetThreshold, favoriteIds, normalizedSearch, priceFilter, showFavoritesOnly, sortBy, templates]);

  const comparedTemplates = compareIds
    .map((id) => templates.find((template) => template.id === id))
    .filter((template): template is Template => Boolean(template));

  const hasActiveFilters =
    Boolean(activeSlug) ||
    Boolean(normalizedSearch) ||
    sortBy !== 'featured' ||
    priceFilter !== 'all' ||
    showFavoritesOnly;

  const resetFilters = () => {
    setActiveSlug(null);
    setSearchTerm('');
    setSortBy('featured');
    setPriceFilter('all');
    setShowFavoritesOnly(false);
  };

  const compareHref = compareIds.length > 0 ? `/templates/compare?ids=${compareIds.join(',')}` : '/templates/compare';

  return (
    <PublicPageShell className="bg-white pb-28 lg:pb-0">
      <section className="border-b border-gray-200 bg-white px-5 pt-28 md:px-8 md:pt-32">
        <div className="mx-auto max-w-[1240px] pb-12 text-center md:pb-16">
          <h1 className="mx-auto max-w-5xl text-balance text-5xl font-black leading-[0.95] text-black md:text-6xl lg:text-[5.75rem]">
            Trouvez une base claire pour votre futur site.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-pretty text-base leading-7 text-gray-700 md:text-lg md:leading-8">
            Parcourez des modèles pensés par activité. Vous choisissez le point de départ, FRILO adapte les textes, les images et les contacts avant livraison.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#catalogue"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[#2563eb]"
            >
              Parcourir les modèles
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <Link
              href="/contact?subject=Choix%20du%20mod%C3%A8le"
              className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-black text-black transition-colors hover:border-black"
            >
              Demander une recommandation
            </Link>
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <div className="flex items-center gap-6 overflow-x-auto py-4 scrollbar-hide">
            <button
              onClick={() => setActiveSlug(null)}
              className={cn(
                'whitespace-nowrap border-b-2 px-0.5 pb-1 text-sm font-black transition-colors',
                activeSlug === null
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black'
              )}
            >
              Tous
            </button>
            {sectors.map((sector) => (
              <button
                key={sector.slug}
                onClick={() => setActiveSlug(sector.slug)}
                className={cn(
                  'whitespace-nowrap border-b-2 px-0.5 pb-1 text-sm font-black transition-colors',
                  activeSlug === sector.slug
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
                )}
              >
                {sector.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="catalogue" className="px-5 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 grid gap-5 border-b border-gray-200 pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(520px,0.75fr)] lg:items-end">
            <div>
              <h2 className="text-3xl font-black leading-tight text-black md:text-4xl">
                Modèles disponibles
              </h2>
            {!loading && !error && (
                <p className="mt-2 text-sm font-semibold text-gray-600">
                {visibleTemplates.length} modèle{visibleTemplates.length > 1 ? 's' : ''} affiché{visibleTemplates.length > 1 ? 's' : ''}
                {normalizedSearch ? ` pour “${searchTerm.trim()}”` : ''}.
              </p>
            )}
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_170px]">
              <label htmlFor="templates-search" className="block">
                <span className="sr-only">Rechercher un modèle</span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="templates-search"
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Rechercher"
                    className="w-full rounded-none border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm text-black outline-none transition-colors placeholder:text-gray-600 focus:border-black"
                  />
                </div>
              </label>

              <label htmlFor="templates-sort" className="block">
                <span className="sr-only">Trier les modèles</span>
                <select
                  id="templates-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as TemplateSort)}
                  className="w-full rounded-none border border-gray-300 bg-white px-3 py-3 text-sm text-black outline-none transition-colors focus:border-black"
                >
                  <option value="featured">Tri recommandé</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="name_asc">Nom A → Z</option>
                  <option value="name_desc">Nom Z → A</option>
                </select>
              </label>

              <label htmlFor="templates-price-filter" className="block">
                <span className="sr-only">Filtrer par budget</span>
                <select
                  id="templates-price-filter"
                  value={priceFilter}
                  onChange={(event) => setPriceFilter(event.target.value as TemplatePriceFilter)}
                  className="w-full rounded-none border border-gray-300 bg-white px-3 py-3 text-sm text-black outline-none transition-colors focus:border-black"
                >
                  <option value="all">Tous budgets</option>
                  <option value="budget">Budget {budgetThresholdLabel}</option>
                  <option value="premium">Premium &gt; {budgetThresholdLabel}</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowFavoritesOnly((prev) => !prev)}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-black transition-colors',
                showFavoritesOnly
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-black hover:text-black'
              )}
            >
              <Star className={cn('h-4 w-4', showFavoritesOnly ? 'fill-white' : '')} />
              Favoris ({favoriteIds.length})
            </button>

            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-black text-gray-700 transition-colors enabled:hover:border-black enabled:hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X className="h-4 w-4" />
              Réinitialiser
            </button>
          </div>

              {loading ? (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="h-96 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : error ? (
            <div className="border border-amber-200 bg-amber-50 px-6 py-10 text-center">
              <p className="text-sm text-amber-800">{error}</p>
            </div>
          ) : visibleTemplates.length > 0 ? (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {visibleTemplates.map((template) => {
                const templateId = template.id;
                const image = getTemplateDisplayImage(template);
                const price = getTemplatePrice(template);
                const features = parseFeatures(template.features);
                const livePreview = hasLivePreview(template.preview_url);
                const galleryCount = parsePreviewGallery(template.preview_gallery).length;

                return (
                  <article
                    key={template.id}
                    className="group flex min-h-full flex-col bg-white"
                  >
                    <Link href={`/templates/${template.id}`} className="relative block aspect-[4/3] overflow-hidden bg-gray-100">
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                          style={{ backgroundImage: `url(${image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-16">
                          {template.sector?.name && (
                            <p className="text-xs font-black text-white/75">{template.sector.name}</p>
                          )}
                          <p className="mt-1 text-balance text-2xl font-black leading-tight text-white">
                            {template.name}
                          </p>
                        </div>
                        <div className="absolute right-3 top-3 flex items-center gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                          <button
                            type="button"
                            aria-label={isFavorite(templateId) ? `Retirer ${template.name} des favoris` : `Ajouter ${template.name} aux favoris`}
                            aria-pressed={isFavorite(templateId)}
                            onClick={(event) => {
                              event.preventDefault();
                              toggleFavorite(templateId);
                            }}
                            className={cn(
                              'inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
                              isFavorite(templateId)
                                ? 'border-black bg-black text-white'
                                : 'border-white bg-white/95 text-black hover:border-black'
                            )}
                          >
                            <Star className={cn('h-4 w-4', isFavorite(templateId) ? 'fill-white' : '')} />
                          </button>
                          <button
                            type="button"
                            aria-label={isCompared(templateId) ? `Retirer ${template.name} de la comparaison` : `Ajouter ${template.name} à la comparaison`}
                            aria-pressed={isCompared(templateId)}
                            disabled={compareIds.length >= maxCompareItems && !isCompared(templateId)}
                            onClick={(event) => {
                              event.preventDefault();
                              const result = toggleCompare(templateId);
                              if (result === 'max_reached') {
                                setCompareNotice(`Vous pouvez comparer jusqu'à ${maxCompareItems} modèles.`);
                              }
                            }}
                            className={cn(
                              'inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-45',
                              isCompared(templateId)
                                ? 'border-[#2563eb] bg-[#2563eb] text-white'
                                : 'border-white bg-white/95 text-black hover:border-black'
                            )}
                          >
                            <Layers2 className="h-4 w-4" />
                          </button>
                        </div>
                      </Link>

                      <div className="flex flex-1 flex-col gap-4 pt-4">
                        <div className="grid gap-3 border-b border-gray-200 pb-4">
                          <div className="grid gap-2">
                            <div className="flex items-start justify-between gap-4">
                            <Link
                              href={`/templates/${template.id}`}
                                className="block text-balance text-2xl font-black leading-tight text-black transition-colors hover:text-[#2563eb]"
                            >
                              {template.name}
                            </Link>
                              <p className="shrink-0 text-sm font-black text-black">
                              {price.toLocaleString('fr-FR')} <span className="text-xs font-bold text-gray-500">FCFA</span>
                            </p>
                            </div>
                            {template.sector?.name && (
                              <p className="text-sm font-black text-[#2563eb]">{template.sector.name}</p>
                            )}
                            {template.description && (
                              <p className="line-clamp-2 text-sm leading-6 text-gray-700">{template.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {livePreview && (
                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-[#1d4ed8]">
                              Aperçu interactif
                            </span>
                          )}
                          {!livePreview && galleryCount > 0 && (
                            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-black text-gray-700">
                              {galleryCount} capture{galleryCount > 1 ? 's' : ''}
                            </span>
                          )}
                          {features.slice(0, 2).map((feature) => (
                            <span key={feature} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700">
                              {feature}
                            </span>
                          ))}
                        </div>

                        <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row">
                          <Link
                            href={`/templates/${template.id}`}
                            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#2563eb]"
                          >
                            Voir ce modèle
                          </Link>
                          <Link
                            href={`/commande?templateId=${template.id}`}
                            className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-black text-black transition-colors hover:border-black"
                          >
                            Commander
                          </Link>
                        </div>
                      </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <PublicEmptyState
              title="Aucun modèle ne correspond à ces filtres."
              description="Retirez un filtre ou décrivez votre activité à FRILO pour recevoir une recommandation de modèle."
              action={{ label: 'Demander une recommandation', href: '/contact?subject=Recommandation%20de%20mod%C3%A8le' }}
            />
          )}
        </div>
      </section>

      <section className="px-5 pb-8 md:px-8 md:pb-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 border-y border-black py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black leading-tight text-black">Vous ne trouvez pas le modèle adapté ?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Décrivez votre activité. FRILO vous proposera le modèle le plus proche avant la commande.
            </p>
          </div>
          <Link
            href="/contact?subject=Choix%20du%20mod%C3%A8le"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[#2563eb]"
          >
            Demander un avis
          </Link>
        </div>
      </section>

      {comparedTemplates.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Comparaison</p>
              <p className="text-sm text-gray-600 truncate">
                {comparedTemplates.map((template) => template.name).join(' · ')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCompare}
                className="sq-btn sq-btn-outline-black text-sm py-2.5 px-4"
              >
                Vider
              </button>
              <Link href={compareHref} className="sq-btn sq-btn-black text-sm py-2.5 px-4">
                Comparer ({comparedTemplates.length})
              </Link>
            </div>
          </div>
        </div>
      )}

      {compareNotice && (
        <div className="fixed bottom-24 right-4 z-50 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">{compareNotice}</p>
        </div>
      )}
    </PublicPageShell>
  );
}
