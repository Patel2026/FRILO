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
            <p>Raison sociale: FRILO [À COMPLÉTER]</p>
            <p>Forme juridique: [À COMPLÉTER]</p>
            <p>Numéro d’immatriculation: [À COMPLÉTER]</p>
            <p>Adresse du siège: [À COMPLÉTER]</p>
            <p>Email: contact@frilo.com</p>
            <p>Téléphone: +229 [À COMPLÉTER]</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Directeur de publication</h2>
            <p>[Nom du responsable légal à compléter]</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Hébergement</h2>
            <p>Prestataire: [À COMPLÉTER]</p>
            <p>Adresse: [À COMPLÉTER]</p>
            <p>Contact: [À COMPLÉTER]</p>
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
          <p>Version V1 standard publiée le 9 avril 2026.</p>
          <p>
            Les champs marqués <strong>[À COMPLÉTER]</strong> doivent être validés juridiquement avant go-live.
          </p>
          <p className="mt-3">
            Voir aussi les <Link href="/cgu" className="underline underline-offset-2 text-black">CGU / CGV</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
