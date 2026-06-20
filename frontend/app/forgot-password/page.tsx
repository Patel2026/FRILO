"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { authService, forgotPasswordSchema, ForgotPasswordPayload } from '@/services/auth.service';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordPayload>({
    resolver: zodResolver(forgotPasswordSchema),
  });

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

  const onSubmit = async (data: ForgotPasswordPayload) => {
    setError(null);
    setSuccess(null);

    try {
      const message = await authService.requestPasswordReset(data);
      setSuccess(message);
    } catch (submitError) {
      if (axios.isAxiosError(submitError) && submitError.response?.status === 429) {
        setError('Une demande a déjà été faite récemment. Patientez avant de réessayer.');
      } else {
        setError('Impossible d’envoyer le lien de réinitialisation pour le moment.');
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
          <Link href="/" className="inline-flex w-[104px] transition-opacity hover:opacity-80" aria-label="Accueil FRILO">
            <BrandLogo variant="dark" priority />
          </Link>
          <Link href="/login" className="text-sm font-black text-gray-500 transition-colors hover:text-black">
            Connexion
          </Link>
        </header>

        <section className="grid flex-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
          <div className="max-w-2xl">
            <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-black">
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
            <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">
              Récupération
            </p>
            <h1 className="text-4xl font-black leading-tight text-black md:text-5xl">
              Recevez un lien sécurisé.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-gray-500">
              Indiquez l’adresse e-mail de votre compte FRILO. Si elle existe, nous vous envoyons un lien pour créer un nouveau mot de passe.
            </p>
          </div>

          <div className="border-y border-gray-200 py-6">
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full justify-center rounded-full bg-black px-7 py-3.5 text-sm font-black text-white transition-colors hover:bg-gray-900 disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi en cours' : 'Envoyer le lien'}
              </button>
            </form>

            <p className="mt-6 text-sm leading-6 text-gray-500">
              Pensez aussi à vérifier vos courriers indésirables si le message tarde à arriver.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
