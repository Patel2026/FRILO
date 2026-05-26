@php
    $template = $template ?? null;
    $localPreviewTemplates = $localPreviewTemplates ?? [];
    $previewPagesRaw = old('preview_pages_raw',
        collect($template?->preview_pages ?? [])
            ->map(function ($page) {
                $label = is_array($page) ? ($page['label'] ?? '') : '';
                $path = is_array($page) ? ($page['path'] ?? '/') : '/';
                return trim($label) !== '' ? trim($label) . '|' . ($path !== '' ? $path : '/') : null;
            })
            ->filter()
            ->implode("\n")
    );
    $previewGalleryRaw = old('preview_gallery_raw', implode("\n", $template?->preview_gallery ?? []));
    $resolvedPreviewSource = old('preview_source',
        \Illuminate\Support\Str::startsWith((string) ($template?->preview_url ?? ''), '/template-previews/')
            ? 'local'
            : 'external'
    );
    $resolvedLocalPreviewTemplate = old('local_preview_template');

    if (!$resolvedLocalPreviewTemplate && $template?->preview_url) {
        if (preg_match('#^/template-previews/([^/]+)/#', $template->preview_url, $matches) === 1) {
            $resolvedLocalPreviewTemplate = $matches[1];
        }
    }
@endphp

<div class="mb-3">
    <label class="form-label">Secteur <span class="text-danger">*</span></label>
    <select name="sector_id" class="form-select @error('sector_id') is-invalid @enderror" required>
        <option value="">-- Sélectionner --</option>
        @foreach($sectors as $sector)
            <option value="{{ $sector->id }}" {{ old('sector_id', $template?->sector_id) == $sector->id ? 'selected' : '' }}>
                {{ $sector->name }}
            </option>
        @endforeach
    </select>
    @error('sector_id')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3">
    <label class="form-label">Nom <span class="text-danger">*</span></label>
    <input type="text" name="name" class="form-control @error('name') is-invalid @enderror"
           value="{{ old('name', $template?->name) }}" required>
    @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3">
    <label class="form-label">Description</label>
    <textarea name="description" class="form-control" rows="3">{{ old('description', $template?->description) }}</textarea>
</div>

<div class="mb-3">
    <label class="form-label">Prix (FCFA) <span class="text-danger">*</span></label>
    <input type="number" name="price" class="form-control @error('price') is-invalid @enderror"
           value="{{ old('price', $template?->price) }}" min="0" required>
    @error('price')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3">
    <label class="form-label">Fonctionnalités incluses (une par ligne)</label>
    <textarea name="features_raw" class="form-control" rows="4"
              placeholder="Menu digital&#10;Réservation en ligne&#10;Galerie photos">{{ old('features_raw', implode("\n", $template?->features ?? [])) }}</textarea>
    <div class="form-text">Chaque ligne devient un élément de la liste.</div>
</div>

<div class="mb-3">
    <label class="form-label">Thumbnail</label>
    @if($template?->full_thumbnail_url)
        <div class="mb-2">
            <img src="{{ $template->full_thumbnail_url }}" height="80" class="rounded border" alt="">
        </div>
    @endif
    <input type="file" name="thumbnail" class="form-control" accept="image/jpeg,image/png,image/webp">
    <div class="form-text">JPG, PNG ou WebP — max 2 Mo.</div>
</div>

<div class="mb-3">
    <label class="form-label d-block">Mode de prévisualisation</label>
    <div class="d-flex flex-column gap-2">
        <div class="form-check">
            <input class="form-check-input" type="radio" name="preview_source" id="preview_source_external" value="external"
                   {{ $resolvedPreviewSource === 'external' ? 'checked' : '' }}>
            <label class="form-check-label" for="preview_source_external">
                Liens d'accès externes ou manuels
            </label>
        </div>
        <div class="form-check">
            <input class="form-check-input" type="radio" name="preview_source" id="preview_source_local" value="local"
                   {{ $resolvedPreviewSource === 'local' ? 'checked' : '' }}>
            <label class="form-check-label" for="preview_source_local">
                Template HTML local préchargé depuis le dossier <code>template/</code>
            </label>
        </div>
    </div>
    @error('preview_source')<div class="text-danger small mt-2">{{ $message }}</div>@enderror
</div>

<div class="mb-3">
    <label class="form-label">Template HTML local préchargé</label>
    <select name="local_preview_template" class="form-select @error('local_preview_template') is-invalid @enderror">
        <option value="">-- Sélectionner un dossier template --</option>
        @foreach($localPreviewTemplates as $localTemplate)
            <option value="{{ $localTemplate['folder'] }}" {{ $resolvedLocalPreviewTemplate === $localTemplate['folder'] ? 'selected' : '' }}>
                {{ $localTemplate['label'] }} — {{ $localTemplate['pages_count'] }} page(s)
            </option>
        @endforeach
    </select>
    @error('local_preview_template')<div class="invalid-feedback">{{ $message }}</div>@enderror
    <div class="form-text">Si ce mode est choisi, FRILO utilise automatiquement les fichiers HTML préchargés et leurs pages associées.</div>
</div>

<div class="mb-3">
    <label class="form-label">URL de prévisualisation externe</label>
    <input type="text" name="preview_url" class="form-control @error('preview_url') is-invalid @enderror"
           value="{{ old('preview_url', $resolvedPreviewSource === 'external' ? $template?->preview_url : '') }}" placeholder="https://...">
    @error('preview_url')<div class="invalid-feedback">{{ $message }}</div>@enderror
    <div class="form-text">Utilisé seulement si le mode <strong>Liens d'accès</strong> est sélectionné.</div>
</div>

<div class="mb-3">
    <label class="form-label">Pages de prévisualisation (une page par ligne)</label>
    <textarea name="preview_pages_raw" class="form-control @error('preview_pages_raw') is-invalid @enderror" rows="4"
              placeholder="Accueil|/&#10;Services|/services&#10;Contact|/contact">{{ $resolvedPreviewSource === 'external' ? $previewPagesRaw : '' }}</textarea>
    @error('preview_pages_raw')<div class="invalid-feedback">{{ $message }}</div>@enderror
    <div class="form-text">Utilisé seulement en mode liens. Format: <code>Titre|/chemin</code>.</div>
</div>

<div class="mb-3">
    <label class="form-label">Galerie d'aperçu (une URL d'image par ligne)</label>
    <textarea name="preview_gallery_raw" class="form-control @error('preview_gallery_raw') is-invalid @enderror" rows="4"
              placeholder="https://.../home.jpg&#10;https://.../about.jpg">{{ $resolvedPreviewSource === 'external' ? $previewGalleryRaw : '' }}</textarea>
    @error('preview_gallery_raw')<div class="invalid-feedback">{{ $message }}</div>@enderror
    <div class="form-text">Fallback image uniquement pour le mode liens d'accès.</div>
</div>

<div class="form-check form-switch mb-0">
    <input class="form-check-input" type="checkbox" name="is_active" value="1" id="is_active"
           {{ old('is_active', $template?->is_active ?? true) ? 'checked' : '' }}>
    <label class="form-check-label" for="is_active">Template actif (visible dans le catalogue)</label>
</div>
