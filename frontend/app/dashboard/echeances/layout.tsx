import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata(
  "Mes échéances",
  "Suivi privé des rappels, échéances et actions importantes du client FRILO.",
);

export default function EcheancesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
