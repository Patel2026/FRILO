@extends('layouts.master')

@section('title') Demandes de contact @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Demandes de contact</h4>
        </div>
    </div>
</div>

@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif

@if($errors->any())
    <div class="alert alert-danger" role="alert">{{ $errors->first() }}</div>
@endif
<nav class="d-flex gap-2 mb-3" aria-label="Vue des demandes">
    <a href="{{ route('admin.contact-requests.index') }}" class="btn {{ !$trashed ? 'btn-primary' : 'btn-light' }}" @if(!$trashed) aria-current="page" @endif>Demandes actives</a>
    <a href="{{ route('admin.contact-requests.index', ['trashed' => 1]) }}" class="btn {{ $trashed ? 'btn-primary' : 'btn-light' }}" @if($trashed) aria-current="page" @endif>Corbeille</a>
</nav>
<div class="card">
    <div class="card-body">
        <form method="GET" class="row g-3 align-items-end">
            @if($trashed)<input type="hidden" name="trashed" value="1">@endif
            <div class="col-auto">
                <label class="form-label">Statut</label>
                <select name="status" class="form-select">
                    <option value="">Tous</option>
                    @foreach($statuses as $status)
                        <option value="{{ $status }}" {{ request('status') === $status ? 'selected' : '' }}>
                            {{ match($status) {
                                'new' => 'Nouveau',
                                'in_progress' => 'En cours',
                                'done' => 'Traité',
                                default => $status
                            } }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-auto">
                <label class="form-label">Réf. commande</label>
                <input
                    type="text"
                    name="reference"
                    value="{{ request('reference') }}"
                    class="form-control"
                    placeholder="#ORD-00042"
                >
            </div>
            <div class="col-auto">
                <button type="submit" class="btn btn-primary">Filtrer</button>
                <a href="{{ route('admin.contact-requests.index', $trashed ? ['trashed' => 1] : []) }}" class="btn btn-soft-secondary ms-1">Réinitialiser</a>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">{{ $contactRequests->total() }} demande(s)</h5>
    </div>
    <div class="card-body">
        <form id="contact-bulk-form" method="POST" action="{{ route($trashed ? 'admin.contact-requests.bulk-restore' : 'admin.contact-requests.bulk-destroy') }}" class="d-flex flex-wrap align-items-center gap-3 mb-3">
            @csrf
            @if(!$trashed) @method('DELETE') @endif
            <span id="contact-selection-count" role="status" aria-live="polite">0 demande sélectionnée</span>
            <button id="contact-bulk-submit" type="submit" class="btn {{ $trashed ? 'btn-success' : 'btn-danger' }}" disabled>
                {{ $trashed ? 'Restaurer la sélection' : 'Supprimer la sélection' }}
            </button>
            <span class="text-muted small">{{ $trashed ? 'La restauration conserve le statut initial.' : 'Les demandes supprimées restent récupérables dans la corbeille.' }}</span>
        </form>
        <noscript><p class="alert alert-info">Activez JavaScript pour sélectionner plusieurs demandes.</p></noscript>
        <div class="table-responsive">
            <table class="table table-nowrap align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th scope="col"><input type="checkbox" id="contact-select-page" class="form-check-input" aria-label="Sélectionner toute la page" @disabled($contactRequests->isEmpty())></th>
                        <th>#</th>
                        <th>Contact</th>
                        <th>Réf. commande</th>
                        <th>Sujet</th>
                        <th>Message</th>
                        <th>Statut</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($contactRequests as $contactRequest)
                        <tr>
                            <td><input type="checkbox" class="form-check-input contact-select" name="ids[]" value="{{ $contactRequest->id }}" form="contact-bulk-form" aria-label="Sélectionner la demande {{ $contactRequest->id }}"></td>
                            <td><strong>#{{ str_pad($contactRequest->id, 4, '0', STR_PAD_LEFT) }}</strong></td>
                            <td>
                                <div class="fw-semibold">{{ $contactRequest->name }}</div>
                                <small class="text-muted d-block">{{ $contactRequest->email }}</small>
                                @if($contactRequest->phone)
                                    <small class="text-muted d-block">{{ $contactRequest->phone }}</small>
                                @endif
                                @if($contactRequest->company)
                                    <small class="text-muted d-block">{{ $contactRequest->company }}</small>
                                @endif
                            </td>
                            <td>
                                @if($contactRequest->order_reference)
                                    <span class="badge badge-soft-info">{{ $contactRequest->order_reference }}</span>
                                @else
                                    <span class="text-muted">—</span>
                                @endif
                            </td>
                            <td>{{ $contactRequest->subject }}</td>
                            <td class="text-wrap" style="max-width: 360px;">
                                {{ \Illuminate\Support\Str::limit($contactRequest->message, 180) }}
                            </td>
                            <td>
                                @if($trashed)
                                    <span>{{ match($contactRequest->status) { 'new' => 'Nouveau', 'in_progress' => 'En cours', 'done' => 'Traité', default => $contactRequest->status } }}</span>
                                @else
                                <form action="{{ route('admin.contact-requests.status', $contactRequest) }}" method="POST" class="d-flex gap-2">
                                    @csrf
                                    @method('PATCH')
                                    <select name="status" class="form-select form-select-sm">
                                        @foreach($statuses as $status)
                                            <option value="{{ $status }}" {{ $contactRequest->status === $status ? 'selected' : '' }}>
                                                {{ match($status) {
                                                    'new' => 'Nouveau',
                                                    'in_progress' => 'En cours',
                                                    'done' => 'Traité',
                                                    default => $status
                                                } }}
                                            </option>
                                        @endforeach
                                    </select>
                                    <button type="submit" class="btn btn-sm btn-soft-primary">OK</button>
                                </form>
                                @endif
                            </td>
                            <td>{{ $contactRequest->created_at->format('d/m/Y H:i') }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="text-center text-muted py-4">{{ $trashed ? 'La corbeille est vide.' : 'Aucune demande de contact.' }}</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-3">{{ $contactRequests->withQueryString()->links() }}</div>
    </div>
</div>
@endsection

@section('script')
<script>
(() => {
    const form = document.getElementById('contact-bulk-form');
    const selectPage = document.getElementById('contact-select-page');
    const rows = Array.from(document.querySelectorAll('.contact-select'));
    const submit = document.getElementById('contact-bulk-submit');
    const counter = document.getElementById('contact-selection-count');
    const restore = @json($trashed);
    const refresh = () => {
        const count = rows.filter(row => row.checked).length;
        counter.textContent = `${count} demande(s) sélectionnée(s)`;
        submit.disabled = count === 0;
        selectPage.checked = rows.length > 0 && count === rows.length;
        selectPage.indeterminate = count > 0 && count < rows.length;
    };
    selectPage.addEventListener('change', () => {
        rows.forEach(row => { row.checked = selectPage.checked; });
        refresh();
    });
    rows.forEach(row => row.addEventListener('change', refresh));
    form.addEventListener('submit', event => {
        const count = rows.filter(row => row.checked).length;
        const message = restore
            ? `Restaurer les ${count} demande(s) sélectionnée(s) ?`
            : `Déplacer les ${count} demande(s) sélectionnée(s) dans la corbeille ? Vous pourrez les restaurer.`;
        if (count === 0 || !window.confirm(message)) {
            event.preventDefault();
        } else {
            submit.disabled = true;
        }
    });
    window.addEventListener('pageshow', refresh);
    refresh();
})();
</script>
@endsection
