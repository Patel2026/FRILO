@extends('layouts.master')

@section('title') Sauvegardes données @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Sauvegarde et restauration des données</h4>
        </div>
    </div>
</div>

@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif

@if($errors->any())
    <div class="alert alert-danger">
        <ul class="mb-0 ps-3">
            @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<div class="row g-3">
    <div class="col-lg-4">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Créer une sauvegarde</h5>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.backups.store') }}" class="row g-3">
                    @csrf
                    <div class="col-12">
                        <label class="form-label">Note (optionnelle)</label>
                        <textarea class="form-control" name="note" rows="3" placeholder="Ex: avant mise à jour production...">{{ old('note') }}</textarea>
                    </div>
                    <div class="col-12">
                        <button type="submit" class="btn btn-primary w-100">
                            <i class="ri-save-3-line me-1"></i> Lancer la sauvegarde
                        </button>
                    </div>
                </form>
                <p class="text-muted small mt-3 mb-0">
                    La restauration écrase les données métiers courantes.
                </p>
            </div>
        </div>
    </div>

    <div class="col-lg-8">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Historique des sauvegardes</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-nowrap align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>#</th>
                                <th>Fichier</th>
                                <th>Statut</th>
                                <th>Taille</th>
                                <th>Tables/Lignes</th>
                                <th>Créée le</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($backups as $backup)
                                <tr>
                                    <td>#{{ $backup->id }}</td>
                                    <td>
                                        <strong>{{ $backup->filename }}</strong>
                                        <small class="d-block text-muted">{{ $backup->database_driver }}</small>
                                    </td>
                                    <td>
                                        <span class="badge badge-soft-{{ match($backup->status) {
                                            'ready' => 'success',
                                            'restored' => 'info',
                                            'failed' => 'danger',
                                            default => 'secondary',
                                        } }}">
                                            {{ strtoupper($backup->status) }}
                                        </span>
                                    </td>
                                    <td>{{ number_format((int) $backup->file_size_bytes / 1024, 1, ',', ' ') }} KB</td>
                                    <td>{{ $backup->tables_count }} / {{ number_format($backup->rows_count, 0, ',', ' ') }}</td>
                                    <td>
                                        {{ $backup->created_at?->format('d/m/Y H:i') }}
                                        <small class="d-block text-muted">par {{ $backup->creator?->name ?? '—' }}</small>
                                    </td>
                                    <td>
                                        <div class="d-flex flex-wrap gap-2 justify-content-end">
                                            <a href="{{ route('admin.backups.download', $backup) }}" class="btn btn-sm btn-soft-primary">
                                                Télécharger
                                            </a>
                                            <form method="POST" action="{{ route('admin.backups.restore', $backup) }}"
                                                onsubmit="return confirm('Confirmer la restauration de cette sauvegarde ? Cette action remplace les données métiers actuelles.');">
                                                @csrf
                                                <input type="hidden" name="confirm_restore" value="1">
                                                <button type="submit" class="btn btn-sm btn-soft-danger">
                                                    Restaurer
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                @if($backup->note)
                                    <tr>
                                        <td></td>
                                        <td colspan="6" class="text-muted small">
                                            Note: {{ $backup->note }}
                                        </td>
                                    </tr>
                                @endif
                            @empty
                                <tr>
                                    <td colspan="7" class="text-center text-muted py-4">Aucune sauvegarde disponible.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <div class="mt-3">{{ $backups->links() }}</div>
            </div>
        </div>
    </div>
</div>
@endsection
