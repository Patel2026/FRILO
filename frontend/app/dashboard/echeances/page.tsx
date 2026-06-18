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
import { type Deadline, type DeadlinePayload, deadlinesService } from '@/services/deadlines.service';

const emptyForm = (): DeadlinePayload => ({ title: '', description: '', due_date: '' });

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

function urgencyBadge(days: number): { label: string; tone: 'neutral' | 'warning' | 'danger' } {
  if (days < 0) return { label: 'Passée', tone: 'neutral' };
  if (days === 0) return { label: "Aujourd'hui", tone: 'danger' };
  if (days <= 7) return { label: `Dans ${days}j`, tone: 'danger' };
  if (days <= 30) return { label: `Dans ${days}j`, tone: 'warning' };
  return { label: `Dans ${days}j`, tone: 'neutral' };
}

function formatDueDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date limite non valide';
  }

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getDeadlineDescription(deadline: Deadline): string {
  if (deadline.description) return deadline.description;

  return deadline.is_system
    ? 'Rappel FRILO généré automatiquement pour votre suivi.'
    : 'Rappel personnel sans notes complémentaires.';
}

function getDeadlineMeta(deadline: Deadline) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span>{formatDueDate(deadline.due_date)}</span>
      {deadline.is_system ? (
        <StatusPill tone="info">Rappel FRILO</StatusPill>
      ) : (
        <StatusPill tone="neutral">Rappel personnel</StatusPill>
      )}
    </span>
  );
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
    setError(null);
    deadlinesService.list()
      .then((items) => {
        setDeadlines(items);
        setError(null);
      })
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
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
    <ClientPage>
      <ClientPageHeader
        title="Mes échéances"
        description="Suivez vos rappels FRILO et vos échéances personnelles: renouvellement, paiement, obligations et relances."
        action={<ClientButton onClick={openCreate}>Ajouter une échéance</ClientButton>}
      />

      {showForm && (
        <ClientPanel className="mb-5">
          <ClientPanelHeader
            title={editing ? "Modifier l'échéance personnelle" : 'Nouvelle échéance personnelle'}
            description="Les rappels personnels complètent les échéances système FRILO visibles dans votre tableau de bord."
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
                <label htmlFor="deadline-title" className={labelClassName}>Titre *</label>
                <input
                  id="deadline-title"
                  required
                  className={fieldClassName}
                  placeholder="ex: Déclaration TVA, renouvellement patente..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="deadline-due_date" className={labelClassName}>Date limite *</label>
                <input
                  id="deadline-due_date"
                  required
                  type="date"
                  className={fieldClassName}
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="deadline-description" className={labelClassName}>Notes (optionnel)</label>
                <textarea
                  id="deadline-description"
                  rows={3}
                  className={fieldClassName}
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
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
            title="Chargement des échéances"
            description="Nous récupérons vos rappels FRILO et vos échéances personnelles."
            action={<StatusPill tone="info">Chargement</StatusPill>}
          />
          <LoadingRows />
        </ClientPanel>
      ) : error ? (
        <StatusBand
          title="Impossible de charger vos échéances"
          description={error}
          tone="danger"
          status={<StatusPill tone="danger">Erreur</StatusPill>}
          action={<ClientButton onClick={load}>Réessayer</ClientButton>}
        />
      ) : deadlines.length === 0 ? (
        <ClientPanel>
          <ClientPanelHeader
            title="Aucune échéance"
            description="Vous n’avez pas encore de rappel FRILO ou d’échéance personnelle à suivre."
            action={<ClientButton onClick={openCreate}>Ajouter une échéance</ClientButton>}
          />
        </ClientPanel>
      ) : (
        <ClientPanel>
          <ClientPanelHeader
            title="Rappels et échéances"
            description="Les rappels FRILO sont protégés. Vos rappels personnels restent modifiables."
            action={<StatusPill tone="neutral">{deadlines.length} échéance{deadlines.length > 1 ? 's' : ''}</StatusPill>}
          />
          {deadlines.map((d) => {
            const badge = urgencyBadge(d.days_remaining);

            return (
              <CompactRow
                key={d.id}
                title={d.title}
                description={getDeadlineDescription(d)}
                meta={getDeadlineMeta(d)}
                action={
                  <span className="flex flex-wrap items-center justify-end gap-2">
                    <StatusPill tone={badge.tone}>{badge.label}</StatusPill>
                    {!d.is_system && (
                      <>
                        <button type="button" onClick={() => openEdit(d)} className={rowActionClassName}>
                          Modifier
                        </button>
                        <button type="button" onClick={() => handleDelete(d.id)} className={destructiveActionClassName}>
                          Supprimer
                        </button>
                      </>
                    )}
                  </span>
                }
              />
            );
          })}
        </ClientPanel>
      )}
    </ClientPage>
  );
}
