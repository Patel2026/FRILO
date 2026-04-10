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

<div class="card">
    <div class="card-body">
        <form method="GET" class="row g-3 align-items-end">
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
                <a href="{{ route('admin.contact-requests.index') }}" class="btn btn-soft-secondary ms-1">Réinitialiser</a>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">{{ $contactRequests->total() }} demande(s)</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-nowrap align-middle mb-0">
                <thead class="table-light">
                    <tr>
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
                            </td>
                            <td>{{ $contactRequest->created_at->format('d/m/Y H:i') }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center text-muted py-4">Aucune demande de contact.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-3">{{ $contactRequests->withQueryString()->links() }}</div>
    </div>
</div>
@endsection
