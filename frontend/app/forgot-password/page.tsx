"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
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
        setError('Une demande a déjà été faite récemment. Veuillez patienter avant de réessayer.');
      } else {
        setError('Impossible d’envoyer le lien de réinitialisation pour le moment.');
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
            Réinitialisez<br />votre accès.
          </h2>
          <p className="text-gray-400 text-lg">
            Entrez votre e-mail et recevez un lien sécurisé pour créer un nouveau mot de passe.
          </p>
        </div>
        <p className="text-gray-600 text-sm">© {new Date().getFullYear()} FRILO. Tous droits réservés.</p>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 bg-white">
        <Link href="/" className="text-xl font-black mb-12 lg:hidden">FRILO</Link>

        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-3xl font-black text-black tracking-tight mb-2">Mot de passe oublié</h1>
          <p className="text-gray-500 text-sm mb-10">
            Vous vous souvenez de votre mot de passe ?{' '}
            <Link href="/login" className="text-black font-semibold underline underline-offset-2">
              Retour à la connexion
            </Link>
          </p>

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

            <button
              type="submit"
              disabled={isSubmitting}
              className="sq-btn sq-btn-black w-full justify-center disabled:opacity-50"
            >
              {isSubmitting ? 'Envoi…' : 'Envoyer le lien de réinitialisation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

