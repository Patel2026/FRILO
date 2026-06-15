<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'material_activity_received' => ['sometimes', 'boolean'],
            'material_logo_received' => ['sometimes', 'boolean'],
            'material_photos_received' => ['sometimes', 'boolean'],
            'material_texts_received' => ['sometimes', 'boolean'],
            'material_contacts_received' => ['sometimes', 'boolean'],
            'material_colors_received' => ['sometimes', 'boolean'],
            'material_missing_note' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function productionData(): array
    {
        $data = $this->validated();

        foreach ([
            'material_activity_received',
            'material_logo_received',
            'material_photos_received',
            'material_texts_received',
            'material_contacts_received',
            'material_colors_received',
        ] as $field) {
            if ($this->has($field)) {
                $data[$field] = $this->boolean($field);
            }
        }

        return $data;
    }
}
