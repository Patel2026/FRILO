import type { Metadata } from 'next';
import { privateMetadata } from '@/lib/seo';

export const metadata: Metadata = privateMetadata(
  'Créer un compte',
  'Création de compte client FRILO.'
);

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
