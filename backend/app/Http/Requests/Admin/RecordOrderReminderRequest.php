<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RecordOrderReminderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'last_client_reminder_reason' => ['required', 'string', 'max:180'],
            'internal_follow_up_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
