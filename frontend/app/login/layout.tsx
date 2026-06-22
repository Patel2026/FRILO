import type { Metadata } from 'next';
import { privateMetadata } from '@/lib/seo';

export const metadata: Metadata = privateMetadata(
  'Connexion',
  'Connexion à votre espace FRILO.'
);

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
