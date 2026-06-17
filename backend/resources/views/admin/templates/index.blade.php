@extends('layouts.master')

@section('title') Templates @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Templates</h4>
            <a href="{{ route('admin.templates.create') }}" class="btn btn-primary btn-sm">
                <i class="ri-add-line me-1"></i> Nouveau template
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
        <div class="table-responsive">
            <table class="table table-nowrap align-middle mb-0 frilo-admin-table">
                <thead class="table-light">
                    <tr>
                        <th>Nom</th>
                        <th class="frilo-table-secondary">Secteur</th>
                        <th class="frilo-table-money">Prix</th>
                        <th class="frilo-table-status">Statut</th>
                        <th>Commandes</th>
                        <th class="frilo-table-actions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($templates as $template)
                    <tr>
                        <td>
                            <div class="d-flex align-items-center gap-2">
                                @if($template->full_thumbnail_url)
                                    <img src="{{ $template->full_thumbnail_url }}" height="40" class="rounded" alt="">
                                @endif
                                <div>
                                    <strong>{{ $template->name }}</strong>
                                    <div class="text-muted small">{{ $template->slug }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="frilo-table-secondary">{{ $template->sector->name ?? '—' }}</td>
                        <td>
                            <div class="fw-semibold">{{ number_format($template->effective_price, 0, ',', ' ') }} FCFA</div>
                            <div class="text-muted small">Normal : {{ number_format($template->normal_price ?? $template->price, 0, ',', ' ') }} FCFA</div>
                            @if($template->promo_price)
                                <span class="badge badge-soft-success">Promo : {{ number_format($template->promo_price, 0, ',', ' ') }} FCFA</span>
                            @endif
                        </td>
                        <td>
                            <span class="badge badge-soft-{{ $template->is_active ? 'success' : 'danger' }}">
                                {{ $template->is_active ? 'Actif' : 'Inactif' }}
                            </span>
                        </td>
                        <td>{{ $template->orders_count ?? 0 }}</td>
                        <td class="frilo-table-actions">
                            <a href="{{ route('admin.templates.edit', $template) }}" class="btn btn-sm btn-soft-primary me-1">
                                <i class="ri-edit-line"></i>
                            </a>
                            <form action="{{ route('admin.templates.destroy', $template) }}" method="POST" class="d-inline"
                                  onsubmit="return confirm('Désactiver ce template ?')">
                                @csrf @method('DELETE')
                                <button class="btn btn-sm btn-soft-danger"><i class="ri-delete-bin-line"></i></button>
                            </form>
                        </td>
                    </tr>
                    @empty
                    <tr><td colspan="6" class="text-center text-muted py-4">Aucun template.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-3">{{ $templates->links() }}</div>
    </div>
</div>
@endsection
