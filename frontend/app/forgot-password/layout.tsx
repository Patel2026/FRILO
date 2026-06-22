import type { Metadata } from 'next';
import { privateMetadata } from '@/lib/seo';

export const metadata: Metadata = privateMetadata(
  'Mot de passe oublié',
  'Demande de réinitialisation du mot de passe FRILO.'
);

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
