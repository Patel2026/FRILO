import { Template, TemplateColorPalette, TemplateFontPairing } from '@/services/business.service';

export const DEFAULT_TEMPLATE_PALETTES: TemplateColorPalette[] = [
  { id: 'frilo-light', name: 'FRILO clair', colors: ['#ffffff', '#0b0f19', '#e60000'] },
  { id: 'soft-cream', name: 'Crème sobre', colors: ['#f7f4ec', '#111111', '#2563eb'] },
  { id: 'ink-blue', name: 'Bleu profond', colors: ['#071a2f', '#f4f8ff', '#9cc9ff'] },
  { id: 'warm-studio', name: 'Studio chaud', colors: ['#f4ebe1', '#201815', '#c2410c'] },
  { id: 'mono-black', name: 'Noir blanc', colors: ['#000000', '#ffffff', '#d9d9d9'] },
  { id: 'fresh-green', name: 'Vert frais', colors: ['#eef8ef', '#102015', '#16a34a'] },
];

export const DEFAULT_TEMPLATE_FONT_PAIRINGS: TemplateFontPairing[] = [
  { id: 'default', name: 'Police par défaut', heading: 'Inter', body: 'Inter' },
  { id: 'editorial-serif', name: 'Editorial', heading: 'Instrument Serif', body: 'Inter' },
  { id: 'modern-sans', name: 'Moderne', heading: 'Public Sans', body: 'DM Sans' },
  { id: 'classic-service', name: 'Classique', heading: 'Gloock', body: 'Inter' },
  { id: 'precise-pro', name: 'Professionnel', heading: 'Bricolage Grotesque', body: 'DM Sans' },
  { id: 'soft-human', name: 'Humain', heading: 'Averia Serif Libre', body: 'Schibsted Grotesk' },
];

export function resolveTemplatePalettes(template: Template): TemplateColorPalette[] {
  const palettes = normalizeArray<TemplateColorPalette>(template.color_palettes);
  return palettes.length > 0 ? palettes : DEFAULT_TEMPLATE_PALETTES;
}

export function resolveTemplateFontPairings(template: Template): TemplateFontPairing[] {
  const pairings = normalizeArray<TemplateFontPairing>(template.font_pairings);
  return pairings.length > 0 ? pairings : DEFAULT_TEMPLATE_FONT_PAIRINGS;
}

export function resolveDefaultPaletteId(template: Template, palettes: TemplateColorPalette[]): string {
  return resolveDefaultId(template.default_color_palette, palettes);
}

export function resolveDefaultFontPairingId(template: Template, pairings: TemplateFontPairing[]): string {
  return resolveDefaultId(template.default_font_pairing, pairings);
}

export function buildOrderUrl(templateId: number, paletteId?: string, fontPairingId?: string): string {
  const params = new URLSearchParams({ templateId: String(templateId) });

  if (paletteId) {
    params.set('palette', paletteId);
  }

  if (fontPairingId) {
    params.set('font', fontPairingId);
  }

  return `/commande?${params.toString()}`;
}

export function buildTemplatePreviewUrl(templateId: number, paletteId?: string, fontPairingId?: string): string {
  const params = new URLSearchParams();

  if (paletteId) {
    params.set('palette', paletteId);
  }

  if (fontPairingId) {
    params.set('font', fontPairingId);
  }

  const query = params.toString();
  return `/templates/${templateId}/preview${query ? `?${query}` : ''}`;
}

function resolveDefaultId<T extends { id?: string }>(defaultId: string | null | undefined, items: T[]): string {
  if (defaultId && items.some((item) => item.id === defaultId)) {
    return defaultId;
  }

  return items[0]?.id ?? '';
}

function normalizeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is T => item !== null && typeof item === 'object');
  }

  if (typeof value === 'string') {
    try {
      return normalizeArray<T>(JSON.parse(value));
    } catch {
      return [];
    }
  }

  return [];
}
