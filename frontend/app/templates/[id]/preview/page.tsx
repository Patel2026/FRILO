"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Monitor, Smartphone } from 'lucide-react';
import { businessService, Template } from '@/services/business.service';
import { cn } from '@/lib/utils';
import { buildPreviewUrl, hasLivePreview, parsePreviewPages, TemplatePreviewPage } from '@/lib/templatePreview';
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
        <Link href="/templates" className="sq-btn sq-btn-white">Retour au catalogue</Link>
      </div>
    );
  }

  const livePreviewEnabled = hasLivePreview(template.preview_url);
  const previewPages = parsePreviewPages(template.preview_pages);
  const pages: TemplatePreviewPage[] = previewPages.length > 0
    ? previewPages
    : [{ label: 'Accueil', path: '/' }];

  const iframeSrc = livePreviewEnabled && template.preview_url
    ? buildPreviewUrl(template.preview_url, activePreviewPath)
    : null;

  if (!livePreviewEnabled || !iframeSrc) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-gray-400 mb-2">Cette démo immersive n'est pas encore configurée pour ce template.</p>
        <p className="text-xs text-gray-500 mb-6">Ajoute une URL de prévisualisation dans l'admin pour activer le mode live.</p>
        <Link href={`/templates/${template.id}`} className="sq-btn sq-btn-white">Retour au détail</Link>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0f0f0f] text-white flex flex-col overflow-hidden">
      <div className="h-14 px-4 md:px-6 border-b border-white/10 flex items-center gap-3">
        <Link
          href={`/templates/${template.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <div className="hidden md:flex items-center gap-2 rounded-lg bg-white/10 p-1">
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors inline-flex items-center gap-1.5",
              viewMode === 'desktop' ? "bg-white text-black" : "text-gray-300 hover:text-white"
            )}
          >
            <Monitor className="w-4 h-4" />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors inline-flex items-center gap-1.5",
              viewMode === 'mobile' ? "bg-white text-black" : "text-gray-300 hover:text-white"
            )}
          >
            <Smartphone className="w-4 h-4" />
            Mobile
          </button>
        </div>

        <div className="ml-auto text-xs text-gray-400 hidden md:block">
          Démo immersive · {template.name}
        </div>
      </div>

      <div className="px-4 md:px-6 py-3 border-b border-white/10 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {pages.map((page) => (
            <button
              type="button"
              key={`${page.label}-${page.path}`}
              onClick={() => setActivePreviewPath(page.path)}
              data-testid={`immersive-page-${page.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                activePreviewPath === page.path
                  ? "bg-white text-black"
                  : "bg-white/10 text-gray-200 hover:bg-white/20"
              )}
            >
              {page.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-3 md:p-6 flex items-stretch justify-center overflow-hidden">
        <div className={cn(
          "bg-white shadow-2xl overflow-hidden transition-all duration-300",
          viewMode === 'desktop'
            ? "w-full max-w-[1600px] h-full rounded-xl border border-white/10"
            : "w-[380px] h-[760px] rounded-[2.5rem] border-8 border-zinc-800"
        )}>
          <iframe
            src={buildPreviewUrl(template.preview_url!, activePreviewPath)}
            className="w-full h-full"
            title={`Demo ${template.name}`}
          />
        </div>
      </div>
    </div>
  );
}
