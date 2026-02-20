"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Section } from '@/components/ui/Section';
import { SectorCard } from '@/components/business/SectorCard';
import { businessService, Sector } from '@/services/business.service';

export default function SectorsPage() {
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSectors() {
            try {
                const data = await businessService.getSectors();
                setSectors(data);
            } catch (error) {
                console.error("Failed to load sectors", error);
            } finally {
                setLoading(false);
            }
        }
        loadSectors();
    }, []);

    return (
        <div className="pt-20 pb-20">
            <Section title="Tous nos secteurs d'activité" subtitle="Choisissez votre métier pour découvrir les modèles adaptés.">
                {loading ? (
                    <div className="text-center py-20">Chargement des secteurs...</div>
                ) : sectors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sectors.map((sector) => (
                            <SectorCard
                                key={sector.id}
                                name={sector.name}
                                slug={sector.slug}
                                description={sector.description}
                                icon={sector.icon}
                                gradient={sector.gradient}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-red-50 text-red-600 rounded-xl">
                        <p className="font-bold mb-2">Impossible de charger les secteurs.</p>
                        <p className="text-sm">Vérifiez votre connexion ou réessayez plus tard.</p>
                    </div>
                )}
            </Section>
        </div>
    );
}
