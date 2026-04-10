"use client";

import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { ZodError } from 'zod';
import { Mail, User } from 'lucide-react';
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
      setSuccess('Profil mis à jour avec succès.');
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
    <div className="p-4 md:p-8 w-full">
      <div className="w-full">
        <div className="mb-8 md:mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Tableau de bord</p>
          <h1 className="text-3xl font-black text-black tracking-tight">Mon profil</h1>
          <p className="text-sm text-gray-500 mt-3">
            Mettez à jour vos informations pour recevoir des suggestions de modèles plus pertinentes.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Informations du compte</p>
          </div>

          {loading ? (
            <div className="px-6 py-10 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !user ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-gray-500">{error || 'Profil indisponible.'}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              <div className="space-y-4">
                <label htmlFor="profile-name" className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Nom</span>
                  <div className="mt-2 relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="profile-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => onFieldChange('name', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-black outline-none focus:border-black"
                      placeholder="Votre nom complet"
                      autoComplete="name"
                    />
                  </div>
                  {fieldErrors.name && <p className="mt-2 text-xs text-red-600">{fieldErrors.name}</p>}
                </label>

                <label htmlFor="profile-email" className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Adresse e-mail</span>
                  <div className="mt-2 relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="profile-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => onFieldChange('email', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm font-medium text-black outline-none focus:border-black"
                      placeholder="vous@exemple.com"
                      autoComplete="email"
                    />
                  </div>
                  {fieldErrors.email && <p className="mt-2 text-xs text-red-600">{fieldErrors.email}</p>}
                </label>

                <label htmlFor="profile-sector" className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Domaine d'activité</span>
                  <div className="mt-2">
                    <select
                      id="profile-sector"
                      value={form.sectorId}
                      onChange={(e) => onSectorChange(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 px-3 text-sm font-medium text-black outline-none focus:border-black"
                      disabled={loadingSectors}
                    >
                      <option value="">
                        {loadingSectors ? 'Chargement des domaines…' : 'Sélectionnez votre domaine'}
                      </option>
                      {sectors.map((sector) => (
                        <option key={sector.id} value={sector.id}>
                          {sector.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.sector_id && <p className="mt-2 text-xs text-red-600">{fieldErrors.sector_id}</p>}
                  {!loadingSectors && sectors.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      Les domaines sont indisponibles pour le moment.
                    </p>
                  )}
                </label>
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <p className="text-sm text-emerald-700">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="sq-btn sq-btn-black text-sm py-3 px-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
