import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  id: string;
  name: string;
  sectorName?: string;
  price: number;
  features: string[];
  image: string;
  hasLivePreview?: boolean;
  previewScreens?: number;
  isFavorite?: boolean;
  isCompared?: boolean;
  compareDisabled?: boolean;
  onToggleFavorite?: (templateId: number) => void;
  onToggleCompare?: (templateId: number) => void;
}

export function TemplateCard({
  id,
  name,
  sectorName,
  price,
  features,
  image,
  hasLivePreview = false,
  previewScreens = 0,
  isFavorite = false,
  isCompared = false,
  compareDisabled = false,
  onToggleFavorite,
  onToggleCompare,
}: TemplateCardProps) {
  const numericId = Number(id);

  return (
    <article className="group block rounded-[1.35rem] border border-slate-100 bg-slate-50 p-3 transition-colors duration-300 hover:border-slate-950">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] bg-slate-100">
        <Link
          href={`/templates/${id}`}
          className="absolute inset-0 z-10 rounded-[1rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-4"
          aria-label={`Voir le modèle ${name}`}
        />

        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          {hasLivePreview && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-black">
              Aperçu interactif
            </span>
          )}
          {!hasLivePreview && previewScreens > 0 && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-black">
              {previewScreens} captures
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <button
            type="button"
            aria-label={isFavorite ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`}
            aria-pressed={isFavorite}
            data-testid={`template-favorite-${id}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (Number.isFinite(numericId) && onToggleFavorite) {
                onToggleFavorite(numericId);
              }
            }}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white/95 transition-colors',
              isFavorite ? 'border-black text-black' : 'border-slate-200 text-slate-500 hover:border-black hover:text-black'
            )}
          >
            <Heart className={cn('h-4 w-4', isFavorite ? 'fill-black' : '')} />
          </button>

          <button
            type="button"
            aria-label={isCompared ? `Retirer ${name} de la comparaison` : `Ajouter ${name} à la comparaison`}
            aria-pressed={isCompared}
            disabled={compareDisabled && !isCompared}
            data-testid={`template-compare-${id}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (Number.isFinite(numericId) && onToggleCompare) {
                onToggleCompare(numericId);
              }
            }}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white/95 transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              isCompared ? 'border-black text-black' : 'border-slate-200 text-slate-500 hover:border-black hover:text-black'
            )}
          >
            <Scale className="h-4 w-4" />
          </button>
        </div>

        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-xl bg-slate-200" />
              <span className="text-xs text-slate-400">{name}</span>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-black/62 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex translate-y-2 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition-transform duration-300 group-hover:translate-y-0">
            {hasLivePreview ? "Ouvrir l'aperçu" : 'Voir ce modèle'} <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      <div className="px-1 pb-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {sectorName && (
              <p className="mb-1 text-[11px] font-black uppercase tracking-[0.12em] text-[oklch(57%_0.24_29)]">
                {sectorName}
              </p>
            )}
            <Link href={`/templates/${id}`} className="relative z-10 text-base font-black leading-tight text-slate-950 transition-colors group-hover:text-slate-700">
              {name}
            </Link>
          </div>
          <span className="whitespace-nowrap text-sm font-black text-slate-950">
            {price.toLocaleString('fr-FR')} <span className="text-xs font-semibold text-slate-400">FCFA</span>
          </span>
        </div>
        {features.length > 0 && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
            {features.slice(0, 2).join(' · ')}
          </p>
        )}
      </div>
    </article>
  );
}
