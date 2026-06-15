<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderProductionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'production_template_adapted' => ['sometimes', 'boolean'],
            'production_content_integrated' => ['sometimes', 'boolean'],
            'production_preview_prepared' => ['sometimes', 'boolean'],
            'production_preview_sent_at' => ['nullable', 'date'],
            'production_feedback_received' => ['sometimes', 'boolean'],
            'production_corrections_completed' => ['sometimes', 'boolean'],
        ];
    }

    public function productionData(): array
    {
        $data = $this->validated();

        foreach ([
            'production_template_adapted',
            'production_content_integrated',
            'production_preview_prepared',
            'production_feedback_received',
            'production_corrections_completed',
        ] as $field) {
            if ($this->has($field)) {
                $data[$field] = $this->boolean($field);
            }
        }

        return $data;
    }
}
