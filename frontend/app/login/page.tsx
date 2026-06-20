"use client"

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import axios from 'axios';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { authService, loginSchema, LoginCredentials } from '@/services/auth.service';

function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/dashboard';

  return next;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get('next'));
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
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
        router.replace(nextPath);
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
  }, [nextPath, router]);

  const onSubmit = async (data: LoginCredentials) => {
    setError(null);
    try {
      await authService.login(data);
      router.push(nextPath);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setError('Email ou mot de passe incorrect.');
      } else if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden bg-[oklch(7%_0.006_29)] p-16 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <Link href="/" className="inline-flex w-[118px] transition-opacity hover:opacity-80" aria-label="Accueil FRILO">
          <BrandLogo variant="light" priority />
        </Link>
        <div>
          <p className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Espace client</p>
          <h2 className="max-w-xl text-5xl font-black leading-[0.98]">
            Votre projet FRILO, au même endroit.
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-white/60">
            Retrouvez l’avancement, les informations transmises et les prochaines actions liées à votre commande.
          </p>
        </div>
        <p className="text-sm text-white/30">© {new Date().getFullYear()} FRILO. Tous droits réservés.</p>
      </div>

      <div className="flex flex-1 flex-col justify-center bg-white px-6 py-10 md:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-12 inline-flex w-[104px] transition-opacity hover:opacity-80 lg:hidden" aria-label="Accueil FRILO">
            <BrandLogo variant="dark" priority />
          </Link>

          <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Connexion</p>
          <h1 className="text-3xl font-black leading-tight text-slate-950">
            {nextPath.startsWith('/commande') ? 'Connectez-vous pour vérifier votre commande.' : 'Accédez à votre espace.'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {nextPath.startsWith('/commande')
              ? 'Votre saisie est conservée. Après connexion, vous revenez directement à la vérification.'
              : 'Utilisez l’adresse e-mail associée à votre commande FRILO.'}
          </p>
          <p className="mt-5 text-sm text-slate-500">
            Pas encore de compte ?{' '}
            <Link href={`/register?next=${encodeURIComponent(nextPath)}`} className="font-black text-slate-950 underline underline-offset-4">
              S'inscrire
            </Link>
          </p>

          {error && (
            <div className="mt-8 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-950">
                Adresse e-mail
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="vous@exemple.com"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-300 focus:border-black"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-950">
                  Mot de passe
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-950">
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-300 focus:border-black"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex w-full justify-center rounded-full bg-slate-950 px-7 py-3.5 text-sm font-black text-white transition-colors hover:bg-black disabled:opacity-50"
            >
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
