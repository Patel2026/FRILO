"use client";

import { FormEvent, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ZodError } from 'zod';
import { AlertTriangle, CheckCircle2, Mail, Save, User } from 'lucide-react';
import { authService, AuthUser } from '@/services/auth.service';
import { businessService, Sector } from '@/services/business.service';

interface ProfileFormState {
  name: string;
  email: string;
  sectorId: number | '';
}

interface ProfileFieldErrors {
  name?: string;
  email?: string;
  sector_id?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [form, setForm] = useState<ProfileFormState>({ name: '', email: '', sectorId: '' });
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    authService.getUser()
      .then((currentUser) => {
        if (!isMounted) return;

        if (!currentUser) {
          setUser(null);
          setError('Impossible de charger votre profil pour le moment.');
          return;
        }

        setUser(currentUser);
        setForm({
          name: currentUser.name,
          email: currentUser.email,
          sectorId: currentUser.sector_id ?? '',
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Impossible de charger votre profil pour le moment.');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    businessService.getSectors()
      .then((sectorList) => {
        if (!isMounted) return;
        setSectors(sectorList);
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

  const selectedSector = useMemo(() => {
    if (form.sectorId === '') return null;
    return sectors.find((sector) => sector.id === form.sectorId) ?? user?.sector ?? null;
  }, [form.sectorId, sectors, user]);

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      form.name.trim() !== user.name ||
      form.email.trim() !== user.email ||
      (form.sectorId === '' ? null : Number(form.sectorId)) !== user.sector_id
    );
  }, [form, user]);

  const onFieldChange = (field: 'name' | 'email', value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError(null);
    setSuccess(null);
  };

  const onSectorChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      sectorId: value === '' ? '' : Number(value),
    }));
    setFieldErrors((prev) => ({ ...prev, sector_id: undefined }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    try {
      const updatedUser = await authService.updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        sector_id: form.sectorId === '' ? null : Number(form.sectorId),
      });

      setUser(updatedUser);
      setForm({
        name: updatedUser.name,
        email: updatedUser.email,
        sectorId: updatedUser.sector_id ?? '',
      });
      setSuccess('Profil mis à jour.');
    } catch (submitError) {
      if (submitError instanceof ZodError) {
        const zodErrors: ProfileFieldErrors = {};
        for (const issue of submitError.issues) {
          const path = issue.path[0];
          if (path === 'name' || path === 'email' || path === 'sector_id') {
            zodErrors[path] = issue.message;
          }
        }
        setFieldErrors(zodErrors);
        setError('Veuillez corriger les champs invalides.');
      } else if (axios.isAxiosError(submitError) && submitError.response?.status === 422) {
        const apiErrors = submitError.response.data?.errors ?? {};
        setFieldErrors({
          name: Array.isArray(apiErrors.name) ? apiErrors.name[0] : undefined,
          email: Array.isArray(apiErrors.email) ? apiErrors.email[0] : undefined,
          sector_id: Array.isArray(apiErrors.sector_id) ? apiErrors.sector_id[0] : undefined,
        });
        setError('Veuillez corriger les erreurs de validation.');
      } else {
        setError("La mise à jour n'a pas pu être enregistrée. Veuillez réessayer.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[1180px] p-4 md:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Espace client</p>
          <h1 className="text-3xl font-black tracking-tight text-black">Mon profil</h1>
          <p className="mt-2 max-w-xl text-sm text-gray-500">
            Gardez vos informations à jour pour recevoir un suivi clair et des modèles mieux adaptés.
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-black text-white">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-black">{user.name}</p>
              <p className="truncate text-xs font-semibold text-gray-400">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="border-y border-gray-200 py-8">
          <div className="space-y-3">
            <div className="h-5 w-56 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ) : !user ? (
        <div className="border-y border-gray-200 py-10">
          <AlertTriangle className="mb-3 h-9 w-9 text-amber-400" />
          <p className="max-w-xl text-sm text-gray-500">{error || 'Profil indisponible.'}</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form onSubmit={handleSubmit} className="border-y border-gray-200">
            <div className="grid gap-5 border-b border-gray-100 py-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
              <div>
                <label htmlFor="profile-name" className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Nom
                </label>
                <p className="mt-2 text-sm text-gray-500">Nom affiché sur votre espace client.</p>
              </div>
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="profile-name"
                    type="text"
                    value={form.name}
                    onChange={(event) => onFieldChange('name', event.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-black outline-none transition-colors focus:border-black"
                    placeholder="Votre nom complet"
                    autoComplete="name"
                  />
                </div>
                {fieldErrors.name && <p className="mt-2 text-xs font-semibold text-red-600">{fieldErrors.name}</p>}
              </div>
            </div>

            <div className="grid gap-5 border-b border-gray-100 py-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
              <div>
                <label htmlFor="profile-email" className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Adresse e-mail
                </label>
                <p className="mt-2 text-sm text-gray-500">Utilisée pour votre connexion et le suivi FRILO.</p>
              </div>
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="profile-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => onFieldChange('email', event.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-black outline-none transition-colors focus:border-black"
                    placeholder="vous@exemple.com"
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && <p className="mt-2 text-xs font-semibold text-red-600">{fieldErrors.email}</p>}
              </div>
            </div>

            <div className="grid gap-5 border-b border-gray-100 py-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
              <div>
                <label htmlFor="profile-sector" className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Domaine d'activité
                </label>
                <p className="mt-2 text-sm text-gray-500">Aide FRILO à vous proposer des modèles pertinents.</p>
              </div>
              <div>
                <select
                  id="profile-sector"
                  value={form.sectorId}
                  onChange={(event) => onSectorChange(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-black outline-none transition-colors focus:border-black"
                  disabled={loadingSectors}
                >
                  <option value="">
                    {loadingSectors ? 'Chargement des domaines' : 'Sélectionnez votre domaine'}
                  </option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.sector_id && <p className="mt-2 text-xs font-semibold text-red-600">{fieldErrors.sector_id}</p>}
                {!loadingSectors && sectors.length === 0 && (
                  <p className="mt-2 text-xs font-semibold text-amber-600">
                    Les domaines sont indisponibles pour le moment.
                  </p>
                )}
              </div>
            </div>

            {(error || success) && (
              <div className="py-5">
                {error && (
                  <div className="flex gap-3 rounded-xl bg-red-50 px-4 py-3 text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p className="text-sm font-semibold">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="flex gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p className="text-sm font-semibold">{success}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Enregistrement' : 'Enregistrer'}
              </button>
              {!hasChanges && !saving && (
                <p className="text-sm font-semibold text-gray-400">Aucune modification en attente.</p>
              )}
            </div>
          </form>

          <aside className="border-y border-gray-200 py-6">
            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-400">Compte</p>
            <dl className="divide-y divide-gray-100 text-sm">
              <div className="flex items-center justify-between gap-6 py-4">
                <dt className="font-semibold text-gray-500">Statut</dt>
                <dd className="font-black text-black">{user.is_active ? 'Actif' : 'Suspendu'}</dd>
              </div>
              <div className="flex items-center justify-between gap-6 py-4">
                <dt className="font-semibold text-gray-500">Espace</dt>
                <dd className="font-black text-black">Client</dd>
              </div>
              <div className="flex items-center justify-between gap-6 py-4">
                <dt className="font-semibold text-gray-500">Domaine</dt>
                <dd className="max-w-[160px] truncate text-right font-black text-black">
                  {selectedSector?.name || 'Non renseigné'}
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-6 text-gray-500">
              Ces informations servent au suivi de vos commandes et à la personnalisation des modèles proposés.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
