@if($errors->any())
    <div class="alert alert-danger" role="alert">{{ $errors->first() }}</div>
@endif
@if($resource !== 'sectors')
<nav class="d-flex gap-2 mb-3" aria-label="Vue des éléments">
    <a href="{{ route('admin.'.$resource.'.index') }}" class="btn {{ !$trashed ? 'btn-primary' : 'btn-light' }}">Éléments disponibles</a>
    <a href="{{ route('admin.'.$resource.'.index', ['trashed' => 1]) }}" class="btn {{ $trashed ? 'btn-primary' : 'btn-light' }}">Corbeille</a>
</nav>
@endif
<form id="catalog-bulk-form" method="POST" action="{{ route('admin.'.$resource.'.'.($resource === 'sectors' ? 'bulk-visibility' : ($trashed ? 'bulk-restore' : 'bulk-destroy'))) }}" class="d-flex flex-wrap align-items-center gap-3 mb-3">
    @csrf
    @if($resource === 'sectors')
        @method('PATCH')
        <label for="catalog-action">Action</label>
        <select name="active" id="catalog-action" class="form-select w-auto">
            <option value="0">Désactiver</option>
            <option value="1">Réactiver</option>
        </select>
    @elseif(!$trashed)
        @method('DELETE')
    @endif
    <span id="catalog-count" role="status" aria-live="polite">0 élément sélectionné</span>
    <button id="catalog-submit" type="submit" class="btn {{ $resource === 'sectors' ? 'btn-warning' : ($trashed ? 'btn-success' : 'btn-danger') }}" disabled>{{ $resource === 'sectors' ? 'Appliquer à la sélection' : ($trashed ? 'Restaurer la sélection' : 'Supprimer la sélection') }}</button>
    <span class="text-muted small">{{ $resource === 'sectors' ? 'Les templates et les commandes liés sont conservés.' : 'La suppression est récupérable depuis la corbeille.' }}</span>
</form>
<noscript><p>Activez JavaScript pour sélectionner plusieurs éléments.</p></noscript>
