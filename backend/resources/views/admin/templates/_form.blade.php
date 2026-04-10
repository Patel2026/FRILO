@php
    $template = $template ?? null;
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
    <label class="form-label">URL de prévisualisation</label>
    <input type="url" name="preview_url" class="form-control"
           value="{{ old('preview_url', $template?->preview_url) }}" placeholder="https://...">
    <div class="form-text">Lien vers la démo live (site interactif affiché dans l'espace client).</div>
</div>

<div class="mb-3">
    <label class="form-label">Pages de prévisualisation (une page par ligne)</label>
    <textarea name="preview_pages_raw" class="form-control @error('preview_pages_raw') is-invalid @enderror" rows="4"
              placeholder="Accueil|/&#10;Services|/services&#10;Contact|/contact">{{ $previewPagesRaw }}</textarea>
    @error('preview_pages_raw')<div class="invalid-feedback">{{ $message }}</div>@enderror
    <div class="form-text">Format: <code>Titre|/chemin</code>. Exemple: <code>Tarifs|/tarifs</code>.</div>
</div>

<div class="mb-3">
    <label class="form-label">Galerie d'aperçu (une URL d'image par ligne)</label>
    <textarea name="preview_gallery_raw" class="form-control @error('preview_gallery_raw') is-invalid @enderror" rows="4"
              placeholder="https://.../home.jpg&#10;https://.../about.jpg">{{ $previewGalleryRaw }}</textarea>
    @error('preview_gallery_raw')<div class="invalid-feedback">{{ $message }}</div>@enderror
    <div class="form-text">Utilisée en fallback si la démo live n'est pas disponible.</div>
</div>

<div class="form-check form-switch mb-0">
    <input class="form-check-input" type="checkbox" name="is_active" value="1" id="is_active"
           {{ old('is_active', $template?->is_active ?? true) ? 'checked' : '' }}>
    <label class="form-check-label" for="is_active">Template actif (visible dans le catalogue)</label>
</div>
