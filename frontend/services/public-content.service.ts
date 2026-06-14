import { HOME_PUBLIC_CONTENT_FALLBACK } from '@/content/home.fallback';
import { normalizePublicContent, PublicContentResponse } from '@/lib/publicContent';
import api from './api';

const FALLBACK_BY_PAGE: Record<string, PublicContentResponse> = {
  home: HOME_PUBLIC_CONTENT_FALLBACK,
};

export function fallbackPublicContent(pageKey: string): PublicContentResponse {
  return FALLBACK_BY_PAGE[pageKey] ?? HOME_PUBLIC_CONTENT_FALLBACK;
}

export const publicContentService = {
  async getPublicContent(pageKey: string): Promise<PublicContentResponse> {
    const fallback = fallbackPublicContent(pageKey);
    const response = await api.get(`/public/content/${encodeURIComponent(pageKey)}`);

    return normalizePublicContent(response.data, fallback);
  },
};
