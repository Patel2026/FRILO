"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Layout, MessageSquare, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { SectorCard } from '@/components/business/SectorCard';
import { TemplateCard } from '@/components/business/TemplateCard';
import { businessService, Sector, Template } from '@/services/business.service';
import { TESTIMONIALS } from '@/data/mocks';
import { cn, parseFeatures } from '@/lib/utils';

export default function Home() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const sectorsData = await businessService.getSectors();
        setSectors(sectorsData);

        // Fetch templates from the first sector or just all if API supported it.
        // For now, let's fetch templates for the first sector found to show something, 
        // OR better: if we can't filter by "popular" in API, we might just pick a few from the first available sector.
        // Let's try to get templates for the first 2 sectors to have variety.
        if (sectorsData.length > 0) {
          const t1 = await businessService.getTemplates(sectorsData[0].slug);
          setFeaturedTemplates(t1.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-80"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/50 to-transparent transform skew-x-12"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-frilo-blue text-xs font-semibold uppercase tracking-wider mb-6">
                <Zap className="w-4 h-4" /> Offre de lancement -30%
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Votre site professionnel <br />
                <span className="text-transparent bg-clip-text bg-gradient-frilo">livré en 24h chrono</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Ne perdez plus de temps avec des agences coûteuses ou des outils compliqués.
                Choisissez votre modèle, nous nous occupons de tout.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" variant="gradient" asChild>
                  <Link href="/templates">Voir les modèles <ArrowRight className="ml-2 w-5 h-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">Parler à un expert</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
                <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-green-500" /> Zéro IA</span>
                <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-green-500" /> Zéro frais cachés</span>
                <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-green-500" /> Support 7j/7</span>
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="relative z-10 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400">Visuel Hero (Dashboard ou Mockup)</p>
                </div>
              </div>
              {/* Decorative blobs */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Sectors Preview */}
      <Section title="Les secteurs populaires" subtitle="Des modèles optimisés pour chaque métier" variant="muted">
        {loading ? (
          <div className="text-center py-10">Chargement des secteurs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.slice(0, 6).map((sector) => (
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
        )}
        <div className="text-center mt-12">
          <Button variant="secondary" asChild>
            <Link href="/secteurs">Voir tous les secteurs</Link>
          </Button>
        </div>
      </Section>

      {/* Comment ça marche */}
      <Section title="Comment ça marche ?" subtitle="Votre site en ligne en 3 étapes simples">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center relative">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold text-frilo-blue relative z-10">1</div>
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-blue-50 -z-0"></div>

            <h3 className="font-bold text-lg mb-2">Choisissez votre modèle</h3>
            <p className="text-gray-600">Explorez nos sites prêts à l'emploi et sélectionnez celui qui correspond à votre activité.</p>
          </div>
          <div className="text-center relative">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold text-frilo-purple relative z-10">2</div>
            <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-blue-50 -z-0"></div>

            <h3 className="font-bold text-lg mb-2">Commandez en 2 minutes</h3>
            <p className="text-gray-600">Remplissez un formulaire simple avec la description de votre entreprise, votre logo et vos couleurs.</p>
          </div>
          <div className="text-center relative">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold text-green-600 relative z-10">3</div>
            <h3 className="font-bold text-lg mb-2">On s'occupe de tout</h3>
            <p className="text-gray-600">Nos experts intègrent votre contenu et mettent votre site en ligne sous 48h.</p>
          </div>
        </div>
        <div className="text-center mt-12">
          <Button variant="gradient" size="lg" asChild>
            <Link href="/templates">Commencer maintenant</Link>
          </Button>
        </div>
      </Section>

      {/* Featured Templates */}
      <Section title="Quelques exemples" subtitle="Des designs modernes prêt à l'emploi" variant="muted">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTemplates.map((template) => {
            // Parse features/price safer
            const features = parseFeatures(template.features);
            const price = typeof template.price === 'string' ? parseInt(template.price) : template.price;

            return (
              <TemplateCard
                key={template.id}
                id={String(template.id)}
                name={template.name}
                sectorName={template.sector?.name || "Modèle"}
                price={price}
                features={features}
                image={template.full_thumbnail_url}
              />
            );
          })}
        </div>
        <div className="text-center mt-12">
          <Button variant="secondary" asChild>
            <Link href="/templates">Voir tous les modèles</Link>
          </Button>
        </div>
      </Section>

      {/* Temoignages */}
      <Section title="Ils nous font confiance" subtitle="Découvrez les retours de nos clients" variant="muted">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("w-4 h-4", i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Features / Benefits (Pourquoi choisir FRILO) */}
      <Section title="Pourquoi choisir FRILO ?">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-4">
          <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-frilo-blue">
              <Layout className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Design Professionnel</h3>
            <p className="text-gray-600">Des sites modernes, épurés et conçus pour convertir vos visiteurs en clients.</p>
          </div>
          <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-frilo-purple">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Ultra Rapide</h3>
            <p className="text-gray-600">Votre site en ligne en 48 heures chronos. Nous intégrons votre contenu pour vous.</p>
          </div>
          <div className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Support Dédié</h3>
            <p className="text-gray-600">Une équipe disponible par chat et téléphone pour vous accompagner.</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
