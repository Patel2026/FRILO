"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Star, X } from 'lucide-react';
import { TemplateCard } from '@/components/business/TemplateCard';
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

function getTemplatePrice(template: Template): number {
  return typeof template.price === 'string' ? parseInt(template.price, 10) : template.price;
}

export default function TemplatesPage() {
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
          return price <= 50000;
        }

        return price > 50000;
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
  }, [activeSlug, favoriteIds, normalizedSearch, priceFilter, showFavoritesOnly, sortBy, templates]);

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
    <div className="min-h-screen bg-white pb-28 lg:pb-0">
      <div className="pt-32 pb-16 sq-container text-center">
        <p className="sq-label mb-4">Catalogue</p>
        <h1 className="sq-display text-black mb-6">Nos modèles.</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Filtrez, comparez et trouvez rapidement le modèle qui convertit pour votre activité.
        </p>
      </div>

      <div className="border-y border-gray-100 sticky top-16 bg-white z-30">
        <div className="sq-container">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide -mb-px">
            <button
              onClick={() => setActiveSlug(null)}
              className={cn(
                'text-sm font-medium px-5 py-4 whitespace-nowrap border-b-2 transition-colors',
                activeSlug === null
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-black'
              )}
            >
              Tous
            </button>
            {sectors.map((sector) => (
              <button
                key={sector.slug}
                onClick={() => setActiveSlug(sector.slug)}
                className={cn(
                  'text-sm font-medium px-5 py-4 whitespace-nowrap border-b-2 transition-colors',
                  activeSlug === sector.slug
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-400 hover:text-black'
                )}
              >
                {sector.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sq-container py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_220px_auto_auto] gap-3">
          <label htmlFor="templates-search" className="block">
            <span className="sr-only">Rechercher un modèle</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="templates-search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher par nom, secteur ou fonctionnalité"
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm text-black outline-none focus:border-black"
              />
            </div>
          </label>

          <label htmlFor="templates-sort" className="block">
            <span className="sr-only">Trier les modèles</span>
            <select
              id="templates-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as TemplateSort)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-black outline-none focus:border-black"
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
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-black outline-none focus:border-black"
            >
              <option value="all">Tous les budgets</option>
              <option value="budget">Budget 50 000 FCFA</option>
              <option value="premium">Premium &gt; 50 000 FCFA</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => setShowFavoritesOnly((prev) => !prev)}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
              showFavoritesOnly
                ? 'border-black bg-black text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:text-black hover:border-black'
            )}
          >
            <Star className={cn('w-4 h-4', showFavoritesOnly ? 'fill-white' : '')} />
            Favoris ({favoriteIds.length})
          </button>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition-colors enabled:hover:text-black enabled:hover:border-black disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>

        {!loading && !error && (
          <p className="mt-3 text-sm text-gray-500">
            {visibleTemplates.length} modèle{visibleTemplates.length > 1 ? 's' : ''} trouvé{visibleTemplates.length > 1 ? 's' : ''}
            {normalizedSearch ? ` pour “${searchTerm.trim()}”` : ''}.
          </p>
        )}
      </div>

      <div className="sq-section pt-2">
        <div className="sq-container">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="aspect-[3/2] bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
              <p className="text-sm text-amber-800">{error}</p>
            </div>
          ) : visibleTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {visibleTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  id={String(template.id)}
                  name={template.name}
                  sectorName={template.sector?.name}
                  price={getTemplatePrice(template)}
                  features={parseFeatures(template.features)}
                  image={template.full_thumbnail_url}
                  hasLivePreview={hasLivePreview(template.preview_url)}
                  previewScreens={parsePreviewGallery(template.preview_gallery).length}
                  isFavorite={isFavorite(template.id)}
                  isCompared={isCompared(template.id)}
                  compareDisabled={compareIds.length >= maxCompareItems}
                  onToggleFavorite={toggleFavorite}
                  onToggleCompare={(templateId) => {
                    const result = toggleCompare(templateId);
                    if (result === 'max_reached') {
                      setCompareNotice(`Vous pouvez comparer jusqu'à ${maxCompareItems} modèles.`);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-12 text-center">
              <h2 className="text-xl font-black text-black tracking-tight mb-3">Aucun modèle ne correspond à vos filtres.</h2>
              <p className="text-sm text-gray-500 max-w-lg mx-auto">
                Essayez un autre secteur, retirez un filtre de budget ou utilisez un mot-clé plus large pour trouver un modèle adapté.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={resetFilters} className="sq-btn sq-btn-black text-sm py-3 px-6">
                  Réinitialiser les filtres
                </button>
                <Link href="/contact" className="sq-btn sq-btn-outline-black text-sm py-3 px-6">
                  Demander une recommandation
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 py-20 text-center">
        <p className="text-gray-500 text-sm mb-4">Vous ne trouvez pas ce que vous cherchez ?</p>
        <Link href="/contact" className="sq-btn sq-btn-black inline-flex">
          Parler à un expert
        </Link>
      </div>

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
    </div>
  );
}
