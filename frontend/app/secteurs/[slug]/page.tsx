"use client"

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { businessService, Template, Sector } from '@/services/business.service';
import { parseFeatures } from '@/lib/utils';
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
    <div className="min-h-screen bg-[oklch(98.5%_0.004_260)] px-5 py-28">
      <div className="mx-auto max-w-7xl">
        <div className="h-5 w-36 rounded-full bg-slate-200" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1fr]">
          <div className="h-72 rounded-[2rem] bg-slate-200" />
          <div className="h-72 rounded-[2rem] bg-slate-200" />
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
      <div className="min-h-screen bg-[oklch(98.5%_0.004_260)] px-5 py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[oklch(56%_0.22_29)]">Secteur</p>
          <h1 className="mt-4 text-4xl font-black leading-none text-slate-950 md:text-5xl">Ce secteur est introuvable.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-500">{error || "Le secteur demandé n’est pas disponible pour le moment."}</p>
          <Link href="/secteurs" className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[oklch(56%_0.22_29)]">
            Voir tous les secteurs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(98.5%_0.004_260)]">
      <section className="px-5 pb-12 pt-28 md:pb-16 md:pt-32">
        <div className="mx-auto max-w-[1400px] sm:px-6 lg:px-8">
          <Link href="/secteurs" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" />
            Tous les secteurs
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[0.86fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[oklch(56%_0.22_29)]">Secteur FRILO</p>
              <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] text-slate-950 md:text-6xl">
                {sector.name}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                {guidance.promise}
              </p>
            </div>

            <div className="rounded-[2rem] bg-slate-950 p-6 text-white md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Ce que vos clients cherchent</p>
              <p className="mt-4 max-w-2xl text-2xl font-black leading-tight md:text-3xl">
                {guidance.proof}
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {guidance.clientQuestions.map((question) => (
                  <div key={question} className="rounded-2xl bg-white/[0.06] px-4 py-4 text-sm font-bold leading-6 text-white/75">
                    {question}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 md:pb-20">
        <div className="mx-auto max-w-[1400px] sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[oklch(56%_0.22_29)]">Le site doit faire quoi ?</p>
                <div className="mt-6 space-y-4">
                  {guidance.siteJobs.map((job) => (
                    <div key={job} className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-sm font-bold leading-6 text-slate-700">{job}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div>
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    {templates.length} modèle{templates.length > 1 ? 's' : ''} disponible{templates.length > 1 ? 's' : ''}
                  </p>
                  <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-4xl">
                    Choisissez une base, FRILO l’adapte à votre activité.
                  </h2>
                </div>

                {lowestPrice !== null && (
                  <p className="text-sm font-bold text-slate-500">
                    À partir de <span className="text-slate-950">{lowestPrice.toLocaleString('fr-FR')} FCFA</span>
                  </p>
                )}
              </div>

              {templates.length > 0 ? (
                <div className="space-y-4">
                  {templates.map((template) => {
                    const features = parseFeatures(template.features);

                    return (
                      <article key={template.id} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
                        <div className="grid gap-0 lg:grid-cols-[0.72fr_1fr]">
                          <Link href={`/templates/${template.id}`} className="group relative block aspect-[4/3] overflow-hidden bg-slate-100 lg:aspect-auto lg:min-h-[360px]">
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
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[oklch(56%_0.22_29)]">{sector.name}</p>
                                <h3 className="mt-3 text-3xl font-black leading-tight text-slate-950 md:text-4xl">{template.name}</h3>
                              </div>
                              <p className="shrink-0 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">{formatPrice(template)}</p>
                            </div>

                            {template.description && (
                              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">{template.description}</p>
                            )}

                            {features.length > 0 && (
                              <div className="mt-6 flex flex-wrap gap-2">
                                {features.slice(0, 5).map((feature) => (
                                  <span key={feature} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                              <Link href={`/templates/${template.id}/preview`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-4 text-sm font-black text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950">
                                {hasLivePreview(template.preview_url) ? "Voir l’aperçu" : "Voir le modèle"}
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                              <Link href={`/commande?templateId=${template.id}`} className="inline-flex flex-1 items-center justify-center rounded-full bg-[oklch(56%_0.22_29)] px-5 py-4 text-sm font-black text-white transition-colors hover:bg-slate-950">
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
                <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Aucun modèle pour le moment</p>
                  <h3 className="mt-4 text-3xl font-black text-slate-950">FRILO peut vous orienter vers le modèle le plus proche.</h3>
                  <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500">
                    Dites-nous votre activité, nous vous indiquerons la meilleure base à adapter.
                  </p>
                  <Link href="/contact" className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[oklch(56%_0.22_29)]">
                    Demander conseil
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
