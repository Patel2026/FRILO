<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PlatformSettingsService;
use Illuminate\Http\JsonResponse;

class PublicPricingController extends Controller
{
    public function __construct(private readonly PlatformSettingsService $platformSettingsService) {}

    public function show(): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\PlatformSettingRevision::class);

        $pricing = $this->platformSettingsService->getRuntimePricingConfiguration();

        return response()->json([
            'currency_label' => (string) ($pricing['currency_label'] ?? 'FCFA'),
            'section_title' => (string) ($pricing['section_title'] ?? ''),
            'section_description' => (string) ($pricing['section_description'] ?? ''),
            'custom_note' => (string) ($pricing['custom_note'] ?? ''),
            'starting_price' => (int) data_get($pricing, 'standard.price', 0),
            'standard' => [
                'name' => (string) data_get($pricing, 'standard.name', 'Standard'),
                'price' => (int) data_get($pricing, 'standard.price', 0),
                'billing_label' => (string) data_get($pricing, 'standard.billing_label', ''),
                'cta_label' => (string) data_get($pricing, 'standard.cta_label', 'Choisir'),
                'features' => array_values(data_get($pricing, 'standard.features', [])),
            ],
            'premium' => [
                'badge_label' => (string) data_get($pricing, 'premium.badge_label', ''),
                'name' => (string) data_get($pricing, 'premium.name', 'Premium'),
                'price' => (int) data_get($pricing, 'premium.price', 0),
                'billing_label' => (string) data_get($pricing, 'premium.billing_label', ''),
                'cta_label' => (string) data_get($pricing, 'premium.cta_label', 'Choisir'),
                'features' => array_values(data_get($pricing, 'premium.features', [])),
            ],
        ]);
    }
}
