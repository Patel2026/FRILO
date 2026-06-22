import type { Metadata } from 'next';
import { publicMetadata } from '@/lib/seo';

export const metadata: Metadata = publicMetadata({
  title: 'Modèles de sites pour présenter votre activité',
  description: 'Parcourez les modèles FRILO, filtrez par secteur et choisissez une base claire que FRILO adapte avec vos contenus.',
  path: '/templates',
});

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
