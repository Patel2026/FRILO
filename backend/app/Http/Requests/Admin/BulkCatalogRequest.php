<?php

namespace App\Http\Requests\Admin;

use App\Models\FaqItem;
use App\Models\Sector;
use App\Models\Template;
use Illuminate\Foundation\Http\FormRequest;

class BulkCatalogRequest extends FormRequest
{
    public function modelClass(): string
    {
        return match (true) {
            $this->routeIs('admin.templates.*') => Template::class,
            $this->routeIs('admin.faqs.*') => FaqItem::class,
            $this->routeIs('admin.sectors.*') => Sector::class,
            default => abort(404),
        };
    }

    public function authorize(): bool
    {
        return $this->user()?->can('manageSelection', $this->modelClass()) ?? false;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => ['required', 'integer', 'min:1', 'distinct'],
            'active' => $this->modelClass() === Sector::class ? ['required', 'boolean'] : ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return ['ids.required' => 'Sélectionnez au moins un élément.', 'ids.max' => 'Sélectionnez au maximum 100 éléments.'];
    }
}
