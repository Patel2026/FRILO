"use client"

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Eye,
  MonitorSmartphone,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { SectorCard } from '@/components/business/SectorCard';
import { TestimonialCard } from '@/components/business/TestimonialCard';
import { TemplateCard } from '@/components/business/TemplateCard';
import { usePublicPricing } from '@/hooks/usePublicPricing';
import { formatPublicPrice } from '@/lib/publicPricing';
import { hasLivePreview, parsePreviewGallery } from '@/lib/templatePreview';
import { businessService, FaqItem, Sector, Template, TemplateReview } from '@/services/business.service';
import { cn, parseFeatures } from '@/lib/utils';

const FEATURED_TEMPLATE_LIMIT = 6;

const PROOF_POINTS = [
  {
    title: 'Une activité claire',
    desc: "Vos services, vos horaires et votre contact sont compris sans chercher.",
  },
  {
    title: 'Une image sérieuse',
    desc: "Votre entreprise donne confiance avant le premier appel ou message WhatsApp.",
  },
  {
    title: 'Un départ simple',
    desc: "Vous choisissez un modèle, FRILO l'adapte à votre métier et à vos contenus.",
  },
  {
    title: 'Un prix assumé',
    desc: 'Le tarif est annoncé en FCFA avant la commande, sans frais cachés.',
  },
];

const INCLUDED_FEATURES = [
  { icon: MonitorSmartphone, title: 'Mobile impeccable', desc: 'Votre site reste clair sur téléphone, tablette et ordinateur.' },
  { icon: Eye, title: 'Aperçus réels', desc: 'Vous choisissez avec des modèles visibles, pas avec une promesse abstraite.' },
  { icon: ShieldCheck, title: 'Mise en ligne incluse', desc: "FRILO prépare le site, l'adapte et vous remet un lien exploitable." },
  { icon: BadgeCheck, title: 'Support après livraison', desc: 'Vous gardez un interlocuteur pour les derniers réglages.' },
];

const STEPS = [
  {
    title: 'Choisissez un modèle',
    desc: 'Parcourez les styles par secteur et ouvrez les aperçus qui ressemblent à votre activité.',
  },
  {
    title: 'Envoyez vos informations',
    desc: "Nom, activité, couleurs, textes, images. Le formulaire va droit au nécessaire.",
  },
  {
    title: 'Recevez votre site',
    desc: "L'équipe adapte le modèle, met votre contenu en place et vous accompagne jusqu'à la publication.",
  },
];

function getTemplatePrice(template: Template): number {
  return typeof template.price === 'string' ? parseInt(template.price, 10) : template.price;
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

export default function Home() {
  const { pricing } = usePublicPricing();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<Template[]>([]);
  const [testimonials, setTestimonials] = useState<TemplateReview[]>([]);
  const [homeFaqs, setHomeFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      const [testimonialsData, faqsData] = await Promise.all([
        businessService.getFeaturedTestimonials(3).catch(() => []),
        businessService.getFaqs(6).catch(() => []),
      ]);

      setTestimonials(testimonialsData);
      setHomeFaqs(faqsData);

      try {
        setCatalogError(null);
        const [sectorsData, templatesData] = await Promise.all([
          businessService.getSectors(),
          businessService.getTemplates(),
        ]);
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

  const startingPriceLabel = formatPublicPrice(pricing.starting_price, pricing.currency_label);

  return (
    <div className="flex flex-col bg-white text-slate-950">
      <section className="relative isolate overflow-hidden bg-[oklch(9%_0.006_270)] pt-28 text-[oklch(98%_0.004_270)] md:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,oklch(57%_0.24_29/0.26),transparent_24%),linear-gradient(135deg,oklch(5%_0.004_270)_0%,oklch(10%_0.006_270)_58%,oklch(17%_0.02_270)_100%)]" />
        <div className="absolute right-0 top-28 hidden h-24 w-3 bg-[oklch(57%_0.24_29)] lg:block" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-10 sm:px-6 md:pb-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border border-[oklch(98%_0.004_270/0.28)] bg-[oklch(98%_0.004_270/0.08)] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[oklch(86%_0.004_270)]">
              Site vitrine en 48h · dès {startingPriceLabel}
            </p>
            <h1 className="max-w-[11ch] text-4xl font-black leading-[0.94] tracking-tight text-[oklch(98%_0.004_270)] md:max-w-none md:text-5xl lg:text-6xl">
              Votre entreprise mérite mieux qu'un simple profil WhatsApp.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[oklch(82%_0.006_270)] md:text-lg">
              FRILO transforme vos informations en site vitrine clair, crédible et prêt à rassurer vos clients. Vous choisissez le style, nous installons le sérieux.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/templates" className="inline-flex items-center justify-center gap-2 rounded-full bg-[oklch(57%_0.24_29)] px-6 py-3 text-sm font-black text-[oklch(98%_0.004_270)] transition-colors hover:bg-[oklch(51%_0.24_29)]">
                Voir ce que mon site peut devenir <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-full border border-[oklch(98%_0.004_270/0.34)] px-6 py-3 text-sm font-black text-[oklch(98%_0.004_270)] transition-colors hover:bg-[oklch(98%_0.004_270/0.09)]">
                Comprendre la commande
              </Link>
            </div>
          </div>

          <div className="relative min-h-[520px] text-[oklch(10%_0.006_270)]">
            <div className="absolute -right-2 top-8 h-40 w-4 bg-[oklch(57%_0.24_29)]" />
            <div className="relative ml-auto max-w-[620px] overflow-hidden rounded-[2rem] border border-[oklch(98%_0.004_270/0.76)] bg-[oklch(98%_0.004_270)] shadow-[0_35px_100px_rgba(0,0,0,0.42)]">
              <div className="relative aspect-[0.92] min-h-[460px] md:aspect-[1.05]">
                <img
                  src="/image/client-satisfait-frilo.jpg"
                  alt="Client souriant devant son ordinateur après avoir obtenu une présence en ligne professionnelle."
                  className="h-full w-full object-cover object-[58%_42%] grayscale contrast-110"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.72),rgba(0,0,0,0.12),rgba(0,0,0,0.02))]" />
                <div className="absolute left-5 top-5 rounded-full bg-[oklch(98%_0.004_270)] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[oklch(10%_0.006_270)]">
                  Client satisfait
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
                  <div className="max-w-md rounded-[1.35rem] bg-[oklch(98%_0.004_270)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Après FRILO</p>
                    <p className="mt-2 text-2xl font-black leading-tight tracking-tight text-[oklch(10%_0.006_270)]">
                      "Ils ont compris mon activité avant même de m'appeler."
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="relative z-10 border-b border-slate-100 bg-white pb-10 pt-8 md:-mt-6">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:px-8">
          <div className="lg:-translate-y-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Pourquoi ça rassure</p>
            <h2 className="mt-3 max-w-md text-3xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-4xl">
              Ce que vos clients voient avant de vous écrire.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PROOF_POINTS.map((proof, index) => (
              <div key={proof.title} className="grid grid-cols-[2.5rem_1fr] gap-4 rounded-2xl bg-slate-50 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-slate-950">{proof.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{proof.desc}</p>
                </div>
              </div>
            ))}
            <div className="rounded-2xl bg-slate-950 p-5 text-white sm:col-span-2">
              <p className="max-w-2xl text-xl font-black leading-tight tracking-tight">
                Le client ne voit pas un template. Il voit une entreprise organisée.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HomeSection
        eyebrow="Modèles"
        title="Choisissez le style que vos clients verront en premier."
        action={(
          <Link href="/templates" className="inline-flex items-center gap-1 text-sm font-black text-slate-950 hover:text-slate-600">
            Tout le catalogue <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      >
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(FEATURED_TEMPLATE_LIMIT)].map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-100" />
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredTemplates.map((template) => (
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
              />
            ))}
          </div>
        )}
      </HomeSection>

      <HomeSection eyebrow="Commande" title="Trois étapes, pas un projet interminable." className="bg-slate-50" action={(
        <Link href="/templates" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-slate-800">
          Commencer <ArrowRight className="h-4 w-4" />
        </Link>
      )}>
        <div id="how-it-works" className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <article key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6">
              <span className="text-sm font-black text-slate-400">0{index + 1}</span>
              <h3 className="mt-5 text-xl font-black tracking-tight text-slate-950">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{step.desc}</p>
            </article>
          ))}
        </div>
      </HomeSection>

      <HomeSection eyebrow="Image de marque" title="Votre entreprise paraît prête avant même le premier appel.">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="max-w-xl">
            <p className="text-base leading-7 text-slate-600">
              Une bonne page d'accueil ne décore pas votre activité. Elle rassure, explique, montre vos services et donne à vos clients une raison simple de vous contacter.
            </p>
            <div className="mt-6 grid gap-3">
              {INCLUDED_FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-slate-100 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-950">{title}</h3>
                    <p className="mt-1 text-sm leading-5 text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-4 text-white md:p-6">
            <div className="rounded-[1.35rem] bg-white p-5 text-slate-950">
              <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Ce que le client voit</p>
                  <h3 className="mt-1 text-2xl font-black tracking-tight">Une activité claire, crédible, joignable.</h3>
                </div>
                <div className="hidden rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white sm:block">En ligne</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {['Vos services', 'Vos preuves', 'Votre contact'].map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-8 h-20 rounded-xl bg-[linear-gradient(135deg,#dbeafe,#f8fafc)]" />
                    <p className="text-sm font-black">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </HomeSection>

      <HomeSection
        eyebrow="Secteurs"
        title="Des modèles pour les métiers que vos clients reconnaissent."
        className="bg-slate-50"
        action={(
          <Link href="/secteurs" className="inline-flex items-center gap-1 text-sm font-black text-slate-950 hover:text-slate-600">
            Tous les secteurs <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      >
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : catalogError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
            <p className="text-sm text-amber-800">{catalogError}</p>
          </div>
        ) : sectors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-slate-500">Aucun secteur actif disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sectors.slice(0, 6).map((sector) => (
              <SectorCard
                key={sector.id}
                name={sector.name}
                slug={sector.slug}
                description={sector.description}
                icon={sector.icon}
                gradient={sector.gradient}
              />
            ))}
          </div>
        )}
      </HomeSection>

      <HomeSection eyebrow="Tarifs" title={pricing.section_title.replace(/\n/g, ' ')}>
        <div className="grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
          {[
            { plan: pricing.standard, dark: false },
            { plan: pricing.premium, dark: true },
          ].map(({ plan, dark }) => (
            <article key={plan.name} className={cn('rounded-3xl border p-6 md:p-7', dark ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-950')}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={cn('text-xs font-black uppercase tracking-[0.16em]', dark ? 'text-white/50' : 'text-slate-400')}>{plan.name}</p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tight">{plan.price.toLocaleString('fr-FR')}</span>
                    <span className={cn('pb-1 text-sm font-semibold', dark ? 'text-white/45' : 'text-slate-400')}>{pricing.currency_label}</span>
                  </div>
                  <p className={cn('mt-1 text-sm', dark ? 'text-white/45' : 'text-slate-500')}>{plan.billing_label}</p>
                </div>
                {plan.badge_label && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-950">{plan.badge_label}</span>
                )}
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className={cn('flex gap-3 text-sm', dark ? 'text-white/75' : 'text-slate-600')}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/templates"
                className={cn('mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-black transition-colors', dark ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-950 text-white hover:bg-slate-800')}
              >
                {plan.cta_label}
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-500">
          {pricing.custom_note || 'Projet spécifique ?'}{' '}
          <Link href="/contact" className="font-black text-slate-950 underline underline-offset-4">Contactez-nous.</Link>
        </p>
      </HomeSection>

      <HomeSection eyebrow="Avis" title="La confiance se construit dans les détails." className="bg-slate-50">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : testimonials.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                rating={testimonial.rating}
                content={testimonial.content}
                reviewerName={testimonial.reviewer_name}
                reviewerRole={testimonial.reviewer_role}
                templateName={testimonial.template?.name ?? null}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-slate-500">
              Les premiers avis verifies apparaitront ici apres validation par notre equipe.
            </p>
          </div>
        )}
      </HomeSection>

      <section className="bg-white px-5 py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:px-8">
          <div className="rounded-[1.6rem] bg-slate-950 p-6 text-white md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Questions</p>
            <h2 className="mt-4 max-w-md text-3xl font-black leading-[1.02] tracking-tight md:text-4xl">
              Les réponses avant de commander.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
              Délais, prix, contenu, propriété du site : les points sensibles doivent être clairs avant paiement.
            </p>
            <Link href="/contact" className="mt-7 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-slate-100">
              Poser une question
            </Link>
          </div>

          <div className="rounded-[1.6rem] border border-slate-100 bg-slate-50 p-3">
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-2xl bg-white" />
                ))}
              </div>
            ) : homeFaqs.length > 0 ? (
              <div className="divide-y divide-slate-100 rounded-[1.25rem] bg-white">
                {homeFaqs.map((faq) => (
                  <div key={faq.id} className="px-5 py-4">
                    <button
                      className="group flex w-full items-center justify-between gap-4 text-left"
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    >
                      <span className="text-sm font-black text-slate-950 transition-colors group-hover:text-[oklch(57%_0.24_29)]">{faq.question}</span>
                      <Plus className={cn('h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200', openFaq === faq.id && 'rotate-45 text-[oklch(57%_0.24_29)]')} />
                    </button>
                    {openFaq === faq.id && (
                      <p className="mt-3 whitespace-pre-line pr-8 text-sm leading-6 text-slate-500">{faq.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
                <p className="text-sm text-slate-500">La FAQ publique sera publiée ici dès qu'elle sera configurée dans le backoffice.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-5 py-12 text-white md:py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-7 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-white/45">Prêt quand vous l'êtes</p>
            <h2 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">Donnez à votre entreprise le site qu'elle mérite.</h2>
            <p className="mt-4 text-sm leading-6 text-white/60 md:text-base">
              Parcourez les modèles, choisissez celui qui ressemble à votre ambition, puis laissez FRILO l'adapter.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link href="/templates" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 hover:bg-slate-100">
              Voir les modèles <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white hover:bg-white/10">
              Parler à un expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
