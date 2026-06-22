import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata(
  "Ma caisse",
  "Suivi privé des entrées, dépenses et mouvements de caisse du client FRILO.",
);

export default function CaisseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
