'use client';

import { useEffect, useState } from 'react';
import {
  ClientButton,
  ClientPage,
  ClientPageHeader,
  ClientPanel,
  ClientPanelHeader,
  CompactRow,
  StatusBand,
  StatusPill,
} from '@/components/dashboard/client-ui';
import { businessService, Order } from '@/services/business.service';

function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const { protocol } = new URL(url);

    return protocol === 'https:' || protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;

  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getSiteName(site: Order): string {
  return site.instruction?.enterprise_name
    || site.instructions?.[0]?.enterprise_name
    || site.template?.name
    || 'Site livré';
}

function getTemplateContext(site: Order): string {
  const template = site.template?.name ?? 'Modèle FRILO';
  const sector = site.template?.sector?.name;

  return sector ? `${template} · ${sector}` : template;
}

function LoadingRows() {
  return (
    <div className="divide-y divide-neutral-100">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="px-4 py-4 md:px-5">
          <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

const externalActionClasses = 'inline-flex h-10 items-center justify-center rounded-md bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2';

export default function MonSitePage() {
  const [sites, setSites] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError(null);

    businessService
      .getOrders(1, 50, { status: 'completed' })
      .then((res) => {
        if (!isMounted) return;
        setSites(res.data.filter((order) => order.status === 'completed'));
      })
      .catch(() => {
        if (!isMounted) return;
        setSites([]);
        setError('Impossible de charger les informations de votre site pour le moment.');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const siteCountLabel = `${sites.length} site${sites.length > 1 ? 's' : ''} livré${sites.length > 1 ? 's' : ''}`;

  if (loading) {
    return (
      <ClientPage>
        <ClientPageHeader
          title="Mon site"
          description="Votre site FRILO apparaît ici dès qu’il est livré."
        />

        <ClientPanel>
          <ClientPanelHeader
            title="Chargement du site"
            description="Nous récupérons les informations de livraison, domaine et hébergement."
            action={<StatusPill tone="info">Chargement</StatusPill>}
          />
          <LoadingRows />
        </ClientPanel>
      </ClientPage>
    );
  }

  if (error) {
    return (
      <ClientPage>
        <ClientPageHeader
          title="Mon site"
          description="Votre site FRILO apparaît ici dès qu’il est livré."
        />

        <StatusBand
          title="Impossible de charger votre site"
          description={`${error} Vérifiez votre connexion ou réessayez dans un instant.`}
          tone="danger"
          status={<StatusPill tone="danger">Erreur</StatusPill>}
          action={
            <ClientButton
              onClick={() => {
                setReloadKey((value) => value + 1);
              }}
            >
              Réessayer
            </ClientButton>
          }
          secondaryAction={<ClientButton href="/dashboard/orders" variant="secondary">Voir mes commandes</ClientButton>}
        />
      </ClientPage>
    );
  }

  if (sites.length === 0) {
    return (
      <ClientPage>
        <ClientPageHeader title="Mon site" description="Votre site FRILO apparaît ici dès qu’il est livré." />
        <StatusBand
          title="Votre site est en préparation"
          description="Suivez la commande en cours. Les informations de domaine, hébergement et URL seront affichées après livraison."
          status={<StatusPill tone="warning">En préparation</StatusPill>}
          action={<ClientButton href="/dashboard/orders">Voir ma commande</ClientButton>}
          secondaryAction={<ClientButton href="/templates" variant="secondary">Explorer les modèles</ClientButton>}
        />
      </ClientPage>
    );
  }

  return (
    <ClientPage>
      <ClientPageHeader
        title="Mon site"
        description="Retrouvez les accès, le domaine, l’hébergement et les options liées à votre site livré."
        meta={siteCountLabel}
        action={<ClientButton href="/dashboard/orders" variant="secondary">Mes commandes</ClientButton>}
      />

      {sites.map((site) => (
        <ClientPanel key={site.id} className="mb-5 last:mb-0">
          <ClientPanelHeader
            title={getSiteName(site)}
            description={getTemplateContext(site)}
            action={
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="success">Livré</StatusPill>
                {safeHref(site.site_url) && (
                  <a
                    href={safeHref(site.site_url)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={externalActionClasses}
                  >
                    Ouvrir le site
                  </a>
                )}
                <ClientButton href={`/dashboard/orders/${site.id}`} variant="secondary">Voir la commande</ClientButton>
              </div>
            }
          />

          <div>
            <CompactRow
              title="Modèle"
              description={site.template?.name ?? 'Modèle FRILO'}
              meta={site.template?.sector?.name ? `Secteur : ${site.template.sector.name}` : 'Secteur non renseigné'}
            />
            <CompactRow
              title="URL du site"
              description={safeHref(site.site_url) ?? 'L’URL publique sera ajoutée après la mise en ligne.'}
              meta={safeHref(site.site_url) ? <StatusPill tone="success">Active</StatusPill> : <StatusPill tone="neutral">Non renseignée</StatusPill>}
              action={safeHref(site.site_url) ? (
                <a
                  href={safeHref(site.site_url)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-black underline underline-offset-4"
                >
                  Ouvrir
                </a>
              ) : undefined}
            />
            <CompactRow
              title="Domaine"
              description={site.domain || 'Domaine non renseigné pour ce site.'}
              meta={site.domain ? <StatusPill tone="success">Configuré</StatusPill> : <StatusPill tone="neutral">En attente</StatusPill>}
            />
            <CompactRow
              title="Prévisualisation"
              description={safeHref(site.preview_url) ?? 'Aucune URL de prévisualisation disponible.'}
              meta={safeHref(site.preview_url) ? <StatusPill tone="info">Disponible</StatusPill> : <StatusPill tone="neutral">Non publiée</StatusPill>}
              action={safeHref(site.preview_url) ? (
                <a
                  href={safeHref(site.preview_url)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-black underline underline-offset-4"
                >
                  Voir
                </a>
              ) : undefined}
            />
            <CompactRow
              title="Échéance hébergement"
              description={formatDate(site.hosting_expires_at) ?? 'Aucune date d’échéance renseignée.'}
              meta={site.hosting_expires_at ? <StatusPill tone="warning">À surveiller</StatusPill> : <StatusPill tone="neutral">Non renseignée</StatusPill>}
            />
          </div>

          {site.selected_options && site.selected_options.length > 0 && (
            <div className="border-t border-neutral-100">
              <div className="px-4 py-3 md:px-5">
                <p className="text-sm font-bold text-black">Options sélectionnées</p>
                <p className="mt-1 text-sm text-neutral-600">
                  {site.selected_options.length} option{site.selected_options.length > 1 ? 's' : ''} associée{site.selected_options.length > 1 ? 's' : ''} à cette commande.
                </p>
              </div>
              <div>
                {site.selected_options.map((option) => (
                  <CompactRow
                    key={`${site.id}-${option.id ?? option.name}`}
                    title={option.name}
                    description={`${option.price.toLocaleString('fr-FR')} FCFA`}
                  />
                ))}
              </div>
            </div>
          )}
        </ClientPanel>
      ))}
    </ClientPage>
  );
}
