"use client"

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { businessService, Order, PaymentStatus } from '@/services/business.service';
import { cn } from '@/lib/utils';
import axios from 'axios';

const statusConfig = {
  pending:    { label: 'En attente', classes: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400' },
  processing: { label: 'En cours', classes: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
  completed:  { label: 'Livré', classes: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400' },
  cancelled:  { label: 'Annulé', classes: 'bg-red-50 text-red-700', dot: 'bg-red-400' },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; classes: string }> = {
  awaiting_payment: { label: 'En attente de paiement', classes: 'bg-amber-50 text-amber-700' },
  paid: { label: 'Payée', classes: 'bg-emerald-50 text-emerald-700' },
  failed: { label: 'Échouée', classes: 'bg-red-50 text-red-700' },
  cancelled: { label: 'Annulée', classes: 'bg-gray-100 text-gray-700' },
  refunded: { label: 'Remboursée', classes: 'bg-blue-50 text-blue-700' },
  expired: { label: 'Expirée', classes: 'bg-slate-100 text-slate-700' },
};

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
    };
  }, [order]);

  const paymentStatus = useMemo(() => {
    if (!order) return null;
    const rawStatus = (order.payment_status || 'awaiting_payment') as PaymentStatus;
    return paymentStatusConfig[rawStatus] || paymentStatusConfig.awaiting_payment;
  }, [order]);

  const paymentStatusValue = (order?.payment_status || 'awaiting_payment') as PaymentStatus;

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
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-8">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux commandes
        </Link>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Commande</p>
        <h1 className="text-3xl font-black text-black tracking-tight">
          {order ? `#${String(order.id).padStart(4, '0')}` : '#—'}
        </h1>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-8">
          <div className="space-y-3">
            <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-56 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              setReloadKey(v => v + 1);
            }}
            className="sq-btn sq-btn-black text-sm py-3 px-6"
          >
            Réessayer
          </button>
        </div>
      ) : order ? (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Projet</p>
                <p className="text-xl font-black text-black">
                  {order.instruction?.enterprise_name || order.instructions?.[0]?.enterprise_name || 'Projet sans nom'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {order.template?.name || 'Template'}{order.template?.sector?.name ? ` · ${order.template.sector.name}` : ''}
                </p>
              </div>
              {status && (
                <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full", status.classes)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", status.dot)} />
                  {status.label}
                </span>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Prix</p>
                <p className="text-lg font-black text-black">{order.price.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Date de commande</p>
                <p className="text-sm font-semibold text-black">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Paiement</p>
                {paymentStatus && (
                  <span className={cn("inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full", paymentStatus.classes)}>
                    {paymentStatus.label}
                  </span>
                )}
                {order.paid_at && (
                  <p className="text-xs text-gray-500 mt-2">
                    Confirmé le {new Date(order.paid_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                {paymentStatusValue !== 'paid' && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleStartPayment}
                      disabled={isStartingPayment}
                      className="sq-btn sq-btn-black text-sm py-2.5 px-4 disabled:opacity-50"
                    >
                      {isStartingPayment ? 'Redirection…' : 'Payer maintenant'}
                    </button>
                    {paymentError && (
                      <p className="text-xs text-red-600 mt-2">{paymentError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-4">Instructions client</p>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Activité</p>
                <p className="text-black">
                  {order.instruction?.activity_description || order.instructions?.[0]?.activity_description || 'Non renseigné'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Couleurs souhaitées</p>
                <p className="text-black">
                  {(order.instruction?.colors || order.instructions?.[0]?.colors || []).join(', ') || 'Non renseigné'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Notes complémentaires</p>
                <p className="text-black">
                  {order.instruction?.specific_instructions || order.instructions?.[0]?.specific_instructions || 'Aucune note'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
