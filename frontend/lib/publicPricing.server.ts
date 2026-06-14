import 'server-only';

import type { PublicPricingConfig } from '@/services/business.service';
import { DEFAULT_PUBLIC_PRICING, normalizePublicPricing } from '@/lib/publicPricing';

function getApiBaseUrl(): string {
  return process.env.API_INTERNAL_URL
    || process.env.NEXT_PUBLIC_API_URL
    || 'http://localhost:8000/api';
}

export async function getPublicPricingServer(): Promise<PublicPricingConfig> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/public/pricing`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return DEFAULT_PUBLIC_PRICING;
    }

    const pricing = await response.json() as Partial<PublicPricingConfig>;

    return normalizePublicPricing(pricing);
  } catch {
    return DEFAULT_PUBLIC_PRICING;
  }
}
