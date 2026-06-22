import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata({
  title: "Mentions légales",
  description:
    "Retrouvez les mentions légales de FRILO, les informations de contact et les conditions d’utilisation du site.",
  path: "/mentions-legales",
});

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
