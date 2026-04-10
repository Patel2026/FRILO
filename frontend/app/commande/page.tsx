"use client"

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ChevronRight, ArrowLeft } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[#f7f7f7]">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 h-14 flex items-center px-6 gap-6">
        <Link href={template ? `/templates/${template.id}` : '/templates'} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        {/* Steps */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                currentStep > step.id
                  ? "bg-black text-white"
                  : currentStep === step.id
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-400"
              )}>
                {currentStep > step.id ? <Check className="w-3 h-3" /> : step.id}
              </div>
              <span className={cn(
                "text-xs font-medium hidden md:block transition-colors",
                currentStep >= step.id ? "text-black" : "text-gray-400"
              )}>
                {step.name}
              </span>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "w-8 h-px mx-1",
                  currentStep > step.id ? "bg-black" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>

        <Link href="/" className="text-xl font-black text-black tracking-tight hidden md:block">FRILO</Link>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

          {/* Step 1 — Récapitulatif */}
          {currentStep === 1 && (
            <div className="p-8">
              <p className="sq-label mb-6">Votre commande</p>
              {template ? (
                <div>
                  <div className="flex items-start gap-5 p-5 border border-gray-100 rounded-xl mb-8">
                    <div className="w-20 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {template.full_thumbnail_url && (
                        <Image
                          src={template.full_thumbnail_url}
                          alt={template.name}
                          width={80}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-black">{template.name}</p>
                      {template.sector && <p className="text-xs text-gray-400 mt-0.5">{template.sector.name}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-black">{price.toLocaleString('fr-FR')}</p>
                      <p className="text-xs text-gray-400">FCFA</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 py-4 border-t border-gray-100 mb-2">
                    <span>Paiement unique</span>
                    <span className="font-semibold text-black">{price.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 py-4 border-t border-gray-100">
                    <span>Délai de livraison</span>
                    <span className="font-semibold text-black">48h ouvrées</span>
                  </div>
                  <button
                    onClick={handleContinueFromSummary}
                    className="sq-btn sq-btn-black w-full justify-center mt-8"
                  >
                    Continuer <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-500 text-sm mb-5">Aucun modèle sélectionné.</p>
                  <Link href="/templates" className="sq-btn sq-btn-black">Voir les modèles</Link>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Auth */}
          {currentStep === 2 && (
            <div className="p-8">
              <p className="sq-label mb-6">Connexion ou inscription</p>
              <AuthForms onSuccess={() => nextStep()} />
            </div>
          )}

          {/* Step 3 — Détails projet */}
          {currentStep === 3 && (
            <div className="p-8">
              <p className="sq-label mb-6">Détails de votre projet</p>
              {draftRestored && (
                <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <p className="text-sm text-emerald-700">
                    Un brouillon de votre commande a été restauré automatiquement.
                  </p>
                </div>
              )}
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
          )}

          {/* Step 4 — Paiement */}
          {currentStep === 4 && (
            <div className="p-8">
              <p className="sq-label mb-6">Paiement sécurisé</p>

              <div className="border border-gray-100 rounded-xl p-5 mb-8 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{template?.name}</span>
                  <span className="font-semibold text-black">{price.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
                  <span className="font-bold text-black">Total</span>
                  <span className="font-black text-black text-lg">{price.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              <div className="bg-[#f7f7f7] rounded-xl p-5 mb-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Paiement FedaPay</p>
                <p className="text-sm text-gray-500">
                  Vous allez être redirigé vers la page de paiement sécurisée FedaPay
                  (Mobile Money, carte bancaire et moyens activés sur votre compte).
                </p>
                {createdOrderId && (
                  <p className="text-xs text-gray-400 mt-3">
                    Commande préparée: #{String(createdOrderId).padStart(5, '0')}
                  </p>
                )}
              </div>

              {paymentError && (
                <div className="mb-5 border border-red-100 bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-red-600 text-sm">{paymentError}</p>
                  {paymentErrorType === 'auth' && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="mt-3 text-sm font-semibold text-black underline underline-offset-2"
                    >
                      Revenir à l&apos;étape Connexion
                    </button>
                  )}
                  {paymentErrorType === 'generic' && (
                    <button
                      type="button"
                      onClick={handlePayment}
                      className="mt-3 text-sm font-semibold text-black underline underline-offset-2"
                    >
                      Réessayer maintenant
                    </button>
                  )}
                  <div className="mt-3">
                    <Link href={supportHref} className="text-sm font-semibold text-black underline underline-offset-2">
                      Contacter le support
                    </Link>
                  </div>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={isSubmitting || redirectingToPayment}
                className="sq-btn sq-btn-black w-full justify-center disabled:opacity-50"
              >
                {isSubmitting || redirectingToPayment
                  ? 'Redirection vers FedaPay…'
                  : `Payer avec FedaPay — ${price.toLocaleString('fr-FR')} FCFA`}
              </button>
            </div>
          )}

          {/* Step 5 — Confirmation */}
          {currentStep === 5 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-black text-black tracking-tight mb-3">
                Commande confirmée.
              </h2>
              <p className="text-gray-500 text-sm mb-2">Référence</p>
              <p className="text-2xl font-black text-black mb-6">#ORD-{orderRef}</p>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-10">
                Notre équipe prend le relais. Vous recevrez un e-mail de confirmation
                et votre site sera livré sous 48h ouvrées.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href="/dashboard/orders" className="sq-btn sq-btn-black">
                  Suivre ma commande
                </Link>
                <Link href="/" className="sq-btn sq-btn-outline-black">
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
          <p className="sq-label mb-2">Assistance FRILO</p>
          <p className="text-sm text-gray-500 mb-4">
            Besoin d&apos;aide pendant votre commande ? Notre équipe vous accompagne et reprend votre demande rapidement.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href={supportHref} className="sq-btn sq-btn-outline-black text-sm py-2.5 px-4">
              Contacter le support
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard/orders" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">
                Voir mes commandes en cours
              </Link>
            )}
          </div>
        </div>
      </div>
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
