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
  const [content, setContent] = useState<PublicContentResponse>(() => (
    contentCache.get(pageKey) ?? fallbackPublicContent(pageKey)
  ));
  const [loading, setLoading] = useState(!contentCache.has(pageKey));

  useEffect(() => {
    let active = true;

    setLoading(!contentCache.has(pageKey));
    loadPublicContent(pageKey)
      .then((nextContent) => {
        if (active) {
          setContent(nextContent);
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
  }, [pageKey]);

  return {
    content,
    loading,
  };
}
