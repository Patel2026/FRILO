import type { Metadata } from 'next';

const DEFAULT_SITE_URL = 'https://frilo.com';

export const siteConfig = {
  name: 'FRILO',
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || DEFAULT_SITE_URL,
  defaultTitle: 'FRILO — Site vitrine professionnel livré en 48h',
  defaultDescription:
    'FRILO aide les entrepreneurs à partir d’un modèle, ajouter leurs informations et recevoir un site vitrine prêt à partager.',
};

export function absoluteUrl(path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.url).toString();
}

export function publicMetadata({
  title,
  description,
  path = '/',
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(path),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      type: 'website',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function privateMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}
