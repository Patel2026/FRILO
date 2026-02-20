"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Section } from '@/components/ui/Section';
import { TemplateCard } from '@/components/business/TemplateCard';
import { businessService, Template, Sector } from '@/services/business.service';

export default function SectorPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [sector, setSector] = useState<Sector | null>(null);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        async function loadData() {
            try {
                // Fetch all sectors to find the current one by slug (optimized API would have getSectorBySlug)
                const sectors = await businessService.getSectors();
                const currentSector = sectors.find(s => s.slug === slug);
                setSector(currentSector || null);

                if (currentSector) {
                    const templatesData = await businessService.getTemplates(slug);
                    setTemplates(templatesData);
                }
            } catch (error) {
                console.error("Failed to load sector data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [slug]);

    if (loading) return <div className="pt-32 text-center">Chargement...</div>;
    if (!sector) return <div className="pt-32 text-center">Secteur introuvable</div>;

    return (
        <div className="pt-20 pb-20">
            <Section
                title={`Modèles pour ${sector.name}`}
                subtitle={sector.description || "Découvrez nos modèles optimisés pour votre activité."}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {templates.length > 0 ? (
                        templates.map((template) => {
                            // Parse features if string
                            const features = typeof template.features === 'string'
                                ? JSON.parse(template.features)
                                : (template.features || []);

                            // Parse price if string (just in case)
                            const price = typeof template.price === 'string' ? parseInt(template.price) : template.price;

                            return (
                                <TemplateCard
                                    key={template.id}
                                    id={String(template.id)} // Component expects string ID
                                    name={template.name}
                                    sectorName={sector.name}
                                    price={price}
                                    features={features}
                                    image={template.full_thumbnail_url}
                                />
                            );
                        })
                    ) : (
                        <div className="col-span-3 text-center text-gray-500 py-10">
                            Aucun modèle disponible pour le moment dans ce secteur.
                        </div>
                    )}
                </div>
            </Section>
        </div>
    );
}
