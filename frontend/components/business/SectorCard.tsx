import Link from 'next/link';
import { ArrowRight, type LucideIcon, Utensils, Hammer, Heart, Scale, Users, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
// Note: In a real app we would map string icon names to components more dynamically
// For now, we will just use a simple mapping or accept that the mock data passes strings and we render a fallback, 
// OR we update the mock to pass key names and we map them here. 
// The mock passes strings like 'Utensils'.

const IconMap: Record<string, LucideIcon> = {
    Utensils,
    Hammer,
    Heart,
    Scale,
    Users,
    Home
};

interface SectorCardProps {
    name: string;
    slug: string;
    description: string;
    icon: string; // The mock passes a string
    gradient?: string;
}

export function SectorCard({ name, slug, description, icon, gradient }: SectorCardProps) {
    const IconComponent = IconMap[icon] || Home; // Fallback

    return (
        <Link
            href={`/secteurs/${slug}`}
            className="group block h-full"
        >
            <div className={cn(
                "h-full p-6 rounded-2xl transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 bg-white relative overflow-hidden group-hover:border-transparent"
            )}>
                {/* Gradient Overlay on Hover */}
                <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br",
                    gradient
                )} />

                <div className="relative z-10 flex flex-col h-full">
                    <div className={cn(
                        "w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white bg-gradient-to-br shadow-md",
                        gradient
                    )}>
                        <IconComponent className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-frilo-purple transition-colors">
                        {name}
                    </h3>

                    <p className="text-gray-500 text-sm mb-6 flex-grow">
                        {description}
                    </p>

                    <div className="flex items-center text-sm font-semibold text-frilo-blue group-hover:text-frilo-purple transition-colors">
                        Voir les modèles <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
