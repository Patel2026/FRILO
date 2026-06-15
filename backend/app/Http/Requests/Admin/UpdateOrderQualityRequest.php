<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderQualityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quality_mobile_checked' => ['sometimes', 'boolean'],
            'quality_form_checked' => ['sometimes', 'boolean'],
            'quality_links_checked' => ['sometimes', 'boolean'],
            'quality_spelling_checked' => ['sometimes', 'boolean'],
            'quality_business_info_checked' => ['sometimes', 'boolean'],
            'quality_final_preview_validated' => ['sometimes', 'boolean'],
        ];
    }

    public function productionData(): array
    {
        $data = $this->validated();

        foreach ([
            'quality_mobile_checked',
            'quality_form_checked',
            'quality_links_checked',
            'quality_spelling_checked',
            'quality_business_info_checked',
            'quality_final_preview_validated',
        ] as $field) {
            if ($this->has($field)) {
                $data[$field] = $this->boolean($field);
            }
        }

        return $data;
    }
}
