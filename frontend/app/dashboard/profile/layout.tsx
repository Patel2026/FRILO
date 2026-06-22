import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata(
  "Profil",
  "Paramètres privés du profil client FRILO.",
);

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
