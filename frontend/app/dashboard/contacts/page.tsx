'use client';

import { useEffect, useState } from 'react';
import { ClientContact, ContactsPayload, contactsService } from '@/services/contacts.service';

const emptyForm = (): ContactsPayload => ({
  name: '', company: '', phone: '', whatsapp: '', email: '', notes: '', acquired_at: '',
});

export default function ContactsPage() {
  const [contacts, setContacts]   = useState<ClientContact[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [lastPage, setLastPage]   = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<ClientContact | null>(null);
  const [form, setForm]           = useState<ContactsPayload>(emptyForm());
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = (p = 1) => {
    setLoading(true);
    contactsService.list(p)
      .then((res) => {
        setContacts(res.data);
        setTotal(res.meta.total);
        setLastPage(res.meta.last_page);
        setPage(p);
      })
      .catch(() => setError('Impossible de charger les contacts.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (c: ClientContact) => {
    setEditing(c);
    setForm({
      name: c.name, company: c.company ?? '', phone: c.phone ?? '',
      whatsapp: c.whatsapp ?? '', email: c.email ?? '',
      notes: c.notes ?? '', acquired_at: c.acquired_at ?? '',
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await contactsService.update(editing.id, form);
      } else {
        await contactsService.create(form);
      }
      setShowForm(false);
      load(page);
    } catch {
      setFormError('Une erreur est survenue. Vérifiez les informations.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce contact ?')) return;
    try {
      await contactsService.remove(id);
      load(page);
    } catch {
      setError('Impossible de supprimer ce contact.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Mes Clients <span className="ml-2 text-base font-normal text-gray-400">({total})</span>
        </h1>
        <button onClick={openCreate}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            {editing ? 'Modifier le contact' : 'Nouveau contact'}
          </h2>
          {formError && <p className="mb-3 rounded bg-red-50 p-3 text-xs text-red-600">{formError}</p>}
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="contact-name" className="mb-1 block text-xs font-medium text-gray-600">Nom *</label>
              <input id="contact-name" required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="contact-company" className="mb-1 block text-xs font-medium text-gray-600">Entreprise</label>
              <input id="contact-company" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.company ?? ''} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label htmlFor="contact-phone" className="mb-1 block text-xs font-medium text-gray-600">Téléphone</label>
              <input id="contact-phone" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label htmlFor="contact-whatsapp" className="mb-1 block text-xs font-medium text-gray-600">WhatsApp</label>
              <input id="contact-whatsapp" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.whatsapp ?? ''} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1 block text-xs font-medium text-gray-600">Email</label>
              <input id="contact-email" type="email" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label htmlFor="contact-acquired_at" className="mb-1 block text-xs font-medium text-gray-600">Client depuis</label>
              <input id="contact-acquired_at" type="date" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.acquired_at ?? ''} onChange={(e) => setForm({ ...form, acquired_at: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact-notes" className="mb-1 block text-xs font-medium text-gray-600">Notes</label>
              <textarea id="contact-notes" rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" disabled={saving}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
        </div>
      ) : error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</p>
      ) : contacts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">Vous n&apos;avez pas encore enregistré de clients.</p>
          <button onClick={openCreate} className="mt-3 text-sm text-[var(--color-primary)] underline">
            Ajouter votre premier client →
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400">
                  {[c.company, c.phone].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => openEdit(c)} className="text-xs text-gray-500 underline hover:text-gray-700">
                  Modifier
                </button>
                <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 underline hover:text-red-700">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => load(p)}
              className={`h-8 w-8 rounded text-sm ${page === p
                ? 'bg-[var(--color-primary)] text-white'
                : 'border border-gray-200 text-gray-600'
              }`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
