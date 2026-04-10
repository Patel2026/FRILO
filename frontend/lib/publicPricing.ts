import type { PublicPricingConfig, PublicPricingPlan } from '@/services/business.service';

export const DEFAULT_PUBLIC_PRICING: PublicPricingConfig = {
  currency_label: 'FCFA',
  section_title: 'Simple et transparent.',
  section_description: "Un prix unique, tout inclus. Pas d'abonnement.",
  custom_note: 'Projet spécifique ?',
  starting_price: 50000,
  standard: {
    name: 'Standard',
    price: 50000,
    billing_label: 'Paiement unique',
    cta_label: 'Choisir',
    features: [
      'Modèle professionnel',
      'Intégration contenu',
      'Mise en ligne',
      'Responsive mobile',
      '1 révision',
      '30j de support',
    ],
  },
  premium: {
    badge_label: 'Populaire',
    name: 'Premium',
    price: 75000,
    billing_label: 'Paiement unique',
    cta_label: 'Choisir',
    features: [
      'Tout dans Standard',
      'Design avancé',
      'Formulaire sécurisé',
      'Galerie optimisée',
      '2 révisions',
      '60j de support',
      'Formation incluse',
    ],
  },
};

export function formatPublicPrice(amount: number, currencyLabel: string): string {
  return `${amount.toLocaleString('fr-FR')} ${currencyLabel}`;
}

export function normalizePublicPricing(input?: Partial<PublicPricingConfig> | null): PublicPricingConfig {
  const standard: Partial<PublicPricingPlan> = input?.standard ?? {};
  const premium: Partial<PublicPricingPlan> = input?.premium ?? {};

  return {
    currency_label: input?.currency_label ?? DEFAULT_PUBLIC_PRICING.currency_label,
    section_title: input?.section_title ?? DEFAULT_PUBLIC_PRICING.section_title,
    section_description: input?.section_description ?? DEFAULT_PUBLIC_PRICING.section_description,
    custom_note: input?.custom_note ?? DEFAULT_PUBLIC_PRICING.custom_note,
    starting_price: input?.starting_price ?? standard.price ?? DEFAULT_PUBLIC_PRICING.starting_price,
    standard: {
      name: standard.name ?? DEFAULT_PUBLIC_PRICING.standard.name,
      price: standard.price ?? DEFAULT_PUBLIC_PRICING.standard.price,
      billing_label: standard.billing_label ?? DEFAULT_PUBLIC_PRICING.standard.billing_label,
      cta_label: standard.cta_label ?? DEFAULT_PUBLIC_PRICING.standard.cta_label,
      features: Array.isArray(standard.features) && standard.features.length > 0
        ? standard.features
        : DEFAULT_PUBLIC_PRICING.standard.features,
      badge_label: standard.badge_label ?? DEFAULT_PUBLIC_PRICING.standard.badge_label,
    },
    premium: {
      name: premium.name ?? DEFAULT_PUBLIC_PRICING.premium.name,
      price: premium.price ?? DEFAULT_PUBLIC_PRICING.premium.price,
      billing_label: premium.billing_label ?? DEFAULT_PUBLIC_PRICING.premium.billing_label,
      cta_label: premium.cta_label ?? DEFAULT_PUBLIC_PRICING.premium.cta_label,
      features: Array.isArray(premium.features) && premium.features.length > 0
        ? premium.features
        : DEFAULT_PUBLIC_PRICING.premium.features,
      badge_label: premium.badge_label ?? DEFAULT_PUBLIC_PRICING.premium.badge_label,
    },
  };
}
