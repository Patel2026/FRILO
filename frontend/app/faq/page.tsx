import { Section } from '@/components/ui/Section';
import { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'FAQ - Questions Fréquentes - FRILO',
};

// Simple Accordion Component since I didn't install the full radix accordion for brevity, 
// I'll implement a simple one here or use a Details/Summary HTML for now to be quick and clean defined in separate component is better but for this step
// let's just do a simple map with details/summary for robust zero-js-dependency fallback

export default function FAQPage() {
    const faqs = [
        {
            question: "Combien de temps faut-il pour recevoir mon site ?",
            answer: "Nous nous engageons à livrer votre site en 48h ouvrées après réception de tous vos éléments (textes, logos, images). Si vous n'avez pas encore tous les éléments, nous pouvons commencer avec des contenus génériques."
        },
        {
            question: "Puis-je modifier mon site moi-même après la livraison ?",
            answer: "Absolument. Nos sites sont construits sur des technologies standards. Nous pouvons vous donner un accès administrateur si vous souhaitez faire des modifications mineures, ou vous pouvez souscrire à notre offre de maintenance pour que nous le fassions pour vous."
        },
        {
            question: "Le site m'appartient-il vraiment ?",
            answer: "Oui, à 100%. Contrairement aux plateformes par abonnement (Wix, Shopify...), une fois payé, le site est à vous. Vous êtes libre de changer d'hébergeur quand vous le souhaitez."
        },
        {
            question: "Que se passe-t-il si je ne suis pas satisfait ?",
            answer: "Nous fonctionnons avec une garantie 'Satisfait ou Remboursé'. Si le premier jet ne vous convient pas, nous faisons une passe de corrections. Si cela ne vous convient toujours pas, nous vous remboursons intégralement."
        }
    ];

    return (
        <div className="pt-20">
            <Section className="bg-slate-50 py-20 text-center">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">Questions Fréquentes</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Tout ce que vous devez savoir sur FRILO.
                </p>
            </Section>

            <Section className="max-w-3xl mx-auto">
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <details key={i} className="group bg-white border border-gray-200 rounded-lg p-6 [&_summary::-webkit-details-marker]:hidden open:ring-2 open:ring-frilo-blue/10 open:shadow-md transition-all">
                            <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-gray-900 font-bold text-lg">
                                <h2 className="text-lg font-medium">
                                    {faq.question}
                                </h2>
                                <span className="relative size-5 shrink-0">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="absolute inset-0 size-5 opacity-100 group-open:opacity-0 transition-opacity"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="absolute inset-0 size-5 opacity-0 group-open:opacity-100 transition-opacity"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                            </summary>
                            <p className="mt-4 leading-relaxed text-gray-700">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>

                <div className="mt-12 text-center p-8 bg-blue-50 rounded-2xl border border-blue-100">
                    <h3 className="font-bold text-xl mb-2 text-frilo-blue">Vous ne trouvez pas votre réponse ?</h3>
                    <p className="text-gray-600 mb-6">Notre équipe est disponible pour vous répondre directement.</p>
                    <Button asChild>
                        <Link href="/contact">Nous contacter</Link>
                    </Button>
                </div>
            </Section>
        </div>
    );
}
