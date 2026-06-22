import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata(
  "Mes clients",
  "Gestion privée des clients et contacts enregistrés dans l’espace client FRILO.",
);

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
