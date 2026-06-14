@php
    $defaultDoc = [
        'type' => 'doc',
        'content' => [
            [
                'type' => 'paragraph',
                'content' => [
                    ['type' => 'text', 'text' => 'Votre texte ici.'],
                ],
            ],
        ],
    ];
    $defaultContent = ['body' => $defaultDoc];
    $blockContent = $block?->content ?? $defaultContent;
    $blockSettings = $block?->settings ?? [];
    $contentJson = old('content_json', json_encode($blockContent, $jsonFlags ?? JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    $settingsJson = old('settings_json', json_encode($blockSettings, $jsonFlags ?? JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
@endphp

<form method="POST" action="{{ $action }}" class="row g-3">
    @csrf
    @if(($method ?? 'POST') !== 'POST')
        @method($method)
    @endif

    <div class="col-md-6">
        <label class="form-label">Layout du bloc</label>
        <select class="form-select @error('layout') is-invalid @enderror" name="layout" required>
            @foreach(\App\Models\ContentBlock::LAYOUTS as $layout)
                <option value="{{ $layout }}" @selected(old('layout', $block?->layout ?? \App\Models\ContentBlock::LAYOUT_FULL_WIDTH) === $layout)>
                    {{ match($layout) {
                        \App\Models\ContentBlock::LAYOUT_FULL_WIDTH => 'Pleine largeur',
                        \App\Models\ContentBlock::LAYOUT_TWO_COLUMNS => 'Deux colonnes',
                        \App\Models\ContentBlock::LAYOUT_MEDIA_TEXT => 'Média + texte',
                        default => $layout,
                    } }}
                </option>
            @endforeach
        </select>
        @error('layout') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>

    <div class="col-md-6">
        <label class="form-label">Point d’insertion</label>
        <select class="form-select @error('anchor_section_key') is-invalid @enderror" name="anchor_section_key">
            <option value="">Après les sections principales</option>
            @foreach($sectionDefinitions as $sectionKey => $definition)
                <option value="{{ $sectionKey }}" @selected(old('anchor_section_key', $block?->anchor_section_key) === $sectionKey)>
                    {{ $definition['name'] ?? $sectionKey }}
                </option>
            @endforeach
        </select>
        @error('anchor_section_key') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>

    <div class="col-md-6">
        <label class="form-label">Position</label>
        <input type="number" min="0" max="9999" class="form-control @error('position') is-invalid @enderror" name="position" value="{{ old('position', $block?->position) }}">
        @error('position') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>

    <div class="col-md-6 d-flex align-items-end">
        <div class="form-check form-switch mb-2">
            <input type="hidden" name="is_visible" value="0">
            <input class="form-check-input" type="checkbox" name="is_visible" value="1" id="block-visible-{{ $block?->id ?? 'new' }}" @checked(old('is_visible', $block?->is_visible ?? true))>
            <label class="form-check-label" for="block-visible-{{ $block?->id ?? 'new' }}">Visible</label>
        </div>
    </div>

    <div class="col-12">
        <label class="form-label">Contenu JSON structuré</label>
        <textarea class="form-control font-monospace @error('content_json') is-invalid @enderror @error('content') is-invalid @enderror @error('content.body') is-invalid @enderror" name="content_json" rows="11" spellcheck="false">{{ $contentJson }}</textarea>
        @error('content_json') <div class="invalid-feedback">{{ $message }}</div> @enderror
        @error('content') <div class="invalid-feedback">{{ $message }}</div> @enderror
        @error('content.body') <div class="invalid-feedback">{{ $message }}</div> @enderror
        <div class="form-text">Layouts acceptés : <code>full_width</code> utilise <code>body</code>, <code>two_columns</code> utilise <code>left</code> et <code>right</code>, <code>media_text</code> utilise <code>body</code> et éventuellement <code>media_label</code>.</div>
    </div>

    <div class="col-12">
        <label class="form-label">Réglages JSON</label>
        <textarea class="form-control font-monospace @error('settings_json') is-invalid @enderror @error('settings') is-invalid @enderror" name="settings_json" rows="5" spellcheck="false">{{ $settingsJson }}</textarea>
        @error('settings_json') <div class="invalid-feedback">{{ $message }}</div> @enderror
        @error('settings') <div class="invalid-feedback">{{ $message }}</div> @enderror
    </div>

    <div class="col-12">
        <button class="btn btn-primary btn-sm" type="submit">
            <i class="ri-save-3-line me-1"></i> {{ $block ? 'Enregistrer le bloc' : 'Ajouter le bloc' }}
        </button>
    </div>
</form>
