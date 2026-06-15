<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_manager_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where(fn ($query) => $query->whereIn('role', ['super_admin', 'ops_admin'])->where('is_active', true))],
            'technician_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where(fn ($query) => $query->whereIn('role', ['super_admin', 'ops_admin'])->where('is_active', true))],
            'quality_validator_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where(fn ($query) => $query->whereIn('role', ['super_admin', 'ops_admin'])->where('is_active', true))],
            'production_owner_name' => ['nullable', 'string', 'max:120'],
            'production_assigned_at' => ['nullable', 'date'],
        ];
    }
}
