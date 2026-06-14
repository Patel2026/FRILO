<?php

namespace App\Http\Requests\Admin;

use App\Models\ContentBlock;
use Illuminate\Validation\Rule;

class UpdateContentBlockRequest extends StoreContentBlockRequest
{
    public function rules(): array
    {
        return [
            'layout' => ['sometimes', 'required', Rule::in(ContentBlock::LAYOUTS)],
            'anchor_section_key' => ['sometimes', 'nullable', 'string', 'max:120'],
            'position' => ['sometimes', 'integer', 'min:0', 'max:9999'],
            'is_visible' => ['sometimes', 'boolean'],
            'content' => ['sometimes', 'required', 'array'],
            'settings' => ['sometimes', 'nullable', 'array'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $this->validateAllowedKeys($validator);

            if ($validator->errors()->isNotEmpty() || ! $this->has('content')) {
                return;
            }

            $block = $this->route('contentBlock');
            $layout = (string) $this->input('layout', $block?->layout);
            $this->validateContentShape($validator, $layout, (array) $this->input('content', []));
        });
    }
}
