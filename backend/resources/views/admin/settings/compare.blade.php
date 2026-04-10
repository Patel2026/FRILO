@extends('layouts.master')

@section('title') Comparaison paramètres @endsection

@php
    $summary = $comparison['summary'] ?? [];
    $payloadChanges = $comparison['payload_changes'] ?? [];
    $secretChanges = $comparison['secret_changes'] ?? [];
    $changedSections = $summary['changed_sections'] ?? [];

    $diffClass = static fn (string $type): string => match ($type) {
        'added', 'configured' => 'success',
        'removed' => 'danger',
        'rotated' => 'info',
        default => 'warning',
    };
@endphp

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Comparaison révisions paramètres</h4>
            <a href="{{ route('admin.settings.history') }}" class="btn btn-soft-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Retour historique
            </a>
        </div>
    </div>
</div>

<div class="row g-3 mb-3">
    <div class="col-lg-6">
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title mb-0">FROM · Révision #{{ $fromRevision->id }}</h5>
            </div>
            <div class="card-body">
                <div class="mb-2">
                    <span class="badge badge-soft-secondary">{{ strtoupper($fromRevision->status) }}</span>
                </div>
                <div class="text-muted mb-1">Créée le {{ $fromRevision->created_at?->format('d/m/Y H:i') ?? '—' }}</div>
                <div class="text-muted mb-1">Créée par {{ $fromRevision->creator?->name ?? '—' }}</div>
                <div class="text-muted mb-1">Publiée le {{ $fromRevision->published_at?->format('d/m/Y H:i') ?? '—' }}</div>
                <div class="text-muted">Note: {{ $fromRevision->change_note ?: '—' }}</div>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title mb-0">TO · Révision #{{ $toRevision->id }}</h5>
            </div>
            <div class="card-body">
                <div class="mb-2">
                    <span class="badge badge-soft-secondary">{{ strtoupper($toRevision->status) }}</span>
                </div>
                <div class="text-muted mb-1">Créée le {{ $toRevision->created_at?->format('d/m/Y H:i') ?? '—' }}</div>
                <div class="text-muted mb-1">Créée par {{ $toRevision->creator?->name ?? '—' }}</div>
                <div class="text-muted mb-1">Publiée le {{ $toRevision->published_at?->format('d/m/Y H:i') ?? '—' }}</div>
                <div class="text-muted">Note: {{ $toRevision->change_note ?: '—' }}</div>
            </div>
        </div>
    </div>
</div>

<div class="row g-3 mb-3">
    <div class="col-md-4">
        <div class="card h-100">
            <div class="card-body">
                <div class="text-muted text-uppercase fs-12 fw-semibold">Changements payload</div>
                <h3 class="mb-0">{{ (int) ($summary['payload_change_count'] ?? 0) }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card h-100">
            <div class="card-body">
                <div class="text-muted text-uppercase fs-12 fw-semibold">Changements secrets</div>
                <h3 class="mb-0">{{ (int) ($summary['secret_change_count'] ?? 0) }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card h-100">
            <div class="card-body">
                <div class="text-muted text-uppercase fs-12 fw-semibold">Sections impactées</div>
                @if($changedSections === [])
                    <h6 class="mb-0">Aucune</h6>
                @else
                    <div class="d-flex flex-wrap gap-1">
                        @foreach($changedSections as $section)
                            <span class="badge badge-soft-primary">{{ $section }}</span>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>

<div class="card mb-3">
    <div class="card-header">
        <h5 class="card-title mb-0">Diff payload (non sensible)</h5>
    </div>
    <div class="card-body">
        @if($payloadChanges === [])
            <p class="text-muted mb-0">Aucun changement sur le payload.</p>
        @else
            <div class="table-responsive">
                <table class="table table-nowrap align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>Section</th>
                            <th>Chemin</th>
                            <th>Type</th>
                            <th>FROM</th>
                            <th>TO</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($payloadChanges as $row)
                            <tr>
                                <td><span class="badge badge-soft-secondary">{{ $row['section'] }}</span></td>
                                <td><code>{{ $row['path'] }}</code></td>
                                <td><span class="badge badge-soft-{{ $diffClass($row['change_type']) }}">{{ strtoupper($row['change_type']) }}</span></td>
                                <td class="text-wrap" style="max-width: 300px;">{{ $row['from'] }}</td>
                                <td class="text-wrap" style="max-width: 300px;">{{ $row['to'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">Diff secrets (état uniquement)</h5>
    </div>
    <div class="card-body">
        @if($secretChanges === [])
            <p class="text-muted mb-0">Aucun changement de secrets détecté.</p>
        @else
            <div class="table-responsive">
                <table class="table table-nowrap align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>Section</th>
                            <th>Chemin</th>
                            <th>Type</th>
                            <th>FROM</th>
                            <th>TO</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($secretChanges as $row)
                            <tr>
                                <td><span class="badge badge-soft-secondary">{{ $row['section'] }}</span></td>
                                <td><code>{{ $row['path'] }}</code></td>
                                <td><span class="badge badge-soft-{{ $diffClass($row['change_type']) }}">{{ strtoupper($row['change_type']) }}</span></td>
                                <td>{{ $row['from'] === 'configured' ? 'Configuré' : 'Non configuré' }}</td>
                                <td>{{ $row['to'] === 'configured' ? 'Configuré' : 'Non configuré' }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>
</div>
@endsection
