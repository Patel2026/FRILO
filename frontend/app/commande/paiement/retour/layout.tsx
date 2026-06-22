import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata(
  "Retour paiement",
  "Page privée de retour de paiement d’une commande FRILO.",
);

export default function PaymentReturnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
