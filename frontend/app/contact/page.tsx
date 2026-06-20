"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Mail, MessageCircle, Send } from 'lucide-react';
import axios from 'axios';
import { PublicPageShell } from '@/components/public/PublicPageShell';
import {
  contactService,
  ContactRequestPayload,
  ContactRequestValidationErrors,
} from '@/services/contact.service';

type ContactRequestType = 'model' | 'order' | 'guidance' | 'general';

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  order_reference: string;
  subject: string;
  message: string;
};

const REQUEST_TYPES: Array<{
  value: ContactRequestType;
  label: string;
  subject: string;
  description: string;
  requiresReference?: boolean;
}> = [
  {
    value: 'model',
    label: 'Choisir un modèle',
    subject: 'Choix du modèle',
    description: 'Vous hésitez entre plusieurs bases ou vous voulez valider le bon point de départ.',
  },
  {
    value: 'order',
    label: 'Suivre une commande',
    subject: 'Suivi de commande',
    description: 'Vous avez déjà commencé ou payé une commande et vous voulez une précision.',
    requiresReference: true,
  },
  {
    value: 'guidance',
    label: 'Demander une orientation',
    subject: 'Orientation FRILO',
    description: 'Votre activité ne rentre pas exactement dans un modèle et vous voulez être conseillé.',
  },
  {
    value: 'general',
    label: 'Question générale',
    subject: 'Question générale',
    description: 'Prix, contenu, délai, paiement ou fonctionnement : posez votre question directement.',
  },
];

export default function ContactPage() {
  const [requestType, setRequestType] = useState<ContactRequestType>('guidance');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ContactRequestValidationErrors>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [form, setForm] = useState<ContactFormState>({
    name: '',
    email: '',
    phone: '',
    company: '',
    order_reference: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subject = params.get('subject') ?? '';
    const message = params.get('message') ?? '';
    const orderReference = params.get('order_reference') ?? '';

    if (/commande|order/i.test(subject) || orderReference) {
      setRequestType('order');
    } else if (/mod[eè]le|template/i.test(subject)) {
      setRequestType('model');
    } else if (/secteur|orientation|recommandation/i.test(subject)) {
      setRequestType('guidance');
    }

    if (!subject && !message && !orderReference) {
      return;
    }

    setForm(prev => ({
      ...prev,
      subject: prev.subject || subject,
      message: prev.message || message,
      order_reference: prev.order_reference || orderReference,
    }));
  }, []);

  const handleChange = (field: keyof ContactFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: [] }));
  };

  const selectedRequestType = REQUEST_TYPES.find(item => item.value === requestType) ?? REQUEST_TYPES[0];

  const handleRequestTypeChange = (type: ContactRequestType) => {
    const nextType = REQUEST_TYPES.find(item => item.value === type) ?? REQUEST_TYPES[0];

    setRequestType(type);
    setFieldErrors(prev => ({ ...prev, subject: [], order_reference: [] }));
    setForm(prev => ({
      ...prev,
      subject: nextType.subject,
      order_reference: nextType.requiresReference ? prev.order_reference : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    if (!acceptedTerms) {
      setFieldErrors({ accepted_terms: ['Vous devez accepter les termes et conditions avant d’envoyer votre message.'] });
      return;
    }

    setSubmitting(true);

    const payload: ContactRequestPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim() || selectedRequestType.subject,
      message: form.message.trim(),
      phone: form.phone.trim() || undefined,
      company: form.company.trim() || undefined,
      order_reference: form.order_reference.trim() || undefined,
      accepted_terms: acceptedTerms,
    };

    try {
      await contactService.submitContact(payload);
      setSent(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422 && err.response.data?.errors) {
        setFieldErrors(err.response.data.errors as ContactRequestValidationErrors);
      } else if (axios.isAxiosError(err) && err.response?.status === 429) {
        setSubmitError('Trop de tentatives en peu de temps. Veuillez réessayer dans quelques minutes.');
      } else if (axios.isAxiosError(err) && err.response?.data?.message) {
        setSubmitError(err.response.data.message as string);
      } else {
        setSubmitError('Une erreur est survenue lors de l’envoi. Veuillez réessayer.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicPageShell className="bg-white">
      <section className="bg-white px-5 pb-8 pt-24 md:px-8 md:pb-10 md:pt-28">
        <div className="mx-auto grid max-w-[1360px] gap-8 lg:grid-cols-[minmax(0,0.98fr)_minmax(360px,0.62fr)] lg:items-end">
          <div>
            <p className="text-sm font-black text-[#e60000]">Contact FRILO</p>
            <h1 className="mt-5 max-w-3xl text-balance text-4xl font-black leading-[0.98] text-black sm:text-5xl md:text-6xl">
              Contactez FRILO.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-700 md:text-lg md:leading-8">
              Une question sur un modèle, une commande ou votre futur site ? Envoyez l’essentiel, nous vous répondons avec la prochaine étape.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#message"
                className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-black text-white transition-colors hover:bg-[#e60000]"
              >
                Écrire à FRILO
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <Link
                href="/templates"
                className="inline-flex items-center justify-center rounded-full border border-black px-6 py-3 text-sm font-black text-black transition-colors hover:bg-slate-50"
              >
                Voir les modèles
              </Link>
            </div>
          </div>

          <div className="hidden border-y border-black py-5 md:block">
            <p className="text-sm font-black text-black">Réponse habituelle sous 24h ouvrées.</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Pour une commande existante, choisissez “Suivre une commande” dans le formulaire.
            </p>
            <a
              href="mailto:contact@frilo.com"
              className="mt-5 inline-flex items-center gap-3 text-sm font-black text-black transition-colors hover:text-[#e60000]"
            >
              <Mail className="h-4 w-4" />
              contact@frilo.com
            </a>
          </div>
        </div>
      </section>

      <section id="message" className="border-t border-black bg-white px-5 py-10 md:px-8 md:py-12">
        <div className="mx-auto grid max-w-[1360px] gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="border-y border-black bg-white py-8">
            <div className="grid gap-8 px-0 md:px-8 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div>
                <p className="text-sm font-black text-[#e60000]">Votre message</p>
                <h2 className="mt-3 max-w-sm text-balance text-2xl font-black leading-tight text-black md:text-4xl">
                  Dites-nous l’essentiel.
                </h2>
                <p className="mt-4 hidden max-w-sm text-sm leading-6 text-slate-600 sm:block">
                  Choisissez le contexte, puis laissez un message court.
                </p>
              </div>

              {sent ? (
                <div className="border-y border-black bg-slate-50 p-10 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e60000]">
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="mb-2 text-xl font-black text-black">Message envoyé.</h2>
                  <p className="text-sm text-slate-600">Nous vous répondrons dans les 24 heures ouvrées.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-3 block text-xs font-black uppercase tracking-[0.08em] text-black">
                      Votre demande
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {REQUEST_TYPES.map(item => {
                        const active = item.value === requestType;

                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => handleRequestTypeChange(item.value)}
                            className={`flex items-center justify-between border px-4 py-3 text-left text-sm font-black transition-colors ${
                              active
                                ? 'border-black bg-black text-white'
                                : 'border-slate-300 bg-white text-black hover:border-black'
                            }`}
                          >
                            {item.label}
                            {active && <Check className="h-4 w-4" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-black">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Jean Dupont"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        className="w-full border border-slate-300 bg-white px-4 py-3.5 text-sm text-black outline-none transition-colors placeholder:text-slate-500 focus:border-black"
                      />
                      {fieldErrors.name?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.name[0]}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-black">
                        E-mail <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="vous@exemple.com"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        className="w-full border border-slate-300 bg-white px-4 py-3.5 text-sm text-black outline-none transition-colors placeholder:text-slate-500 focus:border-black"
                      />
                      {fieldErrors.email?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.email[0]}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-black">Téléphone</label>
                      <input
                        type="text"
                        placeholder="+229 00 00 00 00"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full border border-slate-300 bg-white px-4 py-3.5 text-sm text-black outline-none transition-colors placeholder:text-slate-500 focus:border-black"
                      />
                      {fieldErrors.phone?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.phone[0]}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-black">
                        Objet <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="J'ai une question sur…"
                        value={form.subject || selectedRequestType.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        required
                        className="w-full border border-slate-300 bg-white px-4 py-3.5 text-sm text-black outline-none transition-colors placeholder:text-slate-500 focus:border-black"
                      />
                      {fieldErrors.subject?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.subject[0]}</p>}
                    </div>
                  </div>
                  {selectedRequestType.requiresReference && (
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-black">Référence commande</label>
                      <input
                        type="text"
                        placeholder="#ORD-00042"
                        value={form.order_reference}
                        onChange={(e) => handleChange('order_reference', e.target.value)}
                        className="w-full border border-slate-300 bg-white px-4 py-3.5 text-sm text-black outline-none transition-colors placeholder:text-slate-500 focus:border-black"
                      />
                      {fieldErrors.order_reference?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.order_reference[0]}</p>}
                    </div>
                  )}
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-black">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Dites-nous en plus sur votre projet…"
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      required
                      className="w-full resize-none border border-slate-300 bg-white px-4 py-3.5 text-sm text-black outline-none transition-colors placeholder:text-slate-500 focus:border-black"
                    />
                    {fieldErrors.message?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.message[0]}</p>}
                  </div>
                  <div className="border-y border-slate-200 bg-slate-50 px-4 py-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(event) => {
                          setAcceptedTerms(event.target.checked);
                          setFieldErrors((prev) => ({ ...prev, accepted_terms: [] }));
                        }}
                        required
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                      />
                      <span className="text-sm leading-relaxed text-black/62">
                        J’accepte que mes informations soient utilisées pour traiter ma demande, conformément aux{' '}
                        <Link href="/mentions-legales" className="font-black text-black underline underline-offset-2">
                          mentions légales
                        </Link>{' '}
                        et aux{' '}
                        <Link href="/cgu" className="font-black text-black underline underline-offset-2">
                          CGU / CGV
                        </Link>
                        <span className="text-red-500"> *</span>
                        .
                      </span>
                    </label>
                    {fieldErrors.accepted_terms?.[0] && (
                      <p className="text-red-500 text-xs mt-2">{fieldErrors.accepted_terms[0]}</p>
                    )}
                  </div>
                  {submitError && <p className="text-sm text-red-600 text-center">{submitError}</p>}
                  <div className="flex flex-col gap-4 pt-2 md:flex-row md:items-center md:justify-between">
                    <p className="text-xs leading-relaxed text-slate-500">
                      Aucune commande n’est créée depuis cette page. Elle sert uniquement à vous orienter.
                    </p>
                    <button
                      type="submit"
                      disabled={submitting || !acceptedTerms}
                      className="inline-flex justify-center rounded-full bg-black px-7 py-3.5 text-sm font-black text-white transition-colors hover:bg-[#e60000] disabled:opacity-50 md:min-w-[220px]"
                    >
                      {submitting ? 'Envoi en cours…' : 'Envoyer'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <aside className="h-fit border-y border-black py-6 lg:sticky lg:top-24">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-black text-black">Réponse</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Nous répondons habituellement sous 24h ouvrées avec une suite claire.
                </p>
              </div>

              <div className="border-t border-slate-200 pt-5">
                <p className="text-sm font-black text-black">Canal direct</p>
                <a
                  href="mailto:contact@frilo.com"
                  className="mt-4 inline-flex items-center gap-3 text-sm font-black text-black transition-colors hover:text-[#e60000]"
                >
                  <MessageCircle className="h-4 w-4" />
                  contact@frilo.com
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PublicPageShell>
  );
}
