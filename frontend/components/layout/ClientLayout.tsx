"use client"

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

// Routes where the global header/footer must NOT appear
// (they have their own navigation: top bar, sidebar, split-screen)
const EXCLUDED_PREFIXES = [
  '/login',
  '/register',
  '/dashboard',
  '/commande',
  '/demo',
];

const TEMPLATE_DETAIL_RE = /^\/templates\/\d+$/;
const TEMPLATE_IMMERSIVE_PREVIEW_RE = /^\/templates\/\d+\/preview$/;

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const excluded =
    EXCLUDED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/')) ||
    TEMPLATE_DETAIL_RE.test(pathname) ||
    TEMPLATE_IMMERSIVE_PREVIEW_RE.test(pathname);

  if (excluded) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
