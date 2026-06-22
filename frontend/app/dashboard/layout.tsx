import type { Metadata } from 'next';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { privateMetadata } from '@/lib/seo';

export const metadata: Metadata = privateMetadata(
  'Espace client',
  'Tableau de bord client FRILO pour suivre les commandes, la caisse, les clients et les notifications.'
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
