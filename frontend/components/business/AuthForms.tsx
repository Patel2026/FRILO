"use client"

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  authService,
  loginSchema, registerSchema,
  LoginCredentials, RegisterCredentials, AuthUser,
} from '@/services/auth.service';
import { businessService, Sector } from '@/services/business.service';

interface AuthFormsProps {
  onSuccess: (user: AuthUser) => void;
  defaultMode?: 'login' | 'register';
}

const inputClass = "w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-300 focus:border-slate-950";
const labelClass = "mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-950";

export function AuthForms({ onSuccess, defaultMode = 'login' }: AuthFormsProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-md">

      {/* Mode toggle */}
      <div className="mb-6 flex rounded-full bg-slate-100 p-1">
        {(['login', 'register'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); }}
            className={cn(
              "flex-1 rounded-full py-2.5 text-sm font-black transition-colors",
              mode === m ? "bg-white text-slate-950 shadow-sm" : "text-slate-400 hover:text-slate-950"
            )}
          >
            {m === 'login' ? 'Connexion' : 'Inscription'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {mode === 'login'
        ? <LoginForm onSuccess={onSuccess} onError={setError} />
        : <RegisterForm onSuccess={onSuccess} onError={setError} />
      }
    </div>
  );
}

function LoginForm({ onSuccess, onError }: { onSuccess: (u: AuthUser) => void; onError: (e: string) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      const user = await authService.login(data);
      onSuccess(user);
    } catch {
      onError('Email ou mot de passe incorrect.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className={labelClass}>Adresse e-mail</label>
        <input {...register('email')} type="email" placeholder="vous@exemple.com" className={inputClass} />
        {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-950">
            Mot de passe
          </label>
          <Link href="/forgot-password" className="text-xs font-semibold text-slate-400 transition-colors hover:text-slate-950">
            Mot de passe oublié ?
          </Link>
        </div>
        <input {...register('password')} type="password" placeholder="••••••••" className={inputClass} />
        {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-sm font-black text-white transition-colors hover:bg-black disabled:opacity-50">
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess, onError }: { onSuccess: (u: AuthUser) => void; onError: (e: string) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
  });
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(true);

  useEffect(() => {
    let isMounted = true;

    businessService.getSectors()
      .then((data) => {
        if (!isMounted) return;
        setSectors(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setSectors([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoadingSectors(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      const user = await authService.register(data);
      onSuccess(user);
    } catch {
      onError("Erreur lors de l'inscription. Veuillez réessayer.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className={labelClass}>Nom complet</label>
        <input {...register('name')} type="text" placeholder="Jean Dupont" className={inputClass} />
        {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Adresse e-mail</label>
        <input {...register('email')} type="email" placeholder="vous@exemple.com" className={inputClass} />
        {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
      </div>
      <div>
        <label className={labelClass}>Domaine d&apos;activité</label>
        <select
          {...register('sector_id', { valueAsNumber: true })}
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            {loadingSectors ? 'Chargement des domaines…' : 'Sélectionnez votre domaine'}
          </option>
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.name}
            </option>
          ))}
        </select>
        {errors.sector_id && <p className="text-red-500 text-xs mt-1.5">{errors.sector_id.message}</p>}
        {!loadingSectors && sectors.length === 0 && (
          <p className="text-amber-600 text-xs mt-1.5">
            Les domaines ne sont pas disponibles actuellement. Réessayez dans quelques instants.
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div>
          <label className={labelClass}>Mot de passe</label>
          <input {...register('password')} type="password" placeholder="••••••••" className={inputClass} />
          {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Confirmer</label>
          <input {...register('password_confirmation')} type="password" placeholder="••••••••" className={inputClass} />
          {errors.password_confirmation && <p className="text-red-500 text-xs mt-1.5">{errors.password_confirmation.message}</p>}
        </div>
      </div>
      <button type="submit" disabled={isSubmitting || loadingSectors || sectors.length === 0} className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-sm font-black text-white transition-colors hover:bg-black disabled:opacity-50">
        {isSubmitting ? 'Création…' : 'Créer mon compte'}
      </button>
    </form>
  );
}
