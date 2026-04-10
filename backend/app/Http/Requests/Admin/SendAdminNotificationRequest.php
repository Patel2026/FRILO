<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SendAdminNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'audience' => ['required', 'string', Rule::in(['all_clients', 'all_super_admins', 'selected_users'])],
            'user_ids' => ['nullable', 'array', 'required_if:audience,selected_users', 'min:1'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:140'],
            'message' => ['required', 'string', 'max:2000'],
            'action_url' => [
                'nullable',
                'string',
                'max:255',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! is_string($value) || trim($value) === '') {
                        return;
                    }

                    $trimmed = trim($value);
                    if (str_starts_with($trimmed, '/')) {
                        return;
                    }

                    if (filter_var($trimmed, FILTER_VALIDATE_URL)) {
                        return;
                    }

                    $fail('Le champ '.$attribute.' doit être une URL valide ou un chemin relatif commençant par "/".');
                },
            ],
            'action_label' => ['nullable', 'string', 'max:80', 'required_with:action_url'],
            'send_email' => ['nullable', 'boolean'],
        ];
    }
}
