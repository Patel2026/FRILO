@extends('layouts.master')

@section('title') Historique paramètres @endsection

@php
    $revisionItems = $revisions->getCollection();
    $defaultToId = (int) request('to', $published?->id ?? optional($revisionItems->first())->id);
    $defaultFromCandidate = $revisionItems->first(fn ($item) => $item->id !== $defaultToId);
    $defaultFromId = (int) request('from', $defaultFromCandidate?->id ?? optional($revisionItems->first())->id);
@endphp

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Historique des paramètres</h4>
            <a href="{{ route('admin.settings.index') }}" class="btn btn-soft-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Retour paramètres
            </a>
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

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">Comparer deux révisions</h5>
    </div>
    <div class="card-body">
        @if($revisionItems->count() < 2)
            <p class="text-muted mb-0">Ajoute au moins deux révisions pour activer la comparaison.</p>
        @else
            <form method="GET" action="{{ route('admin.settings.history.compare') }}" class="row g-3 align-items-end">
                <div class="col-md-5">
                    <label class="form-label">Révision source (FROM)</label>
                    <select class="form-select" name="from" required>
                        @foreach($revisionItems as $item)
                            <option value="{{ $item->id }}" {{ $defaultFromId === $item->id ? 'selected' : '' }}>
                                #{{ $item->id }} · {{ strtoupper($item->status) }} · {{ $item->created_at?->format('d/m/Y H:i') }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-5">
                    <label class="form-label">Révision cible (TO)</label>
                    <select class="form-select" name="to" required>
                        @foreach($revisionItems as $item)
                            <option value="{{ $item->id }}" {{ $defaultToId === $item->id ? 'selected' : '' }}>
                                #{{ $item->id }} · {{ strtoupper($item->status) }} · {{ $item->created_at?->format('d/m/Y H:i') }}
                            </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-2">
                    <button class="btn btn-primary w-100" type="submit">
                        <i class="ri-git-merge-line me-1"></i> Comparer
                    </button>
                </div>
            </form>
        @endif
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">Révisions</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-nowrap align-middle">
                <thead class="table-light">
                    <tr>
                        <th>#</th>
                        <th>Statut</th>
                        <th>Créée le</th>
                        <th>Testée le</th>
                        <th>Publiée le</th>
                        <th>Note</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($revisions as $revision)
                        <tr>
                            <td><strong>#{{ $revision->id }}</strong></td>
                            <td>
                                <span class="badge badge-soft-{{ match($revision->status) {
                                    'published' => 'success',
                                    'draft' => 'warning',
                                    default => 'secondary',
                                } }}">
                                    {{ strtoupper($revision->status) }}
                                </span>
                            </td>
                            <td>{{ $revision->created_at?->format('d/m/Y H:i') }}</td>
                            <td>{{ $revision->tested_at?->format('d/m/Y H:i') ?? '—' }}</td>
                            <td>{{ $revision->published_at?->format('d/m/Y H:i') ?? '—' }}</td>
                            <td class="text-wrap" style="max-width: 360px;">{{ $revision->change_note ?: '—' }}</td>
                            <td>
                                <div class="d-flex flex-wrap gap-2 justify-content-end">
                                    @if($published && $published->id !== $revision->id)
                                        <a
                                            class="btn btn-sm btn-soft-info"
                                            href="{{ route('admin.settings.history.compare', ['from' => $revision->id, 'to' => $published->id]) }}"
                                        >
                                            Comparer à publiée
                                        </a>
                                    @endif
                                    <form method="POST" action="{{ route('admin.settings.history.restore-draft', $revision) }}">
                                        @csrf
                                        <button class="btn btn-sm btn-soft-primary" type="submit">
                                            Restaurer en brouillon
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center text-muted py-4">Aucune révision disponible.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="mt-3">{{ $revisions->links() }}</div>
    </div>
</div>
@endsection
