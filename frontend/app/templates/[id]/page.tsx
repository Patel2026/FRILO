"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Check, Monitor, Smartphone } from 'lucide-react';
import { businessService, Template } from '@/services/business.service';
import { cn, parseFeatures } from '@/lib/utils';

export default function TemplateDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (!id) return;
    businessService.getTemplate(id)
      .then(setTemplate)
      .catch(() => setTemplate(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Modèle introuvable.</p>
        <Link href="/templates" className="sq-btn sq-btn-black">Retour aux modèles</Link>
      </div>
    );
  }

  const features = parseFeatures(template.features);
  const price = typeof template.price === 'string' ? parseInt(template.price) : template.price;

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Top bar — sticky ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-14 flex items-center px-6 gap-4">
        <Link
          href={template.sector ? `/secteurs/${template.sector.slug}` : '/templates'}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="flex-1 text-center hidden md:block">
          <span className="text-sm font-bold text-black">{template.name}</span>
          {template.sector && (
            <span className="text-xs text-gray-400 ml-2">— {template.sector.name}</span>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('desktop')}
            className={cn("p-1.5 rounded-md transition-all", viewMode === 'desktop' ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black")}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={cn("p-1.5 rounded-md transition-all", viewMode === 'mobile' ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black")}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <Link
          href={`/commande?templateId=${template.id}`}
          className="sq-btn sq-btn-black text-sm py-2 px-5"
        >
          Commander — {price.toLocaleString('fr-FR')} FCFA
        </Link>
      </div>

      {/* ── Main — split view ── */}
      <div className="flex flex-col lg:flex-row h-screen pt-14">

        {/* Preview */}
        <div className="flex-grow bg-[#f7f7f7] flex items-center justify-center p-8 overflow-hidden">
          <div className={cn(
            "relative transition-all duration-500 bg-white shadow-xl overflow-hidden",
            viewMode === 'desktop'
              ? "w-full h-full max-w-5xl rounded-lg border border-gray-200"
              : "w-[375px] h-[700px] rounded-[3rem] border-8 border-gray-800 shadow-2xl"
          )}>
            {template.preview_url ? (
              <iframe src={template.preview_url} className="w-full h-full" title={template.name} />
            ) : template.full_thumbnail_url ? (
              <Image
                src={template.full_thumbnail_url}
                alt={template.name}
                fill
                sizes={viewMode === 'desktop' ? '100vw' : '375px'}
                className="object-cover object-top"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Monitor className="w-16 h-16 mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">Aperçu non disponible</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-100 overflow-y-auto flex flex-col">
          <div className="p-8 flex-grow">

            {/* Price */}
            <div className="mb-8 pb-8 border-b border-gray-100">
              <p className="sq-label text-gray-400 mb-2">Prix</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-black tracking-tight">
                  {price.toLocaleString('fr-FR')}
                </span>
                <span className="text-gray-400 text-sm">FCFA</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Paiement unique · Livraison 48h</p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <p className="sq-label text-gray-400 mb-4">Inclus</p>
              <ul className="space-y-3">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    {f}
                  </li>
                ))}
                {['Hébergement inclus', 'Responsive mobile', 'Support 30 jours'].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Timeline */}
            <div className="mb-8">
              <p className="sq-label text-gray-400 mb-4">Livraison</p>
              <div className="space-y-4 relative">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-100" />
                {[
                  { day: 'Jour 0', title: 'Commande', desc: 'Formulaire rempli' },
                  { day: 'Jour 1', title: 'Montage', desc: 'Intégration contenu' },
                  { day: 'Jour 2', title: 'Livraison', desc: 'Site en ligne', green: true },
                ].map(({ day, title, desc, green }) => (
                  <div key={day} className="flex items-start gap-4 relative">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 z-10",
                      green ? "border-black bg-black" : "border-gray-300 bg-white"
                    )} />
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{day}</span>
                      <p className="text-sm font-semibold text-black">{title}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA sticky bottom */}
          <div className="p-6 border-t border-gray-100 space-y-3">
            <Link
              href={`/commande?templateId=${template.id}`}
              className="sq-btn sq-btn-black w-full justify-center"
            >
              Commander ce modèle
            </Link>
            <Link
              href="/contact"
              className="sq-btn sq-btn-outline-black w-full justify-center"
            >
              Poser une question
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
