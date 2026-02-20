"use client"

import { AuthForms } from "@/components/business/AuthForms";
import { useRouter } from "next/navigation";
import { Section } from "@/components/ui/Section";

export default function RegisterPage() {
    const router = useRouter();

    return (
        <div className="pt-20 pb-20">
            <Section title="Inscription" subtitle="Créez votre compte pour commander">
                <AuthForms
                    defaultMode="register"
                    onSuccess={() => router.push('/secteurs')}
                />
            </Section>
        </div>
    );
}
