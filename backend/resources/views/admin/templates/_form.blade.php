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
    $colorPalettesRaw = old('color_palettes_raw', $template?->color_palettes
        ? json_encode($template->color_palettes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        : ''
    );
    $fontPairingsRaw = old('font_pairings_raw', $template?->font_pairings
        ? json_encode($template->font_pairings, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        : ''
    );
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
                  placeholder="Site 5 pages&#10;Hébergement 1 an&#10;SSL sécurisé">{{ old('included_features_raw', implode("\n", $template?->included_features ?? [])) }}</textarea>
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
    <div class="row g-3 align-items-start">
        <div class="col-md-5">
            <div class="rounded border bg-light p-2">
                <div class="ratio ratio-4x3 rounded overflow-hidden bg-white">
                    <img
                        id="template-thumbnail-preview"
                        src="{{ $template?->full_thumbnail_url ?: '' }}"
                        class="h-100 w-100 object-fit-cover {{ $template?->full_thumbnail_url ? '' : 'd-none' }}"
                        alt="Aperçu de la miniature"
                    >
                    <div id="template-thumbnail-empty" class="d-flex h-100 w-100 align-items-center justify-content-center text-muted small {{ $template?->full_thumbnail_url ? 'd-none' : '' }}">
                        Aperçu de la miniature
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-7">
            <input id="template-thumbnail-input" type="file" name="thumbnail" class="form-control" accept="image/jpeg,image/png,image/webp">
            <div class="form-text">
                Format recommandé : image horizontale 4:3, 1200 × 900 px minimum. JPG, PNG ou WebP — max 2 Mo.
            </div>
        </div>
    </div>
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

<div class="row">
    <div class="col-lg-6 mb-3">
        <label class="form-label">Palettes de couleurs (JSON)</label>
        <textarea name="color_palettes_raw" class="form-control font-monospace @error('color_palettes_raw') is-invalid @enderror" rows="8"
                  placeholder='[{"id":"clair","name":"Clair","colors":["#ffffff","#111111","#e60000"]}]'>{{ $colorPalettesRaw }}</textarea>
        @error('color_palettes_raw')<div class="invalid-feedback">{{ $message }}</div>@enderror
        <div class="form-text">Chaque palette doit contenir <code>id</code>, <code>name</code> et idéalement <code>colors</code>.</div>
    </div>
    <div class="col-lg-6 mb-3">
        <label class="form-label">Packs de polices (JSON)</label>
        <textarea name="font_pairings_raw" class="form-control font-monospace @error('font_pairings_raw') is-invalid @enderror" rows="8"
                  placeholder='[{"id":"editorial","name":"Editorial","heading":"Instrument Serif","body":"Inter"}]'>{{ $fontPairingsRaw }}</textarea>
        @error('font_pairings_raw')<div class="invalid-feedback">{{ $message }}</div>@enderror
        <div class="form-text">Chaque pack doit contenir <code>id</code>, <code>name</code>, puis <code>heading</code> et <code>body</code>.</div>
    </div>
</div>

<div class="row">
    <div class="col-md-6 mb-3">
        <label class="form-label">Palette par défaut</label>
        <input type="text" name="default_color_palette" class="form-control @error('default_color_palette') is-invalid @enderror"
               value="{{ old('default_color_palette', $template?->default_color_palette) }}" placeholder="clair">
        @error('default_color_palette')<div class="invalid-feedback">{{ $message }}</div>@enderror
    </div>
    <div class="col-md-6 mb-3">
        <label class="form-label">Pack de polices par défaut</label>
        <input type="text" name="default_font_pairing" class="form-control @error('default_font_pairing') is-invalid @enderror"
               value="{{ old('default_font_pairing', $template?->default_font_pairing) }}" placeholder="editorial">
        @error('default_font_pairing')<div class="invalid-feedback">{{ $message }}</div>@enderror
    </div>
</div>

<div class="form-check form-switch mb-0">
    <input class="form-check-input" type="checkbox" name="is_active" value="1" id="is_active"
           {{ old('is_active', $template?->is_active ?? true) ? 'checked' : '' }}>
    <label class="form-check-label" for="is_active">Template actif (visible dans le catalogue)</label>
</div>

@section('script')
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const input = document.getElementById('template-thumbnail-input');
            const preview = document.getElementById('template-thumbnail-preview');
            const empty = document.getElementById('template-thumbnail-empty');

            if (!input || !preview || !empty) {
                return;
            }

            input.addEventListener('change', function () {
                const file = input.files && input.files[0] ? input.files[0] : null;

                if (!file) {
                    return;
                }

                preview.src = URL.createObjectURL(file);
                preview.classList.remove('d-none');
                empty.classList.add('d-none');
            });
        });
    </script>
@endsection
