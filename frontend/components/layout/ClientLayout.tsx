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
];

const TEMPLATE_DETAIL_RE = /^\/templates\/[^/]+$/;

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const excluded =
    EXCLUDED_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/')) ||
    TEMPLATE_DETAIL_RE.test(pathname);

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
