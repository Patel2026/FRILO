"use client"

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import axios from 'axios';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { authService, registerSchema, RegisterCredentials } from '@/services/auth.service';
import { businessService, Sector } from '@/services/business.service';

function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/dashboard';

  return next;
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get('next'));
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(true);
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
    setError(null);
    try {
      await authService.register(data);
      router.push(nextPath);
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
          <p className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Nouveau client</p>
          <h2 className="max-w-xl text-5xl font-black leading-[0.98]">
            Préparez votre commande sans repartir de zéro.
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-white/60">
            Votre compte conserve vos informations principales et facilite les prochaines étapes avec l’équipe FRILO.
          </p>
        </div>
        <p className="text-sm text-white/30">© {new Date().getFullYear()} FRILO. Tous droits réservés.</p>
      </div>

      <div className="flex flex-1 flex-col justify-center bg-white px-6 py-7 md:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-sm md:max-w-lg">
          <Link href="/" className="mb-7 inline-flex w-[104px] transition-opacity hover:opacity-80 lg:hidden" aria-label="Accueil FRILO">
            <BrandLogo variant="dark" priority />
          </Link>

          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Inscription</p>
          <h1 className="text-3xl font-black leading-tight text-slate-950 md:text-4xl">
            {nextPath.startsWith('/commande') ? 'Créez votre compte pour vérifier la commande.' : 'Créez votre compte.'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {nextPath.startsWith('/commande')
              ? 'Votre sélection est conservée. Vous reviendrez ensuite au récapitulatif avant paiement.'
              : 'Renseignez vos informations principales. Vous pourrez compléter votre projet ensuite.'}
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Déjà inscrit ?{' '}
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-black text-slate-950 underline underline-offset-4">
              Se connecter
            </Link>
          </p>

          {error && (
            <div className="mt-8 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-950">
                Nom complet
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="Votre nom"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-300 focus:border-black"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>}
              </div>

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
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-950">
                Domaine d&apos;activité
              </label>
              <select
                {...register('sector_id', { valueAsNumber: true })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-950 outline-none transition-colors focus:border-black"
                defaultValue=""
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
              {!loadingSectors && sectors.length > 0 && (
                <p className="mt-1.5 hidden text-xs leading-5 text-slate-400 sm:block">
                  Ce choix aide FRILO à adapter les modèles et les questions utiles.
                </p>
              )}
              {errors.sector_id && <p className="text-red-500 text-xs mt-1.5">{errors.sector_id.message}</p>}
              {!loadingSectors && sectors.length === 0 && (
                <p className="text-amber-600 text-xs mt-1.5">
                  Impossible de charger les domaines pour le moment. Réessayez dans quelques instants.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-950">
                  Mot de passe
                </label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-300 focus:border-black"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-950">
                  Confirmation
                </label>
                <input
                  {...register('password_confirmation')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-300 focus:border-black"
                />
                {errors.password_confirmation && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.password_confirmation.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loadingSectors || sectors.length === 0}
              className="mt-2 inline-flex w-full justify-center rounded-full bg-slate-950 px-7 py-3.5 text-sm font-black text-white transition-colors hover:bg-black disabled:opacity-50"
            >
              {isSubmitting ? 'Création…' : 'Créer mon espace'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs leading-relaxed text-slate-400">
            En créant un compte, vous acceptez nos{' '}
            <Link href="/cgu" className="underline underline-offset-4 transition-colors hover:text-slate-950">
              conditions d'utilisation
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
