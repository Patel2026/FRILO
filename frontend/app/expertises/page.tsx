"use client"

import { Section } from '@/components/ui/Section';
import { ServiceCard } from '@/components/business/ServiceCard';
import { Button } from '@/components/ui/Button';
import {
    Megaphone,
    Search,
    BarChart,
    PenTool,
    Globe,
    ShieldCheck,
    Palette,
    Share2
} from 'lucide-react';

import Link from 'next/link';
// Metadata not supported in client component, moving to layout or separate file if needed.
// For now, removing to fix build.

export default function ExpertisesPage() {
    const services = [
        {
            title: "Publicité Google Ads (SEA)",
            description: "Appapparaissez en haut des résultats de recherche dès demain. Nous gérons vos campagnes pour maximiser votre retour sur investissement (ROI) avec un ciblage précis.",
            icon: Search,
            color: "blue"
        },
        {
            title: "Publicité Social Ads",
            description: "Touchez votre audience là où elle passe son temps (Facebook, Instagram, LinkedIn). Création de visuels impactants et gestion de campagnes performantes.",
            icon: Share2, // Or Share2 / Smartphone
            color: "purple"
        },
        {
            title: "Référencement Naturel (SEO)",
            description: "Optimisez votre site pour apparaître durablement dans les premiers résultats de Google. Audit technique, optimisation sémantique et netlinking.",
            icon: Globe,
            color: "green"
        },
        {
            title: "Identité Visuelle & Branding",
            description: "Ne passez pas inaperçu. Création de logo, charte graphique et supports visuels pour donner une image professionnelle et mémorable à votre marque.",
            icon: Palette,
            color: "pink"
        },
        {
            title: "Stratégie Marketing",
            description: "Ne naviguez plus à vue. Nous analysons votre marché et définissons un plan d'action clair pour atteindre vos objectifs de croissance.",
            icon: BarChart,
            color: "orange"
        },
        {
            title: "Rédaction Web & Copywriting",
            description: "Des textes qui convertissent. Articles de blog, fiches produits ou landing pages : nous écrivons pour séduire vos clients et Google.",
            icon: PenTool,
            color: "yellow"
        },
        {
            title: "Gestion Réseaux Sociaux",
            description: "Community Management clé en main. Nous animons vos pages pour engager votre communauté et fidéliser vos clients.",
            icon: Megaphone,
            color: "indigo"
        },
        {
            title: "Maintenance & Sécurité",
            description: "Dormez sur vos deux oreilles. Nous assurons la mise à jour, la sauvegarde et la sécurisation quotidienne de votre site web.",
            icon: ShieldCheck,
            color: "teal"
        }
    ];

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <Section className="bg-slate-50 border-b border-gray-200 py-24 text-center">
                <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 text-gray-900">
                    Plus qu'un site web, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-frilo">une stratégie digitale complète</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                    FRILO vous accompagne bien au-delà de la création. Découvrez nos expertises pour attirer plus de clients, convertir mieux et fidéliser durablement.
                </p>
                <div className="flex justify-center gap-4">
                    <Button size="lg" variant="gradient" asChild>
                        <Link href="/contact">Parler à un expert</Link>
                    </Button>
                </div>
            </Section>

            {/* Services Grid */}
            <Section title="Nos domaines d'expertise" subtitle="Tout ce dont vous avez besoin pour réussir en ligne">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <ServiceCard
                            key={index}
                            title={service.title}
                            description={service.description}
                            icon={service.icon}
                            color={service.color}
                            href={`/contact?subject=${encodeURIComponent(service.title)}`}
                        />
                    ))}
                </div>
            </Section>

            {/* CTA Final */}
            <Section variant="muted" className="text-center py-20">
                <h2 className="text-3xl font-bold mb-6">Vous ne savez pas par où commencer ?</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    Chaque entreprise est unique. Discutons de vos objectifs et nous vous proposerons la stratégie la plus adaptée à votre budget.
                </p>
                <Button size="lg" variant="outline" className="bg-white hover:bg-gray-50" asChild>
                    <Link href="/contact">Demander un audit gratuit</Link>
                </Button>
            </Section>
        </div>
    );
}
