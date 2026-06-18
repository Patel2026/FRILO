"use client"

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Plus,
} from 'lucide-react';
import { FreeContentBlock } from '@/components/content/FreeContentBlock';
import { HOME_PUBLIC_CONTENT_FALLBACK } from '@/content/home.fallback';
import { usePublicContent } from '@/hooks/usePublicContent';
import { usePublicPricing } from '@/hooks/usePublicPricing';
import {
  HomeBenefitsContent,
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

function PublicShell({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn('bg-white px-5 py-12 md:px-8 md:py-16', className)}>
      <div className="mx-auto max-w-[1360px]">
        {children}
      </div>
    </section>
  );
}

function SectionIntro({
  label,
  title,
  description,
  action,
  invert = false,
}: {
  label?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  invert?: boolean;
}) {
  return (
    <div className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.72fr)] lg:items-end">
      <div>
        {label && (
          <p className={cn('mb-4 text-[0.68rem] font-black uppercase tracking-[0.2em]', invert ? 'text-white/50' : 'text-black/45')}>
            {label}
          </p>
        )}
        <h2 className={cn('max-w-4xl font-serif text-4xl font-medium leading-[0.96] tracking-[-0.04em] text-balance md:text-5xl lg:text-6xl', invert ? 'text-white' : 'text-black')}>
          {title}
        </h2>
      </div>
      <div className="flex flex-col items-start gap-5 lg:items-end">
        {description && (
          <p className={cn('max-w-xl text-base leading-7 md:text-lg', invert ? 'text-white/68' : 'text-black/62')}>
            {description}
          </p>
        )}
        {action}
      </div>
    </div>
  );
}

function PillLink({
  href,
  children,
  variant = 'black',
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: 'black' | 'white' | 'outline-white' | 'outline-black' | 'blue';
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-black transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        variant === 'black' && 'bg-black text-white hover:bg-neutral-800 focus-visible:ring-black',
        variant === 'white' && 'bg-white text-black hover:bg-neutral-100 focus-visible:ring-white',
        variant === 'outline-white' && 'border border-white/45 text-white hover:bg-white hover:text-black focus-visible:ring-white',
        variant === 'outline-black' && 'border border-black text-black hover:bg-black hover:text-white focus-visible:ring-black',
        variant === 'blue' && 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] focus-visible:ring-[#2563eb]',
        className
      )}
    >
      {children}
    </Link>
  );
}

function LoadingTiles({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="aspect-[4/5] animate-pulse bg-neutral-100" />
      ))}
    </div>
  );
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
  const pricingContent = pricingSection?.content;
  const priceLabel = `${pricing.standard.price.toLocaleString('fr-FR')} ${pricing.currency_label}`;
  const cmsIncludedItems = pricingContent?.included_items?.length ? pricingContent.included_items : includedItems;
  const sectorRail = sectors.length > 0
    ? sectors.slice(0, 9).map((sector) => sector.name)
    : ['Restaurants', 'Immobilier', 'Coaching', 'Santé', 'Artisanat', 'Services', 'Boutiques', 'Avocats', 'Beauté'];
  const renderBlocksFor = (anchor: string | null | undefined) => (
    getBlocksForAnchor(publicContent, anchor ?? null).map((block) => (
      <FreeContentBlock key={block.id} block={block} />
    ))
  );
  const anchoredBlockIds = new Set(publicContent.blocks.filter((block) => block.anchor_section_key).map((block) => block.id));
  const unplacedBlocks = publicContent.blocks.filter((block) => !anchoredBlockIds.has(block.id) && block.anchor_section_key === null);

  return (
    <div className="flex flex-col bg-white text-black">
      <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-black text-white">
        <img
          src="/image/client-satisfait-frilo.jpg"
          alt="Entrepreneur consultant son site FRILO depuis son espace de travail."
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-[58%_42%] opacity-70 saturate-[0.92]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,0,0,0.12),rgba(0,0,0,0.74)_72%),linear-gradient(180deg,rgba(0,0,0,0.54),rgba(0,0,0,0.18)_36%,rgba(0,0,0,0.78))]" />

        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1440px] flex-col px-5 pb-8 pt-28 md:px-8 md:pt-32">
          <div className="flex flex-1 items-center justify-center py-16 text-center">
            <div className="max-w-6xl">
              <h1 className="mx-auto max-w-[12ch] font-serif text-[clamp(4rem,9.5vw,9.5rem)] font-medium leading-[0.84] tracking-[-0.07em] text-balance">
                {hero.headline}
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/80 md:text-xl md:leading-8">
                {hero.description}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <PillLink href={hero.primary_cta.url} variant="white">
                  {hero.primary_cta.label}
                </PillLink>
                <PillLink href={hero.secondary_cta.url} variant="blue">
                  {hero.secondary_cta.label}
                </PillLink>
              </div>
            </div>
          </div>

          <div className="overflow-hidden border-t border-white/20 pt-5">
            <div className="flex min-w-max animate-[frilo-marquee_32s_linear_infinite] items-center gap-10 text-sm font-black text-white/80 [animation-play-state:running] motion-reduce:animate-none">
              {[...sectorRail, ...sectorRail].map((label, index) => (
                <span key={`${label}-${index}`} className="whitespace-nowrap">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      {renderBlocksFor('home.hero')}

      {modelsSection && (
        <PublicShell className="pb-8 md:pb-12">
          <SectionIntro
            label={modelsSection.content.eyebrow}
            title={modelsSection.content.headline}
            description={modelsSection.content.description}
            action={(
              <PillLink href={modelsSection.content.cta.url} variant="outline-black">
                {modelsSection.content.cta.label}
              </PillLink>
            )}
          />

          {loading ? (
            <LoadingTiles />
          ) : catalogError ? (
            <div className="border-y border-amber-200 bg-amber-50 px-6 py-8 text-center">
              <p className="text-sm text-amber-900">{catalogError}</p>
            </div>
          ) : featuredTemplates.length === 0 ? (
            <div className="border-y border-neutral-200 px-6 py-12 text-center">
              <p className="text-sm text-black/60">Aucun modèle mis en avant pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {featuredTemplates.slice(0, 4).map((template, index) => {
                  const templateImage = getTemplateImage(template);

                  return (
                    <Link
                      key={template.id}
                      href={`/templates/${template.id}`}
                      className={cn(
                        'group flex min-h-[26rem] flex-col overflow-hidden bg-neutral-100 text-black transition-transform duration-500 hover:-translate-y-1',
                        index === 0 && 'md:col-span-2'
                      )}
                    >
                      <div className="relative flex-1 overflow-hidden">
                        {templateImage ? (
                          <img
                            src={templateImage}
                            alt={template.name}
                            className="h-full min-h-[18rem] w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="h-full min-h-[18rem] w-full bg-neutral-200" />
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent p-5 text-white">
                          {template.sector?.name && (
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/66">{template.sector.name}</p>
                          )}
                          <h3 className="mt-2 max-w-md font-serif text-3xl font-medium leading-none tracking-[-0.04em]">
                            {template.name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 bg-white px-5 py-5">
                        <p className="max-w-sm text-sm leading-6 text-black/58">{templateSummary(template)}</p>
                        <span className="shrink-0 text-sm font-black">
                          {getTemplatePrice(template).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="flex flex-col gap-4 border-y border-black py-5 md:flex-row md:items-center md:justify-between">
                <p className="max-w-3xl text-2xl font-black leading-tight tracking-[-0.03em]">
                  Vous ne voyez pas votre activité ? FRILO adapte la base la plus proche à vos textes, vos photos et vos contacts.
                </p>
                <PillLink href="/templates" variant="black" className="shrink-0">
                  Voir tout le catalogue
                </PillLink>
              </div>
            </div>
          )}
        </PublicShell>
      )}
      {renderBlocksFor(modelsSection?.key)}

      {benefitsSection && (
        <PublicShell className="pt-8 md:pt-12">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <div className="relative min-h-[28rem] overflow-hidden bg-black">
              <img
                src="/image/client-satisfait-frilo.jpg"
                alt="Client FRILO utilisant son site pour présenter son activité."
                className="h-full w-full object-cover grayscale transition-transform duration-700 hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div className="flex flex-col justify-between border-y border-black py-7">
              <div>
                <p className="mb-4 text-[0.68rem] font-black uppercase tracking-[0.2em] text-black/45">{benefitsSection.content.eyebrow}</p>
                <h2 className="max-w-3xl font-serif text-4xl font-medium leading-[0.96] tracking-[-0.045em] text-balance md:text-6xl">
                  {benefitsSection.content.headline}
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-8 text-black/62">
                  {benefitsSection.content.description}
                </p>
              </div>
              <div className="mt-8 divide-y divide-neutral-200">
                {benefitsSection.content.items.map((benefit) => (
                  <div key={benefit.title} className="grid gap-4 py-5 md:grid-cols-[0.46fr_1fr]">
                    <h3 className="text-xl font-black leading-tight tracking-[-0.02em]">{benefit.title}</h3>
                    <p className="text-base leading-7 text-black/58">{benefit.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="max-w-xl text-lg font-black leading-7 tracking-[-0.02em]">{benefitsSection.content.closing_copy}</p>
                <PillLink href={benefitsSection.content.cta.url} variant="black">
                  {benefitsSection.content.cta.label}
                </PillLink>
              </div>
            </div>
          </div>
        </PublicShell>
      )}
      {renderBlocksFor(benefitsSection?.key)}

      {processSection && (
        <PublicShell id="how-it-works" className="py-12 md:py-16">
          <SectionIntro
            label={processSection.content.eyebrow}
            title={processSection.content.headline}
            description={processSection.content.description}
          />
          <div className="grid border-y border-black lg:grid-cols-2">
            <div className="border-b border-black p-6 md:p-8 lg:border-b-0 lg:border-r">
              <p className="mb-5 text-[0.68rem] font-black uppercase tracking-[0.2em] text-black/45">Vous faites</p>
              <div className="divide-y divide-neutral-200">
                {processSection.content.customer_steps.map((step, index) => (
                  <div key={step.title} className="grid gap-4 py-5 md:grid-cols-[4rem_1fr]">
                    <span className="font-serif text-3xl leading-none tracking-[-0.04em] text-black/36">{index + 1}</span>
                    <div>
                      <h3 className="text-2xl font-black tracking-[-0.03em]">{step.title}</h3>
                      <p className="mt-2 max-w-xl text-base leading-7 text-black/58">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-black p-6 text-white md:p-8">
              <p className="mb-5 text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/45">FRILO fait</p>
              <div className="divide-y divide-white/18">
                {processSection.content.frilo_steps.map((step, index) => (
                  <div key={step.title} className="grid gap-4 py-5 md:grid-cols-[4rem_1fr]">
                    <span className="font-serif text-3xl leading-none tracking-[-0.04em] text-white/42">{index + 1}</span>
                    <div>
                      <h3 className="text-2xl font-black tracking-[-0.03em]">{step.title}</h3>
                      <p className="mt-2 max-w-xl text-base leading-7 text-white/62">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-5 border-t border-white/24 pt-6 md:flex-row md:items-center md:justify-between">
                <p className="max-w-xl text-xl font-black leading-tight tracking-[-0.03em]">{processSection.content.result_copy}</p>
                <PillLink href={processSection.content.cta.url} variant="white">
                  {processSection.content.cta.label}
                </PillLink>
              </div>
            </div>
          </div>
        </PublicShell>
      )}
      {renderBlocksFor(processSection?.key)}

      {pricingSection && pricingContent && (
        <PublicShell id="pricing">
          <SectionIntro
            label={pricingContent.eyebrow}
            title={withPricePlaceholder(pricingContent.headline, priceLabel)}
            description={pricingContent.description}
          />

          <div className="grid gap-0 border-y border-black lg:grid-cols-[0.82fr_1.18fr]">
            <div className="bg-black p-7 text-white md:p-10">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/48">{pricingContent.package_eyebrow}</p>
              <p className="mt-7 font-serif text-6xl font-medium leading-none tracking-[-0.06em] md:text-8xl">
                {pricing.standard.price.toLocaleString('fr-FR')}
              </p>
              <p className="mt-2 text-sm font-black text-white/58">{pricing.currency_label} · Paiement unique</p>
              <p className="mt-8 max-w-md text-xl font-black leading-8 tracking-[-0.02em]">
                {pricingContent.package_description}
              </p>
              <PillLink href={pricingContent.primary_cta.url} variant="white" className="mt-8">
                {pricingContent.primary_cta.label}
              </PillLink>
            </div>

            <div className="p-7 md:p-10">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-black/45">{pricingContent.options_eyebrow}</p>
                  <h3 className="mt-3 max-w-md font-serif text-4xl font-medium leading-none tracking-[-0.05em]">
                    {pricingContent.options_headline}
                  </h3>
                  <p className="mt-5 max-w-md text-base leading-7 text-black/58">
                    {pricingContent.options_description}
                  </p>
                </div>
                <div className="divide-y divide-neutral-200 border-y border-neutral-200">
                  {popularOptions.map((option) => (
                    <div key={option.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                      <span className="font-black text-black/78">{option.name}</span>
                      <span className="shrink-0 font-black text-black">+{option.price.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  ))}
                  {popularOptions.length === 0 && (
                    <p className="py-4 text-sm text-black/55">Les options disponibles apparaissent pendant la commande.</p>
                  )}
                </div>
              </div>

              <div className="mt-8 grid gap-3 border-t border-neutral-200 pt-6 sm:grid-cols-2 xl:grid-cols-3">
                {cmsIncludedItems.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-black text-black/72">
                    <Check className="h-4 w-4 shrink-0 text-[#2563eb]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-sm text-black/58 sm:flex-row sm:items-center sm:justify-between">
            <p>{pricingContent.payment_note}</p>
            <p>
              {pricing.custom_note || 'Projet spécifique ?'}{' '}
              <Link href={pricingContent.secondary_cta.url} className="font-black text-black underline underline-offset-4">{pricingContent.secondary_cta.label}.</Link>
            </p>
          </div>
        </PublicShell>
      )}
      {renderBlocksFor(pricingSection?.key)}

      {testimonialsSection && (
        <section className="bg-black px-5 py-14 text-white md:px-8 md:py-20">
          <div className="mx-auto max-w-[1360px]">
            <SectionIntro
              label={testimonialsSection.content.eyebrow}
              title={testimonialsSection.content.headline}
              invert
            />
            {loading ? (
              <div className="h-52 animate-pulse bg-white/10" />
            ) : testimonials.length > 0 ? (
              <figure className="grid gap-8 border-y border-white/20 py-8 lg:grid-cols-[0.62fr_1.38fr] lg:items-center">
                <div className="relative min-h-[18rem] overflow-hidden">
                  <img
                    src="/image/client-satisfait-frilo.jpg"
                    alt="Client FRILO satisfait après la livraison de son site."
                    className="h-full w-full object-cover grayscale"
                  />
                </div>
                <div>
                  <blockquote className="max-w-5xl font-serif text-4xl font-medium leading-[1.02] tracking-[-0.045em] md:text-6xl">
                    “{testimonials[0].content}”
                  </blockquote>
                  <figcaption className="mt-7 text-sm leading-6 text-white/58">
                    <span className="font-black text-white">{testimonials[0].reviewer_name}</span>
                    {testimonials[0].reviewer_role ? `, ${testimonials[0].reviewer_role}` : ''}
                    {testimonials[0].template?.name ? ` · modèle ${testimonials[0].template.name}` : ''}
                  </figcaption>
                </div>
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
        <PublicShell>
          <SectionIntro
            label={sectorsSection.content.eyebrow}
            title={sectorsSection.content.headline}
            action={(
              <PillLink href={sectorsSection.content.cta.url} variant="outline-black">
                {sectorsSection.content.cta.label}
              </PillLink>
            )}
          />
          {loading ? (
            <div className="space-y-0 border-y border-neutral-200">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-20 animate-pulse border-b border-neutral-100 bg-neutral-50 last:border-b-0" />
              ))}
            </div>
          ) : catalogError ? (
            <div className="border-y border-amber-200 bg-amber-50 px-5 py-6">
              <p className="text-sm text-amber-900">{catalogError}</p>
            </div>
          ) : sectors.length === 0 ? (
            <div className="border-y border-neutral-200 px-5 py-6">
              <p className="text-sm text-black/55">Aucun secteur actif disponible pour le moment.</p>
            </div>
          ) : (
            <div className="border-y border-black">
              {sectors.slice(0, 7).map((sector, index) => (
                <Link
                  key={sector.id}
                  href={`/secteurs/${sector.slug}`}
                  className="group grid gap-4 border-b border-neutral-200 py-6 last:border-b-0 md:grid-cols-[5rem_1fr_auto] md:items-center"
                >
                  <span className="font-serif text-3xl leading-none tracking-[-0.05em] text-black/32">{index + 1}</span>
                  <div>
                    <h3 className="font-serif text-4xl font-medium leading-none tracking-[-0.05em] text-black transition-colors group-hover:text-[#2563eb]">
                      {sector.name}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">{sector.description}</p>
                  </div>
                  <ArrowRight className="hidden h-5 w-5 text-black/30 transition-transform group-hover:translate-x-1 group-hover:text-black md:block" />
                </Link>
              ))}
            </div>
          )}
        </PublicShell>
      )}
      {renderBlocksFor(sectorsSection?.key)}

      {faqSection && (
        <PublicShell>
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="mb-4 text-[0.68rem] font-black uppercase tracking-[0.2em] text-black/45">{faqSection.content.eyebrow}</p>
              <h2 className="max-w-xl font-serif text-4xl font-medium leading-[0.96] tracking-[-0.045em] md:text-6xl">
                {faqSection.content.headline}
              </h2>
              <p className="mt-6 max-w-sm text-base leading-7 text-black/58">
                {faqSection.content.description}
              </p>
              <PillLink href={faqSection.content.cta.url} variant="black" className="mt-7">
                {faqSection.content.cta.label}
              </PillLink>
            </div>

            <div className="border-y border-black">
              {loading ? (
                <div className="space-y-0">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="h-20 animate-pulse border-b border-neutral-100 bg-neutral-50 last:border-b-0" />
                  ))}
                </div>
              ) : homeFaqs.length > 0 ? (
                <div className="divide-y divide-neutral-200">
                  {homeFaqs.map((faq) => (
                    <div key={faq.id} className="py-6">
                      <button
                        className="group flex w-full items-center justify-between gap-4 text-left"
                        onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                      >
                        <span className="text-xl font-black leading-tight tracking-[-0.02em] text-black transition-colors group-hover:text-[#2563eb]">{faq.question}</span>
                        <Plus className={cn('h-5 w-5 shrink-0 text-black/38 transition-transform duration-200', openFaq === faq.id && 'rotate-45 text-black')} />
                      </button>
                      {openFaq === faq.id && (
                        <p className="mt-4 max-w-2xl whitespace-pre-line pr-8 text-sm leading-6 text-black/58">{faq.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8">
                  <p className="text-sm text-black/55">La FAQ publique sera publiée ici dès qu&apos;elle sera configurée dans le backoffice.</p>
                </div>
              )}
            </div>
          </div>
        </PublicShell>
      )}
      {renderBlocksFor(faqSection?.key)}

      {unplacedBlocks.map((block) => (
        <FreeContentBlock key={block.id} block={block} />
      ))}
    </div>
  );
}
