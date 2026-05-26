import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatPublicPrice } from '@/lib/publicPricing';
import { getPublicPricingServer } from '@/lib/publicPricing.server';

export async function generateMetadata(): Promise<Metadata> {
  const pricing = await getPublicPricingServer();
  const startingPriceLabel = formatPublicPrice(pricing.starting_price, pricing.currency_label);

  return {
    title: 'Mentions légales | FRILO',
    description: `Mentions légales de la plateforme FRILO et références publiques, avec une offre visible à partir de ${startingPriceLabel}.`,
  };
}

export default async function MentionsLegalesPage() {
  const pricing = await getPublicPricingServer();
  const startingPriceLabel = formatPublicPrice(pricing.starting_price, pricing.currency_label);
  const standardPriceLabel = formatPublicPrice(pricing.standard.price, pricing.currency_label);
  const premiumPriceLabel = formatPublicPrice(pricing.premium.price, pricing.currency_label);

  const sections = [
    {
      title: 'Éditeur du site',
      content: [
        'Site édité par FRILO, service de création de sites vitrines à destination des entrepreneurs et petites entreprises.',
        'Siège opérationnel: Cotonou, République du Bénin.',
        'RCCM, IFU et forme juridique: à compléter avant publication définitive.',
        'Adresse complète: à compléter dans les documents contractuels et factures.',
        'Contact: contact@frilo.com.',
      ],
    },
    {
      title: 'Directeur de publication',
      content: [
        'Le directeur de publication est le représentant légal de FRILO.',
        'Son identité complète doit être confirmée dans la version définitive des mentions légales.',
      ],
    },
    {
      title: 'Hébergement',
      content: [
        'La plateforme est hébergée sur une infrastructure cloud sécurisée exploitée pour le compte de FRILO.',
        'Le nom de l’hébergeur, son adresse, son pays d’établissement et son contact technique doivent être complétés avant publication.',
        'FRILO maintient des mesures raisonnables pour assurer la disponibilité, la sécurité et la maintenance du service.',
      ],
    },
    {
      title: 'Données personnelles et APDP',
      content: [
        'Les traitements de données personnelles sont soumis à la loi n° 2017-20 du 20 avril 2018 portant Code du numérique en République du Bénin, notamment les dispositions relatives à la protection des données personnelles et de la vie privée.',
        'Les données collectées via FRILO servent à répondre aux demandes de contact, créer un compte client, traiter les commandes, gérer le paiement, suivre la livraison et assurer le support.',
        'Statut APDP: le numéro de récépissé ou la preuve de formalité auprès de l’Autorité de Protection des Données Personnelles doit être complété dès la mise en conformité finalisée.',
      ],
    },
    {
      title: 'Droits des utilisateurs',
      content: [
        'Conformément au Code du numérique béninois, l’utilisateur peut demander l’accès, la rectification, l’opposition, l’interrogation ou l’effacement des données personnelles le concernant.',
        'La demande peut être adressée à FRILO par le formulaire de contact ou par e-mail à contact@frilo.com.',
        'L’utilisateur peut également introduire une réclamation auprès de l’Autorité de Protection des Données Personnelles lorsque le traitement de ses données lui paraît contraire à la loi applicable.',
      ],
    },
    {
      title: 'Cookies et mesure d’audience',
      content: [
        'FRILO peut utiliser des cookies ou traceurs nécessaires au fonctionnement du site, à la sécurité, à la mesure d’audience ou à l’amélioration de l’expérience utilisateur.',
        'Les modalités de consentement, de refus ou de retrait doivent être précisées dans la politique de confidentialité lorsque des cookies non essentiels sont activés.',
      ],
    },
    {
      title: 'Propriété intellectuelle',
      content: [
        'Les contenus présents sur la plateforme FRILO (textes, visuels, structure, composants et éléments de marque) sont protégés.',
        'Toute reproduction, modification, adaptation, représentation ou publication non autorisée de tout ou partie du site est interdite.',
      ],
    },
    {
      title: 'Responsabilité et accès au service',
      content: [
        'FRILO met en œuvre des moyens raisonnables pour assurer un accès fiable au site et à ses services.',
        'Des interruptions peuvent toutefois intervenir pour maintenance, mise à jour, incident technique ou force majeure.',
        'Les informations publiées sur le site sont fournies à titre indicatif. Les conditions contractuelles applicables à une commande sont celles validées dans le tunnel de commande et les CGU / CGV.',
      ],
    },
    {
      title: 'Liens externes',
      content: [
        'Le site peut contenir des liens vers des ressources ou services tiers.',
        'FRILO ne contrôle pas ces sites tiers et ne peut être tenu responsable de leur contenu, de leur disponibilité ou de leurs pratiques en matière de données personnelles.',
      ],
    },
    {
      title: 'Références tarifaires publiques',
      content: [
        `Au moment de publication de cette page, la tarification marketing visible sur FRILO présente une offre ${pricing.standard.name} à ${standardPriceLabel} et une offre ${pricing.premium.name} à ${premiumPriceLabel}.`,
        "Les conditions exactes applicables à une commande restent celles affichées dans le tunnel d'achat et rappelées dans les CGU / CGV.",
      ],
    },
    {
      title: 'Droit applicable et litiges',
      content: [
        'Les présentes mentions légales sont soumises au droit applicable en République du Bénin.',
        'Tout différend relatif à l’utilisation du site ou à l’interprétation des présentes mentions est soumis aux juridictions compétentes, sous réserve des règles impératives applicables.',
        'La langue de référence est le français.',
      ],
    },
    {
      title: 'Mise à jour',
      content: [
        'FRILO peut modifier les présentes mentions légales afin de tenir compte des évolutions juridiques, techniques ou opérationnelles de la plateforme.',
        'La date de mise à jour doit être indiquée sur cette page lorsque la version définitive est publiée.',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[oklch(7%_0.006_29)] px-5 pb-12 pt-32 text-white md:pb-14 md:pt-36">
        <div className="mx-auto grid max-w-7xl gap-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:px-8">
          <div>
            <p className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Informations légales</p>
            <h1 className="max-w-3xl text-4xl font-black leading-[0.98] md:text-5xl lg:text-6xl">
              Mentions légales.
            </h1>
          </div>
          <p className="max-w-xl text-base leading-7 text-white/65 md:text-lg">
            Informations d’identification, données personnelles, cookies, propriété intellectuelle et droit applicable en République du Bénin.
          </p>
        </div>
      </div>

      <div className="px-5 py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 sm:px-6 lg:grid-cols-[0.32fr_0.68fr] lg:gap-10 lg:px-8">
          <aside className="h-fit space-y-4 lg:sticky lg:top-28">
            <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50 p-5">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Document</p>
              <div className="space-y-3 text-sm leading-6 text-slate-600">
                <p><span className="font-black text-slate-950">Version :</span> V1 opérationnelle</p>
                <p><span className="font-black text-slate-950">Mise à jour :</span> 26 mai 2026</p>
                <p><span className="font-black text-slate-950">Droit :</span> République du Bénin</p>
                <p><span className="font-black text-slate-950">Offre publique :</span> {startingPriceLabel}</p>
                <p><span className="font-black text-slate-950">APDP :</span> récépissé à compléter</p>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-slate-100 bg-white p-5">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Liens utiles</p>
              <div className="space-y-3 text-sm">
                <Link href="/cgu" className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 font-black text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950">
                  CGU / CGV
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
                Les présentes mentions légales peuvent être mises à jour pour tenir compte des évolutions juridiques, techniques ou opérationnelles du site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
