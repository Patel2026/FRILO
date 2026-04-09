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
            <table class="table table-nowrap align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Nom</th>
                        <th>Secteur</th>
                        <th>Prix (FCFA)</th>
                        <th>Actif</th>
                        <th>Commandes</th>
                        <th></th>
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
                        <td>{{ $template->sector->name ?? '—' }}</td>
                        <td>{{ number_format($template->price, 0, ',', ' ') }}</td>
                        <td>
                            <span class="badge badge-soft-{{ $template->is_active ? 'success' : 'danger' }}">
                                {{ $template->is_active ? 'Actif' : 'Inactif' }}
                            </span>
                        </td>
                        <td>{{ $template->orders_count ?? 0 }}</td>
                        <td>
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
