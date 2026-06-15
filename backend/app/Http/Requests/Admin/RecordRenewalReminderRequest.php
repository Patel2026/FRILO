<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RecordRenewalReminderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyAdminRole(['finance_admin']) === true;
    }

    public function rules(): array
    {
        return [
            'hosting_renewal_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
