'use client';

import { useEffect, useState } from 'react';
import { CashEntry, CashEntryPayload, CashSummary, cashService } from '@/services/cash.service';

const currentMonth = () => new Date().toISOString().slice(0, 7);

const emptyForm = (): CashEntryPayload => ({
  type: 'income',
  amount: 0,
  label: '',
  entry_date: new Date().toISOString().slice(0, 10),
});

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

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Ma Caisse</h1>
        <div className="flex items-center gap-3">
          <input type="month" value={month}
            aria-label="Mois sélectionné"
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm" />
          <button onClick={openCreate}
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            + Ajouter
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium text-gray-400">Entrées</p>
            <p className="mt-1 text-lg font-bold text-green-600">{fmt(summary.income)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium text-gray-400">Dépenses</p>
            <p className="mt-1 text-lg font-bold text-red-500">{fmt(summary.expenses)}</p>
          </div>
          <div className={`rounded-xl border p-4 text-center shadow-sm ${
            summary.balance >= 0 ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'
          }`}>
            <p className="text-xs font-medium text-gray-400">Solde</p>
            <p className={`mt-1 text-lg font-bold ${
              summary.balance >= 0 ? 'text-green-700' : 'text-red-600'
            }`}>
              {fmt(summary.balance)}
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            {editing ? 'Modifier le mouvement' : 'Nouveau mouvement'}
          </h2>
          {formError && <p className="mb-3 rounded bg-red-50 p-3 text-xs text-red-600">{formError}</p>}
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="cash-type" className="mb-1 block text-xs font-medium text-gray-600">Type *</label>
              <select id="cash-type" required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}>
                <option value="income">Entrée (vente)</option>
                <option value="expense">Dépense</option>
              </select>
            </div>
            <div>
              <label htmlFor="cash-amount" className="mb-1 block text-xs font-medium text-gray-600">Montant (FCFA) *</label>
              <input id="cash-amount" required type="number" min={1}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value, 10) || 0 })} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="cash-label" className="mb-1 block text-xs font-medium text-gray-600">Description *</label>
              <input id="cash-label" required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="ex: Vente de chemises, Loyer local..."
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div>
              <label htmlFor="cash-entry_date" className="mb-1 block text-xs font-medium text-gray-600">Date *</label>
              <input id="cash-entry_date" required type="date" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.entry_date}
                onChange={(e) => setForm({ ...form, entry_date: e.target.value })} />
            </div>
            <div className="flex items-end gap-2">
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
      ) : entries.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">Aucun mouvement ce mois-ci.</p>
          <button onClick={openCreate} className="mt-3 text-sm text-[var(--color-primary)] underline">
            Enregistrer votre premier mouvement →
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
          {entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span className={`inline-block h-2 w-2 rounded-full ${
                  e.type === 'income' ? 'bg-green-500' : 'bg-red-400'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{e.label}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(e.entry_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold ${
                  e.type === 'income' ? 'text-green-600' : 'text-red-500'
                }`}>
                  {e.type === 'income' ? '+' : '−'} {e.amount.toLocaleString('fr-FR')} FCFA
                </span>
                <button onClick={() => openEdit(e)}
                  className="text-xs text-gray-400 underline hover:text-gray-600">
                  Modifier
                </button>
                <button onClick={() => handleDelete(e.id)}
                  className="text-xs text-red-400 underline hover:text-red-600">
                  Suppr.
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
