"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, CheckCircle2, Lock, Mail } from 'lucide-react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { z } from 'zod';
import { authService, ResetPasswordPayload } from '@/services/auth.service';

type ResetFormValues = Omit<ResetPasswordPayload, 'token'>;

const resetPasswordFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  password_confirmation: z.string().min(8),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirmation"],
});

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </main>
    }>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const prefilledEmail = searchParams.get('email') || '';
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const hasValidResetParams = useMemo(() => token !== '' && prefilledEmail !== '', [token, prefilledEmail]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
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
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-8 md:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1180px] flex-col">
        <header className="mb-10 flex items-center justify-between border-b border-gray-200 pb-5">
          <Link href="/" className="text-xl font-black tracking-tight text-black">FRILO</Link>
          <Link href="/login" className="text-sm font-black text-gray-500 transition-colors hover:text-black">
            Connexion
          </Link>
        </header>

        <section className="grid flex-1 gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div className="max-w-2xl">
            <Link href="/forgot-password" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-black">
              <ArrowLeft className="h-4 w-4" />
              Demander un nouveau lien
            </Link>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">
              Sécurité
            </p>
            <h1 className="text-4xl font-black leading-tight text-black md:text-5xl">
              Créez un nouveau mot de passe.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-gray-500">
              Choisissez un mot de passe fiable pour reprendre l’accès à votre espace client FRILO.
            </p>
          </div>

          <div className="border-y border-gray-200 py-6">
            {!hasValidResetParams && (
              <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-sm font-semibold">Lien invalide. Demandez un nouveau lien de réinitialisation.</p>
              </div>
            )}

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p className="text-sm font-semibold">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="vous@exemple.com"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 pl-11 text-sm text-black outline-none transition-colors placeholder:text-gray-300 focus:border-black"
                  />
                </div>
                {errors.email && <p className="mt-2 text-xs font-semibold text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="Mot de passe"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 pl-11 text-sm text-black outline-none transition-colors placeholder:text-gray-300 focus:border-black"
                  />
                </div>
                {errors.password && <p className="mt-2 text-xs font-semibold text-red-500">{errors.password.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black">
                  Confirmation
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('password_confirmation')}
                    type="password"
                    placeholder="Confirmez le mot de passe"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3.5 pl-11 text-sm text-black outline-none transition-colors placeholder:text-gray-300 focus:border-black"
                  />
                </div>
                {errors.password_confirmation && (
                  <p className="mt-2 text-xs font-semibold text-red-500">{errors.password_confirmation.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !hasValidResetParams}
                className="inline-flex w-full justify-center rounded-full bg-black px-7 py-3.5 text-sm font-black text-white transition-colors hover:bg-gray-900 disabled:opacity-50"
              >
                {isSubmitting ? 'Réinitialisation en cours' : 'Réinitialiser mon mot de passe'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              <Link href="/login" className="font-black text-black underline underline-offset-4">
                Retour à la connexion
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
