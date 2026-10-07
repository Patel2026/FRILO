import Image from 'next/image';

interface TemplatePreviewProps {
  url: string;
  mode?: 'iframe' | 'external';
  image?: string | null;
  name: string;
  title: string;
}

export function TemplatePreview({ url, mode = 'iframe', image, name, title }: TemplatePreviewProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-slate-950">
      <div className="relative min-h-0 flex-1">
        {mode === 'iframe' ? (
          <iframe src={url} className="h-full w-full" title={title} sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" />
        ) : image ? (
          <Image src={image} alt={`Aperçu de ${name}`} fill unoptimized sizes="100vw" className="object-contain object-top" />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <p>Découvrez {name} sur son site de démonstration.</p>
          </div>
        )}
      </div>
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 text-center text-sm">
        <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">
          Ouvrir la démo dans un nouvel onglet
        </a>
      </div>
    </div>
  );
}
