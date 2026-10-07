<?php

namespace App\Http\Requests\Admin;

use App\Models\ContactRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateContactRequestStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('contactRequest')) ?? false;
    }

    public function rules(): array
    {
        return ['status' => ['required', 'string', Rule::in(ContactRequest::STATUSES)]];
    }
}
