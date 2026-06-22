import type { Metadata } from 'next';
import { privateMetadata } from '@/lib/seo';

export const metadata: Metadata = privateMetadata(
  'Réinitialiser le mot de passe',
  'Réinitialisation sécurisée du mot de passe FRILO.'
);

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
