"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: "Combien de temps faut-il pour recevoir mon site ?",
    answer: "Nous nous engageons à livrer votre site en 48h ouvrées après réception de tous vos éléments (textes, logos, images). Si vous n'avez pas encore tous les éléments, nous pouvons commencer avec des contenus génériques.",
  },
  {
    question: "Puis-je modifier mon site moi-même après la livraison ?",
    answer: "Absolument. Nos sites sont construits sur des technologies standards. Nous pouvons vous donner un accès administrateur si vous souhaitez faire des modifications mineures, ou vous pouvez nous contacter pour toute mise à jour.",
  },
  {
    question: "Le site m'appartient-il vraiment ?",
    answer: "Oui, à 100%. Contrairement aux plateformes par abonnement, une fois payé, le site est entièrement à vous. Vous êtes libre de changer d'hébergeur quand vous le souhaitez.",
  },
  {
    question: "Que se passe-t-il si je ne suis pas satisfait ?",
    answer: "Nous fonctionnons avec une garantie satisfaction. Si le premier rendu ne vous convient pas, nous effectuons une passe de corrections incluse. Si cela ne vous convient toujours pas, nous vous remboursons intégralement.",
  },
  {
    question: "L'hébergement est-il inclus dans le prix ?",
    answer: "Oui. Le prix affiché inclut la création du site, la mise en ligne et l'hébergement pour la première année. À partir de la deuxième année, un forfait d'hébergement annuel vous sera proposé à tarif préférentiel.",
  },
  {
    question: "Comment puis-je vous transmettre mes contenus ?",
    answer: "Après votre commande, vous recevrez un formulaire détaillé pour nous transmettre tous vos éléments : textes, logo, couleurs, photos. Vous pouvez également nous envoyer tout par e-mail à contact@frilo.com.",
  },
  {
    question: "Mon site sera-t-il visible sur mobile ?",
    answer: "Tous nos modèles sont intégralement responsive. Votre site s'adapte automatiquement à tous les écrans : ordinateur, tablette et smartphone.",
  },
  {
    question: "Puis-je commander un site personnalisé ?",
    answer: "Nos modèles sont conçus pour être adaptés à votre identité (couleurs, logo, textes, photos). Pour une création sur mesure complète, contactez-nous afin que nous puissions établir un devis personnalisé.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="sq-section bg-black text-white">
        <div className="sq-container text-center">
          <p className="sq-label text-gray-500 mb-5">FAQ</p>
          <h1 className="sq-display text-white mb-6">Questions<br />fréquentes.</h1>
          <p className="text-gray-400 text-xl max-w-lg mx-auto">
            Tout ce que vous devez savoir sur FRILO, nos modèles et notre processus.
          </p>
        </div>
      </div>

      {/* FAQ list */}
      <div className="sq-section">
        <div className="sq-container max-w-3xl">
          <div className="divide-y divide-gray-100">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-start justify-between gap-6 py-7 text-left group"
                >
                  <span className="text-base font-semibold text-black group-hover:text-gray-600 transition-colors leading-snug">
                    {faq.question}
                  </span>
                  <Plus className={cn(
                    "w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 transition-transform duration-200",
                    open === i && "rotate-45"
                  )} />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  open === i ? "max-h-96 pb-7" : "max-h-0"
                )}>
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-black sq-section text-white">
        <div className="sq-container text-center">
          <p className="sq-label text-gray-500 mb-5">Encore des questions ?</p>
          <h2 className="sq-heading text-white mb-6">On est là pour vous.</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
            Notre équipe répond à toutes vos questions en moins de 24h.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/contact" className="sq-btn sq-btn-white">
              Nous contacter
            </Link>
            <Link href="/templates" className="sq-btn sq-btn-outline-white">
              Voir les modèles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
