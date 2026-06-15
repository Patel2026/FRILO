<?php

namespace App\Http\Requests\Admin;

use App\Models\OrderOption;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var OrderOption|null $orderOption */
        $orderOption = $this->route('order_option');

        return [
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'slug' => [
                'required',
                'string',
                'alpha_dash',
                'min:3',
                'max:255',
                Rule::unique('order_options', 'slug')->ignore($orderOption?->id),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'persona_hint' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0', 'max:5000000'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
