import { privateMetadata } from "@/lib/seo";

export const metadata = privateMetadata(
  "Mes commandes",
  "Liste privée des commandes FRILO et de leur état d’avancement.",
);

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
