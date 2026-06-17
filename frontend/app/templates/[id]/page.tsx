"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, Heart, MessageSquare, Monitor, Scale, Smartphone, Star } from 'lucide-react';
import { TestimonialCard } from '@/components/business/TestimonialCard';
import { useAuthState } from '@/hooks/useAuthState';
import { businessService, Template, TemplateReview, TemplateReviewEligibility, TemplateReviewSummary } from '@/services/business.service';
import { cn, parseFeatures } from '@/lib/utils';
import { buildPreviewUrl, hasLivePreview, parsePreviewGallery, parsePreviewPages } from '@/lib/templatePreview';
import { trackFunnelEvent } from '@/lib/analytics';
import { useTemplateCollections } from '@/hooks/useTemplateCollections';
import axios from 'axios';

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
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activePreviewPath, setActivePreviewPath] = useState('/');
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [compareNotice, setCompareNotice] = useState<string | null>(null);

  const {
    isFavorite,
    isCompared,
    toggleFavorite,
    toggleCompare,
    maxCompareItems,
    compareIds,
  } = useTemplateCollections();

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
        setActivePreviewPath(pages[0]?.path ?? '/');
        setActiveGalleryIndex(0);
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
    if (!compareNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setCompareNotice(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [compareNotice]);

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

  const legacyFeatures = parseFeatures(template.features);
  const previewPages = parsePreviewPages(template.preview_pages);
  const previewGallery = parsePreviewGallery(template.preview_gallery);
  const livePreviewEnabled = hasLivePreview(template.preview_url);
  const selectedPreviewPath = previewPages.length > 0 ? activePreviewPath || previewPages[0].path : '/';
  const iframeSrc = livePreviewEnabled && template.preview_url
    ? buildPreviewUrl(template.preview_url, selectedPreviewPath)
    : null;
  const canBrowseGallery = !livePreviewEnabled && previewGallery.length > 1;
  const galleryImage = previewGallery[activeGalleryIndex] ?? previewGallery[0] ?? null;
  const price = typeof template.price === 'string' ? parseInt(template.price) : template.price;
  const targetAudience = Array.isArray(template.target_audience) && template.target_audience.length > 0
    ? template.target_audience
    : legacyFeatures.slice(0, 4);
  const includedItems = Array.isArray(template.included_features) && template.included_features.length > 0
    ? template.included_features
    : [...legacyFeatures, 'Hébergement inclus', 'Responsive mobile', 'Support 30 jours'];
  const visibleFeatures = targetAudience.slice(0, 4);
  const includedPreview = includedItems.slice(0, 6);
  const favoriteActive = isFavorite(template.id);
  const comparedActive = isCompared(template.id);

  const handleToggleCompare = () => {
    const result = toggleCompare(template.id);
    if (result === 'max_reached') {
      setCompareNotice(`Vous pouvez comparer jusqu'à ${maxCompareItems} modèles.`);
    }
  };

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
    <div className="min-h-screen bg-[oklch(98%_0.004_29)] pb-24 text-slate-950 lg:pb-0">
      <div className="fixed left-0 right-0 top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <Link
            href={template.sector ? `/secteurs/${template.sector.slug}` : '/templates'}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>

          <div className="hidden min-w-0 flex-1 text-center md:block">
            <span className="truncate text-sm font-black text-slate-950">{template.name}</span>
            {template.sector && (
              <span className="ml-2 text-xs font-semibold text-slate-400">{template.sector.name}</span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setViewMode('desktop')}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  viewMode === 'desktop' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-slate-950'
                )}
                aria-label="Affichage desktop"
                aria-pressed={viewMode === 'desktop'}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mobile')}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  viewMode === 'mobile' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-slate-950'
                )}
                aria-label="Affichage mobile"
                aria-pressed={viewMode === 'mobile'}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            <Link
              href={`/commande?templateId=${template.id}`}
              className="hidden rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition-colors hover:bg-black lg:inline-flex"
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
        <section className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="relative order-2 flex items-center justify-center border-b border-slate-100 bg-[oklch(96%_0.005_29)] px-4 py-6 md:px-8 lg:order-1 lg:border-b-0 lg:border-r lg:py-8">
            <div
              className={cn(
                'relative overflow-hidden bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] transition-all duration-300',
                viewMode === 'desktop'
                  ? 'h-[320px] w-full max-w-5xl rounded-2xl border border-slate-200 md:h-[560px] lg:h-[calc(100vh-8rem)]'
                  : 'h-[520px] w-[290px] rounded-[2.2rem] border-[10px] border-slate-950 md:h-[680px] md:w-[360px]'
              )}
            >
              {iframeSrc ? (
                <iframe src={iframeSrc} className="h-full w-full" title={`Aperçu interactif ${template.name}`} />
              ) : galleryImage ? (
                <div
                  className="h-full w-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${galleryImage})` }}
                />
              ) : template.full_thumbnail_url ? (
                <Image
                  src={template.full_thumbnail_url}
                  alt={template.name}
                  fill
                  sizes={viewMode === 'desktop' ? '70vw' : '360px'}
                  className="object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                  <div className="text-center">
                    <Monitor className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                    <p className="text-sm text-slate-400">Aperçu non disponible</p>
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

          <aside className="order-1 bg-white px-6 py-7 md:px-8 lg:order-2 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
            <div className="space-y-6 lg:space-y-7">
              <div>
                {template.sector && (
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">
                    {template.sector.name}
                  </p>
                )}
                <h1 className="text-4xl font-black leading-none tracking-tight text-slate-950 md:text-5xl">
                  {template.name}
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-500">
                  {template.description}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-[oklch(98%_0.004_29)] p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Prix du modèle</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tight text-slate-950">
                    {price.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">FCFA</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Paiement unique, livraison sous 48h après réception des contenus.</p>
              </div>

              <div className="grid gap-3">
                <Link
                  href={`/commande?templateId=${template.id}`}
                  className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-sm font-black text-white transition-colors hover:bg-black"
                  onClick={() =>
                    trackFunnelEvent('start_order', {
                      template_id: template.id,
                      template_name: template.name,
                      source: 'template_detail_sidebar',
                    })
                  }
                >
                  Commander ce modèle
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  {livePreviewEnabled && (
                    <Link
                      href={`/templates/${template.id}/preview`}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-3 text-sm font-black text-slate-950 transition-colors hover:border-slate-950"
                      onClick={() =>
                        trackFunnelEvent('open_preview', {
                          template_id: template.id,
                          template_name: template.name,
                          source: 'template_detail_sidebar',
                        })
                      }
                    >
                      Démo
                    </Link>
                  )}
                  <Link
                    href="/contact"
                    className={cn(
                      'inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-3 text-sm font-black text-slate-950 transition-colors hover:border-slate-950',
                      !livePreviewEnabled && 'col-span-2'
                    )}
                  >
                    Question
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleFavorite(template.id)}
                  aria-pressed={favoriteActive}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black transition-colors',
                    favoriteActive ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-950 hover:text-slate-950'
                  )}
                >
                  <Heart className={cn('h-3.5 w-3.5', favoriteActive ? 'fill-white' : '')} />
                  {favoriteActive ? 'Favori' : 'Favoris'}
                </button>
                <button
                  type="button"
                  onClick={handleToggleCompare}
                  aria-pressed={comparedActive}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black transition-colors',
                    comparedActive ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-950 hover:text-slate-950'
                  )}
                >
                  <Scale className="h-3.5 w-3.5" />
                  {comparedActive ? 'Comparé' : `Comparer ${compareIds.length}/${maxCompareItems}`}
                </button>
                <Link href="/templates/compare" className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-xs font-black text-slate-500 transition-colors hover:border-slate-950 hover:text-slate-950">
                  Comparaison
                </Link>
              </div>

              {visibleFeatures.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Pensé pour</p>
                  <div className="grid gap-2">
                    {visibleFeatures.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                        <Check className="h-4 w-4 rounded-full bg-slate-950 p-0.5 text-white" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="hidden sm:block">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Inclus</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-500">
                  {includedPreview.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-950" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-950 p-5 text-white">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/50">Après commande</p>
                <p className="mt-3 text-lg font-black leading-snug">FRILO vous demande seulement les contenus utiles, puis adapte le modèle à votre activité.</p>
              </div>
            </div>
          </aside>
        </section>

        <section id="template-reviews" className="border-t border-slate-100 bg-white px-6 py-12 md:px-8 md:py-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Avis vérifiés</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 md:text-4xl">
                Retours clients sur ce modèle.
              </h2>
              <div className="mt-6 rounded-3xl border border-slate-200 p-5">
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
                    <Link href={`/commande?templateId=${template.id}`} className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">
                      Commander
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Prix</p>
            <p className="truncate text-sm font-black text-slate-950">{price.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <Link
            href={`/commande?templateId=${template.id}`}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white"
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

      {compareNotice && (
        <div className="fixed bottom-24 right-4 z-50 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">{compareNotice}</p>
        </div>
      )}
    </div>
  );
}
