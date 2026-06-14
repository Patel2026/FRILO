"use client";

import { useEffect, useState } from 'react';
import { PublicContentResponse } from '@/lib/publicContent';
import { fallbackPublicContent, publicContentService } from '@/services/public-content.service';

const contentCache = new Map<string, PublicContentResponse>();
const contentRequests = new Map<string, Promise<PublicContentResponse>>();

function loadPublicContent(pageKey: string): Promise<PublicContentResponse> {
  const cached = contentCache.get(pageKey);
  if (cached) {
    return Promise.resolve(cached);
  }

  const inFlight = contentRequests.get(pageKey);
  if (inFlight) {
    return inFlight;
  }

  const request = publicContentService.getPublicContent(pageKey)
    .then((content) => {
      contentCache.set(pageKey, content);
      return content;
    })
    .catch(() => {
      const fallback = fallbackPublicContent(pageKey);
      contentCache.set(pageKey, fallback);
      return fallback;
    })
    .finally(() => {
      contentRequests.delete(pageKey);
    });

  contentRequests.set(pageKey, request);
  return request;
}

export function usePublicContent(pageKey: string) {
  const [state, setState] = useState(() => {
    const cachedContent = contentCache.get(pageKey);

    return {
      pageKey,
      content: cachedContent ?? fallbackPublicContent(pageKey),
      loaded: Boolean(cachedContent),
    };
  });

  const cachedContent = contentCache.get(pageKey);
  const content = state.pageKey === pageKey
    ? state.content
    : cachedContent ?? fallbackPublicContent(pageKey);
  const loading = state.pageKey === pageKey
    ? !state.loaded
    : !cachedContent;

  useEffect(() => {
    let active = true;

    loadPublicContent(pageKey)
      .then((nextContent) => {
        if (active) {
          setState({
            pageKey,
            content: nextContent,
            loaded: true,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [pageKey]);

  return {
    content,
    loading,
  };
}
