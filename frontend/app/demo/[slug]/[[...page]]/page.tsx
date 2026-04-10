"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Check, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

type DemoTheme = {
  title: string;
  subtitle: string;
  accent: string;
  light: string;
};

type DemoFeature = {
  title: string;
  description: string;
};

type DemoPlan = {
  name: string;
  price: string;
  points: string[];
};

type DemoPreset = {
  theme: DemoTheme;
  home: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    highlights: DemoFeature[];
  };
  services: {
    title: string;
    items: DemoFeature[];
  };
  pricing: {
    title: string;
    plans: DemoPlan[];
  };
  contact: {
    title: string;
    intro: string;
  };
};

const PRESETS: Record<string, DemoPreset> = {
  'le-gourmet': {
    theme: {
      title: 'Le Gourmet',
      subtitle: 'Restaurant & expériences culinaires',
      accent: 'bg-orange-500',
      light: 'bg-orange-50',
    },
    home: {
      eyebrow: 'Expérience culinaire',
      title: 'Un site qui ouvre l’appétit avant même la première visite.',
      description: 'Menus, galeries et réservation sont pensés pour transformer les visiteurs en clients fidèles.',
      primaryCta: 'Réserver une table',
      secondaryCta: 'Découvrir la carte',
      highlights: [
        { title: 'Menu digital', description: 'Carte claire, mise à jour en temps réel et lisible sur mobile.' },
        { title: 'Réservations fluides', description: 'Formulaire rapide pour capter les réservations sans friction.' },
        { title: 'Photos immersives', description: 'Galeries optimisées pour valoriser plats et ambiance.' },
      ],
    },
    services: {
      title: 'Nos services',
      items: [
        { title: 'Branding visuel', description: 'Palette, typographie et visuels alignés avec votre univers culinaire.' },
        { title: 'Pages menu & évènements', description: 'Menus du jour, offres spéciales et évènements saisonniers.' },
        { title: 'Référencement local', description: 'Optimisation SEO locale pour être trouvé autour de votre zone.' },
        { title: 'Maintenance éditoriale', description: 'Mises à jour de contenus et d’offres sans interruption.' },
      ],
    },
    pricing: {
      title: 'Tarifs',
      plans: [
        { name: 'Starter', price: '50 000 FCFA', points: ['Landing page', 'Contact', 'Responsive'] },
        { name: 'Business', price: '95 000 FCFA', points: ['Menu complet', 'Galerie', 'Réservation'] },
        { name: 'Premium', price: '150 000 FCFA', points: ['Multi-pages', 'Blog', 'Support prioritaire'] },
      ],
    },
    contact: {
      title: 'Contact',
      intro: 'Parlez-nous de votre concept, de votre carte et de vos objectifs de réservation.',
    },
  },
  batipro: {
    theme: {
      title: 'BatiPro',
      subtitle: 'Solutions BTP et rénovation',
      accent: 'bg-slate-700',
      light: 'bg-slate-100',
    },
    home: {
      eyebrow: 'Crédibilité chantier',
      title: 'Montrez vos réalisations avec un site solide et rassurant.',
      description: 'Portfolio de chantiers, zones d’intervention et formulaires de devis convertissent mieux.',
      primaryCta: 'Demander un devis',
      secondaryCta: 'Voir nos réalisations',
      highlights: [
        { title: 'Portfolio avant/après', description: 'Mettez en avant l’impact concret de vos interventions.' },
        { title: 'Formulaire devis', description: 'Captez des prospects qualifiés directement depuis le site.' },
        { title: 'Preuves sociales', description: 'Avis clients et références projets pour rassurer rapidement.' },
      ],
    },
    services: {
      title: 'Nos services',
      items: [
        { title: 'Conception de pages métier', description: 'Pages dédiées maçonnerie, peinture, plomberie, etc.' },
        { title: 'Tunnel devis rapide', description: 'Collecte structurée des besoins techniques des prospects.' },
        { title: 'SEO local BTP', description: 'Positionnement géolocalisé sur les requêtes à fort intent.' },
        { title: 'Suivi mensuel', description: 'Améliorations continues sur contenu et conversion.' },
      ],
    },
    pricing: {
      title: 'Tarifs',
      plans: [
        { name: 'Starter', price: '50 000 FCFA', points: ['Site vitrine', 'Formulaire', 'Responsive'] },
        { name: 'Business', price: '95 000 FCFA', points: ['Portfolio', 'Pages services', 'Lead capture'] },
        { name: 'Premium', price: '150 000 FCFA', points: ['SEO avancé', 'Multi-zones', 'Support renforcé'] },
      ],
    },
    contact: {
      title: 'Contact',
      intro: 'Décrivez vos spécialités et zones d’intervention pour une démo orientée devis.',
    },
  },
  zenclick: {
    theme: {
      title: 'ZenClick',
      subtitle: 'Bien-être et santé au quotidien',
      accent: 'bg-emerald-600',
      light: 'bg-emerald-50',
    },
    home: {
      eyebrow: 'Confiance & sérénité',
      title: 'Un parcours en ligne apaisant qui facilite la prise de rendez-vous.',
      description: 'Structure claire, contenu rassurant et CTA adaptés aux praticiens santé & bien-être.',
      primaryCta: 'Prendre rendez-vous',
      secondaryCta: 'Voir les prestations',
      highlights: [
        { title: 'Présentation praticiens', description: 'Valorisez expertise, parcours et spécialités.' },
        { title: 'Prise de rendez-vous', description: 'Formulaire rapide pensé pour réduire les abandons.' },
        { title: 'Contenu conseil', description: 'Articles pédagogiques pour construire la confiance.' },
      ],
    },
    services: {
      title: 'Nos services',
      items: [
        { title: 'Site thérapeute', description: 'Mise en avant des approches et accompagnements proposés.' },
        { title: 'Pages programmes', description: 'Offres packagées et parcours de suivi clairs.' },
        { title: 'SEO thématique', description: 'Visibilité renforcée sur les besoins bien-être locaux.' },
        { title: 'Optimisation conversion', description: 'Tests de messages pour améliorer la prise de contact.' },
      ],
    },
    pricing: {
      title: 'Tarifs',
      plans: [
        { name: 'Starter', price: '50 000 FCFA', points: ['Présentation', 'Contact', 'Responsive'] },
        { name: 'Business', price: '95 000 FCFA', points: ['Programmes', 'FAQ', 'Rendez-vous'] },
        { name: 'Premium', price: '150 000 FCFA', points: ['Blog', 'SEO', 'Support prioritaire'] },
      ],
    },
    contact: {
      title: 'Contact',
      intro: 'Partagez vos pratiques et objectifs pour une démo adaptée à votre audience.',
    },
  },
  legalexpert: {
    theme: {
      title: 'LegalExpert',
      subtitle: 'Cabinet de conseil juridique',
      accent: 'bg-indigo-700',
      light: 'bg-indigo-50',
    },
    home: {
      eyebrow: 'Autorité juridique',
      title: 'Affirmez votre positionnement avec une présence web sobre et crédible.',
      description: 'Pages domaines d’expertise, contenus légaux et prise de contact sécurisée.',
      primaryCta: 'Demander une consultation',
      secondaryCta: 'Voir nos expertises',
      highlights: [
        { title: 'Expertises lisibles', description: 'Structures de contenus adaptées aux services juridiques.' },
        { title: 'Image institutionnelle', description: 'Design sobre pour renforcer la confiance.' },
        { title: 'Capture de leads qualifiés', description: 'Formulaires ciblés par problématique.' },
      ],
    },
    services: {
      title: 'Nos services',
      items: [
        { title: 'Structuration contenus juridiques', description: 'Pages claires par domaine et type de clientèle.' },
        { title: 'Parcours prise de contact', description: 'Collecte des besoins avant premier rendez-vous.' },
        { title: 'Référencement cabinet', description: 'Optimisation sur mots-clés juridiques locaux.' },
        { title: 'Publication d’actualités', description: 'Mise en ligne d’articles et notes de veille.' },
      ],
    },
    pricing: {
      title: 'Tarifs',
      plans: [
        { name: 'Starter', price: '50 000 FCFA', points: ['Présentation cabinet', 'Contact', 'Responsive'] },
        { name: 'Business', price: '95 000 FCFA', points: ['Pages expertises', 'FAQ', 'Formulaires ciblés'] },
        { name: 'Premium', price: '150 000 FCFA', points: ['Blog légal', 'SEO avancé', 'Support prioritaire'] },
      ],
    },
    contact: {
      title: 'Contact',
      intro: 'Décrivez vos domaines de pratique pour une démonstration orientée acquisition.',
    },
  },
  coachvision: {
    theme: {
      title: 'CoachVision',
      subtitle: 'Coaching et accompagnement',
      accent: 'bg-fuchsia-700',
      light: 'bg-fuchsia-50',
    },
    home: {
      eyebrow: 'Conversion programme',
      title: 'Vendez vos offres d’accompagnement avec un site orienté impact.',
      description: 'Positionnement, preuves sociales, offres et CTA conçus pour transformer vos visiteurs.',
      primaryCta: 'Réserver un appel',
      secondaryCta: 'Découvrir les programmes',
      highlights: [
        { title: 'Offres packagées', description: 'Clarifiez vos programmes et leur valeur perçue.' },
        { title: 'Preuves sociales', description: 'Témoignages mis en avant aux endroits clés.' },
        { title: 'Tunnel de prise de contact', description: 'De la découverte au call stratégique.' },
      ],
    },
    services: {
      title: 'Nos services',
      items: [
        { title: 'Architecture d’offre', description: 'Présentation claire des niveaux d’accompagnement.' },
        { title: 'Pages témoignages', description: 'Mise en avant des transformations clients.' },
        { title: 'SEO expertise', description: 'Positionnement sur requêtes coaching ciblées.' },
        { title: 'Optimisation lead gen', description: 'Tests de CTA et messages orientés réservation.' },
      ],
    },
    pricing: {
      title: 'Tarifs',
      plans: [
        { name: 'Starter', price: '50 000 FCFA', points: ['Page offre', 'Contact', 'Responsive'] },
        { name: 'Business', price: '95 000 FCFA', points: ['Programmes', 'Témoignages', 'Lead capture'] },
        { name: 'Premium', price: '150 000 FCFA', points: ['Blog', 'SEO', 'Support prioritaire'] },
      ],
    },
    contact: {
      title: 'Contact',
      intro: 'Parlez-nous de vos offres pour une démo adaptée à votre positionnement coaching.',
    },
  },
  immoprestige: {
    theme: {
      title: 'ImmoPrestige',
      subtitle: 'Agence immobilière premium',
      accent: 'bg-cyan-700',
      light: 'bg-cyan-50',
    },
    home: {
      eyebrow: 'Vitrine immobilière',
      title: 'Exposez vos biens avec une expérience web premium et orientée visites.',
      description: 'Fiches biens, filtres, formulaires de visite et preuves de confiance alignés conversion.',
      primaryCta: 'Planifier une visite',
      secondaryCta: 'Voir les biens disponibles',
      highlights: [
        { title: 'Fiches biens premium', description: 'Visuels, points forts et données clés bien structurés.' },
        { title: 'Demandes de visite', description: 'Collecte rapide des demandes de prospects qualifiés.' },
        { title: 'Parcours mobile first', description: 'Recherche et prise de contact fluides sur smartphone.' },
      ],
    },
    services: {
      title: 'Nos services',
      items: [
        { title: 'Catalogue biens', description: 'Présentation claire des biens et catégories.' },
        { title: 'Landing acquisition', description: 'Pages campagnes dédiées pour les annonces premium.' },
        { title: 'SEO immobilier local', description: 'Visibilité locale sur les requêtes intentionnelles.' },
        { title: 'Pilotage leads', description: 'Organisation des demandes et priorisation commerciale.' },
      ],
    },
    pricing: {
      title: 'Tarifs',
      plans: [
        { name: 'Starter', price: '75 000 FCFA', points: ['Présentation agence', 'Contact', 'Responsive'] },
        { name: 'Business', price: '120 000 FCFA', points: ['Catalogue biens', 'Filtres', 'Demandes de visite'] },
        { name: 'Premium', price: '180 000 FCFA', points: ['SEO avancé', 'Landing ads', 'Support prioritaire'] },
      ],
    },
    contact: {
      title: 'Contact',
      intro: 'Indiquez votre portefeuille de biens pour une démo réellement immersive.',
    },
  },
};

function buildFallbackPreset(slug: string): DemoPreset {
  const cleanTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    theme: {
      title: cleanTitle,
      subtitle: 'Template de démonstration',
      accent: 'bg-zinc-800',
      light: 'bg-zinc-100',
    },
    home: {
      eyebrow: 'Page d’accueil',
      title: 'Une présence web claire, rapide et orientée conversion.',
      description: 'Ceci est une démo interactive du template. Dans FRILO, les contenus et sections sont personnalisés pour votre client.',
      primaryCta: 'Demander un devis',
      secondaryCta: 'Voir les services',
      highlights: [
        { title: 'Design premium', description: 'Un rendu professionnel adapté à votre secteur.' },
        { title: 'Mobile first', description: 'Navigation optimisée sur smartphone et tablette.' },
        { title: 'Livraison rapide', description: 'Mise en ligne accélérée avec structure prête à convertir.' },
      ],
    },
    services: {
      title: 'Nos services',
      items: [
        { title: 'Conception', description: 'Structure de pages alignée sur votre activité.' },
        { title: 'Intégration', description: 'Mise en page claire et responsive.' },
        { title: 'SEO local', description: 'Optimisation initiale pour visibilité locale.' },
        { title: 'Maintenance', description: 'Suivi et ajustements selon vos besoins.' },
      ],
    },
    pricing: {
      title: 'Tarifs',
      plans: [
        { name: 'Starter', price: '50 000 FCFA', points: ['Site vitrine', 'Responsive', 'Support'] },
        { name: 'Business', price: '95 000 FCFA', points: ['Multi-pages', 'Formulaires', 'SEO de base'] },
        { name: 'Premium', price: '150 000 FCFA', points: ['Parcours avancé', 'Optimisations', 'Support prioritaire'] },
      ],
    },
    contact: {
      title: 'Contact',
      intro: 'Démo d’interaction: formulaire et feedback immédiat pour simuler l’expérience finale.',
    },
  };
}

export default function DemoTemplatePage() {
  const params = useParams<{ slug: string; page?: string[] }>();
  const slug = params?.slug ?? '';
  const section = params?.page?.[0] ?? 'home';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  if (!slug) {
    return null;
  }

  const preset = PRESETS[slug] ?? buildFallbackPreset(slug);

  const nav = [
    { key: 'home', label: 'Accueil', href: `/demo/${slug}` },
    { key: 'services', label: 'Services', href: `/demo/${slug}/services` },
    { key: 'pricing', label: 'Tarifs', href: `/demo/${slug}/pricing` },
    { key: 'contact', label: 'Contact', href: `/demo/${slug}/contact` },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <div>
            <p className="text-lg font-black">{preset.theme.title}</p>
            <p className="text-xs text-zinc-500">{preset.theme.subtitle}</p>
          </div>

          <button
            type="button"
            className="rounded-lg border border-zinc-200 p-2 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            {nav.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'rounded-full px-4 py-2 text-xs font-semibold transition-colors',
                  section === item.key
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {mobileOpen && (
          <div className="border-t border-zinc-100 px-4 py-3 md:hidden">
            <div className="flex flex-wrap gap-2">
              {nav.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'rounded-full px-4 py-2 text-xs font-semibold transition-colors',
                    section === item.key
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {section === 'home' && (
        <main>
          <section className={cn('border-b px-4 py-20 md:px-8', preset.theme.light)}>
            <div className="mx-auto max-w-6xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{preset.home.eyebrow}</p>
              <h1 className="mb-4 max-w-2xl text-4xl font-black leading-tight md:text-6xl">
                {preset.home.title}
              </h1>
              <p className="max-w-xl text-zinc-600">
                {preset.home.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className={cn('rounded-full px-5 py-3 text-sm font-semibold text-white', preset.theme.accent)}>
                  {preset.home.primaryCta}
                </button>
                <Link href={`/demo/${slug}/services`} className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold">
                  {preset.home.secondaryCta}
                </Link>
              </div>
            </div>
          </section>

          <section className="px-4 py-16 md:px-8">
            <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
              {preset.home.highlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-zinc-100 p-6">
                  <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-zinc-500">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {section === 'services' && (
        <main className="px-4 py-14 md:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-3xl font-black">{preset.services.title}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {preset.services.items.map((item) => (
                <div key={item.title} className="rounded-2xl border border-zinc-100 p-6">
                  <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-zinc-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {section === 'pricing' && (
        <main className="px-4 py-14 md:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-3xl font-black">{preset.pricing.title}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {preset.pricing.plans.map((plan) => (
                <div key={plan.name} className="rounded-2xl border border-zinc-100 p-6">
                  <p className="text-sm font-semibold text-zinc-500">{plan.name}</p>
                  <p className="mt-2 text-2xl font-black">{plan.price}</p>
                  <ul className="mt-4 space-y-2">
                    {plan.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-sm text-zinc-600">
                        <Check className="h-4 w-4" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {section === 'contact' && (
        <main className="px-4 py-14 md:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-4 text-3xl font-black">{preset.contact.title}</h2>
            <p className="mb-8 text-zinc-600">
              {preset.contact.intro}
            </p>

            <form
              className="space-y-4 rounded-2xl border border-zinc-100 p-6"
              onSubmit={(event) => {
                event.preventDefault();
                setShowMessage(true);
              }}
            >
              <input className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm" placeholder="Nom" />
              <input className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm" placeholder="Email" />
              <textarea className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm" rows={4} placeholder="Message" />
              <button type="submit" className={cn('rounded-full px-5 py-3 text-sm font-semibold text-white', preset.theme.accent)}>
                Envoyer
              </button>
            </form>

            {showMessage && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Message envoyé (démo). Ici, on montre le comportement interaction utilisateur.
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
