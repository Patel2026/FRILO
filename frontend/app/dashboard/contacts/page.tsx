'use client';

import { type FormEvent, useEffect, useState } from 'react';
import {
  ClientButton,
  ClientPage,
  ClientPageHeader,
  ClientPanel,
  ClientPanelHeader,
  CompactRow,
  StatusBand,
  StatusPill,
} from '@/components/dashboard/client-ui';
import { type ClientContact, type ContactsPayload, contactsService } from '@/services/contacts.service';

const emptyForm = (): ContactsPayload => ({
  name: '', company: '', phone: '', whatsapp: '', email: '', notes: '', acquired_at: '',
});

const fieldClassName = 'w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-black outline-none transition-colors placeholder:text-neutral-500 focus:border-black focus:ring-2 focus:ring-black/10';
const labelClassName = 'mb-1 block text-xs font-semibold text-neutral-600';
const rowActionClassName = 'inline-flex h-9 items-center justify-center rounded-md border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2';
const destructiveActionClassName = 'inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2';

function LoadingRows() {
  return (
    <div className="divide-y divide-neutral-100">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="px-4 py-4 md:px-5">
          <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

function getContactDescription(contact: ClientContact): string {
  return [contact.company, contact.phone, contact.email].filter(Boolean).join(' · ') || 'Aucune coordonnée renseignée';
}

function getContactMeta(contact: ClientContact): string | undefined {
  return [contact.whatsapp ? `WhatsApp : ${contact.whatsapp}` : null, contact.acquired_at ? `Client depuis : ${contact.acquired_at}` : null]
    .filter(Boolean)
    .join(' · ') || undefined;
}

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
    setError(null);
    contactsService.list(p)
      .then((res) => {
        setContacts(res.data);
        setTotal(res.meta.total);
        setLastPage(res.meta.last_page);
        setPage(p);
        setError(null);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
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
      load(contacts.length === 1 && page > 1 ? page - 1 : page);
    } catch {
      setError('Impossible de supprimer ce contact.');
    }
  };

  return (
    <ClientPage>
      <ClientPageHeader
        title="Mes clients"
        description="Votre fichier clients FRILO centralise les contacts utiles pour suivre vos prospects, clients et échanges commerciaux."
        meta={`${total} client${total > 1 ? 's' : ''} enregistré${total > 1 ? 's' : ''}`}
        action={<ClientButton onClick={openCreate}>Ajouter un client</ClientButton>}
      />

      {showForm && (
        <ClientPanel className="mb-5">
          <ClientPanelHeader
            title={editing ? 'Modifier le contact' : 'Nouveau contact'}
            description="Renseignez les informations utiles pour retrouver ce client dans votre fichier."
            action={<StatusPill tone={editing ? 'info' : 'neutral'}>{editing ? 'Modification' : 'Création'}</StatusPill>}
          />
          <div className="px-4 py-4 md:px-5">
            {formError && (
              <StatusBand
                title="Impossible d’enregistrer"
                description={formError}
                tone="danger"
                status={<StatusPill tone="danger">Erreur</StatusPill>}
                className="mb-4"
              />
            )}
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="contact-name" className={labelClassName}>Nom *</label>
                <input id="contact-name" required className={fieldClassName}
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="contact-company" className={labelClassName}>Entreprise</label>
                <input id="contact-company" className={fieldClassName}
                  value={form.company ?? ''} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div>
                <label htmlFor="contact-phone" className={labelClassName}>Téléphone</label>
                <input id="contact-phone" className={fieldClassName}
                  value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label htmlFor="contact-whatsapp" className={labelClassName}>WhatsApp</label>
                <input id="contact-whatsapp" className={fieldClassName}
                  value={form.whatsapp ?? ''} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
              </div>
              <div>
                <label htmlFor="contact-email" className={labelClassName}>Email</label>
                <input id="contact-email" type="email" className={fieldClassName}
                  value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label htmlFor="contact-acquired_at" className={labelClassName}>Client depuis</label>
                <input id="contact-acquired_at" type="date" className={fieldClassName}
                  value={form.acquired_at ?? ''} onChange={(e) => setForm({ ...form, acquired_at: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="contact-notes" className={labelClassName}>Notes</label>
                <textarea id="contact-notes" rows={3} className={fieldClassName}
                  value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex flex-col-reverse gap-2 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">
                <ClientButton type="button" variant="secondary" onClick={() => setShowForm(false)} className="w-full sm:w-auto">
                  Annuler
                </ClientButton>
                <ClientButton type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </ClientButton>
              </div>
            </form>
          </div>
        </ClientPanel>
      )}

      {loading ? (
        <ClientPanel>
          <ClientPanelHeader
            title="Chargement des clients"
            description="Nous récupérons votre fichier clients."
            action={<StatusPill tone="info">Chargement</StatusPill>}
          />
          <LoadingRows />
        </ClientPanel>
      ) : error ? (
        <StatusBand
          title="Impossible de charger vos clients"
          description={error}
          tone="danger"
          status={<StatusPill tone="danger">Erreur</StatusPill>}
          action={<ClientButton onClick={() => load(page)}>Réessayer</ClientButton>}
        />
      ) : contacts.length === 0 ? (
        <ClientPanel>
          <ClientPanelHeader
            title="Aucun client enregistré"
            description="Ajoutez votre premier contact pour commencer à structurer votre fichier clients."
            action={<ClientButton onClick={openCreate}>Ajouter un client</ClientButton>}
          />
        </ClientPanel>
      ) : (
        <ClientPanel>
          <ClientPanelHeader
            title="Fichier clients"
            description="Contacts enregistrés dans votre espace client FRILO."
            action={<StatusPill tone="neutral">{total} client{total > 1 ? 's' : ''}</StatusPill>}
          />
          {contacts.map((c) => (
            <CompactRow
              key={c.id}
              title={c.name}
              description={getContactDescription(c)}
              meta={getContactMeta(c)}
              action={
                <span className="flex flex-wrap items-center justify-end gap-2">
                  <button type="button" onClick={() => openEdit(c)} className={rowActionClassName}>
                    Modifier
                  </button>
                  <button type="button" onClick={() => handleDelete(c.id)} className={destructiveActionClassName}>
                    Supprimer
                  </button>
                </span>
              }
            />
          ))}
        </ClientPanel>
      )}

      {lastPage > 1 && (
        <nav className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Pagination des clients">
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
            <button key={p} type="button" onClick={() => load(p)}
              aria-current={page === p ? 'page' : undefined}
              aria-label={page === p ? `Page ${p}, page actuelle` : `Aller à la page ${p}`}
              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${page === p
                ? 'bg-black text-white'
                : 'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 hover:text-black'
              }`}>
              {p}
            </button>
          ))}
        </nav>
      )}
    </ClientPage>
  );
}
