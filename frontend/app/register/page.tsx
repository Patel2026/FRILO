"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { authService, registerSchema, RegisterCredentials } from '@/services/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
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

  const onSubmit = async (data: RegisterCredentials) => {
    setError(null);
    try {
      await authService.register(data);
      router.push('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors as Record<string, string[]>)[0][0];
        setError(firstError);
      } else if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
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

      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white flex-col justify-between p-16">
        <Link href="/" className="text-2xl font-black tracking-tight">FRILO</Link>
        <div>
          <h2 className="sq-heading text-white mb-6">
            Votre site,<br />en 48h.
          </h2>
          <p className="text-gray-400 text-lg">
            Créez votre compte et commandez votre site vitrine professionnel dès aujourd'hui.
          </p>
        </div>
        <p className="text-gray-600 text-sm">© {new Date().getFullYear()} FRILO. Tous droits réservés.</p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 bg-white">

        {/* Mobile logo */}
        <Link href="/" className="text-xl font-black mb-12 lg:hidden">FRILO</Link>

        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-3xl font-black text-black tracking-tight mb-2">Créer un compte</h1>
          <p className="text-gray-500 text-sm mb-10">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-black font-semibold underline underline-offset-2">
              Se connecter
            </Link>
          </p>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">
                Nom complet
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="Jean Dupont"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
            </div>

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
                Mot de passe
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
              disabled={isSubmitting}
              className="sq-btn sq-btn-black w-full justify-center mt-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-8 leading-relaxed">
            En créant un compte, vous acceptez nos{' '}
            <Link href="/cgu" className="underline underline-offset-2 hover:text-black transition-colors">
              conditions d'utilisation
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
