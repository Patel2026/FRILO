import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/templates',
          '/secteurs',
          '/comment-ca-marche',
          '/faq',
          '/contact',
          '/mentions-legales',
          '/cgu',
        ],
        disallow: [
          '/dashboard',
          '/commande',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/templates/compare',
          '/demo',
          '/admin',
          '/frilo-console',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
