"use client"

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthForms } from "@/components/business/AuthForms";
import { ProjectDetailsForm } from "@/components/business/ProjectDetailsForm";
import { businessService, Template } from "@/services/business.service";
import Link from "next/link";

// Wizard Steps
const STEPS = [
    { id: 1, name: "Récapitulatif" },
    { id: 2, name: "Connexion / Compte" },
    { id: 3, name: "Détails du projet" },
    { id: 4, name: "Paiement" },
    { id: 5, name: "Confirmation" },
];

function OrderTunnelContent() {
    const searchParams = useSearchParams();
    const templateId = searchParams.get("templateId");
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<{
        templateId: string | null;
        domainName?: string;
        description?: string;
        colors?: string;
        specific_instructions?: string;
    }>({
        templateId: templateId,
    });

    const [template, setTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadTemplate() {
            if (templateId) {
                setLoading(true);
                try {
                    const data = await businessService.getTemplate(templateId);
                    setTemplate(data);
                } catch (error) {
                    console.error("Failed to load template", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        loadTemplate();
    }, [templateId]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderRef, setOrderRef] = useState<string>("");

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));

    const handlePayment = async () => {
        setIsSubmitting(true);
        try {
            // Simulate Payment Delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Create Order
            const payload = {
                template_id: templateId,
                enterprise_name: formData.domainName,
                activity_description: formData.description,
                colors: formData.colors ? formData.colors.split(',') : [],
                specific_instructions: formData.specific_instructions,
            };

            const order = await businessService.createOrder(payload);
            setOrderRef(String(order.id).padStart(5, '0'));
            nextStep();
        } catch (error) {
            console.error("Order failed", error);
            alert("Une erreur est survenue lors de la commande. Etes-vous bien connecté ?");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement du modèle...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Wizard Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="font-bold text-xl">Commande de votre site</h1>
                        <span className="text-sm text-gray-500">Étape {currentStep} / {STEPS.length}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-frilo-blue -translate-y-1/2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                        ></div>

                        <div className="relative flex justify-between">
                            {STEPS.map((step) => (
                                <div key={step.id} className="flex flex-col items-center">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors bg-white",
                                        currentStep >= step.id ? "border-frilo-blue text-frilo-blue" : "border-gray-200 text-gray-400",
                                        currentStep > step.id && "bg-frilo-blue text-white border-frilo-blue"
                                    )}>
                                        {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                                    </div>
                                    <span className="hidden md:block text-xs mt-2 font-medium text-gray-500">{step.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Step Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
                    {currentStep === 1 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Récapitulatif de votre commande</h2>
                            {template ? (
                                <div className="flex items-start gap-6 border p-4 rounded-xl">
                                    <div className="w-32 h-24 bg-gray-100 rounded-lg flex-shrink-0"></div>
                                    <div>
                                        <h3 className="font-bold text-lg">{template.name}</h3>
                                        <p className="text-gray-500 mb-2">{template.description}</p>
                                        <div className="text-frilo-blue font-bold text-xl">{template.price.toLocaleString()} FCFA</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-red-500">
                                    Aucun modèle sélectionné.
                                    <br />
                                    <Link href="/secteurs" className="text-blue-600 underline hover:text-blue-800">
                                        Retourner au catalogue
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-center">Connexion ou Création de compte</h2>
                            <AuthForms onSuccess={(user) => {
                                void user;
                                nextStep();
                            }} />
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Détails de votre projet</h2>
                            <ProjectDetailsForm onSuccess={(data) => {
                                setFormData(prev => ({ ...prev, ...data }));
                                nextStep();
                            }} />
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold mb-4">Paiement Sécurisé</h2>
                            <p className="text-gray-500 mb-8">Intégration Stripe / Mobile Money à venir.</p>
                            <div className="bg-gray-100 p-6 rounded-xl max-w-sm mx-auto mb-8">
                                <div className="flex justify-between mb-2">
                                    <span>Total à payer</span>
                                    <span className="font-bold">{template?.price.toLocaleString()} FCFA</span>
                                </div>
                            </div>
                            <Button variant="gradient" size="lg" onClick={handlePayment} disabled={isSubmitting} className="w-full max-w-sm">
                                {isSubmitting ? "Traitement..." : "Simuler le paiement validé"}
                            </Button>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                                <Check className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Merci pour votre commande !</h2>
                            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                                Votre commande <strong>#ORD-{orderRef}</strong> a bien été enregistrée.
                                Notre équipe va prendre le relais et vous recevrez un email de confirmation.
                            </p>
                            <Button variant="outline" asChild>
                                <Link href="/">Retour à l&apos;accueil</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                {currentStep === 1 && (
                    <div className="mt-8 flex justify-end">
                        <Button
                            variant="gradient"
                            onClick={nextStep}
                            disabled={!template}
                        >
                            Suivant <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function OrderTunnelPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
            <OrderTunnelContent />
        </Suspense>
    );
}
