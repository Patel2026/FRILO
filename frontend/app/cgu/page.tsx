import type { Metadata } from 'next';
import Link from 'next/link';
import { formatPublicPrice } from '@/lib/publicPricing';
import { getPublicPricingServer } from '@/lib/publicPricing.server';

export async function generateMetadata(): Promise<Metadata> {
  const pricing = await getPublicPricingServer();
  const startingPriceLabel = formatPublicPrice(pricing.starting_price, pricing.currency_label);

  return {
    title: 'CGU / CGV — FRILO',
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
      title: 'Objet',
      content: [
        'FRILO propose la commande de sites vitrines personnalises avec livraison operationnelle sous 48h ouvrees, selon le perimetre V1 annonce.',
      ],
    },
    {
      title: 'Parcours de commande',
      content: [
        'La commande est effectuee via le tunnel FRILO, avec creation d’un compte client et validation finale du panier.',
        'Le paiement est traite via FedaPay (checkout securise) et la prise en charge demarre apres confirmation du reglement.',
      ],
    },
    {
      title: 'Tarification',
      content: [
        `Les prix affiches sont exprimes en ${pricing.currency_label}. L'offre publique ${pricing.standard.name} est actuellement proposee a ${standardPriceLabel}, et l'offre ${pricing.premium.name} a ${premiumPriceLabel}.`,
        "Le prix d'une commande est fige au moment de sa creation (snapshot) et n'est pas modifiable ensuite.",
      ],
    },
    {
      title: 'Delais et engagement de service',
      content: [
        'Confirmation operationnelle visee sous 2h ouvrees et livraison visee sous 48h ouvrees, sous reserve de completude des informations fournies par le client.',
      ],
    },
    {
      title: 'Support et reclamations',
      content: [
        'Les demandes de support passent par le formulaire de contact.',
        'Le lien "Mot de passe oublie" permet desormais une reinitialisation technique securisee.',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfb] pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-10 md:mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400 mb-4">Cadre contractuel</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black mb-4">CGU / CGV</h1>
          <p className="text-base md:text-lg text-gray-500 leading-relaxed">
            Conditions d'utilisation, de commande et de vente applicables a la plateforme FRILO pour son perimetre V1.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-28 h-fit space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-4">Document</p>
              <div className="space-y-3 text-sm text-gray-600">
                <p><span className="font-semibold text-black">Version:</span> V1 operationnelle</p>
                <p><span className="font-semibold text-black">Publication:</span> 10 avril 2026</p>
                <p><span className="font-semibold text-black">Usage:</span> cadre d'utilisation et de vente</p>
                <p><span className="font-semibold text-black">Tarif public de depart:</span> {startingPriceLabel}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-4">Liens utiles</p>
              <div className="space-y-3 text-sm">
                <Link href="/mentions-legales" className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-gray-700 hover:border-black hover:text-black transition-colors">
                  Mentions legales
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
                Ce document definit le cadre d'utilisation et de vente applique a la plateforme FRILO en version V1.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
