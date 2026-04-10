"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { authService, resetPasswordSchema, ResetPasswordPayload } from '@/services/auth.service';

type ResetFormValues = Omit<ResetPasswordPayload, 'token'>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const prefilledEmail = searchParams.get('email') || '';
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const hasValidResetParams = useMemo(() => token !== '' && prefilledEmail !== '', [token, prefilledEmail]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasswordSchema.omit({ token: true })),
    defaultValues: {
      email: prefilledEmail,
      password: '',
      password_confirmation: '',
    },
  });

  useEffect(() => {
    setValue('email', prefilledEmail);
  }, [prefilledEmail, setValue]);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('auth_token'));

      if (!hasToken) {
        if (isMounted) setCheckingSession(false);
        return;
      }

      const user = await authService.getUser();
      if (!isMounted) return;

      if (user) {
        router.replace('/dashboard');
        return;
      }

      localStorage.removeItem('auth_token');
      setCheckingSession(false);
    };

    checkSession().catch(() => {
      if (isMounted) setCheckingSession(false);
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const onSubmit = async (data: ResetFormValues) => {
    if (!hasValidResetParams) return;

    setError(null);
    setSuccess(null);

    try {
      const message = await authService.resetPassword({
        token,
        email: data.email.trim(),
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      setSuccess(message);
    } catch (submitError) {
      if (axios.isAxiosError(submitError) && submitError.response?.data?.message) {
        setError(String(submitError.response.data.message));
      } else {
        setError('Impossible de réinitialiser le mot de passe pour le moment.');
      }
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-between p-16">
        <Link href="/" className="text-2xl font-black tracking-tight">FRILO</Link>
        <div>
          <h2 className="sq-heading text-white mb-6">
            Nouveau<br />mot de passe.
          </h2>
          <p className="text-gray-400 text-lg">
            Choisissez un mot de passe sécurisé pour protéger votre espace client.
          </p>
        </div>
        <p className="text-gray-600 text-sm">© {new Date().getFullYear()} FRILO. Tous droits réservés.</p>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 bg-white">
        <Link href="/" className="text-xl font-black mb-12 lg:hidden">FRILO</Link>

        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-3xl font-black text-black tracking-tight mb-2">Réinitialiser le mot de passe</h1>
          <p className="text-gray-500 text-sm mb-10">
            Vous pourrez vous reconnecter juste après avec votre nouveau mot de passe.
          </p>

          {!hasValidResetParams && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Lien invalide. Demandez un nouveau lien de réinitialisation.
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">
                Adresse e-mail
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="vous@exemple.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">
                Nouveau mot de passe
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">
                Confirmer le mot de passe
              </label>
              <input
                {...register('password_confirmation')}
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-xs mt-1.5">{errors.password_confirmation.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !hasValidResetParams}
              className="sq-btn sq-btn-black w-full justify-center disabled:opacity-50"
            >
              {isSubmitting ? 'Réinitialisation…' : 'Réinitialiser mon mot de passe'}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-6 text-center">
            <Link href="/forgot-password" className="underline underline-offset-2 hover:text-black transition-colors">
              Demander un nouveau lien
            </Link>
            {' · '}
            <Link href="/login" className="underline underline-offset-2 hover:text-black transition-colors">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

