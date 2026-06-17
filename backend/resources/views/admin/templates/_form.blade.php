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

<div class="row">
    <div class="col-md-6 mb-3">
        <label class="form-label">Prix normal (FCFA) <span class="text-danger">*</span></label>
        <input type="number" name="normal_price" class="form-control @error('normal_price') is-invalid @enderror"
               value="{{ old('normal_price', $template?->normal_price ?? $template?->price) }}" min="0" required>
        @error('normal_price')<div class="invalid-feedback">{{ $message }}</div>@enderror
    </div>
    <div class="col-md-6 mb-3">
        <label class="form-label">Prix promo (FCFA)</label>
        <input type="number" name="promo_price" class="form-control @error('promo_price') is-invalid @enderror"
               value="{{ old('promo_price', $template?->promo_price) }}" min="0">
        @error('promo_price')<div class="invalid-feedback">{{ $message }}</div>@enderror
        <div class="form-text">Le prix commande utilise le prix promo s'il est renseigné, sinon le prix normal.</div>
    </div>
</div>

<div class="row">
    <div class="col-md-6 mb-3">
        <label class="form-label">Pensé pour</label>
        <textarea name="target_audience_raw" class="form-control" rows="4"
                  placeholder="Restaurants&#10;Maquis&#10;Snacks">{{ old('target_audience_raw', implode("\n", $template?->target_audience ?? [])) }}</textarea>
        <div class="form-text">Chaque ligne apparaît dans la section publique "Pensé pour".</div>
    </div>
    <div class="col-md-6 mb-3">
        <label class="form-label">Inclus dans l'offre</label>
        <textarea name="included_features_raw" class="form-control" rows="4"
                  placeholder="Site 5 pages&#10;Hébergement 1 an&#10;SSL sécurisé">{{ old('included_features_raw', implode("\n", $template?->included_features ?? $template?->features ?? [])) }}</textarea>
        <div class="form-text">Chaque ligne apparaît dans la section publique "Inclus".</div>
    </div>
</div>

<div class="mb-3">
    <label class="form-label">Fonctionnalités legacy / mots-clés internes</label>
    <textarea name="features_raw" class="form-control" rows="3"
              placeholder="Mots-clés internes ou compatibilité ancienne fiche">{{ old('features_raw', implode("\n", $template?->features ?? [])) }}</textarea>
    <div class="form-text">Champ conservé pour compatibilité. Préférer les champs "Pensé pour" et "Inclus".</div>
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
