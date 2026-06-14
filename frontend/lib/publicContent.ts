export type RichTextMarkType = 'bold' | 'italic' | 'link';

export interface RichTextMark {
  type: RichTextMarkType;
  attrs?: {
    href?: string;
  };
}

export interface RichTextNode {
  type: 'doc' | 'paragraph' | 'heading' | 'text' | 'bullet_list' | 'ordered_list' | 'list_item' | 'table' | 'table_row' | 'table_cell';
  text?: string;
  attrs?: {
    level?: 2 | 3 | 4;
  };
  marks?: RichTextMark[];
  content?: RichTextNode[];
}

export interface PublicContentPageSeo {
  title: string | null;
  description: string | null;
  is_indexable: boolean;
}

export interface PublicContentPage {
  key: string;
  name: string;
  route_pattern: string;
  seo: PublicContentPageSeo;
}

export interface PublicContentSection<TContent = Record<string, unknown>> {
  key: string;
  name: string;
  position: number;
  renderer: string;
  content: TContent;
}

export type FreeContentBlockLayout = 'full_width' | 'two_columns' | 'media_text';

export interface FreeContentBlockData {
  id: number | string;
  anchor_section_key: string | null;
  position: number;
  layout: FreeContentBlockLayout;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
}

export interface PublicContentResponse {
  page: PublicContentPage;
  sections: PublicContentSection[];
  blocks: FreeContentBlockData[];
}

export interface CtaContent {
  label: string;
  url: string;
}

export interface HomeHeroContent {
  eyebrow: string;
  headline: string;
  description: string;
  primary_cta: CtaContent;
  secondary_cta: CtaContent;
}

export interface HomeModelsIntroContent {
  eyebrow: string;
  headline: string;
  description: string;
  cta: CtaContent;
}

export interface HomeBenefitItem {
  title: string;
  description: string;
}

export interface HomeBenefitsContent {
  eyebrow: string;
  headline: string;
  description: string;
  items: HomeBenefitItem[];
  closing_copy: string;
  cta: CtaContent;
}

export interface HomeProcessStep {
  title: string;
  description: string;
}

export interface HomeProcessContent {
  eyebrow: string;
  headline: string;
  description: string;
  customer_steps: HomeProcessStep[];
  frilo_steps: HomeProcessStep[];
  result_copy: string;
  cta: CtaContent;
}

export interface HomePricingContent {
  eyebrow: string;
  headline: string;
  description: string;
  included_items: string[];
  package_eyebrow: string;
  package_description: string;
  options_eyebrow: string;
  options_headline: string;
  options_description: string;
  payment_note: string;
  primary_cta: CtaContent;
  secondary_cta: CtaContent;
}

export interface HomeTestimonialsIntroContent {
  eyebrow: string;
  headline: string;
  empty_state: string;
}

export interface HomeSectorsIntroContent {
  eyebrow: string;
  headline: string;
  cta: CtaContent;
}

export interface HomeFaqIntroContent {
  eyebrow: string;
  headline: string;
  description: string;
  cta: CtaContent;
}

export interface HomeClosingCtaContent {
  eyebrow: string;
  headline: string;
  description: string;
  primary_cta: CtaContent;
  secondary_cta: CtaContent;
}

const SAFE_INTERNAL_URL_PATTERN = /^\/(?!\/)[\w\-./#?=&%]*$/;
const SAFE_EXTERNAL_URL_PATTERN = /^https?:\/\/[^\s\\<>]+$/i;
const SAFE_MAILTO_PATTERN = /^mailto:[^\s\\<>@]+@[^\s\\<>@]+\.[^\s\\<>@]+$/i;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cleanString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;
}

function cleanNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function cleanBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function cleanPublicUrl(value: unknown, fallback = '/'): string {
  const candidate = cleanString(value, fallback);

  if (
    SAFE_INTERNAL_URL_PATTERN.test(candidate)
    || SAFE_EXTERNAL_URL_PATTERN.test(candidate)
    || SAFE_MAILTO_PATTERN.test(candidate)
  ) {
    return candidate;
  }

  return fallback;
}

export function normalizeCta(value: unknown, fallback: CtaContent): CtaContent {
  if (!isObject(value)) {
    return fallback;
  }

  return {
    label: cleanString(value.label, fallback.label),
    url: cleanPublicUrl(value.url, fallback.url),
  };
}

function normalizePage(value: unknown, fallback: PublicContentPage): PublicContentPage {
  if (!isObject(value)) {
    return fallback;
  }

  const seo = isObject(value.seo) ? value.seo : {};

  return {
    key: cleanString(value.key, fallback.key),
    name: cleanString(value.name, fallback.name),
    route_pattern: cleanString(value.route_pattern, fallback.route_pattern),
    seo: {
      title: typeof seo.title === 'string' ? seo.title : fallback.seo.title,
      description: typeof seo.description === 'string' ? seo.description : fallback.seo.description,
      is_indexable: cleanBoolean(seo.is_indexable, fallback.seo.is_indexable),
    },
  };
}

function normalizeSection(value: unknown, fallback?: PublicContentSection): PublicContentSection | null {
  if (!isObject(value)) {
    return null;
  }

  const renderer = cleanString(value.renderer, fallback?.renderer ?? '');
  const key = cleanString(value.key, fallback?.key ?? renderer);

  if (!renderer || !key) {
    return null;
  }

  return {
    key,
    name: cleanString(value.name, fallback?.name ?? key),
    position: cleanNumber(value.position, fallback?.position ?? 0),
    renderer,
    content: isObject(value.content)
      ? { ...(fallback?.content ?? {}), ...value.content }
      : (fallback?.content ?? {}),
  };
}

function normalizeBlock(value: unknown, index: number): FreeContentBlockData | null {
  if (!isObject(value)) {
    return null;
  }

  const layout = cleanString(value.layout);
  if (!['full_width', 'two_columns', 'media_text'].includes(layout)) {
    return null;
  }

  return {
    id: typeof value.id === 'number' || typeof value.id === 'string' ? value.id : `block-${index}`,
    anchor_section_key: typeof value.anchor_section_key === 'string' ? value.anchor_section_key : null,
    position: cleanNumber(value.position, 0),
    layout: layout as FreeContentBlockLayout,
    content: isObject(value.content) ? value.content : {},
    settings: isObject(value.settings) ? value.settings : {},
  };
}

export function normalizePublicContent(
  input: unknown,
  fallback: PublicContentResponse,
): PublicContentResponse {
  if (!isObject(input)) {
    return fallback;
  }

  const fallbackByRenderer = new Map(fallback.sections.map((section) => [section.renderer, section]));
  const sections = Array.isArray(input.sections)
    ? input.sections
      .map((section) => {
        const renderer = isObject(section) ? cleanString(section.renderer) : '';
        return normalizeSection(section, fallbackByRenderer.get(renderer));
      })
      .filter((section): section is PublicContentSection => section !== null)
      .sort((left, right) => left.position - right.position)
    : fallback.sections;

  const blocks = Array.isArray(input.blocks)
    ? input.blocks
      .map((block, index) => normalizeBlock(block, index))
      .filter((block): block is FreeContentBlockData => block !== null)
      .sort((left, right) => left.position - right.position)
    : fallback.blocks;

  return {
    page: normalizePage(input.page, fallback.page),
    sections,
    blocks,
  };
}

export function getPublicSection<TContent>(
  content: PublicContentResponse,
  renderer: string,
): PublicContentSection<TContent> | null {
  return (content.sections.find((section) => section.renderer === renderer) as PublicContentSection<TContent> | undefined) ?? null;
}

export function getBlocksForAnchor(content: PublicContentResponse, anchor: string | null): FreeContentBlockData[] {
  return content.blocks.filter((block) => block.anchor_section_key === anchor);
}
