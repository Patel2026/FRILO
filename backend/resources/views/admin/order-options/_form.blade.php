@if($errors->any())
    <div class="alert alert-danger">
        <div class="fw-semibold mb-2">Merci de corriger les champs suivants :</div>
        <ul class="mb-0 ps-3">
            @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<div class="row g-3">
    <div class="col-md-8">
        <label for="name" class="form-label">Nom de l'option</label>
        <input
            type="text"
            id="name"
            name="name"
            class="form-control @error('name') is-invalid @enderror"
            value="{{ old('name', $orderOption->name) }}"
            maxlength="255"
            placeholder="Ex. Galerie photos / réalisations"
            required
        >
    </div>
    <div class="col-md-4">
        <label for="slug" class="form-label">Slug</label>
        <input
            type="text"
            id="slug"
            name="slug"
            class="form-control @error('slug') is-invalid @enderror"
            value="{{ old('slug', $orderOption->slug) }}"
            maxlength="255"
            placeholder="galerie-photos"
            required
        >
    </div>
    <div class="col-12">
        <label for="description" class="form-label">Description courte</label>
        <textarea
            id="description"
            name="description"
            rows="4"
            class="form-control @error('description') is-invalid @enderror"
            placeholder="Expliquez simplement ce que le client gagne avec cette option."
        >{{ old('description', $orderOption->description) }}</textarea>
    </div>
    <div class="col-md-8">
        <label for="persona_hint" class="form-label">Personas concernés</label>
        <input
            type="text"
            id="persona_hint"
            name="persona_hint"
            class="form-control @error('persona_hint') is-invalid @enderror"
            value="{{ old('persona_hint', $orderOption->persona_hint) }}"
            maxlength="255"
            placeholder="Ex. BTP, immobilier, école"
        >
    </div>
    <div class="col-md-4">
        <label for="price" class="form-label">Prix additionnel (FCFA)</label>
        <input
            type="number"
            id="price"
            name="price"
            class="form-control @error('price') is-invalid @enderror"
            value="{{ old('price', $orderOption->price ?? 0) }}"
            min="0"
            max="5000000"
            required
        >
    </div>
    <div class="col-md-4">
        <label for="sort_order" class="form-label">Ordre d'affichage</label>
        <input
            type="number"
            id="sort_order"
            name="sort_order"
            class="form-control @error('sort_order') is-invalid @enderror"
            value="{{ old('sort_order', $orderOption->sort_order ?? 0) }}"
            min="0"
            max="9999"
        >
    </div>
    <div class="col-md-8 d-flex align-items-center">
        <div class="form-check form-switch mt-4">
            <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="is_active"
                name="is_active"
                value="1"
                {{ old('is_active', $orderOption->is_active ?? true) ? 'checked' : '' }}
            >
            <label class="form-check-label" for="is_active">
                Proposée dans le tunnel de commande
            </label>
        </div>
    </div>
</div>
