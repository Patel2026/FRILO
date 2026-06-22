import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata({
  title: "CGU / CGV",
  description:
    "Consultez les conditions générales d’utilisation et de vente de FRILO avant de commander votre site.",
  path: "/cgu",
});

export default function CguLayout({ children }: { children: React.ReactNode }) {
  return children;
}
