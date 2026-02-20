import Link from 'next/link';
import { Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TemplateCardProps {
    id: string;
    name: string;
    sectorName?: string; // Optional if we are already in a sector page
    price: number;
    features: string[];
    image: string; // URL
}

export function TemplateCard({ id, name, sectorName, price, features, image }: TemplateCardProps) {
    return (
        <div className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Thumbnail */}
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden group">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-gray-400">
                        <span>Aperçu {name}</span>
                    </div>
                )}

                {/* Overlay CTA */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <Button variant="secondary" size="sm" asChild>
                        <Link href={`/templates/${id}`}>
                            <Eye className="w-4 h-4 mr-2" /> Aperçu
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        {sectorName && (
                            <span className="text-xs font-medium text-frilo-blue uppercase tracking-wide">
                                {sectorName}
                            </span>
                        )}
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-frilo-purple transition-colors">
                            {name}
                        </h3>
                    </div>
                    <div className="text-right">
                        <span className="block text-lg font-bold text-gray-900">{price.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                </div>

                <ul className="space-y-1 mb-5">
                    {features.slice(0, 2).map((feature, i) => (
                        <li key={i} className="text-xs text-gray-500 flex items-center">
                            <Check className="w-3 h-3 mr-1 text-green-500" /> {feature}
                        </li>
                    ))}
                </ul>

                <Button className="w-full" variant="outline" asChild>
                    <Link href={`/templates/${id}`}>Détails & Commande</Link>
                </Button>
            </div>
        </div>
    );
}
