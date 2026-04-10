"use client";

import { useCallback, useEffect, useState } from 'react';
import {
  TEMPLATE_COLLECTIONS_CHANGED_EVENT,
  clearCompareTemplateIds,
  getCompareTemplateIds,
  getFavoriteTemplateIds,
  getMaxCompareItems,
  setCompareTemplateIds,
  toggleCompareTemplateId,
  toggleFavoriteTemplateId,
  type ToggleCompareResult,
} from '@/lib/templateCollections';

export function useTemplateCollections() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => getFavoriteTemplateIds());
  const [compareIds, setCompareIds] = useState<number[]>(() => getCompareTemplateIds());

  const syncCollections = useCallback(() => {
    setFavoriteIds(getFavoriteTemplateIds());
    setCompareIds(getCompareTemplateIds());
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith('frilo.templates.')) {
        syncCollections();
      }
    };

    const onCollectionsChanged = () => {
      syncCollections();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(TEMPLATE_COLLECTIONS_CHANGED_EVENT, onCollectionsChanged);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(TEMPLATE_COLLECTIONS_CHANGED_EVENT, onCollectionsChanged);
    };
  }, [syncCollections]);

  const toggleFavorite = useCallback((templateId: number): boolean => {
    const nowFavorite = toggleFavoriteTemplateId(templateId);
    syncCollections();
    return nowFavorite;
  }, [syncCollections]);

  const toggleCompare = useCallback((templateId: number): ToggleCompareResult => {
    const result = toggleCompareTemplateId(templateId);
    syncCollections();
    return result;
  }, [syncCollections]);

  const clearCompare = useCallback(() => {
    clearCompareTemplateIds();
    syncCollections();
  }, [syncCollections]);

  const replaceCompare = useCallback((ids: number[]) => {
    setCompareTemplateIds(ids);
    syncCollections();
  }, [syncCollections]);

  return {
    favoriteIds,
    compareIds,
    isFavorite: (templateId: number) => favoriteIds.includes(templateId),
    isCompared: (templateId: number) => compareIds.includes(templateId),
    toggleFavorite,
    toggleCompare,
    clearCompare,
    replaceCompare,
    maxCompareItems: getMaxCompareItems(),
  };
}
