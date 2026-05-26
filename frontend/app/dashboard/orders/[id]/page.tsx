"use client"

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, ArrowUpRight } from 'lucide-react';
import axios from 'axios';
import { businessService, Order, PaymentStatus } from '@/services/business.service';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: { label: 'En attente', classes: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400', next: 'FRILO attend la confirmation du paiement ou les derniers éléments.' },
  processing: { label: 'En production', classes: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400', next: 'FRILO prépare votre site avec les informations transmises.' },
  completed: { label: 'Livrée', classes: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400', next: 'Votre site est livré. Vous pouvez consulter la commande et laisser un avis.' },
  cancelled: { label: 'Annulée', classes: 'bg-red-50 text-red-700', dot: 'bg-red-400', next: 'Cette commande est annulée. Contactez le support si besoin.' },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; classes: string; next: string }> = {
  awaiting_payment: { label: 'Paiement en attente', classes: 'bg-amber-50 text-amber-700', next: 'Le paiement doit être confirmé avant la production.' },
  paid: { label: 'Payée', classes: 'bg-emerald-50 text-emerald-700', next: 'Le paiement est confirmé. FRILO peut avancer sur la production.' },
  failed: { label: 'Paiement échoué', classes: 'bg-red-50 text-red-700', next: 'Le paiement n’a pas abouti. Vous pouvez relancer le paiement.' },
  cancelled: { label: 'Paiement annulé', classes: 'bg-gray-100 text-gray-700', next: 'Le paiement a été annulé. Contactez le support si ce n’était pas prévu.' },
  refunded: { label: 'Remboursée', classes: 'bg-sky-50 text-sky-700', next: 'Le paiement a été remboursé.' },
  expired: { label: 'Paiement expiré', classes: 'bg-slate-100 text-slate-700', next: 'Le lien de paiement a expiré. Vous pouvez générer un nouveau lien.' },
};

const stepLabels = [
  'Commande reçue',
  'Paiement confirmé',
  'Production FRILO',
  'Site livré',
];

function getInstruction(order: Order) {
  return order.instruction || order.instructions?.[0] || null;
}

function getCurrentStep(order: Order, paymentStatus: PaymentStatus) {
  if (order.status === 'completed') return 4;
  if (order.status === 'processing') return 3;
  if (paymentStatus === 'paid') return 2;
  return 1;
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    businessService.getOrder(orderId)
      .then((response) => {
        if (!isMounted) return;
        setOrder(response);
      })
      .catch(() => {
        if (!isMounted) return;
        setOrder(null);
        setError('Impossible de charger cette commande ou accès non autorisé.');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId, reloadKey]);

  const status = useMemo(() => {
    if (!order) return null;
    return statusConfig[order.status] || {
      label: order.status,
      classes: 'bg-gray-50 text-gray-600',
      dot: 'bg-gray-400',
      next: 'Consultez les détails de cette commande.',
    };
  }, [order]);

  const paymentStatusValue = (order?.payment_status || 'awaiting_payment') as PaymentStatus;
  const paymentStatus = paymentStatusConfig[paymentStatusValue] || paymentStatusConfig.awaiting_payment;
  const canPay = order && order.status !== 'cancelled' && paymentStatusValue !== 'paid' && paymentStatusValue !== 'refunded';
  const instruction = order ? getInstruction(order) : null;
  const projectName = instruction?.enterprise_name || 'Projet sans nom';
  const currentStep = order ? getCurrentStep(order, paymentStatusValue) : 1;

  const handleStartPayment = async () => {
    if (!order) return;

    setIsStartingPayment(true);
    setPaymentError(null);

    try {
      const response = await businessService.initiateOrderPayment(order.id, { mode: 'checkout' });
      const checkoutUrl = response.payment?.checkout_url;
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }
      setReloadKey(v => v + 1);
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && typeof requestError.response?.data?.message === 'string') {
        setPaymentError(requestError.response.data.message);
      } else {
        setPaymentError('Impossible de relancer le paiement pour le moment.');
      }
    } finally {
      setIsStartingPayment(false);
    }
  };

  return (
    <div className="w-full max-w-[1180px] p-4 md:p-6">
      <div className="mb-6 border-b border-gray-200 pb-5">
        <Link
          href="/dashboard/orders"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux commandes
        </Link>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Commande #{order ? String(order.id).padStart(4, '0') : '0000'}</p>
            <h1 className="text-3xl font-black tracking-tight text-black">{loading ? 'Chargement' : projectName}</h1>
            <p className="mt-2 max-w-xl text-sm text-gray-500">
              {order
                ? `${order.template?.name || 'Modèle'}${order.template?.sector?.name ? ` · ${order.template.sector.name}` : ''}`
                : 'Suivi de commande FRILO'}
            </p>
          </div>
          {order?.created_at && (
            <p className="text-sm font-semibold text-gray-400">
              {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="border-y border-gray-200 py-8">
          <div className="space-y-3">
            <div className="h-5 w-56 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ) : error ? (
        <div className="border-y border-gray-200 py-12">
          <AlertTriangle className="mb-3 h-10 w-10 text-amber-400" />
          <p className="mb-6 max-w-xl text-sm text-gray-500">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              setReloadKey(v => v + 1);
            }}
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-black text-white transition-colors hover:bg-gray-900"
          >
            Réessayer
          </button>
        </div>
      ) : order && status ? (
        <div className="space-y-8">
          <section className="border-y border-gray-200">
            <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <div className="border-b border-gray-100 py-5 md:border-b-0 md:pr-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">État commande</p>
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", status.classes)}>
                  <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", status.dot)} />
                  {status.label}
                </span>
                <p className="mt-3 max-w-sm text-sm text-gray-500">{status.next}</p>
              </div>
              <div className="border-b border-gray-100 py-5 md:border-b-0 md:px-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Paiement</p>
                <span className={cn("inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold", paymentStatus.classes)}>
                  {paymentStatus.label}
                </span>
                <p className="mt-3 max-w-sm text-sm text-gray-500">{paymentStatus.next}</p>
              </div>
              <div className="py-5 md:pl-8 md:text-right">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Total</p>
                <p className="text-xl font-black text-black">{order.price.toLocaleString('fr-FR')} FCFA</p>
                {order.paid_at && (
                  <p className="mt-2 text-xs font-semibold text-gray-400">
                    Payée le {new Date(order.paid_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </section>

          {canPay && (
            <section className="bg-black px-5 py-5 text-white md:px-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-red-500">Action requise</p>
                  <p className="mt-2 text-lg font-black">Confirmez le paiement pour lancer la production.</p>
                  <p className="mt-1 max-w-2xl text-sm text-white/60">
                    Vous serez redirigé vers FedaPay. Mobile Money et carte peuvent être proposés selon votre compte.
                  </p>
                  {paymentError && <p className="mt-3 text-sm font-semibold text-red-300">{paymentError}</p>}
                </div>
                <button
                  type="button"
                  onClick={handleStartPayment}
                  disabled={isStartingPayment}
                  className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-black transition-colors hover:bg-gray-100 disabled:opacity-60 md:w-auto"
                >
                  {isStartingPayment ? 'Redirection...' : 'Payer maintenant'}
                </button>
              </div>
            </section>
          )}

          <section>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Avancement</p>
            <div className="grid gap-3 md:grid-cols-4">
              {stepLabels.map((label, index) => {
                const stepNumber = index + 1;
                const isDone = stepNumber <= currentStep;

                return (
                  <div key={label} className="border-t border-gray-200 pt-4">
                    <span className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black",
                      isDone ? "bg-black text-white" : "bg-gray-100 text-gray-400"
                    )}>
                      {stepNumber}
                    </span>
                    <p className={cn("mt-3 text-sm font-black", isDone ? "text-black" : "text-gray-400")}>{label}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border-y border-gray-200 py-6">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Informations transmises</p>
                <h2 className="text-xl font-black tracking-tight text-black">Ce que FRILO utilise pour adapter le modèle.</h2>
              </div>
              {order.template?.id && (
                <Link
                  href={`/templates/${order.template.id}`}
                  className="inline-flex items-center gap-1 text-sm font-black text-black underline underline-offset-4"
                >
                  Revoir le modèle
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            <dl className="divide-y divide-gray-100 text-sm">
              <div className="grid gap-2 py-4 md:grid-cols-[220px_minmax(0,1fr)]">
                <dt className="font-bold text-gray-400">Activité</dt>
                <dd className="min-w-0 break-words text-black">{instruction?.activity_description || 'Non renseigné'}</dd>
              </div>
              <div className="grid gap-2 py-4 md:grid-cols-[220px_minmax(0,1fr)]">
                <dt className="font-bold text-gray-400">Couleurs souhaitées</dt>
                <dd className="min-w-0 break-words text-black">{(instruction?.colors || []).join(', ') || 'Non renseigné'}</dd>
              </div>
              <div className="grid gap-2 py-4 md:grid-cols-[220px_minmax(0,1fr)]">
                <dt className="font-bold text-gray-400">Notes complémentaires</dt>
                <dd className="min-w-0 break-words text-black">{instruction?.specific_instructions || 'Aucune note'}</dd>
              </div>
            </dl>
          </section>

          {order.template?.id && (paymentStatusValue === 'paid' || order.status === 'processing' || order.status === 'completed') && (
            <section className="pb-2">
              <p className="text-sm text-gray-500">
                Votre retour aide FRILO à améliorer les modèles.{' '}
                <Link href={`/templates/${order.template.id}#template-reviews`} className="font-black text-black underline underline-offset-4">
                  Donner mon avis
                </Link>
              </p>
            </section>
          )}
        </div>
      ) : null}
    </div>
  );
}
