"use client";

import { useEffect, useState } from 'react';
import { DEFAULT_PUBLIC_PRICING, normalizePublicPricing } from '@/lib/publicPricing';
import { businessService, PublicPricingConfig } from '@/services/business.service';

let cachedPricing: PublicPricingConfig = DEFAULT_PUBLIC_PRICING;
let hasLoadedPricing = false;
let inFlightPricing: Promise<PublicPricingConfig> | null = null;

function loadPublicPricing(): Promise<PublicPricingConfig> {
  if (hasLoadedPricing) {
    return Promise.resolve(cachedPricing);
  }

  if (!inFlightPricing) {
    inFlightPricing = businessService.getPublicPricing()
      .then((pricing) => {
        cachedPricing = normalizePublicPricing(pricing);
        hasLoadedPricing = true;
        return cachedPricing;
      })
      .catch(() => {
        hasLoadedPricing = true;
        return cachedPricing;
      })
      .finally(() => {
        inFlightPricing = null;
      });
  }

  return inFlightPricing;
}

export function usePublicPricing() {
  const [pricing, setPricing] = useState<PublicPricingConfig>(cachedPricing);
  const [loading, setLoading] = useState(!hasLoadedPricing);

  useEffect(() => {
    let active = true;

    loadPublicPricing()
      .then((nextPricing) => {
        if (active) {
          setPricing(nextPricing);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { pricing, loading };
}
