import type { Metadata } from 'next';
import { privateMetadata } from '@/lib/seo';

export const metadata: Metadata = privateMetadata(
  'Commande FRILO',
  'Tunnel de commande FRILO pour personnaliser, vérifier et payer votre site.'
);

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
