<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePublicPageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'seo_title' => ['sometimes', 'nullable', 'string', 'max:180'],
            'seo_description' => ['sometimes', 'nullable', 'string', 'max:300'],
            'is_indexable' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $unknownKeys = array_diff(
                array_keys($this->except(['_token', '_method'])),
                array_keys($this->rules()),
            );

            if ($unknownKeys !== []) {
                $validator->errors()->add('payload', 'Champs non autorises: '.implode(', ', $unknownKeys));
            }
        });
    }
}
