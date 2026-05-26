"use client"

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, ChevronRight, LifeBuoy, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { AuthForms } from '@/components/business/AuthForms';
import { ProjectDetailsForm } from '@/components/business/ProjectDetailsForm';
import { businessService, Template } from '@/services/business.service';
import Link from 'next/link';
import { useAuthState } from '@/hooks/useAuthState';
import axios from 'axios';
import { trackFunnelEvent } from '@/lib/analytics';

const STEPS = [
  { id: 1, name: 'Récapitulatif' },
  { id: 2, name: 'Connexion' },
  { id: 3, name: 'Détails' },
  { id: 4, name: 'Paiement' },
  { id: 5, name: 'Confirmation' },
];

const ORDER_DRAFT_STORAGE_KEY = 'frilo.order.draft.v1';

type OrderDraft = {
  templateId: string;
  domainName?: string;
  description?: string;
  colors?: string;
  specific_instructions?: string;
  updatedAt: string;
};

function OrderTunnelContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const { isAuthenticated } = useAuthState();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<{
    templateId: string | null;
    domainName?: string;
    description?: string;
    colors?: string;
    specific_instructions?: string;
  }>({ templateId });

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectingToPayment, setRedirectingToPayment] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [orderRef, setOrderRef] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentErrorType, setPaymentErrorType] = useState<'auth' | 'generic' | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    if (!templateId) return;
    setLoading(true);
    businessService.getTemplate(templateId)
      .then(setTemplate)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [templateId]);

  useEffect(() => {
    if (!templateId) {
      return;
    }

    try {
      const rawDraft = localStorage.getItem(ORDER_DRAFT_STORAGE_KEY);
      if (!rawDraft) {
        return;
      }

      const draft = JSON.parse(rawDraft) as Partial<OrderDraft>;
      const sameTemplate = draft.templateId === templateId;
      const hasData = Boolean(
        draft.domainName?.trim() ||
        draft.description?.trim() ||
        draft.colors?.trim() ||
        draft.specific_instructions?.trim()
      );

      if (sameTemplate && hasData) {
        setFormData(prev => ({
          ...prev,
          templateId,
          domainName: draft.domainName ?? '',
          description: draft.description ?? '',
          colors: draft.colors ?? '',
          specific_instructions: draft.specific_instructions ?? '',
        }));
        setDraftRestored(true);
      }
    } catch {
      localStorage.removeItem(ORDER_DRAFT_STORAGE_KEY);
    }
  }, [templateId]);

  useEffect(() => {
    if (!templateId) {
      return;
    }

    const hasDraftData = Boolean(
      formData.domainName?.trim() ||
      formData.description?.trim() ||
      formData.colors?.trim() ||
      formData.specific_instructions?.trim()
    );

    if (!hasDraftData) {
      localStorage.removeItem(ORDER_DRAFT_STORAGE_KEY);
      return;
    }

    const draft: OrderDraft = {
      templateId,
      domainName: formData.domainName,
      description: formData.description,
      colors: formData.colors,
      specific_instructions: formData.specific_instructions,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(ORDER_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [
    templateId,
    formData.domainName,
    formData.description,
    formData.colors,
    formData.specific_instructions,
  ]);

  const nextStep = () => setCurrentStep(p => Math.min(p + 1, STEPS.length));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentStep]);

  useEffect(() => {
    if (isAuthenticated && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [isAuthenticated, currentStep]);

  const handlePayment = async () => {
    setIsSubmitting(true);
    setRedirectingToPayment(false);
    setPaymentError(null);
    setPaymentErrorType(null);

    try {
      let orderIdToPay = createdOrderId;
      let orderAmount = price;

      if (!orderIdToPay) {
        const order = await businessService.createOrder({
          template_id: templateId,
          enterprise_name: formData.domainName,
          activity_description: formData.description,
          colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : [],
          specific_instructions: formData.specific_instructions,
        });

        orderIdToPay = order.id;
        orderAmount = order.price;
        setCreatedOrderId(order.id);
        setOrderRef(String(order.id).padStart(5, '0'));
        localStorage.removeItem(ORDER_DRAFT_STORAGE_KEY);
        trackFunnelEvent('submit_order', {
          template_id: templateId ? Number(templateId) : null,
          order_id: order.id,
          amount: order.price,
        });
      }

      if (!orderIdToPay) {
        throw new Error('Commande introuvable pour initialiser le paiement.');
      }

      const payment = await businessService.initiateOrderPayment(orderIdToPay, {
        mode: 'checkout',
      });

      if (payment.order.payment_status === 'paid') {
        nextStep();
        return;
      }

      const checkoutUrl = payment.payment?.checkout_url;
      if (!checkoutUrl) {
        throw new Error('Lien de paiement indisponible.');
      }

      trackFunnelEvent('start_payment', {
        template_id: templateId ? Number(templateId) : null,
        order_id: orderIdToPay,
        amount: orderAmount,
      });

      setRedirectingToPayment(true);
      window.location.assign(checkoutUrl);
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
        setPaymentErrorType('auth');
        setPaymentError('Votre session a expiré. Reconnectez-vous pour finaliser la commande.');
      } else if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
        setPaymentErrorType('generic');
        setPaymentError(err.response.data.message);
      } else {
        setPaymentErrorType('generic');
        setPaymentError('Nous n’avons pas pu lancer le paiement. Veuillez réessayer.');
      }
    } finally {
      setIsSubmitting(false);
      setRedirectingToPayment(false);
    }
  };

  const handleContinueFromSummary = () => {
    trackFunnelEvent('start_order', {
      template_id: templateId ? Number(templateId) : null,
      source: 'order_tunnel_summary',
      authenticated: isAuthenticated,
    });

    if (isAuthenticated) {
      setCurrentStep(3);
      return;
    }

    setCurrentStep(2);
  };

  const supportHref = (() => {
    const params = new URLSearchParams();
    const stepLabel = STEPS.find(step => step.id === currentStep)?.name ?? `Étape ${currentStep}`;
    const templateLabel = template?.name ?? 'Template non chargé';

    params.set('subject', 'Aide commande FRILO');
    params.set(
      'message',
      `Bonjour,\nJe souhaite de l'aide sur ma commande.\nÉtape actuelle: ${stepLabel}\nTemplate: ${templateLabel}`
    );

    if (orderRef) {
      params.set('order_reference', `#ORD-${orderRef}`);
    }

    return `/contact?${params.toString()}`;
  })();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const price = template ? (typeof template.price === 'string' ? parseInt(template.price) : template.price) : 0;
  const formattedPrice = price.toLocaleString('fr-FR').replace(/\u202f/g, ' ');
  const currentStepMeta = STEPS.find(step => step.id === currentStep) ?? STEPS[0];
  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[oklch(98%_0.004_29)] text-slate-950">
      <div className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <Link
            href={template ? `/templates/${template.id}` : '/templates'}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>

          <div className="min-w-0 flex-1">
            <div className="mx-auto max-w-xl">
              <div className="mb-1 flex items-center justify-between text-xs font-black uppercase tracking-[0.14em]">
                <span className="text-[oklch(57%_0.24_29)]">{currentStepMeta.name}</span>
                <span className="text-slate-400">{currentStep}/{STEPS.length}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-950 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <Link href="/" className="hidden text-xl font-black tracking-tight text-slate-950 md:block">FRILO</Link>
        </div>
      </div>

      <main
        className={cn(
          'mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:py-8',
          currentStep <= 4 ? 'max-w-[1400px]' : 'max-w-7xl lg:grid-cols-[minmax(0,1fr)_380px]'
        )}
      >
        <section
          className={cn(
            'bg-white p-5 md:p-8 lg:min-h-[650px]',
            currentStep <= 4 ? 'lg:bg-transparent lg:p-0' : 'lg:rounded-[2rem] lg:border lg:border-slate-100 lg:shadow-[0_18px_60px_rgba(15,23,42,0.05)]'
          )}
        >
          {currentStep === 1 && (
            <div className="grid h-full gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
              <div className="max-w-2xl">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Prêt à démarrer</p>
                <h1 className="text-4xl font-black leading-none tracking-tight text-slate-950 md:text-6xl">
                  Vous commandez ce modèle.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-500">
                  FRILO l’adapte ensuite à votre activité avec les informations que vous donnerez aux prochaines étapes.
                </p>

                <div className="mt-8 divide-y divide-slate-100 border-y border-slate-100 text-sm">
                  <div className="flex items-center justify-between gap-5 py-4">
                    <span className="text-slate-500">Modèle choisi</span>
                    <span className="text-right font-black text-slate-950">{template?.name ?? 'Non sélectionné'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-5 py-4">
                    <span className="text-slate-500">Prix à payer</span>
                    <span className="text-right font-black text-slate-950">{formattedPrice} FCFA</span>
                  </div>
                  <div className="flex items-center justify-between gap-5 py-4">
                    <span className="text-slate-500">Après validation</span>
                    <span className="text-right font-black text-slate-950">connexion, infos, paiement</span>
                  </div>
                </div>

                {template && (
                  <button
                    onClick={handleContinueFromSummary}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-sm font-black text-white transition-colors hover:bg-black lg:hidden"
                  >
                    Continuer <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                )}
              </div>

              {template ? (
                <div className="hidden lg:block">
                  <div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-100">
                    {template.full_thumbnail_url ? (
                      <Image
                        src={template.full_thumbnail_url}
                        alt={template.name}
                        width={720}
                        height={440}
                        className="h-56 w-full object-cover object-top"
                      />
                    ) : (
                      <div className="h-56 w-full bg-slate-100" aria-hidden="true" />
                    )}
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-black text-slate-950">{template.name}</p>
                      {template.sector && <p className="mt-1 text-sm text-slate-500">{template.sector.name}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-950">{formattedPrice}</p>
                      <p className="text-xs font-semibold text-slate-400">FCFA</p>
                    </div>
                  </div>
                  <button
                    onClick={handleContinueFromSummary}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-sm font-black text-white transition-colors hover:bg-black"
                  >
                    Continuer <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="mb-5 text-sm text-slate-500">Aucun modèle sélectionné.</p>
                  <Link href="/templates" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white">
                    Voir les modèles
                  </Link>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid h-full gap-10 lg:grid-cols-[minmax(0,0.9fr)_430px] lg:items-center">
              <div className="max-w-2xl">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Compte client</p>
                <h1 className="text-4xl font-black leading-none tracking-tight text-slate-950 md:text-6xl">
                  Connectez-vous pour continuer.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-500">
                  Votre espace garde la commande, le paiement et les échanges FRILO au même endroit.
                </p>

                <div className="mt-8 divide-y divide-slate-100 border-y border-slate-100 text-sm">
                  <div className="flex items-center justify-between gap-5 py-4">
                    <span className="text-slate-500">Modèle choisi</span>
                    <span className="text-right font-black text-slate-950">{template?.name ?? 'Non sélectionné'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-5 py-4">
                    <span className="text-slate-500">Montant</span>
                    <span className="text-right font-black text-slate-950">{formattedPrice} FCFA</span>
                  </div>
                  <div className="flex items-center justify-between gap-5 py-4">
                    <span className="text-slate-500">Ensuite</span>
                    <span className="text-right font-black text-slate-950">vos informations projet</span>
                  </div>
                </div>
              </div>

              <div className="lg:w-[430px] lg:justify-self-end lg:rounded-[2rem] lg:border lg:border-slate-100 lg:bg-white lg:p-8 lg:shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
                <AuthForms onSuccess={() => nextStep()} />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid h-full gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(520px,0.9fr)] lg:items-start">
              <div className="max-w-xl lg:pt-12">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Informations utiles</p>
                <h1 className="text-4xl font-black leading-none tracking-tight text-slate-950 md:text-6xl">
                  Dites-nous quoi adapter.
                </h1>
                <p className="mt-5 text-base leading-7 text-slate-500">
                  Trois réponses suffisent pour lancer la commande. FRILO demandera le logo, les images et les détails fins ensuite.
                </p>

                <div className="mt-8 divide-y divide-slate-100 border-y border-slate-100 text-sm">
                  <div className="flex items-center justify-between gap-5 py-4">
                    <span className="text-slate-500">Votre modèle</span>
                    <span className="text-right font-black text-slate-950">{template?.name ?? 'Non sélectionné'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-5 py-4">
                    <span className="text-slate-500">À préparer maintenant</span>
                    <span className="text-right font-black text-slate-950">nom, activité, préférences</span>
                  </div>
                  <div className="flex items-center justify-between gap-5 py-4">
                    <span className="text-slate-500">Logo et images</span>
                    <span className="text-right font-black text-slate-950">après paiement</span>
                  </div>
                </div>

                {draftRestored && (
                  <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <p className="text-sm text-emerald-700">Un brouillon de votre commande a été restauré automatiquement.</p>
                  </div>
                )}
              </div>

              <div className="lg:rounded-[2rem] lg:border lg:border-slate-100 lg:bg-white lg:p-8 lg:shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
                <ProjectDetailsForm
                  initialValues={{
                    domainName: formData.domainName ?? '',
                    description: formData.description ?? '',
                    colors: formData.colors ?? '',
                    specific_instructions: formData.specific_instructions ?? '',
                  }}
                  onChange={(data) =>
                    setFormData(prev => {
                      const next = { ...prev, ...data };
                      if (
                        prev.domainName === next.domainName &&
                        prev.description === next.description &&
                        prev.colors === next.colors &&
                        prev.specific_instructions === next.specific_instructions
                      ) {
                        return prev;
                      }

                      return next;
                    })
                  }
                  onSuccess={(data) => {
                    setFormData(prev => ({ ...prev, ...data }));
                    nextStep();
                  }}
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="grid h-full gap-10 lg:grid-cols-[minmax(0,0.85fr)_470px] lg:items-center">
              <div className="max-w-2xl">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-[oklch(57%_0.24_29)]">Paiement sécurisé</p>
                <h1 className="text-4xl font-black leading-none tracking-tight text-slate-950 md:text-6xl">
                  Votre site peut passer en production.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-500">
                  Le paiement valide la commande. FRILO démarre ensuite l’adaptation du modèle avec vos informations.
                </p>

                <div className="mt-8 divide-y divide-slate-100 border-y border-slate-100 text-sm">
                  <div className="flex items-center justify-between gap-5 py-4">
                    <span className="text-slate-500">Montant unique</span>
                    <span className="text-right font-black text-slate-950">{formattedPrice} FCFA</span>
                  </div>
                  <div className="flex items-center justify-between gap-5 py-4">
                    <span className="text-slate-500">Paiement</span>
                    <span className="text-right font-black text-slate-950">FedaPay sécurisé</span>
                  </div>
                  <div className="flex items-center justify-between gap-5 py-4">
                    <span className="text-slate-500">Après validation</span>
                    <span className="text-right font-black text-slate-950">production FRILO</span>
                  </div>
                </div>
              </div>

              <div className="lg:w-[470px] lg:justify-self-end">
                <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:p-8">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Total à payer</p>
                      <p className="mt-3 text-4xl font-black leading-none text-slate-950">
                        {formattedPrice}
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-400">FCFA</p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-8 rounded-3xl bg-slate-50 p-5">
                    <p className="font-black text-slate-950">Paiement via FedaPay</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Vous serez redirigé vers FedaPay pour payer de façon sécurisée. Les moyens disponibles dépendent de votre compte et de votre pays.
                    </p>
                    {createdOrderId && (
                      <p className="mt-3 text-xs font-semibold text-slate-400">Commande préparée : #{String(createdOrderId).padStart(5, '0')}</p>
                    )}
                  </div>

                  {paymentError && (
                    <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-center">
                      <p className="text-sm text-red-600">{paymentError}</p>
                      {paymentErrorType === 'auth' && (
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="mt-3 text-sm font-black text-slate-950 underline underline-offset-4"
                        >
                          Revenir à l&apos;étape Connexion
                        </button>
                      )}
                      {paymentErrorType === 'generic' && (
                        <button
                          type="button"
                          onClick={handlePayment}
                          className="mt-3 text-sm font-black text-slate-950 underline underline-offset-4"
                        >
                          Réessayer maintenant
                        </button>
                      )}
                      <div className="mt-3">
                        <Link href={supportHref} className="text-sm font-black text-slate-950 underline underline-offset-4">
                          Contacter le support
                        </Link>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handlePayment}
                    disabled={isSubmitting || redirectingToPayment}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-7 py-4 text-sm font-black text-white transition-colors hover:bg-black disabled:opacity-50"
                  >
                    {isSubmitting || redirectingToPayment
                      ? 'Redirection vers FedaPay…'
                      : 'Payer maintenant'}
                  </button>
                  <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                    La commande part en production après confirmation du paiement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="mx-auto max-w-xl py-8 text-center">
              <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-slate-950">
                <Check className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-black leading-tight text-slate-950 md:text-4xl">Commande confirmée.</h1>
              <p className="mt-5 text-sm text-slate-500">Référence</p>
              <p className="mt-1 text-2xl font-black text-slate-950">#ORD-{orderRef}</p>
              <p className="mx-auto mt-6 max-w-sm text-sm leading-6 text-slate-500">
                Notre équipe prend le relais. Vous recevrez un e-mail de confirmation et votre site sera livré sous 48h ouvrées.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link href="/dashboard/orders" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white">
                  Suivre ma commande
                </Link>
                <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-black text-slate-950">
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          )}
        </section>

        <aside
          className={cn(
            'hidden space-y-4 lg:sticky lg:top-24 lg:block lg:self-start',
            currentStep <= 4 && 'lg:hidden'
          )}
        >
          <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Votre sélection</p>
            {template ? (
              <div>
                <div className="overflow-hidden rounded-3xl bg-slate-100">
                  {template.full_thumbnail_url ? (
                    <Image
                      src={template.full_thumbnail_url}
                      alt={template.name}
                      width={640}
                      height={360}
                      className="h-40 w-full object-cover object-top"
                    />
                  ) : (
                    <div className="h-40 bg-slate-100" />
                  )}
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-black text-slate-950">{template.name}</p>
                    {template.sector && <p className="mt-1 text-sm text-slate-500">{template.sector.name}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-950">{formattedPrice}</p>
                    <p className="text-xs font-semibold text-slate-400">FCFA</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Paiement</span>
                    <span className="font-black text-slate-950">unique</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Livraison</span>
                    <span className="font-black text-slate-950">48h ouvrées</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Aucun modèle sélectionné.</p>
            )}
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black text-slate-950">Assistance FRILO</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Une question pendant l’achat ? Notre équipe peut reprendre votre demande avec le modèle choisi.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link href={supportHref} className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-950 transition-colors hover:border-slate-950">
                    Contacter le support
                  </Link>
                  {isAuthenticated && (
                    <Link href="/dashboard/orders" className="text-sm font-black text-slate-500 transition-colors hover:text-slate-950">
                      Mes commandes
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default function OrderTunnelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrderTunnelContent />
    </Suspense>
  );
}
