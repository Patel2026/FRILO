"use client"

import { AuthForms } from "@/components/business/AuthForms";
import { useRouter } from "next/navigation";
import { Section } from "@/components/ui/Section";

export default function LoginPage() {
    const router = useRouter();

    return (
        <div className="pt-20 pb-20">
            <Section title="Connexion" subtitle="Accédez à votre espace client">
                <AuthForms
                    defaultMode="login"
                    onSuccess={() => router.push('/secteurs')}
                />
            </Section>
        </div>
    );
}
