"use client"

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Monitor, Smartphone, ShoppingCart, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { businessService, Template } from '@/services/business.service';
import { cn, parseFeatures } from '@/lib/utils';

export default function TemplatePreviewPage() {
    const params = useParams();
    const id = params?.id as string;

    const [template, setTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

    useEffect(() => {
        if (!id) return;
        async function loadTemplate() {
            try {
                // In MOCK mode we used ID as string UUID, but DB uses ID as number.
                // However, API route /templates/{template} accepts ID or model binding.
                // If the URL is /templates/1, it works.
                // If mocks used UUIDs, we might need to adjust.
                // Let's assume standard resource ID.
                const data = await businessService.getTemplate(id);
                setTemplate(data);
            } catch (error) {
                console.error("Failed to load template", error);
            } finally {
                setLoading(false);
            }
        }
        loadTemplate();
    }, [id]);

    if (loading) return <div className="pt-32 text-center">Chargement du modèle...</div>;
    if (!template) return <div className="pt-32 text-center">Modèle introuvable</div>;

    const features = parseFeatures(template.features);

    return (
        <div className="pt-20 min-h-screen flex flex-col">
            {/* Top Bar - Header specific for preview */}
            <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={template.sector ? `/secteurs/${template.sector.slug}` : '/secteurs'}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                            </Link>
                        </Button>
                        <div>
                            <h1 className="font-bold text-gray-900">{template.name}</h1>
                            {template.sector && <span className="text-xs text-gray-500">{template.sector.name}</span>}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('desktop')}
                            className={cn(
                                "p-2 rounded-md transition-all",
                                viewMode === 'desktop' ? "bg-white shadow text-frilo-blue" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <Monitor size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('mobile')}
                            className={cn(
                                "p-2 rounded-md transition-all",
                                viewMode === 'mobile' ? "bg-white shadow text-frilo-blue" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <Smartphone size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                            <span className="block font-bold text-lg">{template.price.toLocaleString('fr-FR')} FCFA</span>
                            <span className="text-xs text-green-600 font-medium">Payable en 3x</span>
                        </div>
                        <Button variant="gradient" asChild>
                            <Link href={`/commande?templateId=${template.id}`}> <ShoppingCart className="w-4 h-4 mr-2" /> Commander</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content - Split View */}
            <div className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-9rem)]">
                {/* Preview Area */}
                <div className="flex-grow bg-slate-100 flex items-center justify-center p-4 lg:p-8 overflow-hidden relative">
                    <div className={cn(
                        "transition-all duration-500 bg-white shadow-2xl overflow-hidden border border-gray-200 relative",
                        viewMode === 'desktop' ? "w-full h-full max-w-[1600px] rounded-md" : "w-[375px] h-[700px] rounded-[3rem] border-8 border-gray-800"
                    )}>
                        {template.preview_url ? (
                            <iframe
                                src={template.preview_url}
                                className="w-full h-full bg-white"
                                title={`Preview of ${template.name}`}
                            />
                        ) : template.full_thumbnail_url ? (
                            <img
                                src={template.full_thumbnail_url}
                                alt={template.name}
                                className="w-full h-full object-cover object-top"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-gray-400">
                                <Monitor className="w-16 h-16 mb-4 opacity-20" />
                                <p>Aperçu non disponible pour <span className="font-bold">{template.name}</span></p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar details */}
                <div className="w-full lg:w-96 bg-white border-l border-gray-200 overflow-y-auto p-6">
                    <div className="mb-8">
                        <h3 className="font-bold text-lg mb-4 flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                            Inclus dans l&apos;offre
                        </h3>
                        <ul className="space-y-3">
                            {features.map((feature: string, i: number) => (
                                <li key={i} className="flex items-start text-sm text-gray-600">
                                    <Check className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                            <li className="flex items-start text-sm text-gray-600">
                                <Check className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
                                Hébergement haute performance
                            </li>
                            <li className="flex items-start text-sm text-gray-600">
                                <Check className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
                                Nom de domaine offert (1 an)
                            </li>
                            <li className="flex items-start text-sm text-gray-600">
                                <Check className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
                                Optimisation SEO de base
                            </li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-8">
                        <h4 className="font-bold text-frilo-blue mb-2 flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Processus de livraison
                        </h4>
                        <ol className="text-sm space-y-4 relative border-l-2 border-blue-200 ml-2 pl-4">
                            <li className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-400"></div>
                                <span className="font-semibold text-gray-900">J+0 : Commande</span>
                                <p className="text-gray-500 text-xs">Vous remplissez le formulaire.</p>
                            </li>
                            <li className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-400"></div>
                                <span className="font-semibold text-gray-900">J+1 : Montage</span>
                                <p className="text-gray-500 text-xs">Nous intégrons vos contenus.</p>
                            </li>
                            <li className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="font-semibold text-gray-900">J+2 : Livraison !</span>
                                <p className="text-gray-500 text-xs">Votre site est en ligne.</p>
                            </li>
                        </ol>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-4">Besoin d&apos;aide avant de commander ?</p>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/contact">Contacter un expert</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
