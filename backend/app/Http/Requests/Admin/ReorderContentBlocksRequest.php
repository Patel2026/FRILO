<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReorderContentBlocksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ordered_ids' => ['required', 'array', 'min:1'],
            'ordered_ids.*' => ['required', 'integer', 'distinct'],
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
