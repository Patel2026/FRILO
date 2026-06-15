<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderDeliveryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'site_url' => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//i'],
            'domain' => ['nullable', 'string', 'max:255'],
            'hosting_expires_at' => ['nullable', 'date'],
            'delivery_ssl_checked' => ['sometimes', 'boolean'],
            'delivery_form_checked' => ['sometimes', 'boolean'],
            'delivery_mobile_checked' => ['sometimes', 'boolean'],
            'delivery_note' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function productionData(): array
    {
        return [
            'site_url' => $this->validated('site_url'),
            'domain' => $this->validated('domain'),
            'hosting_expires_at' => $this->validated('hosting_expires_at'),
            'delivery_ssl_checked' => $this->boolean('delivery_ssl_checked'),
            'delivery_form_checked' => $this->boolean('delivery_form_checked'),
            'delivery_mobile_checked' => $this->boolean('delivery_mobile_checked'),
            'delivery_note' => $this->validated('delivery_note'),
        ];
    }
}
