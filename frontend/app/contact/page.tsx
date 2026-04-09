"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
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
  subject: string;
  message: string;
};

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ContactRequestValidationErrors>({});
  const [form, setForm] = useState<ContactFormState>({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
  });

  const handleChange = (field: keyof ContactFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});
    setSubmitting(true);

    const payload: ContactRequestPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      phone: form.phone.trim() || undefined,
      company: form.company.trim() || undefined,
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
      <div className="sq-section">
        <div className="sq-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

            {/* Info */}
            <div>
              <p className="sq-label mb-8">Nous joindre</p>
              <div className="space-y-8">
                {[
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
                    sub: 'Réponse sous 24h',
                  },
                  {
                    icon: MapPin,
                    label: 'Bureaux',
                    value: 'Cotonou, Bénin',
                    sub: 'Afrique de l\'Ouest',
                  },
                ].map(({ icon: Icon, label, value, sub }) => (
                  <div key={label} className="flex items-start gap-5">
                    <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                      <p className="text-sm font-semibold text-black">{value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-12 border-t border-gray-100">
                <p className="sq-label mb-4">Prêt à commander ?</p>
                <Link href="/templates" className="sq-btn sq-btn-black">
                  Voir les modèles
                </Link>
              </div>
            </div>

            {/* Form */}
            <div>
              <p className="sq-label mb-8">Envoyer un message</p>

              {sent ? (
                <div className="border border-gray-100 rounded-2xl p-10 text-center">
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
                      <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">Nom</label>
                      <input
                        type="text"
                        placeholder="Jean Dupont"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
                      />
                      {fieldErrors.name?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.name[0]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">E-mail</label>
                      <input
                        type="email"
                        placeholder="vous@exemple.com"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
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
                        className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
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
                        className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
                      />
                      {fieldErrors.company?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.company[0]}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">Sujet</label>
                    <input
                      type="text"
                      placeholder="J'ai une question sur…"
                      value={form.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300"
                    />
                    {fieldErrors.subject?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.subject[0]}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2">Message</label>
                    <textarea
                      rows={5}
                      placeholder="Dites-nous en plus sur votre projet…"
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black transition-colors placeholder-gray-300 resize-none"
                    />
                    {fieldErrors.message?.[0] && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.message[0]}</p>}
                  </div>
                  {submitError && <p className="text-sm text-red-600 text-center">{submitError}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="sq-btn sq-btn-black w-full justify-center disabled:opacity-50"
                  >
                    {submitting ? 'Envoi en cours…' : 'Envoyer'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
