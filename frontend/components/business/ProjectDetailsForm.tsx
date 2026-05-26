"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const projectSchema = z.object({
  domainName: z.string().min(3, 'Indiquez au moins le nom de votre entreprise.'),
  description: z.string().min(10, 'Décrivez brièvement votre activité.'),
  colors: z.string().optional(),
  specific_instructions: z.string().optional(),
});

type ProjectDetails = z.infer<typeof projectSchema>;

interface ProjectDetailsFormProps {
  onSuccess: (data: ProjectDetails) => void;
  onChange?: (data: Partial<ProjectDetails>) => void;
  initialValues?: Partial<ProjectDetails>;
}

const inputClass = "w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-300 focus:border-slate-950";
const labelClass = "mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-950";

export function ProjectDetailsForm({ onSuccess, onChange, initialValues }: ProjectDetailsFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectDetails>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      domainName: initialValues?.domainName ?? '',
      description: initialValues?.description ?? '',
      colors: initialValues?.colors ?? '',
      specific_instructions: initialValues?.specific_instructions ?? '',
    },
  });

  const syncFieldChange = (field: keyof ProjectDetails) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.({ [field]: event.target.value });
  };

  return (
    <form onSubmit={handleSubmit(onSuccess)} className="space-y-5">

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Nom de l'entreprise</label>
          <input
            {...register('domainName', {
              onChange: syncFieldChange('domainName'),
            })}
            type="text"
            placeholder="Ex : Maison Adja"
            className={inputClass}
          />
          {errors.domainName && <p className="text-red-500 text-xs mt-1.5">{errors.domainName.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Style ou couleurs <span className="font-normal normal-case tracking-normal text-slate-400">(optionnel)</span></label>
          <input
            {...register('colors', {
              onChange: syncFieldChange('colors'),
            })}
            type="text"
            placeholder="Sobre, noir et rouge, doré..."
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Votre activité</label>
        <textarea
          {...register('description', {
            onChange: syncFieldChange('description'),
          })}
          rows={5}
          placeholder="Que vendez-vous ? À qui ? Quels services doivent être compris rapidement par vos clients ?"
          className={`${inputClass} resize-none`}
        />
        {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>}
      </div>

      <div>
        <label className={labelClass}>À savoir maintenant <span className="font-normal normal-case tracking-normal text-slate-400">(optionnel)</span></label>
        <textarea
          {...register('specific_instructions', {
            onChange: syncFieldChange('specific_instructions'),
          })}
          rows={3}
          placeholder="Nom de domaine existant, page importante, préférence de langue, contact à afficher..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-white">
        <p className="font-black">Pas besoin de tout préparer maintenant.</p>
        <p className="mt-1 text-white/65">Après paiement, FRILO récupère les images, le logo et les derniers contenus avec vous.</p>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-sm font-black text-white transition-colors hover:bg-black sm:w-auto">
          Valider et continuer
        </button>
      </div>
    </form>
  );
}
