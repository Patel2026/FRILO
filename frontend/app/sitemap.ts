import type { MetadataRoute } from 'next';
import { getPublicSectorsServer, getPublicTemplatesServer } from '@/lib/publicCatalog.server';
import { absoluteUrl } from '@/lib/seo';

const staticRoutes = [
  '/',
  '/templates',
  '/secteurs',
  '/comment-ca-marche',
  '/faq',
  '/contact',
  '/mentions-legales',
  '/cgu',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sectors, templates] = await Promise.all([
    getPublicSectorsServer(),
    getPublicTemplatesServer(),
  ]);

  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route),
      lastModified: now,
      changeFrequency: route === '/' ? 'weekly' as const : 'monthly' as const,
      priority: route === '/' ? 1 : 0.8,
    })),
    ...sectors
      .filter((sector) => Boolean(sector.slug))
      .map((sector) => ({
        url: absoluteUrl(`/secteurs/${sector.slug}`),
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    ...templates
      .filter((template) => template.is_active !== false)
      .map((template) => ({
        url: absoluteUrl(`/templates/${template.id}`),
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      })),
  ];
}
