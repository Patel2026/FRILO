@extends('layouts.master')

@section('title') FAQ @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <div>
                <h4 class="mb-sm-0">FAQ publique</h4>
                <div class="text-muted small">Les questions publiées alimentent automatiquement la homepage et la page FAQ du site public.</div>
            </div>
            <a href="{{ route('admin.faqs.create') }}" class="btn btn-primary btn-sm">
                <i class="ri-add-line me-1"></i> Nouvelle question
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
                <input type="text" name="search" value="{{ $filters['search'] }}" class="form-control" placeholder="Question ou réponse">
            </div>
            <div class="col-md-3">
                <label class="form-label">Visibilité</label>
                <select name="visibility" class="form-select">
                    <option value="" {{ $filters['visibility'] === '' ? 'selected' : '' }}>Toutes</option>
                    <option value="published" {{ $filters['visibility'] === 'published' ? 'selected' : '' }}>Publiées</option>
                    <option value="hidden" {{ $filters['visibility'] === 'hidden' ? 'selected' : '' }}>Masquées</option>
                </select>
            </div>
            <div class="col-md-4">
                <button type="submit" class="btn btn-primary">Filtrer</button>
                <a href="{{ route('admin.faqs.index') }}" class="btn btn-soft-secondary ms-1">Réinitialiser</a>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">{{ $faqs->total() }} question(s)</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-nowrap align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Ordre</th>
                        <th>Question</th>
                        <th>Réponse</th>
                        <th>Statut</th>
                        <th>Mise à jour</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($faqs as $faq)
                        <tr>
                            <td>
                                <span class="badge badge-soft-dark">{{ $faq->sort_order }}</span>
                            </td>
                            <td class="text-wrap" style="min-width: 280px;">
                                <div class="fw-semibold">{{ $faq->question }}</div>
                            </td>
                            <td class="text-wrap" style="min-width: 420px; max-width: 520px;">
                                {{ \Illuminate\Support\Str::limit($faq->answer, 180) }}
                            </td>
                            <td>
                                <span class="badge badge-soft-{{ $faq->is_published ? 'success' : 'secondary' }}">
                                    {{ $faq->is_published ? 'Publiée' : 'Masquée' }}
                                </span>
                            </td>
                            <td>
                                {{ $faq->updated_at?->format('d/m/Y H:i') }}
                            </td>
                            <td class="text-end">
                                <a href="{{ route('admin.faqs.edit', $faq) }}" class="btn btn-sm btn-soft-primary me-1">
                                    <i class="ri-edit-line"></i>
                                </a>
                                <form
                                    action="{{ route('admin.faqs.destroy', $faq) }}"
                                    method="POST"
                                    class="d-inline"
                                    onsubmit="return confirm('Supprimer cette question FAQ ?')"
                                >
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-sm btn-soft-danger">
                                        <i class="ri-delete-bin-line"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="text-center text-muted py-4">Aucune question FAQ configurée.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-3">{{ $faqs->links() }}</div>
    </div>
</div>
@endsection
