import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata(
  "Notifications",
  "Notifications privées liées aux commandes, paiements et livraisons FRILO.",
);

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
