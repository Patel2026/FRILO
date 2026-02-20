"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";

const projectSchema = z.object({
    domainName: z.string().min(3, "Le nom de domaine doit faire au moins 3 caractères"),
    description: z.string().min(10, "Décrivez brièvement votre activité (10 caractères min)"),
    colors: z.string().optional(),
    specific_instructions: z.string().optional(),
});

type ProjectDetails = z.infer<typeof projectSchema>;

interface ProjectDetailsFormProps {
    onSuccess: (data: ProjectDetails) => void;
}

export function ProjectDetailsForm({ onSuccess }: ProjectDetailsFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<ProjectDetails>({
        resolver: zodResolver(projectSchema)
    });

    return (
        <form onSubmit={handleSubmit(onSuccess)} className="space-y-6">
            <div>
                <h3 className="text-lg font-bold mb-4">Votre identité visuelle</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de domaine souhaité</label>
                        <input
                            {...register("domainName")}
                            type="text"
                            placeholder="ex: mon-restaurant.com"
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-frilo-blue focus:border-transparent"
                        />
                        {errors.domainName && <p className="text-red-500 text-xs mt-1">{errors.domainName.message}</p>}
                        <p className="text-xs text-gray-500 mt-1">Si vous en avez déjà un, indiquez-le ici.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Couleurs préférées (Optionnel)</label>
                        <input
                            {...register("colors")}
                            type="text"
                            placeholder="ex: Bleu et Blanc, ou #123456"
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-frilo-blue focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description de votre activité</label>
                <textarea
                    {...register("description")}
                    rows={4}
                    placeholder="Dites-nous en plus sur votre entreprise pour que nous puissions adapter le contenu..."
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-frilo-blue focus:border-transparent"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructions spécifiques (Optionnel)</label>
                <textarea
                    {...register("specific_instructions")}
                    rows={3}
                    placeholder="Avez-vous des demandes particulières pour le design ou les fonctionnalités ?"
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-frilo-blue focus:border-transparent"
                />
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold mb-4">Logo & Images</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                    <p className="text-gray-500">Zone de dépôt de fichiers (Mock)</p>
                    <Button type="button" variant="secondary" size="sm" className="mt-2">Choisir des fichiers</Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Vous pourrez aussi nous les envoyer par email plus tard.</p>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" variant="gradient" size="lg">
                    Valider et continuer pour le paiement
                </Button>
            </div>
        </form>
    );
}
