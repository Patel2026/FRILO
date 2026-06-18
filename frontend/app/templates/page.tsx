"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Star, X } from 'lucide-react';
import { TemplateCard } from '@/components/business/TemplateCard';
import {
  PublicBenefitStrip,
  PublicEmptyState,
  PublicFinalCta,
  PublicHero,
  PublicPageShell,
} from '@/components/public/PublicPageShell';
import { PUBLIC_PAGE_TEXT } from '@/components/public/publicPageCopy';
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

function getTemplatePrice(template: Template): number {
  return typeof template.price === 'string' ? parseInt(template.price, 10) : template.price;
}

function getTemplateImage(template: Template): string {
  return template.full_thumbnail_url || parsePreviewGallery(template.preview_gallery)[0] || '';
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
    <PublicPageShell className="pb-28 lg:pb-0">
      <PublicHero
        eyebrow="Modèles FRILO"
        title={PUBLIC_PAGE_TEXT.templates.heroTitle}
        description={PUBLIC_PAGE_TEXT.templates.heroDescription}
        primaryAction={{ label: 'Voir les modèles', href: '#catalogue' }}
        secondaryAction={{ label: 'Besoin d’aide ?', href: '/contact?subject=Choix%20du%20mod%C3%A8le' }}
        aside={(
          <div className="grid gap-4 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.16)]">
            <p className="text-lg font-black leading-tight text-black">
              Choisissez comme un client regarde votre entreprise.
            </p>
            <div className="grid gap-3 text-sm leading-6 text-black/62">
              <p>1. L’image doit rassurer vite.</p>
              <p>2. Le contenu doit parler de votre activité.</p>
              <p>3. FRILO remplace les exemples par vos informations.</p>
            </div>
          </div>
        )}
      />

      <PublicBenefitStrip
        items={[
          { title: 'Aperçu concret', description: 'Vous voyez la base visuelle avant de commander.' },
          { title: 'Prix visible', description: 'Le prix du modèle et les options restent lisibles.' },
          { title: 'Adaptation FRILO', description: 'Le modèle devient un site à votre nom, avec vos contenus.' },
        ]}
      />

      <div className="sticky top-16 z-30 border-b border-black/10 bg-[#f7f4ec]/95 backdrop-blur">
        <div className="mx-auto max-w-[1360px] px-5 md:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            <button
              onClick={() => setActiveSlug(null)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition-colors',
                activeSlug === null
                  ? 'bg-black text-white'
                  : 'bg-white text-black/62 hover:bg-black hover:text-white'
              )}
            >
              Tous
            </button>
            {sectors.map((sector) => (
              <button
                key={sector.slug}
                onClick={() => setActiveSlug(sector.slug)}
                className={cn(
                  'whitespace-nowrap rounded-full px-4 py-2 text-sm font-black transition-colors',
                  activeSlug === sector.slug
                    ? 'bg-black text-white'
                    : 'bg-white text-black/62 hover:bg-black hover:text-white'
                )}
              >
                {sector.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div id="catalogue" className="px-5 py-10 md:px-8 md:py-12">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">Sélection</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-black md:text-4xl">
                Trouvez une base qui ressemble déjà à une vraie entreprise.
              </h2>
            </div>
            {!loading && !error && (
              <p className="max-w-sm text-sm leading-6 text-black/62">
                {visibleTemplates.length} modèle{visibleTemplates.length > 1 ? 's' : ''} affiché{visibleTemplates.length > 1 ? 's' : ''}
                {normalizedSearch ? ` pour “${searchTerm.trim()}”` : ''}.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 border-y border-black bg-white p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_220px_auto_auto]">
          <label htmlFor="templates-search" className="block">
            <span className="sr-only">Rechercher un modèle</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="templates-search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher un modèle"
                className="w-full rounded-full border border-black/15 bg-white py-3 pl-10 pr-3 text-sm text-black outline-none transition-colors focus:border-black"
              />
            </div>
          </label>

          <label htmlFor="templates-sort" className="block">
            <span className="sr-only">Trier les modèles</span>
            <select
              id="templates-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as TemplateSort)}
              className="w-full rounded-full border border-black/15 bg-white px-3 py-3 text-sm text-black outline-none transition-colors focus:border-black"
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
              className="w-full rounded-full border border-black/15 bg-white px-3 py-3 text-sm text-black outline-none transition-colors focus:border-black"
            >
              <option value="all">Tous les budgets</option>
              <option value="budget">Budget {budgetThresholdLabel}</option>
              <option value="premium">Premium &gt; {budgetThresholdLabel}</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => setShowFavoritesOnly((prev) => !prev)}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-black transition-colors',
              showFavoritesOnly
                ? 'border-black bg-black text-white'
                : 'border-black/15 bg-white text-black/62 hover:border-black hover:text-black'
            )}
          >
            <Star className={cn('w-4 h-4', showFavoritesOnly ? 'fill-white' : '')} />
            Favoris ({favoriteIds.length})
          </button>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-4 py-3 text-sm font-black text-black/62 transition-colors enabled:hover:border-black enabled:hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>
        </div>
      </div>

      <div className="px-5 pb-14 md:px-8 md:pb-16">
        <div className="mx-auto max-w-[1360px]">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="aspect-[3/2] animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
              <p className="text-sm text-amber-800">{error}</p>
            </div>
          ) : visibleTemplates.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {visibleTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  id={String(template.id)}
                  name={template.name}
                  sectorName={template.sector?.name}
                  price={getTemplatePrice(template)}
                  features={parseFeatures(template.features)}
                  image={getTemplateImage(template)}
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
            <PublicEmptyState
              title="Aucun modèle ne correspond à ces filtres."
              description="Retirez un filtre ou décrivez votre activité à FRILO pour recevoir une recommandation de modèle."
              action={{ label: 'Demander une recommandation', href: '/contact?subject=Recommandation%20de%20mod%C3%A8le' }}
            />
          )}
        </div>
      </div>

      <PublicFinalCta
        title="Vous hésitez entre plusieurs modèles ?"
        description="Dites-nous votre activité, votre budget et le type de clients que vous voulez rassurer."
        href="/contact?subject=Choix%20du%20mod%C3%A8le"
        label="Demander un avis"
      />

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
