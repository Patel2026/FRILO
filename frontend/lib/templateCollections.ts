export type ToggleCompareResult = 'added' | 'removed' | 'max_reached';

export const TEMPLATE_COLLECTIONS_CHANGED_EVENT = 'frilo-templates-collections-changed';

const FAVORITES_STORAGE_KEY = 'frilo.templates.favorites.v1';
const COMPARE_STORAGE_KEY = 'frilo.templates.compare.v1';
const MAX_COMPARE_ITEMS = 3;

function sanitizeIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item > 0)
    )
  );
}

function readIdsFromStorage(storageKey: string): number[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    return sanitizeIds(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeIdsToStorage(storageKey: string, ids: number[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify(ids));
}

function emitCollectionsChanged(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(TEMPLATE_COLLECTIONS_CHANGED_EVENT));
}

export function getFavoriteTemplateIds(): number[] {
  return readIdsFromStorage(FAVORITES_STORAGE_KEY);
}

export function setFavoriteTemplateIds(ids: number[]): void {
  writeIdsToStorage(FAVORITES_STORAGE_KEY, sanitizeIds(ids));
  emitCollectionsChanged();
}

export function toggleFavoriteTemplateId(templateId: number): boolean {
  const favoriteIds = getFavoriteTemplateIds();
  const exists = favoriteIds.includes(templateId);
  const nextIds = exists
    ? favoriteIds.filter((id) => id !== templateId)
    : [...favoriteIds, templateId];

  setFavoriteTemplateIds(nextIds);
  return !exists;
}

export function getCompareTemplateIds(): number[] {
  return readIdsFromStorage(COMPARE_STORAGE_KEY);
}

export function setCompareTemplateIds(ids: number[]): void {
  writeIdsToStorage(COMPARE_STORAGE_KEY, sanitizeIds(ids).slice(0, MAX_COMPARE_ITEMS));
  emitCollectionsChanged();
}

export function toggleCompareTemplateId(templateId: number): ToggleCompareResult {
  const compareIds = getCompareTemplateIds();
  if (compareIds.includes(templateId)) {
    setCompareTemplateIds(compareIds.filter((id) => id !== templateId));
    return 'removed';
  }

  if (compareIds.length >= MAX_COMPARE_ITEMS) {
    return 'max_reached';
  }

  setCompareTemplateIds([...compareIds, templateId]);
  return 'added';
}

export function clearCompareTemplateIds(): void {
  setCompareTemplateIds([]);
}

export function getMaxCompareItems(): number {
  return MAX_COMPARE_ITEMS;
}
