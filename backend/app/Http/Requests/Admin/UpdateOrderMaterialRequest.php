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
        return [
            'material_activity_received' => $this->boolean('material_activity_received'),
            'material_logo_received' => $this->boolean('material_logo_received'),
            'material_photos_received' => $this->boolean('material_photos_received'),
            'material_texts_received' => $this->boolean('material_texts_received'),
            'material_contacts_received' => $this->boolean('material_contacts_received'),
            'material_colors_received' => $this->boolean('material_colors_received'),
            'material_missing_note' => $this->validated('material_missing_note'),
        ];
    }
}
