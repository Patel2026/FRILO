"use client"

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { NotificationsBell } from "@/components/dashboard/NotificationsBell";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";

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
    <div className="flex min-h-screen bg-[#f7f7f7]">
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
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100">
          <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-black"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" className="text-sm font-black tracking-tight text-black md:hidden">
                FRILO
              </Link>
              <p className="hidden md:block text-sm font-semibold text-black">Espace client</p>
            </div>
            <NotificationsBell />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
