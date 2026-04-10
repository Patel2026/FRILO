import Link from 'next/link';

export default function CguPage() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Cadre contractuel</p>
        <h1 className="text-4xl font-black tracking-tight text-black mb-8">CGU / CGV</h1>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-black mb-3">Objet</h2>
            <p>
              FRILO propose la commande de sites vitrines personnalisés avec livraison opérationnelle sous 48h ouvrées,
              selon le périmètre V1 annoncé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Parcours de commande</h2>
            <p>
              La commande est effectuée via le tunnel FRILO, avec création d’un compte client et validation finale du
              panier. Le paiement est traité via FedaPay (checkout sécurisé) et la prise en charge démarre après
              confirmation du règlement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Tarification</h2>
            <p>
              Les prix affichés sont exprimés en FCFA. Le prix d’une commande est figé au moment de sa création
              (snapshot) et n’est pas modifiable ensuite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Délais et engagement de service</h2>
            <p>
              Confirmation opérationnelle visée sous 2h ouvrées et livraison visée sous 48h ouvrées, sous réserve de
              complétude des informations fournies par le client.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Support et réclamations</h2>
            <p>
              Les demandes de support passent par le formulaire de contact. Le lien “Mot de passe oublié” permet
              désormais une réinitialisation technique sécurisée.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 text-sm text-gray-500">
          <p>Version V1 opérationnelle publiée le 10 avril 2026.</p>
          <p>
            Ce document définit le cadre d’utilisation et de vente appliqué à la plateforme FRILO en version V1.
          </p>
          <p className="mt-3">
            Retour aux <Link href="/mentions-legales" className="underline underline-offset-2 text-black">mentions légales</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
