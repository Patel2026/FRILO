@extends('layouts.master')

@section('title') Contenu du site @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Contenu du site</h4>
            <a href="{{ route('admin.content.history.index') }}" class="btn btn-soft-secondary btn-sm">
                <i class="ri-history-line me-1"></i> Historique
            </a>
        </div>
    </div>
</div>

@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
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
                        <th>Page</th>
                        <th>Route publique</th>
                        <th>SEO</th>
                        <th>Indexation</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($pages as $page)
                        <tr>
                            <td>
                                <strong>{{ $page->name }}</strong>
                                <div class="text-muted small">{{ $page->key }}</div>
                            </td>
                            <td>
                                <a href="{{ $page->route_pattern }}" target="_blank" rel="noopener" class="link-primary">
                                    {{ $page->route_pattern }}
                                </a>
                            </td>
                            <td>
                                <div>{{ $page->seo_title ?: 'Titre non renseigne' }}</div>
                                <div class="text-muted small">{{ $page->seo_description ?: 'Description non renseignee' }}</div>
                            </td>
                            <td>
                                <span class="badge badge-soft-{{ $page->is_indexable ? 'success' : 'warning' }}">
                                    {{ $page->is_indexable ? 'Indexable' : 'Non indexable' }}
                                </span>
                            </td>
                            <td class="text-end">
                                <a href="{{ route('admin.content.pages.edit', $page) }}" class="btn btn-sm btn-primary">
                                    <i class="ri-edit-line me-1"></i> Modifier
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center text-muted py-4">Aucune page publique.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="mt-3">{{ $pages->links() }}</div>
    </div>
</div>
@endsection
