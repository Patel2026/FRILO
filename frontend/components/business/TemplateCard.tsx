import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface TemplateCardProps {
  id: string;
  name: string;
  sectorName?: string;
  price: number;
  features: string[];
  image: string;
}

export function TemplateCard({ id, name, sectorName, price, image }: TemplateCardProps) {
  return (
    <Link href={`/templates/${id}`} className="group block">
      {/* Image container — Squarespace style: image fills card, hover shows CTA */}
      <div className="relative aspect-[3/2] bg-gray-100 overflow-hidden rounded-sm">
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

        {/* Hover overlay — exactly like Squarespace */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white text-black text-sm font-bold px-6 py-3 rounded-full flex items-center gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            Voir ce modèle <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Card info — minimal, like Squarespace */}
      <div className="pt-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            {sectorName && (
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                {sectorName}
              </p>
            )}
            <h3 className="font-bold text-black text-sm group-hover:text-gray-600 transition-colors">
              {name}
            </h3>
          </div>
          <span className="text-sm font-bold text-black whitespace-nowrap">
            {price.toLocaleString('fr-FR')} <span className="text-gray-400 font-normal text-xs">FCFA</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
