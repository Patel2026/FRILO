"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, RefreshCcw } from 'lucide-react';
import axios from 'axios';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { businessService, OrderPaymentResponse, PaymentStatus } from '@/services/business.service';
import { cn } from '@/lib/utils';

const paymentStatusConfig: Record<PaymentStatus, {
  label: string;
  title: string;
  description: string;
  classes: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}> = {
  awaiting_payment: {
    label: 'Paiement en attente',
    title: 'Nous vérifions votre paiement.',
    description: 'La transaction peut prendre quelques instants. Si vous avez utilisé Mobile Money, confirmez la demande sur votre téléphone.',
    classes: 'bg-amber-50 text-amber-700',
    tone: 'warning',
  },
  paid: {
    label: 'Paiement confirmé',
    title: 'Votre commande est confirmée.',
    description: 'FRILO peut démarrer la préparation de votre site avec les informations déjà transmises.',
    classes: 'bg-emerald-50 text-emerald-700',
    tone: 'success',
  },
  failed: {
    label: 'Paiement échoué',
    title: 'Le paiement n’a pas abouti.',
    description: 'Vous pouvez relancer le paiement depuis le détail de la commande, sans recommencer votre demande.',
    classes: 'bg-red-50 text-red-700',
    tone: 'danger',
  },
  cancelled: {
    label: 'Paiement annulé',
    title: 'Le paiement a été annulé.',
    description: 'Votre commande reste accessible. Vous pouvez reprendre le paiement depuis votre espace client.',
    classes: 'bg-gray-100 text-gray-700',
    tone: 'neutral',
  },
  refunded: {
    label: 'Paiement remboursé',
    title: 'Le paiement a été remboursé.',
    description: 'Consultez la commande ou contactez FRILO si vous avez besoin d’un suivi.',
    classes: 'bg-sky-50 text-sky-700',
    tone: 'neutral',
  },
  expired: {
    label: 'Paiement expiré',
    title: 'Le lien de paiement a expiré.',
    description: 'Votre commande est conservée. Générez un nouveau paiement depuis son détail.',
    classes: 'bg-slate-100 text-slate-700',
    tone: 'warning',
  },
};

function getIcon(tone: 'success' | 'warning' | 'danger' | 'neutral') {
  if (tone === 'success') return CheckCircle2;
  return AlertTriangle;
}

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
        setError('Reconnectez-vous pour consulter le statut du paiement.');
      } else if (axios.isAxiosError(requestError) && typeof requestError.response?.data?.message === 'string') {
        setError(requestError.response.data.message);
      } else {
        setError('Impossible de récupérer le statut du paiement pour le moment.');
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
  const StatusIcon = getIcon(config.tone);
  const orderReference = Number.isInteger(orderId) && orderId > 0
    ? `#ORD-${String(orderId).padStart(5, '0')}`
    : '#ORD-00000';
  const canViewOrder = Number.isInteger(orderId) && orderId > 0;
  const amount = result?.order.price;

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6 text-black md:px-8 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1180px] flex-col">
        <header className="mb-10 flex items-center justify-between border-b border-gray-200 pb-5">
          <Link href="/" className="inline-flex w-[104px] transition-opacity hover:opacity-80" aria-label="Accueil FRILO">
            <BrandLogo variant="dark" priority />
          </Link>
          <Link href="/dashboard/orders" className="text-sm font-black text-gray-500 transition-colors hover:text-black">
            Mes commandes
          </Link>
        </header>

        <section className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Retour de paiement</p>

            {loading ? (
              <div className="border-y border-gray-200 py-12">
                <Loader2 className="mb-5 h-8 w-8 animate-spin text-gray-400" />
                <h1 className="text-3xl font-black tracking-tight text-black">Vérification du paiement.</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
                  Nous synchronisons le statut avec le prestataire de paiement.
                </p>
              </div>
            ) : error ? (
              <div className="border-y border-gray-200 py-12">
                <AlertTriangle className="mb-5 h-9 w-9 text-red-500" />
                <h1 className="text-3xl font-black tracking-tight text-black">Statut indisponible.</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">{error}</p>
                <button
                  type="button"
                  onClick={fetchStatus}
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-white transition-colors hover:bg-gray-900"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Réessayer
                </button>
              </div>
            ) : (
              <div className="border-y border-gray-200 py-12">
                <div className="mb-6 flex items-center gap-3">
                  <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full", config.classes)}>
                    <StatusIcon className="h-5 w-5" />
                  </span>
                  <span className={cn("inline-flex rounded-full px-3 py-1.5 text-xs font-semibold", config.classes)}>
                    {config.label}
                  </span>
                </div>

                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-black md:text-5xl">{config.title}</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500">{config.description}</p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  {canViewOrder && (
                    <Link
                      href={`/dashboard/orders/${orderId}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-black text-white transition-colors hover:bg-gray-900"
                    >
                      Voir ma commande
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={fetchStatus}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-6 py-3 text-sm font-black text-gray-600 transition-colors hover:border-black hover:text-black"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Actualiser
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="border-y border-gray-200 py-6">
            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-400">Récapitulatif</p>
            <dl className="divide-y divide-gray-100 text-sm">
              <div className="flex items-center justify-between gap-6 py-4">
                <dt className="font-semibold text-gray-500">Commande</dt>
                <dd className="font-black text-black">{orderReference}</dd>
              </div>
              <div className="flex items-center justify-between gap-6 py-4">
                <dt className="font-semibold text-gray-500">Montant</dt>
                <dd className="font-black text-black">{typeof amount === 'number' ? `${amount.toLocaleString('fr-FR')} FCFA` : 'En cours'}</dd>
              </div>
              <div className="flex items-center justify-between gap-6 py-4">
                <dt className="font-semibold text-gray-500">Prestataire</dt>
                <dd className="font-black text-black">FedaPay</dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-6 text-gray-500">
              Gardez cette page ouverte quelques instants si la confirmation Mobile Money vient d’être validée.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
      </main>
    }>
      <PaymentReturnContent />
    </Suspense>
  );
}
