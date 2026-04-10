<?php

namespace Tests\Feature\Api;

use App\Models\PlatformSettingRevision;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPricingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_pricing_endpoint_returns_default_fallback_when_no_published_revision_exists(): void
    {
        $response = $this->getJson('/api/public/pricing');

        $response
            ->assertOk()
            ->assertJsonPath('standard.price', 50000)
            ->assertJsonPath('premium.price', 75000)
            ->assertJsonPath('currency_label', 'FCFA')
            ->assertJsonPath('starting_price', 50000);
    }

    public function test_public_pricing_endpoint_returns_published_configuration(): void
    {
        PlatformSettingRevision::create([
            'status' => PlatformSettingRevision::STATUS_PUBLISHED,
            'payload' => [
                'pricing' => [
                    'currency_label' => 'FCFA',
                    'section_title' => 'Tarifs modulables.',
                    'section_description' => 'Deux niveaux pour démarrer rapidement.',
                    'custom_note' => 'Un besoin plus large ?',
                    'standard' => [
                        'name' => 'Essentiel',
                        'price' => 65000,
                        'billing_label' => 'Paiement unique',
                        'cta_label' => 'Choisir Essentiel',
                        'features' => ['Site vitrine', 'Responsive'],
                    ],
                    'premium' => [
                        'badge_label' => 'Populaire',
                        'name' => 'Business',
                        'price' => 110000,
                        'billing_label' => 'Paiement unique',
                        'cta_label' => 'Choisir Business',
                        'features' => ['Multi-pages', 'SEO initial'],
                    ],
                ],
            ],
            'secret_payload' => [],
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/public/pricing');

        $response
            ->assertOk()
            ->assertJsonPath('section_title', 'Tarifs modulables.')
            ->assertJsonPath('standard.name', 'Essentiel')
            ->assertJsonPath('standard.price', 65000)
            ->assertJsonPath('premium.price', 110000)
            ->assertJsonPath('starting_price', 65000)
            ->assertJsonPath('premium.features.0', 'Multi-pages');
    }
}
