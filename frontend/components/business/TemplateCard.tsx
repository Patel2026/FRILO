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
    <article className="group block">
      <div className="relative aspect-[3/2] bg-gray-100 overflow-hidden rounded-sm">
        <Link
          href={`/templates/${id}`}
          className="absolute inset-0 z-10 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-4"
          aria-label={`Voir le modèle ${name}`}
        />

        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          {hasLivePreview && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
              Démo live
            </span>
          )}
          {!hasLivePreview && previewScreens > 0 && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
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
              isFavorite ? 'border-black text-black' : 'border-gray-200 text-gray-500 hover:text-black hover:border-black'
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
              isCompared ? 'border-black text-black' : 'border-gray-200 text-gray-500 hover:text-black hover:border-black'
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
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded mx-auto mb-2" />
              <span className="text-xs text-gray-400">{name}</span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 z-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <span className="bg-white text-black text-sm font-bold px-6 py-3 rounded-full flex items-center gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            {hasLivePreview ? 'Tester la démo' : 'Voir ce modèle'} <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      <div className="pt-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            {sectorName && (
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                {sectorName}
              </p>
            )}
            <Link href={`/templates/${id}`} className="relative z-10 font-bold text-black text-sm group-hover:text-gray-600 transition-colors">
              {name}
            </Link>
          </div>
          <span className="text-sm font-bold text-black whitespace-nowrap">
            {price.toLocaleString('fr-FR')} <span className="text-gray-400 font-normal text-xs">FCFA</span>
          </span>
        </div>
      </div>
    </article>
  );
}
