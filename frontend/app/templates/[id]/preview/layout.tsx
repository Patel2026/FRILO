import type { Metadata } from 'next';
import { privateMetadata } from '@/lib/seo';

export const metadata: Metadata = privateMetadata(
  'Aperçu du modèle',
  'Aperçu interactif du modèle FRILO sélectionné.'
);

export default function TemplatePreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
