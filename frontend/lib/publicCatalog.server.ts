import { cache } from 'react';
import type { Sector, Template } from '@/services/business.service';

function apiBaseUrl(): string {
  return process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
}

async function fetchPublicArray<T>(path: string): Promise<T[]> {
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      headers: {
        Accept: 'application/json',
      },
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data as T[] : [];
  } catch {
    return [];
  }
}

export const getPublicSectorsServer = cache(async (): Promise<Sector[]> => {
  return fetchPublicArray<Sector>('/sectors');
});

export const getPublicTemplatesServer = cache(async (sectorSlug?: string): Promise<Template[]> => {
  const query = sectorSlug ? `?sector_slug=${encodeURIComponent(sectorSlug)}` : '';
  return fetchPublicArray<Template>(`/templates${query}`);
});

export const getPublicTemplateServer = cache(async (id: string): Promise<Template | null> => {
  try {
    const response = await fetch(`${apiBaseUrl()}/templates/${encodeURIComponent(id)}`, {
      headers: {
        Accept: 'application/json',
      },
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json() as Template;
  } catch {
    return null;
  }
});
