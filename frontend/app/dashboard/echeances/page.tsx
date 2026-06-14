'use client';

import { useEffect, useState } from 'react';
import { Deadline, DeadlinePayload, deadlinesService } from '@/services/deadlines.service';

const emptyForm = (): DeadlinePayload => ({ title: '', description: '', due_date: '' });

function urgencyBorderClass(days: number): string {
  if (days < 0)   return 'border-gray-200 bg-gray-50';
  if (days <= 7)  return 'border-red-200 bg-red-50';
  if (days <= 30) return 'border-orange-200 bg-orange-50';
  return 'border-gray-200 bg-white';
}

function urgencyBadge(days: number): { label: string; className: string } {
  if (days < 0)   return { label: 'Passée',        className: 'bg-gray-100 text-gray-500' };
  if (days === 0) return { label: "Aujourd'hui",   className: 'bg-red-100 text-red-700' };
  if (days <= 7)  return { label: `Dans ${days}j`, className: 'bg-red-100 text-red-700' };
  if (days <= 30) return { label: `Dans ${days}j`, className: 'bg-orange-100 text-orange-700' };
  return             { label: `Dans ${days}j`, className: 'bg-gray-100 text-gray-600' };
}

export default function EcheancesPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Deadline | null>(null);
  const [form, setForm]           = useState<DeadlinePayload>(emptyForm());
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    deadlinesService.list()
      .then(setDeadlines)
      .catch(() => setError('Impossible de charger les échéances.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (d: Deadline) => {
    if (d.is_system) return;
    setEditing(d);
    setForm({ title: d.title, description: d.description ?? '', due_date: d.due_date });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await deadlinesService.update(editing.id, form);
      } else {
        await deadlinesService.create(form);
      }
      setShowForm(false);
      load();
    } catch {
      setFormError('Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette échéance ?")) return;
    try {
      await deadlinesService.remove(id);
      load();
    } catch {
      setError("Impossible de supprimer cette échéance.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Mes Échéances</h1>
        <button onClick={openCreate}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            {editing ? "Modifier l'échéance" : 'Nouvelle échéance personnelle'}
          </h2>
          {formError && <p className="mb-3 rounded bg-red-50 p-3 text-xs text-red-600">{formError}</p>}
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="deadline-title" className="mb-1 block text-xs font-medium text-gray-600">Titre *</label>
              <input id="deadline-title" required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="ex: Déclaration TVA, Renouvellement patente..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label htmlFor="deadline-due_date" className="mb-1 block text-xs font-medium text-gray-600">Date limite *</label>
              <input id="deadline-due_date" required type="date" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
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
            <div className="sm:col-span-2">
              <label htmlFor="deadline-description" className="mb-1 block text-xs font-medium text-gray-600">Notes (optionnel)</label>
              <textarea id="deadline-description" rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
      ) : deadlines.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">Aucune échéance pour le moment.</p>
          <button onClick={openCreate} className="mt-3 text-sm text-[var(--color-primary)] underline">
            Ajouter votre première échéance →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {deadlines.map((d) => {
            const badge = urgencyBadge(d.days_remaining);
            return (
              <div key={d.id}
                className={`rounded-xl border p-4 shadow-sm ${urgencyBorderClass(d.days_remaining)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{d.title}</p>
                      {d.is_system && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                          FRILO
                        </span>
                      )}
                    </div>
                    {d.description && (
                      <p className="mt-0.5 text-xs text-gray-500">{d.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(d.due_date).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                    {!d.is_system && (
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(d)}
                          className="text-xs text-gray-400 underline hover:text-gray-600">
                          Modifier
                        </button>
                        <button onClick={() => handleDelete(d.id)}
                          className="text-xs text-red-400 underline hover:text-red-600">
                          Suppr.
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
