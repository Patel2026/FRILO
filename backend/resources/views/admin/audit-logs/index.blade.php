@extends('layouts.master')

@section('title') Journal d'audit @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Journal d'audit</h4>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-body">
        <form method="GET" class="row g-3 align-items-end">
            <div class="col-auto">
                <label class="form-label">Événement</label>
                <select name="event" class="form-select">
                    <option value="">Tous</option>
                    @foreach($events as $event)
                        <option value="{{ $event }}" {{ request('event') === $event ? 'selected' : '' }}>
                            {{ $event }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-auto">
                <label class="form-label">Acteur</label>
                <input type="text" name="actor" class="form-control" value="{{ request('actor') }}" placeholder="Nom ou email">
            </div>
            <div class="col-auto">
                <label class="form-label">Du</label>
                <input type="date" name="from" class="form-control" value="{{ request('from') }}">
            </div>
            <div class="col-auto">
                <label class="form-label">Au</label>
                <input type="date" name="to" class="form-control" value="{{ request('to') }}">
            </div>
            <div class="col-auto">
                <button type="submit" class="btn btn-primary">Filtrer</button>
                <a href="{{ route('admin.audit-logs.index') }}" class="btn btn-soft-secondary ms-1">Réinitialiser</a>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">{{ $auditLogs->total() }} événement(s)</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table align-middle table-nowrap mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Date</th>
                        <th>Événement</th>
                        <th>Acteur</th>
                        <th>Cible</th>
                        <th>Message</th>
                        <th>Détails</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($auditLogs as $log)
                        <tr>
                            <td>{{ $log->created_at?->format('d/m/Y H:i:s') }}</td>
                            <td><span class="badge badge-soft-secondary">{{ $log->event }}</span></td>
                            <td>
                                @if($log->actor)
                                    <div>{{ $log->actor->name }}</div>
                                    <small class="text-muted">{{ $log->actor->email }}</small>
                                @else
                                    <span class="text-muted">Système</span>
                                @endif
                            </td>
                            <td>
                                @if($log->target_type || $log->target_id)
                                    <code>{{ $log->target_type ?? '—' }}:{{ $log->target_id ?? '—' }}</code>
                                @else
                                    <span class="text-muted">—</span>
                                @endif
                            </td>
                            <td>{{ $log->message ?? '—' }}</td>
                            <td style="max-width: 380px;">
                                @if($log->payload)
                                    <details>
                                        <summary>Voir JSON</summary>
                                        <pre class="mt-2 mb-0" style="white-space: pre-wrap;">{{ json_encode($log->payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) }}</pre>
                                    </details>
                                @else
                                    <span class="text-muted">—</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="text-center text-muted py-4">Aucun événement d'audit.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-3">{{ $auditLogs->links() }}</div>
    </div>
</div>
@endsection
