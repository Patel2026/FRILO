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
import { CashEntry, CashEntryPayload, CashSummary, cashService } from '@/services/cash.service';

const currentMonth = () => new Date().toISOString().slice(0, 7);

const emptyForm = (): CashEntryPayload => ({
  type: 'income',
  amount: 0,
  label: '',
  entry_date: new Date().toISOString().slice(0, 10),
});

const fieldClassName = 'w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-black outline-none transition-colors placeholder:text-neutral-500 focus:border-black focus:ring-2 focus:ring-black/10';
const labelClassName = 'mb-1 block text-xs font-semibold text-neutral-600';
const rowActionClassName = 'inline-flex h-9 items-center justify-center rounded-md border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2';
const destructiveActionClassName = 'inline-flex h-9 items-center justify-center rounded-md border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2';

function LoadingRows() {
  return (
    <div className="divide-y divide-neutral-100">
      {[0, 1, 2].map((item) => (
        <div key={item} className="px-4 py-4 md:px-5">
          <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('fr-FR');
}

function getEntryTypeLabel(type: CashEntry['type']): string {
  return type === 'income' ? 'Entrée' : 'Dépense';
}

export default function CaissePage() {
  const [month, setMonth]         = useState(currentMonth());
  const [entries, setEntries]     = useState<CashEntry[]>([]);
  const [summary, setSummary]     = useState<CashSummary | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<CashEntry | null>(null);
  const [form, setForm]           = useState<CashEntryPayload>(emptyForm());
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = (m: string) => {
    setLoading(true);
    setError(null);
    Promise.all([cashService.list(m), cashService.summary(m)])
      .then(([res, sum]) => {
        setEntries(res.data);
        setSummary(sum);
      })
      .catch(() => setError('Impossible de charger la caisse.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(month); }, [month]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (e: CashEntry) => {
    setEditing(e);
    setForm({
      type: e.type, amount: e.amount, label: e.label,
      entry_date: e.entry_date, notes: e.notes ?? '',
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (saving) return;
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await cashService.update(editing.id, form);
      } else {
        await cashService.create(form);
      }
      setShowForm(false);
      load(month);
    } catch {
      setFormError('Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce mouvement ?')) return;
    try {
      await cashService.remove(id);
      load(month);
    } catch {
      setError('Impossible de supprimer ce mouvement.');
    }
  };

  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';

  return (
    <ClientPage>
      <ClientPageHeader
        title="Ma caisse"
        description="Suivez les entrées, dépenses et le solde mensuel de votre activité depuis votre espace client FRILO."
        meta={summary ? `${entries.length} mouvement${entries.length > 1 ? 's' : ''} sur le mois` : 'Suivi financier client'}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <input type="month" value={month}
              aria-label="Mois sélectionné"
              onChange={(e) => setMonth(e.target.value)}
              className={fieldClassName} />
            <ClientButton onClick={openCreate} className="w-full sm:w-auto">
              Ajouter un mouvement
            </ClientButton>
          </div>
        }
      />

      <ClientPanel className="mb-5">
        {summary ? (
          <div className="grid divide-y divide-neutral-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="px-4 py-4 md:px-5">
              <p className="text-xs font-semibold text-neutral-500">Entrées</p>
              <p className="mt-1 text-lg font-black text-emerald-700">{fmt(summary.income)}</p>
            </div>
            <div className="px-4 py-4 md:px-5">
              <p className="text-xs font-semibold text-neutral-500">Dépenses</p>
              <p className="mt-1 text-lg font-black text-red-700">{fmt(summary.expenses)}</p>
            </div>
            <div className="px-4 py-4 md:px-5">
              <p className="text-xs font-semibold text-neutral-500">Solde</p>
              <p className={`mt-1 text-lg font-black ${summary.balance >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                {fmt(summary.balance)}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid divide-y divide-neutral-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[0, 1, 2].map((item) => (
              <div key={item} className="px-4 py-4 md:px-5">
                <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />
                <div className="mt-2 h-5 w-28 animate-pulse rounded bg-neutral-100" />
              </div>
            ))}
          </div>
        )}
      </ClientPanel>

      {showForm && (
        <ClientPanel className="mb-5">
          <ClientPanelHeader
            title={editing ? 'Modifier le mouvement' : 'Nouveau mouvement'}
            description="Renseignez le type, le montant, la date et les notes utiles pour votre suivi."
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
              <div>
                <label htmlFor="cash-type" className={labelClassName}>Type *</label>
                <select id="cash-type" required className={fieldClassName}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}>
                  <option value="income">Entrée (vente)</option>
                  <option value="expense">Dépense</option>
                </select>
              </div>
              <div>
                <label htmlFor="cash-amount" className={labelClassName}>Montant (FCFA) *</label>
                <input id="cash-amount" required type="number" min={1}
                  className={fieldClassName}
                  value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value, 10) || 0 })} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="cash-label" className={labelClassName}>Description *</label>
                <input id="cash-label" required className={fieldClassName}
                  placeholder="ex: Vente de chemises, Loyer local..."
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })} />
              </div>
              <div>
                <label htmlFor="cash-entry_date" className={labelClassName}>Date *</label>
                <input id="cash-entry_date" required type="date" className={fieldClassName}
                  value={form.entry_date}
                  onChange={(e) => setForm({ ...form, entry_date: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="cash-notes" className={labelClassName}>Notes (optionnel)</label>
                <textarea id="cash-notes" rows={2} className={fieldClassName}
                  value={form.notes ?? ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
            title="Chargement de la caisse"
            description="Nous récupérons les mouvements et le résumé du mois sélectionné."
            action={<StatusPill tone="info">Chargement</StatusPill>}
          />
          <LoadingRows />
        </ClientPanel>
      ) : error ? (
        <StatusBand
          title="Impossible de charger la caisse"
          description={error}
          tone="danger"
          status={<StatusPill tone="danger">Erreur</StatusPill>}
          action={<ClientButton onClick={() => load(month)}>Réessayer</ClientButton>}
        />
      ) : entries.length === 0 ? (
        <ClientPanel>
          <ClientPanelHeader
            title="Aucun mouvement ce mois-ci"
            description="Enregistrez une première entrée ou dépense pour suivre votre activité du mois."
            action={<ClientButton onClick={openCreate}>Enregistrer votre premier mouvement</ClientButton>}
          />
        </ClientPanel>
      ) : (
        <ClientPanel>
          <ClientPanelHeader
            title="Mouvements"
            description="Entrées et dépenses enregistrées pour le mois sélectionné."
            action={<StatusPill tone="neutral">{entries.length} mouvement{entries.length > 1 ? 's' : ''}</StatusPill>}
          />
          {entries.map((e) => (
            <CompactRow
              key={e.id}
              title={e.label}
              description={formatDate(e.entry_date)}
              meta={
                <span className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={e.type === 'income' ? 'success' : 'danger'}>{getEntryTypeLabel(e.type)}</StatusPill>
                  <span>{e.notes || 'Aucune note'}</span>
                </span>
              }
              action={
                <span className="flex flex-wrap items-center justify-end gap-2">
                  <span className={`text-sm font-black ${e.type === 'income' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {e.type === 'income' ? '+' : '−'} {fmt(e.amount)}
                  </span>
                  <button type="button" onClick={() => openEdit(e)} className={rowActionClassName}>
                    Modifier
                  </button>
                  <button type="button" onClick={() => handleDelete(e.id)} className={destructiveActionClassName}>
                    Supprimer
                  </button>
                </span>
              }
            />
          ))}
        </ClientPanel>
      )}
    </ClientPage>
  );
}
