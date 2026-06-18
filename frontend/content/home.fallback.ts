import type { PublicContentResponse } from '@/lib/publicContent';

export const HOME_PUBLIC_CONTENT_FALLBACK: PublicContentResponse = {
  page: {
    key: 'home',
    name: 'Accueil',
    route_pattern: '/',
    seo: {
      title: 'FRILO - Votre site vitrine livré rapidement',
      description: 'Choisissez un modèle, envoyez vos informations et recevez un site clair pour présenter votre activité.',
      is_indexable: true,
    },
  },
  sections: [
    {
      key: 'home.hero',
      name: 'Hero',
      position: 10,
      renderer: 'home.hero',
      content: {
        eyebrow: 'Pas besoin de savoir créer un site',
        headline: 'Envoyez vos infos. FRILO prépare votre site.',
        description: 'Vous choisissez un modèle, vous ajoutez votre activité, vos photos et vos contacts. Vous payez simplement, puis vous recevez votre site prêt à partager.',
        primary_cta: {
          label: 'Commencer avec un modèle',
          url: '/templates',
        },
        secondary_cta: {
          label: 'Voir les étapes',
          url: '/#how-it-works',
        },
      },
    },
    {
      key: 'home.models_intro',
      name: 'Introduction modèles',
      position: 20,
      renderer: 'home.models-intro',
      content: {
        eyebrow: 'Choisissez votre activité',
        headline: 'Un modèle proche de votre métier, FRILO adapte le reste.',
        description: "Restaurant, BTP, immobilier, service, école ou commerce : partez d'une base claire, ajoutez vos informations, puis notre équipe prépare votre site.",
        cta: {
          label: 'Voir les modèles par activité',
          url: '/templates',
        },
      },
    },
    {
      key: 'home.benefits',
      name: 'Avantages',
      position: 30,
      renderer: 'home.benefits',
      content: {
        eyebrow: 'Avantages',
        headline: 'Ce que FRILO vous fait gagner.',
        description: 'Choisissez un modèle. FRILO ajoute vos informations et prépare un site prêt à partager.',
        items: [
          {
            title: 'Moins de temps perdu',
            description: "Vous donnez l'essentiel. FRILO organise le reste.",
          },
          {
            title: 'Plus clair pour vos clients',
            description: 'Ils voient vos services, vos photos et vos contacts sans chercher.',
          },
          {
            title: 'Un contact plus facile',
            description: 'WhatsApp, téléphone, adresse ou demande de devis sont au bon endroit.',
          },
          {
            title: 'Un suivi après livraison',
            description: 'Vous suivez votre commande, votre paiement et vos retouches au même endroit.',
          },
        ],
        closing_copy: 'Votre site sert à quelque chose : présenter votre activité et recevoir des demandes.',
        cta: {
          label: 'Commencer avec un modèle',
          url: '/templates',
        },
      },
    },
    {
      key: 'home.process',
      name: 'Processus',
      position: 40,
      renderer: 'home.process',
      content: {
        eyebrow: 'Comment ça se passe',
        headline: 'De vos infos au site livré.',
        description: "Vous n'avez pas besoin de tout préparer avant de commencer. FRILO vous guide étape par étape.",
        customer_steps: [
          {
            title: 'Vous choisissez un modèle',
            description: 'Une base proche de votre activité.',
          },
          {
            title: 'Vous envoyez vos infos',
            description: 'Nom, services, photos et contacts.',
          },
          {
            title: 'Vous payez simplement',
            description: 'Mobile Money ou carte, en FCFA.',
          },
        ],
        frilo_steps: [
          {
            title: 'FRILO adapte le site',
            description: 'Vos contenus remplacent les exemples.',
          },
          {
            title: 'FRILO vérifie le rendu',
            description: 'Pages, mobile, liens et contacts.',
          },
          {
            title: 'FRILO vous livre le lien',
            description: 'Votre site est prêt à partager.',
          },
        ],
        result_copy: 'Résultat : votre site montre clairement ce que vos clients ont besoin de savoir.',
        cta: {
          label: 'Commencer',
          url: '/templates',
        },
      },
    },
    {
      key: 'home.pricing',
      name: 'Tarifs',
      position: 50,
      renderer: 'home.pricing',
      content: {
        eyebrow: 'Tarifs',
        headline: 'Un site essentiel. Des options selon vos besoins.',
        description: 'Le site essentiel est compris dans le prix de départ. Pendant la commande, vous choisissez les fonctions utiles à votre activité et voyez le total avant de payer.',
        included_items: ['Domaine 1 an', 'Hébergement 1 an', 'SSL', 'Version mobile', 'Mise en ligne', 'Retouches'],
        package_eyebrow: 'Le site essentiel',
        package_description: 'Tout le nécessaire pour présenter clairement votre activité en ligne.',
        options_eyebrow: 'Selon vos besoins',
        options_headline: 'Des options au choix pendant la commande.',
        options_description: "D'autres options sont proposées selon votre projet : page supplémentaire, réservation ou devis, aide à la rédaction et SEO local.",
        payment_note: 'Paiement en FCFA par Mobile Money ou carte. Le prix final est confirmé avant paiement.',
        primary_cta: {
          label: 'Choisir mon modèle',
          url: '/templates',
        },
        secondary_cta: {
          label: 'Contactez-nous',
          url: '/contact',
        },
      },
    },
    {
      key: 'home.testimonials_intro',
      name: 'Introduction témoignages',
      position: 60,
      renderer: 'home.testimonials-intro',
      content: {
        eyebrow: 'Avis',
        headline: 'La confiance se joue dans les détails.',
        empty_state: "Les premiers retours clients seront affichés ici après validation. L'espace reste volontairement sobre pour ne pas inventer de preuve.",
      },
    },
    {
      key: 'home.sectors_intro',
      name: 'Introduction secteurs',
      position: 70,
      renderer: 'home.sectors-intro',
      content: {
        eyebrow: 'Secteurs',
        headline: 'Trouvez le modèle adapté à votre activité.',
        cta: {
          label: 'Tous les secteurs',
          url: '/secteurs',
        },
      },
    },
    {
      key: 'home.faq_intro',
      name: 'Introduction FAQ',
      position: 80,
      renderer: 'home.faq-intro',
      content: {
        eyebrow: 'Questions',
        headline: 'Les réponses avant de commander.',
        description: 'Délais, prix, contenu, propriété du site : les points sensibles doivent être clairs avant paiement.',
        cta: {
          label: 'Poser une question',
          url: '/contact',
        },
      },
    },
    {
      key: 'home.closing_cta',
      name: 'Appel final',
      position: 90,
      renderer: 'home.closing-cta',
      content: {
        eyebrow: "Prêt quand vous l'êtes",
        headline: "Donnez à votre entreprise le site qu'elle mérite.",
        description: "Parcourez les modèles, choisissez celui qui ressemble à votre ambition, puis laissez FRILO l'adapter.",
        primary_cta: {
          label: 'Voir les modèles',
          url: '/templates',
        },
        secondary_cta: {
          label: 'Parler à un expert',
          url: '/contact',
        },
      },
    },
  ],
  blocks: [],
};
