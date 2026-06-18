"use client"

import Link from 'next/link';
import {
  BarChart,
  Globe,
  Megaphone,
  Palette,
  PenTool,
  Search,
  Share2,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import {
  PublicBenefitStrip,
  PublicFinalCta,
  PublicHero,
  PublicPageShell,
  PublicSplitSection,
} from '@/components/public/PublicPageShell';
import { PUBLIC_CARD_TITLE_CLASS } from '@/components/public/publicPageCopy';
import { cn } from '@/lib/utils';

type ExpertiseGroup = {
  title: string;
  description: string;
  services: Array<{
    title: string;
    description: string;
    icon: LucideIcon;
  }>;
};

const EXPERTISE_GROUPS: ExpertiseGroup[] = [
  {
    title: 'Attirer des visiteurs',
    description: 'Actions utiles quand votre site est prêt mais que vous voulez plus de demandes.',
    services: [
      {
        title: 'Publicité Google Ads',
        description: 'Des campagnes ciblées pour apparaître au moment où vos clients recherchent votre service.',
        icon: Search,
      },
      {
        title: 'Publicité Social Ads',
        description: 'Des annonces sur les réseaux sociaux pour faire connaître une offre, un service ou une nouveauté.',
        icon: Share2,
      },
      {
        title: 'Référencement naturel',
        description: 'Un travail progressif sur les contenus et les pages pour améliorer votre visibilité durablement.',
        icon: Globe,
      },
    ],
  },
  {
    title: 'Clarifier votre image',
    description: 'Actions utiles quand votre activité est bonne mais que votre présentation doit inspirer plus confiance.',
    services: [
      {
        title: 'Identité visuelle',
        description: 'Logo, couleurs, supports simples et repères visuels pour rendre votre marque plus professionnelle.',
        icon: Palette,
      },
      {
        title: 'Rédaction web',
        description: 'Des textes plus clairs pour expliquer vos services, vos avantages et les prochaines étapes.',
        icon: PenTool,
      },
      {
        title: 'Stratégie marketing',
        description: 'Un plan d’action priorisé pour savoir quoi améliorer avant de dépenser davantage.',
        icon: BarChart,
      },
    ],
  },
  {
    title: 'Faire vivre votre site',
    description: 'Actions utiles après la livraison pour garder un espace fiable, à jour et crédible.',
    services: [
      {
        title: 'Réseaux sociaux',
        description: 'Animation de vos pages avec des contenus simples, réguliers et alignés à votre activité.',
        icon: Megaphone,
      },
      {
        title: 'Maintenance et sécurité',
        description: 'Suivi technique, sauvegardes et corrections pour garder votre site propre après sa mise en ligne.',
        icon: ShieldCheck,
      },
    ],
  },
];

export default function ExpertisesPage() {
  return (
    <PublicPageShell>
      <PublicHero
        eyebrow="Expertises"
        title="Des services pour faire travailler votre site après sa mise en ligne."
        description="FRILO peut aussi vous aider à attirer, rassurer et convertir vos clients avec des actions digitales ciblées."
        primaryAction={{ label: 'Parler à un expert', href: '/contact?subject=Expertises%20FRILO' }}
        secondaryAction={{ label: 'Voir les modèles', href: '/templates' }}
        aside={(
          <div className="border-y border-black bg-white p-5">
            <p className="text-lg font-black leading-tight">On part de votre besoin réel.</p>
            <p className="mt-3 text-sm leading-6 text-black/62">
              Pas besoin de tout faire en même temps. On priorise ce qui peut aider votre activité maintenant.
            </p>
          </div>
        )}
      />

      <PublicBenefitStrip
        items={[
          { title: 'Attirer', description: 'Faire venir les bons visiteurs vers votre site.' },
          { title: 'Rassurer', description: 'Rendre votre image claire, crédible et cohérente.' },
          { title: 'Suivre', description: 'Garder un site utile après sa livraison.' },
        ]}
      />

      {EXPERTISE_GROUPS.map((group, groupIndex) => (
        <PublicSplitSection
          key={group.title}
          eyebrow={`Besoin ${groupIndex + 1}`}
          title={group.title}
          description={group.description}
          reverse={groupIndex % 2 === 1}
          className={groupIndex % 2 === 0 ? 'bg-white' : undefined}
        >
          <div className="grid border-t border-black bg-white">
            {group.services.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  key={service.title}
                  href={`/contact?subject=${encodeURIComponent(service.title)}`}
                  className="group grid gap-4 border-b border-black p-5 transition-colors hover:bg-black hover:text-white md:grid-cols-[3rem_1fr]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition-colors group-hover:bg-[#e60000]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className={cn('text-xl font-black text-black transition-colors group-hover:text-white', PUBLIC_CARD_TITLE_CLASS)}>
                      {service.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-black/62 transition-colors group-hover:text-white/66">
                      {service.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </PublicSplitSection>
      ))}

      <PublicFinalCta
        title="Vous ne savez pas par où commencer ?"
        description="Décrivez votre activité et votre objectif. FRILO vous proposera l’action la plus utile avant d’empiler les services."
        href="/contact?subject=Expertises%20FRILO"
        label="Demander un conseil"
      />
    </PublicPageShell>
  );
}
