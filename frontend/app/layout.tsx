import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { formatPublicPrice } from '@/lib/publicPricing';
import { getPublicPricingServer } from '@/lib/publicPricing.server';

export async function generateMetadata(): Promise<Metadata> {
  const pricing = await getPublicPricingServer();
  const startingPriceLabel = formatPublicPrice(pricing.starting_price, pricing.currency_label);

  return {
    title: "FRILO — Votre site vitrine livré en 48h",
    description: `Commandez votre site vitrine professionnel clé en main. Livraison en 48h, dès ${startingPriceLabel}. Satisfait ou remboursé.`,
    openGraph: {
      title: 'FRILO — Votre site vitrine livré en 48h',
      description: `Sites vitrines professionnels livrés rapidement, à partir de ${startingPriceLabel}.`,
      type: 'website',
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
