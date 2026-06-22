import type { Metadata } from 'next';
import { getPublicSectorsServer } from '@/lib/publicCatalog.server';
import { publicMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const sectors = await getPublicSectorsServer();
  const sector = sectors.find((item) => item.slug === slug);
  const sectorName = sector?.name || 'Secteur FRILO';

  return publicMetadata({
    title: `${sectorName} — Modèles de site adaptés`,
    description: sector?.description
      ? `${sector.description} Découvrez les modèles FRILO adaptés à ce secteur.`
      : 'Découvrez les modèles FRILO adaptés à ce secteur et démarrez avec une base proche de votre activité.',
    path: `/secteurs/${slug}`,
  });
}

export default function SectorDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
