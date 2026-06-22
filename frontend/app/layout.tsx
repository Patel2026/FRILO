import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { formatPublicPrice } from '@/lib/publicPricing';
import { getPublicPricingServer } from '@/lib/publicPricing.server';
import { absoluteUrl, siteConfig } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const pricing = await getPublicPricingServer();
  const startingPriceLabel = formatPublicPrice(pricing.starting_price, pricing.currency_label);

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.defaultTitle,
      template: '%s | FRILO',
    },
    description: `Commandez votre site vitrine professionnel clé en main. Livraison en 48h, dès ${startingPriceLabel}. Satisfait ou remboursé.`,
    alternates: {
      canonical: absoluteUrl('/'),
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon.png', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: '/icon.png',
    },
    openGraph: {
      title: siteConfig.defaultTitle,
      description: `Sites vitrines professionnels livrés rapidement, à partir de ${startingPriceLabel}.`,
      url: absoluteUrl('/'),
      siteName: siteConfig.name,
      type: 'website',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'FRILO — Votre site vitrine livré en 48h',
      description: `Sites vitrines professionnels livrés rapidement, à partir de ${startingPriceLabel}.`,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white font-sans antialiased flex flex-col">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
