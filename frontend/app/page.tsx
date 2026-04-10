"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronRight, Globe, ImageIcon, LayoutTemplate, MessageSquare, Plus, Shield, Smartphone, Star, Zap } from 'lucide-react';
import { SectorCard } from '@/components/business/SectorCard';
import { TestimonialCard } from '@/components/business/TestimonialCard';
import { TemplateCard } from '@/components/business/TemplateCard';
import { usePublicPricing } from '@/hooks/usePublicPricing';
import { formatPublicPrice } from '@/lib/publicPricing';
import { businessService, FaqItem, Sector, Template, TemplateReview } from '@/services/business.service';
import { cn, parseFeatures } from '@/lib/utils';

/* ── Data ──────────────────────────────────────────────────────────────── */

// Squarespace "Tout sur une plateforme" equivalent
const FEATURES = [
  { icon: <LayoutTemplate className="w-6 h-6" />, title: "Design professionnel", desc: "Des templates modernes optimisés pour chaque secteur d'activité." },
  { icon: <Smartphone className="w-6 h-6" />, title: "100% responsive", desc: "Parfait sur téléphone, tablette et ordinateur. Toujours." },
  { icon: <Globe className="w-6 h-6" />, title: "Mise en ligne incluse", desc: "Votre site est hébergé et accessible dès la livraison." },
  { icon: <ImageIcon className="w-6 h-6" />, title: "Galerie photos optimisée", desc: "Vos images mises en valeur, compressées et chargées rapidement." },
  { icon: <MessageSquare className="w-6 h-6" />, title: "Formulaire de contact", desc: "Recevez des demandes directement dans votre boîte email." },
  { icon: <Shield className="w-6 h-6" />, title: "Satisfait ou remboursé", desc: "Pas satisfait après révisions ? On vous rembourse, sans question." },
  { icon: <Zap className="w-6 h-6" />, title: "Livraison en 48h", desc: "Nos experts intègrent votre contenu et mettent votre site en ligne." },
  { icon: <Check className="w-6 h-6" />, title: "Support 7j/7", desc: "Une équipe locale disponible par chat et téléphone." },
  { icon: <Star className="w-6 h-6" />, title: "Identité visuelle", desc: "Vos couleurs, votre logo, votre police. Un site qui vous ressemble." },
];

const SITE_PREVIEWS = [
  { label: 'Restaurant', from: 'from-orange-400', to: 'to-red-500', url: 'le-gourmet.com' },
  { label: 'Juridique', from: 'from-slate-700', to: 'to-slate-900', url: 'maitre-sow.com' },
  { label: 'Coaching', from: 'from-violet-600', to: 'to-purple-800', url: 'votre-coach.com' },
  { label: 'Santé', from: 'from-emerald-500', to: 'to-teal-700', url: 'clinique-ben.com' },
];

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function Home() {
  const { pricing } = usePublicPricing();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<Template[]>([]);
  const [testimonials, setTestimonials] = useState<TemplateReview[]>([]);
  const [homeFaqs, setHomeFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activePreview, setActivePreview] = useState(0);

  useEffect(() => {
    async function loadData() {
      const [testimonialsData, faqsData] = await Promise.all([
        businessService.getFeaturedTestimonials(3).catch(() => []),
        businessService.getFaqs(6).catch(() => []),
      ]);

      setTestimonials(testimonialsData);
      setHomeFaqs(faqsData);

      try {
        setCatalogError(null);
        const sectorsData = await businessService.getSectors();
        setSectors(sectorsData);
        if (sectorsData.length > 0) {
          const t1 = await businessService.getTemplates(sectorsData[0].slug);
          setFeaturedTemplates(t1.slice(0, 3));
        } else {
          setFeaturedTemplates([]);
        }
      } catch {
        setSectors([]);
        setFeaturedTemplates([]);
        setCatalogError("Impossible de charger le catalogue pour le moment.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActivePreview(p => (p + 1) % SITE_PREVIEWS.length), 3500);
    return () => clearInterval(timer);
  }, []);

  const preview = SITE_PREVIEWS[activePreview];
  const startingPriceLabel = formatPublicPrice(pricing.starting_price, pricing.currency_label);

  return (
    <div className="flex flex-col">

      {/* ══════════════════════════════════════════════════════════════════
          1. HERO — Squarespace : fond sombre, titre géant, carousel
      ══════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#0d0d0d] text-white overflow-hidden">
        <div className="sq-container pt-28 md:pt-32 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-14 items-center pb-14 md:pb-16">

            {/* Copy */}
            <div>
              <p className="sq-label mb-6 text-gray-400">
                Livraison 48h · Dès {startingPriceLabel}
              </p>
              <h1 className="sq-display text-white mb-8">
                Votre<br />
                site<br />
                <span className="text-gradient">vitrine.</span>
              </h1>
              <p className="text-gray-400 text-xl max-w-md mb-10 leading-relaxed">
                Clé en main, livré par nos experts en 48h.
                Vous choisissez le modèle, on s'occupe de tout.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/templates" className="sq-btn sq-btn-white">
                  Voir les modèles <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/#how-it-works" className="sq-btn sq-btn-outline-white">
                  Comment ça marche
                </Link>
              </div>
            </div>

            {/* Preview browser */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#1a1a1a]">
                {/* Chrome */}
                <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
                  <div className="flex gap-1.5">
                    {['bg-white/10', 'bg-white/10', 'bg-white/10'].map((c, i) => (
                      <div key={i} className={cn("w-3 h-3 rounded-full", c)} />
                    ))}
                  </div>
                  <div className="flex-1 mx-3 bg-white/5 rounded px-3 py-1.5 text-xs text-gray-500">
                    {preview.url}
                  </div>
                </div>
                {/* Animated preview */}
                <div className={cn("h-52 bg-gradient-to-br px-8 py-8 flex flex-col justify-end transition-all duration-700", preview.from, preview.to)}>
                  <div className="space-y-2.5 mb-5">
                    <div className="h-5 w-3/5 bg-white/30 rounded" />
                    <div className="h-3 w-2/5 bg-white/20 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-9 w-28 bg-white rounded-lg" />
                    <div className="h-9 w-24 bg-white/20 rounded-lg border border-white/30" />
                  </div>
                </div>
                {/* Content */}
                <div className="bg-white p-4 grid grid-cols-3 gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                      <div className="h-14 bg-gray-100" />
                      <div className="p-2 space-y-1.5">
                        <div className="h-2 bg-gray-200 rounded w-full" />
                        <div className="h-2 bg-gray-100 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sector tabs */}
              <div className="flex gap-2 mt-5 flex-wrap justify-center">
                {SITE_PREVIEWS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePreview(i)}
                    className={cn(
                      "text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all",
                      activePreview === i ? "bg-white text-black" : "bg-white/10 text-gray-400 hover:bg-white/20"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fade to white */}
        <div className="h-12 md:h-14 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. STATS — Squarespace : grands chiffres, fond blanc, séparation sobre
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-10 md:py-12 bg-white border-b border-gray-100">
        <div className="sq-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { value: '48h', label: 'Délai de livraison garanti' },
              { value: pricing.starting_price.toLocaleString('fr-FR'), label: `${pricing.currency_label} — prix de départ` },
              { value: '6', label: 'Secteurs professionnels' },
              { value: '100%', label: 'Satisfait ou remboursé' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-5xl font-black tracking-tight text-black leading-none mb-2">{s.value}</div>
                <div className="text-sm text-gray-500 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. SECTEURS — Squarespace "Développez votre activité" : cartes scrollables
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="sq-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-5">
            <div>
              <p className="sq-label mb-4">Catalogue</p>
              <h2 className="sq-heading text-black">
                Votre secteur,<br />votre modèle.
              </h2>
            </div>
            <Link href="/secteurs" className="text-sm font-bold text-black flex items-center gap-1 hover:gap-2 transition-all self-start md:self-end shrink-0">
              Tous les secteurs <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : catalogError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
              <p className="text-sm text-amber-800">{catalogError}</p>
            </div>
          ) : sectors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center">
              <p className="text-sm text-gray-500">Aucun secteur actif disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectors.slice(0, 6).map((sector) => (
                <SectorCard key={sector.id} name={sector.name} slug={sector.slug} description={sector.description} icon={sector.icon} gradient={sector.gradient} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. FEATURES GRID — Squarespace "Tout sur une plateforme" : grille 3×3
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-[#f7f7f7]">
        <div className="sq-container">
          <div className="mb-10 md:mb-12">
            <p className="sq-label mb-4">Inclus dans chaque commande</p>
            <h2 className="sq-heading text-black max-w-xl">
              Tout sur<br />une plateforme.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white p-8 flex flex-col gap-4 card-hover">
                <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <h3 className="font-bold text-black text-base mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5. HOW IT WORKS — Squarespace "Lancez-vous" : fond sombre, numéros géants
      ══════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-16 md:py-20 bg-black text-white">
        <div className="sq-container">
          <div className="mb-10 md:mb-12">
            <p className="sq-label mb-4 text-gray-500">Processus</p>
            <h2 className="sq-heading text-white">
              3 étapes,<br />c'est tout.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5">
            {[
              { num: '01', title: 'Choisissez votre modèle', desc: 'Parcourez notre catalogue par secteur. Chaque modèle est présenté avec un aperçu complet et la liste des fonctionnalités incluses.', detail: 'Restaurants, BTP, Santé, Avocats…' },
              { num: '02', title: 'Remplissez le formulaire', desc: 'Nom d\'entreprise, description, logo, couleurs. Notre formulaire guidé prend environ 2 minutes.', detail: '~2 minutes' },
              { num: '03', title: 'Recevez votre site', desc: 'Nos experts créent votre site de A à Z et vous envoient le lien par email. Vous pouvez demander des révisions.', detail: 'Sous 24 à 48h' },
            ].map(({ num, title, desc, detail }) => (
              <div key={num} className="bg-black p-10 flex flex-col gap-8">
                <span className="text-8xl font-black text-white/10 leading-none">{num}</span>
                <div className="flex flex-col gap-3">
                  <h3 className="sq-subheading text-white">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                  <span className="text-xs font-semibold text-frilo-blue border border-frilo-blue/30 px-3 py-1.5 rounded-full self-start mt-2">
                    {detail}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 md:mt-12">
            <Link href="/templates" className="sq-btn sq-btn-white">
              Choisir mon modèle <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. FEATURE SPLIT — Squarespace : visuel + texte côte à côte
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-white overflow-hidden">
        <div className="sq-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="sq-label mb-6">Notre promesse</p>
              <h2 className="sq-heading text-black mb-8">
                Un site pro<br />sans les maux<br />de tête.
              </h2>
              <p className="text-gray-500 text-lg mb-10 max-w-md leading-relaxed">
                Vous nous donnez vos informations, on crée votre site de A à Z.
                Pas besoin de maîtriser le design ou le code.
              </p>
              <ul className="space-y-4">
                {['Contenu intégré par nos soins', 'Mise en ligne incluse', 'Design adapté à votre identité', 'Responsive mobile et tablette', '30 jours de support inclus'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Browser visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gray-50 rounded-3xl -rotate-2 scale-105" />
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-300" />
                    <div className="w-3 h-3 rounded-full bg-yellow-300" />
                    <div className="w-3 h-3 rounded-full bg-green-300" />
                  </div>
                  <div className="flex-1 mx-3 bg-white rounded px-3 py-1 text-xs text-gray-400 border border-gray-100">votre-entreprise.com</div>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
                  <div className="h-4 w-16 bg-black rounded" />
                  <div className="flex gap-2">
                    <div className="h-2 w-8 bg-gray-200 rounded" />
                    <div className="h-2 w-8 bg-gray-200 rounded" />
                    <div className="h-8 w-20 bg-black rounded-lg" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-red-500 px-8 py-10">
                  <div className="h-6 w-3/4 bg-white/30 rounded mb-3" />
                  <div className="h-4 w-1/2 bg-white/20 rounded mb-6" />
                  <div className="flex gap-2">
                    <div className="h-9 w-24 bg-white rounded-lg" />
                    <div className="h-9 w-20 bg-white/20 rounded-lg border border-white/30" />
                  </div>
                </div>
                <div className="p-5 grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl bg-gray-50 p-3">
                      <div className="h-14 bg-gray-200 rounded-lg mb-2" />
                      <div className="h-2 bg-gray-300 rounded w-full mb-1.5" />
                      <div className="h-2 bg-gray-200 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-black text-white rounded-2xl px-5 py-3 flex items-center gap-3 shadow-xl">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold">Site livré !</div>
                  <div className="text-xs text-gray-400">Il y a 23 heures</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7. TEMPLATES — Squarespace : grille des modèles
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-[#f7f7f7]">
        <div className="sq-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-5">
            <div>
              <p className="sq-label mb-4">Modèles</p>
              <h2 className="sq-heading text-black">
                Prêts à être<br />personnalisés.
              </h2>
            </div>
            <Link href="/templates" className="text-sm font-bold text-black flex items-center gap-1 hover:gap-2 transition-all self-start md:self-end shrink-0">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => <div key={i} className="h-80 rounded-2xl bg-gray-200 animate-pulse" />)}
            </div>
          ) : catalogError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
              <p className="text-sm text-amber-800">{catalogError}</p>
            </div>
          ) : featuredTemplates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center">
              <p className="text-sm text-gray-500">Aucun modèle mis en avant pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredTemplates.map((template) => {
                const features = parseFeatures(template.features);
                const price = typeof template.price === 'string' ? parseInt(template.price) : template.price;
                return (
                  <TemplateCard key={template.id} id={String(template.id)} name={template.name} sectorName={template.sector?.name} price={price} features={features} image={template.full_thumbnail_url} />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          8. PRICING — Fond blanc, cartes épurées Squarespace-style
      ══════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-16 md:py-20 bg-white">
        <div className="sq-container">
          <div className="mb-10 md:mb-12">
            <p className="sq-label mb-4">Tarifs</p>
            <h2 className="sq-heading text-black mb-4">
              {pricing.section_title.split('\n').map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < pricing.section_title.split('\n').length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="text-gray-500 text-lg max-w-md">{pricing.section_description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
            {/* Standard */}
            <div className="rounded-2xl border border-gray-200 p-8">
              <p className="sq-label text-gray-400 mb-5">{pricing.standard.name}</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-5xl font-black text-black tracking-tight">{pricing.standard.price.toLocaleString('fr-FR')}</span>
                <span className="text-gray-400 text-sm font-medium">{pricing.currency_label}</span>
              </div>
              <p className="text-gray-400 text-xs mb-8">{pricing.standard.billing_label}</p>
              <ul className="space-y-3 mb-8">
                {pricing.standard.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-black flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/templates" className="sq-btn sq-btn-outline-black w-full justify-center text-sm">
                {pricing.standard.cta_label}
              </Link>
            </div>

            {/* Premium */}
            <div className="rounded-2xl bg-black text-white p-8 relative overflow-hidden">
              {pricing.premium.badge_label && (
                <span className="absolute top-5 right-5 text-xs font-bold bg-white text-black px-3 py-1 rounded-full">{pricing.premium.badge_label}</span>
              )}
              <p className="sq-label text-gray-500 mb-5">{pricing.premium.name}</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-5xl font-black text-white tracking-tight">{pricing.premium.price.toLocaleString('fr-FR')}</span>
                <span className="text-gray-500 text-sm font-medium">{pricing.currency_label}</span>
              </div>
              <p className="text-gray-500 text-xs mb-8">{pricing.premium.billing_label}</p>
              <ul className="space-y-3 mb-8">
                {pricing.premium.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-white flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/templates" className="sq-btn sq-btn-white w-full justify-center text-sm">
                {pricing.premium.cta_label}
              </Link>
            </div>
          </div>

          <p className="text-gray-400 text-sm mt-8">
            {pricing.custom_note || 'Projet spécifique ?'}{' '}
            <Link href="/contact" className="text-black font-semibold underline underline-offset-2">Contactez-nous.</Link>
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          9. TÉMOIGNAGES — Squarespace : cartes blanches sur fond clair
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-[#f7f7f7]">
        <div className="sq-container">
          <div className="mb-10 md:mb-12">
            <p className="sq-label mb-4">Avis clients</p>
            <h2 className="sq-heading text-black">Ils nous font<br />confiance.</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-72 rounded-2xl bg-white border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  rating={testimonial.rating}
                  content={testimonial.content}
                  reviewerName={testimonial.reviewer_name}
                  reviewerRole={testimonial.reviewer_role}
                  templateName={testimonial.template?.name ?? null}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
              <p className="text-sm text-gray-500">
                Les premiers avis verifies apparaitront ici apres validation par notre equipe.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          10. FAQ — Squarespace : fond blanc, accordéon sobre
      ══════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-16 md:py-20 bg-white">
        <div className="sq-container max-w-3xl">
          <div className="mb-10 md:mb-12">
            <p className="sq-label mb-4">FAQ</p>
            <h2 className="sq-heading text-black">Questions<br />fréquentes.</h2>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : homeFaqs.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {homeFaqs.map((faq) => (
                <div key={faq.id} className="py-6">
                  <button
                    className="w-full text-left flex items-center justify-between gap-4 group"
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  >
                    <span className="font-semibold text-black text-sm group-hover:text-gray-600 transition-colors">{faq.question}</span>
                    <Plus className={cn("w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200", openFaq === faq.id && "rotate-45")} />
                  </button>
                  {openFaq === faq.id && (
                    <p className="text-gray-500 text-sm leading-relaxed mt-4 pr-8 whitespace-pre-line">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center">
              <p className="text-sm text-gray-500">La FAQ publique sera publiée ici dès qu'elle sera configurée dans le backoffice.</p>
            </div>
          )}
          <p className="text-gray-400 text-sm mt-10">
            Une autre question ?{' '}
            <Link href="/contact" className="text-black font-semibold underline underline-offset-2">Écrivez-nous.</Link>
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          11. CTA FINAL — Squarespace : fond noir, titre géant, minimaliste
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-28 bg-black text-white text-center">
        <div className="sq-container">
          <h2 className="sq-display text-white mb-8">
            Prêt à lancer<br />votre site ?
          </h2>
          <p className="text-gray-400 text-xl mb-10 max-w-lg mx-auto leading-relaxed">
            Des centaines d'entrepreneurs ont déjà confié leur présence en ligne à FRILO.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/templates" className="sq-btn sq-btn-white">
              Voir les modèles <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="sq-btn sq-btn-outline-white">
              Parler à un expert
            </Link>
          </div>
          <p className="text-gray-600 text-sm mt-10">
            Dès {startingPriceLabel} · Paiement unique · Satisfait ou remboursé
          </p>
        </div>
      </section>

    </div>
  );
}
