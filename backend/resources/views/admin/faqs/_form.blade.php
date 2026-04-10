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

<div class="mb-3">
    <label for="question" class="form-label">Question</label>
    <input
        type="text"
        id="question"
        name="question"
        class="form-control @error('question') is-invalid @enderror"
        value="{{ old('question', $faq->question) }}"
        maxlength="500"
        placeholder="Ex. Combien de temps faut-il pour livrer un site ?"
        required
    >
</div>

<div class="mb-3">
    <label for="answer" class="form-label">Réponse</label>
    <textarea
        id="answer"
        name="answer"
        rows="7"
        class="form-control @error('answer') is-invalid @enderror"
        placeholder="Renseignez ici la réponse affichée sur le site public."
        required
    >{{ old('answer', $faq->answer) }}</textarea>
    <div class="form-text">Les retours à la ligne sont conservés sur le site public.</div>
</div>

<div class="row g-3">
    <div class="col-md-4">
        <label for="sort_order" class="form-label">Ordre d'affichage</label>
        <input
            type="number"
            id="sort_order"
            name="sort_order"
            class="form-control @error('sort_order') is-invalid @enderror"
            value="{{ old('sort_order', $faq->sort_order ?? 0) }}"
            min="0"
            max="9999"
        >
        <div class="form-text">Les valeurs les plus basses remontent en premier sur la homepage et la page FAQ.</div>
    </div>
    <div class="col-md-8 d-flex align-items-center">
        <div class="form-check form-switch mt-4">
            <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="is_published"
                name="is_published"
                value="1"
                {{ old('is_published', $faq->is_published ?? true) ? 'checked' : '' }}
            >
            <label class="form-check-label" for="is_published">
                Visible sur le site public
            </label>
        </div>
    </div>
</div>
