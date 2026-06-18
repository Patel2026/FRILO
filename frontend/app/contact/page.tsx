"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, Send } from 'lucide-react';
import axios from 'axios';
import {
  PublicHero,
  PublicPageShell,
} from '@/components/public/PublicPageShell';
import {
  contactService,
  ContactRequestPayload,
  ContactRequestValidationErrors,
} from '@/services/contact.service';

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  order_reference: string;
  subject: string;
  message: string;
};

const CONTACT_CHANNELS = [
  {
    icon: Phone,
    value: '+229 00 00 00 00',
    href: 'tel:+22900000000',
  },
  {
    icon: Mail,
    value: 'contact@frilo.com',
    href: 'mailto:contact@frilo.com',
  },
];

export default function ContactPage() {
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
      subject: form.subject.trim(),
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
    <PublicPageShell>
      <PublicHero
        eyebrow="Contact"
        title="Dites-nous ce dont vous avez besoin."
        description="Une question sur un modèle, une commande ou votre futur site ? Envoyez un message court, on vous répond avec la prochaine étape."
        primaryAction={{ label: 'Écrire un message', href: '#message' }}
        secondaryAction={{ label: 'Voir les modèles', href: '/templates' }}
        aside={(
          <div className="grid gap-3 border-y border-black bg-white p-5">
            {CONTACT_CHANNELS.map(({ icon: Icon, value, href }) => (
              <a
                key={value}
                href={href}
                className="inline-flex items-center gap-3 border-b border-black/10 py-3 text-sm font-black text-black transition-colors last:border-b-0 hover:text-[#e60000]"
              >
                <Icon className="h-4 w-4" />
                {value}
              </a>
            ))}
          </div>
        )}
      />

      <div id="message" className="px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-5xl">
            <div className="border-y border-black bg-white p-5 md:p-8">
              <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">Message</p>
                <h2 className="mt-3 text-3xl font-black leading-tight text-black md:text-4xl">Écrivez simplement.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-black/62">
                  Votre nom, votre contact et le sujet suffisent pour démarrer. Ajoutez une référence seulement si vous parlez d’une commande.
                </p>
              </div>

              {sent ? (
                <div className="border-y border-black/10 bg-[#f7f4ec] p-10 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black">
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="mb-2 text-xl font-black text-black">Message envoyé.</h2>
                  <p className="text-sm text-black/62">Nous vous répondrons dans les 24 heures.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="border-b border-black/10 pb-2 text-xs font-black uppercase tracking-[0.14em] text-black/40">
                    Vos informations
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Jean Dupont"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        className="w-full rounded-full border border-black/15 bg-white px-4 py-3.5 text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
                      />
                      {fieldErrors.name?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.name[0]}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black">
                        E-mail <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="vous@exemple.com"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        className="w-full rounded-full border border-black/15 bg-white px-4 py-3.5 text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
                      />
                      {fieldErrors.email?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.email[0]}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black">Téléphone</label>
                      <input
                        type="text"
                        placeholder="+229 00 00 00 00"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full rounded-full border border-black/15 bg-white px-4 py-3.5 text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
                      />
                      {fieldErrors.phone?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.phone[0]}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black">Entreprise</label>
                      <input
                        type="text"
                        placeholder="Mon entreprise"
                        value={form.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="w-full rounded-full border border-black/15 bg-white px-4 py-3.5 text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
                      />
                      {fieldErrors.company?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.company[0]}</p>}
                    </div>
                  </div>
                  <div className="border-b border-black/10 pb-2 pt-3 text-xs font-black uppercase tracking-[0.14em] text-black/40">
                    Contexte
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_0.62fr]">
                    <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black">
                      Sujet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="J'ai une question sur…"
                      value={form.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      required
                      className="w-full rounded-full border border-black/15 bg-white px-4 py-3.5 text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
                    />
                    {fieldErrors.subject?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.subject[0]}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black">Référence</label>
                      <input
                        type="text"
                        placeholder="#ORD-00042"
                        value={form.order_reference}
                        onChange={(e) => handleChange('order_reference', e.target.value)}
                        className="w-full rounded-full border border-black/15 bg-white px-4 py-3.5 text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
                      />
                      {fieldErrors.order_reference?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.order_reference[0]}</p>}
                    </div>
                  </div>
                  <div className="border-b border-black/10 pb-2 pt-3 text-xs font-black uppercase tracking-[0.14em] text-black/40">
                    Message
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-black">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Dites-nous en plus sur votre projet…"
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      required
                      className="w-full resize-none rounded-2xl border border-black/15 bg-white px-4 py-3.5 text-sm text-black outline-none transition-colors placeholder:text-black/30 focus:border-black"
                    />
                    {fieldErrors.message?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.message[0]}</p>}
                  </div>
                  <div className="border-y border-black/10 bg-[#f7f4ec] px-4 py-4">
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
                    <p className="text-xs leading-relaxed text-slate-400">
                      Réponse habituelle sous 24h ouvrées.
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
      </div>
    </PublicPageShell>
  );
}
