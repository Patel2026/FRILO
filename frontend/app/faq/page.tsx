"use client"

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  CreditCard,
  LayoutTemplate,
  LifeBuoy,
  MonitorCheck,
  Search,
  Send,
  Sparkles,
  Timer,
} from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import { businessService, FaqItem } from '@/services/business.service';
import { cn } from '@/lib/utils';

type HelpCategory = {
  id: string;
  title: string;
  description: string;
  icon: typeof LayoutTemplate;
  keywords: string[];
  links: string[];
};

const FALLBACK_FAQS: FaqItem[] = [
  {
    id: -1,
    question: 'Combien de temps faut-il pour recevoir mon site ?',
    answer: "FRILO prépare une première version en 48h ouvrées après réception des informations nécessaires. Si tout n'est pas prêt, vous pouvez commencer avec l'essentiel puis compléter avec notre équipe.",
    sort_order: 10,
  },
  {
    id: -2,
    question: 'Comment choisir le bon modèle ?',
    answer: "Choisissez le modèle le plus proche de votre activité. FRILO remplace ensuite les exemples par vos textes, vos photos, vos contacts et vos services.",
    sort_order: 20,
  },
  {
    id: -3,
    question: "Que comprend le prix de départ ?",
    answer: "Le prix de départ comprend l'adaptation du modèle, la version mobile, la mise en ligne et le suivi client. Les options payantes sont choisies avant validation de la commande.",
    sort_order: 30,
  },
  {
    id: -4,
    question: 'Puis-je commander si je n’ai pas encore toutes mes photos ?',
    answer: "Oui. Vous pouvez transmettre les éléments disponibles au moment de la commande. FRILO vous guide ensuite pour compléter les images, le logo ou les informations manquantes.",
    sort_order: 40,
  },
  {
    id: -5,
    question: 'Le site sera-t-il adapté au mobile ?',
    answer: "Oui. Les modèles FRILO sont prévus pour ordinateur, tablette et mobile. Le rendu est vérifié avant la livraison.",
    sort_order: 50,
  },
  {
    id: -6,
    question: 'Comment suivre ma commande après paiement ?',
    answer: "Votre espace client regroupe la commande, le paiement, les informations envoyées et les étapes de livraison. Vous savez où en est le projet sans multiplier les messages.",
    sort_order: 60,
  },
];

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'commander',
    title: 'Commander un site',
    description: 'Choisir une base, envoyer les infos et valider la commande.',
    icon: Sparkles,
    keywords: ['commande', 'commander', 'choisir', 'activité', 'informations', 'contenus'],
    links: [
      'Comment choisir le bon modèle ?',
      'Puis-je commander sans toutes mes photos ?',
      'Que se passe-t-il après la commande ?',
    ],
  },
  {
    id: 'modeles',
    title: 'Modèles et secteurs',
    description: 'Comprendre les modèles, les secteurs et l’adaptation FRILO.',
    icon: LayoutTemplate,
    keywords: ['modèle', 'modèles', 'secteur', 'activité', 'template', 'adaptation'],
    links: [
      'Le modèle doit-il correspondre exactement à mon métier ?',
      'FRILO peut-il adapter les textes du modèle ?',
      'Puis-je demander une orientation ?',
    ],
  },
  {
    id: 'prix',
    title: 'Prix et options',
    description: 'Voir ce qui est inclus et ajouter seulement ce qui sert.',
    icon: CreditCard,
    keywords: ['prix', 'paiement', 'option', 'options', 'fcfa', 'budget', 'payer'],
    links: [
      'Que comprend le prix de départ ?',
      'Les options sont-elles obligatoires ?',
      'Quand le total est-il confirmé ?',
    ],
  },
  {
    id: 'livraison',
    title: 'Livraison',
    description: 'Délais, vérification du rendu et mise en ligne.',
    icon: Timer,
    keywords: ['livraison', '48h', 'délai', 'mise en ligne', 'recevoir', 'rendu'],
    links: [
      'Combien de temps faut-il pour recevoir mon site ?',
      'Le rendu mobile est-il vérifié ?',
      'Comment recevoir le lien final ?',
    ],
  },
  {
    id: 'espace-client',
    title: 'Espace client',
    description: 'Suivre la commande, le paiement et les informations envoyées.',
    icon: MonitorCheck,
    keywords: ['client', 'dashboard', 'suivre', 'commande', 'paiement', 'espace'],
    links: [
      'Comment suivre ma commande après paiement ?',
      'Où retrouver mes informations ?',
      'Puis-je compléter mes contenus plus tard ?',
    ],
  },
  {
    id: 'support',
    title: 'Support FRILO',
    description: 'Demander une orientation ou poser une question avant de payer.',
    icon: LifeBuoy,
    keywords: ['support', 'contact', 'aide', 'question', 'orientation', 'équipe'],
    links: [
      'Comment demander une orientation ?',
      'Comment transmettre mes contenus ?',
      'Qui contacter avant de commander ?',
    ],
  },
];

const QUICK_LINKS = [
  { label: 'Choisir un modèle', href: '/templates' },
  { label: 'Voir les secteurs', href: '/secteurs' },
  { label: 'Contacter FRILO', href: '/contact?subject=Question%20FAQ' },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function faqMatchesTopic(faq: FaqItem, category: HelpCategory) {
  const content = normalize(`${faq.question} ${faq.answer}`);
  return category.keywords.some((keyword) => content.includes(normalize(keyword)))
    || category.links.some((link) => content.includes(normalize(link)));
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadHint, setLoadHint] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    async function loadFaqs() {
      try {
        setLoadHint(null);
        const data = await businessService.getFaqs();
        setFaqs(data);
        setOpen((data[0] ?? FALLBACK_FAQS[0]).id);
      } catch {
        setFaqs([]);
        setLoadHint("Les réponses de base sont affichées pendant que l’aide publiée se recharge.");
        setOpen(FALLBACK_FAQS[0].id);
      } finally {
        setLoading(false);
      }
    }

    loadFaqs();
  }, []);

  const publishedFaqs = faqs.length > 0 ? faqs : FALLBACK_FAQS;
  const selectedCategory = HELP_CATEGORIES.find((category) => category.id === activeCategory);
  const normalizedQuery = normalize(query.trim());

  const visibleCategories = useMemo(() => {
    if (!normalizedQuery) {
      return HELP_CATEGORIES;
    }

    return HELP_CATEGORIES.filter((category) => {
      const content = normalize(`${category.title} ${category.description} ${category.links.join(' ')} ${category.keywords.join(' ')}`);
      return content.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const visibleFaqs = useMemo(() => {
    const queryCategories = normalizedQuery
      ? HELP_CATEGORIES.filter((category) => {
          const content = normalize(`${category.title} ${category.description} ${category.links.join(' ')} ${category.keywords.join(' ')}`);
          return content.includes(normalizedQuery);
        })
      : [];

    return publishedFaqs.filter((faq) => {
      const faqContent = normalize(`${faq.question} ${faq.answer}`);
      const matchesQuery = !normalizedQuery
        || faqContent.includes(normalizedQuery)
        || queryCategories.some((category) => faqMatchesTopic(faq, category));
      const matchesCategory = !selectedCategory || faqMatchesTopic(faq, selectedCategory);
      return matchesQuery && matchesCategory;
    });
  }, [normalizedQuery, publishedFaqs, selectedCategory]);

  return (
    <PublicPageShell className="bg-white">
      <section className="bg-white px-5 pb-8 pt-28 md:px-8 md:pb-10 md:pt-32">
        <div className="mx-auto max-w-[1360px] border-b border-black pb-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-black text-[#2563eb]">Centre d’aide FRILO</p>
              <h1 className="mt-4 max-w-3xl text-balance text-4xl font-black leading-[1.04] tracking-[-0.02em] text-black md:text-5xl xl:text-6xl">
                Trouvez rapidement une réponse avant de commander.
              </h1>
            </div>
            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-pretty text-base leading-7 text-slate-700 md:text-lg">
                Recherchez une question, parcourez les sujets utiles ou contactez FRILO si vous avez besoin d’une orientation avant paiement.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-black text-slate-950 transition-colors hover:border-black hover:bg-black hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <label className="mt-9 flex min-h-[72px] items-center gap-4 border border-black bg-white px-5 focus-within:border-[#2563eb] md:px-6">
            <Search className="h-6 w-6 shrink-0 text-slate-500" />
            <span className="sr-only">Rechercher dans le centre d’aide</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher par mot-clé : paiement, délai, modèle..."
              className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-black outline-none placeholder:text-slate-500 md:text-lg"
            />
          </label>
        </div>
      </section>

      <section className="bg-white px-5 py-10 md:px-8 md:py-12" aria-labelledby="help-topics-title">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 id="help-topics-title" className="text-2xl font-black leading-tight text-black md:text-3xl">
                Parcourir par sujet
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Choisissez un sujet pour afficher les réponses liées plus bas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setQuery('');
              }}
              className={cn(
                "w-fit rounded-full border px-5 py-3 text-sm font-black transition-colors",
                activeCategory === 'all' && query === ''
                  ? "border-black bg-black text-white"
                  : "border-slate-300 text-slate-950 hover:border-black"
              )}
            >
              Tout afficher
            </button>
          </div>

          <div className="grid border-l border-t border-slate-200 sm:grid-cols-2 xl:grid-cols-3">
            {visibleCategories.map((category) => {
              const Icon = category.icon;
              const active = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category.id);
                    setQuery('');
                    document.getElementById('faq-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={cn(
                    "group flex min-h-[270px] flex-col border-b border-r border-slate-200 p-6 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2",
                    active ? "bg-slate-950 text-white" : "bg-white text-black hover:bg-slate-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center border",
                      active ? "border-white/30 bg-white text-black" : "border-slate-200 bg-slate-50 text-slate-950"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="mt-6 text-xl font-black leading-tight">{category.title}</span>
                  <span className={cn("mt-3 text-sm leading-6", active ? "text-white/68" : "text-slate-600")}>
                    {category.description}
                  </span>
                  <span className="mt-auto pt-6">
                    {category.links.slice(0, 2).map((link) => (
                      <span
                        key={link}
                        className={cn(
                          "block border-t py-3 text-sm font-semibold",
                          active ? "border-white/15 text-white/80" : "border-slate-200 text-slate-700"
                        )}
                      >
                        {link}
                      </span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          {visibleCategories.length === 0 && (
            <div className="border border-dashed border-slate-300 px-6 py-10 text-center">
              <p className="font-black text-black">Aucun sujet ne correspond à cette recherche.</p>
              <p className="mt-2 text-sm text-slate-600">Essayez “paiement”, “modèle”, “livraison” ou contactez FRILO.</p>
            </div>
          )}
        </div>
      </section>

      <section id="faq-results" className="bg-white px-5 py-10 md:px-8 md:py-12" aria-labelledby="faq-results-title">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-5 flex flex-col gap-2 border-t border-black pt-6 md:flex-row md:items-end md:justify-between">
            <h2 id="faq-results-title" className="text-2xl font-black leading-tight text-black md:text-3xl">
              Questions fréquentes
            </h2>
            <p className="text-sm font-black text-[#e60000]">{visibleFaqs.length} réponse{visibleFaqs.length > 1 ? 's' : ''}</p>
          </div>
          {loadHint && <p className="mb-5 max-w-3xl text-xs leading-5 text-slate-600">{loadHint}</p>}
          <div className="bg-white">
            {loading ? (
              <div className="border-y border-black">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="border-b border-slate-200 p-6 last:border-b-0">
                    <div className="h-5 w-2/3 animate-pulse bg-slate-200" />
                    <div className="mt-4 h-4 w-full animate-pulse bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : visibleFaqs.length === 0 ? (
              <div className="border-y border-black px-6 py-12">
                <h3 className="text-2xl font-black text-black">Aucune réponse trouvée.</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Reformulez votre recherche ou envoyez-nous votre question. FRILO vous répondra avec une orientation claire.
                </p>
                <Link
                  href="/contact?subject=Question%20FAQ"
                  className="mt-6 inline-flex items-center rounded-full bg-black px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[#e60000]"
                >
                  Poser une question <Send className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="border-y border-black">
                {visibleFaqs.map((faq) => (
                  <article key={faq.id} className="border-b border-slate-200 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setOpen(open === faq.id ? null : faq.id)}
                      className="group flex w-full items-start justify-between gap-5 px-5 py-5 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-inset md:px-7"
                      aria-expanded={open === faq.id}
                    >
                      <span className="max-w-3xl text-base font-black leading-snug text-black md:text-lg">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          "mt-1 h-5 w-5 shrink-0 text-slate-500 transition-transform",
                          open === faq.id && "rotate-180 text-[#e60000]"
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-200",
                        open === faq.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-3xl px-5 pb-6 text-sm leading-7 text-slate-700 md:px-7 whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-10 md:px-8 md:py-12">
        <div className="mx-auto grid max-w-[1360px] gap-6 border-y border-black py-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-3xl font-black leading-tight text-black md:text-4xl">Besoin d’une réponse précise ?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
              Décrivez votre activité, votre délai ou votre blocage. FRILO vous oriente avant la commande.
            </p>
          </div>
          <Link
            href="/contact?subject=Question%20FAQ"
            className="inline-flex w-fit items-center justify-center rounded-full bg-black px-7 py-4 text-sm font-black text-white transition-colors hover:bg-[#e60000]"
          >
            Contacter FRILO <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
