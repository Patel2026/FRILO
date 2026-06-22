import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata(
  "Détail commande",
  "Détail privé d’une commande FRILO, avec suivi, paiement et livraison.",
);

export default function OrderDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
