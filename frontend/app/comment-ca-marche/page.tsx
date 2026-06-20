import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PublicPageShell } from '@/components/public/PublicPageShell';

const STORY_SECTIONS = [
  {
    title: 'Vous choisissez une base proche de votre activité.',
    description:
      'Restaurant, BTP, santé, immobilier ou service : vous partez d’un univers déjà structuré, puis FRILO l’adapte à votre réalité.',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'FRILO transforme vos informations en page claire.',
    description:
      'Vos textes, photos, services, horaires et contacts remplacent les exemples. Le rendu doit parler à vos clients, pas à des techniciens.',
    image: '/image/client-satisfait-frilo.jpg',
  },
  {
    title: 'Vous gardez le style et les options sous contrôle.',
    description:
      'Avant de commander, vous voyez le modèle, la direction visuelle, les options utiles et le total. Rien n’est caché au moment de payer.',
    image:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80',
  },
];

const OUTCOMES = [
  'Une activité comprise rapidement',
  'Des contacts visibles',
  'Un rendu vérifié sur mobile',
  'Un lien prêt à partager',
];

const REASSURANCE_ITEMS = [
  {
    title: 'Pas besoin d’avoir tous les contenus.',
    description:
      'Vous pouvez commencer avec l’essentiel. FRILO vous aide ensuite à compléter ce qui manque.',
  },
  {
    title: 'Pas besoin de savoir concevoir un site.',
    description:
      'Vous choisissez une base. Notre équipe s’occupe de rendre vos informations lisibles et crédibles.',
  },
  {
    title: 'Pas besoin de deviner le prix.',
    description:
      'Le total reste visible avant validation, avec les options choisies et ce qui est déjà inclus.',
  },
];

export default function CommentCaMarchePage() {
  return (
    <PublicPageShell className="bg-white">
      <section className="bg-white px-5 pb-14 pt-28 md:px-8 md:pb-20 md:pt-32">
        <div className="mx-auto max-w-[1360px]">
          <div className="grid gap-10 border-b border-black pb-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="text-sm font-black text-[#2563eb]">Comment ça marche</p>
              <h1 className="mt-5 max-w-5xl text-balance text-[2.55rem] font-black leading-[1.03] tracking-[-0.015em] text-black sm:text-[3rem] md:text-[3.35rem] lg:text-[3.85rem] xl:text-[4.2rem]">
                Votre site peut être clair, même si vous partez de zéro.
              </h1>
            </div>
            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-pretty text-lg leading-8 text-slate-700">
                FRILO part d’un modèle proche de votre activité, récupère vos informations, adapte le rendu et vous livre un site prêt à partager.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/templates"
                  className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[#2563eb]"
                >
                  Choisir un modèle
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/contact?subject=Orientation%20FRILO"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-black text-black transition-colors hover:border-black"
                >
                  Demander une orientation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 pb-14 md:px-8 md:pb-20">
        <div className="mx-auto grid max-w-[1360px] gap-8">
          {STORY_SECTIONS.map((item, index) => (
            <article
              key={item.title}
              className="grid overflow-hidden border border-slate-200 bg-white lg:grid-cols-2"
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : undefined}>
                <div
                  className="min-h-[360px] bg-cover bg-center md:min-h-[520px]"
                  style={{ backgroundImage: `url(${item.image})` }}
                  aria-hidden="true"
                />
              </div>
              <div className="flex min-h-[360px] flex-col justify-center p-7 md:p-10 lg:p-12">
                <p className="text-sm font-black text-[#2563eb]">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h2 className="mt-5 max-w-2xl text-balance text-4xl font-black leading-[1.02] tracking-[-0.02em] text-black md:text-5xl">
                  {item.title}
                </h2>
                <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-slate-700 md:text-lg md:leading-8">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-black px-5 py-14 text-white md:px-8 md:py-20">
        <div className="mx-auto max-w-[1360px]">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h2 className="max-w-3xl text-balance text-4xl font-black leading-[1.02] tracking-[-0.02em] md:text-5xl">
                Le résultat doit être simple à comprendre.
              </h2>
              <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-white/65">
                Un visiteur doit savoir ce que vous faites, pourquoi vous contacter et comment passer à l’action.
              </p>
            </div>
            <div className="grid border-y border-white/25 md:grid-cols-2">
              {OUTCOMES.map((item) => (
                <div
                  key={item}
                  className="border-b border-white/20 py-6 md:border-r md:px-6 md:last:border-r-0"
                >
                  <p className="text-xl font-black leading-tight text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1360px]">
          <div className="grid gap-8 border-y border-black py-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h2 className="max-w-2xl text-balance text-4xl font-black leading-[1.02] tracking-[-0.02em] md:text-5xl">
                Vous n’avez pas besoin d’avoir tout prêt avant de commencer.
              </h2>
            </div>
            <div className="grid gap-0 border-t border-slate-200 lg:border-t-0">
              {REASSURANCE_ITEMS.map((item) => (
                <div key={item.title} className="border-b border-slate-200 py-6 last:border-b-0">
                  <h3 className="text-xl font-black leading-tight text-black">{item.title}</h3>
                  <p className="mt-2 max-w-2xl text-base leading-7 text-slate-700">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 pb-16 md:px-8 md:pb-20">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-7 bg-black p-7 text-white md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="max-w-3xl text-balance text-3xl font-black leading-tight md:text-4xl">
              Prêt à partir d’une base claire ?
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/65">
              Choisissez un modèle ou décrivez votre activité. FRILO vous aide à avancer sans compliquer les choses.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/templates"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-black transition-colors hover:bg-[#2563eb] hover:text-white"
            >
              Voir les modèles
            </Link>
            <Link
              href="/contact?subject=Orientation%20FRILO"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-black text-white transition-colors hover:bg-white hover:text-black"
            >
              Demander une orientation
            </Link>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
