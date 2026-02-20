"use client"

import { useEffect, useState } from 'react';
import { Section } from '@/components/ui/Section';
import { TemplateCard } from '@/components/business/TemplateCard';
import { businessService, Template } from '@/services/business.service';
import { Loader2 } from 'lucide-react';
import { parseFeatures } from '@/lib/utils';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await businessService.getTemplates();
                setTemplates(data);
            } catch (error) {
                console.error("Failed to fetch templates", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    return (
        <div className="pt-20">
            <Section className="bg-slate-50 border-b border-gray-200 py-20 text-center">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">Tous nos modèles de sites</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Explorez notre collection complète de designs premium.
                </p>
            </Section>

            <Section>
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-frilo-blue" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {templates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                id={template.id.toString()}
                                name={template.name}
                                price={template.price}
                                features={parseFeatures(template.features)}
                                image={template.full_thumbnail_url}
                                sectorName={template.sector?.name}
                            />
                        ))}
                        {templates.length === 0 && (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                Aucun template disponible pour le moment.
                            </div>
                        )}
                    </div>
                )}
            </Section>
        </div>
    );
}
