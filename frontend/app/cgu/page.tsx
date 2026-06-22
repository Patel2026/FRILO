import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatPublicPrice } from '@/lib/publicPricing';
import { getPublicPricingServer } from '@/lib/publicPricing.server';

export async function generateMetadata(): Promise<Metadata> {
  const pricing = await getPublicPricingServer();
  const startingPriceLabel = formatPublicPrice(pricing.starting_price, pricing.currency_label);

  return {
    title: 'CGU / CGV',
    description: `Consultez les conditions d'utilisation et de vente FRILO, incluant la tarification publique à partir de ${startingPriceLabel}.`,
  };
}

export default async function CguPage() {
  const pricing = await getPublicPricingServer();
  const startingPriceLabel = formatPublicPrice(pricing.starting_price, pricing.currency_label);
  const standardPriceLabel = formatPublicPrice(pricing.standard.price, pricing.currency_label);
  const premiumPriceLabel = formatPublicPrice(pricing.premium.price, pricing.currency_label);

  const sections = [
    {
      title: 'Objet des conditions',
      content: [
        'Les présentes conditions générales d’utilisation et de vente encadrent l’accès à la plateforme FRILO, la consultation des modèles, la création de compte, la commande, le paiement et le suivi de livraison.',
        'FRILO propose des sites vitrines professionnels adaptés à partir de modèles, avec accompagnement jusqu’à la mise en ligne selon les informations fournies par le client.',
      ],
    },
    {
      title: 'Compte client',
      content: [
        'Certaines fonctionnalités nécessitent la création d’un compte client.',
        'Le client s’engage à fournir des informations exactes, à garder ses identifiants confidentiels et à signaler toute utilisation non autorisée de son compte.',
        'FRILO peut suspendre l’accès à un compte en cas d’usage frauduleux, d’informations manifestement fausses ou de violation des présentes conditions.',
      ],
    },
    {
      title: 'Commande',
      content: [
        'La commande est effectuée depuis le tunnel prévu à cet effet, après sélection d’un modèle et transmission des informations nécessaires.',
        'La validation de la commande implique l’acceptation des présentes CGU / CGV et du prix affiché au moment de la commande.',
        'FRILO peut demander des informations complémentaires lorsque les éléments transmis ne permettent pas de démarrer ou finaliser correctement la prestation.',
      ],
    },
    {
      title: 'Prix et tarification',
      content: [
        `Les prix sont exprimés en ${pricing.currency_label}. L’offre publique ${pricing.standard.name} est actuellement affichée à ${standardPriceLabel}, et l’offre ${pricing.premium.name} à ${premiumPriceLabel}.`,
        'Le prix applicable à une commande est celui affiché et confirmé dans le tunnel de commande au moment de sa validation.',
        "Le prix d'une commande est enregistré au moment de sa création et n’est pas modifié ensuite, sauf accord spécifique entre FRILO et le client.",
      ],
    },
    {
      title: 'Paiement',
      content: [
        'Le paiement est réalisé via FedaPay ou tout autre prestataire de paiement activé par FRILO.',
        'La prise en charge de la commande démarre après confirmation effective du paiement.',
        'En cas d’échec, d’expiration ou d’annulation du paiement, la commande peut rester en attente ou ne pas être traitée tant que le paiement n’est pas confirmé.',
      ],
    },
    {
      title: 'Délais de livraison',
      content: [
        'FRILO vise une livraison sous 48 heures ouvrées après confirmation du paiement et réception des informations nécessaires.',
        'Ce délai suppose que le client fournisse des contenus exploitables: nom de l’entreprise, activité, textes, images, coordonnées, préférences et instructions utiles.',
        'Un retard dans la transmission des informations ou des validations peut prolonger le délai de livraison.',
      ],
    },
    {
      title: 'Obligations du client',
      content: [
        'Le client garantit disposer des droits nécessaires sur les textes, images, logos, marques, informations et contenus transmis à FRILO.',
        'Le client s’engage à ne pas demander la publication de contenus illicites, trompeurs, contrefaisants, discriminatoires ou contraires aux lois applicables en République du Bénin.',
        'Le client reste responsable de l’exactitude des informations publiées sur son site.',
      ],
    },
    {
      title: 'Validation, corrections et mise en ligne',
      content: [
        'FRILO adapte le modèle choisi aux informations fournies par le client.',
        'Les corrections demandées doivent rester cohérentes avec le périmètre de l’offre commandée.',
        'La mise en ligne intervient après livraison, validation des éléments nécessaires et respect des conditions techniques ou contractuelles applicables.',
      ],
    },
    {
      title: 'Annulation et remboursement',
      content: [
        'Toute demande d’annulation doit être adressée à FRILO via le formulaire de contact.',
        'Lorsque la prestation a déjà commencé, FRILO peut refuser le remboursement total ou proposer une solution proportionnée à l’état d’avancement.',
        'Les éventuelles conditions de remboursement particulières doivent être confirmées par écrit avant ou au moment de la commande.',
      ],
    },
    {
      title: 'Support et réclamations',
      content: [
        'Les demandes de support, de correction ou de réclamation passent par le formulaire de contact ou par l’espace client lorsqu’il est disponible.',
        'Le client doit fournir les références utiles, notamment l’adresse e-mail du compte, la référence de commande et une description claire du problème.',
        'FRILO s’efforce de répondre dans des délais raisonnables pendant les jours ouvrés.',
      ],
    },
    {
      title: 'Propriété intellectuelle',
      content: [
        'Les modèles, interfaces, composants, textes génériques, méthodes, éléments graphiques et éléments de marque FRILO restent la propriété de FRILO ou de leurs titulaires respectifs.',
        'Les contenus fournis par le client restent sous sa responsabilité et, lorsqu’ils lui appartiennent, demeurent sa propriété.',
        'Sauf accord contraire, le client obtient un droit d’utilisation du site livré pour les besoins de son activité.',
      ],
    },
    {
      title: 'Données personnelles',
      content: [
        'Les traitements de données personnelles liés à l’utilisation de FRILO sont soumis à la loi n° 2017-20 du 20 avril 2018 portant Code du numérique en République du Bénin.',
        'Les informations collectées servent notamment à gérer les comptes, commandes, paiements, livraisons, demandes de contact et support.',
        'Les droits des utilisateurs et les informations relatives à l’APDP sont détaillés dans les mentions légales et la politique de confidentialité lorsqu’elle est publiée.',
      ],
    },
    {
      title: 'Responsabilité',
      content: [
        'FRILO met en œuvre des moyens raisonnables pour fournir un service fiable, sécurisé et conforme au périmètre commandé.',
        'FRILO ne peut être tenu responsable des retards ou difficultés causés par des informations incomplètes, des contenus non conformes, un prestataire tiers, un incident de paiement, une panne réseau ou un cas de force majeure.',
        'Le client reste responsable de son activité, de ses offres, de ses déclarations commerciales et des contenus publiés sur son site.',
      ],
    },
    {
      title: 'Modification des conditions',
      content: [
        'FRILO peut modifier les présentes CGU / CGV afin de tenir compte des évolutions juridiques, techniques, commerciales ou opérationnelles du service.',
        'La version applicable à une commande est celle acceptée au moment de la validation de ladite commande, sauf disposition légale contraire.',
      ],
    },
    {
      title: 'Droit applicable et litiges',
      content: [
        'Les présentes CGU / CGV sont soumises au droit applicable en République du Bénin.',
        'En cas de difficulté, les parties s’efforcent de rechercher une solution amiable avant toute action contentieuse.',
        'À défaut d’accord amiable, le litige peut être soumis aux juridictions compétentes, sous réserve des règles impératives applicables.',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[oklch(7%_0.006_29)] px-5 pb-12 pt-32 text-white md:pb-14 md:pt-36">
        <div className="mx-auto grid max-w-7xl gap-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:px-8">
          <div>
            <p className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Cadre contractuel</p>
            <h1 className="max-w-3xl text-4xl font-black leading-[0.98] md:text-5xl lg:text-6xl">
              CGU / CGV.
            </h1>
          </div>
          <p className="max-w-xl text-base leading-7 text-white/65 md:text-lg">
            Conditions d’utilisation, de commande, de paiement et de livraison applicables aux services FRILO.
          </p>
        </div>
      </div>

      <div className="px-5 py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 sm:px-6 lg:grid-cols-[0.32fr_0.68fr] lg:gap-10 lg:px-8">
          <aside className="h-fit space-y-4 lg:sticky lg:top-28">
            <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50 p-5">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Document</p>
              <div className="space-y-3 text-sm leading-6 text-slate-600">
                <p><span className="font-black text-slate-950">Version :</span> conditions publiques</p>
                <p><span className="font-black text-slate-950">Mise à jour :</span> 26 mai 2026</p>
                <p><span className="font-black text-slate-950">Droit :</span> République du Bénin</p>
                <p><span className="font-black text-slate-950">Tarif de départ :</span> {startingPriceLabel}</p>
                <p><span className="font-black text-slate-950">Paiement :</span> FedaPay</p>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-slate-100 bg-white p-5">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Liens utiles</p>
              <div className="space-y-3 text-sm">
                <Link href="/mentions-legales" className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 font-black text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950">
                  Mentions légales
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 font-black text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950">
                  Contacter FRILO
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>

          <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50">
            {sections.map((section, index) => (
              <section
                key={section.title}
                className={index === 0 ? 'p-6 md:p-8' : 'border-t border-slate-100 p-6 md:p-8'}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                    {index + 1}
                  </span>
                  <h2 className="text-xl font-black leading-tight text-slate-950">{section.title}</h2>
                </div>
                <div className="space-y-2.5 text-[15px] leading-7 text-slate-600 sm:pl-11">
                  {section.content.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </section>
            ))}

            <div className="border-t border-slate-100 bg-white px-6 py-5 md:px-8">
              <p className="text-sm leading-6 text-slate-500">
                Les présentes conditions peuvent être mises à jour pour tenir compte des évolutions juridiques, techniques, commerciales ou opérationnelles du service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
