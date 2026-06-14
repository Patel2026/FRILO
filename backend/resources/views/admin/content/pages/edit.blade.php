@extends('layouts.master')

@section('title') Modifier le contenu - {{ $page->name }} @endsection

@php
    $jsonFlags = JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
@endphp

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <div>
                <h4 class="mb-sm-0">Modifier le contenu : {{ $page->name }}</h4>
                <div class="text-muted small mt-1">SEO, sections protegees et blocs libres sur une seule page.</div>
            </div>
            <div class="d-flex flex-wrap gap-2">
                <a href="{{ $page->route_pattern }}" target="_blank" rel="noopener" class="btn btn-soft-primary btn-sm">
                    <i class="ri-external-link-line me-1"></i> Prévisualiser la page publique
                </a>
                <a href="{{ route('admin.content.pages.index') }}" class="btn btn-soft-secondary btn-sm">
                    <i class="ri-arrow-left-line me-1"></i> Retour
                </a>
            </div>
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

<div class="row g-4">
    <div class="col-lg-4">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">SEO de la page</h5>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.content.pages.update', $page) }}" class="row g-3">
                    @csrf
                    @method('PATCH')

                    <div class="col-12">
                        <label class="form-label">Nom interne</label>
                        <input class="form-control @error('name') is-invalid @enderror" name="name" value="{{ old('name', $page->name) }}" required>
                        @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>

                    <div class="col-12">
                        <label class="form-label">Titre SEO</label>
                        <input class="form-control @error('seo_title') is-invalid @enderror" name="seo_title" value="{{ old('seo_title', $page->seo_title) }}">
                        @error('seo_title') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>

                    <div class="col-12">
                        <label class="form-label">Description SEO</label>
                        <textarea class="form-control @error('seo_description') is-invalid @enderror" name="seo_description" rows="4">{{ old('seo_description', $page->seo_description) }}</textarea>
                        @error('seo_description') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    </div>

                    <div class="col-12">
                        <div class="form-check form-switch">
                            <input type="hidden" name="is_indexable" value="0">
                            <input class="form-check-input" type="checkbox" name="is_indexable" value="1" id="page-indexable" @checked(old('is_indexable', $page->is_indexable))>
                            <label class="form-check-label" for="page-indexable">Autoriser l’indexation</label>
                        </div>
                    </div>

                    <div class="col-12">
                        <button class="btn btn-primary btn-sm" type="submit">
                            <i class="ri-save-3-line me-1"></i> Enregistrer le SEO
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Ajouter un bloc libre</h5>
            </div>
            <div class="card-body">
                @include('admin.content.blocks._form', [
                    'page' => $page,
                    'block' => null,
                    'action' => route('admin.content.pages.blocks.store', $page),
                    'method' => 'POST',
                    'sectionDefinitions' => $sectionDefinitions,
                    'jsonFlags' => $jsonFlags,
                ])
            </div>
        </div>
    </div>

    <div class="col-lg-8">
        <div class="card">
            <div class="card-header d-flex align-items-center justify-content-between">
                <h5 class="card-title mb-0">Sections protégées</h5>
                <span class="badge badge-soft-info">{{ $page->sections->count() }} section(s)</span>
            </div>
            <div class="card-body">
                <div class="accordion" id="public-sections">
                    @forelse($page->sections as $section)
                        @include('admin.content.sections._form', [
                            'section' => $section,
                            'definition' => $sectionDefinitions[$section->key] ?? null,
                            'jsonFlags' => $jsonFlags,
                        ])
                    @empty
                        <div class="text-muted text-center py-4">Aucune section protégée pour cette page.</div>
                    @endforelse
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header d-flex align-items-center justify-content-between">
                <h5 class="card-title mb-0">Blocs libres</h5>
                <span class="badge badge-soft-secondary">{{ $page->blocks->count() }} bloc(s)</span>
            </div>
            <div class="card-body">
                @if($page->blocks->isNotEmpty())
                    <form method="POST" action="{{ route('admin.content.pages.blocks.order', $page) }}" class="mb-4">
                        @csrf
                        @method('PATCH')
                        <div class="row g-2 align-items-end">
                            @foreach($page->blocks as $block)
                                <div class="col-md-4">
                                    <label class="form-label">Ordre bloc #{{ $block->id }}</label>
                                    <input type="number" class="form-control" name="ordered_ids[]" value="{{ $block->id }}" readonly>
                                </div>
                            @endforeach
                            <div class="col-12">
                                <button class="btn btn-soft-primary btn-sm" type="submit">
                                    <i class="ri-sort-asc me-1"></i> Réenregistrer l’ordre actuel
                                </button>
                            </div>
                        </div>
                    </form>

                    <div class="accordion" id="public-blocks">
                        @foreach($page->blocks as $block)
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="block-heading-{{ $block->id }}">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#block-collapse-{{ $block->id }}">
                                        <span class="me-2">Bloc #{{ $block->id }}</span>
                                        <span class="badge badge-soft-primary">{{ $block->layout }}</span>
                                        @if(! $block->is_visible)
                                            <span class="badge badge-soft-warning ms-2">Masqué</span>
                                        @endif
                                    </button>
                                </h2>
                                <div id="block-collapse-{{ $block->id }}" class="accordion-collapse collapse" data-bs-parent="#public-blocks">
                                    <div class="accordion-body">
                                        @include('admin.content.blocks._form', [
                                            'page' => $page,
                                            'block' => $block,
                                            'action' => route('admin.content.blocks.update', $block),
                                            'method' => 'PATCH',
                                            'sectionDefinitions' => $sectionDefinitions,
                                            'jsonFlags' => $jsonFlags,
                                        ])

                                        <form method="POST" action="{{ route('admin.content.blocks.destroy', $block) }}" class="mt-3" onsubmit="return confirm('Supprimer ce bloc libre ?')">
                                            @csrf
                                            @method('DELETE')
                                            <button class="btn btn-soft-danger btn-sm" type="submit">
                                                <i class="ri-delete-bin-line me-1"></i> Supprimer le bloc
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @else
                    <div class="text-muted text-center py-4">Aucun bloc libre. Ajoutez un bloc depuis la colonne de gauche.</div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
