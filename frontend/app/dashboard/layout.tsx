"use client"

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { NotificationsBell } from "@/components/dashboard/NotificationsBell";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Plus } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    authService.getUser().then(user => {
      if (!user) router.replace('/login');
      else setIsLoading(false);
    }).catch(() => router.replace('/login'));
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[oklch(98.5%_0.003_95)] text-neutral-950">
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        <div className="sticky top-0 z-30 border-b border-neutral-200 bg-[oklch(98.5%_0.003_95)]/95 backdrop-blur">
          <div className="px-4 py-3 md:px-7 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-950"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" className="text-sm font-black tracking-tight text-neutral-950 md:hidden">
                FRILO
              </Link>
              <div className="hidden min-w-0 md:block">
                <p className="text-sm font-black tracking-tight text-neutral-950">Suivi client</p>
                <p className="text-xs font-medium text-neutral-500">Commandes, paiement, livraison</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/templates"
                className="hidden items-center gap-2 rounded-full bg-[oklch(55%_0.23_29)] px-4 py-2 text-sm font-black text-[oklch(99%_0.004_95)] transition-colors hover:bg-[oklch(48%_0.22_29)] sm:inline-flex"
              >
                <Plus className="h-4 w-4" />
                Nouvelle commande
              </Link>
              <NotificationsBell />
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
