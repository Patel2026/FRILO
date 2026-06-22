import type { Metadata } from 'next';
import { getPublicTemplateServer } from '@/lib/publicCatalog.server';
import { publicMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const template = await getPublicTemplateServer(id);
  const templateName = template?.name || 'Modèle de site FRILO';
  const sectorName = template?.sector?.name;

  return publicMetadata({
    title: `${templateName}${sectorName ? ` — ${sectorName}` : ''}`,
    description: template?.description
      ? `${template.description} FRILO adapte ce modèle avec vos textes, vos images et vos contacts.`
      : 'Découvrez ce modèle FRILO, ses options de style et le parcours pour commander un site adapté à votre activité.',
    path: `/templates/${id}`,
  });
}

export default function TemplateDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
