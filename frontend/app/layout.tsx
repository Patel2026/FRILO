import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/layout/ClientLayout";

export const metadata: Metadata = {
  title: "FRILO — Votre site vitrine livré en 48h",
  description: "Commandez votre site vitrine professionnel clé en main. Livraison en 48h, dès 50 000 FCFA. Satisfait ou remboursé.",
};

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
