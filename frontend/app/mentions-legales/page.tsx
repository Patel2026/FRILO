import type { Metadata } from 'next';
import Link from 'next/link';
import { formatPublicPrice } from '@/lib/publicPricing';
import { getPublicPricingServer } from '@/lib/publicPricing.server';

export async function generateMetadata(): Promise<Metadata> {
  const pricing = await getPublicPricingServer();
  const startingPriceLabel = formatPublicPrice(pricing.starting_price, pricing.currency_label);

  return {
    title: 'Mentions légales — FRILO',
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
      title: 'Editeur du site',
      content: [
        'Raison sociale: FRILO',
        'Forme juridique: societe en cours de formalisation administrative',
        "Numero d'immatriculation: communique sur devis et factures contractuelles",
        'Adresse du siege: Cotonou, Benin (adresse complete transmise dans les documents contractuels)',
        'Email: contact@frilo.com',
        'Telephone: support via formulaire de contact',
      ],
    },
    {
      title: 'Directeur de publication',
      content: [
        'Responsable legal FRILO (coordonnees disponibles sur demande contractuelle)',
      ],
    },
    {
      title: 'Hebergement',
      content: [
        'Prestataire: infrastructure cloud securisee sous contrat FRILO',
        'Adresse: localisation detaillee communiquee dans la documentation technique contractuelle',
        'Contact: support@frilo.com',
      ],
    },
    {
      title: 'Propriete intellectuelle',
      content: [
        'Les contenus presents sur la plateforme FRILO (textes, visuels, structure, composants et elements de marque) sont proteges.',
        'Toute reproduction non autorisee est interdite.',
      ],
    },
    {
      title: 'References tarifaires publiques',
      content: [
        `Au moment de publication de cette page, la tarification marketing visible sur FRILO presente une offre ${pricing.standard.name} a ${standardPriceLabel} et une offre ${pricing.premium.name} a ${premiumPriceLabel}.`,
        "Les conditions exactes applicables a une commande restent celles affichees dans le tunnel d'achat et rappelees dans les CGU / CGV.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfb] pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-10 md:mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400 mb-4">Informations legales</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black mb-4">Mentions legales</h1>
          <p className="text-base md:text-lg text-gray-500 leading-relaxed">
            Cadre d'identification de l'editeur, de l'hebergement et des droits applicables a la plateforme FRILO en version V1.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-28 h-fit space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-4">Document</p>
              <div className="space-y-3 text-sm text-gray-600">
                <p><span className="font-semibold text-black">Version:</span> V1 operationnelle</p>
                <p><span className="font-semibold text-black">Publication:</span> 10 avril 2026</p>
                <p><span className="font-semibold text-black">Portee:</span> exploitation de la plateforme FRILO</p>
                <p><span className="font-semibold text-black">Offre publique de depart:</span> {startingPriceLabel}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-4">Liens utiles</p>
              <div className="space-y-3 text-sm">
                <Link href="/cgu" className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-gray-700 hover:border-black hover:text-black transition-colors">
                  CGU / CGV
                  <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/contact" className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-gray-700 hover:border-black hover:text-black transition-colors">
                  Contacter FRILO
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </aside>

          <div className="rounded-[2rem] border border-gray-200 bg-white overflow-hidden">
            {sections.map((section, index) => (
              <section
                key={section.title}
                className={index === 0 ? 'p-7 md:p-9' : 'border-t border-gray-100 p-7 md:p-9'}
              >
                <h2 className="text-xl font-black tracking-tight text-black mb-4">{section.title}</h2>
                <div className="space-y-2.5 text-[15px] leading-7 text-gray-700">
                  {section.content.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </section>
            ))}

            <div className="border-t border-gray-100 bg-[#faf9f7] px-7 py-6 md:px-9">
              <p className="text-sm text-gray-500">
                Ce document est en vigueur pour l'exploitation de la plateforme FRILO en version V1.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
