"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import {
  PublicFinalCta,
  PublicHero,
  PublicPageShell,
} from '@/components/public/PublicPageShell';
import { businessService, FaqItem } from '@/services/business.service';
import { cn } from '@/lib/utils';

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    async function loadFaqs() {
      try {
        setError(null);
        const data = await businessService.getFaqs();
        setFaqs(data);
        setOpen(data[0]?.id ?? null);
      } catch {
        setFaqs([]);
        setError("Impossible de charger la FAQ pour le moment.");
      } finally {
        setLoading(false);
      }
    }

    loadFaqs();
  }, []);

  return (
    <PublicPageShell>
      <PublicHero
        eyebrow="Questions"
        title="Les réponses utiles avant de commander."
        description="Prix, livraison, contenu, propriété du site et accompagnement : les points importants doivent être faciles à comprendre."
        primaryAction={{ label: 'Voir les réponses', href: '#faq' }}
        secondaryAction={{ label: 'Nous écrire', href: '/contact?subject=Question%20avant%20commande' }}
        aside={(
          <div className="border-y border-black bg-white p-5">
            <p className="text-lg font-black leading-tight">
              Vous choisissez un modèle. FRILO l’adapte à votre activité et vous accompagne jusqu’à la mise en ligne.
            </p>
            <Link href="/templates" className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white">
              Voir les modèles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      />

      <div id="faq" className="px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[0.46fr_0.54fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">Réponses utiles</p>
            <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight text-black md:text-4xl">
              Les points qui rassurent avant de payer.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-black/62">
              Une bonne commande commence quand le client comprend le délai, le prix, ce qu’il reçoit et comment il sera accompagné.
            </p>
          </div>

          <div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-24 animate-pulse bg-white" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
              <p className="text-sm text-amber-800">{error}</p>
            </div>
          ) : faqs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 px-6 py-10 text-center">
              <p className="text-sm text-gray-500">Aucune question fréquente n&apos;est publiée pour le moment.</p>
            </div>
          ) : (
            <div className="border-y border-black bg-white">
              {faqs.map((faq, index) => (
                <div key={faq.id} className="border-b border-black/10 px-5 last:border-b-0">
                  <button
                    onClick={() => setOpen(open === faq.id ? null : faq.id)}
                    className="group flex w-full items-start justify-between gap-5 py-5 text-left"
                    aria-expanded={open === faq.id}
                  >
                    <span className="flex gap-4">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <span className="pt-1 text-base font-black leading-snug text-black transition-colors group-hover:text-[#e60000]">
                        {faq.question}
                      </span>
                    </span>
                    <Plus
                      className={cn(
                        "mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200",
                        open === faq.id && "rotate-45 text-[#e60000]"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300",
                      open === faq.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 pl-12 text-sm leading-6 text-black/62 whitespace-pre-line md:pl-12">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>

      <PublicFinalCta
        title="Écrivez-nous avant de choisir."
        description="On vous aide à partir sur le bon modèle et à comprendre les prochaines étapes."
        href="/contact?subject=Question%20avant%20commande"
        label="Nous contacter"
      />
    </PublicPageShell>
  );
}
