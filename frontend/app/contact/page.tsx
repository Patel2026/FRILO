"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Phone, Send } from 'lucide-react';
import axios from 'axios';
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
    label: 'Téléphone',
    value: '+229 00 00 00 00',
    sub: 'Lun — Ven, 9h – 18h',
  },
  {
    icon: Mail,
    label: 'E-mail',
    value: 'contact@frilo.com',
    sub: 'Réponse moyenne sous 24h',
  },
  {
    icon: MapPin,
    label: 'Bureaux',
    value: 'Cotonou, Bénin',
    sub: "Accompagnement à distance sur toute l'Afrique de l'Ouest",
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
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="sq-section bg-black text-white">
        <div className="sq-container text-center">
          <p className="sq-label text-gray-500 mb-5">Contact</p>
          <h1 className="sq-display text-white mb-6">Parlons<br />de votre projet.</h1>
          <p className="text-gray-400 text-xl max-w-lg mx-auto">
            Un projet, une question ? Notre équipe vous répond sous 24h.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 md:py-20 bg-[#fcfcfb]">
        <div className="sq-container">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-8 lg:gap-10 items-start">

            {/* Info */}
            <div className="space-y-5 lg:sticky lg:top-28">
              <div className="rounded-[2rem] border border-gray-200 bg-white p-7 md:p-8">
                <p className="sq-label mb-4">Nous joindre</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black mb-4">
                  Un vrai échange,
                  <br />
                  pas un formulaire froid.
                </h2>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-8 max-w-md">
                  Dites-nous où vous en êtes: besoin d'un conseil, d'un devis ou d'un suivi de commande.
                  Nous vous orientons rapidement vers la bonne suite.
                </p>

                <div className="space-y-4">
                  {CONTACT_CHANNELS.map(({ icon: Icon, label, value, sub }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-gray-100 bg-[#fcfcfb] p-4 md:p-5 flex items-start gap-4"
                    >
                      <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Icon className="text-white w-[18px] h-[18px]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-1.5">
                          {label}
                        </p>
                        <p className="text-base font-bold text-black">{value}</p>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] bg-black text-white p-7 md:p-8">
                <p className="sq-label text-gray-500 mb-4">Prêt à commander ?</p>
                <h3 className="text-2xl font-black tracking-tight mb-3">Vous pouvez aussi partir d'un modèle existant.</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  Si votre besoin est déjà clair, le plus rapide est souvent de choisir un modèle puis de nous transmettre vos contenus.
                </p>
                <Link href="/templates" className="sq-btn sq-btn-white">
                  Voir les modèles <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-[2rem] border border-gray-200 bg-white p-7 md:p-8 shadow-[0_20px_70px_rgba(15,23,42,0.05)]">
              <p className="sq-label mb-4">Envoyer un message</p>
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-black mb-3">Décrivez-nous votre besoin.</h2>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-2xl">
                  Plus votre message est précis, plus nous pouvons vous répondre vite. Si vous avez déjà une commande,
                  ajoutez sa référence pour un traitement immédiat.
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
                  Les champs marqués * sont obligatoires.
                </p>
              </div>

              {sent ? (
                <div className="border border-gray-100 rounded-[1.75rem] bg-[#fcfcfb] p-10 text-center">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-black text-black mb-2">Message envoyé.</h2>
                  <p className="text-gray-500 text-sm">Nous vous répondrons dans les 24 heures.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Jean Dupont"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                        className="w-full border border-gray-200 bg-[#fcfcfb] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
                      />
                      {fieldErrors.name?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.name[0]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">
                        E-mail <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="vous@exemple.com"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                        className="w-full border border-gray-200 bg-[#fcfcfb] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
                      />
                      {fieldErrors.email?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.email[0]}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">Téléphone (optionnel)</label>
                      <input
                        type="text"
                        placeholder="+229 00 00 00 00"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full border border-gray-200 bg-[#fcfcfb] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
                      />
                      {fieldErrors.phone?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.phone[0]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">Entreprise (optionnel)</label>
                      <input
                        type="text"
                        placeholder="Mon entreprise"
                        value={form.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        className="w-full border border-gray-200 bg-[#fcfcfb] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
                      />
                      {fieldErrors.company?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.company[0]}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">Référence commande (optionnel)</label>
                    <input
                      type="text"
                      placeholder="#ORD-00042"
                      value={form.order_reference}
                      onChange={(e) => handleChange('order_reference', e.target.value)}
                      className="w-full border border-gray-200 bg-[#fcfcfb] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
                    />
                    {fieldErrors.order_reference?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.order_reference[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">
                      Sujet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="J'ai une question sur…"
                      value={form.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      required
                      className="w-full border border-gray-200 bg-[#fcfcfb] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
                    />
                    {fieldErrors.subject?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.subject[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Dites-nous en plus sur votre projet…"
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      required
                      className="w-full border border-gray-200 bg-[#fcfcfb] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300 resize-none"
                    />
                    {fieldErrors.message?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.message[0]}</p>}
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-[#fcfcfb] px-4 py-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(event) => {
                          setAcceptedTerms(event.target.checked);
                          setFieldErrors((prev) => ({ ...prev, accepted_terms: [] }));
                        }}
                        required
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-600 leading-relaxed">
                        J’accepte que mes informations soient utilisées pour traiter ma demande, conformément aux{' '}
                        <Link href="/mentions-legales" className="font-semibold text-black underline underline-offset-2">
                          mentions légales
                        </Link>{' '}
                        et aux{' '}
                        <Link href="/cgu" className="font-semibold text-black underline underline-offset-2">
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
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Temps de réponse moyen: moins de 24h ouvrées.
                    </p>
                    <button
                      type="submit"
                      disabled={submitting || !acceptedTerms}
                      className="sq-btn sq-btn-black justify-center disabled:opacity-50 md:min-w-[220px]"
                    >
                      {submitting ? 'Envoi en cours…' : 'Envoyer'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
