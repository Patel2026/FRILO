import type { Metadata } from 'next';
import { privateMetadata } from '@/lib/seo';

export const metadata: Metadata = privateMetadata(
  'Démo de modèle',
  'Démo de modèle FRILO destinée à la prévisualisation.'
);

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
