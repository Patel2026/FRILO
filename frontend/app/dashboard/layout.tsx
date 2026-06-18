"use client"

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { NotificationsBell } from "@/components/dashboard/NotificationsBell";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Menu, Plus, Search } from "lucide-react";

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
    <div className="flex min-h-screen bg-[#f5f5f6] text-neutral-950">
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
        <div className="sticky top-0 z-30 border-b border-neutral-900 bg-neutral-950 text-white">
          <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="rounded-lg border border-white/10 p-2 text-white transition-colors hover:bg-white/10 md:hidden"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" className="text-sm font-black tracking-tight text-white md:hidden">
                FRILO
              </Link>
            </div>
            <div className="hidden min-w-0 flex-1 md:block">
              <div className="mx-auto flex h-10 max-w-xl items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-neutral-300">
                <Search className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                <span className="truncate font-semibold">Rechercher une commande, un client ou une action</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/mon-site"
                className="hidden items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-black text-white transition-colors hover:bg-white/10 sm:inline-flex"
              >
                <ExternalLink className="h-4 w-4" />
                Voir mon site
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center gap-2 rounded-lg bg-[#e11d2e] px-3 py-2 text-sm font-black text-white transition-colors hover:bg-[#be123c]"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nouvelle demande</span>
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
