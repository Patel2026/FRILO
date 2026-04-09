"use client"

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
    return (
        <div className="max-w-3xl">
            <h1 className="text-2xl font-bold mb-4">Mon profil</h1>
            <p className="text-gray-600 mb-6">
                Cette section sera enrichie dans une prochaine itération du V1.
                Pour le moment, vous pouvez suivre vos commandes dans le tableau de bord.
            </p>
            <Button variant="outline" asChild>
                <Link href="/dashboard/orders">Voir mes commandes</Link>
            </Button>
        </div>
    );
}
