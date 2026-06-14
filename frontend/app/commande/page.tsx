"use client"

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CircleHelp,
  Pencil,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { AuthForms } from '@/components/business/AuthForms';
import { ProjectDetailsForm } from '@/components/business/ProjectDetailsForm';
import { useAuthState } from '@/hooks/useAuthState';
import { trackFunnelEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { businessService, OrderOption, Template } from '@/services/business.service';

const VISIBLE_MOMENTS = [
  { id: 'personalize', name: 'Personnaliser' },
  { id: 'review', name: 'Vérifier' },
  { id: 'payment', name: 'Payer' },
] as const;

type OrderMoment = typeof VISIBLE_MOMENTS[number]['id'] | 'confirmation';

const ORDER_DRAFT_STORAGE_KEY = 'frilo.order.draft.v1';
const PROJECT_FORM_ID = 'order-project-details';

type OrderDraft = {
  templateId: string;
  domainName?: string;
  description?: string;
  colors?: string;
  specific_instructions?: string;
  optionIds?: number[];
  updatedAt: string;
};

type ProjectDetails = {
  domainName?: string;
  description?: string;
  colors?: string;
  specific_instructions?: string;
};

function formatPrice(value: number) {
  return value.toLocaleString('fr-FR').replace(/\u202f/g, ' ');
}

function OrderTunnelContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const { isAuthenticated } = useAuthState();
  const [currentMoment, setCurrentMoment] = useState<OrderMoment>('personalize');
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [formData, setFormData] = useState<ProjectDetails & { templateId: string | null }>({ templateId });
  const [template, setTemplate] = useState<Template | null>(null);
  const [orderOptions, setOrderOptions] = useState<OrderOption[]>([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [optionsStatus, setOptionsStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [optionsLoadAttempt, setOptionsLoadAttempt] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectingToPayment, setRedirectingToPayment] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [orderRef, setOrderRef] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentErrorType, setPaymentErrorType] = useState<'auth' | 'generic' | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    if (!templateId) return;
    setLoading(true);
    businessService.getTemplate(templateId)
      .then(setTemplate)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [templateId]);

  useEffect(() => {
    setOptionsStatus('loading');
    businessService.getOrderOptions()
      .then((options) => {
        setOrderOptions(options);
        setOptionsStatus('ready');
      })
      .catch(() => {
        setOrderOptions([]);
        setOptionsStatus('error');
      });
  }, [optionsLoadAttempt]);

  useEffect(() => {
    if (optionsStatus !== 'ready') return;
    const activeOptionIds = new Set(orderOptions.map(option => option.id));
    setSelectedOptionIds(current => current.filter(id => activeOptionIds.has(id)));
  }, [optionsStatus, orderOptions]);

  useEffect(() => {
    if (!templateId) return;

    try {
      const rawDraft = localStorage.getItem(ORDER_DRAFT_STORAGE_KEY);
      if (!rawDraft) return;

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

      if (sameTemplate && Array.isArray(draft.optionIds)) {
        setSelectedOptionIds(draft.optionIds.filter((id): id is number => typeof id === 'number'));
      }
    } catch {
      localStorage.removeItem(ORDER_DRAFT_STORAGE_KEY);
    } finally {
      setDraftLoaded(true);
    }
  }, [templateId]);

  useEffect(() => {
    if (!templateId || !draftLoaded) return;

    const hasDraftData = Boolean(
      formData.domainName?.trim() ||
      formData.description?.trim() ||
      formData.colors?.trim() ||
      formData.specific_instructions?.trim() ||
      selectedOptionIds.length > 0
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
      optionIds: selectedOptionIds,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(ORDER_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [
    templateId,
    formData.domainName,
    formData.description,
    formData.colors,
    formData.specific_instructions,
    selectedOptionIds,
    draftLoaded,
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentMoment]);

  const basePrice = template
    ? (typeof template.price === 'string' ? parseInt(template.price) : template.price)
    : 0;
  const selectedOptions = orderOptions.filter(option => selectedOptionIds.includes(option.id));
  const optionsTotal = selectedOptions.reduce((sum, option) => sum + option.price, 0);
  const finalPrice = basePrice + optionsTotal;
  const visibleMoment = currentMoment === 'confirmation' ? 'payment' : currentMoment;
  const visibleMomentIndex = VISIBLE_MOMENTS.findIndex(moment => moment.id === visibleMoment);

  const goToPersonalize = (target?: 'details' | 'options') => {
    setCurrentMoment('personalize');
    setShowAuthGate(false);
    window.setTimeout(() => {
      document.getElementById(target === 'options' ? 'order-options' : 'project-details')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePersonalizeSuccess = (data: ProjectDetails) => {
    setFormData(prev => ({ ...prev, ...data }));
    trackFunnelEvent('start_order', {
      template_id: templateId ? Number(templateId) : null,
      source: 'order_workshop',
      authenticated: isAuthenticated,
    });

    if (isAuthenticated) {
      setCurrentMoment('review');
      return;
    }

    setShowAuthGate(true);
    window.setTimeout(() => {
      document.getElementById('order-authentication')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handlePayment = async () => {
    setIsSubmitting(true);
    setRedirectingToPayment(false);
    setPaymentError(null);
    setPaymentErrorType(null);

    try {
      if (optionsStatus !== 'ready') {
        throw new Error('Les options de commande ne sont pas disponibles.');
      }

      let orderIdToPay = createdOrderId;
      let orderAmount = finalPrice;

      if (!orderIdToPay) {
        const order = await businessService.createOrder({
          template_id: templateId,
          enterprise_name: formData.domainName,
          activity_description: formData.description,
          colors: formData.colors ? formData.colors.split(',').map(color => color.trim()) : [],
          specific_instructions: formData.specific_instructions,
          option_ids: selectedOptions.map(option => option.id),
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

      const payment = await businessService.initiateOrderPayment(orderIdToPay, { mode: 'checkout' });

      if (payment.order.payment_status === 'paid') {
        setCurrentMoment('confirmation');
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
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        setPaymentErrorType('auth');
        setPaymentError('Votre session a expiré. Reconnectez-vous pour finaliser la commande.');
      } else if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
        setPaymentErrorType('generic');
        setPaymentError(error.response.data.message);
      } else {
        setPaymentErrorType('generic');
        setPaymentError('Nous n’avons pas pu lancer le paiement. Veuillez réessayer.');
      }
    } finally {
      setIsSubmitting(false);
      setRedirectingToPayment(false);
    }
  };

  const supportHref = (() => {
    const params = new URLSearchParams();
    const momentLabel = VISIBLE_MOMENTS.find(moment => moment.id === visibleMoment)?.name ?? 'Commande';
    params.set('subject', 'Aide commande FRILO');
    params.set(
      'message',
      `Bonjour,\nJe souhaite de l'aide sur ma commande.\nÉtape actuelle: ${momentLabel}\nTemplate: ${template?.name ?? 'Template non chargé'}`
    );
    if (orderRef) params.set('order_reference', `#ORD-${orderRef}`);
    return `/contact?${params.toString()}`;
  })();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] pb-24 text-slate-950 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-5 px-4 md:px-8">
          <Link
            href={template ? `/templates/${template.id}` : '/templates'}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-slate-500 transition-colors hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>

          <nav aria-label="Progression de la commande" className="mx-auto flex min-w-0 flex-1 items-center justify-center">
            {VISIBLE_MOMENTS.map((moment, index) => {
              const active = index === visibleMomentIndex;
              const complete = index < visibleMomentIndex || currentMoment === 'confirmation';
              return (
                <div key={moment.id} className="flex min-w-0 items-center">
                  {index > 0 && <span className={cn('mx-2 h-px w-4 sm:w-12', complete || active ? 'bg-slate-950' : 'bg-slate-200')} />}
                  <span className={cn(
                    'flex min-w-0 items-center gap-2 text-xs font-black sm:text-sm',
                    active ? 'text-slate-950' : complete ? 'text-slate-600' : 'text-slate-300'
                  )}>
                    <span className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px]',
                      active ? 'border-slate-950 bg-slate-950 text-white' : complete ? 'border-slate-950 text-slate-950' : 'border-slate-200'
                    )}>
                      {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span className="hidden sm:block">{moment.name}</span>
                  </span>
                </div>
              );
            })}
          </nav>

          <Link href="/" className="hidden shrink-0 text-xl font-black tracking-tight md:block">FRILO</Link>
        </div>
      </header>

      {currentMoment === 'personalize' && (
        <main className="mx-auto grid max-w-[1440px] gap-8 px-4 py-7 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-10">
          <div className="min-w-0">
            <div className="mb-8 max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">Votre commande</p>
              <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl">Adaptons ce modèle à votre activité.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 md:text-base">
                Donnez l’essentiel maintenant, puis ajoutez uniquement les fonctions utiles à votre activité.
              </p>
              {draftRestored && (
                <p className="mt-4 border-l-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Votre brouillon a été restauré automatiquement.
                </p>
              )}
            </div>

            <section id="project-details" className="scroll-mt-24 border-t border-slate-200 bg-white">
              <div className="grid gap-6 border-b border-slate-200 px-5 py-6 md:grid-cols-[180px_minmax(0,1fr)] md:px-7">
                <div>
                  <p className="text-sm font-black">Votre activité</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Ces informations permettent à FRILO de préparer le bon contenu.</p>
                </div>
                <ProjectDetailsForm
                  formId={PROJECT_FORM_ID}
                  showSubmit={false}
                  initialValues={{
                    domainName: formData.domainName ?? '',
                    description: formData.description ?? '',
                    colors: formData.colors ?? '',
                    specific_instructions: formData.specific_instructions ?? '',
                  }}
                  onChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
                  onSuccess={handlePersonalizeSuccess}
                />
              </div>
            </section>

            <section id="order-options" className="scroll-mt-24 border-b border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-5 md:px-7">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-black">Fonctions supplémentaires</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Vous pouvez continuer sans option.</p>
                  </div>
                  <p className="text-xs font-bold text-slate-500">{selectedOptions.length} sélectionnée{selectedOptions.length > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {orderOptions.map(option => {
                  const selected = selectedOptionIds.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedOptionIds(current =>
                        current.includes(option.id)
                          ? current.filter(id => id !== option.id)
                          : [...current, option.id]
                      )}
                      className={cn(
                        'flex w-full items-start gap-4 px-5 py-4 text-left transition-colors md:px-7',
                        selected ? 'bg-slate-950 text-white' : 'bg-white hover:bg-slate-50'
                      )}
                    >
                      <span className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                        selected ? 'border-white bg-white text-slate-950' : 'border-slate-300 text-transparent'
                      )}>
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-start justify-between gap-x-5 gap-y-1">
                          <span className="text-sm font-black">{option.name}</span>
                          <span className="shrink-0 text-sm font-black">+{formatPrice(option.price)} FCFA</span>
                        </span>
                        {option.description && (
                          <span className={cn('mt-1 block text-sm leading-6', selected ? 'text-white/70' : 'text-slate-500')}>
                            {option.description}
                          </span>
                        )}
                        {option.persona_hint && (
                          <span className={cn('mt-2 block text-xs font-bold', selected ? 'text-white/55' : 'text-slate-400')}>
                            Utile pour : {option.persona_hint}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}

                {optionsStatus === 'loading' && <p className="px-5 py-8 text-sm text-slate-500 md:px-7">Chargement des options disponibles...</p>}
                {optionsStatus === 'ready' && orderOptions.length === 0 && (
                  <p className="px-5 py-8 text-sm text-slate-500 md:px-7">Aucune option supplémentaire disponible pour le moment.</p>
                )}
                {optionsStatus === 'error' && (
                  <div className="px-5 py-8 md:px-7">
                    <p className="text-sm text-red-600">Impossible de charger les options. La vérification reste bloquée pour éviter un montant incorrect.</p>
                    <button type="button" onClick={() => setOptionsLoadAttempt(current => current + 1)} className="mt-3 text-sm font-black underline underline-offset-4">
                      Réessayer
                    </button>
                  </div>
                )}
              </div>
            </section>

            {showAuthGate && (
              <section id="order-authentication" className="mt-8 scroll-mt-24 border border-slate-200 bg-white px-5 py-6 md:px-7">
                <div className="grid gap-7 md:grid-cols-[minmax(0,0.75fr)_minmax(320px,1fr)]">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">Avant de vérifier</p>
                    <h2 className="mt-3 text-2xl font-black">Gardez votre commande dans votre espace.</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      Connectez-vous ou créez votre compte. Votre saisie et vos options restent enregistrées.
                    </p>
                  </div>
                  <AuthForms onSuccess={() => {
                    setShowAuthGate(false);
                    setCurrentMoment('review');
                  }} />
                </div>
              </section>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 border border-slate-200 bg-white">
              <OrderSummary
                template={template}
                selectedOptions={selectedOptions}
                basePrice={basePrice}
                optionsTotal={optionsTotal}
                finalPrice={finalPrice}
              />
              <div className="border-t border-slate-200 p-5">
                <button
                  type="submit"
                  form={PROJECT_FORM_ID}
                  disabled={!template || optionsStatus !== 'ready'}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-5 py-3.5 text-sm font-black text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Vérifier ma commande <ChevronRight className="ml-1 h-4 w-4" />
                </button>
                <Link href={supportHref} className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-950">
                  <CircleHelp className="h-4 w-4" /> Besoin d’aide ?
                </Link>
              </div>
            </div>
          </aside>
        </main>
      )}

      {currentMoment === 'review' && (
        <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 lg:py-12">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">Avant le paiement</p>
            <h1 className="mt-3 text-3xl font-black md:text-4xl">Vérifiez votre commande.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">Tout est encore modifiable. Le paiement créera ensuite votre commande.</p>
          </div>

          <div className="border-y border-slate-200 bg-white">
            <ReviewSection title="Modèle choisi" onEdit={() => goToPersonalize()}>
              <p className="font-black">{template?.name ?? 'Non sélectionné'}</p>
              {template?.sector && <p className="mt-1 text-sm text-slate-500">{template.sector.name}</p>}
            </ReviewSection>
            <ReviewSection title="Votre activité" onEdit={() => goToPersonalize('details')}>
              <p className="font-black">{formData.domainName}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{formData.description}</p>
              {formData.colors && <p className="mt-2 text-sm text-slate-500">Style : {formData.colors}</p>}
              {formData.specific_instructions && <p className="mt-2 text-sm text-slate-500">Note : {formData.specific_instructions}</p>}
            </ReviewSection>
            <ReviewSection title="Fonctions supplémentaires" onEdit={() => goToPersonalize('options')}>
              {selectedOptions.length > 0 ? (
                <div className="space-y-2">
                  {selectedOptions.map(option => (
                    <div key={option.id} className="flex justify-between gap-5 text-sm">
                      <span className="font-bold">{option.name}</span>
                      <span className="shrink-0 font-black">+{formatPrice(option.price)} FCFA</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-slate-500">Aucune option ajoutée.</p>}
            </ReviewSection>
            <div className="grid gap-5 px-5 py-6 md:grid-cols-[180px_minmax(0,1fr)] md:px-7">
              <p className="text-sm font-black">Inclus par FRILO</p>
              <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <p>Adaptation du modèle</p>
                <p>Version mobile</p>
                <p>Mise en ligne</p>
                <p>Suivi dans votre espace client</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 border border-slate-200 bg-white p-5 md:grid-cols-[minmax(0,1fr)_280px] md:p-7">
            <div>
              <p className="text-sm font-black">Votre total</p>
              <div className="mt-4 max-w-md divide-y divide-slate-100 border-y border-slate-100 text-sm">
                <PriceRow label="Site FRILO" value={`${formatPrice(basePrice)} FCFA`} />
                <PriceRow label="Options choisies" value={`+${formatPrice(optionsTotal)} FCFA`} />
                <PriceRow label="Total à payer" value={`${formatPrice(finalPrice)} FCFA`} strong />
              </div>
            </div>
            <div className="self-end">
              <button
                type="button"
                onClick={() => setCurrentMoment('payment')}
                className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-5 py-3.5 text-sm font-black text-white transition-colors hover:bg-red-700"
              >
                Continuer vers le paiement <ChevronRight className="ml-1 h-4 w-4" />
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-slate-400">Aucun paiement n’est encore effectué.</p>
            </div>
          </div>
        </main>
      )}

      {currentMoment === 'payment' && (
        <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">Paiement sécurisé</p>
            <h1 className="mt-3 text-3xl font-black md:text-4xl">Validez le lancement de votre site.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Après confirmation du paiement, FRILO reçoit votre commande et peut commencer l’adaptation du modèle.
            </p>

            <div className="mt-8 border-y border-slate-200 bg-white">
              <PriceRow label="Modèle et adaptation" value={`${formatPrice(basePrice)} FCFA`} />
              <PriceRow label="Options choisies" value={`+${formatPrice(optionsTotal)} FCFA`} />
              <PriceRow label="Total à payer" value={`${formatPrice(finalPrice)} FCFA`} strong />
            </div>

            <button type="button" onClick={() => setCurrentMoment('review')} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-slate-950">
              <Pencil className="h-4 w-4" /> Revenir à la vérification
            </button>
          </div>

          <div className="self-start border border-slate-200 bg-white p-5 md:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Total à payer</p>
                <p className="mt-2 text-4xl font-black">{formatPrice(finalPrice)}</p>
                <p className="mt-1 text-sm font-bold text-slate-400">FCFA</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 border-l-2 border-slate-950 bg-slate-50 px-4 py-3">
              <p className="text-sm font-black">Paiement via FedaPay</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Vous serez redirigé vers l’espace de paiement sécurisé.</p>
              {createdOrderId && <p className="mt-2 text-xs font-bold text-slate-400">Commande préparée : #{String(createdOrderId).padStart(5, '0')}</p>}
            </div>

            {paymentError && (
              <div className="mt-5 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p>{paymentError}</p>
                {paymentErrorType === 'auth' && (
                  <button type="button" onClick={() => {
                    setCurrentMoment('personalize');
                    setShowAuthGate(true);
                  }} className="mt-3 font-black underline underline-offset-4">
                    Se reconnecter
                  </button>
                )}
                {paymentErrorType === 'generic' && (
                  <button type="button" onClick={handlePayment} className="mt-3 font-black underline underline-offset-4">
                    Réessayer maintenant
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handlePayment}
              disabled={isSubmitting || redirectingToPayment}
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-5 py-3.5 text-sm font-black text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting || redirectingToPayment ? 'Redirection vers FedaPay…' : 'Payer maintenant'}
            </button>
            <Link href={supportHref} className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-950">
              <CircleHelp className="h-4 w-4" /> Une question avant de payer ?
            </Link>
          </div>
        </main>
      )}

      {currentMoment === 'confirmation' && (
        <main className="mx-auto max-w-xl px-4 py-14 text-center md:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white">
            <Check className="h-6 w-6" />
          </div>
          <h1 className="mt-7 text-3xl font-black">Commande confirmée.</h1>
          <p className="mt-4 text-sm text-slate-500">Référence</p>
          <p className="mt-1 text-2xl font-black">#ORD-{orderRef}</p>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-slate-500">
            Notre équipe prend le relais. Vous recevrez un e-mail de confirmation et pourrez suivre la préparation depuis votre espace client.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard/orders" className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white">Suivre ma commande</Link>
            <Link href="/" className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-black">Retour à l’accueil</Link>
          </div>
        </main>
      )}

      {currentMoment === 'personalize' && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Total</p>
              <p className="truncate text-lg font-black">{formatPrice(finalPrice)} FCFA</p>
            </div>
            <button
              type="submit"
              form={PROJECT_FORM_ID}
              disabled={!template || optionsStatus !== 'ready'}
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-red-600 px-4 py-3 text-sm font-black text-white disabled:opacity-40"
            >
              Vérifier <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderSummary({
  template,
  selectedOptions,
  basePrice,
  optionsTotal,
  finalPrice,
}: {
  template: Template | null;
  selectedOptions: OrderOption[];
  basePrice: number;
  optionsTotal: number;
  finalPrice: number;
}) {
  return (
    <div>
      {template?.full_thumbnail_url && (
        <Image src={template.full_thumbnail_url} alt={template.name} width={680} height={380} className="h-36 w-full object-cover object-top" />
      )}
      <div className="p-5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Votre sélection</p>
        <p className="mt-3 text-lg font-black">{template?.name ?? 'Aucun modèle sélectionné'}</p>
        {template?.sector && <p className="mt-1 text-xs text-slate-500">{template.sector.name}</p>}
        <div className="mt-5 divide-y divide-slate-100 border-y border-slate-100 text-sm">
          <PriceRow label="Site FRILO" value={`${formatPrice(basePrice)} FCFA`} />
          <PriceRow label={`${selectedOptions.length} option${selectedOptions.length > 1 ? 's' : ''}`} value={`+${formatPrice(optionsTotal)} FCFA`} />
          <PriceRow label="Total" value={`${formatPrice(finalPrice)} FCFA`} strong />
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-b border-slate-200 px-5 py-6 md:grid-cols-[180px_minmax(0,1fr)_auto] md:px-7">
      <p className="text-sm font-black">{title}</p>
      <div>{children}</div>
      <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 self-start text-sm font-black text-red-600 hover:text-red-700">
        <Pencil className="h-3.5 w-3.5" /> Modifier
      </button>
    </div>
  );
}

function PriceRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className={strong ? 'font-black' : 'text-slate-500'}>{label}</span>
      <span className={cn('text-right font-black', strong && 'text-lg')}>{value}</span>
    </div>
  );
}

export default function OrderTunnelPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    }>
      <OrderTunnelContent />
    </Suspense>
  );
}
