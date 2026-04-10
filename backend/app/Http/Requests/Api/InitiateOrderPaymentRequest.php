<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class InitiateOrderPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mode' => ['nullable', 'string', 'max:64', 'regex:/^[a-z0-9_]+$/'],
            'phone_number' => ['nullable', 'array'],
            'phone_number.number' => ['required_with:phone_number', 'string', 'max:30'],
            'phone_number.country' => ['required_with:phone_number', 'string', 'size:2'],
        ];
    }
}
