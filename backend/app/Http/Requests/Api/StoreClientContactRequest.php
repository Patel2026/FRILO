<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:150'],
            'company'     => ['nullable', 'string', 'max:150'],
            'phone'       => ['nullable', 'string', 'max:30'],
            'whatsapp'    => ['nullable', 'string', 'max:30'],
            'email'       => ['nullable', 'email', 'max:150'],
            'notes'       => ['nullable', 'string', 'max:1000'],
            'acquired_at' => ['nullable', 'date'],
        ];
    }
}
