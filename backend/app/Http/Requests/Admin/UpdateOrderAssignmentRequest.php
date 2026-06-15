<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'production_owner_name' => ['nullable', 'string', 'max:120'],
            'production_assigned_at' => ['nullable', 'date'],
        ];
    }
}
