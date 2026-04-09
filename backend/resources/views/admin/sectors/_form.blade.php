@php $sector = $sector ?? null; @endphp

<div class="mb-3">
    <label class="form-label">Nom <span class="text-danger">*</span></label>
    <input type="text" name="name" class="form-control @error('name') is-invalid @enderror"
           value="{{ old('name', $sector?->name) }}" required>
    @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3">
    <label class="form-label">Description</label>
    <textarea name="description" class="form-control" rows="2">{{ old('description', $sector?->description) }}</textarea>
</div>

<div class="row">
    <div class="col-md-6">
        <div class="mb-3">
            <label class="form-label">Icône (nom Lucide)</label>
            <input type="text" name="icon" class="form-control" placeholder="Utensils"
                   value="{{ old('icon', $sector?->icon) }}">
            <div class="form-text">Ex: Utensils, Hammer, Heart, Scale, Users, Home</div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="mb-3">
            <label class="form-label">Gradient CSS (optionnel)</label>
            <input type="text" name="gradient" class="form-control" placeholder="from-orange-400 to-red-500"
                   value="{{ old('gradient', $sector?->gradient) }}">
        </div>
    </div>
</div>

<div class="form-check form-switch">
    <input class="form-check-input" type="checkbox" name="is_active" value="1" id="is_active"
           {{ old('is_active', $sector?->is_active ?? true) ? 'checked' : '' }}>
    <label class="form-check-label" for="is_active">Secteur actif (visible dans le catalogue)</label>
</div>
