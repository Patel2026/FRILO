import type { Metadata } from 'next';
import { publicMetadata } from '@/lib/seo';

export const metadata: Metadata = publicMetadata({
  title: 'Secteurs d’activité',
  description: 'Choisissez le secteur le plus proche de votre activité. FRILO adapte ensuite les pages, les textes et les preuves à votre entreprise.',
  path: '/secteurs',
});

export default function SectorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
