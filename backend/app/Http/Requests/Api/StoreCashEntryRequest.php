<?php

namespace App\Http\Requests\Api;

use App\Enums\CashEntryType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCashEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'type'       => ['required', Rule::enum(CashEntryType::class)],
            'amount'     => ['required', 'integer', 'min:1'],
            'label'      => ['required', 'string', 'max:200'],
            'entry_date' => ['required', 'date'],
            'notes'      => ['nullable', 'string', 'max:500'],
        ];
    }
}
