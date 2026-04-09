"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Mail, Shield } from 'lucide-react';
import { authService, AuthUser } from '@/services/auth.service';

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getUser()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-2xl">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Tableau de bord</p>
        <h1 className="text-3xl font-black text-black tracking-tight">Mon profil</h1>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Informations du compte</p>
        </div>

        {loading ? (
          <div className="px-6 py-6 space-y-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-9 h-9 bg-gray-100 rounded-xl animate-pulse flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : user ? (
          <div className="divide-y divide-gray-50">
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Nom</p>
                <p className="text-sm font-semibold text-black">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Adresse e-mail</p>
                <p className="text-sm font-semibold text-black">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Rôle</p>
                <p className="text-sm font-semibold text-black capitalize">{user.role === 'client' ? 'Client' : 'Administrateur'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-400">Impossible de charger le profil.</p>
          </div>
        )}
      </div>

      {/* Notice */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
        <p className="text-sm font-semibold text-black mb-1">Modification du profil</p>
        <p className="text-sm text-gray-500">
          La mise à jour des informations de compte sera disponible prochainement.
          Pour toute modification urgente, contactez le support.
        </p>
        <div className="mt-4">
          <Link href="/contact" className="sq-btn sq-btn-outline-black text-sm py-2.5 px-5">
            Contacter le support
          </Link>
        </div>
      </div>
    </div>
  );
}
