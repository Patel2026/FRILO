<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'template_id'           => [
                'required',
                'integer',
                Rule::exists('templates', 'id')->where(fn ($query) => $query->where('is_active', true)),
            ],
            'enterprise_name'       => ['nullable', 'string', 'max:255'],
            'activity_description'  => ['nullable', 'string'],
            'colors'                => ['nullable', 'array'],
            'colors.*'              => ['string', 'max:50'],
            'specific_instructions' => ['nullable', 'string'],
            'color_palette_id'      => ['nullable', 'string', 'max:80'],
            'font_pairing_id'       => ['nullable', 'string', 'max:80'],
            'option_ids'            => ['nullable', 'array', 'max:20'],
            'option_ids.*'          => [
                'integer',
                Rule::exists('order_options', 'id')->where(fn ($query) => $query->where('is_active', true)),
            ],
        ];
        // Note : user_id, price et status ne sont JAMAIS acceptés du client.
    }
}
