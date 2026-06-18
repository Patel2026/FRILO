"use client"

import { useEffect, useMemo, useState } from 'react';
import {
  ClientButton,
  ClientPage,
  ClientPageHeader,
  ClientPanel,
  ClientPanelHeader,
  CompactRow,
  StatusBand,
  StatusPill,
  Timeline,
} from '@/components/dashboard/client-ui';
import { authService, AuthUser } from '@/services/auth.service';
import { businessService, Order, OrderSummary, Template } from '@/services/business.service';

type NextStep = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

type TimelineItem = Parameters<typeof Timeline>[0]['items'][number];

const statusLabels: Record<Order['status'], string> = {
  pending: 'En attente',
  processing: 'En production',
  completed: 'Livré',
  cancelled: 'Annulé',
};

const paymentLabels: Record<Order['payment_status'], string> = {
  awaiting_payment: 'Paiement en attente',
  paid: 'Payée',
  failed: 'Paiement échoué',
  cancelled: 'Paiement annulé',
  refunded: 'Remboursée',
  expired: 'Paiement expiré',
};

function getOrderName(order: Order | null): string {
  return order?.instruction?.enterprise_name
    || order?.instructions?.[0]?.enterprise_name
    || order?.template?.name
    || 'Projet sans nom';
}

function formatOrderId(order: Order): string {
  return `Commande #${String(order.id).padStart(4, '0')}`;
}

function formatDate(value?: string | null): string | null {
  if (!value) return null;

  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatPrice(value: number): string {
  return `${value.toLocaleString('fr-FR')} FCFA`;
}

function getStatusTone(order: Order | null): Parameters<typeof StatusPill>[0]['tone'] {
  if (!order) return 'neutral';
  if (order.status === 'completed') return 'success';
  if (order.status === 'cancelled' || order.payment_status === 'failed') return 'danger';
  if (order.payment_status !== 'paid') return 'warning';
  if (order.status === 'processing') return 'info';
  return 'warning';
}

function getNextStep(order: Order | null): NextStep {
  if (!order) {
    return {
      title: 'Lancer votre premier projet FRILO',
      description: 'Choisissez un modèle, transmettez les informations de votre activité et suivez la livraison depuis cet espace.',
      ctaLabel: 'Voir les modèles',
      ctaHref: '/templates',
    };
  }

  if (order.status === 'completed') {
    return {
      title: 'Site livré',
      description: 'Votre site est livré. Retrouvez son lien, son domaine et les informations utiles dans Mon Site.',
      ctaLabel: 'Ouvrir Mon Site',
      ctaHref: '/dashboard/mon-site',
    };
  }

  if (order.status === 'cancelled') {
    return {
      title: 'Dossier annulé',
      description: 'Cette commande est annulée. Vous pouvez consulter le dossier ou relancer un nouveau projet depuis les modèles.',
      ctaLabel: 'Voir le dossier',
      ctaHref: `/dashboard/orders/${order.id}`,
    };
  }

  if (order.payment_status !== 'paid') {
    return {
      title: 'Finaliser le paiement',
      description: 'Votre demande est enregistrée. Le paiement déclenche la prise en charge par l’équipe FRILO.',
      ctaLabel: 'Payer maintenant',
      ctaHref: `/dashboard/orders/${order.id}`,
    };
  }

  if (order.status === 'pending') {
    return {
      title: 'Validation du dossier',
      description: 'Votre paiement est validé. L’équipe FRILO vérifie les informations avant le démarrage de la production.',
      ctaLabel: 'Suivre le dossier',
      ctaHref: `/dashboard/orders/${order.id}`,
    };
  }

  return {
    title: 'Production en cours',
    description: 'Votre site est en construction. Vous pouvez suivre l’avancement et relire les informations transmises.',
    ctaLabel: 'Voir l’avancement',
    ctaHref: `/dashboard/orders/${order.id}`,
  };
}

function getTimelineItems(order: Order | null): TimelineItem[] {
  if (!order) {
    return [
      {
        title: 'Espace client prêt',
        description: 'Votre compte FRILO est disponible pour lancer et suivre un projet.',
        tone: 'done',
      },
      {
        title: 'Choisir un modèle',
        description: 'Sélectionnez la base la plus proche de votre activité.',
        tone: 'current',
      },
      {
        title: 'Transmettre les informations',
        description: 'Nom de l’entreprise, activité, couleurs et consignes de personnalisation.',
        tone: 'waiting',
      },
      {
        title: 'Livraison du site',
        description: 'FRILO publie les informations du site une fois la production terminée.',
        tone: 'waiting',
      },
    ];
  }

  const paymentDone = order.payment_status === 'paid' || order.status === 'completed';
  const dossierDone = paymentDone && (order.status === 'pending' || order.status === 'processing' || order.status === 'completed');
  const productionDone = order.status === 'completed';

  return [
    {
      title: 'Commande créée',
      description: order.template?.name ? `Modèle sélectionné : ${order.template.name}.` : 'Dossier créé dans votre espace client.',
      meta: formatDate(order.created_at) ?? undefined,
      tone: 'done',
    },
    {
      title: 'Paiement',
      description: paymentDone ? 'Paiement validé pour lancer le traitement.' : 'Paiement requis avant le démarrage de la production.',
      meta: paymentLabels[order.payment_status],
      tone: paymentDone ? 'done' : 'current',
    },
    {
      title: 'Préparation du dossier',
      description: dossierDone ? 'Les informations client sont en cours de contrôle.' : 'Cette étape démarre après paiement.',
      tone: !paymentDone ? 'waiting' : order.status === 'pending' ? 'current' : 'done',
    },
    {
      title: 'Production FRILO',
      description: order.status === 'processing' ? 'Le site est en cours de finalisation.' : 'Personnalisation, vérification et mise en ligne.',
      tone: order.status === 'processing' ? 'current' : productionDone ? 'done' : 'waiting',
    },
    {
      title: 'Site livré',
      description: productionDone ? 'Les accès et informations du site sont disponibles.' : 'La livraison apparaîtra ici dès validation finale.',
      meta: order.site_url || order.domain || undefined,
      tone: productionDone ? 'done' : 'waiting',
    },
  ];
}

function LoadingRows() {
  return (
    <div className="divide-y divide-neutral-100">
      {[0, 1, 2].map((item) => (
        <div key={item} className="px-4 py-4 md:px-5">
          <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<Template[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      authService.getUser(),
      businessService.getOrders(1, 3),
      businessService.getOrders(1, 1, { status: 'completed' }),
      businessService.getOrderSummary(),
      businessService.getTemplates(),
    ]).then(([userResult, ordersResult, completedOrdersResult, summaryResult, templatesResult]) => {
      if (!isMounted) return;
      const hasCriticalFailure = userResult.status === 'rejected' || ordersResult.status === 'rejected';

      if (hasCriticalFailure) {
        setError('Impossible de charger votre console client pour le moment.');
        setOrders([]);
        setCompletedOrders([]);
        setSummary(null);
        setFeaturedTemplates([]);
        return;
      }

      const u = userResult.value;
      const ordersRes = ordersResult.value;
      const completedOrdersRes = completedOrdersResult.status === 'fulfilled' ? completedOrdersResult.value.data : [];
      const summaryRes = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
      const templatesRes = templatesResult.status === 'fulfilled' ? templatesResult.value : [];

      setError(null);
      setUser(u);
      setOrders(ordersRes.data);
      setCompletedOrders(completedOrdersRes);
      setSummary(summaryRes);

      const preferredSectorId = u?.sector_id ?? null;
      const sectorTemplates = preferredSectorId
        ? templatesRes.filter((template) => template.sector_id === preferredSectorId)
        : [];
      const suggestedTemplates = sectorTemplates.length > 0 ? sectorTemplates : templatesRes;

      setFeaturedTemplates(suggestedTemplates.slice(0, 3));
    }).finally(() => {
      if (!isMounted) return;
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const allOrders = orders;
  const latestOrder = allOrders[0] ?? null;
  const deliveredOrder = completedOrders[0] ?? allOrders.find((order) => order.status === 'completed') ?? null;
  const activeOrder = allOrders.find((order) => order.status === 'processing' || order.status === 'pending') ?? latestOrder;
  const primaryOrder = deliveredOrder ?? activeOrder ?? latestOrder;
  const projectName = primaryOrder?.instruction?.enterprise_name || primaryOrder?.instructions?.[0]?.enterprise_name || primaryOrder?.template?.name || 'Votre projet FRILO';
  const hasSite = Boolean(deliveredOrder?.site_url || deliveredOrder?.domain || deliveredOrder);

  const totalOrders = summary?.total ?? allOrders.length;
  const firstName = user?.name.split(' ')[0] ?? 'Client';
  const nextStep = useMemo(() => getNextStep(primaryOrder), [primaryOrder]);
  const timelineItems = useMemo(() => getTimelineItems(primaryOrder), [primaryOrder]);
  const deliveredSiteLabel = deliveredOrder?.site_url || deliveredOrder?.domain || (hasSite ? 'Informations disponibles dans Mon Site' : null);

  const mainBand = (() => {
    if (loading) {
      return (
        <StatusBand
          title="Chargement de votre console FRILO"
          description="Nous récupérons vos commandes, votre dossier actif et les outils disponibles."
          tone="neutral"
          status={<StatusPill>Synchronisation</StatusPill>}
          className="mb-5"
        />
      );
    }

    if (error) {
      return (
        <StatusBand
          title="Console momentanément indisponible"
          description={error}
          tone="danger"
          status={<StatusPill tone="danger">Erreur de chargement</StatusPill>}
          action={
            <ClientButton
              onClick={() => {
                setError(null);
                setLoading(true);
                setReloadKey((value) => value + 1);
              }}
            >
              Réessayer
            </ClientButton>
          }
          secondaryAction={<ClientButton href="/templates" variant="secondary">Voir les modèles</ClientButton>}
          className="mb-5"
        />
      );
    }

    if (!primaryOrder) {
      return (
        <StatusBand
          title="Lancer votre premier projet FRILO"
          description="Aucun dossier n’est encore ouvert. Comparez les modèles, choisissez celui qui correspond à votre activité, puis transmettez vos informations."
          tone="neutral"
          status={<StatusPill>Aucun dossier actif</StatusPill>}
          action={<ClientButton href="/templates">Voir les modèles</ClientButton>}
          secondaryAction={<ClientButton href="/templates/compare" variant="secondary">Comparer</ClientButton>}
          className="mb-5"
        />
      );
    }

    if (hasSite && deliveredOrder) {
      return (
        <StatusBand
          title={projectName}
          description={deliveredSiteLabel ? `Votre site est livré : ${deliveredSiteLabel}.` : 'Votre site est livré et les informations sont disponibles dans Mon Site.'}
          tone="success"
          status={<StatusPill tone="success">Site livré</StatusPill>}
          action={<ClientButton href="/dashboard/mon-site">Ouvrir Mon Site</ClientButton>}
          secondaryAction={<ClientButton href={`/dashboard/orders/${deliveredOrder.id}`} variant="secondary">Voir le dossier</ClientButton>}
          className="mb-5"
        />
      );
    }

    return (
      <StatusBand
        title={projectName}
        description={nextStep.description}
        tone={getStatusTone(primaryOrder)}
        status={
          <>
            <StatusPill tone={getStatusTone(primaryOrder)}>{statusLabels[primaryOrder.status]}</StatusPill>
            <StatusPill tone={primaryOrder.payment_status === 'paid' ? 'success' : 'warning'}>{paymentLabels[primaryOrder.payment_status]}</StatusPill>
          </>
        }
        action={<ClientButton href={nextStep.ctaHref}>{nextStep.ctaLabel}</ClientButton>}
        secondaryAction={<ClientButton href="/dashboard/orders" variant="secondary">Toutes les commandes</ClientButton>}
        className="mb-5"
      />
    );
  })();

  return (
    <ClientPage>
      <ClientPageHeader
        title={loading ? 'Bonjour.' : `Bonjour, ${firstName}.`}
        description={primaryOrder ? nextStep.description : 'Votre console rassemble le dossier de site, les outils commerciaux et les prochaines actions FRILO.'}
        meta={totalOrders > 0 ? `${totalOrders} commande${totalOrders > 1 ? 's' : ''} dans votre espace` : 'Espace client FRILO'}
        action={<ClientButton href={primaryOrder ? '/dashboard/orders' : '/templates'} variant="secondary">{primaryOrder ? 'Mes commandes' : 'Démarrer'}</ClientButton>}
      />

      {mainBand}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <ClientPanel>
          <ClientPanelHeader
            title="Suivi du dossier"
            description={primaryOrder ? `${formatOrderId(primaryOrder)} · ${getOrderName(primaryOrder)}` : 'Les étapes de votre premier projet apparaîtront ici.'}
            action={primaryOrder ? <StatusPill tone={getStatusTone(primaryOrder)}>{statusLabels[primaryOrder.status]}</StatusPill> : undefined}
          />
          <div className="px-4 py-5 md:px-5">
            {loading ? <LoadingRows /> : <Timeline items={timelineItems} />}
          </div>
        </ClientPanel>

        <ClientPanel>
          <ClientPanelHeader
            title="Outils disponibles"
            description="Accès rapides liés à votre site, vos clients et votre suivi d’activité."
          />
          {loading ? (
            <LoadingRows />
          ) : error ? (
            <div>
              <CompactRow
                title="Outils indisponibles"
                description="Rechargez le tableau de bord pour retrouver vos modules FRILO."
                meta={<StatusPill tone="neutral">Contexte non chargé</StatusPill>}
                action={
                  <ClientButton
                    variant="secondary"
                    onClick={() => {
                      setError(null);
                      setLoading(true);
                      setReloadKey((value) => value + 1);
                    }}
                  >
                    Réessayer
                  </ClientButton>
                }
              />
            </div>
          ) : (
            <div>
              <CompactRow
                title="Mon Site"
                description={hasSite ? 'Lien, domaine, hébergement et informations de livraison.' : 'Disponible dès que FRILO marque votre site comme livré.'}
                meta={<StatusPill tone={hasSite ? 'success' : 'neutral'}>{hasSite ? 'Actif' : 'En attente'}</StatusPill>}
                href="/dashboard/mon-site"
              />
              <CompactRow
                title="Mes Clients"
                description={hasSite ? 'Enregistrez les prospects et clients générés par votre nouveau site.' : 'Préparez votre fichier client avant la mise en ligne.'}
                meta={<StatusPill tone={hasSite ? 'success' : 'info'}>{hasSite ? 'Disponible' : 'Prêt à remplir'}</StatusPill>}
                href="/dashboard/contacts"
              />
              <CompactRow
                title="Ma Caisse"
                description={totalOrders > 0 ? 'Suivez les entrées et dépenses liées à votre activité.' : 'Votre suivi financier client reste accessible à tout moment.'}
                meta={<StatusPill tone="neutral">Module client</StatusPill>}
                href="/dashboard/caisse"
              />
              <CompactRow
                title="Mes Échéances"
                description={deliveredOrder?.hosting_expires_at ? 'La prochaine date d’hébergement est visible dans votre espace.' : 'Ajoutez vos rappels et retrouvez les échéances FRILO.'}
                meta={deliveredOrder?.hosting_expires_at ? `Hébergement : ${formatDate(deliveredOrder.hosting_expires_at)}` : <StatusPill tone="neutral">À organiser</StatusPill>}
                href="/dashboard/echeances"
              />
            </div>
          )}
        </ClientPanel>
      </div>

      <ClientPanel className="mt-5">
        <ClientPanelHeader
          title="Activité récente"
          description={allOrders.length > 0 ? 'Les derniers dossiers suivis dans votre espace client.' : 'Suggestions pour lancer votre premier dossier.'}
          action={!loading && allOrders.length > 0 ? <ClientButton href="/dashboard/orders" variant="ghost">Tout voir</ClientButton> : undefined}
        />
        {loading ? (
          <LoadingRows />
        ) : error ? (
          <div className="px-4 py-5 md:px-5">
            <StatusBand
              title="Impossible d’afficher l’activité"
              description="Réessayez le chargement pour récupérer vos dernières commandes."
              tone="danger"
              action={
                <ClientButton
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    setReloadKey((value) => value + 1);
                  }}
                >
                  Réessayer
                </ClientButton>
              }
            />
          </div>
        ) : allOrders.length > 0 ? (
          <div>
            {allOrders.map((order) => (
              <CompactRow
                key={order.id}
                title={getOrderName(order)}
                description={[
                  order.template?.name,
                  formatDate(order.created_at),
                  formatPrice(order.price),
                ].filter(Boolean).join(' · ')}
                meta={
                  <span className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={getStatusTone(order)}>{statusLabels[order.status]}</StatusPill>
                    <span>{formatOrderId(order)}</span>
                  </span>
                }
                href={`/dashboard/orders/${order.id}`}
              />
            ))}
          </div>
        ) : (
          <div>
            {featuredTemplates.length > 0 ? (
              featuredTemplates.map((template) => (
                <CompactRow
                  key={template.id}
                  title={template.name}
                  description={template.sector?.name ? `Modèle ${template.sector.name}` : 'Modèle prêt à personnaliser'}
                  meta={formatPrice(template.price)}
                  href={`/templates/${template.id}`}
                />
              ))
            ) : (
              <CompactRow
                title="Explorer le catalogue FRILO"
                description="Choisissez un modèle adapté à votre activité pour ouvrir votre premier dossier."
                meta={<StatusPill>Premier projet</StatusPill>}
                href="/templates"
              />
            )}
          </div>
        )}
      </ClientPanel>
    </ClientPage>
  );
}
