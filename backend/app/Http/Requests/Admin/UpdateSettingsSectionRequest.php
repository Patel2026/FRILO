<?php

namespace App\Http\Requests\Admin;

use App\Services\PlatformSettingsService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSettingsSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    public function rules(): array
    {
        return match ($this->section()) {
            PlatformSettingsService::SECTION_GENERAL => [
                'platform_name' => ['required', 'string', 'max:120'],
                'tagline' => ['nullable', 'string', 'max:180'],
                'support_email' => ['required', 'email', 'max:255'],
                'support_phone' => ['nullable', 'string', 'max:50'],
                'timezone' => ['required', 'string', 'max:80'],
                'default_currency' => ['required', 'string', 'size:3'],
            ],
            PlatformSettingsService::SECTION_BRANDING => [
                'logo_url' => ['nullable', 'url', 'max:500'],
                'favicon_url' => ['nullable', 'url', 'max:500'],
                'primary_color' => ['required', 'regex:/^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/'],
                'secondary_color' => ['required', 'regex:/^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/'],
                'accent_color' => ['required', 'regex:/^#(?:[A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/'],
            ],
            PlatformSettingsService::SECTION_PRICING => [
                'currency_label' => ['required', 'string', 'max:10'],
                'section_title' => ['required', 'string', 'max:160'],
                'section_description' => ['required', 'string', 'max:500'],
                'custom_note' => ['nullable', 'string', 'max:200'],
                'standard_name' => ['required', 'string', 'max:80'],
                'standard_price' => ['required', 'integer', 'min:0', 'max:100000000'],
                'standard_billing_label' => ['required', 'string', 'max:120'],
                'standard_cta_label' => ['required', 'string', 'max:60'],
                'standard_features_raw' => ['required', 'string', 'min:10', 'max:3000'],
                'premium_badge_label' => ['nullable', 'string', 'max:60'],
                'premium_name' => ['required', 'string', 'max:80'],
                'premium_price' => ['required', 'integer', 'min:0', 'max:100000000'],
                'premium_billing_label' => ['required', 'string', 'max:120'],
                'premium_cta_label' => ['required', 'string', 'max:60'],
                'premium_features_raw' => ['required', 'string', 'min:10', 'max:3000'],
            ],
            PlatformSettingsService::SECTION_PAYMENT => [
                'enabled' => ['required', 'boolean'],
                'environment' => ['required', Rule::in(['sandbox', 'live'])],
                'base_url' => ['required', 'url', 'max:500'],
                'currency' => ['required', 'string', 'size:3'],
                'callback_url' => ['nullable', 'url', 'max:500'],
                'webhook_tolerance' => ['required', 'integer', 'min:0', 'max:3600'],
                'secret_key' => ['nullable', 'string', 'min:10', 'max:255'],
                'webhook_secret' => ['nullable', 'string', 'min:8', 'max:255'],
            ],
            PlatformSettingsService::SECTION_SLA => [
                'confirmation_minutes' => ['required', 'integer', 'min:1', 'max:1440'],
                'preview_hours' => ['required', 'integer', 'min:1', 'max:168'],
                'delivery_hours' => ['required', 'integer', 'min:1', 'max:168'],
                'revision_window_hours' => ['required', 'integer', 'min:1', 'max:168'],
            ],
            PlatformSettingsService::SECTION_NOTIFICATIONS => [
                'email_enabled' => ['required', 'boolean'],
                'sms_enabled' => ['required', 'boolean'],
                'whatsapp_enabled' => ['required', 'boolean'],
                'notify_order_created' => ['required', 'boolean'],
                'notify_payment_status_changed' => ['required', 'boolean'],
                'notify_order_status_changed' => ['required', 'boolean'],
                'notify_contact_request_received' => ['required', 'boolean'],
            ],
            PlatformSettingsService::SECTION_LEGAL => [
                'company_name' => ['required', 'string', 'max:255'],
                'company_address' => ['nullable', 'string', 'max:500'],
                'registration_number' => ['nullable', 'string', 'max:120'],
                'tax_number' => ['nullable', 'string', 'max:120'],
                'terms_url' => ['nullable', 'url', 'max:500'],
                'privacy_url' => ['nullable', 'url', 'max:500'],
            ],
            default => [],
        };
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if (! in_array($this->section(), PlatformSettingsService::SECTIONS, true)) {
                $validator->errors()->add('section', 'Section de paramètres inconnue.');

                return;
            }

            $unknownKeys = array_diff(
                array_keys($this->except(['_token', '_method'])),
                $this->allowedKeysForSection()
            );

            if ($unknownKeys !== []) {
                $validator->errors()->add(
                    'payload',
                    'Clés non autorisées: '.implode(', ', $unknownKeys)
                );
            }
        });
    }

    private function section(): string
    {
        return (string) $this->route('section', '');
    }

    private function allowedKeysForSection(): array
    {
        return array_keys($this->rules());
    }
}
