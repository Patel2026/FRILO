"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, ExternalLink, MessageSquare, Monitor, Paintbrush, Smartphone, Star, Tablet, Type } from 'lucide-react';
import { TestimonialCard } from '@/components/business/TestimonialCard';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { useAuthState } from '@/hooks/useAuthState';
import { businessService, Template, TemplateReview, TemplateReviewEligibility, TemplateReviewSummary } from '@/services/business.service';
import { cn } from '@/lib/utils';
import { buildPreviewUrl, hasLivePreview, parsePreviewGallery, parsePreviewPages } from '@/lib/templatePreview';
import {
  buildOrderUrl,
  buildTemplatePreviewUrl,
  resolveDefaultFontPairingId,
  resolveDefaultPaletteId,
  resolveTemplateFontPairings,
  resolveTemplatePalettes,
} from '@/lib/templatePersonalization';
import { trackFunnelEvent } from '@/lib/analytics';
import axios from 'axios';

const SECTOR_FALLBACK_IMAGES: Record<string, string> = {
  restaurants: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
  btp: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80',
  sante: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80',
  avocats: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80',
  coaching: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=80',
  immobilier: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80',
  accompagnement: '/image/client-satisfait-frilo.jpg',
};

export default function TemplateDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, isAuthenticated, loading: authLoading } = useAuthState();
  const [template, setTemplate] = useState<Template | null>(null);
  const [templateReviews, setTemplateReviews] = useState<TemplateReview[]>([]);
  const [reviewsSummary, setReviewsSummary] = useState<TemplateReviewSummary>({ count: 0, average_rating: null });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewEligibility, setReviewEligibility] = useState<TemplateReviewEligibility | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activePreviewPath, setActivePreviewPath] = useState('/');
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [selectedPaletteId, setSelectedPaletteId] = useState('');
  const [selectedFontPairingId, setSelectedFontPairingId] = useState('');
  const [recommendedTemplates, setRecommendedTemplates] = useState<Template[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      businessService.getTemplate(id),
      businessService.getTemplateReviews(id).catch(() => ({
        summary: { count: 0, average_rating: null },
        data: [],
      })),
    ])
      .then(([templateData, reviewsResponse]) => {
        setTemplate(templateData);
        setTemplateReviews(reviewsResponse.data);
        setReviewsSummary(reviewsResponse.summary);
        const pages = parsePreviewPages(templateData.preview_pages);
        const palettes = resolveTemplatePalettes(templateData);
        const fontPairings = resolveTemplateFontPairings(templateData);
        setActivePreviewPath(pages[0]?.path ?? '/');
        setActiveGalleryIndex(0);
        setSelectedPaletteId(resolveDefaultPaletteId(templateData, palettes));
        setSelectedFontPairingId(resolveDefaultFontPairingId(templateData, fontPairings));

        const sectorSlug = templateData.sector?.slug;
        businessService.getTemplates(sectorSlug)
          .then(async (sectorTemplates) => {
            const related = sectorTemplates.filter((item) => item.id !== templateData.id);

            if (related.length >= 3 || !sectorSlug) {
              setRecommendedTemplates(related.slice(0, 3));
              return;
            }

            const allTemplates = await businessService.getTemplates();
            const fallback = allTemplates
              .filter((item) => item.id !== templateData.id && !related.some((relatedItem) => relatedItem.id === item.id))
              .slice(0, 3 - related.length);
            setRecommendedTemplates([...related, ...fallback].slice(0, 3));
          })
          .catch(() => setRecommendedTemplates([]));
      })
      .catch(() => {
        setTemplate(null);
        setTemplateReviews([]);
        setReviewsSummary({ count: 0, average_rating: null });
      })
      .finally(() => {
        setLoading(false);
        setReviewsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id || authLoading) {
      return;
    }

    if (!isAuthenticated || user?.role !== 'client') {
      setReviewEligibility(null);
      return;
    }

    businessService.getTemplateReviewEligibility(id)
      .then((response) => setReviewEligibility(response))
      .catch(() => {
        setReviewEligibility(null);
      });
  }, [authLoading, id, isAuthenticated, user?.role]);

  useEffect(() => {
    if (reviewEligibility?.existing_review) {
      setReviewRating(reviewEligibility.existing_review.rating);
      setReviewContent(reviewEligibility.existing_review.content);
      return;
    }

    setReviewRating(5);
    setReviewContent('');
  }, [reviewEligibility?.existing_review, reviewEligibility?.can_review]);

  useEffect(() => {
    if (!template) {
      return;
    }

    trackFunnelEvent('view_template', {
      template_id: template.id,
      template_name: template.name,
      sector_slug: template.sector?.slug ?? null,
      price: typeof template.price === 'string' ? parseInt(template.price, 10) : template.price,
    });
  }, [template]);

  useEffect(() => {
    if (!reviewNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setReviewNotice(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [reviewNotice]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Modèle introuvable.</p>
        <Link href="/templates" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white">
          Retour aux modèles
        </Link>
      </div>
    );
  }

  const previewPages = parsePreviewPages(template.preview_pages);
  const previewGallery = parsePreviewGallery(template.preview_gallery);
  const colorPalettes = resolveTemplatePalettes(template);
  const fontPairings = resolveTemplateFontPairings(template);
  const selectedPalette = colorPalettes.find((palette) => palette.id === selectedPaletteId) ?? colorPalettes[0];
  const selectedFontPairing = fontPairings.find((pairing) => pairing.id === selectedFontPairingId) ?? fontPairings[0];
  const selectedColors = selectedPalette?.colors?.slice(0, 4) ?? [];
  const orderUrl = buildOrderUrl(template.id, selectedPalette?.id, selectedFontPairing?.id);
  const previewUrl = buildTemplatePreviewUrl(template.id, selectedPalette?.id, selectedFontPairing?.id);
  const livePreviewEnabled = hasLivePreview(template.preview_url);
  const selectedPreviewPath = previewPages.length > 0 ? activePreviewPath || previewPages[0].path : '/';
  const iframeSrc = livePreviewEnabled && template.preview_url
    ? buildPreviewUrl(template.preview_url, selectedPreviewPath, {
      palette: selectedPalette?.id,
      font: selectedFontPairing?.id,
    })
    : null;
  const canBrowseGallery = !livePreviewEnabled && previewGallery.length > 1;
  const galleryImage = previewGallery[activeGalleryIndex] ?? previewGallery[0] ?? null;
  const primaryPreviewImage = galleryImage ?? template.full_thumbnail_url ?? getSectorFallbackImage(template.sector?.slug);
  const price = typeof template.price === 'string' ? parseInt(template.price) : template.price;

  const refreshReviewData = async () => {
    if (!id) {
      return;
    }

    const reviewsResponse = await businessService.getTemplateReviews(id);
    setTemplateReviews(reviewsResponse.data);
    setReviewsSummary(reviewsResponse.summary);

    if (isAuthenticated && user?.role === 'client') {
      const eligibility = await businessService.getTemplateReviewEligibility(id);
      setReviewEligibility(eligibility);
    }
  };

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!template) {
      return;
    }

    setReviewSubmitting(true);
    setReviewError(null);
    setReviewNotice(null);

    try {
      const response = await businessService.submitTemplateReview(template.id, {
        rating: reviewRating,
        content: reviewContent.trim(),
      });
      setReviewNotice(response.message);
      await refreshReviewData();
    } catch (error) {
      if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
        setReviewError(error.response.data.message);
      } else if (axios.isAxiosError(error) && error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors as Record<string, string[]>)[0]?.[0];
        setReviewError(firstError || 'Impossible d’enregistrer votre avis pour le moment.');
      } else {
        setReviewError('Impossible d’enregistrer votre avis pour le moment.');
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <PublicPageShell className="bg-white pb-24 lg:pb-0">
      <div className="fixed left-0 right-0 top-0 z-50 border-b border-black/10 bg-white">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <Link
            href={template.sector ? `/secteurs/${template.sector.slug}` : '/templates'}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-black/62 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>

          <div className="hidden min-w-0 flex-1 text-center md:block">
            <span className="truncate text-sm font-black text-black">{template.name}</span>
            {template.sector && (
              <span className="ml-2 text-xs font-semibold text-black/40">{template.sector.name}</span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode('desktop')}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  viewMode === 'desktop' ? 'bg-black text-white' : 'text-black/40 hover:text-black'
                )}
                aria-label="Affichage desktop"
                aria-pressed={viewMode === 'desktop'}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tablet')}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  viewMode === 'tablet' ? 'bg-black text-white' : 'text-black/40 hover:text-black'
                )}
                aria-label="Affichage tablette"
                aria-pressed={viewMode === 'tablet'}
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mobile')}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  viewMode === 'mobile' ? 'bg-black text-white' : 'text-black/40 hover:text-black'
                )}
                aria-label="Affichage mobile"
                aria-pressed={viewMode === 'mobile'}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            <Link
              href={orderUrl}
              className="hidden rounded-full bg-black px-5 py-2.5 text-sm font-black text-white transition-colors hover:bg-[#e60000] lg:inline-flex"
              onClick={() =>
                trackFunnelEvent('start_order', {
                  template_id: template.id,
                  template_name: template.name,
                  source: 'template_detail_topbar',
                })
              }
            >
              Commander
            </Link>
          </div>
        </div>
      </div>

      <main className="pt-16">
        <section className="grid min-h-[calc(100vh-4rem)] bg-white lg:grid-cols-[minmax(0,1fr)_410px]" style={{ backgroundColor: '#fff' }}>
          <div className="relative order-2 flex items-center justify-center border-b border-black/10 bg-white px-4 py-6 md:px-8 lg:order-1 lg:border-b-0 lg:border-r lg:py-8">
            <div
              className={cn(
                'relative overflow-hidden bg-white transition-all duration-300',
                viewMode === 'desktop' && 'h-[360px] w-full max-w-5xl border border-black/15 md:h-[600px] lg:h-[min(76vh,780px)]',
                viewMode === 'tablet' && 'h-[560px] w-full max-w-[760px] rounded-2xl border-[10px] border-black md:h-[720px] md:w-[560px] lg:h-[min(76vh,780px)] lg:w-[min(760px,82%)]',
                viewMode === 'mobile' && 'h-[520px] w-[290px] rounded-[1.75rem] border-[10px] border-black md:h-[680px] md:w-[360px]'
              )}
              style={{ outlineColor: selectedColors[2] ?? undefined }}
            >
              {iframeSrc ? (
                <iframe src={iframeSrc} className="h-full w-full" title={`Aperçu interactif ${template.name}`} />
              ) : primaryPreviewImage ? (
                <div
                  className="h-full w-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${primaryPreviewImage})` }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white">
                  <div className="max-w-xs text-center">
                    <Monitor className="mx-auto mb-4 h-12 w-12 text-black/25" />
                    <p className="text-lg font-black text-black">Aperçu en préparation</p>
                    <p className="mt-2 text-sm leading-6 text-black/55">Le visuel principal sera visible dès qu’une image ou une démo sera associée à ce modèle.</p>
                  </div>
                </div>
              )}
            </div>

            {canBrowseGallery && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <div className="flex items-center gap-2 rounded-full bg-slate-950/70 px-3 py-2">
                  {previewGallery.map((_, index) => (
                    <button
                      type="button"
                      key={`preview-gallery-${index}`}
                      onClick={() => setActiveGalleryIndex(index)}
                      className={cn(
                        'h-2.5 w-2.5 rounded-full transition-colors',
                        index === activeGalleryIndex ? 'bg-white' : 'bg-white/35 hover:bg-white/60'
                      )}
                      aria-label={`Capture ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="order-1 bg-white px-6 py-5 md:px-8 lg:order-2 lg:sticky lg:top-16 lg:self-start" style={{ backgroundColor: '#fff' }}>
            <div className="space-y-5">
              <div className="border-b border-black/10 pb-5">
                <Link href="/templates" className="mb-5 inline-flex items-center gap-2 text-sm font-black text-black/55 transition-colors hover:text-black lg:hidden">
                  <ArrowLeft className="h-4 w-4" />
                  Tous les modèles
                </Link>
                {template.sector && (
                  <p className="mb-3 text-sm font-black text-[#2563eb]">
                    {template.sector.name}
                  </p>
                )}
                <h1 className="text-balance break-words text-4xl font-black leading-[0.95] tracking-[-0.03em] text-black md:text-[3.05rem]">
                  {template.name}
                </h1>
                <p className="mt-4 text-base leading-7 text-black/65">
                  {template.description}
                </p>
              </div>

              <div className="grid gap-3">
                <Link
                  href={orderUrl}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-7 py-4 text-sm font-black text-white transition-colors hover:bg-[#e60000] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  onClick={() =>
                    trackFunnelEvent('start_order', {
                      template_id: template.id,
                      template_name: template.name,
                      source: 'template_detail_sidebar',
                    })
                  }
                >
                  Choisir ce modèle
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={previewUrl}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 rounded-full border border-black/15 px-4 py-3 text-sm font-black text-black transition-colors hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
                      !livePreviewEnabled && 'col-span-2'
                    )}
                    onClick={() =>
                      trackFunnelEvent('open_preview', {
                        template_id: template.id,
                        template_name: template.name,
                        source: 'template_detail_sidebar',
                      })
                    }
                  >
                    Voir l’aperçu
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  {livePreviewEnabled && (
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-full border border-black/15 px-4 py-3 text-sm font-black text-black transition-colors hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                      Question
                    </Link>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 border-y border-black">
                <div className="border-r border-black/10 py-4 pr-4">
                  <p className="text-xs font-black text-black/45">Prix</p>
                  <p className="mt-1 text-2xl font-black tracking-[-0.02em] text-black">
                    {price.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div className="py-4 pl-4">
                  <p className="text-xs font-black text-black/45">Livraison</p>
                  <p className="mt-1 text-2xl font-black tracking-[-0.02em] text-black">48h</p>
                </div>
              </div>

              <div className="grid gap-3 border-y border-black py-4">
                <a
                  href="#style-options"
                  className="group flex items-center justify-between gap-4 border-b border-black/10 pb-3 text-sm font-black text-black transition-colors hover:text-[#2563eb] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <span>
                    Style modifiable
                    <span className="mt-1 block text-xs font-semibold leading-5 text-black/55 group-hover:text-[#2563eb]">
                      Ajustez les couleurs et la typographie avant commande.
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </a>
                <a href="#style-options" className="group grid gap-3 text-left">
                  <span className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm font-black text-black">
                      <Paintbrush className="h-4 w-4 text-black/45" />
                      Couleurs
                    </span>
                    <span className="text-xs font-black text-black/45 group-hover:text-black">Modifier</span>
                  </span>
                  <span className="grid h-10 grid-cols-4 overflow-hidden border border-black/10">
                    {selectedColors.map((color, index) => (
                      <span key={`${selectedPalette?.id}-${color}-${index}`} style={{ backgroundColor: color }} />
                    ))}
                  </span>
                  <span className="text-sm font-black text-black/65">{selectedPalette?.name}</span>
                </a>
                <a href="#style-options" className="group border-t border-black/10 pt-3">
                  <span className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-sm font-black text-black">
                      <Type className="h-4 w-4 text-black/45" />
                      Typographie
                    </span>
                    <span className="text-xs font-black text-black/45 group-hover:text-black">Modifier</span>
                  </span>
                  <span className="mt-2 block text-sm font-black text-black/65">
                    {selectedFontPairing?.name}
                  </span>
                  <span className="mt-1 block text-xs text-black/50">
                    {selectedFontPairing?.heading || 'Titre'} + {selectedFontPairing?.body || 'Texte'}
                  </span>
                </a>
              </div>

            </div>
          </aside>
        </section>

        <section id="style-options" className="border-t border-black/10 bg-white px-6 py-12 md:px-8 md:py-16">
          <div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div>
              <h2 className="text-balance text-4xl font-black leading-[0.98] tracking-[-0.03em] text-black md:text-5xl">
                Ajustez le style avant de commander.
              </h2>
              <p className="mt-5 max-w-sm text-base leading-7 text-black/62">
                Choisissez une direction visuelle. FRILO garde cette préférence pendant la commande et adapte le rendu final.
              </p>
            </div>

            <div className="grid gap-8">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Paintbrush className="h-4 w-4 text-black/45" />
                  <p className="text-sm font-black text-black">Palettes de couleurs</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {colorPalettes.map((palette) => {
                    const active = palette.id === selectedPalette?.id;
                    const colors = palette.colors?.slice(0, 4) ?? [];

                    return (
                      <button
                        type="button"
                        key={palette.id}
                        data-testid={`template-palette-${palette.id}`}
                        onPointerDown={() => setSelectedPaletteId(palette.id)}
                        onClick={() => setSelectedPaletteId(palette.id)}
                        aria-pressed={active}
                        className={cn(
                          'min-w-0 border p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
                          active ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black hover:border-black'
                        )}
                      >
                        <span className="grid h-16 grid-cols-4 overflow-hidden border border-black/10">
                          {colors.map((color, index) => (
                            <span
                              key={`${palette.id}-${color}-${index}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </span>
                        <span className="mt-3 flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-black">{palette.name}</span>
                          <span className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                            active ? 'border-white bg-white text-black' : 'border-black/20 text-transparent'
                          )}>
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-black/10 pt-8">
                <div className="mb-4 flex items-center gap-2">
                  <Type className="h-4 w-4 text-black/45" />
                  <p className="text-sm font-black text-black">Packs de polices</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {fontPairings.map((pairing) => {
                    const active = pairing.id === selectedFontPairing?.id;

                    return (
                      <button
                        type="button"
                        key={pairing.id}
                        data-testid={`template-font-${pairing.id}`}
                        onPointerDown={() => setSelectedFontPairingId(pairing.id)}
                        onClick={() => setSelectedFontPairingId(pairing.id)}
                        aria-pressed={active}
                        className={cn(
                          'border p-5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
                          active ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black hover:border-black'
                        )}
                      >
                        <span className="flex items-start justify-between gap-4">
                          <span>
                            <span className="block text-sm font-black">{pairing.name}</span>
                            <span className={cn('mt-1 block text-xs', active ? 'text-white/60' : 'text-black/50')}>
                              {pairing.heading || 'Titre'} + {pairing.body || 'Texte'}
                            </span>
                          </span>
                          <span className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                            active ? 'border-white bg-white text-black' : 'border-black/20 text-transparent'
                          )}>
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        </span>
                        <span className={cn('mt-6 block border-t pt-4', active ? 'border-white/20' : 'border-black/10')}>
                          <span className="block text-3xl font-black leading-none tracking-[-0.03em]">Titre du site</span>
                          <span className={cn('mt-3 block max-w-sm text-sm leading-6', active ? 'text-white/65' : 'text-black/55')}>
                            Une phrase claire pour présenter l’activité, les services et le contact.
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {recommendedTemplates.length > 0 && (
          <section className="bg-[#f7f8f8] px-6 py-12 md:px-8 md:py-16">
            <div className="mx-auto max-w-[1360px]">
              <div className="mb-8 flex flex-col gap-4 border-b border-black pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-balance text-4xl font-black leading-[0.98] tracking-[-0.03em] text-black md:text-5xl">
                    Autres modèles proches.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-black/62">
                    Comparez rapidement quelques bases avant de passer commande.
                  </p>
                </div>
                <Link href="/templates" className="inline-flex w-fit items-center justify-center rounded-full border border-black px-5 py-3 text-sm font-black text-black transition-colors hover:bg-black hover:text-white">
                  Tout le catalogue
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {recommendedTemplates.map((item) => {
                  const image = getTemplateImage(item);
                  const itemPrice = typeof item.price === 'string' ? parseInt(item.price, 10) : item.price;

                  return (
                    <article key={item.id} className="group flex min-h-full flex-col bg-white">
                      <Link href={`/templates/${item.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
                        {image ? (
                          <div
                            aria-label={item.name}
                            role="img"
                            className="h-full w-full bg-cover bg-center transition-transform duration-200 group-hover:scale-[1.02]"
                            style={{ backgroundImage: `url(${image})` }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-black/35">
                            <Monitor className="h-10 w-10" />
                          </div>
                        )}
                      </Link>
                      <div className="flex flex-1 flex-col border-x border-b border-black/10 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            {item.sector && <p className="text-sm font-black text-[#2563eb]">{item.sector.name}</p>}
                            <h3 className="mt-2 text-2xl font-black tracking-[-0.02em] text-black">{item.name}</h3>
                          </div>
                          <p className="shrink-0 rounded-full bg-black px-3 py-2 text-xs font-black text-white">
                            {itemPrice.toLocaleString('fr-FR')} FCFA
                          </p>
                        </div>
                        <p className="mt-4 line-clamp-2 text-base leading-7 text-black/62">{item.description}</p>
                        <Link href={`/templates/${item.id}`} className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-black text-black">
                          Voir le modèle
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section id="template-reviews" className="border-t border-black/10 bg-white px-6 py-12 md:px-8 md:py-16">
          <div className="mx-auto grid max-w-[1360px] gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">Avis vérifiés</p>
              <h2 className="text-3xl font-black leading-tight text-black md:text-4xl">
                Retours clients sur ce modèle.
              </h2>
              <div className="mt-6 border-y border-black p-5">
                <div className="flex items-end gap-4">
                  <div className="text-4xl font-black tracking-tight text-slate-950">
                    {reviewsSummary.average_rating ? reviewsSummary.average_rating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="pb-1">
                    <div className="mb-1 flex gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={cn(
                            'h-4 w-4',
                            reviewsSummary.average_rating !== null && index < Math.round(reviewsSummary.average_rating)
                              ? 'fill-slate-950 text-slate-950'
                              : 'fill-slate-200 text-slate-200'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-500">
                      {reviewsSummary.count} avis publié{reviewsSummary.count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              {reviewsLoading ? (
                <div className="h-44 rounded-3xl border border-slate-100 bg-slate-50" />
              ) : templateReviews.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {templateReviews.slice(0, 2).map((review) => (
                    <TestimonialCard
                      key={review.id}
                      rating={review.rating}
                      content={review.content}
                      reviewerName={review.reviewer_name}
                      reviewerRole={review.reviewer_role}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                  <MessageSquare className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                  <p className="text-sm text-slate-500">Aucun avis publié pour ce modèle pour le moment.</p>
                </div>
              )}

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Votre avis</p>
                {authLoading ? (
                  <p className="text-sm text-slate-500">Chargement de votre accès aux avis…</p>
                ) : !isAuthenticated ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">Connectez-vous pour vérifier si vous pouvez laisser un avis.</p>
                    <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">
                      Se connecter
                    </Link>
                  </div>
                ) : user?.role !== 'client' ? (
                  <p className="text-sm text-slate-500">Les avis sont réservés aux comptes client.</p>
                ) : reviewEligibility?.can_review ? (
                  <form onSubmit={handleSubmitReview} className="grid gap-4">
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setReviewRating(value)}
                          className={cn(
                            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition-colors',
                            reviewRating === value
                              ? 'border-slate-950 bg-slate-950 text-white'
                              : 'border-slate-200 text-slate-600 hover:border-slate-950 hover:text-slate-950'
                          )}
                        >
                          <Star className={cn('h-4 w-4', reviewRating === value ? 'fill-white' : '')} />
                          {value}/5
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewContent}
                      onChange={(event) => setReviewContent(event.target.value)}
                      rows={4}
                      minLength={20}
                      maxLength={1500}
                      required
                      placeholder="Votre retour sur ce modèle."
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-950 outline-none placeholder:text-slate-300 focus:border-slate-950"
                    />
                    {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
                    {reviewNotice && <p className="text-sm text-emerald-700">{reviewNotice}</p>}
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="inline-flex w-fit items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
                    >
                      {reviewSubmitting ? 'Envoi…' : reviewEligibility.existing_review ? 'Mettre à jour mon avis' : 'Publier mon avis'}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      {reviewEligibility?.message || 'Vous devez avoir acheté ce modèle pour laisser un avis.'}
                    </p>
                    <Link href={orderUrl} className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">
                      Commander
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs text-black/50">Prix</p>
            <p className="truncate text-sm font-black text-black">{price.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <Link
            href={orderUrl}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-black px-4 py-3 text-sm font-black text-white"
            onClick={() =>
              trackFunnelEvent('start_order', {
                template_id: template.id,
                template_name: template.name,
                source: 'template_detail_mobile_sticky',
              })
            }
          >
            Commander
          </Link>
        </div>
      </div>

    </PublicPageShell>
  );
}

function getTemplateImage(template: Template): string {
  return parsePreviewGallery(template.preview_gallery)[0] || template.full_thumbnail_url || getSectorFallbackImage(template.sector?.slug);
}

function getSectorFallbackImage(slug?: string | null): string {
  if (!slug) {
    return '/image/client-satisfait-frilo.jpg';
  }

  return SECTOR_FALLBACK_IMAGES[slug] || '/image/client-satisfait-frilo.jpg';
}
