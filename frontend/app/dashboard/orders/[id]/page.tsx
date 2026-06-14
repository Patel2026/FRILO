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
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setFeedbackSuccess(false);

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

  const handleSubmitFeedback = async () => {
    if (!order || feedbackText.trim().length < 5) return;

    setFeedbackSubmitting(true);
    setFeedbackError(null);

    try {
      const updated = await businessService.submitOrderFeedback(order.id, feedbackText.trim());
      setOrder(updated);
      setFeedbackSuccess(true);
      setFeedbackText('');
    } catch {
      setFeedbackError('Impossible d\'envoyer vos retours pour le moment. Réessayez.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

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
    <div className="w-full max-w-[1180px] px-4 py-5 md:px-7 md:py-7">
      <div className="mb-5 border-b border-neutral-200 pb-5">
        <Link
          href="/dashboard/orders"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux commandes
        </Link>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-400">Commande #{order ? String(order.id).padStart(4, '0') : '0000'}</p>
            <h1 className="text-3xl font-black tracking-tight text-neutral-950">{loading ? 'Chargement' : projectName}</h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-500">
              {order
                ? `${order.template?.name || 'Modèle'}${order.template?.sector?.name ? ` · ${order.template.sector.name}` : ''}`
                : 'Suivi de commande FRILO'}
            </p>
          </div>
          {order?.created_at && (
            <p className="text-sm font-semibold text-neutral-400">
              {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="border-y border-neutral-200 py-8">
          <div className="space-y-3">
            <div className="h-5 w-56 animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded bg-neutral-100" />
            <div className="h-4 w-48 animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
      ) : error ? (
        <div className="border-y border-neutral-200 py-12">
          <AlertTriangle className="mb-3 h-10 w-10 text-amber-400" />
          <p className="mb-6 max-w-xl text-sm text-neutral-500">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              setReloadKey(v => v + 1);
            }}
            className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-black text-[oklch(99%_0.004_95)]"
          >
            Réessayer
          </button>
        </div>
      ) : order && status ? (
        <div className="space-y-8">
          <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-[oklch(99%_0.004_95)]">
            <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <div className="border-b border-neutral-100 p-5 md:border-b-0 md:border-r md:pr-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-400">État commande</p>
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", status.classes)}>
                  <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", status.dot)} />
                  {status.label}
                </span>
                <p className="mt-3 max-w-sm text-sm text-neutral-500">{status.next}</p>
              </div>
              <div className="border-b border-neutral-100 p-5 md:border-b-0 md:border-r md:px-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-400">Paiement</p>
                <span className={cn("inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold", paymentStatus.classes)}>
                  {paymentStatus.label}
                </span>
                <p className="mt-3 max-w-sm text-sm text-neutral-500">{paymentStatus.next}</p>
              </div>
              <div className="p-5 md:pl-8 md:text-right">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-400">Total</p>
                <p className="text-xl font-black text-neutral-950">{order.price.toLocaleString('fr-FR')} FCFA</p>
                {order.paid_at && (
                  <p className="mt-2 text-xs font-semibold text-neutral-400">
                    Payée le {new Date(order.paid_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          </section>

          {order.selected_options && order.selected_options.length > 0 && (
            <section className="border-y border-neutral-200 py-5">
              <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-end">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-400">Options choisies</p>
                  <h2 className="text-lg font-black text-neutral-950">Fonctions ajoutées à votre site</h2>
                </div>
                <p className="text-sm font-semibold text-neutral-400">{order.selected_options.length} option{order.selected_options.length > 1 ? 's' : ''}</p>
              </div>
              <div className="divide-y divide-neutral-100">
                {order.selected_options.map((option) => (
                  <div key={`${option.id ?? 'deleted'}-${option.name}-${option.price}`} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="text-neutral-600">{option.name}</span>
                    <span className="shrink-0 font-black text-neutral-950">{option.price.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {canPay && (
            <section className="rounded-2xl bg-neutral-950 px-5 py-5 text-[oklch(99%_0.004_95)] md:px-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[oklch(70%_0.19_29)]">Action requise</p>
                  <p className="mt-2 text-lg font-black">Confirmez le paiement pour lancer la production.</p>
                  <p className="mt-1 max-w-2xl text-sm text-[oklch(99%_0.004_95)]/60">
                    Vous serez redirigé vers FedaPay. Mobile Money et carte peuvent être proposés selon votre compte.
                  </p>
                  {paymentError && <p className="mt-3 text-sm font-semibold text-red-300">{paymentError}</p>}
                </div>
                <button
                  type="button"
                  onClick={handleStartPayment}
                  disabled={isStartingPayment}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[oklch(99%_0.004_95)] px-6 py-3 text-sm font-black text-neutral-950 transition-colors hover:bg-neutral-100 disabled:opacity-60 md:w-auto"
                >
                  {isStartingPayment ? 'Redirection...' : 'Payer maintenant'}
                </button>
              </div>
            </section>
          )}

          <section>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-400">Avancement</p>
            <div className="grid gap-3 md:grid-cols-4">
              {stepLabels.map((label, index) => {
                const stepNumber = index + 1;
                const isDone = stepNumber <= currentStep;

                return (
                  <div key={label} className="border-t border-neutral-200 pt-4">
                    <span className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black",
                      isDone ? "bg-neutral-950 text-[oklch(99%_0.004_95)]" : "bg-neutral-100 text-neutral-400"
                    )}>
                      {stepNumber}
                    </span>
                    <p className={cn("mt-3 text-sm font-black", isDone ? "text-neutral-950" : "text-neutral-400")}>{label}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-[oklch(99%_0.004_95)] p-5 md:p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-400">Informations transmises</p>
                <h2 className="text-xl font-black tracking-tight text-neutral-950">Ce que FRILO utilise pour adapter le modèle.</h2>
              </div>
              {order.template?.id && (
                <Link
                  href={`/templates/${order.template.id}`}
                  className="inline-flex items-center gap-1 text-sm font-black text-neutral-950 underline underline-offset-4"
                >
                  Revoir le modèle
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            <dl className="divide-y divide-neutral-100 text-sm">
              <div className="grid gap-2 py-4 md:grid-cols-[220px_minmax(0,1fr)]">
                <dt className="font-bold text-neutral-400">Activité</dt>
                <dd className="min-w-0 break-words text-neutral-950">{instruction?.activity_description || 'Non renseigné'}</dd>
              </div>
              <div className="grid gap-2 py-4 md:grid-cols-[220px_minmax(0,1fr)]">
                <dt className="font-bold text-neutral-400">Couleurs souhaitées</dt>
                <dd className="min-w-0 break-words text-neutral-950">{(instruction?.colors || []).join(', ') || 'Non renseigné'}</dd>
              </div>
              <div className="grid gap-2 py-4 md:grid-cols-[220px_minmax(0,1fr)]">
                <dt className="font-bold text-neutral-400">Notes complémentaires</dt>
                <dd className="min-w-0 break-words text-neutral-950">{instruction?.specific_instructions || 'Aucune note'}</dd>
              </div>
            </dl>
          </section>

          {order.preview_url && (
            <section className="rounded-2xl border border-neutral-200 bg-[oklch(99%_0.004_95)] p-5 md:p-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
                Prévisualisation
              </p>
              <h2 className="text-xl font-black tracking-tight text-neutral-950">
                Votre site est prêt à valider.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                FRILO a préparé une version de votre site. Consultez le lien ci-dessous et transmettez
                vos retours dans les 24 heures. Les modifications seront intégrées avant la mise en ligne définitive.
              </p>
              <a
                href={order.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-black text-[oklch(99%_0.004_95)] transition-colors hover:bg-neutral-800"
              >
                Voir la prévisualisation
                <ArrowUpRight className="h-4 w-4" />
              </a>

              <div className="mt-6 border-t border-neutral-100 pt-6">
                {order.client_feedback ? (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                      Vos retours envoyés
                    </p>
                    <p className="text-sm text-neutral-700 leading-6 bg-neutral-50 rounded-xl p-4">
                      {order.client_feedback}
                    </p>
                    {order.feedback_submitted_at && (
                      <p className="mt-2 text-xs font-semibold text-neutral-400">
                        Envoyé le {new Date(order.feedback_submitted_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
                      Transmettre vos retours
                    </p>
                    {feedbackSuccess ? (
                      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
                        <p className="text-sm font-semibold">
                          Retours reçus. FRILO les intègre dans les 24 heures.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          rows={4}
                          placeholder="Décrivez les modifications souhaitées (couleurs, textes, logo, mise en page…)"
                          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition-colors focus:border-neutral-950 resize-none"
                        />
                        {feedbackError && (
                          <p className="text-xs font-semibold text-red-600">{feedbackError}</p>
                        )}
                        <button
                          type="button"
                          onClick={handleSubmitFeedback}
                          disabled={feedbackSubmitting || feedbackText.trim().length < 5}
                          className="inline-flex items-center justify-center rounded-full bg-[oklch(55%_0.23_29)] px-6 py-3 text-sm font-black text-[oklch(99%_0.004_95)] transition-colors hover:bg-[oklch(48%_0.22_29)] disabled:opacity-45 disabled:cursor-not-allowed"
                        >
                          {feedbackSubmitting ? 'Envoi…' : 'Envoyer mes retours'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {order.template?.id && (paymentStatusValue === 'paid' || order.status === 'processing' || order.status === 'completed') && (
            <section className="pb-2">
              <p className="text-sm text-gray-500">
                Votre retour aide FRILO à améliorer les modèles.{' '}
                <Link href={`/templates/${order.template.id}#template-reviews`} className="font-black text-neutral-950 underline underline-offset-4">
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
