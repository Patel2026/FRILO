"use client"

import { ArrowRight, LucideIcon } from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href?: string;
    color?: string; // Tailwind color class prefix e.g. "blue", "purple"
}

export function ServiceCard({ title, description, icon: Icon, href = "/contact", color = "blue" }: ServiceCardProps) {
    return (
        <div className="group bg-white rounded-xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className={`w-14 h-14 rounded-2xl bg-${color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-7 h-7 text-${color}-600`} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-frilo-blue transition-colors">
                {title}
            </h3>

            <p className="text-gray-600 mb-6 leading-relaxed">
                {description}
            </p>

            <div className="flex items-center text-sm font-semibold text-frilo-blue group-hover:translate-x-1 transition-transform">
                <Link href={href}>
                    Demander un devis <ArrowRight className="w-4 h-4 ml-1 inline-block" />
                </Link>
            </div>
        </div>
    );
}
