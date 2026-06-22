import type { Metadata } from 'next';
import { privateMetadata } from '@/lib/seo';

export const metadata: Metadata = privateMetadata(
  'Comparaison de modèles',
  'Comparez vos modèles FRILO favoris avant de choisir une base.'
);

export default function TemplateCompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
