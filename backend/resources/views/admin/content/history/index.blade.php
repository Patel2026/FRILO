@extends('layouts.master')

@section('title') Historique du contenu @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Historique du contenu</h4>
            <a href="{{ route('admin.content.pages.index') }}" class="btn btn-soft-secondary btn-sm">
                <i class="ri-pages-line me-1"></i> Pages
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

@if($errors->any())
    <div class="alert alert-danger" role="alert">
        <ul class="mb-0 ps-3">
            @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-nowrap align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Date</th>
                        <th>Événement</th>
                        <th>Ressource</th>
                        <th>Auteur</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($revisions as $revision)
                        <tr>
                            <td>{{ $revision->created_at?->format('d/m/Y H:i') }}</td>
                            <td><span class="badge badge-soft-primary">{{ $revision->event }}</span></td>
                            <td>
                                <div>{{ class_basename($revision->revisionable_type) }} #{{ $revision->revisionable_id }}</div>
                                @if(! $revision->revisionable)
                                    <div class="text-muted small">Ressource indisponible</div>
                                @endif
                            </td>
                            <td>{{ $revision->actor?->name ?? 'Systeme' }}</td>
                            <td class="text-end">
                                @if($revision->revisionable)
                                    <form method="POST" action="{{ route('admin.content.history.restore', $revision) }}" onsubmit="return confirm('Restaurer cette version ?')" class="d-inline">
                                        @csrf
                                        <button class="btn btn-sm btn-soft-warning" type="submit">
                                            <i class="ri-restart-line me-1"></i> Restaurer
                                        </button>
                                    </form>
                                @else
                                    <span class="text-muted small">Non restaurable</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="text-center text-muted py-4">Aucune revision de contenu.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <div class="mt-3">{{ $revisions->links() }}</div>
    </div>
</div>
@endsection
