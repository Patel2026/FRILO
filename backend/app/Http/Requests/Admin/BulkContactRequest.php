<?php

namespace App\Http\Requests\Admin;

use App\Models\ContactRequest;
use Illuminate\Foundation\Http\FormRequest;

class BulkContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can($this->isMethod('DELETE') ? 'deleteAny' : 'restoreAny', ContactRequest::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => ['required', 'integer', 'min:1', 'distinct'],
        ];
    }

    public function messages(): array
    {
        return [
            'ids.required' => 'Sélectionnez au moins une demande.',
            'ids.max' => 'Sélectionnez au maximum 100 demandes.',
            'ids.*.distinct' => 'La sélection contient une demande en double.',
        ];
    }
}
