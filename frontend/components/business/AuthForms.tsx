"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  authService,
  loginSchema, registerSchema,
  LoginCredentials, RegisterCredentials, AuthUser,
} from '@/services/auth.service';

interface AuthFormsProps {
  onSuccess: (user: AuthUser) => void;
  defaultMode?: 'login' | 'register';
}

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300";
const labelClass = "block text-xs font-bold text-black uppercase tracking-widest mb-2";

export function AuthForms({ onSuccess, defaultMode = 'login' }: AuthFormsProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto">

      {/* Mode toggle */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        {(['login', 'register'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); }}
            className={cn(
              "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all",
              mode === m ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black"
            )}
          >
            {m === 'login' ? 'Connexion' : 'Inscription'}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4 mb-5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
        <label className={labelClass}>Mot de passe</label>
        <input {...register('password')} type="password" placeholder="••••••••" className={inputClass} />
        {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="sq-btn sq-btn-black w-full justify-center disabled:opacity-50">
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess, onError }: { onSuccess: (u: AuthUser) => void; onError: (e: string) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
  });

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
      <div className="grid grid-cols-2 gap-4">
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
      <button type="submit" disabled={isSubmitting} className="sq-btn sq-btn-black w-full justify-center disabled:opacity-50">
        {isSubmitting ? 'Création…' : 'Créer mon compte'}
      </button>
    </form>
  );
}
