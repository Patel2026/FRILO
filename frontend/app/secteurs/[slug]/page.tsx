"use client"

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import {
  PublicBenefitStrip,
  PublicEmptyState,
  PublicFinalCta,
  PublicHero,
  PublicPageShell,
} from '@/components/public/PublicPageShell';
import { PUBLIC_CARD_TITLE_CLASS, PUBLIC_PAGE_TEXT } from '@/components/public/publicPageCopy';
import { businessService, Template, Sector } from '@/services/business.service';
import { cn, parseFeatures } from '@/lib/utils';
import { hasLivePreview, parsePreviewGallery } from '@/lib/templatePreview';

type SectorGuidance = {
  promise: string;
  proof: string;
  clientQuestions: string[];
  siteJobs: string[];
};

const SECTOR_GUIDANCE: Record<string, SectorGuidance> = {
  avocats: {
    promise: "Votre cabinet doit inspirer confiance avant le premier appel.",
    proof: "Un visiteur veut comprendre votre domaine, votre sérieux et comment vous contacter sans hésiter.",
    clientQuestions: ["Puis-je leur confier mon dossier ?", "Ont-ils l’air sérieux ?", "Comment prendre contact ?"],
    siteJobs: ["Présenter les domaines d’intervention", "Rassurer avec une image sobre", "Rendre le contact immédiat"],
  },
  btp: {
    promise: "Vos réalisations doivent parler avant le devis.",
    proof: "Le client cherche des preuves visibles : chantiers, zones d’intervention, types de travaux et contact rapide.",
    clientQuestions: ["Ont-ils déjà fait ce type de chantier ?", "Sont-ils fiables ?", "Comment demander un devis ?"],
    siteJobs: ["Montrer les réalisations", "Clarifier les services", "Faciliter la demande de devis"],
  },
  coaching: {
    promise: "Votre expertise doit paraître claire, utile et crédible.",
    proof: "Le visiteur veut savoir ce que vous pouvez résoudre pour lui, comment vous travaillez et pourquoi vous écouter.",
    clientQuestions: ["Est-ce adapté à mon besoin ?", "Quelle est leur méthode ?", "Comment démarrer ?"],
    siteJobs: ["Expliquer l’offre simplement", "Présenter les résultats attendus", "Créer un chemin de prise de contact"],
  },
  immobilier: {
    promise: "Vos biens doivent être faciles à regarder et faciles à demander.",
    proof: "Un prospect compare vite. Il doit voir les biens, comprendre les critères et savoir comment visiter.",
    clientQuestions: ["Quels biens sont disponibles ?", "Puis-je me projeter ?", "Comment organiser une visite ?"],
    siteJobs: ["Mettre les biens en valeur", "Rendre les critères lisibles", "Déclencher une demande de visite"],
  },
  restaurants: {
    promise: "Votre table doit donner envie avant même la réservation.",
    proof: "Le client veut voir l’ambiance, comprendre le menu, vérifier les horaires et passer à l’action vite.",
    clientQuestions: ["Qu’est-ce qu’on mange ?", "Est-ce ouvert ?", "Comment réserver ou commander ?"],
    siteJobs: ["Montrer le menu et l’ambiance", "Afficher les informations pratiques", "Accélérer la réservation"],
  },
  sante: {
    promise: "Votre présence en ligne doit rassurer sans compliquer le rendez-vous.",
    proof: "Le patient ou client cherche un cadre sérieux, des services compréhensibles et un accès simple au contact.",
    clientQuestions: ["Puis-je faire confiance ?", "Quels soins sont proposés ?", "Comment prendre rendez-vous ?"],
    siteJobs: ["Clarifier les services", "Installer une image professionnelle", "Simplifier la prise de rendez-vous"],
  },
};

const DEFAULT_GUIDANCE: SectorGuidance = {
  promise: "Votre site doit rendre votre activité évidente dès les premières secondes.",
  proof: "Le visiteur veut comprendre ce que vous faites, pourquoi vous choisir et comment vous contacter.",
  clientQuestions: ["Est-ce le bon prestataire ?", "Que proposent-ils exactement ?", "Comment les joindre ?"],
  siteJobs: ["Présenter l’activité clairement", "Rassurer avant le contact", "Rendre la commande simple"],
};

function getTemplatePrice(template: Template): number {
  return typeof template.price === 'string' ? parseInt(template.price, 10) : template.price;
}

function formatPrice(template: Template): string {
  return `${getTemplatePrice(template).toLocaleString('fr-FR')} FCFA`;
}

function getTemplateImage(template: Template): string {
  return template.full_thumbnail_url || parsePreviewGallery(template.preview_gallery)[0] || '';
}

function SectorLoading() {
  return (
    <div className="min-h-screen bg-[#f7f4ec] px-5 py-28">
      <div className="mx-auto max-w-[1360px]">
        <div className="h-5 w-36 rounded-full bg-slate-200" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1fr]">
          <div className="h-72 bg-white" />
          <div className="h-72 bg-white" />
        </div>
      </div>
    </div>
  );
}

export default function SectorPage() {
  const { slug } = useParams() as { slug: string };
  const [sector, setSector] = useState<Sector | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function load() {
      try {
        setError(null);
        const sectors = await businessService.getSectors();
        const found = sectors.find((item) => item.slug === slug) || null;
        setSector(found);

        if (found) {
          const data = await businessService.getTemplates(slug);
          setTemplates(data);
        } else {
          setTemplates([]);
        }
      } catch {
        setSector(null);
        setTemplates([]);
        setError("Impossible de charger ce secteur pour le moment.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  const guidance = SECTOR_GUIDANCE[slug] || DEFAULT_GUIDANCE;
  const lowestPrice = useMemo(() => {
    if (templates.length === 0) {
      return null;
    }

    return Math.min(...templates.map(getTemplatePrice));
  }, [templates]);

  if (loading) {
    return <SectorLoading />;
  }

  if (!sector) {
    return (
      <PublicPageShell className="px-5 py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">Secteur</p>
          <h1 className="mt-4 text-4xl font-black leading-none text-black md:text-5xl">Ce secteur est introuvable.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-black/62">{error || "Le secteur demandé n’est pas disponible pour le moment."}</p>
          <Link href="/secteurs" className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[#e60000]">
            Voir tous les secteurs
          </Link>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell>
      <PublicHero
        eyebrow="Secteur FRILO"
        title={sector.name}
        description={guidance.promise}
        primaryAction={{ label: 'Voir les modèles', href: '#modeles' }}
        secondaryAction={{ label: 'Tous les secteurs', href: '/secteurs' }}
        aside={(
          <div className="bg-black p-6 text-white md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Ce que vos clients cherchent</p>
            <p className="mt-4 max-w-2xl text-2xl font-black leading-tight md:text-3xl">
              {guidance.proof}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {guidance.clientQuestions.map((question) => (
                <div key={question} className="border-t border-white/20 pt-3 text-sm font-bold leading-6 text-white/75">
                  {question}
                </div>
              ))}
            </div>
          </div>
        )}
      />

      <PublicBenefitStrip
        items={[
          { title: 'Services visibles', description: 'Le visiteur comprend rapidement ce que vous proposez.' },
          { title: 'Preuves rassurantes', description: 'Images, réalisations ou arguments donnent confiance avant le contact.' },
          { title: 'Contact facile', description: 'Téléphone, WhatsApp ou demande de devis restent simples à trouver.' },
        ]}
      />

      <section id="modeles" className="px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-[1360px]">
          <Link href="/secteurs" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-black/62 transition-colors hover:text-black">
            <ArrowLeft className="h-4 w-4" />
            Tous les secteurs
          </Link>

          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="border-y border-black bg-white p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">Le site doit faire quoi ?</p>
                <div className="mt-6 space-y-4">
                  {guidance.siteJobs.map((job) => (
                    <div key={job} className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-sm font-bold leading-6 text-black/70">{job}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div>
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-black/40">
                    {templates.length} modèle{templates.length > 1 ? 's' : ''} disponible{templates.length > 1 ? 's' : ''}
                  </p>
                  <h2 className="mt-3 text-3xl font-black leading-tight text-black md:text-4xl">
                    Choisissez une base, FRILO l’adapte à votre activité.
                  </h2>
                </div>

                {lowestPrice !== null && (
                  <p className="text-sm font-bold text-black/62">
                    À partir de <span className="text-black">{lowestPrice.toLocaleString('fr-FR')} FCFA</span>
                  </p>
                )}
              </div>

              {templates.length > 0 ? (
                <div className="space-y-4">
                  {templates.map((template) => {
                    const features = parseFeatures(template.features);

                    return (
                      <article key={template.id} className="overflow-hidden border-y border-black bg-white">
                        <div className="grid gap-0 lg:grid-cols-[0.72fr_1fr]">
                          <Link href={`/templates/${template.id}`} className="group relative block aspect-[4/3] overflow-hidden bg-black/5 lg:aspect-auto lg:min-h-[360px]">
                            {getTemplateImage(template) ? (
                              <img
                                src={getTemplateImage(template)}
                                alt={`Aperçu du modèle ${template.name}`}
                                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                              />
                            ) : (
                              <div className="flex h-full min-h-[260px] items-center justify-center text-sm font-bold text-slate-400">
                                Aperçu du modèle
                              </div>
                            )}
                          </Link>

                          <div className="flex flex-col p-6 md:p-8">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e60000]">{sector.name}</p>
                                <h3 className={cn('mt-3 text-3xl font-black text-black md:text-4xl', PUBLIC_CARD_TITLE_CLASS)}>{template.name}</h3>
                              </div>
                              <p className="shrink-0 rounded-full bg-black px-4 py-2 text-sm font-black text-white">{formatPrice(template)}</p>
                            </div>

                            {template.description && (
                              <p className="mt-5 max-w-2xl text-base leading-7 text-black/62">{template.description}</p>
                            )}

                            {features.length > 0 && (
                              <div className="mt-6 flex flex-wrap gap-2">
                                {features.slice(0, 5).map((feature) => (
                                  <span key={feature} className="rounded-full bg-black/5 px-3 py-2 text-xs font-black text-black/70">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                              <Link href={`/templates/${template.id}/preview`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-black px-5 py-4 text-sm font-black text-black transition-colors hover:bg-black hover:text-white">
                                {hasLivePreview(template.preview_url) ? "Voir l’aperçu" : "Voir le modèle"}
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                              <Link href={`/commande?templateId=${template.id}`} className="inline-flex flex-1 items-center justify-center rounded-full bg-black px-5 py-4 text-sm font-black text-white transition-colors hover:bg-[#e60000]">
                                Commander ce modèle
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <PublicEmptyState
                  title="FRILO peut vous orienter vers le modèle le plus proche."
                  description="Dites-nous votre activité, nous vous indiquerons la meilleure base à adapter."
                  action={{ label: 'Demander conseil', href: '/contact?subject=Choix%20du%20secteur' }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <PublicFinalCta
        title={PUBLIC_PAGE_TEXT.sectors.helperTitle}
        description={PUBLIC_PAGE_TEXT.sectors.helperDescription}
        href="/contact?subject=Choix%20du%20secteur"
        label="Demander une orientation"
      />
    </PublicPageShell>
  );
}
