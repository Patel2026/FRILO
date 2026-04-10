"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
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
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
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
            <div className="divide-y divide-gray-100">
              {faqs.map((faq) => (
                <div key={faq.id}>
                  <button
                    onClick={() => setOpen(open === faq.id ? null : faq.id)}
                    className="w-full flex items-start justify-between gap-6 py-7 text-left group"
                  >
                    <span className="text-base font-semibold text-black group-hover:text-gray-600 transition-colors leading-snug">
                      {faq.question}
                    </span>
                    <Plus className={cn(
                      "w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 transition-transform duration-200",
                      open === faq.id && "rotate-45"
                    )} />
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    open === faq.id ? "max-h-[420px] pb-7" : "max-h-0"
                  )}>
                    <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
