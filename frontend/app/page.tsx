"use client"

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { FreeContentBlock } from '@/components/content/FreeContentBlock';
import { HOME_PUBLIC_CONTENT_FALLBACK } from '@/content/home.fallback';
import { usePublicContent } from '@/hooks/usePublicContent';
import { usePublicPricing } from '@/hooks/usePublicPricing';
import {
  HomeBenefitsContent,
  HomeClosingCtaContent,
  HomeFaqIntroContent,
  HomeHeroContent,
  HomeModelsIntroContent,
  HomePricingContent,
  HomeProcessContent,
  HomeSectorsIntroContent,
  HomeTestimonialsIntroContent,
  getBlocksForAnchor,
  getPublicSection,
} from '@/lib/publicContent';
import { hasLivePreview, parsePreviewGallery } from '@/lib/templatePreview';
import { businessService, FaqItem, OrderOption, Sector, Template, TemplateReview } from '@/services/business.service';
import { cn, parseFeatures } from '@/lib/utils';

const FEATURED_TEMPLATE_LIMIT = 6;

function getTemplatePrice(template: Template): number {
  return typeof template.price === 'string' ? parseInt(template.price, 10) : template.price;
}

function getTemplateImage(template: Template): string {
  return template.full_thumbnail_url || parsePreviewGallery(template.preview_gallery)[0] || '';
}

function selectFeaturedTemplates(templates: Template[]): Template[] {
  const rankedTemplates = [...templates].sort((left, right) => {
    const livePreviewDelta = Number(hasLivePreview(right.preview_url)) - Number(hasLivePreview(left.preview_url));

    if (livePreviewDelta !== 0) {
      return livePreviewDelta;
    }

    const galleryDelta = parsePreviewGallery(right.preview_gallery).length - parsePreviewGallery(left.preview_gallery).length;

    if (galleryDelta !== 0) {
      return galleryDelta;
    }

    const priceDelta = getTemplatePrice(right) - getTemplatePrice(left);

    if (priceDelta !== 0) {
      return priceDelta;
    }

    return left.name.localeCompare(right.name, 'fr');
  });

  const featured: Template[] = [];
  const seenIds = new Set<number>();
  const seenSectors = new Set<number>();

  const pushTemplate = (template: Template, options?: { requireNewSector?: boolean }) => {
    if (featured.length >= FEATURED_TEMPLATE_LIMIT || seenIds.has(template.id)) {
      return;
    }

    if (options?.requireNewSector && template.sector_id && seenSectors.has(template.sector_id)) {
      return;
    }

    featured.push(template);
    seenIds.add(template.id);

    if (template.sector_id) {
      seenSectors.add(template.sector_id);
    }
  };

  for (const template of rankedTemplates) {
    if (hasLivePreview(template.preview_url)) {
      pushTemplate(template, { requireNewSector: true });
    }
  }

  for (const template of rankedTemplates) {
    pushTemplate(template, { requireNewSector: true });
  }

  for (const template of rankedTemplates) {
    pushTemplate(template);
  }

  return featured;
}

function templateSummary(template: Template): string {
  const features = parseFeatures(template.features);

  if (features.length > 0) {
    return features.slice(0, 2).join(' · ');
  }

  return template.description || 'Un modèle prêt à adapter à votre activité.';
}

async function retryCatalogLoad<T>(loader: () => Promise<T>, retries = 20): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    return retryCatalogLoad(loader, retries - 1);
  }
}

function HomeSection({
  eyebrow,
  title,
  children,
  action,
  className,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('py-12 md:py-16', className)}>
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
            <h2 className="text-3xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-4xl lg:text-5xl">
              {title}
            </h2>
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

function fallbackSectionContent<TContent>(renderer: string): TContent {
  const section = getPublicSection<TContent>(HOME_PUBLIC_CONTENT_FALLBACK, renderer);

  if (!section) {
    throw new Error(`Missing fallback content for ${renderer}`);
  }

  return section.content;
}

function withPricePlaceholder(value: string, priceLabel: string): string {
  return value.replace('{price}', priceLabel);
}

export default function Home() {
  const { pricing } = usePublicPricing();
  const { content: publicContent } = usePublicContent('home');
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<Template[]>([]);
  const [testimonials, setTestimonials] = useState<TemplateReview[]>([]);
  const [homeFaqs, setHomeFaqs] = useState<FaqItem[]>([]);
  const [popularOptions, setPopularOptions] = useState<OrderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      const [testimonialsData, faqsData, optionsData] = await Promise.all([
        businessService.getFeaturedTestimonials(3).catch(() => []),
        businessService.getFaqs(6).catch(() => []),
        businessService.getOrderOptions().catch(() => []),
      ]);

      setTestimonials(testimonialsData);
      setHomeFaqs(faqsData);
      setPopularOptions(optionsData.slice(0, 4));

      try {
        setCatalogError(null);
        const [sectorsData, templatesData] = await retryCatalogLoad(() => Promise.all([
          businessService.getSectors(),
          businessService.getTemplates(),
        ]));
        setSectors(sectorsData);
        setFeaturedTemplates(selectFeaturedTemplates(templatesData));
      } catch {
        setSectors([]);
        setFeaturedTemplates([]);
        setCatalogError("Impossible de charger le catalogue pour le moment.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const includedItems = ['Domaine 1 an', 'Hébergement 1 an', 'SSL', 'Version mobile', 'Mise en ligne', 'Retouches'];
  const hero = getPublicSection<HomeHeroContent>(publicContent, 'home.hero')?.content
    ?? fallbackSectionContent<HomeHeroContent>('home.hero');
  const modelsSection = getPublicSection<HomeModelsIntroContent>(publicContent, 'home.models-intro');
  const benefitsSection = getPublicSection<HomeBenefitsContent>(publicContent, 'home.benefits');
  const processSection = getPublicSection<HomeProcessContent>(publicContent, 'home.process');
  const pricingSection = getPublicSection<HomePricingContent>(publicContent, 'home.pricing');
  const testimonialsSection = getPublicSection<HomeTestimonialsIntroContent>(publicContent, 'home.testimonials-intro');
  const sectorsSection = getPublicSection<HomeSectorsIntroContent>(publicContent, 'home.sectors-intro');
  const faqSection = getPublicSection<HomeFaqIntroContent>(publicContent, 'home.faq-intro');
  const closingSection = getPublicSection<HomeClosingCtaContent>(publicContent, 'home.closing-cta');
  const pricingContent = pricingSection?.content;
  const priceLabel = `${pricing.standard.price.toLocaleString('fr-FR')} ${pricing.currency_label}`;
  const cmsIncludedItems = pricingContent?.included_items?.length ? pricingContent.included_items : includedItems;
  const renderBlocksFor = (anchor: string | null | undefined) => (
    getBlocksForAnchor(publicContent, anchor ?? null).map((block) => (
      <FreeContentBlock key={block.id} block={block} />
    ))
  );
  const anchoredBlockIds = new Set(publicContent.blocks.filter((block) => block.anchor_section_key).map((block) => block.id));
  const unplacedBlocks = publicContent.blocks.filter((block) => !anchoredBlockIds.has(block.id) && block.anchor_section_key === null);

  return (
    <div className="flex flex-col bg-white text-slate-950">
      <section className="relative isolate overflow-hidden bg-[oklch(9%_0.006_270)] pt-28 text-[oklch(98%_0.004_270)] md:pt-32">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(5%_0.004_270)_0%,oklch(8%_0.005_270)_54%,oklch(13%_0.01_270)_100%)]" />
        <div className="absolute right-0 top-28 hidden h-24 w-3 bg-[oklch(57%_0.24_29)] lg:block" />
        <div className="relative mx-auto grid max-w-7xl gap-9 px-5 pb-10 sm:px-6 md:pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border border-[oklch(98%_0.004_270/0.28)] bg-[oklch(98%_0.004_270/0.08)] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[oklch(86%_0.004_270)]">
              {hero.eyebrow}
            </p>
            <h1 className="max-w-[14ch] text-4xl font-black leading-[0.94] tracking-tight text-[oklch(98%_0.004_270)] md:max-w-[16ch] md:text-5xl lg:max-w-[15ch] lg:text-6xl">
              {hero.headline}
            </h1>
            <p className="mt-6 max-w-[34rem] text-base leading-7 text-[oklch(82%_0.006_270)] md:text-lg">
              {hero.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={hero.primary_cta.url} className="inline-flex items-center justify-center gap-2 rounded-full bg-[oklch(57%_0.24_29)] px-6 py-3 text-sm font-black text-[oklch(98%_0.004_270)] transition-colors hover:bg-[oklch(51%_0.24_29)]">
                {hero.primary_cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={hero.secondary_cta.url} className="inline-flex items-center justify-center gap-2 rounded-full border border-[oklch(98%_0.004_270/0.34)] px-6 py-3 text-sm font-black text-[oklch(98%_0.004_270)] transition-colors hover:bg-[oklch(98%_0.004_270/0.09)]">
                {hero.secondary_cta.label}
              </Link>
            </div>
          </div>

          <div className="relative min-h-[500px] text-[oklch(10%_0.006_270)]">
            <div className="absolute -right-2 top-10 h-32 w-4 bg-[oklch(57%_0.24_29)]" />
            <div className="relative ml-auto max-w-[620px] overflow-hidden rounded-[2rem] border border-[oklch(98%_0.004_270/0.76)] bg-[oklch(98%_0.004_270)] shadow-[0_35px_100px_rgba(0,0,0,0.42)]">
              <div className="relative aspect-[0.9] min-h-[450px] md:aspect-[1.05]">
                <img
                  src="/image/client-satisfait-frilo.jpg"
                  alt="Client souriant devant son ordinateur après avoir obtenu une présence en ligne professionnelle."
                  className="h-full w-full object-cover object-[58%_42%] grayscale contrast-110"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.72),rgba(0,0,0,0.12),rgba(0,0,0,0.02))]" />
                <div className="absolute left-5 top-5 rounded-full bg-[oklch(98%_0.004_270)] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[oklch(10%_0.006_270)]">
                  Site publié
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                  <div className="max-w-md rounded-[1.25rem] bg-[oklch(98%_0.004_270)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Après FRILO</p>
                    <p className="mt-2 text-2xl font-black leading-tight tracking-tight text-[oklch(10%_0.006_270)]">
                      “Mes clients comprennent mon activité avant même de m&apos;appeler.”
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      {renderBlocksFor('home.hero')}

      {modelsSection && (
      <HomeSection
        eyebrow={modelsSection.content.eyebrow}
        title={modelsSection.content.headline}
        action={(
          <Link href={modelsSection.content.cta.url} className="inline-flex items-center gap-1 text-sm font-black text-slate-950 hover:text-slate-600">
            {modelsSection.content.cta.label} <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      >
        <p className="-mt-4 mb-8 max-w-2xl text-base leading-7 text-slate-500">
          {modelsSection.content.description}
        </p>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[24rem] animate-pulse rounded-[1.35rem] bg-slate-100" />
            ))}
          </div>
        ) : catalogError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
            <p className="text-sm text-amber-800">{catalogError}</p>
          </div>
        ) : featuredTemplates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center">
            <p className="text-sm text-slate-500">Aucun modèle mis en avant pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {sectors.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {sectors.slice(0, 6).map((sector) => (
                  <Link
                    key={sector.id}
                    href={`/secteurs/${sector.slug}`}
                    className="inline-flex flex-none items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
                  >
                    {sector.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {featuredTemplates.slice(0, 4).map((template, index) => {
                const templateImage = getTemplateImage(template);

                return (
                  <Link
                    key={template.id}
                    href={`/templates/${template.id}`}
                    className="group flex min-h-full flex-col overflow-hidden rounded-[1.35rem] border border-slate-100 bg-slate-50 transition-colors hover:border-slate-950"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      {templateImage ? (
                        <img
                          src={templateImage}
                          alt={template.name}
                          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-200" />
                      )}
                      <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-slate-950">
                        {index === 0 ? 'Exemple de départ' : 'Base métier'}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex-1">
                        {template.sector?.name && (
                          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.12em] text-[oklch(57%_0.24_29)]">
                            {template.sector.name}
                          </p>
                        )}
                        <h3 className="text-xl font-black leading-tight tracking-tight text-slate-950">
                          {template.name}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                          {templateSummary(template)}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {['Mobile', 'Contact', '48h'].map((label) => (
                            <span key={label} className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                        <span className="text-base font-black text-slate-950">
                          {getTemplatePrice(template).toLocaleString('fr-FR')} <span className="text-xs font-semibold text-slate-400">FCFA</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm font-black text-slate-950">
                          Voir cet exemple <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 rounded-[1.35rem] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-950">Vous ne voyez pas votre activité ?</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">Choisissez la base la plus proche. FRILO adapte les textes, les photos et les contacts.</p>
              </div>
              <Link
                href="/templates"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-slate-800"
              >
                Voir tout le catalogue
              </Link>
            </div>
          </div>
        )}
      </HomeSection>
      )}
      {renderBlocksFor(modelsSection?.key)}

      {benefitsSection && (
      <section className="relative z-10 bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="border-y border-slate-200 py-8 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">{benefitsSection.content.eyebrow}</p>
                <h2 className="mt-3 max-w-xl text-3xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-5xl">
                  {benefitsSection.content.headline}
                </h2>
                <p className="mt-5 max-w-md text-base leading-7 text-slate-500">
                  {benefitsSection.content.description}
                </p>
              </div>

              <div className="divide-y divide-slate-200">
                {benefitsSection.content.items.map((benefit, index) => (
                  <div key={benefit.title} className="grid gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[3rem_0.72fr_1fr] sm:items-baseline">
                    <span className="text-sm font-black text-[oklch(57%_0.24_29)]">0{index + 1}</span>
                    <h3 className="text-xl font-black tracking-tight text-slate-950">{benefit.title}</h3>
                    <p className="max-w-xl text-base leading-7 text-slate-500">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 rounded-[1.25rem] bg-slate-950 px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between md:px-6">
              <p className="max-w-2xl text-lg font-black leading-snug tracking-tight">
                {benefitsSection.content.closing_copy}
              </p>
              <Link href={benefitsSection.content.cta.url} className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-slate-100">
                {benefitsSection.content.cta.label}
              </Link>
            </div>
          </div>
        </div>
      </section>
      )}
      {renderBlocksFor(benefitsSection?.key)}

      {processSection && (
      <section id="how-it-works" className="bg-white px-5 pb-14 pt-2 md:pb-20 md:pt-4">
        <div className="mx-auto max-w-7xl border-t border-slate-200 pt-8 md:pt-10">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[oklch(57%_0.24_29)]">{processSection.content.eyebrow}</p>
              <h2 className="mt-3 max-w-xl text-4xl font-black leading-[0.96] tracking-tight text-slate-950 md:text-5xl">
                {processSection.content.headline}
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-500">
                {processSection.content.description}
              </p>
            </div>

            <div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="border-b border-slate-200 pb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Vous faites</p>
                  <div className="divide-y divide-slate-100">
                    {processSection.content.customer_steps.map((step, index) => (
                      <div key={step.title} className="grid gap-3 py-5 sm:grid-cols-[3rem_1fr]">
                        <span className="text-sm font-black text-[oklch(57%_0.24_29)]">0{index + 1}</span>
                        <div>
                          <h3 className="text-xl font-black tracking-tight text-slate-950">{step.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="border-b border-slate-200 pb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">FRILO fait</p>
                  <div className="divide-y divide-slate-100">
                    {processSection.content.frilo_steps.map((step, index) => (
                      <div key={step.title} className="grid gap-3 py-5 sm:grid-cols-[3rem_1fr]">
                        <span className="text-sm font-black text-slate-950">0{index + 1}</span>
                        <div>
                          <h3 className="text-xl font-black tracking-tight text-slate-950">{step.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-base font-black leading-7 text-slate-950">
                  {processSection.content.result_copy}
                </p>
                <Link href={processSection.content.cta.url} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-slate-800">
                  {processSection.content.cta.label} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}
      {renderBlocksFor(processSection?.key)}

      {pricingSection && pricingContent && (
      <section id="pricing" className="bg-white px-5 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">{pricingContent.eyebrow}</p>
              <h2 className="max-w-2xl text-3xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-5xl">
                {withPricePlaceholder(pricingContent.headline, priceLabel)}
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-slate-500 lg:ml-auto">
              {pricingContent.description}
            </p>
          </div>

          <div className="mt-8 grid gap-3 border-y border-slate-200 py-4 sm:grid-cols-2 lg:grid-cols-6">
            {cmsIncludedItems.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-black text-slate-700">
                <Check className="h-4 w-4 shrink-0 text-[oklch(57%_0.24_29)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid border-y border-slate-200 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="bg-slate-950 p-6 text-white md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">{pricingContent.package_eyebrow}</p>
              <p className="mt-5 text-5xl font-black tracking-tight">
                {pricing.standard.price.toLocaleString('fr-FR')}
                <span className="ml-2 text-sm font-semibold text-white/55">{pricing.currency_label}</span>
              </p>
              <p className="mt-2 text-sm text-white/55">Paiement unique</p>
              <p className="mt-7 max-w-md text-lg font-black leading-7">
                {pricingContent.package_description}
              </p>
              <Link href={pricingContent.primary_cta.url} className="mt-7 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-slate-100">
                {pricingContent.primary_cta.label}
              </Link>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[oklch(57%_0.24_29)]">{pricingContent.options_eyebrow}</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{pricingContent.options_headline}</h3>
                </div>
                <p className="text-sm text-slate-500">Le total se met à jour avant paiement.</p>
              </div>
              <div className="mt-6 divide-y divide-slate-100 border-y border-slate-100">
                {popularOptions.map((option) => (
                  <div key={option.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                    <span className="font-black text-slate-700">{option.name}</span>
                    <span className="shrink-0 font-black text-slate-950">+{option.price.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                ))}
                {popularOptions.length === 0 && (
                  <p className="py-4 text-sm text-slate-500">Les options disponibles apparaissent pendant la commande.</p>
                )}
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-500">
                {pricingContent.options_description}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>{pricingContent.payment_note}</p>
            <p>
              {pricing.custom_note || 'Projet spécifique ?'}{' '}
              <Link href={pricingContent.secondary_cta.url} className="font-black text-slate-950 underline underline-offset-4">{pricingContent.secondary_cta.label}.</Link>
            </p>
          </div>
        </div>
      </section>
      )}
      {renderBlocksFor(pricingSection?.key)}

      {testimonialsSection && (
      <section className="bg-slate-950 px-5 py-16 text-white md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">{testimonialsSection.content.eyebrow}</p>
            <h2 className="mt-5 max-w-2xl text-4xl font-black leading-[0.98] tracking-tight md:text-6xl">
              {testimonialsSection.content.headline}
            </h2>
          </div>
          {loading ? (
            <div className="h-40 animate-pulse rounded-[1.4rem] bg-white/10" />
          ) : testimonials.length > 0 ? (
            <figure className="border-l border-white/20 pl-6 md:pl-10">
              <blockquote className="text-2xl font-black leading-tight tracking-tight text-white md:text-4xl">
                “{testimonials[0].content}”
              </blockquote>
              <figcaption className="mt-6 text-sm leading-6 text-white/55">
                <span className="font-black text-white">{testimonials[0].reviewer_name}</span>
                {testimonials[0].reviewer_role ? `, ${testimonials[0].reviewer_role}` : ''}
                {testimonials[0].template?.name ? ` · modèle ${testimonials[0].template.name}` : ''}
              </figcaption>
            </figure>
          ) : (
            <p className="max-w-xl text-lg leading-8 text-white/65">
              {testimonialsSection.content.empty_state}
            </p>
          )}
        </div>
      </section>
      )}
      {renderBlocksFor(testimonialsSection?.key)}

      {sectorsSection && (
      <section className="overflow-hidden bg-white py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.62fr_1.38fr] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{sectorsSection.content.eyebrow}</p>
              <h2 className="mt-3 max-w-md text-3xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-5xl">
                {sectorsSection.content.headline}
              </h2>
              <Link href={sectorsSection.content.cta.url} className="mt-6 inline-flex items-center gap-1 text-sm font-black text-slate-950 hover:text-slate-600">
                {sectorsSection.content.cta.label} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse border-b border-slate-100 bg-slate-50" />
                ))}
              </div>
            ) : catalogError ? (
              <div className="border-y border-amber-200 bg-amber-50 px-5 py-6">
                <p className="text-sm text-amber-800">{catalogError}</p>
              </div>
            ) : sectors.length === 0 ? (
              <div className="border-y border-slate-200 px-5 py-6">
                <p className="text-sm text-slate-500">Aucun secteur actif disponible pour le moment.</p>
              </div>
            ) : (
              <div className="border-y border-slate-200">
                {sectors.slice(0, 6).map((sector, index) => (
                  <Link
                    key={sector.id}
                    href={`/secteurs/${sector.slug}`}
                    className="group grid gap-4 border-b border-slate-200 py-5 last:border-b-0 md:grid-cols-[4rem_1fr_auto] md:items-center"
                  >
                    <span className="text-sm font-black text-[oklch(57%_0.24_29)]">0{index + 1}</span>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-slate-950 transition-colors group-hover:text-[oklch(57%_0.24_29)]">
                        {sector.name}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{sector.description}</p>
                    </div>
                    <ArrowRight className="hidden h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-950 md:block" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      )}
      {renderBlocksFor(sectorsSection?.key)}

      {faqSection && (
      <section className="bg-white px-5 py-12 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">{faqSection.content.eyebrow}</p>
            <h2 className="mt-4 max-w-md text-3xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-5xl">
              {faqSection.content.headline}
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
              {faqSection.content.description}
            </p>
            <Link href={faqSection.content.cta.url} className="mt-7 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-slate-800">
              {faqSection.content.cta.label}
            </Link>
          </div>

          <div className="border-y border-slate-200">
            {loading ? (
              <div className="space-y-0">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-16 animate-pulse border-b border-slate-100 bg-slate-50 last:border-b-0" />
                ))}
              </div>
            ) : homeFaqs.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {homeFaqs.map((faq) => (
                  <div key={faq.id} className="py-5">
                    <button
                      className="group flex w-full items-center justify-between gap-4 text-left"
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    >
                      <span className="text-lg font-black text-slate-950 transition-colors group-hover:text-[oklch(57%_0.24_29)]">{faq.question}</span>
                      <Plus className={cn('h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200', openFaq === faq.id && 'rotate-45 text-[oklch(57%_0.24_29)]')} />
                    </button>
                    {openFaq === faq.id && (
                      <p className="mt-3 max-w-2xl whitespace-pre-line pr-8 text-sm leading-6 text-slate-500">{faq.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8">
                <p className="text-sm text-slate-500">La FAQ publique sera publiée ici dès qu'elle sera configurée dans le backoffice.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      )}
      {renderBlocksFor(faqSection?.key)}

      {unplacedBlocks.map((block) => (
        <FreeContentBlock key={block.id} block={block} />
      ))}

      {closingSection && (
      <section className="bg-slate-950 px-5 py-12 text-white md:py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-7 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-white/45">{closingSection.content.eyebrow}</p>
            <h2 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">{closingSection.content.headline}</h2>
            <p className="mt-4 text-sm leading-6 text-white/60 md:text-base">
              {closingSection.content.description}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link href={closingSection.content.primary_cta.url} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 hover:bg-slate-100">
              {closingSection.content.primary_cta.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={closingSection.content.secondary_cta.url} className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white hover:bg-white/10">
              {closingSection.content.secondary_cta.label}
            </Link>
          </div>
        </div>
      </section>
      )}
      {renderBlocksFor(closingSection?.key)}
    </div>
  );
}
