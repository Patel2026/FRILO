@php
    $sectionContentJson = old(
        'content_json',
        json_encode($section->content ?? [], $jsonFlags ?? JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );
    $fieldNames = array_keys($definition['defaults'] ?? ($section->content ?? []));
@endphp

<div class="accordion-item">
    <h2 class="accordion-header" id="section-heading-{{ $section->id }}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#section-collapse-{{ $section->id }}">
            <span class="me-2">{{ $section->name }}</span>
            <span class="badge badge-soft-secondary">{{ $section->key }}</span>
            @if(! $section->is_visible)
                <span class="badge badge-soft-warning ms-2">Masquée</span>
            @endif
        </button>
    </h2>
    <div id="section-collapse-{{ $section->id }}" class="accordion-collapse collapse" data-bs-parent="#public-sections">
        <div class="accordion-body">
            <form method="POST" action="{{ route('admin.content.sections.update', $section) }}" class="row g-3">
                @csrf
                @method('PATCH')

                <div class="col-md-8">
                    <label class="form-label">Nom section</label>
                    <input class="form-control @error('name') is-invalid @enderror" name="name" value="{{ old('name', $section->name) }}" required>
                    @error('name') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="col-md-4">
                    <label class="form-label">Position</label>
                    <input type="number" min="0" max="9999" class="form-control @error('position') is-invalid @enderror" name="position" value="{{ old('position', $section->position) }}">
                    @error('position') <div class="invalid-feedback">{{ $message }}</div> @enderror
                </div>

                <div class="col-12">
                    <div class="form-check form-switch">
                        @if(($definition['hideable'] ?? true) === false)
                            <input type="hidden" name="is_visible" value="1">
                        @else
                            <input type="hidden" name="is_visible" value="0">
                        @endif
                        <input class="form-check-input" type="checkbox" name="is_visible" value="1" id="section-visible-{{ $section->id }}" @checked(old('is_visible', $section->is_visible)) @disabled(($definition['hideable'] ?? true) === false)>
                        <label class="form-check-label" for="section-visible-{{ $section->id }}">
                            Visible sur l’espace public
                            @if(($definition['hideable'] ?? true) === false)
                                <span class="text-muted">(section obligatoire)</span>
                            @endif
                        </label>
                    </div>
                </div>

                <div class="col-12">
                    <div class="d-flex flex-wrap gap-1 mb-2">
                        <span class="text-muted small me-1">Champs attendus :</span>
                        @foreach($fieldNames as $field)
                            <span class="badge badge-soft-info">{{ $field }}</span>
                        @endforeach
                    </div>
                    <label class="form-label">Contenu JSON structuré</label>
                    <textarea class="form-control font-monospace @error('content_json') is-invalid @enderror @error('content') is-invalid @enderror" name="content_json" rows="12" spellcheck="false">{{ $sectionContentJson }}</textarea>
                    @error('content_json') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    @error('content') <div class="invalid-feedback">{{ $message }}</div> @enderror
                    <div class="form-text">Respectez les champs listés ci-dessus. La publication est immédiate après enregistrement.</div>
                </div>

                <div class="col-12">
                    <button class="btn btn-primary btn-sm" type="submit">
                        <i class="ri-save-3-line me-1"></i> Enregistrer la section
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
