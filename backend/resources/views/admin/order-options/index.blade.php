@extends('layouts.master')

@section('title') Options de commande @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <div>
                <h4 class="mb-sm-0">Options de commande</h4>
                <div class="text-muted small">Ces options sont proposées dans le tunnel de commande public et s'ajoutent au prix final du client.</div>
            </div>
            <a href="{{ route('admin.order-options.create') }}" class="btn btn-primary btn-sm">
                <i class="ri-add-line me-1"></i> Nouvelle option
            </a>
        </div>
    </div>
</div>

@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show">
        {{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

<div class="card">
    <div class="card-body">
        <form method="GET" class="row g-3 align-items-end">
            <div class="col-md-5">
                <label class="form-label">Recherche</label>
                <input type="text" name="search" value="{{ $filters['search'] }}" class="form-control" placeholder="Nom, description ou persona">
            </div>
            <div class="col-md-3">
                <label class="form-label">Statut</label>
                <select name="visibility" class="form-select">
                    <option value="" {{ $filters['visibility'] === '' ? 'selected' : '' }}>Toutes</option>
                    <option value="active" {{ $filters['visibility'] === 'active' ? 'selected' : '' }}>Actives</option>
                    <option value="inactive" {{ $filters['visibility'] === 'inactive' ? 'selected' : '' }}>Inactives</option>
                </select>
            </div>
            <div class="col-md-4">
                <button type="submit" class="btn btn-primary">Filtrer</button>
                <a href="{{ route('admin.order-options.index') }}" class="btn btn-soft-secondary ms-1">Réinitialiser</a>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">{{ $orderOptions->total() }} option(s)</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-nowrap align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Ordre</th>
                        <th>Option</th>
                        <th>Persona cible</th>
                        <th>Prix</th>
                        <th>Statut</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($orderOptions as $orderOption)
                        <tr>
                            <td><span class="badge badge-soft-dark">{{ $orderOption->sort_order }}</span></td>
                            <td class="text-wrap" style="min-width: 320px;">
                                <div class="fw-semibold">{{ $orderOption->name }}</div>
                                <div class="text-muted small">{{ $orderOption->slug }}</div>
                                @if($orderOption->description)
                                    <div class="text-muted small mt-1">{{ \Illuminate\Support\Str::limit($orderOption->description, 120) }}</div>
                                @endif
                            </td>
                            <td class="text-wrap" style="min-width: 220px;">{{ $orderOption->persona_hint ?: '—' }}</td>
                            <td class="fw-semibold">{{ number_format($orderOption->price, 0, ',', ' ') }} FCFA</td>
                            <td>
                                <span class="badge badge-soft-{{ $orderOption->is_active ? 'success' : 'secondary' }}">
                                    {{ $orderOption->is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="text-end">
                                <a href="{{ route('admin.order-options.edit', $orderOption) }}" class="btn btn-sm btn-soft-primary me-1">
                                    <i class="ri-edit-line"></i>
                                </a>
                                <form
                                    action="{{ route('admin.order-options.destroy', $orderOption) }}"
                                    method="POST"
                                    class="d-inline"
                                    onsubmit="return confirm('Désactiver cette option de commande ?')"
                                >
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-sm btn-soft-danger">
                                        <i class="ri-close-circle-line"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="text-center text-muted py-4">Aucune option de commande configurée.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-3">{{ $orderOptions->links() }}</div>
    </div>
</div>
@endsection
