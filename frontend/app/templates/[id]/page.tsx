"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, ExternalLink, Heart, MessageSquare, Monitor, Scale, Smartphone, Star } from 'lucide-react';
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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
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
        <Link href="/templates" className="sq-btn sq-btn-black">Retour aux modèles</Link>
      </div>
    );
  }

  const features = parseFeatures(template.features);
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
  const includedItems = [...features, 'Hébergement inclus', 'Responsive mobile', 'Support 30 jours'];
  const engagements = [
    'Confirmation opérationnelle en moins de 2h ouvrées',
    'Livraison sous 48h ouvrées après validation de vos contenus',
    '2 cycles de révision inclus sur le périmètre de la commande',
  ];
  const faqItems = [
    {
      question: 'Que contient exactement la livraison ?',
      answer: 'Un site prêt à être publié, optimisé mobile, avec vos contenus intégrés et vos sections métier essentielles.',
    },
    {
      question: 'Comment se passent les révisions ?',
      answer: 'Vous disposez de 2 cycles de retours inclus. Chaque cycle couvre les ajustements de contenu et de mise en page.',
    },
    {
      question: 'Puis-je demander une personnalisation avancée ?',
      answer: 'Oui. Les besoins hors périmètre V1 sont traités en option après qualification avec notre équipe support.',
    },
  ];
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
    <div className="min-h-screen flex flex-col bg-white pb-24 lg:pb-0">

      {/* ── Top bar — sticky ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-14 flex items-center px-6 gap-4">
        <Link
          href={template.sector ? `/secteurs/${template.sector.slug}` : '/templates'}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="flex-1 text-center hidden md:block">
          <span className="text-sm font-bold text-black">{template.name}</span>
          {template.sector && (
            <span className="text-xs text-gray-400 ml-2">— {template.sector.name}</span>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('desktop')}
            className={cn("p-1.5 rounded-md transition-all", viewMode === 'desktop' ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black")}
            aria-label="Affichage desktop"
            aria-pressed={viewMode === 'desktop'}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={cn("p-1.5 rounded-md transition-all", viewMode === 'mobile' ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black")}
            aria-label="Affichage mobile"
            aria-pressed={viewMode === 'mobile'}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {livePreviewEnabled && (
            <Link
              href={`/templates/${template.id}/preview`}
              className="sq-btn sq-btn-outline-black text-sm py-2 px-4"
              onClick={() =>
                trackFunnelEvent('open_preview', {
                  template_id: template.id,
                  template_name: template.name,
                  source: 'template_detail_topbar',
                })
              }
            >
              Démo immersive <ExternalLink className="w-4 h-4" />
            </Link>
          )}
          <Link
            href={`/commande?templateId=${template.id}`}
            className="sq-btn sq-btn-black text-sm py-2 px-5"
            onClick={() =>
              trackFunnelEvent('start_order', {
                template_id: template.id,
                template_name: template.name,
                source: 'template_detail_topbar',
              })
            }
          >
            Commander — {price.toLocaleString('fr-FR')} FCFA
          </Link>
        </div>
      </div>

      {/* ── Main — split view ── */}
      <div className="flex flex-col lg:flex-row h-screen pt-14">

        {/* Preview */}
        <div className="relative flex-grow bg-[#f7f7f7] flex items-center justify-center p-8 overflow-hidden">
          <div className={cn(
            "relative transition-all duration-500 bg-white shadow-xl overflow-hidden",
            viewMode === 'desktop'
              ? "w-full h-full max-w-5xl rounded-lg border border-gray-200"
              : "w-[375px] h-[700px] rounded-[3rem] border-8 border-gray-800 shadow-2xl"
          )}>
            {livePreviewEnabled && previewPages.length > 0 && (
              <div className="absolute top-3 left-3 right-3 z-10">
                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-black/50 p-2 backdrop-blur-sm">
                  {previewPages.map((page) => (
                    <button
                      type="button"
                      key={`${page.label}-${page.path}`}
                      onClick={() => setActivePreviewPath(page.path)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                        selectedPreviewPath === page.path
                          ? "bg-white text-black"
                          : "bg-white/10 text-white hover:bg-white/20"
                      )}
                      aria-pressed={selectedPreviewPath === page.path}
                    >
                      {page.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {iframeSrc ? (
              <iframe src={iframeSrc} className="w-full h-full" title={`Aperçu interactif ${template.name}`} />
            ) : galleryImage ? (
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${galleryImage})` }}
              />
            ) : template.full_thumbnail_url ? (
              <Image
                src={template.full_thumbnail_url}
                alt={template.name}
                fill
                sizes={viewMode === 'desktop' ? '100vw' : '375px'}
                className="object-cover object-top"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Monitor className="w-16 h-16 mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">Aperçu non disponible</p>
                </div>
              </div>
            )}
          </div>

          {canBrowseGallery && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="rounded-full bg-black/55 px-3 py-2 backdrop-blur-sm flex items-center gap-2">
                {previewGallery.map((_, index) => (
                  <button
                    type="button"
                    key={`preview-gallery-${index}`}
                    onClick={() => setActiveGalleryIndex(index)}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full transition-colors",
                      index === activeGalleryIndex ? "bg-white" : "bg-white/35 hover:bg-white/60"
                    )}
                    aria-label={`Capture ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-100 overflow-y-auto flex flex-col">
          <div className="p-8 flex-grow">

            {/* Price */}
            <div className="mb-8 pb-8 border-b border-gray-100">
              <p className="sq-label text-gray-400 mb-2">Prix</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-black tracking-tight">
                  {price.toLocaleString('fr-FR')}
                </span>
                <span className="text-gray-400 text-sm">FCFA</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Paiement unique · Livraison 48h</p>
              {livePreviewEnabled && (
                <p className="text-xs text-emerald-600 mt-2 font-semibold">Démo interactive disponible</p>
              )}
            </div>

            <div className="mb-8 pb-8 border-b border-gray-100">
              <p className="sq-label text-gray-400 mb-3">Actions rapides</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleFavorite(template.id)}
                  aria-pressed={favoriteActive}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors',
                    favoriteActive ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
                  )}
                >
                  <Heart className={cn('w-3.5 h-3.5', favoriteActive ? 'fill-white' : '')} />
                  {favoriteActive ? 'Dans vos favoris' : 'Ajouter aux favoris'}
                </button>
                <button
                  type="button"
                  onClick={handleToggleCompare}
                  aria-pressed={comparedActive}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors',
                    comparedActive ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
                  )}
                >
                  <Scale className="w-3.5 h-3.5" />
                  {comparedActive ? 'Retirer de la comparaison' : `Comparer (${compareIds.length}/${maxCompareItems})`}
                </button>
                <Link href="/templates/compare" className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:border-black hover:text-black">
                  Voir la comparaison
                </Link>
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <p className="sq-label text-gray-400 mb-4">Livrable inclus ({includedItems.length})</p>
              <ul className="space-y-3">
                {includedItems.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Timeline */}
            <div className="mb-8">
              <p className="sq-label text-gray-400 mb-4">Livraison</p>
              <div className="space-y-4 relative">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-100" />
                {[
                  { day: 'Jour 0', title: 'Commande', desc: 'Formulaire rempli' },
                  { day: 'Jour 1', title: 'Montage', desc: 'Intégration contenu' },
                  { day: 'Jour 2', title: 'Livraison', desc: 'Site en ligne', green: true },
                ].map(({ day, title, desc, green }) => (
                  <div key={day} className="flex items-start gap-4 relative">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 z-10",
                      green ? "border-black bg-black" : "border-gray-300 bg-white"
                    )} />
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{day}</span>
                      <p className="text-sm font-semibold text-black">{title}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commitments */}
            <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <p className="sq-label text-gray-500 mb-3">Engagements FRILO V1</p>
              <ul className="space-y-2.5">
                {engagements.map((engagement) => (
                  <li key={engagement} className="text-sm text-gray-700 leading-relaxed">
                    • {engagement}
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQ */}
            <div className="mb-8">
              <p className="sq-label text-gray-500 mb-3">FAQ rapide</p>
              <div className="space-y-2">
                {faqItems.map((faq, index) => {
                  const panelId = `template-faq-panel-${faq.question.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}`;
                  const buttonId = `template-faq-button-${faq.question.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}`;
                  const isOpen = openFaqIndex === index;

                  return (
                    <div key={faq.question} className="rounded-xl border border-gray-100 bg-white">
                      <button
                        id={buttonId}
                        type="button"
                        aria-controls={panelId}
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full text-left px-4 py-3 text-sm font-semibold text-black flex items-center justify-between gap-4"
                      >
                        <span>{faq.question}</span>
                        <span className="text-gray-400" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div id={panelId} role="region" aria-labelledby={buttonId} className="px-4 pb-4">
                          <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA sticky bottom */}
          <div className="p-6 border-t border-gray-100 space-y-3 bg-white lg:sticky lg:bottom-0">
            {livePreviewEnabled && (
              <Link
                href={`/templates/${template.id}/preview`}
                className="sq-btn sq-btn-outline-black w-full justify-center lg:hidden"
                onClick={() =>
                  trackFunnelEvent('open_preview', {
                    template_id: template.id,
                    template_name: template.name,
                    source: 'template_detail_sidebar',
                  })
                }
              >
                Démo immersive
              </Link>
            )}
            <Link
              href={`/commande?templateId=${template.id}`}
              className="sq-btn sq-btn-black w-full justify-center"
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
            <Link
              href="/contact"
              className="sq-btn sq-btn-outline-black w-full justify-center"
            >
              Poser une question
            </Link>
          </div>
        </div>
      </div>

      <section id="template-reviews" className="border-t border-gray-100 bg-[#faf9f7]">
        <div className="sq-container py-16 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-5">
              <div>
                <p className="sq-label mb-4">Avis verifies</p>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-black mb-4">
                  Ce que disent les clients
                  <br />
                  de ce modele.
                </h2>
                <p className="text-base text-gray-500 leading-relaxed max-w-xl">
                  Seuls les clients ayant commande ce template peuvent laisser un avis. Chaque retour est relu avant publication.
                </p>
              </div>

              <div className="rounded-[2rem] border border-gray-200 bg-white p-6 md:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-3">Synthese</p>
                <div className="flex items-end gap-4 mb-4">
                  <div className="text-5xl font-black tracking-tight text-black">
                    {reviewsSummary.average_rating ? reviewsSummary.average_rating.toFixed(1) : '—'}
                  </div>
                  <div className="pb-1">
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={cn(
                            'w-4 h-4',
                            reviewsSummary.average_rating !== null && index < Math.round(reviewsSummary.average_rating)
                              ? 'text-black fill-black'
                              : 'text-gray-200 fill-gray-200'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      {reviewsSummary.count} avis publie{reviewsSummary.count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Les avis modifies par un client repassent automatiquement en validation avant republication.
                </p>
              </div>

              <div className="rounded-[2rem] border border-gray-200 bg-white p-6 md:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-4">Votre avis</p>

                {authLoading ? (
                  <p className="text-sm text-gray-500">Chargement de votre acces aux avis…</p>
                ) : !isAuthenticated ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Connectez-vous avec votre compte client pour verifier si vous pouvez laisser un avis sur ce modele.
                    </p>
                    <Link href="/login" className="sq-btn sq-btn-black text-sm py-3 px-6">
                      Se connecter
                    </Link>
                  </div>
                ) : user?.role !== 'client' ? (
                  <p className="text-sm text-gray-500">Les avis clients sont reserves aux comptes client.</p>
                ) : reviewEligibility?.can_review ? (
                  <form onSubmit={handleSubmitReview} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.18em] text-black mb-3">
                        Note
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setReviewRating(value)}
                            className={cn(
                              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                              reviewRating === value
                                ? 'border-black bg-black text-white'
                                : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
                            )}
                          >
                            <Star className={cn('w-4 h-4', reviewRating === value ? 'fill-white' : '')} />
                            {value}/5
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.18em] text-black mb-2">
                        Votre retour
                      </label>
                      <textarea
                        value={reviewContent}
                        onChange={(event) => setReviewContent(event.target.value)}
                        rows={5}
                        minLength={20}
                        maxLength={1500}
                        required
                        placeholder="Expliquez ce que ce template vous a apporte, ce que vous avez apprecie et l'impact sur votre activite."
                        className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfb] px-4 py-3.5 text-sm text-black placeholder-gray-300 outline-none focus:border-black resize-none"
                      />
                    </div>

                    {reviewEligibility.existing_review && (
                      <div className="rounded-2xl bg-[#fcfcfb] border border-gray-100 px-4 py-3 text-sm text-gray-600">
                        Statut actuel: <span className="font-semibold text-black">{reviewEligibility.existing_review.status}</span>.
                        Toute modification repassera en validation.
                      </div>
                    )}

                    {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
                    {reviewNotice && <p className="text-sm text-emerald-700">{reviewNotice}</p>}

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="sq-btn sq-btn-black text-sm py-3 px-6 disabled:opacity-50"
                    >
                      {reviewSubmitting ? 'Envoi…' : reviewEligibility.existing_review ? 'Mettre a jour mon avis' : 'Publier mon avis'}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {reviewEligibility?.message || 'Vous devez avoir achete ce modele pour laisser un avis.'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/commande?templateId=${template.id}`} className="sq-btn sq-btn-black text-sm py-3 px-6">
                        Commander ce modele
                      </Link>
                      <Link href="/dashboard/orders" className="sq-btn sq-btn-outline-black text-sm py-3 px-6">
                        Voir mes commandes
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              {reviewsLoading ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="h-72 rounded-2xl bg-white border border-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : templateReviews.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {templateReviews.map((review) => (
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
                <div className="rounded-[2rem] border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
                  <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">
                    Aucun avis publie pour ce modele pour le moment. Le premier retour verifie apparaitra ici.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">À partir de</p>
            <p className="text-sm font-bold text-black truncate">{price.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <Link
            href={`/commande?templateId=${template.id}`}
            className="sq-btn sq-btn-black text-sm py-2.5 px-4 flex-1 justify-center"
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
        <div className="fixed bottom-24 right-4 z-50 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">{compareNotice}</p>
        </div>
      )}
    </div>
  );
}
