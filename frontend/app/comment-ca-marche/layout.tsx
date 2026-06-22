import type { Metadata } from 'next';
import { publicMetadata } from '@/lib/seo';

export const metadata: Metadata = publicMetadata({
  title: 'Comment ça marche',
  description: 'Comprenez comment FRILO part d’un modèle, récupère vos informations, adapte le rendu et vous livre un site prêt à partager.',
  path: '/comment-ca-marche',
});

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
