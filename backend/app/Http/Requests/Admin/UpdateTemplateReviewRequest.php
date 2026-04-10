<?php

namespace App\Http\Requests\Admin;

use App\Models\TemplateReview;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTemplateReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(TemplateReview::STATUSES)],
            'is_featured' => ['nullable', 'boolean'],
            'featured_rank' => ['nullable', 'integer', 'between:1,20'],
        ];
    }
}
