'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { businessService, Order } from '@/services/business.service';

export default function MonSitePage() {
  const [sites, setSites]     = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    businessService
      .getOrders(1, 50, { status: 'completed' })
      .then((res) => setSites(res.data.filter((o) => o.status === 'completed')))
      .catch(() => setError('Impossible de charger les informations du site.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>;
  }

  if (sites.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-medium text-gray-700">Votre site est en cours de préparation.</p>
        <p className="mt-1 text-sm text-gray-500">
          Vous retrouverez ici toutes les informations une fois la livraison effectuée.
        </p>
        <Link href="/dashboard/orders" className="mt-4 inline-block text-sm text-[var(--color-primary)] underline">
          Voir l&apos;état de ma commande →
        </Link>
      </div>
    );
  }

  function safeHref(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
      const { protocol } = new URL(url);
      return protocol === 'https:' || protocol === 'http:' ? url : null;
    } catch { return null; }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Mon Site</h1>

      {sites.map((site) => (
        <div key={site.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              {site.template?.name ?? 'Template'} · {site.template?.sector?.name ?? ''}
            </span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Livré
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {safeHref(site.site_url) && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">URL du site</p>
                <a
                  href={safeHref(site.site_url)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block truncate text-sm font-medium text-[var(--color-primary)] underline"
                >
                  {site.site_url}
                </a>
              </div>
            )}

            {site.domain && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Domaine</p>
                <p className="mt-1 text-sm font-medium text-gray-800">{site.domain}</p>
              </div>
            )}

            {site.hosting_expires_at && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Hébergement expire le</p>
                <p className="mt-1 text-sm font-medium text-gray-800">
                  {new Date(site.hosting_expires_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
            )}

            {safeHref(site.preview_url) && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Prévisualisation</p>
                <a
                  href={safeHref(site.preview_url)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm text-[var(--color-primary)] underline"
                >
                  Voir la maquette →
                </a>
              </div>
            )}
          </div>

          {!site.site_url && !site.domain && (
            <p className="mt-2 text-sm italic text-gray-400">
              Les informations du site seront disponibles dès la mise en ligne.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
