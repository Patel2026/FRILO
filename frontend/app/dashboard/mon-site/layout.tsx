import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata(
  "Mon site",
  "Informations privées sur le site livré, les accès et le suivi de livraison FRILO.",
);

export default function MonSiteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
