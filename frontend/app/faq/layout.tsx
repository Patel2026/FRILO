import type { Metadata } from 'next';
import { publicMetadata } from '@/lib/seo';

export const metadata: Metadata = publicMetadata({
  title: 'Centre d’aide FRILO',
  description: 'Trouvez une réponse sur les modèles, les prix, la commande, la livraison et le suivi de votre site FRILO.',
  path: '/faq',
});

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
