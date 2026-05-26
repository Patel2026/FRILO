"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
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
    <div className="min-h-screen bg-white">
      <div className="bg-[oklch(7%_0.006_29)] px-5 pb-14 pt-32 text-white md:pb-16 md:pt-36">
        <div className="mx-auto grid max-w-7xl gap-10 sm:px-6 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:px-8">
          <div>
            <p className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Questions</p>
            <h1 className="max-w-4xl text-4xl font-black leading-[0.98] md:text-5xl lg:text-6xl">
              Avant de commander, tout doit être clair.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
              Les réponses importantes sur le prix, la livraison, la propriété du site et l’accompagnement FRILO.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">À retenir</p>
            <p className="mt-3 text-xl font-black leading-tight">
              Vous choisissez un modèle. FRILO l’adapte à votre activité et vous accompagne jusqu’à la mise en ligne.
            </p>
            <Link
              href="/templates"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950"
            >
              Voir les modèles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="px-5 py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 sm:px-6 lg:grid-cols-[0.46fr_0.54fr] lg:px-8">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Réponses utiles</p>
            <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight text-slate-950 md:text-4xl">
              Les points qui rassurent avant de payer.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
              Une bonne commande commence quand le client comprend le délai, le prix, ce qu’il reçoit et comment il sera accompagné.
            </p>
          </div>

          <div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-[1.25rem] bg-slate-100" />
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
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={faq.id} className="rounded-[1.25rem] border border-slate-100 bg-slate-50 px-5">
                  <button
                    onClick={() => setOpen(open === faq.id ? null : faq.id)}
                    className="group flex w-full items-start justify-between gap-5 py-5 text-left"
                    aria-expanded={open === faq.id}
                  >
                    <span className="flex gap-4">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <span className="pt-1 text-base font-black leading-snug text-slate-950 transition-colors group-hover:text-[oklch(57%_0.24_29)]">
                        {faq.question}
                      </span>
                    </span>
                    <Plus
                      className={cn(
                        "mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200",
                        open === faq.id && "rotate-45 text-[oklch(57%_0.24_29)]"
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
                      <p className="pb-5 pl-12 text-sm leading-6 text-slate-500 whitespace-pre-line md:pl-12">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-20">
        <div className="mx-auto max-w-7xl rounded-[1.5rem] bg-[oklch(7%_0.006_29)] p-6 text-white sm:px-8 md:flex md:items-center md:justify-between md:gap-8 lg:px-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Encore une hésitation ?</p>
            <p className="mt-2 max-w-2xl text-2xl font-black leading-tight">
              Écrivez-nous avant de choisir. On vous aide à partir sur le bon modèle.
            </p>
          </div>
          <Link href="/contact" className="mt-6 inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 md:mt-0">
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
}
