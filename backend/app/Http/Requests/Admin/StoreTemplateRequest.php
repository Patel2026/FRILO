<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sector_id' => ['required', 'exists:sectors,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'normal_price' => ['required', 'integer', 'min:0'],
            'promo_price' => ['nullable', 'integer', 'min:0'],
            'features_raw' => ['nullable', 'string'],
            'target_audience_raw' => ['nullable', 'string'],
            'included_features_raw' => ['nullable', 'string'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'preview_source' => ['required', 'in:external,local'],
            'local_preview_template' => ['nullable', 'string', 'max:255'],
            'preview_url' => ['nullable', 'string', 'max:500'],
            'preview_pages_raw' => ['nullable', 'string'],
            'preview_gallery_raw' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
