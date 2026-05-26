"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Monitor, Smartphone } from 'lucide-react';
import { businessService, Template } from '@/services/business.service';
import { cn } from '@/lib/utils';
import { buildPreviewUrl, hasLivePreview, parsePreviewPages } from '@/lib/templatePreview';
import { trackFunnelEvent } from '@/lib/analytics';

export default function TemplateImmersivePreviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activePreviewPath, setActivePreviewPath] = useState('/');

  useEffect(() => {
    if (!id) {
      return;
    }

    businessService.getTemplate(id)
      .then((data) => {
        setTemplate(data);
        const pages = parsePreviewPages(data.preview_pages);
        if (pages.length > 0) {
          setActivePreviewPath(pages[0].path);
        } else {
          setActivePreviewPath('/');
        }
      })
      .catch(() => setTemplate(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!template) {
      return;
    }

    trackFunnelEvent('open_preview', {
      template_id: template.id,
      template_name: template.name,
      source: 'immersive_preview_page',
    });
  }, [template]);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Template introuvable.</p>
        <Link href="/templates" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const livePreviewEnabled = hasLivePreview(template.preview_url);

  const iframeSrc = livePreviewEnabled && template.preview_url
    ? buildPreviewUrl(template.preview_url, activePreviewPath)
    : null;

  if (!livePreviewEnabled || !iframeSrc) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-gray-400 mb-2">Cette démo immersive n'est pas encore configurée pour ce template.</p>
        <p className="text-xs text-gray-500 mb-6">Ajoute une URL de prévisualisation dans l'admin pour activer le mode live.</p>
        <Link href={`/templates/${template.id}`} className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
          Retour au détail
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[oklch(7%_0.006_29)] text-white">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4 md:px-6">
        <Link
          href={`/templates/${template.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/55 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/10 p-1 md:flex">
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition-colors",
              viewMode === 'desktop' ? "bg-white text-slate-950" : "text-white/60 hover:text-white"
            )}
          >
            <Monitor className="h-4 w-4" />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition-colors",
              viewMode === 'mobile' ? "bg-white text-slate-950" : "text-white/60 hover:text-white"
            )}
          >
            <Smartphone className="h-4 w-4" />
            Mobile
          </button>
        </div>

        <div className="ml-auto hidden min-w-0 text-center md:block">
          <p className="truncate text-xs font-black uppercase tracking-[0.16em] text-white/35">
            Aperçu réel
          </p>
          <p className="truncate text-sm font-black text-white">{template.name}</p>
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-4">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 p-1 md:hidden">
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                viewMode === 'desktop' ? "bg-white text-slate-950" : "text-white/55"
              )}
              aria-label="Affichage desktop"
              aria-pressed={viewMode === 'desktop'}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                viewMode === 'mobile' ? "bg-white text-slate-950" : "text-white/55"
              )}
              aria-label="Affichage mobile"
              aria-pressed={viewMode === 'mobile'}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
          <Link
            href={`/commande?templateId=${template.id}`}
            onClick={() =>
              trackFunnelEvent('start_order', {
                template_id: template.id,
                template_name: template.name,
                source: 'immersive_preview_topbar',
              })
            }
            className="hidden rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-950 transition-colors hover:bg-white/90 sm:inline-flex"
          >
            Commander
          </Link>
        </div>
      </div>

      <div className="flex flex-1 items-stretch justify-center overflow-hidden p-3 md:p-5">
        <div className={cn(
          "overflow-hidden bg-white shadow-2xl transition-all duration-300",
          viewMode === 'desktop'
            ? "h-full w-full max-w-[1680px] rounded-2xl border border-white/10"
            : "h-full max-h-[760px] w-[360px] rounded-[2.5rem] border-[10px] border-zinc-900"
        )}>
          <iframe
            src={buildPreviewUrl(template.preview_url!, activePreviewPath)}
            className="h-full w-full"
            title={`Demo ${template.name}`}
          />
        </div>
      </div>

      <div className="border-t border-white/10 bg-[oklch(7%_0.006_29)] px-4 py-3 sm:hidden">
        <Link
          href={`/commande?templateId=${template.id}`}
          onClick={() =>
            trackFunnelEvent('start_order', {
              template_id: template.id,
              template_name: template.name,
              source: 'immersive_preview_mobile_bottom',
            })
          }
          className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950"
        >
          Commander ce modèle
        </Link>
      </div>
    </div>
  );
}
