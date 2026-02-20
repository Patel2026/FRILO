"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingBag, LogOut, User } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await authService.logout();
        router.push('/login');
    };

    const links = [
        { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
        { name: "Mes commandes", href: "/dashboard/orders", icon: ShoppingBag },
        { name: "Mon profil", href: "/dashboard/profile", icon: User },
    ];

    return (
        <aside className="w-64 bg-white border-r min-h-screen hidden md:flex flex-col">
            <div className="p-6 border-b">
                <Link href="/" className="text-2xl font-bold tracking-tighter">
                    <span className="text-frilo-blue">FRI</span>
                    <span className="text-frilo-purple">LO</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                                isActive
                                    ? "bg-blue-50 text-frilo-blue font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon size={20} />
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    );
}
