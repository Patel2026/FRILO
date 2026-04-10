"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const projectSchema = z.object({
  domainName: z.string().min(3, 'Minimum 3 caractères'),
  description: z.string().min(10, 'Décrivez brièvement votre activité (10 caractères min)'),
  colors: z.string().optional(),
  specific_instructions: z.string().optional(),
});

type ProjectDetails = z.infer<typeof projectSchema>;

interface ProjectDetailsFormProps {
  onSuccess: (data: ProjectDetails) => void;
  onChange?: (data: Partial<ProjectDetails>) => void;
  initialValues?: Partial<ProjectDetails>;
}

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300";
const labelClass = "block text-xs font-bold text-black uppercase tracking-widest mb-2";

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Nom de domaine souhaité</label>
          <input
            {...register('domainName', {
              onChange: syncFieldChange('domainName'),
            })}
            type="text"
            placeholder="mon-restaurant.com"
            className={inputClass}
          />
          {errors.domainName && <p className="text-red-500 text-xs mt-1.5">{errors.domainName.message}</p>}
          <p className="text-xs text-gray-400 mt-1.5">Si vous en avez déjà un, indiquez-le ici.</p>
        </div>
        <div>
          <label className={labelClass}>Couleurs préférées <span className="text-gray-400 normal-case font-normal tracking-normal">(optionnel)</span></label>
          <input
            {...register('colors', {
              onChange: syncFieldChange('colors'),
            })}
            type="text"
            placeholder="Bleu et Blanc, ou #123456"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description de votre activité</label>
        <textarea
          {...register('description', {
            onChange: syncFieldChange('description'),
          })}
          rows={4}
          placeholder="Dites-nous en plus sur votre entreprise pour que nous puissions adapter le contenu…"
          className={`${inputClass} resize-none`}
        />
        {errors.description && <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Instructions spécifiques <span className="text-gray-400 normal-case font-normal tracking-normal">(optionnel)</span></label>
        <textarea
          {...register('specific_instructions', {
            onChange: syncFieldChange('specific_instructions'),
          })}
          rows={3}
          placeholder="Demandes particulières sur le design ou les fonctionnalités…"
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50/50">
        <p className="text-xs text-gray-400 mb-1">Logo & images</p>
        <p className="text-xs text-gray-400">Vous pouvez nous les envoyer par e-mail après la commande.</p>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className="sq-btn sq-btn-black">
          Valider et continuer →
        </button>
      </div>
    </form>
  );
}
