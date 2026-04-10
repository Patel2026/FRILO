@extends('layouts.master')

@section('title') Avis clients @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Avis clients</h4>
            <div class="text-muted small">
                Les avis publies sur le site doivent etre approuves. Les avis "mis en avant" alimentent prioritairement la homepage.
            </div>
        </div>
    </div>
</div>

@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif

<div class="card">
    <div class="card-body">
        <form method="GET" class="row g-3 align-items-end">
            <div class="col-md-3">
                <label class="form-label">Statut</label>
                <select name="status" class="form-select">
                    <option value="">Tous</option>
                    @foreach($statuses as $status)
                        <option value="{{ $status }}" {{ $filters['status'] === $status ? 'selected' : '' }}>
                            {{ match($status) {
                                'pending' => 'En attente',
                                'approved' => 'Approuve',
                                'rejected' => 'Rejete',
                                default => $status
                            } }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label">Homepage</label>
                <select name="featured" class="form-select">
                    <option value="" {{ $filters['featured'] === '' ? 'selected' : '' }}>Tous</option>
                    <option value="yes" {{ $filters['featured'] === 'yes' ? 'selected' : '' }}>Mis en avant</option>
                    <option value="no" {{ $filters['featured'] === 'no' ? 'selected' : '' }}>Non mis en avant</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">Recherche</label>
                <input type="text" name="search" value="{{ $filters['search'] }}" class="form-control" placeholder="Client, template ou contenu">
            </div>
            <div class="col-md-3">
                <button type="submit" class="btn btn-primary">Filtrer</button>
                <a href="{{ route('admin.reviews.index') }}" class="btn btn-soft-secondary ms-1">Reinitialiser</a>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">{{ $reviews->total() }} avis</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-nowrap align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Client</th>
                        <th>Template</th>
                        <th>Note</th>
                        <th>Contenu</th>
                        <th>Moderation</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($reviews as $review)
                        <tr>
                            <td>
                                <div class="fw-semibold">{{ $review->user?->name ?? 'Client FRILO' }}</div>
                                <small class="text-muted d-block">{{ $review->user?->email ?? '—' }}</small>
                                <small class="text-muted d-block">{{ $review->user?->sector?->name ?? 'Secteur non renseigne' }}</small>
                            </td>
                            <td>
                                <div class="fw-semibold">{{ $review->template?->name ?? 'Template supprime' }}</div>
                                <small class="text-muted d-block">{{ $review->template?->sector?->name ?? '—' }}</small>
                                @if($review->order_id)
                                    <small class="text-muted d-block">Commande #{{ str_pad((string) $review->order_id, 4, '0', STR_PAD_LEFT) }}</small>
                                @endif
                            </td>
                            <td>
                                <span class="badge badge-soft-dark">{{ $review->rating }}/5</span>
                            </td>
                            <td class="text-wrap" style="max-width: 380px;">
                                {{ \Illuminate\Support\Str::limit($review->content, 200) }}
                            </td>
                            <td style="min-width: 320px;">
                                <form method="POST" action="{{ route('admin.reviews.update', $review) }}" class="row g-2">
                                    @csrf
                                    @method('PATCH')
                                    <div class="col-12">
                                        <select name="status" class="form-select form-select-sm">
                                            @foreach($statuses as $status)
                                                <option value="{{ $status }}" {{ $review->status === $status ? 'selected' : '' }}>
                                                    {{ match($status) {
                                                        'pending' => 'En attente',
                                                        'approved' => 'Approuve',
                                                        'rejected' => 'Rejete',
                                                        default => $status
                                                    } }}
                                                </option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <div class="col-7">
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            name="featured_rank"
                                            class="form-control form-control-sm"
                                            value="{{ $review->featured_rank }}"
                                            placeholder="Rang homepage"
                                        >
                                    </div>
                                    <div class="col-5 d-flex align-items-center">
                                        <div class="form-check">
                                            <input
                                                class="form-check-input"
                                                type="checkbox"
                                                name="is_featured"
                                                id="featured-{{ $review->id }}"
                                                value="1"
                                                {{ $review->is_featured ? 'checked' : '' }}
                                            >
                                            <label class="form-check-label" for="featured-{{ $review->id }}">
                                                Homepage
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <button type="submit" class="btn btn-sm btn-soft-primary">Enregistrer</button>
                                        @if($review->approved_at)
                                            <small class="text-muted ms-2">Valide le {{ $review->approved_at->format('d/m/Y H:i') }}</small>
                                        @endif
                                    </div>
                                </form>
                            </td>
                            <td>
                                {{ $review->created_at?->format('d/m/Y H:i') }}
                                @if($review->approver)
                                    <small class="text-muted d-block">par {{ $review->approver->name }}</small>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="text-center text-muted py-4">Aucun avis client pour le moment.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-3">{{ $reviews->links() }}</div>
    </div>
</div>
@endsection
