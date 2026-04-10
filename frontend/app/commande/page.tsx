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
  const [orderRef, setOrderRef] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentErrorType, setPaymentErrorType] = useState<'auth' | 'generic' | null>(null);

  useEffect(() => {
    if (!templateId) return;
    setLoading(true);
    businessService.getTemplate(templateId)
      .then(setTemplate)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [templateId]);

  const nextStep = () => setCurrentStep(p => Math.min(p + 1, STEPS.length));

  useEffect(() => {
    if (isAuthenticated && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [isAuthenticated, currentStep]);

  const handlePayment = async () => {
    setIsSubmitting(true);
    setPaymentError(null);
    setPaymentErrorType(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const order = await businessService.createOrder({
        template_id: templateId,
        enterprise_name: formData.domainName,
        activity_description: formData.description,
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : [],
        specific_instructions: formData.specific_instructions,
      });
      trackFunnelEvent('submit_order', {
        template_id: templateId ? Number(templateId) : null,
        order_id: order.id,
        amount: order.price,
      });
      setOrderRef(String(order.id).padStart(5, '0'));
      nextStep();
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
        setPaymentErrorType('auth');
        setPaymentError('Votre session a expiré. Reconnectez-vous pour finaliser la commande.');
      } else {
        setPaymentErrorType('generic');
        setPaymentError('Nous n’avons pas pu finaliser votre commande. Veuillez réessayer.');
      }
    } finally {
      setIsSubmitting(false);
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
              <ProjectDetailsForm onSuccess={(data) => {
                setFormData(prev => ({ ...prev, ...data }));
                nextStep();
              }} />
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
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Intégration paiement</p>
                <p className="text-sm text-gray-500">Mobile Money & Carte bancaire disponibles prochainement.</p>
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
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={isSubmitting}
                className="sq-btn sq-btn-black w-full justify-center disabled:opacity-50"
              >
                {isSubmitting ? 'Traitement…' : `Valider la commande — ${price.toLocaleString('fr-FR')} FCFA`}
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
