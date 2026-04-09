@php $template = $template ?? null; @endphp

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
</div>

<div class="form-check form-switch mb-0">
    <input class="form-check-input" type="checkbox" name="is_active" value="1" id="is_active"
           {{ old('is_active', $template?->is_active ?? true) ? 'checked' : '' }}>
    <label class="form-check-label" for="is_active">Template actif (visible dans le catalogue)</label>
</div>
