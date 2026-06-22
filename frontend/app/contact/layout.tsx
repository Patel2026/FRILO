import type { Metadata } from 'next';
import { publicMetadata } from '@/lib/seo';

export const metadata: Metadata = publicMetadata({
  title: 'Contacter FRILO',
  description: 'Contactez FRILO pour poser une question, demander une orientation ou clarifier votre projet avant de commander.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
