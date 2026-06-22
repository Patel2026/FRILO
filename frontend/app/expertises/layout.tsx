import type { Metadata } from 'next';
import { publicMetadata } from '@/lib/seo';

export const metadata: Metadata = publicMetadata({
  title: 'Expertises FRILO',
  description: 'Découvrez comment FRILO structure les pages, les textes, les images et les contacts pour rendre votre activité claire en ligne.',
  path: '/expertises',
});

export default function ExpertisesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
