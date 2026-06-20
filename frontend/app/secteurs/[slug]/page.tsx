"use client"

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import {
  PublicEmptyState,
  PublicPageShell,
} from '@/components/public/PublicPageShell';
import { PUBLIC_CARD_TITLE_CLASS } from '@/components/public/publicPageCopy';
import { businessService, Template, Sector } from '@/services/business.service';
import { cn } from '@/lib/utils';
import { hasLivePreview, parsePreviewGallery } from '@/lib/templatePreview';

type SectorGuidance = {
  promise: string;
  proof: string;
  clientQuestions: string[];
  clientAnswers: string[];
  siteJobs: string[];
};

const TEMPLATES_PER_PAGE = 12;

const SECTOR_IMAGES: Record<string, string> = {
  restaurants: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
  btp: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80',
  sante: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80',
  avocats: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1600&q=80',
  coaching: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=80',
  immobilier: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80',
  accompagnement: '/image/client-satisfait-frilo.jpg',
};

const SECTOR_GUIDANCE: Record<string, SectorGuidance> = {
  avocats: {
    promise: "Votre cabinet doit inspirer confiance avant le premier appel.",
    proof: "Un visiteur veut comprendre votre domaine, votre sérieux et comment vous contacter sans hésiter.",
    clientQuestions: ["Puis-je leur confier mon dossier ?", "Ont-ils l’air sérieux ?", "Comment prendre contact ?"],
    clientAnswers: ["Les domaines d’intervention sont nommés clairement.", "Le cabinet présente une image sobre, structurée et professionnelle.", "Le téléphone, le formulaire ou WhatsApp restent faciles à trouver."],
    siteJobs: ["Présenter les domaines d’intervention", "Rassurer avec une image sobre", "Rendre le contact immédiat"],
  },
  btp: {
    promise: "Vos réalisations doivent parler avant le devis.",
    proof: "Le client cherche des preuves visibles : chantiers, zones d’intervention, types de travaux et contact rapide.",
    clientQuestions: ["Ont-ils déjà fait ce type de chantier ?", "Sont-ils fiables ?", "Comment demander un devis ?"],
    clientAnswers: ["Les réalisations montrent le niveau de finition attendu.", "Les services, zones et preuves de sérieux sont faciles à parcourir.", "La demande de devis est visible au bon moment."],
    siteJobs: ["Montrer les réalisations", "Clarifier les services", "Faciliter la demande de devis"],
  },
  coaching: {
    promise: "Votre expertise doit paraître claire, utile et crédible.",
    proof: "Le visiteur veut savoir ce que vous pouvez résoudre pour lui, comment vous travaillez et pourquoi vous écouter.",
    clientQuestions: ["Est-ce adapté à mon besoin ?", "Quelle est leur méthode ?", "Comment démarrer ?"],
    clientAnswers: ["Les offres expliquent les problèmes traités et les résultats attendus.", "La méthode est présentée sans vocabulaire compliqué.", "Le premier contact ou la réservation est guidé simplement."],
    siteJobs: ["Expliquer l’offre simplement", "Présenter les résultats attendus", "Créer un chemin de prise de contact"],
  },
  immobilier: {
    promise: "Vos biens doivent être faciles à regarder et faciles à demander.",
    proof: "Un prospect compare vite. Il doit voir les biens, comprendre les critères et savoir comment visiter.",
    clientQuestions: ["Quels biens sont disponibles ?", "Puis-je me projeter ?", "Comment organiser une visite ?"],
    clientAnswers: ["Les biens importants sont mis en avant avec les informations utiles.", "Les photos, critères et localisations aident à se projeter.", "Le contact pour une visite reste direct et visible."],
    siteJobs: ["Mettre les biens en valeur", "Rendre les critères lisibles", "Déclencher une demande de visite"],
  },
  restaurants: {
    promise: "Votre table doit donner envie avant même la réservation.",
    proof: "Le client veut voir l’ambiance, comprendre le menu, vérifier les horaires et passer à l’action vite.",
    clientQuestions: ["Qu’est-ce qu’on mange ?", "Est-ce ouvert ?", "Comment réserver ou commander ?"],
    clientAnswers: ["Le menu, les spécialités et l’ambiance sont visibles rapidement.", "Les horaires, l’adresse et les informations pratiques sont faciles à vérifier.", "La réservation ou la commande apparaît comme une action évidente."],
    siteJobs: ["Montrer le menu et l’ambiance", "Afficher les informations pratiques", "Accélérer la réservation"],
  },
  sante: {
    promise: "Votre présence en ligne doit rassurer sans compliquer le rendez-vous.",
    proof: "Le patient ou client cherche un cadre sérieux, des services compréhensibles et un accès simple au contact.",
    clientQuestions: ["Puis-je faire confiance ?", "Quels soins sont proposés ?", "Comment prendre rendez-vous ?"],
    clientAnswers: ["La présentation donne une impression professionnelle et rassurante.", "Les soins, services ou accompagnements sont expliqués avec des mots simples.", "Le bouton de contact ou de rendez-vous reste visible sans chercher."],
    siteJobs: ["Clarifier les services", "Installer une image professionnelle", "Simplifier la prise de rendez-vous"],
  },
};

const DEFAULT_GUIDANCE: SectorGuidance = {
  promise: "Votre site doit rendre votre activité évidente dès les premières secondes.",
  proof: "Le visiteur veut comprendre ce que vous faites, pourquoi vous choisir et comment vous contacter.",
  clientQuestions: ["Est-ce le bon prestataire ?", "Que proposent-ils exactement ?", "Comment les joindre ?"],
  clientAnswers: ["La page présente votre activité avec des mots simples.", "Les services principaux sont visibles et bien organisés.", "Le contact ou la demande de devis reste accessible."],
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

function getSectorImage(sector: Sector): string {
  return SECTOR_IMAGES[sector.slug] || '/image/client-satisfait-frilo.jpg';
}

function getSectorTitle(sector: Sector): string {
  if (sector.slug === 'sante') {
    return 'Présentez vos services de santé avec un site clair et rassurant.';
  }

  if (sector.slug === 'restaurants') {
    return 'Donnez envie de réserver avant même le premier appel.';
  }

  if (sector.slug === 'btp') {
    return 'Montrez vos réalisations et facilitez les demandes de devis.';
  }

  if (sector.slug === 'avocats') {
    return 'Installez la confiance avant le premier échange.';
  }

  if (sector.slug === 'coaching') {
    return 'Expliquez votre accompagnement sans compliquer la décision.';
  }

  if (sector.slug === 'immobilier') {
    return 'Présentez vos biens et déclenchez des demandes qualifiées.';
  }

  return `Présentez votre activité ${sector.name.toLowerCase()} avec une base adaptée.`;
}

function SectorLoading() {
  return (
    <div className="min-h-screen bg-white px-5 py-28">
      <div className="mx-auto max-w-[1280px]">
        <div className="mx-auto h-5 w-36 rounded-full bg-slate-200" />
        <div className="mx-auto mt-8 h-24 max-w-3xl bg-slate-100" />
        <div className="mt-12 h-[420px] bg-slate-100" />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="h-44 bg-slate-100" />
          <div className="h-44 bg-slate-100" />
          <div className="h-44 bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export default function SectorPage() {
  const { slug } = useParams() as { slug: string };
  const [sector, setSector] = useState<Sector | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatePage, setTemplatePage] = useState(1);
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

  useEffect(() => {
    setTemplatePage(1);
  }, [slug, templates.length]);

  const guidance = SECTOR_GUIDANCE[slug] || DEFAULT_GUIDANCE;
  const lowestPrice = useMemo(() => {
    if (templates.length === 0) {
      return null;
    }

    return Math.min(...templates.map(getTemplatePrice));
  }, [templates]);
  const totalTemplatePages = Math.max(1, Math.ceil(templates.length / TEMPLATES_PER_PAGE));
  const visibleTemplates = useMemo(() => {
    const start = (templatePage - 1) * TEMPLATES_PER_PAGE;
    return templates.slice(start, start + TEMPLATES_PER_PAGE);
  }, [templatePage, templates]);

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
      <section className="bg-white px-5 pb-12 pt-20 md:px-8 md:pb-16 md:pt-28">
        <div className="mx-auto max-w-[1280px] text-center">
          <Link href="/secteurs" className="inline-flex items-center gap-2 text-sm font-bold text-black/58 transition-colors hover:text-black">
            <ArrowLeft className="h-4 w-4" />
            Tous les secteurs
          </Link>
          <p className="mt-10 text-base font-black text-[#2563eb]">{sector.name}</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-balance text-4xl font-black leading-[1.02] text-black md:text-[3.6rem] lg:text-[4.25rem]">
            {getSectorTitle(sector)}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-pretty text-lg leading-8 text-slate-700 md:text-xl">
            {sector.description || guidance.promise} FRILO part d’un modèle proche, remplace les exemples par vos contenus et prépare le rendu final.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="#modeles" className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-7 py-4 text-sm font-black text-white transition-colors hover:bg-[#2563eb]">
              Voir les modèles
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact?subject=Choix%20du%20secteur" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-7 py-4 text-sm font-black text-black transition-colors hover:border-black">
              Demander une orientation
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 md:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div
            className="relative min-h-[360px] overflow-hidden bg-slate-200 md:min-h-[520px]"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0.42)), url(${getSectorImage(sector)})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          >
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 text-white md:flex-row md:items-end md:justify-between md:p-9">
              <div>
                <p className="text-sm font-black">{sector.name}</p>
                <p className="mt-2 max-w-xl text-base leading-7 text-white/82">{guidance.promise}</p>
              </div>
              {lowestPrice !== null && (
                <div className="inline-flex w-fit items-center rounded-full bg-white px-5 py-3 text-sm font-black text-black">
                  Dès {lowestPrice.toLocaleString('fr-FR')} FCFA
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1280px] border-y border-black py-10 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1fr]">
            <div>
              <h2 className="max-w-2xl text-balance text-4xl font-black leading-none text-black md:text-6xl">
                Ce que vos clients doivent comprendre vite.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">{guidance.proof}</p>
            </div>

            <div className="divide-y divide-slate-200 border-t border-slate-200 lg:border-t-0">
              {guidance.clientQuestions.map((question, index) => (
                <div key={question} className="grid gap-4 py-6 md:grid-cols-[72px_1fr] md:py-7">
                  <p className="font-serif text-4xl leading-none text-slate-300">{index + 1}</p>
                  <div>
                    <p className="text-xl font-black leading-tight text-black md:text-2xl">{question}</p>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">
                      {guidance.clientAnswers[index] || 'Le site apporte une réponse claire, visible et utile avant le contact.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-16 text-white md:px-8 md:py-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-10 border-y border-white/24 py-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
            <div>
              <h2 className="max-w-2xl text-balance text-4xl font-black leading-none md:text-6xl">
                Le modèle sert de base. Le rendu final parle de vous.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
                Notre équipe transforme une base métier en page claire : textes, ordre des informations, preuves et points de contact.
              </p>
            </div>

            <div className="divide-y divide-white/16 border-t border-white/16 lg:border-t-0">
              {guidance.siteJobs.map((job, index) => (
                <div key={job} className="grid gap-4 py-6 md:grid-cols-[96px_1fr] md:py-7">
                  <p className="font-serif text-5xl leading-none text-white/26">{String(index + 1).padStart(2, '0')}</p>
                  <div>
                    <p className="text-2xl font-black leading-tight text-white">{job}</p>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-white/62">
                      {guidance.clientAnswers[index] || 'Le contenu est ajusté pour rendre votre activité simple à comprendre avant le premier contact.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="modeles" className="bg-[#f4f4f4] px-5 py-12 md:px-8 md:py-14">
        <div className="mx-auto w-full">
          <div className="mb-7 grid gap-5 border-b border-black pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-sm font-black text-[#2563eb]">{templates.length} modèle{templates.length > 1 ? 's' : ''} disponible{templates.length > 1 ? 's' : ''}</p>
              <h2 className="mt-2 max-w-3xl text-balance text-3xl font-black leading-tight text-black md:text-4xl">
                Modèles adaptés à {sector.name.toLowerCase()}.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">
                Comparez rapidement la base, les fonctions incluses et l’action suivante.
              </p>
            </div>
            <Link href="/templates" className="inline-flex w-fit items-center justify-center rounded-full border border-black px-5 py-3 text-sm font-black text-black transition-colors hover:bg-black hover:text-white">
              Tout le catalogue
            </Link>
          </div>

          {templates.length > 0 ? (
            <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleTemplates.map((template) => {
                const templateImage = getTemplateImage(template) || getSectorImage(sector);

                return (
                  <article key={template.id} className="flex min-h-full flex-col overflow-hidden border border-slate-200 bg-white">
                    <Link
                      href={`/templates/${template.id}`}
                      className="group relative block aspect-[1.38] overflow-hidden bg-slate-100"
                      style={{
                        backgroundImage: `url(${templateImage})`,
                        backgroundPosition: 'center top',
                        backgroundSize: 'cover',
                      }}
                    >
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                      <div className="absolute left-4 top-4 h-1.5 w-16 bg-black" />
                      <div className="absolute right-4 top-4 h-1.5 w-10 bg-[#2563eb]" />
                    </Link>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-black text-[#2563eb]">{sector.name}</p>
                          <h3 className={cn('mt-2 text-2xl font-black leading-tight text-black', PUBLIC_CARD_TITLE_CLASS)}>{template.name}</h3>
                        </div>
                        <p className="w-fit shrink-0 rounded-full bg-black px-3 py-2 text-xs font-black text-white">{formatPrice(template)}</p>
                      </div>

                      {template.description && (
                        <p className="mt-4 line-clamp-2 text-base leading-7 text-slate-700">{template.description}</p>
                      )}

                      <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row md:flex-col lg:flex-row">
                        <Link href={`/templates/${template.id}/preview`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-4 py-3.5 text-sm font-black text-white transition-colors hover:bg-[#2563eb]">
                          {hasLivePreview(template.preview_url) ? "Voir l’aperçu" : "Voir le modèle"}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href={`/commande?templateId=${template.id}`} className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-4 py-3.5 text-sm font-black text-black transition-colors hover:border-black">
                          Commander
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {totalTemplatePages > 1 && (
              <div className="mt-8 flex flex-col gap-4 border-t border-slate-300 pt-6 md:flex-row md:items-center md:justify-between">
                <p className="text-sm font-bold text-slate-700">
                  Page {templatePage} sur {totalTemplatePages} · {templates.length} modèles
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTemplatePage((page) => Math.max(1, page - 1))}
                    disabled={templatePage === 1}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-black text-black transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Précédent
                  </button>
                  {Array.from({ length: totalTemplatePages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setTemplatePage(page)}
                      className={cn(
                        'h-10 w-10 rounded-full border text-sm font-black transition-colors',
                        page === templatePage ? 'border-black bg-black text-white' : 'border-slate-300 text-black hover:border-black',
                      )}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTemplatePage((page) => Math.min(totalTemplatePages, page + 1))}
                    disabled={templatePage === totalTemplatePages}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-black text-black transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
            </>
          ) : (
            <PublicEmptyState
              title="FRILO peut vous orienter vers le modèle le plus proche."
              description="Dites-nous votre activité, nous vous indiquerons la meilleure base à adapter."
              action={{ label: 'Demander conseil', href: '/contact?subject=Choix%20du%20secteur' }}
            />
          )}
        </div>
      </section>

      <section className="bg-black px-5 py-14 text-white md:px-8 md:py-16">
        <div className="mx-auto grid max-w-[1280px] gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="max-w-3xl text-balance text-4xl font-black leading-none md:text-5xl">
              Vous ne savez pas quelle base choisir ?
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
              Décrivez votre activité. FRILO vous oriente vers le modèle le plus proche avant la commande.
            </p>
          </div>
          <Link href="/contact?subject=Choix%20du%20secteur" className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-black text-black transition-colors hover:bg-[#dbeafe]">
            <MessageCircle className="h-4 w-4" />
            Demander une orientation
          </Link>
        </div>
      </section>

    </PublicPageShell>
  );
}
