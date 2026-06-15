<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'slug' => ['required', 'string', 'alpha_dash', 'min:3', 'max:255', Rule::unique('order_options', 'slug')],
            'description' => ['nullable', 'string', 'max:2000'],
            'persona_hint' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0', 'max:5000000'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
