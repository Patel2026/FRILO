"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { businessService, OrderPaymentResponse, PaymentStatus } from '@/services/business.service';
import axios from 'axios';

const paymentStatusConfig: Record<PaymentStatus, { label: string; description: string; classes: string }> = {
  awaiting_payment: {
    label: 'Paiement en attente',
    description: 'La transaction est en cours de validation. Confirmez la demande sur votre téléphone si nécessaire.',
    classes: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  paid: {
    label: 'Paiement confirmé',
    description: 'Votre commande est bien enregistrée. Notre équipe peut démarrer le traitement.',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  failed: {
    label: 'Paiement échoué',
    description: 'Le paiement a échoué. Vous pouvez relancer un paiement depuis le détail de la commande.',
    classes: 'bg-red-50 text-red-700 border-red-100',
  },
  cancelled: {
    label: 'Paiement annulé',
    description: 'Le paiement a été annulé avant confirmation.',
    classes: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  refunded: {
    label: 'Paiement remboursé',
    description: 'La transaction a été remboursée.',
    classes: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  expired: {
    label: 'Paiement expiré',
    description: 'La session de paiement a expiré. Vous pouvez relancer un paiement.',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const orderParam = searchParams.get('order');
  const orderId = orderParam ? Number(orderParam) : NaN;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OrderPaymentResponse | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!Number.isInteger(orderId) || orderId < 1) {
      setError('Référence de commande invalide.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await businessService.getOrderPaymentStatus(orderId, true);
      setResult(response);
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        setError('Reconnectez-vous pour consulter le statut de paiement.');
      } else if (axios.isAxiosError(requestError) && typeof requestError.response?.data?.message === 'string') {
        setError(requestError.response.data.message);
      } else {
        setError('Impossible de récupérer le statut de paiement pour le moment.');
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const paymentStatus = (result?.order.payment_status ?? 'awaiting_payment') as PaymentStatus;
  const config = useMemo(
    () => paymentStatusConfig[paymentStatus] ?? paymentStatusConfig.awaiting_payment,
    [paymentStatus]
  );
  const isPaid = paymentStatus === 'paid';
  const isFinalFailure = paymentStatus === 'failed' || paymentStatus === 'cancelled' || paymentStatus === 'expired';
  const orderReference = Number.isInteger(orderId) && orderId > 0
    ? `#ORD-${String(orderId).padStart(5, '0')}`
    : '#ORD-—';

  return (
    <div className="min-h-screen bg-[#f7f7f7] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 md:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Paiement</p>
          <h1 className="text-3xl font-black text-black tracking-tight mb-2">Retour FedaPay</h1>
          <p className="text-sm text-gray-500 mb-8">Commande {orderReference}</p>

          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="border border-red-100 bg-red-50 rounded-xl p-5 text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={fetchStatus}
                className="mt-4 text-sm font-semibold text-black underline underline-offset-2"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <div className={`border rounded-xl p-5 ${config.classes}`}>
              <div className="flex items-center gap-2 mb-3">
                {isPaid ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                <p className="font-bold">{config.label}</p>
              </div>
              <p className="text-sm">{config.description}</p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {!loading && (
              <button
                type="button"
                onClick={fetchStatus}
                className="sq-btn sq-btn-outline-black text-sm py-2.5 px-4"
              >
                Actualiser le statut
              </button>
            )}
            {Number.isInteger(orderId) && orderId > 0 && (
              <Link href={`/dashboard/orders/${orderId}`} className="sq-btn sq-btn-black text-sm py-2.5 px-4">
                Voir la commande
              </Link>
            )}
            <Link href="/dashboard/orders" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">
              Retour au dashboard
            </Link>
          </div>

          {!loading && isFinalFailure && Number.isInteger(orderId) && orderId > 0 && (
            <p className="mt-5 text-xs text-gray-500">
              Besoin d&apos;aide ? Ouvrez la commande puis utilisez le contact support avec la référence {orderReference}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f7f7f7] px-4 py-12 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
      </div>
    }>
      <PaymentReturnContent />
    </Suspense>
  );
}
