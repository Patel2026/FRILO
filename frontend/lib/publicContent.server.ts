import { cache } from 'react';
import { fallbackPublicContent } from '@/services/public-content.service';
import { normalizePublicContent, PublicContentResponse } from '@/lib/publicContent';

function apiBaseUrl(): string {
  return process.env.API_INTERNAL_URL
    || process.env.NEXT_PUBLIC_API_URL
    || 'http://localhost:8000/api';
}

export const getPublicContentServer = cache(async (pageKey: string): Promise<PublicContentResponse> => {
  const fallback = fallbackPublicContent(pageKey);

  try {
    const response = await fetch(`${apiBaseUrl()}/public/content/${encodeURIComponent(pageKey)}`, {
      headers: {
        Accept: 'application/json',
      },
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      return fallback;
    }

    return normalizePublicContent(await response.json(), fallback);
  } catch {
    return fallback;
  }
});
