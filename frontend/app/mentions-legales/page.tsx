import Link from 'next/link';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Informations légales</p>
        <h1 className="text-4xl font-black tracking-tight text-black mb-8">Mentions légales</h1>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-black mb-3">Éditeur du site</h2>
            <p>Raison sociale: FRILO</p>
            <p>Forme juridique: société en cours de formalisation administrative</p>
            <p>Numéro d’immatriculation: communiqué sur devis et factures contractuelles</p>
            <p>Adresse du siège: Cotonou, Bénin (adresse complète transmise dans les documents contractuels)</p>
            <p>Email: contact@frilo.com</p>
            <p>Téléphone: support via formulaire de contact</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Directeur de publication</h2>
            <p>Responsable légal FRILO (coordonnées disponibles sur demande contractuelle)</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Hébergement</h2>
            <p>Prestataire: infrastructure cloud sécurisée sous contrat FRILO</p>
            <p>Adresse: localisation détaillée communiquée dans la documentation technique contractuelle</p>
            <p>Contact: support@frilo.com</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Propriété intellectuelle</h2>
            <p>
              Les contenus présents sur la plateforme FRILO (textes, visuels, structure, composants et éléments de
              marque) sont protégés. Toute reproduction non autorisée est interdite.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 text-sm text-gray-500">
          <p>Version V1 opérationnelle publiée le 10 avril 2026.</p>
          <p>
            Ce document est publié pour exploitation V1 et sera remplacé par la version juridique contractuelle
            définitive après validation légale complète.
          </p>
          <p className="mt-3">
            Voir aussi les <Link href="/cgu" className="underline underline-offset-2 text-black">CGU / CGV</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
