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
  formId?: string;
  showSubmit?: boolean;
  submitLabel?: string;
  selectedStyleLabel?: string;
}

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-300 focus:border-slate-950";
const labelClass = "mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-950";

export function ProjectDetailsForm({
  onSuccess,
  onChange,
  initialValues,
  formId,
  showSubmit = true,
  submitLabel = 'Valider et continuer',
  selectedStyleLabel,
}: ProjectDetailsFormProps) {
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
    <form id={formId} onSubmit={handleSubmit(onSuccess)} className="space-y-5">

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
          <p className={labelClass}>Style sélectionné</p>
          <div className="min-h-[49px] rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700">
            {selectedStyleLabel || 'Style par défaut FRILO'}
          </div>
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

      {showSubmit && <div className="flex justify-end pt-2">
        <button type="submit" className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-sm font-black text-white transition-colors hover:bg-black sm:w-auto">
          {submitLabel}
        </button>
      </div>}
    </form>
  );
}
