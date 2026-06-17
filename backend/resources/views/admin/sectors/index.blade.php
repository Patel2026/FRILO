@extends('layouts.master')

@section('title') Secteurs @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Secteurs</h4>
            <a href="{{ route('admin.sectors.create') }}" class="btn btn-primary btn-sm">
                <i class="ri-add-line me-1"></i> Nouveau secteur
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
            <table class="table align-middle mb-0 frilo-admin-table">
                <thead class="table-light">
                    <tr>
                        <th>Nom</th>
                        <th class="frilo-table-secondary">Slug</th>
                        <th>Templates</th>
                        <th class="frilo-table-status">Statut</th>
                        <th class="frilo-table-actions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($sectors as $sector)
                    <tr>
                        <td><strong>{{ $sector->name }}</strong></td>
                        <td class="frilo-table-secondary"><code>{{ $sector->slug }}</code></td>
                        <td>{{ $sector->templates_count }}</td>
                        <td>
                            <span class="badge badge-soft-{{ $sector->is_active ? 'success' : 'danger' }}">
                                {{ $sector->is_active ? 'Actif' : 'Inactif' }}
                            </span>
                        </td>
                        <td class="frilo-table-actions">
                            <a href="{{ route('admin.sectors.edit', $sector) }}" class="btn btn-sm btn-soft-primary me-1">
                                <i class="ri-edit-line"></i>
                            </a>
                            <form action="{{ route('admin.sectors.destroy', $sector) }}" method="POST" class="d-inline"
                                  onsubmit="return confirm('Désactiver ce secteur ?')">
                                @csrf @method('DELETE')
                                <button class="btn btn-sm btn-soft-warning"><i class="ri-eye-off-line"></i></button>
                            </form>
                        </td>
                    </tr>
                    @empty
                    <tr><td colspan="5" class="text-center text-muted py-4">Aucun secteur.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-3">{{ $sectors->links() }}</div>
    </div>
</div>
@endsection
